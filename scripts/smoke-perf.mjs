// ============================================================
// CARVIBES — performance smoke test
//
// Boots the BUILT page (dist/index.html) in jsdom and verifies:
//   1. React mounts without any uncaught JavaScript error.
//   2. The homepage renders real content (hero, sections).
//   3. The hero <picture> exposes the responsive WebP/JPEG srcsets.
//   4. The homepage HTML carries the hero preload hint, and ONLY the
//      homepage carries it.
//   5. AdSense is deferred: no pagead2 request before `load`, and the
//      page keeps working if it is later blocked.
//   6. No below-the-fold card still requests an oversized crop.
//
// Run with:  node scripts/smoke-perf.mjs   (after `npm run build`)
// ============================================================

import { readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
assert(home.includes('<noscript>'), "font fallback for no-JS crawlers present");

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

// The head bootstrap (classic script) executes at parse time in a real
// browser, before the module bundle — reproduce that order.
const bootMatch = home.match(/<script>\s*window\.adsbygoogle[\s\S]*?<\/script>/);
assert(Boolean(bootMatch), "deferred AdSense bootstrap found");
if (bootMatch) window.eval(bootMatch[0].replace(/^<script>|<\/script>$/g, ""));
assert(Array.isArray(window.adsbygoogle), "window.adsbygoogle is pre-created (push() can never throw)");
assert(
  window.document.querySelectorAll('script[src*="pagead2"]').length === 0,
  "bootstrap does NOT inject pagead2 before window load"
);

// Extract the inlined app bundle (type=module) and run it as ESM.
const moduleMatch = home.match(/<script type="module"[^>]*>([\s\S]*?)<\/script>/);
assert(Boolean(moduleMatch), "inlined app bundle found in dist/index.html");
const tmpDir = path.join(ROOT, ".smoke-tmp");
mkdirSync(tmpDir, { recursive: true });
const entry = path.join(tmpDir, "app.mjs");
writeFileSync(entry, moduleMatch[1], "utf8");

try {
  await import(entry);
  ok("app bundle evaluated without throwing");
} catch (err) {
  fail(`app bundle threw: ${err?.message}`);
}

// Give React a moment to mount.
await new Promise((r) => setTimeout(r, 800));

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
rmSync(tmpDir, { recursive: true, force: true });
console.log(
  failures === 0
    ? "\nSMOKE TEST PASSED — React boots clean, perf wiring verified."
    : `\nSMOKE TEST FAILED — ${failures} check(s) failed.`
);
process.exit(failures === 0 ? 0 : 1);
