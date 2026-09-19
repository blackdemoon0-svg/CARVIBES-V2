// ============================================================
// CARVIBES / MARKETVIBES — end-to-end API smoke test
//
//   node scripts/smoke-marketplace.mjs [baseUrl]
//
// Exercises the whole marketplace loop against a running server
// (default http://localhost:5173): upload → submit → pending →
// review → approve → public → contact click → reject → private.
// Plus the authorization guarantees: a visitor can neither read
// pending listings nor reach a single /admin route.
//
// Credentials: MARKETPLACE_TEST_EMAIL / MARKETPLACE_TEST_PASSCODE, or
// the dev bootstrap file (data/marketplace/dev-admin.json).
// ============================================================

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] ?? process.env.MARKETPLACE_BASE_URL ?? "http://localhost:5173").replace(/\/$/, "");
const API = `${BASE}/api/marketplace`;

let pass = 0;
let failed = 0;
const results = [];

function check(name, condition, detail = "") {
  if (condition) {
    pass += 1;
    results.push(`  ✓ ${name}`);
  } else {
    failed += 1;
    results.push(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function api(pathname, { method = "GET", body, cookie, form, raw = false } = {}) {
  const headers = { origin: BASE };
  if (cookie) headers.cookie = cookie;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const response = await fetch(`${API}${pathname}`, { method, headers, body: payload, redirect: "manual" });
  const setCookie = response.headers.get("set-cookie");
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON (redirects) */
  }
  return { status: response.status, json, text, cookie: setCookie?.split(";")[0], location: response.headers.get("location") };
}

function adminCredentials() {
  if (process.env.MARKETPLACE_TEST_EMAIL && process.env.MARKETPLACE_TEST_PASSCODE) {
    return { email: process.env.MARKETPLACE_TEST_EMAIL, passcode: process.env.MARKETPLACE_TEST_PASSCODE };
  }
  const file = path.join(process.env.MARKETPLACE_DATA_DIR ?? path.join(ROOT, "data/marketplace"), "dev-admin.json");
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  return null;
}

/** 1×1 pixel PNG — a real, signature-valid image. */
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function listingPayload(mediaIds, overrides = {}) {
  return {
    formOpenedAt: Date.now() - 20_000,
    locale: "en",
    vehicle: {
      brand: "BMW",
      model: "X5 xDrive40i",
      year: 2021,
      condition: "used",
      bodyType: "SUV",
      fuel: "petrol",
      transmission: "automatic",
      mileage: 54000,
      color: "Black",
      description: "Full service history, single owner, no accidents.",
    },
    pricing: { price: 52900, currency: "EUR", negotiable: true },
    location: { countryCode: "MA", city: "Casablanca", region: "Casablanca-Settat" },
    seller: {
      type: "dealer",
      companyName: "Atlas Motors",
      contactMethod: "whatsapp",
      contactValue: "+212612345678",
    },
    mediaIds,
    ...overrides,
  };
}

const LOCAL_TARGET = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(BASE);

/**
 * Remove exactly what this run created — nothing else.
 *
 * The suite deliberately does NOT wipe the store: a real seller's
 * submission (or an administrator's live listing) can legitimately be
 * sitting in it while the tests run, and deleting their data to tidy up
 * after ourselves would be unacceptable. We delete our own listings, our
 * own staged uploads and their photo files, then assert the store holds
 * exactly what it held before the run.
 *
 * Only possible against the local dev/preview server (same machine, same
 * files); against a remote deployment it is skipped and reported.
 */
async function cleanupLocalData(created) {
  if (!LOCAL_TARGET) return null;
  const { pathToFileURL } = await import("node:url");
  const store = await import(pathToFileURL(path.join(ROOT, "server/marketplace/store.mjs")).href);
  const listings = await store.deleteListings(created.publicIds ?? []);
  const staged = await store.deleteStagedUploads(created.uploadIds ?? []);
  // Whatever the deletions could not account for (a directory left behind
  // by a listing deleted before this helper existed) is unreachable media.
  const orphans = await store.gcOrphanMedia();
  return { listings, staged, orphans };
}

async function uploadPhotos(count = 1) {
  const form = new FormData();
  for (let i = 0; i < count; i += 1) {
    form.append("photo", new Blob([PNG_1PX], { type: "image/png" }), `photo-${i}.png`);
  }
  const response = await api("/uploads", { method: "POST", form });
  return (response.json?.files ?? []).map((f) => f.id);
}

async function main() {
  console.log(`[smoke-marketplace] target ${API}\n`);

  // Snapshot BEFORE touching anything: the suite must leave the store
  // exactly as it found it, including anything a real user submitted.
  const created = { publicIds: [], uploadIds: [] };
  const baseline = await api("/health");
  const baselineListings = baseline.json?.listings ?? 0;

  // ---------- public surface ----------
  const health = await api("/health");
  check("GET /health responds", health.status === 200 && health.json?.ok === true, `status ${health.status}`);

  const config = await api("/config");
  check("GET /config exposes no secret material", config.status === 200 && !/secret/i.test(config.text));

  const emptyList = await api("/listings");
  const before = emptyList.json?.total ?? 0;

  // ---------- uploads ----------
  const form = new FormData();
  form.append("photo", new Blob([PNG_1PX], { type: "image/png" }), "car.png");
  form.append("photo", new Blob([PNG_1PX], { type: "image/png" }), "car-2.png");
  const upload = await api("/uploads", { method: "POST", form });
  check("POST /uploads stores 2 photos", upload.status === 201 && upload.json?.files?.length === 2, JSON.stringify(upload.json));
  const mediaIds = upload.json?.files?.map((f) => f.id) ?? [];
  created.uploadIds.push(...mediaIds);
  check("uploaded photo has a public URL", (upload.json?.files?.[0]?.url ?? "").startsWith("/marketplace-media/"));

  const badUpload = new FormData();
  badUpload.append("photo", new Blob([Buffer.from("not an image at all")], { type: "image/png" }), "evil.png");
  const rejectedPhoto = await api("/uploads", { method: "POST", form: badUpload });
  check("POST /uploads rejects a non-image (magic bytes)", rejectedPhoto.status === 422, `status ${rejectedPhoto.status}`);

  // ---------- validation ----------
  const invalid = await api("/listings", { method: "POST", body: listingPayload(mediaIds, { vehicle: { brand: "" } }) });
  check("POST /listings validates required fields", invalid.status === 422 && Boolean(invalid.json?.fields), JSON.stringify(invalid.json));

  const noContact = await api("/listings", {
    method: "POST",
    body: listingPayload(mediaIds, { seller: { type: "individual", contactMethod: "phone", contactValue: "12" } }),
  });
  check("POST /listings requires a valid contact value", noContact.status === 422, JSON.stringify(noContact.json));

  const honeypot = await api("/listings", { method: "POST", body: listingPayload(mediaIds, { website: "spam" }) });
  check("honeypot submissions are refused", honeypot.status === 422, `status ${honeypot.status}`);

  // ---------- submit ----------
  const submit = await api("/listings", { method: "POST", body: listingPayload(mediaIds) });
  check("POST /listings creates a PENDING listing", submit.status === 201 && submit.json?.status === "pending", JSON.stringify(submit.json));
  const listingId = submit.json?.publicId;
  if (listingId) created.publicIds.push(listingId);
  check("submission returns a reference", typeof listingId === "string" && listingId.length > 4);

  const publicAfterSubmit = await api("/listings");
  check(
    "pending listing is NOT public",
    (publicAfterSubmit.json?.total ?? -1) === before,
    `total ${publicAfterSubmit.json?.total} (expected ${before})`
  );
  const pendingDetail = await api(`/listings/${listingId}`);
  check("pending listing detail is 404 for visitors", pendingDetail.status === 404, `status ${pendingDetail.status}`);

  // ---------- admin authorization ----------
  const anonList = await api("/admin/listings");
  check("anonymous /admin/listings → 401", anonList.status === 401, `status ${anonList.status}`);
  const anonReview = await api(`/admin/listings/${listingId}/review`, { method: "POST", body: { action: "approve" } });
  check("anonymous approve → 401", anonReview.status === 401, `status ${anonReview.status}`);

  const forged = "eyJlbWFpbCI6ImhhY2tlckBleGFtcGxlLmNvbSIsIm1ldGhvZCI6Imdvb2dsZSIsImlhdCI6MSwiZXhwIjo5OTk5OTk5OTk5fQ.forged";
  const forgedAttempt = await api("/admin/listings", { cookie: `cv_mk_admin=${forged}` });
  check("forged admin cookie → 401", forgedAttempt.status === 401, `status ${forgedAttempt.status}`);

  const session = await api("/admin/session");
  check("visitor session is anonymous", session.json?.authenticated === false);

  const credentials = adminCredentials();
  check(
    "admin bootstrap credentials available for testing",
    Boolean(credentials?.passcode),
    "set MARKETPLACE_TEST_EMAIL / MARKETPLACE_TEST_PASSCODE"
  );
  if (!credentials?.passcode) return finish();

  const wrongPass = await api("/admin/login/passcode", {
    method: "POST",
    body: { email: credentials.email, passcode: "definitely-wrong" },
  });
  check("wrong passcode → 401", wrongPass.status === 401, `status ${wrongPass.status}`);

  const login = await api("/admin/login/passcode", { method: "POST", body: credentials });
  check("admin passcode login succeeds", login.status === 200 && Boolean(login.cookie), JSON.stringify(login.json));
  const cookie = login.cookie;

  // ---------- admin moderation ----------
  const adminList = await api("/admin/listings?status=pending", { cookie });
  check("admin sees the pending submission", adminList.status === 200 && (adminList.json?.items ?? []).some((i) => i.publicId === listingId));
  const pendingItem = (adminList.json?.items ?? []).find((i) => i.publicId === listingId);
  check("admin sees the seller's contact value", Boolean(pendingItem) && /\+212/.test(pendingItem?.contactValue ?? ""));

  const adminDetail = await api(`/admin/listings/${listingId}`, { cookie });
  check("admin listing detail includes the contact link", /wa\.me/.test(adminDetail.json?.contact?.link ?? ""));

  const approve = await api(`/admin/listings/${listingId}/review`, { method: "POST", cookie, body: { action: "approve" } });
  check("admin can approve", approve.status === 200 && approve.json?.listing?.status === "approved", JSON.stringify(approve.json));

  const publicAfterApprove = await api("/listings");
  check(
    "approved listing becomes public",
    (publicAfterApprove.json?.total ?? 0) === before + 1,
    `total ${publicAfterApprove.json?.total}`
  );
  const published = (publicAfterApprove.json?.items ?? []).find((i) => i.publicId === listingId);
  check("public card carries price + location + seller type", Boolean(published?.priceLabel) && Boolean(published?.city) && Boolean(published?.sellerTypeLabel));
  check("public card exposes only the contact CHANNEL, never the value", published?.contactValue === "");

  const detail = await api(`/listings/${published?.slug ?? listingId}`);
  check("public detail page payload loads", detail.status === 200 && detail.json?.slug === published?.slug, `status ${detail.status}`);
  check("public detail has SEO metadata + canonical", /for sale/.test(detail.json?.seo?.title ?? "") && /\/marketplace\/car\//.test(detail.json?.seo?.canonicalPath ?? ""));
  check("public detail ships JSON-LD (Vehicle + BreadcrumbList)", Array.isArray(detail.json?.seo?.jsonLd) && detail.json.seo.jsonLd.some((n) => n["@type"] === "Vehicle"));
  check("public detail keeps the phone number private", !/\+212612345678/.test(detail.text));

  const contact = await api(`/listings/${published?.slug}/contact`);
  check("contact CTA redirects to the seller channel", contact.status === 302 && /wa\.me\/212612345678/.test(contact.location ?? ""), `status ${contact.status} ${contact.location}`);

  const clicks = await api("/admin/stats", { cookie });
  check("contact clicks are counted", (clicks.json?.clicks?.whatsapp ?? 0) >= 1, JSON.stringify(clicks.json?.clicks));

  // ---------- reject + bulk ----------
  // A photo belongs to exactly one listing: re-using a claimed upload is
  // refused instead of silently duplicating another seller's gallery.
  const reused = await api("/listings", { method: "POST", body: listingPayload(mediaIds.slice(0, 1)) });
  check("a claimed photo cannot be reused by another listing", reused.status === 422, `status ${reused.status}`);

  const secondPhotos = await uploadPhotos();
  // This seller prefers calls: the listing must hand the visitor a tel:
  // link for the native dialler, and still keep the number server-side.
  const second = await api("/listings", {
    method: "POST",
    body: listingPayload(secondPhotos, {
      seller: { type: "individual", contactMethod: "phone", contactValue: "+212661234567" },
    }),
  });
  const secondId = second.json?.publicId;
  if (secondId) created.publicIds.push(secondId);
  const reject = await api(`/admin/listings/${secondId}/review`, { method: "POST", cookie, body: { action: "reject", reason: "incomplete" } });
  check("admin can reject with a reason", reject.status === 200 && reject.json?.listing?.status === "rejected" && reject.json?.listing?.moderation?.reason === "incomplete");
  const afterReject = await api("/listings");
  check("rejected listing stays private", !(afterReject.json?.items ?? []).some((i) => i.publicId === secondId));

  created.uploadIds.push(...secondPhotos);
  const thirdPhotos = await uploadPhotos();
  created.uploadIds.push(...thirdPhotos);
  const third = await api("/listings", { method: "POST", body: listingPayload(thirdPhotos) });
  const thirdId = third.json?.publicId;
  if (thirdId) created.publicIds.push(thirdId);
  const bulk = await api("/admin/listings/bulk", { method: "POST", cookie, body: { ids: [secondId, thirdId], action: "approve" } });
  check("bulk approve works", bulk.status === 200 && bulk.json?.updated === 2, JSON.stringify(bulk.json));
  const afterBulk = await api("/listings");
  check("bulk-approved listings are public", (afterBulk.json?.items ?? []).some((i) => i.publicId === thirdId));

  // ---------- phone contact (native dialler) ----------
  const phoneCard = (afterBulk.json?.items ?? []).find((i) => i.publicId === secondId);
  check("the phone-contact listing is public", Boolean(phoneCard?.slug), phoneCard?.slug ?? "missing");
  const phoneDetail = await api(`/listings/${phoneCard?.slug ?? secondId}`);
  check(
    "the phone listing keeps the number out of the page",
    phoneDetail.status === 200 && !/\+212661234567/.test(phoneDetail.text),
    `status ${phoneDetail.status}`
  );
  const tel = await api(`/listings/${phoneCard?.slug ?? secondId}/contact`);
  check(
    "a phone listing redirects to a tel: link for the native dialler",
    tel.status === 302 && /^tel:\+\d+$/.test(tel.location ?? ""),
    `status ${tel.status} ${tel.location}`
  );

  // ---------- unpublish ----------
  const unpublish = await api(`/admin/listings/${thirdId}/review`, { method: "POST", cookie, body: { action: "reject", reason: "other" } });
  check("an approved listing can be unpublished", unpublish.json?.listing?.status === "rejected");

  // ---------- logout ----------
  const logout = await api("/admin/logout", { method: "POST", cookie });
  check("admin logout clears the session", logout.status === 200 && logout.cookie === "cv_mk_admin=", `status ${logout.status} cookie ${logout.cookie}`);

  // ---------- cleanup: remove ONLY what this run created ----------
  const cleaned = await cleanupLocalData(created);
  if (cleaned) {
    const after = await api("/health");
    check(
      "the test cleaned up after itself",
      after.json?.listings === baselineListings,
      `${baselineListings} before → ${after.json?.listings} after (removed ${cleaned.listings.removed})`
    );
    const publicAfter = await api("/listings");
    check(
      "no test listing is publicly visible",
      (publicAfter.json?.items ?? []).every((item) => !created.publicIds.includes(item.publicId)),
      `${publicAfter.json?.total} public`
    );
    check(
      "a pre-existing listing survived the run untouched",
      baselineListings === 0 || after.json?.listings >= baselineListings,
      `${baselineListings} pre-existing`
    );
  } else {
    console.log(`  ! cleanup skipped (${BASE} is not a local target) — remove the test listings manually`);
  }

  finish();
}

function finish() {
  console.log(results.join("\n"));
  console.log(`\n[smoke-marketplace] ${pass} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error("[smoke-marketplace] crashed:", error);
  process.exit(1);
});
