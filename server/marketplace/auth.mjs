// ============================================================
// CARVIBES / MARKETVIBES — admin authentication + authorization
//
// THREE RULES, ENFORCED SERVER-SIDE:
//
//   1. Signing in is not authorization. Every admin request resolves
//      the session e-mail and checks it against an explicit allowlist
//      (MARKETPLACE_ADMIN_EMAILS / the dev bootstrap account). An
//      authenticated stranger gets 403, never a dashboard.
//   2. No allowlist ⇒ no admins. In production the API fails closed.
//   3. The browser never receives a secret: the session is an
//      HttpOnly cookie signed with an HMAC (MARKETPLACE_SESSION_SECRET),
//      and only the *public* Google client id is ever sent to the UI.
//
// Google Sign-In uses the official Identity Services ID token, verified
// here against Google's JWKS with node:crypto (RS256) — no SDK, no extra
// dependency, nothing to keep up to date.
// ============================================================

import { createHmac, createPublicKey, timingSafeEqual, verify as cryptoVerify } from "node:crypto";
import { adminConfig, allowlist, DEV_ADMIN, GOOGLE_CLIENT_ID, IS_PRODUCTION, secret } from "./config.mjs";

export const SESSION_COOKIE = "cv_mk_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 h
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

const b64url = (input) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const b64urlDecode = (input) =>
  Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

function sign(payload) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Mint a signed session token for an allow-listed e-mail. */
export function createSession(email, method = "google") {
  const body = b64url(
    JSON.stringify({
      email: email.toLowerCase(),
      method,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  );
  return `${body}.${sign(body)}`;
}

/** Verify a session token; returns the session or null. Never throws. */
export function verifySession(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(b64urlDecode(body));
  } catch {
    return null;
  }
  if (!payload?.email || typeof payload.exp !== "number") return null;
  if (payload.exp * 1000 < Date.now()) return null;
  if (!isAdminEmail(payload.email)) return null; // allowlist can be revoked at any time
  return { email: String(payload.email).toLowerCase(), method: payload.method ?? "google" };
}

/** THE authorization check. Explicit allowlist, never "logged in". */
export function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return allowlist.has(email.trim().toLowerCase());
}

export function sessionCookie(token) {
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (IS_PRODUCTION) attrs.push("Secure");
  return attrs.join("; ");
}

export function clearCookie() {
  const attrs = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (IS_PRODUCTION) attrs.push("Secure");
  return attrs.join("; ");
}

export function readCookie(header, name = SESSION_COOKIE) {
  if (!header) return null;
  for (const part of String(header).split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

// ------------------------------------------------------------
// Google Identity Services — ID token verification
// ------------------------------------------------------------
let jwksCache = { keys: [], expires: 0 };

async function googleKeys() {
  if (jwksCache.expires > Date.now() && jwksCache.keys.length) return jwksCache.keys;
  const res = await fetch(GOOGLE_JWKS_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Google JWKS request failed (${res.status})`);
  const body = await res.json();
  const cacheControl = res.headers.get("cache-control") ?? "";
  const maxAge = Number(/max-age=(\d+)/.exec(cacheControl)?.[1] ?? 3600);
  jwksCache = { keys: body.keys ?? [], expires: Date.now() + Math.min(maxAge, 21600) * 1000 };
  return jwksCache.keys;
}

/**
 * Verify a Google ID token: signature (RS256 against Google's JWKS),
 * audience, issuer, expiry and a verified e-mail address.
 * Returns { email, name, picture } or throws.
 */
export async function verifyGoogleCredential(credential) {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google Sign-In is not configured on this server.");
  const parts = String(credential ?? "").split(".");
  if (parts.length !== 3) throw new Error("Malformed Google credential.");
  const [rawHeader, rawPayload, rawSignature] = parts;

  let header;
  let payload;
  try {
    header = JSON.parse(b64urlDecode(rawHeader));
    payload = JSON.parse(b64urlDecode(rawPayload));
  } catch {
    throw new Error("Malformed Google credential.");
  }
  if (header.alg !== "RS256") throw new Error("Unsupported Google credential algorithm.");

  const keys = await googleKeys();
  const jwk = keys.find((k) => k.kid === header.kid) ?? keys[0];
  if (!jwk) throw new Error("Google signing keys unavailable.");

  const key = createPublicKey({ key: jwk, format: "jwk" });
  const valid = cryptoVerify(
    "RSA-SHA256",
    Buffer.from(`${rawHeader}.${rawPayload}`),
    key,
    Buffer.from(rawSignature.replace(/-/g, "+").replace(/_/g, "/"), "base64")
  );
  if (!valid) throw new Error("Google credential signature is invalid.");

  const now = Math.floor(Date.now() / 1000);
  if (!GOOGLE_ISSUERS.has(payload.iss)) throw new Error("Google credential issuer mismatch.");
  if (payload.aud !== GOOGLE_CLIENT_ID) throw new Error("Google credential audience mismatch.");
  if (typeof payload.exp !== "number" || payload.exp < now - 60) throw new Error("Google credential expired.");
  if (typeof payload.iat === "number" && payload.iat > now + 300) throw new Error("Google credential is not yet valid.");
  if (!payload.email || payload.email_verified !== true) throw new Error("Google account has no verified e-mail.");

  return { email: String(payload.email).toLowerCase(), name: payload.name, picture: payload.picture };
}

/** Passcode login (development bootstrap / explicitly opted-in access). */
export function verifyPasscode(email, passcode) {
  const bootstrap = DEV_ADMIN;
  if (!bootstrap?.passcode) return { ok: false, reason: "disabled" };
  const emailOk = String(email ?? "").trim().toLowerCase() === bootstrap.email;
  const a = Buffer.from(String(passcode ?? ""));
  const b = Buffer.from(String(bootstrap.passcode));
  const codeOk = a.length === b.length && timingSafeEqual(a, b);
  if (!emailOk || !codeOk) return { ok: false, reason: "invalid" };
  return { ok: true, session: { email: bootstrap.email, method: "passcode" } };
}

export { adminConfig };
