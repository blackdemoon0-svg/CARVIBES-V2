// ============================================================
// CARVIBES — build-time sitemap + robots.txt generator
//
// Why this exists
// ---------------
// CarVibes is a client-rendered Vite SPA: there is no server that
// can render /sitemap.xml on demand. The only reliable way to expose
// a sitemap on Vercel is to ship it as a real static file, so this
// script writes public/sitemap.xml (which Vite copies verbatim into
// dist/ and Vercel serves through its `{"handle":"filesystem"}` route).
//
// It runs automatically via the `prebuild` npm lifecycle hook, so the
// sitemap can never silently drift away from the car/story database.
//
// The real car + story data is evaluated (not regex-scraped) by
// bundling the TypeScript modules with esbuild, so every URL in the
// sitemap is guaranteed to resolve to a real entity in the app.
//
// Usage:
//   node scripts/generate-sitemap.mjs
//   SITE_URL=https://staging.carvibes.dev node scripts/generate-sitemap.mjs
// ============================================================

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SEO_TS = path.join(ROOT, "src", "lib", "seo.ts");

// ------------------------------------------------------------
// 1. Canonical production domain
// ------------------------------------------------------------
// src/lib/seo.ts is the single source of truth for the canonical
// domain (it is what <link rel="canonical"> uses at runtime). We read
// it from there so the sitemap can never disagree with the canonicals.
// An explicit SITE_URL env var wins, which is how a future custom
// domain would be rolled out without touching this script.
function resolveSiteUrl() {
  const fromEnv = process.env.SITE_URL?.trim();
  if (fromEnv) return normalizeOrigin(fromEnv, "SITE_URL env var");

  const seo = readFileSync(SEO_TS, "utf8");
  const match = seo.match(/export\s+const\s+SITE_URL\s*=\s*["'`]([^"'`]+)["'`]/);
  if (!match) {
    throw new Error(
      `Could not find "export const SITE_URL" in ${path.relative(ROOT, SEO_TS)}`
    );
  }
  return normalizeOrigin(match[1], path.relative(ROOT, SEO_TS));
}

function normalizeOrigin(value, source) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid absolute URL from ${source}: ${value}`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`Sitemap domain must use https (${source}): ${value}`);
  }
  const host = url.hostname.toLowerCase();
  // Guard rails: never let a dev/preview host leak into a production sitemap.
  const forbidden =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".e2b.app") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    // Vercel preview deployments look like <project>-<hash>-<scope>.vercel.app
    /-[a-z0-9]{6,}-[a-z0-9-]+\.vercel\.app$/.test(host);
  if (forbidden) {
    throw new Error(
      `Refusing to build a sitemap for the non-production host "${host}" (from ${source}).`
    );
  }
  return `${url.protocol}//${url.host}`;
}

// ------------------------------------------------------------
// 2. Indexable route map
// ------------------------------------------------------------
// Only routes that render real, crawlable, server-independent content
// belong in a sitemap. Everything else is deliberately left out — note
// that "left out of the sitemap" is NOT "noindex": nothing here blocks
// or discourages crawling, these URLs simply are not *submitted*.
//
// Excluded on purpose:
//   /favorites  — renders purely from localStorage; empty for a crawler
//   /compare    — comparison tray, empty for a crawler (no saved cars)
//   /search     — internal search results; Google asks that these are
//                 not submitted in sitemaps
//   /explore?cat=…&brand=…&maxPrice=… — faceted duplicates of /explore
//                 (they already self-canonicalise to /explore at runtime)
//   /cars/*, /rankings/* — legacy paths that vercel.json 301s or 404s
const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0", group: "site" },
  { path: "/explore", changefreq: "daily", priority: "0.9", group: "cars" },
  { path: "/news", changefreq: "weekly", priority: "0.9", group: "stories" },
  { path: "/brands", changefreq: "weekly", priority: "0.8", group: "cars" },
  { path: "/find-my-car", changefreq: "monthly", priority: "0.7", group: "site" },
  { path: "/contact", changefreq: "yearly", priority: "0.4", group: "site" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.2", group: "site" },
  { path: "/terms", changefreq: "yearly", priority: "0.2", group: "site" },
];

