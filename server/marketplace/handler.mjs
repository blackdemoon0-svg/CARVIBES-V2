// ============================================================
// CARVIBES / MARKETVIBES — HTTP API
//
// One framework-agnostic handler: `(req, res) => Promise<void>`.
// It is mounted by
//   * server/marketplace/vite-plugin.mjs   → npm run dev / npm run preview
//   * server/marketplace/serve.mjs         → production Node host (npm run marketplace:serve)
// so the preview and production run the exact same code path.
//
// ENDPOINTS (all under /api/marketplace)
//   GET    /health
//   GET    /config                             public runtime config (no secrets)
//   GET    /listings                           public, approved only
//   GET    /listings/:slug                     public detail (+ internal links)
//   GET    /listings/:slug/contact             302 to the seller channel (click counted)
//   POST   /listings                           submit → always PENDING
//   POST   /uploads                            multipart photo upload (staged)
//   GET    /admin/session
//   POST   /admin/login/google | /admin/login/passcode | /admin/logout
//   GET    /admin/listings, /admin/listings/:id, /admin/stats
//   POST   /admin/listings/:id/review, /admin/listings/bulk
//
// AUTHORIZATION: every /admin route resolves the signed session cookie
// AND re-checks the e-mail allowlist — the public API never exposes
// pending/rejected listings or a seller's raw contact details.
// ============================================================

import { createHash } from "node:crypto";
import {
  adminConfig,
  IS_PRODUCTION,
  LIMITS,
  MEDIA_URL_PREFIX,
  paths,
  secret,
  SITE_URL,
} from "./config.mjs";
import {
  clearCookie,
  createSession,
  isAdminEmail,
  readCookie,
  sessionCookie,
  SESSION_COOKIE,
  verifyGoogleCredential,
  verifyPasscode,
  verifySession,
} from "./auth.mjs";
import { applyCors, clientIp, imageInfo, parseMultipart, rateLimit, readBody, readJson, sameSiteRequest } from "./guards.mjs";
import {
  addStagedUpload,
  allListings,
  claimStagedUploads,
  findById,
  findStagedUploads,
  insertListing,
  moveMedia,
  publicListings,
  randomId,
  recordClick,
  recordView,
  STATUS,
  updateListing,
  updateMany,
} from "./store.mjs";
import {
  applyFilters,
  buildFacets,
  buildListing,
  paginate,
  sortListings,
  validateSubmission,
} from "./listings.mjs";
import { facetPages, toPublicCard, toPublicDetail } from "./public-view.mjs";

const RATE = {
  submit: { limit: Number(process.env.MARKETPLACE_RATE_SUBMIT ?? 12), window: 60 * 60 * 1000 },
  upload: { limit: 80, window: 60 * 60 * 1000 },
  login: { limit: 12, window: 15 * 60 * 1000 },
  read: { limit: 600, window: 60 * 1000 },
  contact: { limit: 120, window: 60 * 60 * 1000 },
};

function json(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...headers,
  });
  res.end(payload);
}

const fail = (res, status, code, extra = {}) => json(res, status, { error: code, ...extra });

function ipHash(req) {
  return createHash("sha256").update(`${clientIp(req)}:${secret}`).digest("hex").slice(0, 16);
}

function enforceRate(req, res, key) {
  const { limit, window } = RATE[key];
  const result = rateLimit(`${key}:${ipHash(req)}`, limit, window);
  if (!result.ok) {
    json(
      res,
      429,
      { error: "rate_limited", retryAfter: result.retryAfter },
      { "retry-after": String(result.retryAfter) }
    );
    return false;
  }
  return true;
}

/** Resolve the admin session (or null) — the ONLY way into /admin routes. */
function adminSession(req) {
  const session = verifySession(readCookie(req.headers.cookie, SESSION_COOKIE));
  if (!session) return null;
  // Defence in depth: the token is already allowlist-gated, re-check anyway.
  if (!isAdminEmail(session.email)) return null;
  return session;
}

