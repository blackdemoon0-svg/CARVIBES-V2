// ============================================================
// CARVIBES / MARKETVIBES — request guards
//
//   * fixed-window rate limiting per IP + action (spam/abuse hooks),
//   * same-origin enforcement for state-changing admin calls (CSRF),
//   * a fast, dependency-free multipart/form-data parser with hard
//     size/type validation — no uploaded byte is ever trusted.
// ============================================================

import { adminConfig, CORS_ORIGINS, LIMITS, MEDIA_URL_PREFIX } from "./config.mjs";

// ------------------------------------------------------------
// Rate limiting — in-memory fixed window (per process). Optional Redis
// can replace this later; the call sites stay identical.
// ------------------------------------------------------------
const buckets = new Map();

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }
  return { ok: true, remaining: limit - bucket.count };
}

// Housekeeping so a long-running process cannot leak memory.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.reset < now) buckets.delete(key);
}, 60_000).unref?.();

export function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  return (
    forwarded ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "unknown"
  );
}

// ------------------------------------------------------------
// CORS — same-origin by default. Extra origins are opt-in through
// MARKETPLACE_CORS_ORIGINS (needed only when the UI and the API are
// hosted separately).
// ------------------------------------------------------------
export function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (CORS_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    return true;
  }
  // Same-origin requests do not send an Origin header for GETs; for
  // mutations the browser does send one, and host-only requests must be
  // accepted (a preview host is not in any allowlist by design).
  return false;
}

/**
 * CSRF guard for state-changing requests: the request must not come from
 * a different site. Browsers always send `Origin` on POST/PUT, and
 * `Sec-Fetch-Site` is a free signal on modern ones.
 */
export function sameSiteRequest(req) {
  const site = req.headers["sec-fetch-site"];
  if (typeof site === "string" && site && site !== "same-origin" && site !== "none") return false;
  const origin = req.headers.origin;
  if (!origin) return true; // curl / server-to-server: no ambient cookie risk
  if (CORS_ORIGINS.includes(origin)) return true;
  try {
    const host = req.headers.host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------
// Body reading
// ------------------------------------------------------------
export function readBody(req, maxBytes = LIMITS.maxBodyBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    req.on("data", (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > maxBytes) {
        settled = true;
        // Stop buffering the body, but keep the socket alive just long enough
        // for the caller to answer with a real 413: destroying the request
        // here would kill the response too.
        req.pause();
        reject(Object.assign(new Error("Payload too large"), { status: 413, tooLarge: true }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks));
    });
    req.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

export async function readJson(req) {
  const raw = await readBody(req);
  if (!raw.length) return {};
  try {
    return JSON.parse(raw.toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
  }
}

// ------------------------------------------------------------
// multipart/form-data
// ------------------------------------------------------------
/**
 * Minimal but correct multipart parser: returns text fields and file
 * parts ({ filename, contentType, data }) with a per-file size cap.
 * Written for speed and safety, not for streaming gigabytes — the client
 * has already resized every photo before it gets here.
 */
export function parseMultipart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType ?? "");
  const boundary = (match?.[1] ?? match?.[2] ?? "").trim();
  if (!boundary) throw Object.assign(new Error("Missing multipart boundary"), { status: 400 });

  const delimiter = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = [];

  let start = buffer.indexOf(delimiter);
  if (start === -1) throw Object.assign(new Error("Malformed multipart body"), { status: 400 });

  while (start !== -1) {
    const from = start + delimiter.length;
    if (buffer.slice(from, from + 2).toString() === "--") break; // closing delimiter
    const headerEnd = buffer.indexOf("\r\n\r\n", from);
    if (headerEnd === -1) break;
    const headerText = buffer.slice(from, headerEnd).toString("utf8");
    const next = buffer.indexOf(delimiter, headerEnd);
    if (next === -1) break;
    // Strip the trailing CRLF that precedes the next boundary.
    const dataEnd = buffer.slice(next - 2, next).toString() === "\r\n" ? next - 2 : next;
    const data = buffer.slice(headerEnd + 4, dataEnd);

    const nameMatch = /name="([^"]*)"/i.exec(headerText);
    const fileMatch = /filename="([^"]*)"/i.exec(headerText);
    const typeMatch = /content-type:\s*([^\r\n]+)/i.exec(headerText);
    const name = nameMatch?.[1];
    if (name) {
      if (fileMatch && fileMatch[1]) {
        if (data.length > LIMITS.maxPhotoBytes) {
          throw Object.assign(new Error("Photo too large"), { status: 413 });
        }
        files.push({
          field: name,
          filename: fileMatch[1].slice(0, 200),
          contentType: (typeMatch?.[1] ?? "application/octet-stream").trim().toLowerCase(),
          data,
        });
      } else {
        fields[name] = data.toString("utf8").slice(0, 20000);
      }
    }
    start = next;
  }

  return { fields, files };
}

// ------------------------------------------------------------
// Upload validation — magic bytes decide, never the client mime type.
// ------------------------------------------------------------
const SIGNATURES = [
  { ext: "jpg", mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    mime: "image/png",
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "webp",
    mime: "image/webp",
    test: (b) => b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP",
  },
];

/**
 * Reads the real dimensions from the file header (JPEG SOF / PNG IHDR /
 * WebP VP8x-VP8-VP8L) so the API can persist width/height for
 * CLS-free rendering — without decoding the image.
 */
export function imageInfo(buffer) {
  const signature = SIGNATURES.find((s) => s.test(buffer));
  if (!signature) return null;
  const dims = dimensions(buffer, signature.ext);
  return { ext: signature.ext, mime: signature.mime, width: dims?.width ?? 0, height: dims?.height ?? 0 };
}

function dimensions(buffer, ext) {
  try {
    if (ext === "png") return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    if (ext === "jpg") {
      let offset = 2;
      while (offset < buffer.length - 9) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        const size = buffer.readUInt16BE(offset + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
        }
        offset += 2 + size;
      }
      return null;
    }
    if (ext === "webp") {
      const format = buffer.slice(12, 16).toString();
      if (format === "VP8X") {
        return {
          width: 1 + buffer.readUIntLE(24, 3),
          height: 1 + buffer.readUIntLE(27, 3),
        };
      }
      if (format === "VP8 ") {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
      if (format === "VP8L") {
        const bits = buffer.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export { LIMITS, MEDIA_URL_PREFIX, adminConfig };
