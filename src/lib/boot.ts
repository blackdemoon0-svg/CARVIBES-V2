// ============================================================
// CARVIBES — boot splash handshake (index.html <-> React)
//
// index.html paints a static #boot-splash overlay from the very first
// paint and hides the prerendered #root content behind the `cv-boot`
// class (JS only — crawlers reading the raw HTML still see the full
// prerendered content). As soon as React commits its first render —
// even a Suspense fallback while a lazy chunk downloads — the app
// calls signalAppReady() to remove the splash and reveal the app.
//
// The reveal waits for two things, because revealing earlier is measurably
// worse than revealing later:
//
//   1. the APP stylesheet must be applied. On prerendered pages the
//      Tailwind bundle loads non-blocking (media="print" swap, see
//      scripts/prerender.mjs): revealing one frame before its preflight
//      reset lands shifts the whole document (CLS ≈ 0.026 on every page).
//      The flag/event pair below is stamped by that swap; 2.5 s guard for
//      exotic clients (jsdom) where no stylesheet event ever arrives.
//   2. the splash's hero <img> must have PAINTED. That image is the
//      page's Largest Contentful Paint candidate — the fastest possible
//      LCP for a cold visit, because it needs no JavaScript. But paint is
//      not decode: if React commits while the bytes are still being
//      decoded, the splash is torn down before the image ever paints, the
//      candidate is lost, and LCP silently degrades to whatever big block
//      mounts after hydration (2.5–3.4 s on mobile, measured). Waiting one
//      decoded+presented frame keeps the fast path deterministic.
//
// A 12 s inline-script timeout in index.html force-reveals the page if the
// module bundle never boots (blocked CDN, …), so visitors always end up on
// readable content instead of an eternal loader.
// ============================================================

export const BOOT_SPLASH_ID = "boot-splash";
export const BOOT_CLASS = "cv-boot";
/** Set by the prerendered async-stylesheet link once its media swaps. */
export const CSS_READY_FLAG = "__cvCss";
export const CSS_READY_EVENT = "cv-css-ready";
/** Never hold the reveal longer than this for the hero image. */
const HERO_PAINT_GUARD_MS = 600;

let revealed = false;

/** True when app styles are (or cannot be) applied. */
function cssApplied(): boolean {
  if (typeof document === "undefined") return true;
  const w = window as unknown as Record<string, unknown>;
  if (w[CSS_READY_FLAG]) return true;
  const link = document.querySelector<HTMLLinkElement>("link[data-cv-css]");
  if (!link) return true; // dev / any page loading CSS the classic way
  // Loaded but the inline onload has not run yet (race): apply it now.
  if (link.sheet) {
    link.media = "all";
    return true;
  }
  return false;
}

function onceOrTimeout(
  event: string,
  guardMs: number,
  done: () => void
): () => void {
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener(event, finish);
    window.clearTimeout(timer);
    done();
  };
  const timer = window.setTimeout(finish, guardMs);
  window.addEventListener(event, finish, { once: true });
  return finish;
}

/** Wait until the current frame has been presented (paint committed). */
function afterPaint(fn: () => void): void {
  const raf =
    typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (cb: () => void) => window.setTimeout(cb, 16);
  raf(() => raf(fn));
}

function whenCssReady(): Promise<void> {
  if (cssApplied()) return Promise.resolve();
  return new Promise((resolve) => {
    onceOrTimeout(CSS_READY_EVENT, 2500, () => {
      // Defensive: a stylesheet that errored still must not trap the user
      // behind the splash — flip the media so the (cached) bytes apply.
      const link = document.querySelector<HTMLLinkElement>("link[data-cv-css]");
      if (link?.sheet) link.media = "all";
      resolve();
    });
  });
}

/**
 * Wait for the webfonts *after* the stylesheet is applied (that is when the
 * @font-face rules exist), bounded by a short guard.
 *
 * The app's headings are Archivo and its body Inter, both loaded with
 * `font-display: swap`: revealing the app between "fallback painted" and
 * "webfont painted" makes every text line re-measure, which is exactly the
 * 26 px jump Lighthouse booked as CLS 0.0055 on /news. The fonts are tiny
 * and preloaded, so this normally settles in ~100 ms — before React even
 * commits — and visitors never see the intermediate layout. The guard is
 * deliberately short (150 ms): on a connection where the fonts are slow,
 * one line re-wrapping once costs less than holding the whole page.
 */
function whenFontsSettled(): Promise<void> {
  const fonts = typeof document !== "undefined" ? document.fonts : undefined;
  if (!fonts?.ready) return Promise.resolve();
  return Promise.race([
    fonts.ready.then(() => undefined, () => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, 150)),
  ]);
}

function whenHeroPainted(): Promise<void> {
  const img = document.querySelector<HTMLImageElement>(
    `#${BOOT_SPLASH_ID} .boot-hero img`
  );
  if (!img) return Promise.resolve(); // text-only route (legal pages, 404)
  const frame = () => new Promise<void>((resolve) => afterPaint(() => resolve()));
  if (img.complete && img.naturalWidth > 0) return frame();
  const decode =
    typeof img.decode === "function" ? img.decode().then(frame, frame) : null;
  // A stalled/blocked photo must not delay the app: reveal anyway after the
  // guard (the splash hides its own failure via the onerror hook).
  const guard = new Promise<void>((resolve) =>
    window.setTimeout(resolve, HERO_PAINT_GUARD_MS)
  );
  return Promise.race([decode ?? guard, guard]);
}

function reveal(): void {
  if (revealed || typeof document === "undefined") return;
  revealed = true;
  document.getElementById(BOOT_SPLASH_ID)?.remove();
  document.documentElement.classList.remove(BOOT_CLASS);
  const w = window as unknown as Record<string, unknown>;
  w.__carvibesReady = true;
  const timer = w.__carvibesBootTimer as
    | ReturnType<typeof setTimeout>
    | undefined;
  if (timer !== undefined) {
    clearTimeout(timer);
    w.__carvibesBootTimer = undefined;
  }
}

/**
 * Remove the static splash and reveal the React app, once the app is
 * styled and the hero image has been presented. Idempotent.
 */
export function signalAppReady(): void {
  if (typeof document === "undefined") return;
  void Promise.all([
    whenCssReady().then(whenFontsSettled),
    whenHeroPainted(),
  ]).then(reveal);
}
