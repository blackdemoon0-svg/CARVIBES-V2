// ============================================================
// CARVIBES / MARKETVIBES — persistent listing store
//
// REAL persistence, not localStorage: listings live in
// `<MARKETPLACE_DATA_DIR>/listings.json` (default data/marketplace/),
// written atomically (tmp + rename) and serialised through a single
// write chain so concurrent requests can never interleave.
//
// The module is deliberately dependency-free and storage-agnostic in
// shape: every function is a small async helper around one document, so
// swapping the file for Postgres/Supabase later touches this file only
// (the SQL schema and the migration notes live in docs/MARKETPLACE.md).
//
// Nothing here is exposed publicly: the API layer decides which fields
// a visitor may see.
// ============================================================

import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { paths, SITE_URL } from "./config.mjs";

export const STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

const EMPTY = { version: 1, listings: [], stagedUploads: [], audit: [], clicks: [] };

let doc = null;
let writing = Promise.resolve();

/**
 * Identity of the document we last read from / wrote to disk.
 *
 * The store is a real file that other processes also touch: the operator
 * reset script (`npm run marketplace:reset`) rewrites it, a backup may be
 * restored, a migration script may rewrite it. Caching the document for the lifetime of the process
 * would mean (a) those changes never show up and, far worse, (b) the next
 * mutation would write the stale in-memory copy back and resurrect
 * records somebody had deliberately removed. So every access re-checks
 * the file's mtime+size and reloads when it moved.
 */
let loadedStamp = null;

async function fileStamp() {
  try {
    const info = await stat(paths.storeFile);
    return `${info.mtimeMs}:${info.size}`;
  } catch {
    return null;
  }
}

async function ensureDirs() {
  await mkdir(paths.dataDir, { recursive: true });
  await mkdir(paths.mediaDir, { recursive: true });
}

async function load() {
  if (doc) {
    // Let our own in-flight write settle first, then look at the file.
    await writing;
    const stamp = await fileStamp();
    if (stamp === loadedStamp) return doc;
    // Changed underneath us (including deleted) — fall through and re-read.
  }
  await ensureDirs();
  if (!existsSync(paths.storeFile)) {
    doc = structuredClone(EMPTY);
    loadedStamp = null;
    return doc;
  }
  try {
    const raw = JSON.parse(await readFile(paths.storeFile, "utf8"));
    doc = {
      version: raw.version ?? 1,
      listings: Array.isArray(raw.listings) ? raw.listings : [],
      stagedUploads: Array.isArray(raw.stagedUploads) ? raw.stagedUploads : [],
      audit: Array.isArray(raw.audit) ? raw.audit : [],
      clicks: Array.isArray(raw.clicks) ? raw.clicks : [],
    };
  } catch {
    // A corrupt document must never take the marketplace down.
    doc = structuredClone(EMPTY);
  }
  loadedStamp = await fileStamp();
  return doc;
}

/** Atomic, serialised write. Resolves once the bytes are on disk. */
function persist() {
  writing = writing
    .then(async () => {
      await ensureDirs();
      const tmp = `${paths.storeFile}.${process.pid}.tmp`;
      await writeFile(tmp, JSON.stringify(doc), "utf8");
      await rename(tmp, paths.storeFile);
      // We are now the freshest writer: remember our own file's identity
      // so the next read does not treat it as an external change.
      loadedStamp = await fileStamp();
    })
    .catch(() => {
      /* keep serving reads even if the disk is full/read-only */
    });
  return writing;
}

export async function read(fn) {
  const d = await load();
  return fn(d);
}

export async function mutate(fn) {
  const d = await load();
  const result = fn(d);
  await persist();
  return result;
}

// ------------------------------------------------------------
// Ids
// ------------------------------------------------------------
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no look-alikes

export function randomId(length = 10) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export function newListingId() {
  return `mk_${randomId(10)}`;
}

// ------------------------------------------------------------
// Queries
// ------------------------------------------------------------
export async function allListings() {
  return read((d) => d.listings);
}

/** Listings a visitor is allowed to see. */
export async function publicListings() {
  return read((d) =>
    d.listings
      .filter((l) => l.status === STATUS.approved)
      .sort((a, b) => (b.publishedAt ?? b.updatedAt ?? "").localeCompare(a.publishedAt ?? a.updatedAt ?? ""))
  );
}

export async function findById(id) {
  // Accepts the internal id, the public id (stable part of the URL) or the
  // full slug — so /marketplace/car/<slug> and /marketplace/car/<publicId>
  // both resolve, and a link can never rot after a cosmetic slug change.
  const key = String(id ?? "").toLowerCase();
  return read((d) => d.listings.find((l) => l.id === id || l.publicId === key || l.slug === key));
}

export async function findPublicBySlug(slug) {
  const clean = String(slug ?? "").toLowerCase();
  return read((d) =>
    d.listings.find(
      (l) => l.status === STATUS.approved && (l.slug === clean || l.publicId === clean)
    )
  );
}

