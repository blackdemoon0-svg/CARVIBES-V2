// ============================================================
// CARVIBES — IMAGE URL HELPERS
//
// All CarVibes imagery is served by images.pexels.com, which renders
// crops on the fly from URL parameters (w / h / fit=crop / fm=…).
//
// The car + story database stores one "canonical" image per entry
// (large enough for detail pages, og:image and JSON-LD). Everywhere a
// smaller rendering is displayed — cards, thumbnails, lists — we ask
// the CDN for a crop that matches the actual display size instead of
// downloading the 1400–1600 px original. This cuts the weight of
// below-the-fold grids dramatically on mobile connections without
// touching the database, the routes or the SEO metadata.
//
// These helpers are pure string functions: they are safe to run in the
// browser AND in the Node prerenderer (scripts/prerender.mjs).
// ============================================================

const PEXELS_HOST = "images.pexels.com";

/**
 * Return the same Pexels photo at a different crop size.
 * Non-Pexels URLs (or unparsable ones) are returned unchanged, so this
 * is always safe to call on any `image` field.
 */
export function pexelsResize(url: string, w: number, h: number): string {
  try {
    const u = new URL(url);
    if (u.hostname !== PEXELS_HOST) return url;
    u.searchParams.set("w", String(w));
    u.searchParams.set("h", String(h));
    if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Ask the Pexels CDN for the WebP encoding of a photo (`fm=webp`).
 * Only used inside a <picture> element that keeps a JPEG <img> fallback,
 * so even if the CDN ever refused the parameter the visible result is
 * unchanged — the browser simply decodes the fallback.
 */
export function pexelsWebp(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname !== PEXELS_HOST) return url;
    u.searchParams.set("fm", "webp");
    return u.toString();
  } catch {
    return url;
  }
}

// ------------------------------------------------------------
// Homepage hero
// ------------------------------------------------------------
// One photo, several honest sizes. The hero is full-viewport on every
// device, so `sizes="100vw"` is exact: a 390 px phone fetches the
// 640 px crop (~30 KB) instead of the legacy 2200 px original
// (~400+ KB) that was previously forced on everyone.
//
// NOTE: scripts/prerender.mjs imports HERO_WEBP_SRCSET and injects the
// matching <link rel="preload"> into the homepage HTML only — if the
// constants below change, the preload is regenerated automatically.
// ------------------------------------------------------------

const HERO_PHOTO =
  "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg";
const HERO_PARAMS = "auto=compress&cs=tinysrgb&fit=crop";

/** width/height pairs, from small phones to large desktops */
const HERO_STEPS: Array<[number, number]> = [
  [640, 400],
  [960, 600],
  [1280, 800],
  [1600, 1000],
  [1920, 1200],
];

const heroAt = (w: number, h: number) =>
  `${HERO_PHOTO}?${HERO_PARAMS}&w=${w}&h=${h}`;

/** JPEG srcset — the safe fallback target of the hero <img>. */
export const HERO_JPEG_SRCSET = HERO_STEPS.map(
  ([w, h]) => `${heroAt(w, h)} ${w}w`
).join(", ");

/** WebP srcset — preferred source of the hero <picture>. */
export const HERO_WEBP_SRCSET = HERO_STEPS.map(
  ([w, h]) => `${heroAt(w, h)}&fm=webp ${w}w`
).join(", ");

/** Exact sizes the hero occupies: full viewport width. */
export const HERO_SIZES = "100vw";

/**
 * Default src for the hero <img>: the 1280 px crop. Only fetched by
 * browsers that ignore srcset (effectively none) — every modern
 * browser picks a candidate from the sets above.
 */
export const HERO_FALLBACK_SRC = heroAt(1280, 800);
