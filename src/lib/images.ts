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

// Portrait phones show the hero across the FULL viewport height (the
// section is 100svh with an object-cover <img>). A 16:9 candidate is
// shorter than the viewport, so the browser would upscale it vertically —
// and Chrome deliberately does not accept upscaled images as LCP
// candidates (LCP then falls back to text painted after hydration, i.e.
// seconds later). For portrait viewports we ask Pexels for a tall centre
// crop of the SAME photo: identical framing (object-cover already showed
// only this band), enough pixels to stay above the viewport, and the LCP
// is finally the hero photo itself — painted, in practice, from the
// boot-splash copy of it.
const HERO_PORTRAIT_STEPS: Array<[number, number]> = [
  [640, 1408],
  // The 768w rung exists for the DPR-1.75 class of phones (Moto G4 and
  // friends: 412 CSS px ⇒ 722 device px): without it the ladder jumps
  // 640 → 960 and the LCP image pays for ~1.4 MP it never paints. The
  // band needs 722×1225 device px — 768×1280 covers it, the 960 crop
  // overdelivers by 2×.
  [768, 1280],
  [960, 2112],
  [1280, 2816],
];

/** Media query selecting full-bleed portrait viewports (phones/tablets). */
export const HERO_PORTRAIT_MEDIA = "(orientation: portrait) and (max-width: 1279px)";

const heroPortraitAt = (w: number, h: number) =>
  `${HERO_PHOTO}?${HERO_PARAMS}&w=${w}&h=${h}`;

/** Portrait JPEG srcset (fallback source of the <picture>). */
export const HERO_PORTRAIT_JPEG_SRCSET = HERO_PORTRAIT_STEPS.map(
  ([w, h]) => `${heroPortraitAt(w, h)} ${w}w`
).join(", ");

/** Portrait WebP srcset (preferred <picture> source + matching preload). */
export const HERO_PORTRAIT_WEBP_SRCSET = HERO_PORTRAIT_STEPS.map(
  ([w, h]) => `${heroPortraitAt(w, h)}&fm=webp ${w}w`
).join(", ");

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

// ------------------------------------------------------------
// Car / story cover heroes (LCP elements of /car/:id + /story/:id)
// ------------------------------------------------------------
// The three consumers of these helpers MUST agree on byte-identical
// URLs or the browser downloads the cover twice:
//   1. scripts/prerender.mjs — injects <link rel=preload as=image> plus
//      the .boot-hero <picture> painted inside the static splash;
//   2. src/components/universe/CarDetail.tsx — the hydrated hero <picture>;
//   3. src/components/stories/StoryDetail.tsx — the story cover.
// A cover is displayed at full container width (max 1152 px) in a
// 16/9-cropped frame, so requests never exceed what is actually painted.

/** Display sizes of a cover hero: full-bleed until the content column caps. */
export const COVER_SIZES = "(min-width: 640px) 1152px, 100vw";

/** width/height pairs (16:9) asked from the CDN, small phone → 1152 px column. */
// Slightly taller than 16:9 on purpose: the /car/:id hero renders 4:3 on
// phones, so a 640×360 candidate would be upscaled by a few pixels and
// silently dropped as an LCP candidate (see HERO_PORTRAIT_STEPS above).
// 5:3 crops cover both the 4:3 mobile frame and the 16:9 desktop frame.
const COVER_STEPS: Array<[number, number]> = [
  [640, 400],
  [960, 600],
  [1280, 800],
];

// The story reader cover is full-bleed (90svh) like the homepage hero, so
// it gets the same tall portrait treatment.
const COVER_PORTRAIT_STEPS: Array<[number, number]> = [
  [640, 1408],
  [768, 1280], // see HERO_PORTRAIT_STEPS — DPR-1.75 phones must not pay for the 960 crop
  [960, 2112],
  [1280, 2816],
];

export const COVER_PORTRAIT_MEDIA = "(orientation: portrait)";

/**
 * <img> src for a cover hero: the largest honest crop. Browsers with
 * srcset pick a smaller candidate; this only matters as fallback.
 */
export function coverHeroSrc(url: string): string {
  return pexelsResize(url, COVER_STEPS[COVER_STEPS.length - 1][0], COVER_STEPS[COVER_STEPS.length - 1][1]);
}

function coverSrcset(url: string, webp: boolean, steps = COVER_STEPS): string {
  if (!/images\.pexels\.com/.test(url)) return "";
  return steps.map(([w, h]) => {
    let u = pexelsResize(url, w, h);
    if (webp) u = pexelsWebp(u);
    return `${u} ${w}w`;
  }).join(", ");
}

/** Portrait webp srcset for full-bleed covers (story pages). */
export function coverHeroPortraitWebpSrcset(url: string): string {
  return coverSrcset(url, true, COVER_PORTRAIT_STEPS);
}

/** Portrait jpeg srcset for full-bleed covers (story pages). */
export function coverHeroPortraitJpegSrcset(url: string): string {
  return coverSrcset(url, false, COVER_PORTRAIT_STEPS);
}

/** JPEG srcset — fallback source of the cover <picture>. Empty for non-Pexels URLs. */
export function coverHeroJpegSrcset(url: string): string {
  return coverSrcset(url, false);
}

/** WebP srcset — preferred source of the cover <picture> + preload. */
export function coverHeroWebpSrcset(url: string): string {
  return coverSrcset(url, true);
}

/** True when a URL can be turned into the srcset/preload pair above. */
export function coverHeroOptimizable(url: string | undefined): url is string {
  return Boolean(url && /images\.pexels\.com/.test(url));
}

// ------------------------------------------------------------
// Story / news imagery
// ------------------------------------------------------------
// The story library and the featured strip used to hard-code ONE crop
// (800×550 / 1280×880) for every viewport, so a 390 px phone downloaded
// the same bytes as a 27" display — and on /news that oversized photo IS
// the LCP element (measured 3.9 s mobile). These helpers expose the same
// Pexels photo as a real srcset with honest `sizes`, so each device
// downloads the crop it can actually show.
// ------------------------------------------------------------

/** 3–4 up card grid on desktop, half width on tablets, full width on phones. */
export const CARD_COVER_SIZES =
  "(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw";

const CARD_COVER_STEPS: Array<[number, number]> = [
  [400, 260],
  [640, 400],
  [960, 600],
];

/** Featured story banner: full-bleed up to the content column, then 1400 px. */
export const FEATURED_COVER_SIZES =
  "(min-width: 1280px) 1400px, (min-width: 640px) 100vw, 100vw";

const FEATURED_COVER_STEPS: Array<[number, number]> = [
  [640, 400],
  [960, 600],
  [1280, 800],
  [1600, 1000],
];

function stepsSrcset(url: string, webp: boolean, steps: Array<[number, number]>): string {
  if (!coverHeroOptimizable(url)) return "";
  return steps
    .map(([w, h]) => {
      let u = pexelsResize(url, w, h);
      if (webp) u = pexelsWebp(u);
      return `${u} ${w}w`;
    })
    .join(", ");
}

export function cardCoverWebpSrcset(url: string): string {
  return stepsSrcset(url, true, CARD_COVER_STEPS);
}

export function cardCoverJpegSrcset(url: string): string {
  return stepsSrcset(url, false, CARD_COVER_STEPS);
}

export function featuredCoverWebpSrcset(url: string): string {
  return stepsSrcset(url, true, FEATURED_COVER_STEPS);
}

export function featuredCoverJpegSrcset(url: string): string {
  return stepsSrcset(url, false, FEATURED_COVER_STEPS);
}
