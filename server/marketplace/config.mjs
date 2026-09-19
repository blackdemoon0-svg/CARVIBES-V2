// ============================================================
// CARVIBES / MARKETVIBES — server configuration
//
// One place that resolves every environment variable the marketplace
// API needs, so the Vite dev/preview middleware and the standalone
// production server behave identically.
//
// SECURITY MODEL
// --------------
// Admin access is *fail-closed*:
//   * an explicit e-mail allowlist (MARKETPLACE_ADMIN_EMAILS) decides
//     who is an admin — "is logged in" is never enough;
//   * when no allowlist is configured the API refuses every admin
//     session, except in non-production where a single local dev admin
//     is bootstrapped (its credentials are printed on start and are
//     never rendered into the public UI).
//
// Nothing in this file is ever sent to the browser — the client only
// ever receives the *public* Google client id, which is by design a
// public value.
// ============================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");

const env = (key) => {
  const raw = process.env[key];
  return raw === undefined || raw === "" ? undefined : raw;
};

const list = (value) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

export const NODE_ENV = env("NODE_ENV") ?? "development";
export const IS_PRODUCTION = NODE_ENV === "production";

/** Where listing JSON + upload staging metadata live (never public). */
export const DATA_DIR =
  env("MARKETPLACE_DATA_DIR") ?? path.join(ROOT, "data", "marketplace");

/** Public media root. Files here are served by the web server / CDN. */
export const MEDIA_DIR =
  env("MARKETPLACE_MEDIA_DIR") ?? path.join(ROOT, "public", "marketplace-media");

/** URL prefix matching MEDIA_DIR (kept site-relative on purpose). */
export const MEDIA_URL_PREFIX = env("MARKETPLACE_MEDIA_URL_PREFIX") ?? "/marketplace-media";

export const STORE_FILE = path.join(DATA_DIR, "listings.json");

/** Canonical public site, used for e-mails / absolute links only. */
export const SITE_URL = (env("MARKETPLACE_SITE_URL") ?? "https://carvibes.dev").replace(/\/$/, "");

/** Google Sign-In (primary admin identity). Public value. */
export const GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID") ?? env("VITE_GOOGLE_CLIENT_ID");

/** Comma-separated allowlist of admin e-mail addresses (lower-case). */
export const ADMIN_EMAILS = list(env("MARKETPLACE_ADMIN_EMAILS"));

/** Optional passcode login (non-production convenience / emergency access). */
export const ADMIN_PASSCODE =
  env("MARKETPLACE_ADMIN_PASSCODE") ?? env("MARKETPLACE_DEV_ADMIN_PASSCODE");

/** HMAC secret for the admin session cookie. */
export const SESSION_SECRET = env("MARKETPLACE_SESSION_SECRET");

/** Extra origins allowed to call the API (only needed for split hosting). */
export const CORS_ORIGINS = (env("MARKETPLACE_CORS_ORIGINS") ?? "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

/** Optional CAPTCHA hook (Cloudflare Turnstile). Off unless configured. */
export const TURNSTILE_SECRET = env("MARKETPLACE_TURNSTILE_SECRET");

export const LIMITS = {
  maxPhotos: Number(env("MARKETPLACE_MAX_PHOTOS") ?? 8),
  maxPhotoBytes: Number(env("MARKETPLACE_MAX_PHOTO_BYTES") ?? 8 * 1024 * 1024),
  maxBodyBytes: Number(env("MARKETPLACE_MAX_BODY_BYTES") ?? 24 * 1024 * 1024),
  maxPageSize: 24,
  defaultPageSize: 12,
};

// ------------------------------------------------------------
// Secrets: generated once and persisted in the (git-ignored) data dir.
// Production should always provide MARKETPLACE_SESSION_SECRET env var —
// a rotated secret simply invalidates existing admin sessions.
// ------------------------------------------------------------
function loadOrCreateSecret() {
  if (SESSION_SECRET) return SESSION_SECRET;
  const file = path.join(DATA_DIR, "session-secret");
  try {
    if (existsSync(file)) {
      const value = readFileSync(file, "utf8").trim();
      if (value) return value;
    }
    mkdirSync(DATA_DIR, { recursive: true });
    const value = randomBytes(32).toString("hex");
    writeFileSync(file, value, { mode: 0o600 });
    return value;
  } catch {
    // Read-only filesystem (e.g. serverless): fall back to an in-memory
    // secret — sessions then simply do not survive a restart.
    return randomBytes(32).toString("hex");
  }
}

export const secret = loadOrCreateSecret();

// ------------------------------------------------------------
// Dev admin bootstrap
// ------------------------------------------------------------
// Production stays closed. Development (npm run dev / preview) gets
// exactly one admin so the whole submit → review → publish loop can be
// tested without any Google credentials: the allowlist contains the
// bootstrap address and a random passcode is used to sign in.
let devAdmin = null;
if (!IS_PRODUCTION) {
  const devAdminEmails = list(env("MARKETPLACE_DEV_ADMIN_EMAILS"));
  const wantsBootstrap = devAdminEmails.length > 0 || Boolean(ADMIN_PASSCODE) || !ADMIN_EMAILS.length;
  if (wantsBootstrap) {
    const email = devAdminEmails[0] ?? ADMIN_EMAILS[0] ?? "admin@carvibes.dev";
    const file = path.join(DATA_DIR, "dev-admin.json");
    let passcode = ADMIN_PASSCODE;
    if (!passcode) {
      try {
        if (existsSync(file)) {
          passcode = JSON.parse(readFileSync(file, "utf8")).passcode;
        }
        if (!passcode) {
          mkdirSync(DATA_DIR, { recursive: true });
          passcode = `vibe-${randomBytes(3).toString("hex")}`;
          writeFileSync(file, JSON.stringify({ email, passcode }, null, 2), {
            mode: 0o600,
          });
        }
      } catch {
        passcode = `vibe-${randomBytes(3).toString("hex")}`;
      }
    }
    devAdmin = { email: email.toLowerCase(), passcode };
  }
} else if (ADMIN_PASSCODE && ADMIN_EMAILS.length) {
  // Production passcode access is strictly opt-in: it only ever works for
  // the FIRST allowlisted address, and only when MARKETPLACE_ADMIN_PASSCODE
  // is set explicitly. Google Sign-In stays the recommended identity.
  devAdmin = { email: ADMIN_EMAILS[0], passcode: ADMIN_PASSCODE };
}

/** The bootstrap admin (development only, null in production). */
export const DEV_ADMIN = devAdmin;

/** Effective admin allowlist (includes the dev bootstrap address). */
export const allowlist = (() => {
  const set = new Set(ADMIN_EMAILS);
  if (devAdmin) set.add(devAdmin.email);
  return set;
})();

export const adminConfig = {
  googleClientId: GOOGLE_CLIENT_ID ?? null,
  passcodeLogin: Boolean(devAdmin?.passcode),
  devMode: !IS_PRODUCTION,
  /** Admin e-mail addresses are never exposed — only their count. */
  adminCount: allowlist.size,
};

export const paths = {
  dataDir: DATA_DIR,
  mediaDir: MEDIA_DIR,
  storeFile: STORE_FILE,
  mediaUrlPrefix: MEDIA_URL_PREFIX,
};