function requireAdmin(req, res) {
  const session = adminSession(req);
  if (!session) {
    fail(res, 401, "unauthorized");
    return null;
  }
  if (!sameSiteRequest(req)) {
    fail(res, 403, "cross_site");
    return null;
  }
  return session;
}

// ------------------------------------------------------------
// Serialisation of internal records for the admin UI
// ------------------------------------------------------------
function adminSummary(record) {
  const card = toPublicCard(record);
  return {
    ...card,
    // Admin-only surface: moderation state + the seller's contact value.
    status: record.status,
    contactValue: record.seller?.contactValue ?? "",
    submittedAt: record.submittedAt,
    updatedAt: record.updatedAt,
    reviewedAt: record.reviewedAt,
    reviewedBy: record.reviewedBy,
    publishedAt: record.publishedAt,
    views: record.views ?? 0,
    contactClicks: record.contactClicks ?? {},
    moderation: record.moderation ?? { reason: null, note: null },
    listingUrl: record.status === STATUS.approved ? card.path : null,
  };
}

function adminDetail(record) {
  return {
    ...adminSummary(record),
    description: record.vehicle?.description ?? "",
    // Reviewing a submission means looking at what was actually uploaded —
    // the whole gallery, in seller order, not only the card thumbnail.
    media: (record.media ?? []).map((m) => ({
      url: m.url,
      alt: m.alt ?? "",
      width: m.width ?? null,
      height: m.height ?? null,
    })),
    // Admin-only: the full, unmasked contact details.
    contact: {
      method: record.seller?.contactMethod,
      value: record.seller?.contactValue,
      link: contactLink(record),
    },
    sellerEmail: null,
    audit: {
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt,
      reviewedBy: record.reviewedBy,
      note: record.moderation?.note ?? "",
      reason: record.moderation?.reason ?? "",
    },
    source: record.source,
  };
}

