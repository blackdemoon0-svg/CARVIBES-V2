// ============================================================
// CARVIBES — IndexNow submission
//
// What this does
// --------------
// Pushes every URL in public/sitemap.xml to the IndexNow endpoint in
// one batched request. IndexNow is supported by Bing, Yandex, Seznam
// and Naver, and it is a *push* protocol: instead of waiting for a
// crawler to come back, the engines are told immediately which URLs
// changed. Submissions are typically picked up within hours.
//
// Google does NOT participate in IndexNow. For Google, use the
// Search Console UI ("URL Inspection" -> "Request indexing") for the
// handful of pages that matter most, and rely on the sitemap for the
// long tail. See scripts/README-indexing.md for the exact runbook.
//
// Authentication
// --------------
// IndexNow authenticates by key file: the key must be readable at
// https://carvibes.dev/<key>.txt and contain exactly the key. That
// file is committed at public/9e90d3de0eb3d88779ab3405d5a94f1b.txt
// and ships with every deploy.
//
// Usage:
//   node scripts/submit-indexnow.mjs              # submit everything
//   node scripts/submit-indexnow.mjs --dry-run    # print, don't send
//   node scripts/submit-indexnow.mjs /car/bmw-m3-competition /news
// ============================================================

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const KEY = process.env.INDEXNOW_KEY || "9e90d3de0eb3d88779ab3405d5a94f1b";
const ENDPOINT = "https://api.indexnow.org/indexnow";
// IndexNow accepts at most 10,000 URLs per request.
const BATCH_SIZE = 10000;

function resolveSiteUrl() {
  const raw =
    process.env.SITE_URL?.trim() ||
    readFileSync(path.join(ROOT, "src", "lib", "seo.ts"), "utf8").match(
      /export\s+const\s+SITE_URL\s*=\s*["'`]([^"'`]+)["'`]/
    )?.[1];
  if (!raw) throw new Error("Could not resolve SITE_URL");
  return new URL(raw).origin;
}

function sitemapUrls() {
  const xml = readFileSync(path.join(ROOT, "public", "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&")
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const explicit = argv.filter((a) => !a.startsWith("--"));

  const siteUrl = resolveSiteUrl();
  const host = new URL(siteUrl).hostname;

  const urlList = explicit.length
    ? explicit.map((p) => (p.startsWith("http") ? p : `${siteUrl}${p.startsWith("/") ? p : `/${p}`}`))
    : sitemapUrls();

  // Never let a URL from another host into the payload — IndexNow rejects
  // the whole batch if a single URL is off-host.
  const offHost = urlList.filter((u) => new URL(u).hostname !== host);
  if (offHost.length) {
    throw new Error(`${offHost.length} URL(s) are not on ${host}, e.g. ${offHost[0]}`);
  }

  console.log(`[indexnow] host      : ${host}`);
  console.log(`[indexnow] key file  : ${siteUrl}/${KEY}.txt`);
  console.log(`[indexnow] urls      : ${urlList.length}`);

  if (dryRun) {
    urlList.slice(0, 20).forEach((u) => console.log(`  ${u}`));
    if (urlList.length > 20) console.log(`  … and ${urlList.length - 20} more`);
    console.log("[indexnow] dry run — nothing submitted.");
    return;
  }

  for (let i = 0; i < urlList.length; i += BATCH_SIZE) {
    const batch = urlList.slice(i, i + BATCH_SIZE);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: KEY,
        keyLocation: `${siteUrl}/${KEY}.txt`,
        urlList: batch,
      }),
    });

    // 200 = accepted, 202 = accepted but key still being validated.
    const ok = res.status === 200 || res.status === 202;
    console.log(
      `[indexnow] batch ${i / BATCH_SIZE + 1}: ${batch.length} URLs → HTTP ${res.status} ${ok ? "OK" : "FAILED"}`
    );
    if (!ok) {
      console.error(`[indexnow] response: ${(await res.text()).slice(0, 500)}`);
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(`[indexnow] ${error.message}`);
  process.exit(1);
});
