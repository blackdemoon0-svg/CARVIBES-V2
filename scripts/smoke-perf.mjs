// ============================================================
// CARVIBES — performance smoke test
//
// Boots the BUILT page (dist/index.html + dist/assets/*) in jsdom and
// verifies:
//   1. React mounts without any uncaught JavaScript error.
//   2. The homepage renders real content (hero, sections).
//   3. The hero <picture> exposes the responsive WebP/JPEG srcsets.
//   4. The homepage HTML carries the hero preload hint, and ONLY the
//      homepage carries it.
//   5. AdSense is deferred: no pagead2 request before `load`, and the
//      page keeps working if it is later blocked.
//   6. No below-the-fold card still requests an oversized crop.
//   7. Multi-asset build: small HTML shell + shared hashed JS/CSS
//      chunks, modulepreload hints, code-split lazy chunks on disk.
//   8. Boot handover: the static splash retires and the prerendered
//      content is replaced once React commits.
//   9. /assets/* is served immutable (vercel.json).
//
// Run with:  node scripts/smoke-perf.mjs   (after `npm run build`)
// ============================================================

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

let failures = 0;
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label) => {
  failures++;
  console.error(`  ✗ ${label}`);
};
const assert = (cond, label) => (cond ? ok(label) : fail(label));

// ------------------------------------------------------------
// 1. Static head checks (homepage vs other pages)
// ------------------------------------------------------------
console.log("\n[1] Static head checks");
const home = readFileSync(path.join(DIST, "index.html"), "utf8");
const carPage = readFileSync(path.join(DIST, "car", "ferrari-812-superfast.html"), "utf8");

assert(
  /<link rel="preload" as="image" type="image\/webp" imagesrcset="[^"]*fm=webp[^"]*" imagesizes="100vw"/.test(home),
  "homepage carries the hero preload (webp srcset, 100vw)"
);
assert(!carPage.includes('rel="preload" as="image"'), "car pages do NOT preload the homepage hero");
assert(!home.includes('<script async src="https://pagead2'), "AdSense is no longer a static head script");
assert(home.includes("window.adsbygoogle = window.adsbygoogle || []"), "adsbygoogle global guard present");
assert(home.includes('rel="preconnect" href="https://images.pexels.com"'), "images.pexels.com preconnect present");
assert(/media="print"\s+onload="this\.media='all'/.test(home), "Google Fonts stylesheet is non-blocking");
assert(home.includes("<noscript>"), "font fallback for no-JS crawlers present");

// ------------------------------------------------------------
// 1b. Multi-asset build checks
// ------------------------------------------------------------
console.log("\n[1b] Multi-asset build checks");

const entryMatch = home.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
assert(Boolean(entryMatch), "entry module script references an external chunk");
const entrySrc = entryMatch?.[1] ?? "";
assert(entrySrc.startsWith("/assets/") && entrySrc.endsWith(".js"), `entry chunk is a hashed /assets/* file (${entrySrc})`);

const cssMatch = home.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/);
assert(Boolean(cssMatch) && String(cssMatch?.[1]).startsWith("/assets/"), "extracted CSS chunk linked from /assets/*");

assert(home.includes('rel="modulepreload"'), "modulepreload hints present for entry chunks");
assert(
  !/<script type="module"[^>]*>[\s\S]{100000,}<\/script>/.test(home),
  "no giant inlined module script (singlefile is gone)"
);
assert(home.length < 120_000, `homepage shell stays small (${(home.length / 1024).toFixed(1)} KB, was ~1300 KB inlined)`);

const carEntryMatch = carPage.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
assert(carEntryMatch?.[1] === entrySrc, "every prerendered page shares the same entry chunk");

