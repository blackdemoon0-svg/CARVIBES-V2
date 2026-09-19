// ============================================================
// CARVIBES / MARKETVIBES — marketplace data reset
//
//   npm run marketplace:reset           # report what is stored
//   npm run marketplace:reset -- --yes  # actually wipe it
//
// MarketVibes ships EMPTY. There is no demo fleet, no seeded seller and
// no sample contact details anywhere in this repository — the only
// listings that ever exist are ones a real seller submitted. This script
// exists for the opposite direction: wiping test/development records so a
// deployment goes live with a genuinely empty marketplace, and so the
// "0 pending / 0 published / 0 rejected" state can be re-checked at any
// time.
//
// What it clears:
//   * every listing (any status)
//   * staged photo uploads that never became a listing
//   * uploaded photo files under public/marketplace-media
//   * the audit + click counters that belong to those listings
//
// What it deliberately keeps:
//   * the store itself, the admin session secret, the dev admin
//     bootstrap, the taxonomy files and every API route — this is a data
//     reset, not a teardown.
// ============================================================

import { readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const importUrl = (rel) => pathToFileURL(path.join(ROOT, "server", "marketplace", rel)).href;

async function main() {
  const confirmed = process.argv.includes("--yes") || process.argv.includes("-y");
  const [store, config] = await Promise.all([import(importUrl("store.mjs")), import(importUrl("config.mjs"))]);

  const listings = await store.allListings();
  const counts = listings.reduce(
    (acc, l) => ({ ...acc, [l.status]: (acc[l.status] ?? 0) + 1 }),
    { pending: 0, approved: 0, rejected: 0 }
  );

  const mediaDir = config.paths.mediaDir;
  const mediaDirs = await readdir(mediaDir, { withFileTypes: true }).catch(() => []);
  const folders = mediaDirs.filter((entry) => entry.isDirectory()).length;

  console.log("[reset] current marketplace data");
  console.log(`[reset]   listings        ${listings.length} (${counts.pending} pending · ${counts.approved} approved · ${counts.rejected} rejected)`);
  console.log(`[reset]   media folders   ${folders} in ${path.relative(ROOT, mediaDir)}`);

  if (!listings.length && !folders) {
    console.log("[reset] already empty — nothing to do");
    return;
  }

  if (!confirmed) {
    console.log("[reset] this would permanently delete every listing and uploaded photo.");
    console.log("[reset] re-run with --yes to confirm:  npm run marketplace:reset -- --yes");
    return;
  }

  await store.resetStore();
  for (const entry of await readdir(mediaDir, { withFileTypes: true }).catch(() => [])) {
    await rm(path.join(mediaDir, entry.name), { recursive: true, force: true });
  }

  const after = await store.allListings();
  console.log(`[reset] done — ${after.length} listings, ${(await readdir(mediaDir).catch(() => [])).length} media entries`);
  console.log("[reset] the API keeps serving immediately: the store re-reads the file on change");
}

main().catch((error) => {
  console.error(`[reset] ${error.stack ?? error.message}`);
  process.exit(1);
});