/** Insert a new listing. Always PENDING — the API never auto-publishes. */
export async function insertListing(listing) {
  return mutate((d) => {
    d.listings.push(listing);
    d.audit.push({
      at: new Date().toISOString(),
      actor: "seller",
      action: "submitted",
      listingId: listing.id,
    });
    return listing;
  });
}

export async function updateListing(id, patch, audit) {
  return mutate((d) => {
    const index = d.listings.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const next = { ...d.listings[index], ...patch, updatedAt: new Date().toISOString() };
    d.listings[index] = next;
    if (audit) {
      d.audit.push({
        at: new Date().toISOString(),
        actor: audit.actor ?? "admin",
        action: audit.action,
        listingId: id,
        detail: audit.detail,
      });
    }
    return next;
  });
}

/**
 * Bulk status change — used by the admin bulk workflow.
 * `ids` may hold internal ids OR public ids (the UI only ever knows the
 * public ones), so both are matched.
 */
export async function updateMany(ids, patchFor, audit) {
  const keys = new Set(ids);
  return mutate((d) => {
    const changed = [];
    for (const listing of d.listings) {
      if (!keys.has(listing.id) && !keys.has(listing.publicId)) continue;
      Object.assign(listing, patchFor(listing), { updatedAt: new Date().toISOString() });
      changed.push(listing);
    }
    if (audit && changed.length) {
      d.audit.push({
        at: new Date().toISOString(),
        actor: audit.actor ?? "admin",
        action: audit.action,
        listingId: changed.map((l) => l.id).join(","),
        detail: audit.detail,
      });
    }
    return changed;
  });
}

// ------------------------------------------------------------
// Upload staging (photos travel: upload → review → submit)
// ------------------------------------------------------------
export async function addStagedUpload(upload) {
  return mutate((d) => {
    d.stagedUploads.push(upload);
    // Housekeeping: staged photos that never became a listing are dropped
    // after 48 h, and the files with them.
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const keep = [];
    for (const u of d.stagedUploads) {
      const ts = Date.parse(u.createdAt ?? 0);
      if (Number.isFinite(ts) && ts < cutoff && !u.claimedBy) {
        void removeMedia(u.file);
        continue;
      }
      keep.push(u);
    }
    d.stagedUploads = keep;
    return upload;
  });
}

export async function findStagedUploads(ids) {
  return read((d) => d.stagedUploads.filter((u) => ids.includes(u.id)));
}

export async function claimStagedUploads(ids, listingId) {
  return mutate((d) => {
    for (const u of d.stagedUploads) {
      if (ids.includes(u.id)) u.claimedBy = listingId;
    }
  });
}

// ------------------------------------------------------------
// Contact click counters (privacy-friendly: no raw IPs stored)
// ------------------------------------------------------------
export async function recordClick(listingId, channel) {
  return mutate((d) => {
    d.clicks.push({ at: new Date().toISOString(), listingId, channel });
    if (d.clicks.length > 5000) d.clicks.splice(0, d.clicks.length - 5000);
    const listing = d.listings.find((l) => l.id === listingId);
    if (listing) {
      listing.contactClicks = listing.contactClicks ?? {};
      listing.contactClicks[channel] = (listing.contactClicks[channel] ?? 0) + 1;
    }
  });
}

export async function recordView(listingId) {
  return mutate((d) => {
    const listing = d.listings.find((l) => l.id === listingId);
    if (listing) listing.views = (listing.views ?? 0) + 1;
  });
}

// ------------------------------------------------------------
// Media files
// ------------------------------------------------------------
export function mediaPathFor(listingPublicId, filename) {
  return path.join(paths.mediaDir, listingPublicId, filename);
}

export function mediaUrlFor(listingPublicId, filename) {
  return `${paths.mediaUrlPrefix}/${listingPublicId}/${filename}`;
}

/** Absolute URL for og:image / JSON-LD (uses the configured site URL). */
export function absoluteMediaUrl(relative) {
  if (!relative) return "";
  return relative.startsWith("http") ? relative : `${SITE_URL}${relative}`;
}

export async function moveMedia(fromFile, toPublicId, toFile) {
  const dir = path.join(paths.mediaDir, toPublicId);
  await mkdir(dir, { recursive: true });
  const target = path.join(dir, toFile);
  try {
    await rename(fromFile, target);
  } catch {
    // Different device (or Windows lock): copy then drop the source.
    const { copyFile } = await import("node:fs/promises");
    await copyFile(fromFile, target);
    await rm(fromFile, { force: true });
  }
  return mediaUrlFor(toPublicId, toFile);
}

export async function removeMedia(file) {
  if (!file) return;
  // Upload file names are generated server-side, so this never fires in
  // practice — it just guarantees a corrupt record can never delete
  // anything outside the media directory.
  const target = path.resolve(paths.mediaDir, file);
  if (!target.startsWith(path.resolve(paths.mediaDir) + path.sep)) return;
  try {
    await rm(target, { force: true });
  } catch {
    /* already gone */
  }
}

