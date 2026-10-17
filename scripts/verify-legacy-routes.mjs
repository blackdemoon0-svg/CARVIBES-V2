// ============================================================
// CARVIBES — legacy URL regression test
//
// v1 of CarVibes (the Next.js app) published /cars/<brand-model-year>,
// /brands/<slug>, /news/<slug>, /rankings and /rankings/<slug>. Those
// URLs are the ones search engines were pointed at by v1's sitemap and
// robots.txt, so landing on one of them must never dead-end.
//
// This test simulates the `routes` evaluation Vercel performs against
// vercel.json and asserts, for the complete v1 inventory, that:
//   - no legacy URL falls into the 404 catch-alls,
//   - every 301 carries a Location that resolves to a real page,
//   - no redirect chain loops or exceeds one hop,
//   - the v1 pages that still exist in v2 answer 200 directly.
//
// Usage: node scripts/verify-legacy-routes.mjs
// ============================================================

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const HOST = "carvibes.dev";

if (!existsSync(DIST)) {
  console.error("[verify-legacy] dist/ not found — run `npm run build` first.");
  process.exit(1);
}

const { routes } = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"));

// Every car slug the v1 site published (its sitemap listed /cars/<slug>).

const V1_CARS = [
  "audi-a3-2024", "audi-a4-2024", "audi-a6-2024", "audi-a8-2024",
  "audi-q5-2024", "audi-q7-2024", "audi-q8-2024", "audi-e-tron-gt-2024",
  "audi-rs6-avant-2024", "audi-rs7-sportback-2024", "audi-tt-rs-2023", "audi-r8-v10-performance-2024",
  "bmw-1-series-m135-2024", "bmw-3-series-330i-2024", "bmw-5-series-540i-2024", "bmw-7-series-760i-2024",
  "bmw-x3-xdrive30i-2024", "bmw-x5-xdrive40i-2024", "bmw-x7-xdrive40i-2024", "bmw-m3-competition-2024",
  "bmw-m5-2024", "bmw-m8-competition-2024", "bmw-i4-m50-2024", "bmw-ix-xdrive50-2024",
  "mercedes-benz-a-class-a250-2024", "mercedes-benz-c-class-c300-2024", "mercedes-benz-e-class-e350-2024", "mercedes-benz-s-class-s500-2024",
  "mercedes-benz-glc-300-2024", "mercedes-benz-gle-450-2024", "mercedes-benz-gls-580-2024", "mercedes-benz-g-class-g63-amg-2024",
  "mercedes-benz-amg-gt-63-s-2024", "mercedes-benz-eqs-580-2024", "mercedes-benz-amg-c63-s-e-performance-2024", "mercedes-benz-cla-250-coupe-2024",
  "porsche-911-carrera-2024", "porsche-911-turbo-s-2024", "porsche-718-cayman-2024", "porsche-cayenne-2024",
  "porsche-taycan-2024", "ferrari-296-gtb-2024", "ferrari-sf90-stradale-2024", "ferrari-roma-2024",
  "lamborghini-huracan-evo-2024", "lamborghini-revuelto-2024", "lamborghini-urus-2024", "mclaren-artura-2024",
  "mclaren-720s-2024", "aston-martin-vantage-2024", "aston-martin-dbx707-2024", "bentley-continental-gt-2024",
  "bentley-bentayga-2024", "rolls-royce-ghost-2024", "rolls-royce-cullinan-2024", "bugatti-chiron-2023",
  "koenigsegg-jesko-2024", "pagani-huayra-2023", "toyota-corolla-2024", "toyota-camry-2024",
  "toyota-rav4-2024", "toyota-supra-2024", "toyota-land-cruiser-2024", "toyota-gr86-2024",
  "honda-civic-2024", "honda-accord-2024", "honda-cr-v-2024", "honda-civic-type-r-2024",
  "nissan-altima-2024", "nissan-rogue-2024", "nissan-gt-r-2024", "nissan-leaf-2024",
  "mazda-mazda3-2024", "mazda-cx-5-2024", "mazda-mx-5-miata-2024", "lexus-is-350-2024",
  "lexus-rx-350-2024", "lexus-lx-600-2024", "lexus-lc500-2024", "subaru-impreza-2024",
  "subaru-wrx-sti-2024", "subaru-outback-2024", "ford-focus-2023", "ford-mustang-gt-2024",
  "ford-explorer-2024", "ford-f-150-raptor-2024", "ford-bronco-2024", "ford-mustang-mach-e-2024",
  "chevrolet-corvette-stingray-2024", "chevrolet-camaro-ss-2024", "chevrolet-tahoe-2024", "chevrolet-bolt-ev-2024",
  "dodge-charger-2023", "dodge-challenger-hellcat-2023", "tesla-model-3-2024", "tesla-model-y-2024",
  "tesla-model-s-plaid-2024", "tesla-cybertruck-2024", "volkswagen-golf-gti-2024", "volkswagen-tiguan-2024",
  "volkswagen-id-4-2024", "volkswagen-passat-2023", "volvo-xc40-2024", "volvo-xc60-2024",
  "volvo-xc90-2024", "volvo-ex30-2024", "hyundai-elantra-2024", "hyundai-tucson-2024",
  "hyundai-ioniq-5-2024", "hyundai-santa-fe-2024", "kia-sportage-2024", "kia-sorento-2024",
  "kia-ev6-gt-2024", "kia-stinger-gt-2023", "peugeot-208-2024", "peugeot-308-2024",
  "peugeot-3008-2024", "renault-clio-2024", "renault-megane-e-tech-2024", "citro-n-c5-aircross-2024",
  "land-rover-range-rover-2024", "land-rover-defender-2024", "land-rover-range-rover-sport-2024", "jeep-wrangler-2024",
  "jeep-grand-cherokee-2024", "maserati-ghibli-2023", "maserati-mc20-2024", "alfa-romeo-giulia-quadrifoglio-2024",
  "alfa-romeo-stelvio-2024", "cadillac-escalade-2024", "cadillac-ct5-v-blackwing-2024", "genesis-g70-2024",
  "genesis-g80-2024", "genesis-gv80-2024", "rivian-r1t-2024", "byd-han-ev-2024",
  "byd-seal-2024", "lotus-emira-2024", "kia-rio-2023", "hyundai-venue-2024",
  "toyota-yaris-2024",
];