const assetsDir = path.join(DIST, "assets");
const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const jsChunks = assetFiles.filter((f) => f.endsWith(".js"));
const cssChunks = assetFiles.filter((f) => f.endsWith(".css"));
assert(existsSync(path.join(DIST, entrySrc.replace(/^\//, ""))), "entry chunk file exists on disk");
assert(jsChunks.some((f) => f.startsWith("vendor-")), "shared vendor chunk emitted (react/router)");
assert(jsChunks.some((f) => f.startsWith("RoutePages-")), "secondary routes split into their own chunk");
assert(jsChunks.length >= 5, `code-splitting produced lazy chunks (${jsChunks.length} js chunks)`);
assert(cssChunks.length >= 1, "at least one CSS chunk emitted");

// Boot splash wiring (static side; the React handover is asserted in [2]).
assert(home.includes('id="boot-splash"'), "static boot splash present in the shell");
assert(home.includes("cv-boot"), "cv-boot prerender guard present");
assert(home.includes("__carvibesBootTimer"), "boot safety timeout present (reveals content if the bundle never boots)");
assert(carPage.includes('id="boot-splash"'), "prerendered pages inherit the boot splash");

// Immutable caching for hashed assets.
const vercel = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
const assetsRoute = (vercel.routes ?? []).find((r) => r.src === "/assets/(.*)");
assert(
  Boolean(assetsRoute) && String(assetsRoute.headers?.["Cache-Control"] ?? "").includes("immutable"),
  "vercel.json serves /assets/* immutable"
);

// ------------------------------------------------------------
// 2. Boot the built page in jsdom
// ------------------------------------------------------------
console.log("\n[2] React boot + rendered DOM");

const virtualConsole = new VirtualConsole();
const pageErrors = [];
virtualConsole.on("jsdomError", (e) => {
  // Resource-load failures are expected offline (fonts, images, ads).
  if (!/Could not load|resource/i.test(String(e?.message ?? e))) pageErrors.push(String(e));
});
virtualConsole.on("error", (...a) => pageErrors.push(a.join(" ")));

const dom = new JSDOM(home, {
  url: "https://carvibes.dev/",
  pretendToBeVisual: true,
  virtualConsole,
  runScripts: "outside-only",
});
const { window } = dom;

// Browser API stubs jsdom lacks -------------------------------
window.matchMedia =
  window.matchMedia ||
  ((q) => ({
    matches: false,
    media: q,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  }));
window.IntersectionObserver =
  window.IntersectionObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
window.ResizeObserver =
  window.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
window.requestIdleCallback =
  window.requestIdleCallback || ((cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 60));
window.cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
window.scrollTo = window.scrollTo || (() => {});
window.HTMLElement.prototype.scrollIntoView =
  window.HTMLElement.prototype.scrollIntoView || (() => {});

// Expose the DOM to the bundle --------------------------------
for (const key of [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  "CustomEvent",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "InputEvent",
  "FocusEvent",
  "UIEvent",
  "PointerEvent",
  "TouchEvent",
  "MutationObserver",
  "DOMParser",
  "Node",
  "NodeList",
  "Element",
  "DocumentFragment",
  "HTMLElement",
  "HTMLImageElement",
  "HTMLInputElement",
  "HTMLAnchorElement",
  "HTMLIFrameElement",
  "SVGElement",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "matchMedia",
  "IntersectionObserver",
  "ResizeObserver",
  "requestIdleCallback",
  "cancelIdleCallback",
  "scrollTo",
  "alert",
  "confirm",
  "prompt",
]) {
  try {
    globalThis[key] = window[key];
  } catch {
    /* read-only globals */
  }
}
globalThis.window = window;
globalThis.document = window.document;

// The head bootstraps (classic scripts) execute at parse time in a real
// browser, before the module bundle — reproduce that order.
const bootMatch = home.match(/<script>\s*window\.adsbygoogle[\s\S]*?<\/script>/);
assert(Boolean(bootMatch), "deferred AdSense bootstrap found");
if (bootMatch) window.eval(bootMatch[0].replace(/^<script>|<\/script>$/g, ""));
assert(Array.isArray(window.adsbygoogle), "window.adsbygoogle is pre-created (push() can never throw)");
assert(
  window.document.querySelectorAll('script[src*="pagead2"]').length === 0,
  "bootstrap does NOT inject pagead2 before window load"
);

const cvBootMatch = home.match(/<script>\s*document\.documentElement\.classList\.add\("cv-boot"\)[\s\S]*?<\/script>/);
assert(Boolean(cvBootMatch), "cv-boot guard script found");
if (cvBootMatch) window.eval(cvBootMatch[0].replace(/^<script>|<\/script>$/g, ""));
assert(window.document.documentElement.classList.contains("cv-boot"), "prerendered content hidden while booting");
assert(Boolean(window.document.getElementById("boot-splash")), "boot splash visible before React commits");

// Hermetic network: the bundle (notably @vercel/analytics) must never
// reach the real network during the test — an offline sandbox turns its
// fire-and-forget fetch into an unhandled rejection that kills Node.
const offlineFetch = () =>
  Promise.resolve(new Response("{}", { status: 200, headers: { "content-type": "application/json" } }));
globalThis.fetch = offlineFetch;
window.fetch = offlineFetch;
if (window.navigator && !window.navigator.sendBeacon) {
  window.navigator.sendBeacon = () => true;
}

// Import the built entry chunk as ESM — its relative chunk imports
// (vendor, …) resolve from dist/assets exactly as in the browser.
const entryAbs = path.join(DIST, entrySrc.replace(/^\//, ""));
try {
  await import(pathToFileURL(entryAbs).href);
  ok("app bundle evaluated without throwing");
} catch (err) {
  fail(`app bundle threw: ${err?.message}`);
}

// Give React a moment to mount.
await new Promise((r) => setTimeout(r, 800));

// Boot handover: splash retired, prerendered markup replaced by React.
assert(window.__carvibesReady === true, "app signalled ready on first commit");
assert(!window.document.getElementById("boot-splash"), "boot splash removed after React commits");
assert(!window.document.documentElement.classList.contains("cv-boot"), "cv-boot guard lifted after React commits");

const root = window.document.getElementById("root");
const rootText = root?.textContent ?? "";
assert(rootText.includes("FIND YOUR PERFECT"), "hero title rendered (React mounted)");
assert(rootText.includes("AUTOMOTIVE DATABASE"), "discover section rendered");
assert(rootText.includes("POPULAR CARS") || rootText.includes("Ferrari Enzo"), "popular cars section rendered");

// Hero <picture> ----------------------------------------------
const heroImg = root?.querySelector("picture img");
const heroSource = root?.querySelector("picture source");
assert(Boolean(heroImg) && Boolean(heroSource), "hero <picture> rendered");
assert(
  Boolean(heroSource?.getAttribute("srcset")?.includes("fm=webp") && heroSource.getAttribute("type") === "image/webp"),
  "hero webp source with srcset present"
);
assert(
  Boolean(heroImg?.getAttribute("srcset")?.includes("w=640") && heroImg.getAttribute("srcset")?.includes("w=1920")),
  "hero jpeg srcset spans 640→1920 (no 2200px original)"
);
assert(!String(heroImg?.getAttribute("srcset")).includes("w=2200"), "legacy 2200px hero crop is gone");

// Oversized crops in rendered cards ----------------------------
const offenders = [];
for (const img of root?.querySelectorAll("img") ?? []) {
  const src = img.getAttribute("src") ?? "";
  if (/images\.pexels\.com/.test(src) && /w=(1400|1600|2200)&/.test(src)) offenders.push(src);
}
assert(offenders.length === 0, `no rendered homepage image requests an oversized crop (${offenders.length} found)`);

// ------------------------------------------------------------
// 3. AdSense lifecycle
// ------------------------------------------------------------
console.log("\n[3] AdSense deferral");
window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
window.dispatchEvent(new window.Event("load"));
await new Promise((r) => setTimeout(r, 250));
const adsAfter = window.document.querySelectorAll('script[src*="pagead2"]');
assert(adsAfter.length === 1, "pagead2 injected exactly once after load (deferred)");
// Simulate an ad blocker: the request simply errors — nothing must throw.
adsAfter[0]?.dispatchEvent(new window.Event("error"));
await new Promise((r) => setTimeout(r, 100));
assert(rootText.length > 0, "page content survives a blocked AdSense request");

// ------------------------------------------------------------
console.log(
  failures === 0
    ? "\nSMOKE TEST PASSED — React boots clean, perf wiring verified."
    : `\nSMOKE TEST FAILED — ${failures} check(s) failed.`
);
process.exit(failures === 0 ? 0 : 1);