/** Ensures a listing still referenced by the public site keeps its files. */
export async function pruneOrphanMedia(publicIds) {
  const { readdir } = await import("node:fs/promises");
  try {
    const entries = await readdir(paths.mediaDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !publicIds.includes(entry.name)) {
        await rm(path.join(paths.mediaDir, entry.name), { recursive: true, force: true });
      }
    }
  } catch {
    /* nothing to prune */
  }
}

/** Test/maintenance helper. */
export async function resetStore() {
  doc = structuredClone(EMPTY);
  await persist();
}

/**
 * Delete specific listings (plus their uploaded photos).
 *
 * Used by the end-to-end tests, which must be able to clean up after
 * themselves WITHOUT touching listings that were already there: a store
 * can legitimately hold a real seller's submission while the suite runs.
 * Accepts internal ids or public ids.
 */
export async function deleteListings(ids) {
  const keys = new Set(ids.filter(Boolean));
  if (!keys.size) return { removed: 0, files: 0 };
  const files = [];
  const dirs = [];
  // Both identifiers are tracked: listings are stored (and audited) under
  // their internal id, but callers may only know the public one.
  const gone = new Set();
  const removed = await mutate((d) => {
    const keep = [];
    for (const listing of d.listings) {
      if (keys.has(listing.id) || keys.has(listing.publicId)) {
        gone.add(listing.id);
        if (listing.publicId) gone.add(listing.publicId);
        for (const media of listing.media ?? []) if (media.file) files.push(media.file);
        // The public photos live in their own directory (mediaDir/<publicId>/),
        // which is what the served URLs point at.
        if (listing.publicId) dirs.push(listing.publicId);
      } else {
        keep.push(listing);
      }
    }
    const count = d.listings.length - keep.length;
    d.listings = keep;

    // Leave no trace of the deleted listings in the logs either: the
    // audit trail and the contact-click counter would otherwise keep
    // pointing at rows that no longer exist. A bulk entry that still
    // references a surviving listing is kept.
    if (gone.size) {
      d.audit = (d.audit ?? []).filter(
        (row) =>
          !String(row.listingId ?? "")
            .split(",")
            .filter(Boolean)
            .every((id) => gone.has(id))
      );
      d.clicks = (d.clicks ?? []).filter((row) => !gone.has(row.listingId));
    }
    return count;
  });
  for (const file of files) await removeMedia(file);
  for (const dir of dirs) {
    const target = path.resolve(paths.mediaDir, dir);
    if (!target.startsWith(path.resolve(paths.mediaDir) + path.sep)) continue;
    try {
      await rm(target, { recursive: true, force: true });
    } catch {
      /* already gone */
    }
  }
  return { removed, files: files.length, dirs: dirs.length };
}

/**
 * Drop staged (uploaded but never submitted) photos.
 * The seller funnel uploads before submitting, so an abandoned or test
 * session leaves staged files behind — they are removed here.
 */
export async function deleteStagedUploads(ids) {
  const keys = new Set(ids.filter(Boolean));
  if (!keys.size) return { removed: 0 };
  const files = [];
  const removed = await mutate((d) => {
    const keep = [];
    for (const upload of d.stagedUploads) {
      if (keys.has(upload.id)) files.push(upload.file);
      else keep.push(upload);
    }
    const count = d.stagedUploads.length - keep.length;
    d.stagedUploads = keep;
    return count;
  });
  for (const file of files) await removeMedia(file);
  return { removed };
}

/**
 * Delete media that no listing and no staged upload can reach any more.
 *
 * A listing's public photos live in `mediaDir/<publicId>/`, so a directory
 * whose name is not the public id of a listing that still exists is
 * unreachable — nothing in the API can serve or claim it. Same for loose
 * files in the media root that no staged-upload record mentions. This is
 * housekeeping for test runs and for a store whose listings were removed
 * outside the API; it never touches a live listing's media.
 *
 * Not called during normal request handling: a seller's upload is written
 * to disk a moment before its record is persisted, and a collector racing
 * that window would be the one way to lose a real photo.
 */
export async function gcOrphanMedia() {
  const { readdir } = await import("node:fs/promises");
  const d = await read((doc) => doc);
  const liveDirs = new Set((d.listings ?? []).map((l) => l.publicId).filter(Boolean));
  const liveFiles = new Set(
    [...(d.stagedUploads ?? []).map((u) => u.file), ...(d.listings ?? []).flatMap((l) => (l.media ?? []).map((m) => m.file))]
      .filter(Boolean)
  );

  let dirs = 0;
  let files = 0;
  for (const entry of await readdir(paths.mediaDir, { withFileTypes: true }).catch(() => [])) {
    const target = path.join(paths.mediaDir, entry.name);
    if (entry.isDirectory()) {
      if (liveDirs.has(entry.name)) continue;
      await rm(target, { recursive: true, force: true });
      dirs += 1;
    } else {
      if (liveFiles.has(entry.name)) continue;
      await rm(target, { force: true });
      files += 1;
    }
  }
  return { dirs, files };
}

/** Force the next read to come from disk (used by the reset script + tests). */
export async function reload() {
  await writing;
  doc = null;
  loadedStamp = null;
  return read((d) => d);
}