// /brands/<slug> pages from v1.

const V1_BRANDS = [
  "audi", "bmw", "mercedes-benz", "porsche",
  "ferrari", "lamborghini", "mclaren", "aston-martin",
  "bentley", "rolls-royce", "bugatti", "koenigsegg",
  "pagani", "toyota", "honda", "nissan",
  "mazda", "lexus", "subaru", "ford",
  "chevrolet", "dodge", "tesla", "volkswagen",
  "volvo", "hyundai", "kia", "peugeot",
  "renault", "citro-n", "land-rover", "jeep",
  "maserati", "alfa-romeo", "cadillac", "genesis",
  "rivian", "byd", "lotus",
];

// /news/<slug> articles from v1.

const V1_NEWS = [
  "10-most-exciting-sports-cars", "future-of-electric-performance-cars", "top-10-most-reliable-cars", "new-supercars-changing-the-industry",
  "best-luxury-suvs", "cars-that-could-become-future-classics", "audi-bmw-mercedes-rivalry", "motorsports-roundup-2026",
  "affordable-cars-worth-buying", "rise-of-chinese-ev-brands", "g-class-icon-status", "bmw-m-division-history",
  "audi-electric-lineup-expansion", "best-daily-drivers-2026",
];

// /rankings and /rankings/<slug> lists from v1.

const V1_RANKINGS = [
  "fastest-cars", "best-sports-cars", "best-luxury-cars", "most-reliable-cars",
  "best-electric-cars", "best-suvs", "best-under-40k", "most-comfortable-cars",
  "best-performance-cars", "best-daily-cars",
];

// v1 routes that still exist unchanged in v2 (must answer 200).
const V1_STATIC = [
  "/",
  "/brands",
  "/compare",
  "/contact",
  "/explore",
  "/favorites",
  "/find-my-car",
  "/news",
  "/privacy-policy",
  "/search",
  "/terms",
];