function contactLink(record) {
  const method = record.seller?.contactMethod;
  const value = record.seller?.contactValue ?? "";
  if (method === "whatsapp") {
    const number = value.replace(/[^\d]/g, "");
    const text = encodeURIComponent(
      `Hello, I am interested in your ${record.vehicle?.brand ?? ""} ${record.vehicle?.model ?? ""} on CarVibes MarketVibes.`
    );
    return `https://wa.me/${number}?text=${text}`;
  }
  if (method === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (method === "instagram") return `https://instagram.com/${value.replace(/^@/, "")}`;
  return value;
}

// ------------------------------------------------------------
// Public endpoints
// ------------------------------------------------------------
async function handlePublicListings(req, res, url) {
  if (!enforceRate(req, res, "read")) return;
  const approved = await publicListings();
  const filtered = applyFilters(approved, Object.fromEntries(url.searchParams));
  const sorted = sortListings(filtered, url.searchParams.get("sort"));
  const page = paginate(sorted, url.searchParams.get("page"), url.searchParams.get("pageSize") ?? LIMITS.defaultPageSize);
  json(
    res,
    200,
    {
      items: page.items.map(toPublicCard),
      total: page.total,
      page: page.page,
      pages: page.pages,
      pageSize: page.pageSize,
      facets: buildFacets(approved),
    },
    { "cache-control": "public, max-age=30, stale-while-revalidate=120" }
  );
}

async function handlePublicDetail(req, res, slug, url) {
  if (!enforceRate(req, res, "read")) return;
  const record = await findById(slug);
  if (!record || record.status !== STATUS.approved) {
    fail(res, 404, "not_found");
    return;
  }
  const approved = await publicListings();
  const others = approved.filter((l) => l.id !== record.id);
  const similar = others
    .filter((l) => l.vehicle?.bodyType && l.vehicle?.bodyType === record.vehicle?.bodyType)
    .slice(0, 6);
  const moreFromBrand = others.filter((l) => l.vehicle?.brand === record.vehicle?.brand).slice(0, 6);
  const moreFromRegion = others.filter((l) => l.location?.country === record.location?.country).slice(0, 6);

  // View counting: fire-and-forget, never blocks the response.
  if (url.searchParams.get("view") !== "0") void recordView(record.id);

  json(res, 200, toPublicDetail(record, similar, moreFromRegion, moreFromBrand, { siteUrl: SITE_URL }), {
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
  });
}

async function handleContactRedirect(req, res, slug) {
  if (!enforceRate(req, res, "contact")) return;
  const record = await findById(slug);
  if (!record || record.status !== STATUS.approved) {
    fail(res, 404, "not_found");
    return;
  }
  // The raw value never reaches the browser: the click is counted here
  // and the visitor is handed straight to the seller's channel.
  void recordClick(record.id, record.seller?.contactMethod ?? "other");
  res.writeHead(302, { location: contactLink(record), "cache-control": "no-store", "referrer-policy": "no-referrer" });
  res.end();
}

async function handleSubmit(req, res) {
  if (!sameSiteRequest(req)) return fail(res, 403, "cross_site");
  if (!enforceRate(req, res, "submit")) return;

  const payload = await readJson(req);
  await verifyCaptcha(payload, req);

  const stagedUploads = await findStagedUploads(Array.isArray(payload.mediaIds) ? payload.mediaIds : []);
  const result = validateSubmission(payload, { stagedUploads, limits: LIMITS });
  if (!result.ok) return fail(res, 422, "validation", { fields: result.errors });

  const record = buildListing(result.value, stagedUploads, {
    locale: payload.locale,
    referer: req.headers.referer,
  });

  // Photos move from the staging area into the listing's own folder, so
  // an abandoned upload can never be mistaken for a listing's media.
  const moved = [];
  for (const media of record.media) {
    const upload = stagedUploads.find((u) => u.id === media.id);
    if (!upload) continue;
    const ext = media.url.split(".").pop();
    try {
      media.url = await moveMedia(upload.absolutePath ?? upload.file, record.publicId, `${moved.length + 1}.${ext}`);
      moved.push(media);
    } catch {
      // The staged file disappeared (cleaned up, failed upload): drop that
      // photo instead of failing an otherwise valid submission.
    }
  }
  if (!moved.length) return fail(res, 422, "validation", { fields: { media: "unknown" } });
  record.media = moved.map((media, index) => ({ ...media, position: index }));

  await claimStagedUploads(
    record.media.map((m) => m.id),
    record.id
  );
  await insertListing(record);

  json(res, 201, {
    ok: true,
    status: record.status,
    publicId: record.publicId,
    reference: record.publicId.toUpperCase(),
    message: "submitted",
  });
}

// ------------------------------------------------------------
// Uploads
// ------------------------------------------------------------
async function handleUpload(req, res) {
  if (!sameSiteRequest(req)) return fail(res, 403, "cross_site");
  if (!enforceRate(req, res, "upload")) return;

  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("multipart/form-data")) return fail(res, 415, "unsupported_media_type");

  const body = await readBody(req, LIMITS.maxBodyBytes);
  const { files } = parseMultipart(body, contentType);
  if (!files.length) return fail(res, 422, "no_files");
  if (files.length > LIMITS.maxPhotos) return fail(res, 422, "too_many");

  const stored = [];
  for (const file of files) {
    const info = imageInfo(file.data);
    if (!info) return fail(res, 422, "invalid_image", { field: "media" });
    if (file.data.length > LIMITS.maxPhotoBytes) return fail(res, 413, "too_large", { field: "media" });
    const id = `${Date.now().toString(36)}${randomId(8)}`;
    const filename = `${id}.${info.ext}`;
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir(paths.mediaDir, { recursive: true });
    const targetPath = `${paths.mediaDir}/${filename}`;
    await writeFile(targetPath, file.data);
    const upload = {
      id,
      file: filename,
      absolutePath: targetPath,
      url: `${MEDIA_URL_PREFIX}/${filename}`,
      width: info.width,
      height: info.height,
      bytes: file.data.length,
      mime: info.mime,
      createdAt: new Date().toISOString(),
    };
    await addStagedUpload(upload);
    stored.push({ id, url: upload.url, width: info.width, height: info.height, bytes: upload.bytes });
  }

  json(res, 201, { ok: true, files: stored });
}

