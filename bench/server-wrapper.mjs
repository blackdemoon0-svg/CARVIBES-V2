// Boots the EXACT production marketplace handler with an event-loop lag
// probe on PORT+1, so client-side latencies can be correlated with
// server-side event-loop stalls. No repo code is modified: this wrapper
// imports server/marketplace/handler.mjs and mounts it the same way
// server/marketplace/serve.mjs does.
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat, realpath } from "node:fs/promises";
import path from "node:path";
import { createMarketplaceHandler } from "../server/marketplace/handler.mjs";
import { paths } from "../server/marketplace/config.mjs";

const PORT = Number(process.env.PORT ?? 8787);
const handler = createMarketplaceHandler();
const MEDIA_ROOT = path.resolve(paths.mediaDir);
let mediaRealRoot = null;

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  if (url === "/" || url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "bench-wrapper" }));
    return;
  }
  if (url.startsWith("/marketplace-media/")) {
    try {
      const rel = decodeURIComponent(url.split("?")[0].slice("/marketplace-media/".length));
      const segments = rel.split("/");
      if (!rel || rel.includes("\\") || rel.includes("\0") || segments.some((s) => s === "" || s === "." || s === "..")) {
        res.writeHead(404).end();
        return;
      }
      const target = path.resolve(MEDIA_ROOT, rel);
      if (!target.startsWith(MEDIA_ROOT + path.sep)) { res.writeHead(404).end(); return; }
      mediaRealRoot ??= await realpath(MEDIA_ROOT).catch(() => MEDIA_ROOT);
      const real = await realpath(target).catch(() => null);
      if (!real || !(real === mediaRealRoot || real.startsWith(mediaRealRoot + path.sep))) { res.writeHead(404).end(); return; }
      const info = await stat(real);
      if (!info.isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, {
        "content-type": "image/webp",
        "content-length": String(info.size),
        "cache-control": "public, max-age=31536000, immutable",
      });
      const s = createReadStream(real);
      s.on("error", () => res.destroy());
      s.pipe(res);
    } catch {
      if (!res.headersSent) res.writeHead(404).end();
      else res.destroy();
    }
    return;
  }
  try {
    await handler(req, res);
  } catch {
    if (!res.headersSent) res.writeHead(500).end();
    else res.destroy();
  }
});

// --- event-loop lag probe (side channel) ---
let lagLog = [];
let last = performance.now();
setInterval(() => {
  const now = performance.now();
  const lag = now - last - 100;
  last = now;
  if (lag > 5) lagLog.push(Math.round(lag * 10) / 10);
}, 100).unref();

createServer((req, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ lagLog, maxLag: lagLog.reduce((m, x) => Math.max(m, x), 0) }));
  lagLog = [];
}).listen(PORT + 1);

server.listen(PORT, "0.0.0.0", () => console.log(`bench wrapper: API on :${PORT}, lag probe on :${PORT + 1}`));
