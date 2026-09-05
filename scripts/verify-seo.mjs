// ============================================================
// CARVIBES — post-build SEO audit
//
// Fails the build if any of the indexing guarantees regress:
//   - every sitemap URL has a prerendered HTML file
//   - every indexable prerendered page is in the sitemap
//   - every page has exactly one self-referencing canonical
//   - noindex pages are noindex, indexable pages are not
//   - robots.txt blocks nothing and points at the right sitemap
//   - every vercel.json 301 target actually resolves
//
// Usage: node scripts/verify-seo.mjs   (or: npm run verify:seo)
// ============================================================

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const problems = [];
const fail = (msg) => problems.push(msg);

if (!existsSync(DIST)) {
  console.error("[verify-seo] dist/ not found — run `npm run build` first.");
  process.exit(1);
}

// Routes that render from localStorage / a user query: intentionally
// noindex and intentionally absent from the sitemap.
const NOINDEX = new Set(["/favorites", "/compare", "/search", "/404"]);

const siteUrl = new URL(
  process.env.SITE_URL?.trim() ||
    readFileSync(path.join(ROOT, "src/lib/seo.ts"), "utf8").match(
      /export\s+const\s+SITE_URL\s*=\s*["'`]([^"'`]+)["'`]/
    )[1]
).origin;

// ---------- collect prerendered pages ----------
const pages = [];
(function walk(dir, base = "") {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, `${base}/${entry.name}`);
    else if (entry.name.endsWith(".html")) {
      let route = `${base}/${entry.name.replace(/\.html$/, "")}`;
      if (route === "/index") route = "/";
      pages.push({ route, file: full, html: readFileSync(full, "utf8") });
    }
  }
})(DIST);

if (!pages.length) fail("No prerendered HTML files in dist/.");

// ---------- canonical + robots per page ----------
for (const page of pages) {
  const canonicals = [...page.html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(
    (m) => m[1]
  );
  const rel = path.relative(DIST, page.file);

  if (canonicals.length !== 1) {
    fail(`${rel}: expected exactly 1 canonical, found ${canonicals.length}`);
    continue;
  }
  const expected = `${siteUrl}${page.route === "/" ? "/" : page.route}`;
  // The 404 shell deliberately canonicalises to the homepage.
  if (page.route !== "/404" && canonicals[0] !== expected) {
    fail(`${rel}: canonical is ${canonicals[0]}, expected ${expected}`);
  }

  const robots = page.html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
  const isNoindex = /noindex/.test(robots);
  if (NOINDEX.has(page.route) && !isNoindex) fail(`${rel}: should be noindex but is not`);
  if (!NOINDEX.has(page.route) && isNoindex) fail(`${rel}: is noindex but should be indexable`);

  const title = page.html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
  if (!title.trim()) fail(`${rel}: empty <title>`);
  const desc = page.html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  if (!desc.trim()) fail(`${rel}: empty meta description`);
}

// Duplicate titles across indexable pages are a canonicalisation risk.
const titles = new Map();
for (const page of pages) {
  if (NOINDEX.has(page.route)) continue;
  const title = page.html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
  titles.set(title, (titles.get(title) ?? 0) + 1);
}
for (const [title, count] of titles) {
  if (count > 1) fail(`Duplicate <title> on ${count} indexable pages: ${title}`);
}

// ---------- sitemap parity ----------
const sitemapPath = path.join(DIST, "sitemap.xml");
if (!existsSync(sitemapPath)) fail("dist/sitemap.xml is missing.");
else {
  const xml = readFileSync(sitemapPath, "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) fail("sitemap.xml contains no <loc> entries.");

  const routes = new Set(pages.map((p) => p.route));
  const inSitemap = new Set();

  for (const loc of locs) {
    if (!loc.startsWith(`${siteUrl}/`)) fail(`sitemap: URL not on ${siteUrl}: ${loc}`);
    const route = new URL(loc).pathname.replace(/\/$/, "") || "/";
    inSitemap.add(route);
    if (!routes.has(route)) fail(`sitemap: ${loc} has no prerendered HTML file`);
    if (NOINDEX.has(route)) fail(`sitemap: ${loc} is a noindex route and must not be listed`);
  }

  for (const page of pages) {
    if (NOINDEX.has(page.route)) continue;
    if (!inSitemap.has(page.route)) fail(`sitemap: indexable route ${page.route} is missing`);
  }
}

// ---------- robots.txt ----------
const robotsPath = path.join(DIST, "robots.txt");
if (!existsSync(robotsPath)) fail("dist/robots.txt is missing.");
else {
  const robots = readFileSync(robotsPath, "utf8");
  for (const line of robots.split("\n")) {
    const value = line.match(/^\s*Disallow:\s*(\S+)/i)?.[1];
    if (value) fail(`robots.txt blocks a path: Disallow: ${value}`);
  }
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
    fail(`robots.txt does not reference ${siteUrl}/sitemap.xml`);
  }
}

// ---------- vercel.json redirect targets ----------
const vercel = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
for (const route of vercel.routes ?? []) {
  const location = route.headers?.Location;
  if (!location || !String(route.status).startsWith("30")) continue;
  if (location.startsWith("http")) continue; // host-level redirect
  if (!existsSync(path.join(DIST, `${location.replace(/^\//, "")}.html`))) {
    fail(`vercel.json: ${route.src} redirects to ${location}, which has no page`);
  }
}

// ---------- report ----------
if (problems.length) {
  console.error(`[verify-seo] ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `[verify-seo] OK — ${pages.length} pages, all canonicals self-referencing on ${siteUrl}, ` +
    `sitemap in sync, robots.txt blocks nothing, all redirect targets resolve.`
);