// ------------------------------------------------------------
// Admin: auth
// ------------------------------------------------------------
async function handleAdminLoginGoogle(req, res) {
  if (!enforceRate(req, res, "login")) return;
  const { credential } = await readJson(req);
  let identity;
  try {
    identity = await verifyGoogleCredential(credential);
  } catch (error) {
    return fail(res, 401, "google_failed", { message: String(error.message ?? error) });
  }
  if (!isAdminEmail(identity.email)) {
    // Authorized by Google, but NOT an admin. Nothing is created.
    return fail(res, 403, "not_admin", { email: identity.email });
  }
  json(res, 200, { ok: true, email: identity.email }, { "set-cookie": sessionCookie(createSession(identity.email, "google")) });
}

async function handleAdminLoginPasscode(req, res) {
  if (!enforceRate(req, res, "login")) return;
  if (!sameSiteRequest(req)) return fail(res, 403, "cross_site");
  const { email, passcode } = await readJson(req);
  const result = verifyPasscode(email, passcode);
  if (!result.ok) {
    return fail(res, result.reason === "disabled" ? 404 : 401, "login_failed");
  }
  json(res, 200, { ok: true, email: result.session.email }, { "set-cookie": sessionCookie(createSession(result.session.email, "passcode")) });
}

// ------------------------------------------------------------
// Admin: listings
// ------------------------------------------------------------
async function handleAdminList(req, res, url) {
  const status = url.searchParams.get("status");
  const search = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const records = await allListings();
  const counts = { pending: 0, approved: 0, rejected: 0, all: records.length };
  for (const record of records) counts[record.status] = (counts[record.status] ?? 0) + 1;

  let filtered = records.filter((record) => !status || status === "all" || record.status === status);
  if (search) {
    filtered = filtered.filter((record) =>
      [record.vehicle?.brand, record.vehicle?.model, record.location?.city, record.location?.country, record.publicId, record.seller?.companyName, record.seller?.contactValue]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }
  filtered.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
  const page = paginate(filtered, url.searchParams.get("page"), url.searchParams.get("pageSize") ?? 20);

  const clicks = records.reduce(
    (acc, record) => {
      for (const [channel, value] of Object.entries(record.contactClicks ?? {})) {
        acc[channel] = (acc[channel] ?? 0) + value;
        acc.total += value;
      }
      return acc;
    },
    { total: 0 }
  );

  // Real counters only: views are incremented by the public detail
  // endpoint and click-throughs by the contact redirect, so a fresh
  // marketplace reports zeros rather than placeholder figures.
  const views = records.reduce(
    (acc, record) => {
      const value = record.views ?? 0;
      acc.total += value;
      acc[record.status] = (acc[record.status] ?? 0) + value;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );

  json(res, 200, {
    items: page.items.map(adminSummary),
    total: page.total,
    page: page.page,
    pages: page.pages,
    pageSize: page.pageSize,
    counts,
    clicks,
    views,
  });
}

async function handleAdminReview(req, res, id, session) {
  const record = await findById(id);
  if (!record) return fail(res, 404, "not_found");
  const body = await readJson(req);
  const action = String(body.action ?? "");
  if (action !== "approve" && action !== "reject") return fail(res, 422, "invalid_action");
  if (record.status === STATUS.approved && action === "approve") {
    return json(res, 200, { ok: true, listing: adminSummary(record), unchanged: true });
  }

  const now = new Date().toISOString();
  const patch =
    action === "approve"
      ? {
          status: STATUS.approved,
          publishedAt: record.publishedAt ?? now,
          reviewedAt: now,
          reviewedBy: session.email,
          moderation: { reason: null, note: String(body.note ?? "").slice(0, 1000) },
        }
      : {
          status: STATUS.rejected,
          publishedAt: null,
          reviewedAt: now,
          reviewedBy: session.email,
          moderation: {
            reason: String(body.reason ?? "other").slice(0, 60),
            note: String(body.note ?? "").slice(0, 1000),
          },
        };

  const updated = await updateListing(record.id, patch, { actor: session.email, action });
  json(res, 200, { ok: true, listing: adminSummary(updated) });
}

async function handleAdminBulk(req, res, session) {
  const body = await readJson(req);
  const action = String(body.action ?? "");
  const ids = Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string").slice(0, 200) : [];
  if (action !== "approve" && action !== "reject") return fail(res, 422, "invalid_action");
  if (!ids.length) return fail(res, 422, "no_ids");

  const now = new Date().toISOString();
  const changed = await updateMany(
    ids,
    (record) =>
      action === "approve"
        ? {
            status: STATUS.approved,
            publishedAt: record.publishedAt ?? now,
            reviewedAt: now,
            reviewedBy: session.email,
            moderation: { reason: null, note: String(body.note ?? "").slice(0, 1000) },
          }
        : {
            status: STATUS.rejected,
            publishedAt: null,
            reviewedAt: now,
            reviewedBy: session.email,
            moderation: {
              reason: String(body.reason ?? "other").slice(0, 60),
              note: String(body.note ?? "").slice(0, 1000),
            },
          },
    { actor: session.email, action }
  );

  json(res, 200, { ok: true, updated: changed.length, items: changed.map(adminSummary) });
}

// ------------------------------------------------------------
// Optional CAPTCHA hook (Cloudflare Turnstile) — verified only when the
// server has a secret AND the client sent a token. Off by default.
// ------------------------------------------------------------
async function verifyCaptcha(payload, req) {
  const { TURNSTILE_SECRET } = await import("./config.mjs");
  if (!TURNSTILE_SECRET) return;
  const token = payload?.captchaToken;
  if (!token) throw Object.assign(new Error("captcha_required"), { status: 422 });
  const form = new URLSearchParams({ secret: TURNSTILE_SECRET, response: String(token), remoteip: clientIp(req) });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!result.success) throw Object.assign(new Error("captcha_failed"), { status: 422 });
}

// ------------------------------------------------------------
// Router
// ------------------------------------------------------------
export function createMarketplaceHandler() {
  return async function marketplaceHandler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const route = url.pathname.replace(/^\/api\/marketplace/, "") || "/";
    const method = (req.method ?? "GET").toUpperCase();
    const allowedCrossOrigin = applyCors(req, res);

    if (method === "OPTIONS") {
      res.writeHead(allowedCrossOrigin ? 204 : 403, { "access-control-max-age": "600" });
      res.end();
      return;
    }

    try {
      // ---- public ----
      if (route === "/health" && method === "GET") {
        const listings = await allListings();
        return json(res, 200, {
          ok: true,
          storage: "json-file",
          production: IS_PRODUCTION,
          listings: listings.length,
          approved: listings.filter((l) => l.status === STATUS.approved).length,
        });
      }

      if (route === "/config" && method === "GET") {
        return json(res, 200, {
          google: { clientId: adminConfig.googleClientId },
          admin: { passcodeLogin: adminConfig.passcodeLogin, adminCount: adminConfig.adminCount, devMode: adminConfig.devMode },
          captcha: { provider: null },
          limits: { maxPhotos: LIMITS.maxPhotos, maxPhotoBytes: LIMITS.maxPhotoBytes },
          features: { similarCars: true, bulkReview: true, contactProxy: true },
        });
      }

      if (route === "/listings" && method === "GET") return handlePublicListings(req, res, url);

      // Indexable facet pages (path-based, supply-driven). The UI uses the
      // very same objects for its internal-linking blocks and for the
      // facet page metadata, so what a crawler indexes and what the page
      // claims can never disagree.
      if (route === "/facets" && method === "GET") {
        const approved = await publicListings();
        return json(
          res,
          200,
          { pages: facetPages(approved), total: approved.length, minListings: 3 },
          { "cache-control": "public, max-age=60, stale-while-revalidate=300" }
        );
      }

      const contactMatch = /^\/listings\/([^/]+)\/contact$/.exec(route);
      if (contactMatch && method === "GET") return handleContactRedirect(req, res, decodeURIComponent(contactMatch[1]));

      const detailMatch = /^\/listings\/([^/]+)$/.exec(route);
      if (detailMatch && method === "GET") return handlePublicDetail(req, res, decodeURIComponent(detailMatch[1]), url);

      if (route === "/listings" && method === "POST") return handleSubmit(req, res);
      if (route === "/uploads" && method === "POST") return handleUpload(req, res);

      // ---- admin auth ----
      if (route === "/admin/session" && method === "GET") {
        const session = adminSession(req);
        return json(res, 200, {
          authenticated: Boolean(session),
          email: session?.email ?? null,
          method: session?.method ?? null,
          config: {
            googleClientId: adminConfig.googleClientId,
            passcodeLogin: adminConfig.passcodeLogin,
            devMode: adminConfig.devMode,
          },
        });
      }
      if (route === "/admin/login/google" && method === "POST") return handleAdminLoginGoogle(req, res);
      if (route === "/admin/login/passcode" && method === "POST") return handleAdminLoginPasscode(req, res);
      if (route === "/admin/logout" && method === "POST") {
        return json(res, 200, { ok: true }, { "set-cookie": clearCookie() });
      }

      // ---- admin (authorized) ----
      if (route.startsWith("/admin/")) {
        const session = requireAdmin(req, res);
        if (!session) return;
        if (route === "/admin/listings" && method === "GET") return handleAdminList(req, res, url);
        const adminDetailMatch = /^\/admin\/listings\/([^/]+)$/.exec(route);
        if (adminDetailMatch && method === "GET") {
          const record = await findById(decodeURIComponent(adminDetailMatch[1]));
          if (!record) return fail(res, 404, "not_found");
          return json(res, 200, adminDetail(record));
        }
        const reviewMatch = /^\/admin\/listings\/([^/]+)\/review$/.exec(route);
        if (reviewMatch && method === "POST") return handleAdminReview(req, res, decodeURIComponent(reviewMatch[1]), session);
        if (route === "/admin/listings/bulk" && method === "POST") return handleAdminBulk(req, res, session);
        if (route === "/admin/stats" && method === "GET") {
          const records = await allListings();
          return json(res, 200, {
            counts: records.reduce((acc, r) => {
              acc[r.status] = (acc[r.status] ?? 0) + 1;
              acc.all = records.length;
              return acc;
            }, { all: records.length }),
            clicks: records.reduce((acc, r) => {
              for (const [channel, value] of Object.entries(r.contactClicks ?? {})) acc[channel] = (acc[channel] ?? 0) + value;
              return acc;
            }, {}),
            views: records.reduce((acc, r) => acc + (r.views ?? 0), 0),
            siteUrl: SITE_URL,
          });
        }
      }

      return fail(res, 404, "unknown_route");
    } catch (error) {
      const status = Number(error?.status) || 500;
      if (status >= 500) {
        console.error("[marketplace] api error:", error);
        return fail(res, 500, "server_error");
      }
      return fail(res, status, String(error.message ?? "request_failed"));
    }
  };
}