// ------------------------------------------------------------
// 3. Load the real car + story data
// ------------------------------------------------------------
async function loadData() {
  const outDir = mkdtempSync(path.join(tmpdir(), "carvibes-sitemap-"));
  const entry = path.join(outDir, "entry.ts");
  const outfile = path.join(outDir, "data.mjs");

  writeFileSync(
    entry,
    [
      `import { cars } from ${JSON.stringify(path.join(ROOT, "src/lib/db.ts"))};`,
      `import { stories } from ${JSON.stringify(path.join(ROOT, "src/lib/stories.ts"))};`,
      `export const carIds = cars.map((c) => c.id);`,
      `export const storyIds = stories.map((s) => s.id);`,
    ].join("\n"),
    "utf8"
  );

  try {
    await build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      logLevel: "silent",
    });
    const mod = await import(pathToFileURL(outfile).href);
    return { carIds: mod.carIds, storyIds: mod.storyIds };
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

// ------------------------------------------------------------
// 4. lastmod, sourced from real git history (never faked)
// ------------------------------------------------------------
// A <lastmod> that is not accurate is worse than no <lastmod> at all —
// Google ignores sitemaps whose dates it cannot trust. So we use the
// commit date of the files that actually produce each group of URLs,
// and simply omit the tag whenever git history is unavailable
// (shallow clones, tarball builds, …).
const GIT_SOURCES = {
  site: ["src", "index.html"],
  cars: ["src/lib/cars.ts", "src/lib/carBuilder.ts", "src/lib/db.ts", "src/lib/data"],
  stories: ["src/lib/stories.ts"],
};

function gitLastModified(paths) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...paths],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (!out) return null;
    const date = new Date(out);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// 5. Build + validate the URL set
// ------------------------------------------------------------
const XML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (c) => XML_ESCAPES[c]);

function encodePath(routePath) {
  // Slugs are already URL-safe, but encode defensively so any future
  // non-ASCII id still produces a spec-compliant <loc>.
  return routePath
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

function buildEntries(siteUrl, { carIds, storyIds }, lastmod) {
  const entries = [];

  for (const route of STATIC_ROUTES) {
    entries.push({
      loc: siteUrl + (route.path === "/" ? "/" : encodePath(route.path)),
      lastmod: lastmod[route.group],
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  for (const id of carIds) {
    entries.push({
      loc: `${siteUrl}${encodePath(`/car/${id}`)}`,
      lastmod: lastmod.cars,
      changefreq: "monthly",
      priority: "0.8",
    });
  }

  for (const id of storyIds) {
    entries.push({
      loc: `${siteUrl}${encodePath(`/story/${id}`)}`,
      lastmod: lastmod.stories,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  return entries;
}

function validate(entries, siteUrl) {
  const problems = [];
  const seen = new Set();

  for (const entry of entries) {
    if (!entry.loc.startsWith(`${siteUrl}/`)) {
      problems.push(`Not an absolute production URL: ${entry.loc}`);
    }
    if (seen.has(entry.loc)) problems.push(`Duplicate URL: ${entry.loc}`);
    seen.add(entry.loc);
    if (entry.loc.length > 2048) problems.push(`URL exceeds 2048 chars: ${entry.loc}`);
  }

  // Sitemap protocol hard limits.
  if (entries.length > 50000) {
    problems.push(`${entries.length} URLs exceeds the 50,000 per-sitemap limit.`);
  }
  if (entries.length === 0) problems.push("Sitemap is empty.");

  if (problems.length) {
    throw new Error(`Sitemap validation failed:\n  - ${problems.join("\n  - ")}`);
  }
}

function renderSitemap(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const entry of entries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

function renderRobots(siteUrl) {
  return [
    "# CarVibes — https://www.robotstxt.org/robotstxt.html",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

// ------------------------------------------------------------
// 6. Run
// ------------------------------------------------------------
async function main() {
  const siteUrl = resolveSiteUrl();
  const data = await loadData();

  const lastmod = {
    site: gitLastModified(GIT_SOURCES.site),
    cars: gitLastModified(GIT_SOURCES.cars),
    stories: gitLastModified(GIT_SOURCES.stories),
  };

  const entries = buildEntries(siteUrl, data, lastmod);
  validate(entries, siteUrl);

  writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), renderSitemap(entries), "utf8");
  writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), renderRobots(siteUrl), "utf8");

  const staticCount = STATIC_ROUTES.length;
  console.log(
    `[sitemap] ${entries.length} URLs → public/sitemap.xml ` +
      `(${staticCount} static, ${data.carIds.length} cars, ${data.storyIds.length} stories)`
  );
  console.log(`[sitemap] canonical domain: ${siteUrl}`);
  console.log(`[sitemap] robots.txt → Sitemap: ${siteUrl}/sitemap.xml`);
}

main().catch((error) => {
  console.error(`[sitemap] ${error.message}`);
  process.exit(1);
});