/** Where the filesystem phase would find a pathname, or null. */
function fileFor(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const rel = clean === "/" ? "index" : clean.replace(/^\//, "");
  const file = path.join(DIST, `${rel}.html`);
  return existsSync(file) ? file : null;
}

/** Evaluate vercel.json `routes` the way Vercel does for host carvibes.dev. */
function simulate(pathname) {
  for (const route of routes) {
    // Host-gated routes never match the canonical domain.
    if (route.has) {
      const hosts = route.has.filter((c) => c.type === "host").map((c) => c.value);
      if (hosts.length && !hosts.includes(HOST)) continue;
    }

    // Filesystem phase.
    if (route.handle === "filesystem") {
      if (fileFor(pathname)) return { status: 200, file: fileFor(pathname) };
      continue;
    }
    // Other phases (error, hit, miss, …) do not redirect.
    if (route.handle) continue;
    if (!route.src) continue;

    let re;
    try {
      re = new RegExp(route.src);
    } catch {
      continue;
    }
    if (!re.test(pathname)) continue;

    const match = pathname.match(re);
    const sub = (value) => value.replace(/\$(\d)/g, (_, i) => match?.[Number(i)] ?? "");

    if (route.dest) {
      const dest = sub(route.dest);
      // `check: true` falls through when the rewrite target does not exist.
      if (route.check && !fileFor(dest)) continue;
      return { status: route.status ?? 200, file: fileFor(dest), location: dest };
    }
    if (route.headers?.Location) {
      return { status: route.status, location: sub(route.headers.Location) };
    }
    if (route.status) return { status: route.status };
    if (route.continue) continue;
  }
  return { status: 404 };
}

/** Follow the one redirect a legacy URL is allowed, then require 200. */
function resolve(url) {
  const first = simulate(url);
  if (first.status !== 301 && first.status !== 308) return { first, final: first, hops: 0 };
  if (!first.location) return { first, final: { status: 0 }, hops: 1 };
  const target = new URL(first.location, `https://${HOST}`);
  const second = simulate(target.pathname);
  return { first, final: second, hops: 1, target: first.location };
}

const problems = [];
let checked = 0;

function expect(file, url, { redirect }) {
  checked += 1;
  const { first, final, target } = resolve(url);

  if (first.status === 404) {
    problems.push(`${url}: 404 (${file}) — falls into the 404 catch-all`);
    return;
  }
  if (redirect) {
    if (first.status !== 301 && first.status !== 308) {
      problems.push(`${url}: expected 301/308, got ${first.status}`);
      return;
    }
    if (final.status !== 200) {
      problems.push(`${url}: 301 → ${target} ends in ${final.status}`);
      return;
    }
    if (final.file && !existsSync(final.file)) {
      problems.push(`${url}: 301 → ${target} has no prerendered page`);
    }
    return;
  }
  if (first.status !== 200) {
    problems.push(`${url}: expected 200, got ${first.status}`);
  } else if (!first.file) {
    problems.push(`${url}: 200 but no prerendered page on disk`);
  }
}

// ---------------------------------------------------------------
// v1 inventory
// ---------------------------------------------------------------
for (const slug of V1_CARS) expect("v1 car", `/cars/${slug}`, { redirect: true });
for (const slug of V1_BRANDS) expect("v1 brand", `/brands/${slug}`, { redirect: true });
for (const slug of V1_NEWS) expect("v1 news", `/news/${slug}`, { redirect: true });
for (const slug of V1_RANKINGS) expect("v1 ranking", `/rankings/${slug}`, { redirect: true });
expect("v1 ranking index", "/rankings", { redirect: true });
for (const url of V1_STATIC) expect("v1 static", url, { redirect: false });

// Trailing-slash variants must behave identically.
for (const url of ["/cars/audi-a3-2024/", "/brands/audi/", "/rankings/", "/rankings/fastest-cars/"]) {
  expect("trailing slash", url, { redirect: true });
}

// Optional legacy forms that v1 never published but that must not 404 either:
// unknown slugs under these trees are intentionally 404 (noindex), so only
// assert the catch-alls exist rather than inventing redirects.
const unknown = simulate("/cars/a-model-that-never-existed-1999");
if (unknown.status !== 404) {
  problems.push(`/cars/<unknown>: expected the documented 404, got ${unknown.status}`);
}

// ---------------------------------------------------------------
// report
// ---------------------------------------------------------------
if (problems.length) {
  console.error(`[verify-legacy] ${problems.length} problem(s) across ${checked} URLs:`);
  for (const p of problems.slice(0, 40)) console.error(`  - ${p}`);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  process.exit(1);
}

console.log(
  `[verify-legacy] OK — ${checked} legacy v1 URLs resolve ` +
    `(${V1_CARS.length} cars, ${V1_BRANDS.length} brands, ${V1_NEWS.length} news, ` +
    `${V1_RANKINGS.length} rankings, ${V1_STATIC.length} static pages).`
);
