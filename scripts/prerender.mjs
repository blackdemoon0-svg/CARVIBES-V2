// ============================================================
// CARVIBES — post-build static prerenderer
//
// Why this exists
// ---------------
// `vite build` produces ONE HTML shell (dist/index.html) plus shared,
// hashed JS/CSS chunks under dist/assets/. That single shell carries the
// homepage <title>, the homepage description, the homepage og:url and NO
// <link rel="canonical">. Every per-route value is written later, by
// JavaScript, from src/lib/seo.ts.
//
// Google indexes in two waves. The first wave reads the raw HTML; the
// second wave (rendering) can be delayed by days or weeks. Until that
// second wave lands, all 542 URLs look byte-for-byte identical to the
// crawler, which is the textbook trigger for "Duplicate, Google chose a
// different canonical" and "Crawled - currently not indexed".
//
// This script fixes that at the source: after the Vite build it stamps
// out one real HTML file per route, with the correct <title>,
// description, canonical, Open Graph, JSON-LD and a crawlable content
// block — all present in the RAW HTML, no JavaScript required.
//
// The React app still boots and takes over exactly as before; the
// prerendered markup inside #root is hidden behind the boot splash
// until React commits, then simply replaced (see src/lib/boot.ts), and
// src/lib/seo.ts rewrites the same head values to the same strings.
// Every stamped page keeps referencing the same shared /assets/*
// chunks — the shell is ~15 KB, the bundles download once and are
// cached immutably (see vercel.json).
//
// Runs automatically as part of `npm run build`.
// ============================================================

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SEO_TS = path.join(ROOT, "src", "lib", "seo.ts");

// ------------------------------------------------------------
// 1. Canonical domain — same single source of truth as the sitemap
// ------------------------------------------------------------
function resolveSiteUrl() {
  const fromEnv = process.env.SITE_URL?.trim();
  const raw =
    fromEnv ||
    readFileSync(SEO_TS, "utf8").match(
      /export\s+const\s+SITE_URL\s*=\s*["'`]([^"'`]+)["'`]/
    )?.[1];
  if (!raw) throw new Error(`Could not resolve SITE_URL (checked env + ${SEO_TS})`);
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error(`SITE_URL must be https: ${raw}`);
  return url.origin;
}

// ------------------------------------------------------------
// 2. Load the real car + story data (evaluated, never regex-scraped)
// ------------------------------------------------------------
async function loadData() {
  const outDir = mkdtempSync(path.join(tmpdir(), "carvibes-prerender-"));
  const entry = path.join(outDir, "entry.ts");
  const outfile = path.join(outDir, "data.mjs");

  writeFileSync(
    entry,
    [
      `import { cars } from ${JSON.stringify(path.join(ROOT, "src/lib/db.ts"))};`,
      `import { stories } from ${JSON.stringify(path.join(ROOT, "src/lib/stories.ts"))};`,
      `import { featuredStory } from ${JSON.stringify(path.join(ROOT, "src/lib/stories.ts"))};`,
      `import { QUESTIONS } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/data/index.ts"))};`,
      `import { QUIZZES } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/quizzes.ts"))};`,
      `import { QUIZ_CATEGORIES } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/data/categories.ts"))};`,
      `import { quizDicts } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/i18n.ts"))};`,
      `import { POINTS_PER_CORRECT } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/economy.ts"))};`,
      `import { USED_CATEGORIES, USED_CAR_ENTRIES, usedCarsForCategory } from ${JSON.stringify(path.join(ROOT, "src/lib/usedCars.ts"))};`,
      `import { carTitle, carMetaDescription, carOverviewText, carFaq, carAltText, carJsonLd, carCanonicalPath, categoryWords, engineBreakdown } from ${JSON.stringify(path.join(ROOT, "src/lib/carSeo.ts"))};`,
      `import { battleScore } from ${JSON.stringify(path.join(ROOT, "src/lib/compare.ts"))};`,
      `import { HERO_WEBP_SRCSET, HERO_JPEG_SRCSET, HERO_SIZES, HERO_FALLBACK_SRC, HERO_PORTRAIT_WEBP_SRCSET, HERO_PORTRAIT_JPEG_SRCSET, HERO_PORTRAIT_MEDIA, COVER_SIZES, COVER_PORTRAIT_MEDIA, FEATURED_COVER_SIZES, featuredCoverWebpSrcset, featuredCoverJpegSrcset, coverHeroSrc, coverHeroJpegSrcset, coverHeroWebpSrcset, coverHeroPortraitJpegSrcset, coverHeroPortraitWebpSrcset, coverHeroOptimizable, pexelsResize, pexelsWebp } from ${JSON.stringify(path.join(ROOT, "src/lib/images.ts"))};`,
      `export { cars, stories, featuredStory, QUESTIONS, QUIZZES, QUIZ_CATEGORIES, quizDicts, POINTS_PER_CORRECT, USED_CATEGORIES, USED_CAR_ENTRIES, usedCarsForCategory, carTitle, carMetaDescription, carOverviewText, carFaq, carAltText, carJsonLd, carCanonicalPath, categoryWords, engineBreakdown, battleScore, HERO_WEBP_SRCSET, HERO_JPEG_SRCSET, HERO_SIZES, HERO_FALLBACK_SRC, HERO_PORTRAIT_WEBP_SRCSET, HERO_PORTRAIT_JPEG_SRCSET, HERO_PORTRAIT_MEDIA, COVER_SIZES, COVER_PORTRAIT_MEDIA, coverHeroSrc, coverHeroJpegSrcset, coverHeroWebpSrcset, coverHeroPortraitJpegSrcset, coverHeroPortraitWebpSrcset, coverHeroOptimizable, FEATURED_COVER_SIZES, featuredCoverWebpSrcset, featuredCoverJpegSrcset, pexelsResize, pexelsWebp };`,
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
    // Shared cover-hero maths — the SAME functions the runtime components
    // use, so every prerendered preload / splash URL matches the hydrated
    // <picture> byte-for-byte (one network fetch, never two).
    const images = {
      heroWebpSrcset: mod.HERO_WEBP_SRCSET,
      heroJpegSrcset: mod.HERO_JPEG_SRCSET,
      heroSizes: mod.HERO_SIZES,
      heroFallbackSrc: mod.HERO_FALLBACK_SRC,
      heroPortraitWebp: mod.HERO_PORTRAIT_WEBP_SRCSET,
      heroPortraitJpeg: mod.HERO_PORTRAIT_JPEG_SRCSET,
      heroPortraitMedia: mod.HERO_PORTRAIT_MEDIA,
      coverSizes: mod.COVER_SIZES,
      featuredSizes: mod.FEATURED_COVER_SIZES,
      /** The /news featured banner — the SAME srcset/sizes StoriesSection
       *  renders, so the preloaded bytes are the bytes the app paints. */
      featured(url) {
        if (!mod.coverHeroOptimizable(url)) return null;
        return {
          fallback: mod.pexelsResize(url, 1280, 880),
          webp: mod.featuredCoverWebpSrcset(url),
          jpeg: mod.featuredCoverJpegSrcset(url),
          sizes: mod.FEATURED_COVER_SIZES,
        };
      },
      coverOptimizable: mod.coverHeroOptimizable,
      cover(url) {
        if (!mod.coverHeroOptimizable(url)) {
          return { src: url, jpeg: "", webp: "", sizes: undefined, optimizable: false };
        }
        return {
          src: mod.coverHeroSrc(url),
          jpeg: mod.coverHeroJpegSrcset(url),
          webp: mod.coverHeroWebpSrcset(url),
          portraitJpeg: mod.coverHeroPortraitJpegSrcset(url),
          portraitWebp: mod.coverHeroPortraitWebpSrcset(url),
          portraitMedia: mod.COVER_PORTRAIT_MEDIA,
          sizes: mod.COVER_SIZES,
          optimizable: true,
        };
      },
      /** <picture> markup painted inside the boot splash for one cover URL. */
      splashPicture(url, { sizes, portraitWebp, portraitJpeg, portraitMedia } = {}) {
        if (!mod.coverHeroOptimizable(url)) return "";
        const src = mod.coverHeroSrc(url);
        const jpeg = mod.coverHeroJpegSrcset(url);
        const webp = mod.coverHeroWebpSrcset(url);
        const s = sizes || mod.COVER_SIZES;
        const portrait =
          portraitMedia && portraitWebp
            ? (
                `<source media="${esc(portraitMedia)}" type="image/webp" srcset="${esc(portraitWebp)}" sizes="${esc(s)}">` +
                (portraitJpeg ? `<source media="${esc(portraitMedia)}" srcset="${esc(portraitJpeg)}" sizes="${esc(s)}">` : "")
              )
            : "";
        return (
          `<picture>${portrait}` +
          `<source type="image/webp" srcset="${esc(webp)}" sizes="${esc(s)}">` +
          `<img src="${esc(src)}" srcset="${esc(jpeg)}" sizes="${esc(s)}" alt="" ` +
          `fetchpriority="high" decoding="async" ` +
          `onerror="this.onerror=null;var w=this.closest('.boot-hero');if(w)w.style.display='none'"></picture>`
        );
      },
      /** Preload payload for one cover: media-complementary pair so every
       *  viewport preloads exactly the srcset its <picture> will select. */
      preload(url, { sizes, portraitWebp, portraitMedia, landscapeMedia } = {}) {
        if (!mod.coverHeroOptimizable(url)) return [];
        const s = sizes || mod.COVER_SIZES;
        const out = [];
        if (portraitMedia && portraitWebp) {
          out.push({ srcset: portraitWebp, sizes: s, media: portraitMedia });
        }
        out.push({
          srcset: mod.coverHeroWebpSrcset(url),
          sizes: s,
          // complementary media so portrait viewports never also fetch the
          // landscape candidate (and vice versa)
          media: landscapeMedia || (portraitMedia ? `(not (${portraitMedia}))` : undefined),
        });
        return out;
      },
    };
    return {
      cars: mod.cars,
      stories: mod.stories,
      featuredStory: mod.featuredStory,
      images,
      heroWebpSrcset: mod.HERO_WEBP_SRCSET,
      quiz: {
        questions: mod.QUESTIONS,
        quizzes: mod.QUIZZES,
        categories: mod.QUIZ_CATEGORIES,
        en: mod.quizDicts.en,
        points: mod.POINTS_PER_CORRECT,
      },
      used: {
        categories: mod.USED_CATEGORIES,
        entries: mod.USED_CAR_ENTRIES,
        forCategory: mod.usedCarsForCategory,
      },
      // Shared car-page builders (src/lib/carSeo.ts) + the deterministic
      // CarVibes score engine — the exact functions the runtime uses, so
      // prerendered HTML and post-hydration DOM can never disagree.
      seo: {
        carTitle: mod.carTitle,
        carMetaDescription: mod.carMetaDescription,
        carOverviewText: mod.carOverviewText,
        carFaq: mod.carFaq,
        carAltText: mod.carAltText,
        carJsonLd: mod.carJsonLd,
        carCanonicalPath: mod.carCanonicalPath,
        categoryWords: mod.categoryWords,
        engineBreakdown: mod.engineBreakdown,
        battleScore: mod.battleScore,
      },
    };
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

// ------------------------------------------------------------
// 3. Tiny HTML helpers
// ------------------------------------------------------------
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

// JSON-LD must not be able to break out of its <script> element.
const jsonLd = (obj) =>
  JSON.stringify(obj, null, 2).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

const clamp = (text, max = 300) => {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).replace(/[\s,.;:—-]+$/, "")}…`;
};

// ------------------------------------------------------------
// 4. Head rewriting
// ------------------------------------------------------------
// We operate on the built index.html rather than re-templating it, so
// the hashed asset references (module scripts, modulepreload, CSS) and
// everything else stay byte-identical.
function renderHead(html, page) {
  let out = html;

  const setTitle = (title) =>
    (out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`));

  const setMeta = (attr, key, content) => {
    const re = new RegExp(`<meta\\s+${attr}="${key}"[\\s\\S]*?\\/?>`, "i");
    const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`;
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n  </head>`);
  };

  setTitle(page.title);
  setMeta("name", "description", page.description);
  setMeta("property", "og:title", page.title);
  setMeta("property", "og:description", page.description);
  setMeta("property", "og:url", page.url);
  setMeta("property", "og:image", page.image);
  setMeta("property", "og:type", page.type);
  setMeta("name", "twitter:title", page.title);
  setMeta("name", "twitter:description", page.description);
  setMeta("name", "twitter:image", page.image);

  // The canonical every route was missing in the raw HTML. It is
  // self-referencing and matches what setCanonical() writes at runtime,
  // so Google's raw pass and its render pass can never disagree.
  // 404 shells set noCanonical: a not-found page must not point at any
  // other URL (not even the homepage) — runtime usePageMeta() removes
  // the element for the same reason.
  if (!page.noCanonical) {
    out = out.replace(
      "</head>",
      `    <link rel="canonical" href="${esc(page.url)}" />\n  </head>`
    );
  }

  // LCP image discovery (Performance audit “Optimize LCP request
  // discovery”): preload the page's Largest Contentful Paint candidate
  // in the FIRST bytes of the document, with the exact srcset/sizes the
  // hydrated <picture> will use (see lib/images cover helpers), so the
  // browser fetches it while the HTML parses — not after the bundle
  // downloaded, parsed and rendered. Homepage, /car/:id and /story/:id
  // all qualify; other routes have no image LCP and get nothing.
  if (page.preload?.length) {
    const links = page.preload
      .map(
        (p) =>
          `    <link rel="preload" as="image" type="image/webp"${p.media ? ` media="${esc(p.media)}"` : ""} imagesrcset="${esc(p.srcset)}" imagesizes="${esc(p.sizes)}" fetchpriority="high" />`
      )
      .join("\n");
    // Queued ahead of the font preload (index.html marker) so the LCP
    // image is the first fetch after the document on throttled pipes.
    if (out.includes("<!--cv-preload-images-->"))
      out = out.replace("<!--cv-preload-images-->", links);
    else out = out.replace("</head>", `${links}\n  </head>`);
  }

  // Route-specific modulepreload: a direct landing on /car/:id used to
  // waterfall entry → lazy route chunk → data chunk. Declaring the page's
  // own chunks here fetches them in parallel with the entry — identical
  // bytes, one full RTT less before the interactive app replaces the
  // splash. (Vite already preloads the entry's static imports.)
  if (page.preloadChunks?.length) {
    const links = page.preloadChunks
      .map((f) => `    <link rel="modulepreload" crossorigin href="/${f}" />`)
      .join("\n");
    if (out.includes("<!--cv-preload-modules-->"))
      out = out.replace("<!--cv-preload-modules-->", links);
    else out = out.replace("</head>", `${links}\n  </head>`);
  }

  if (page.noindex) {
    out = out.replace(
      "</head>",
      `    <meta name="robots" content="noindex, follow" />\n  </head>`
    );
  }

  if (page.schema) {
    // Car-page schema gets a stable id + data-owner so the runtime
    // usePageMeta() hook can update it in place on client-side car
    // switches (and so hydration never duplicates the script block).
    const attrs =
      page.schemaOwner === "car"
        ? ' id="carvibes-jsonld" data-owner="car"'
        : page.schemaOwner === "marketplace"
          ? ' id="marketplace-jsonld" data-owner="marketplace"'
          : ' data-owner="static"';
    out = out.replace(
      "</head>",
      `    <script type="application/ld+json"${attrs}>\n${jsonLd(page.schema)}\n    </script>\n  </head>`
    );
  }

  return out;
}

// ------------------------------------------------------------
// 5. Crawlable body content
// ------------------------------------------------------------
// React replaces this once it commits (it stays hidden behind the boot
// splash until then, so visitors never see a static -> loader -> app
// flash). Its only job is to give the first-wave crawler real text and
// real <a href> links to follow, so discovery does not depend on
// JavaScript execution.
function renderBody(html, content) {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`
  );
}

// Paint the page's LCP image inside the static boot splash. The splash is
// a fixed overlay that shows from the first paint; giving it the SAME
// cover the Hero / CarDetail / StoryDetail will render (same URLs, same
// srcset + sizes, fetchpriority=high) means the Largest Contentful Paint
// element is painted before ANY JavaScript runs — module download,
// parsing and hydration no longer sit in front of the LCP. When React
// commits, the splash is removed and the identical image underneath is
// revealed from the exact same network/decode cache entries: zero extra
// bytes, zero visible change.
function renderSplash(html, page) {
  if (!page.bootHero) return html;
  return html.replace(
    '<div class="boot-hero" data-boot-hero></div>',
    `<div class="boot-hero">${page.bootHero}</div>`
  );
}

function linkList(items, heading) {
  if (!items.length) return "";
  return (
    `<nav aria-label="${esc(heading)}"><h2>${esc(heading)}</h2><ul>` +
    items.map((i) => `<li><a href="${esc(i.href)}">${esc(i.label)}</a></li>`).join("") +
    `</ul></nav>`
  );
}

// ------------------------------------------------------------
// 6. Page definitions
// ------------------------------------------------------------
const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=630";

// Mirrors ROUTE_META in src/lib/seo.ts. `noindex` marks the routes that
// render purely from localStorage or from a user query — they are thin
// or empty for a crawler, and they are deliberately absent from the
// sitemap for the same reason.
const STATIC_PAGES = [
  {
    path: "/",
    title: "CarVibes — Discover. Feel. Drive.",
    description:
      "CarVibes is an automotive knowledge base: real cars, brands, categories, in-depth stories, rankings and compare tools — all searchable in one place.",
  },
  {
    path: "/explore",
    title: "Explore cars — CarVibes",
    description: "Browse and filter the CarVibes universe of cars.",
  },
  {
    path: "/used-cars",
    title: "Best Used Cars to Buy in 2026–2027 — Used Cars Guide | CarVibes",
    description:
      "Discover the best used cars to buy in 2026–2027, ranked by reliability, value, maintenance, fuel economy and performance. Most reliable used cars, budget picks, SUVs, sports cars, luxury, family, hybrids and EVs — each with a CarVibes Score.",
  },
  {
    path: "/news",
    title: "Stories — CarVibes",
    description: "Automotive stories, legends and hidden machines.",
  },
  {
    path: "/brands",
    title: "Brands — CarVibes",
    description: "Explore every brand in the CarVibes database.",
  },
  {
    path: "/find-my-car",
    title: "Find My Car — CarVibes",
    description: "Answer a few questions and match with your perfect car.",
  },
  {
    path: "/car-quiz",
    title: "Car Quiz – Automotive Trivia & Car Knowledge | CarVibes",
    description:
      "Play the free CarVibes car quiz: 160+ automotive trivia questions across 10 categories and 5 difficulty levels. Guess the car, test your car knowledge, compare performance figures and guess prices — earn points, unlock quizzes and level up.",
  },
  {
    path: "/contact",
    title: "Contact — CarVibes",
    description: "Get in touch with CarVibes.",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy — CarVibes",
    description: "How CarVibes handles your data.",
  },
  {
    path: "/terms",
    title: "Terms of Use — CarVibes",
    description: "Terms of use for CarVibes.",
  },
  {
    // MarketVibes — the public marketplace. Indexable, supply-driven: the
    // same strings the React page writes through useMarketplaceMeta()
    // (mk_meta_title / mk_meta_desc in src/lib/i18n/base/en.ts).
    path: "/marketplace",
    title: "Cars for sale — CarVibes MarketVibes",
    description:
      "Browse cars for sale from private sellers and dealers: prices, photos, mileage and direct contact. New and used cars by make, country and budget.",
  },
  {
    path: "/favorites",
    title: "Favorites — CarVibes",
    description: "Your saved cars and stories on CarVibes.",
    noindex: true,
  },
  {
    path: "/compare",
    title: "Compare cars — CarVibes",
    description: "Head-to-head car comparison and battle.",
    noindex: true,
  },
  {
    path: "/search",
    title: "Search — CarVibes",
    description: "Search cars and stories on CarVibes.",
    noindex: true,
  },
  {
    // Seller funnel — a form has no search value and must never compete
    // with the listings. Mirrors mk_sell_meta_* and useMarketplaceMeta().
    path: "/marketplace/sell",
    title: "Sell your car — CarVibes MarketVibes",
    description:
      "List your car for sale on CarVibes MarketVibes: photos, price, location and the contact method you prefer. Free submission, reviewed before publishing.",
    noindex: true,
  },
  {
    // Private moderation console. Nobody but an allow-listed administrator
    // can use it (enforced by the API, not by hiding it), and it is never
    // indexed, never in the sitemap, never linked from public pages.
    path: "/admin/marketplace",
    title: "Admin — CarVibes MarketVibes",
    description: "Private marketplace moderation dashboard.",
    noindex: true,
  },
];

function staticBody(routePath, { cars, stories, quiz, used }, market) {
  const topCars = cars.slice(0, 60).map((c) => ({
    href: `/car/${c.id}`,
    label: `${c.brand} ${c.model} (${c.year})`,
  }));
  const allStories = stories.map((s) => ({
    href: `/story/${s.id}`,
    label: s.title,
  }));
  const brands = Array.from(new Set(cars.map((c) => c.brand))).sort();

  switch (routePath) {
    case "/":
      return (
        `<h1>CarVibes — Discover. Feel. Drive.</h1>` +
        `<p>An automotive knowledge base of ${cars.length} real cars across ${brands.length} brands, plus ${stories.length} in-depth stories.</p>` +
        linkList(
          [
            { href: "/explore", label: "Explore cars" },
            { href: "/used-cars", label: "Best used cars to buy in 2026–2027" },
            { href: "/brands", label: "Brands" },
            { href: "/news", label: "Stories" },
            { href: "/find-my-car", label: "Find my car" },
          ],
          "Sections"
        ) +
        linkList(topCars, "Popular cars") +
        linkList(allStories.slice(0, 12), "Latest stories")
      );
    case "/explore":
      return (
        `<h1>Explore cars</h1><p>Browse and filter ${cars.length} cars in the CarVibes universe.</p>` +
        linkList(
          cars.map((c) => ({
            href: `/car/${c.id}`,
            label: `${c.brand} ${c.model} (${c.year})`,
          })),
          "All cars"
        )
      );
    case "/brands":
      return (
        `<h1>Brands</h1><p>Every brand in the CarVibes database.</p>` +
        `<ul>${brands.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` +
        linkList(topCars, "Featured models")
      );
    case "/news":
      return (
        `<h1>Stories</h1><p>Automotive stories, legends and hidden machines.</p>` +
        linkList(allStories, "All stories")
      );
    case "/car-quiz":
      return quizBody(routePath, { cars, stories: allStories, quiz });
    case "/used-cars":
      return usedCarsBody(used);
    case "/marketplace":
      return marketplaceIndexBody(market);
    case "/marketplace/sell":
      return marketplaceSellBody();
    case "/admin/marketplace":
      return (
        "<article><h1>Marketplace moderation</h1>" +
        "<p>Administrator sign-in required. Only allow-listed accounts can open this dashboard, and every " +
        "moderation action is verified by the server.</p>" +
        `<nav aria-label="Marketplace"><ul><li><a href="/marketplace">Back to the marketplace</a></li></ul></nav></article>`
      );
    default: {
      const page = STATIC_PAGES.find((p) => p.path === routePath);
      return `<h1>${esc(page.title.replace(/ — CarVibes$/, ""))}</h1><p>${esc(page.description)}</p>`;
    }
  }
}

// ------------------------------------------------------------
// 6a. Used Cars guide — static body + structured data
// Generated from src/lib/usedCars.ts so the crawlable HTML always
// mirrors what the React page renders.
// ------------------------------------------------------------
const usd = (n) => `$${Number(n).toLocaleString("en-US")}`;

function usedCarsBody(used) {
  const sections = used.categories
    .map((cat) => {
      const items = used
        .forCategory(cat.id)
        .map(
          (e) =>
            `<li><a href="/car/${esc(e.car.id)}">${esc(e.car.brand)} ${esc(e.car.model)}</a> ` +
            `(${esc(e.years)}) — est. ${usd(e.priceMin)}–${usd(e.priceMax)} used · ` +
            `Reliability ${e.reliability}/100 · Maintenance ${e.maintenance}/100 · ` +
            `Fuel economy ${esc(e.fuelLabel)} · Performance ${e.performance}/100 · ` +
            `CarVibes Score ${e.score}/100. ${esc(e.why)}</li>`
        )
        .join("");
      return `<section id="${esc(cat.id)}"><h2>${esc(cat.title)}</h2><p>${esc(cat.description)}</p><ol>${items}</ol></section>`;
    })
    .join("");

  return (
    `<article><h1>Best Used Cars to Buy in 2026–2027</h1>` +
    `<p>CarVibes helps you discover the best used cars based on reliability, value, performance, maintenance costs and fuel economy. ` +
    `Every pick below is scored 0–100 and linked to its full specification page.</p>` +
    `<p><em>Editorial guide: prices are CarVibes estimates for good-condition examples on the 2026–2027 used market, not live listings, and vary by mileage, region and trim. Scores are editorial ratings.</em></p>` +
    `<nav aria-label="Categories"><ul>` +
    used.categories.map((c) => `<li><a href="#${esc(c.id)}">${esc(c.title)}</a></li>`).join("") +
    `</ul></nav>` +
    sections +
    `<section><h2>How the CarVibes Score works</h2><p>The CarVibes used-car score blends reliability (30%), maintenance cost (20%), fuel economy (20%), performance (15%) and value for money (15%) into a single 0–100 figure. Prices are estimates for good-condition examples on the 2026–2027 used market and vary by mileage, region and trim.</p></section>` +
    `</article>` +
    linkList(
      [
        { href: "/explore", label: "Explore all cars" },
        { href: "/find-my-car", label: "Find my car" },
        { href: "/compare", label: "Compare cars" },
        { href: "/brands", label: "Brands" },
      ],
      "Continue browsing"
    )
  );
}

function usedCarsSchema(used, siteUrl) {
  const url = `${siteUrl}/used-cars`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: "Best Used Cars to Buy in 2026–2027",
        url,
        inLanguage: "en",
        description:
          "The best used cars to buy in 2026–2027, ranked by reliability, value, maintenance, fuel economy and performance.",
        isPartOf: { "@type": "WebSite", name: "CarVibes", url: `${siteUrl}/` },
        hasPart: used.categories.map((cat) => ({
          "@type": "ItemList",
          "@id": `${url}#${cat.id}`,
          name: cat.title,
          description: cat.description,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: used.forCategory(cat.id).length,
          itemListElement: used.forCategory(cat.id).map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${e.car.brand} ${e.car.model} (${e.years})`,
            url: `${siteUrl}/car/${e.car.id}`,
          })),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CarVibes", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Used Cars", item: url },
        ],
      },
    ],
  };
}

// ------------------------------------------------------------
// 6b. CarVibes Quiz — static body + structured data
// Everything below is generated from the real question bank, so the
// markup a crawler reads can never drift away from the game itself.
// ------------------------------------------------------------
const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
  insane: "Insane",
};

function quizBody(routePath, { cars, stories, quiz }) {
  const en = quiz.en;
  const total = quiz.questions.length;

  const categoryLis = quiz.categories
    .map(
      (c) =>
        `<li><strong>${esc(en[c.nameKey])}</strong> — ${esc(
          en[`${c.nameKey}_sub`]
        )}</li>`
    )
    .join("");

  const difficultyLis = Object.keys(quiz.points)
    .map(
      (d) =>
        `<li><strong>${esc(DIFFICULTY_LABEL[d] || d)}</strong> — ${esc(
          en[`diff_${d}_sub`]
        )} (+${quiz.points[d]} points per correct answer)</li>`
    )
    .join("");

  const quizLis = quiz.quizzes
    .slice(0, 12)
    .map(
      (q) =>
        `<li><strong>${esc(q.title.en)}</strong> — ${esc(q.blurb.en)} (${
          q.count
        } questions, ${esc(DIFFICULTY_LABEL[q.difficulty] || q.difficulty)}${
          q.premium ? ", premium unlock" : ", free"
        })</li>`
    )
    .join("");

  const faqKeys = Object.keys(en)
    .filter((k) => /^quiz_faq_\d+_q$/.test(k))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  const faqLis = faqKeys
    .map(
      (q) =>
        `<details><summary>${esc(en[q])}</summary><p>${esc(
          en[q.replace(/_q$/, "_a")]
        )}</p></details>`
    )
    .join("");

  const sampleQuestions = quiz.questions
    .slice(0, 5)
    .map(
      (q) =>
        `<li>${esc(q.prompt.en)} <em>Answer: ${esc(
          q.options[q.answer].en
        )}</em></li>`
    )
    .join("");

  const carLinks = cars.slice(0, 40).map((c) => ({
    href: `/car/${c.id}`,
    label: `${c.brand} ${c.model} (${c.year})`,
  }));

  return (
    `<h1>${esc(en.quiz_h1)}</h1>` +
    `<p>${esc(en.quiz_tagline)}</p>` +
    `<section><h2>${esc(en.quiz_seo_intro_h)}</h2>` +
    `<p>${esc(en.quiz_seo_intro_p1)}</p><p>${esc(en.quiz_seo_intro_p2)}</p></section>` +
    `<section><h2>${esc(en.quiz_seo_categories_h)}</h2><p>${esc(
      en.quiz_seo_categories_p
    )}</p><ul>${categoryLis}</ul></section>` +
    `<section><h2>${esc(en.quiz_seo_diff_h)}</h2><ul>${difficultyLis}</ul></section>` +
    `<section><h2>${esc(en.quiz_seo_featured_h)}</h2><p>${esc(
      en.quiz_seo_featured_p
    )}</p><ul>${quizLis}</ul></section>` +
    `<section><h2>${esc(en.quiz_seo_how_h)}</h2><ol>` +
    Object.keys(en)
      .filter((k) => /^quiz_seo_step\d+$/.test(k))
      .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
      .map((key) => {
        const n = key.match(/\d+/)[0];
        return `<li><strong>${esc(en[key])}</strong> — ${esc(en[`quiz_seo_step${n}_p`])}</li>`;
      })
      .join("") +
    `</ol></section>` +
    `<section><h2>Example car quiz questions</h2><ul>${sampleQuestions}</ul>` +
    `<p>${total} questions in the bank, drawn at random for every run.</p></section>` +
    `<section><h2>${esc(en.quiz_seo_faq_h)}</h2>${faqLis}</section>` +
    `<section><h2>${esc(en.quiz_seo_explore_h)}</h2><ul>` +
    [
      { href: "/explore", label: "Explore cars" },
      { href: "/find-my-car", label: "Find my car" },
      { href: "/compare", label: "Compare cars" },
      { href: "/brands", label: "Brands" },
      { href: "/news", label: "Stories" },
    ]
      .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
      .join("") +
    `</ul></section>` +
    linkList(stories.slice(0, 10), "Latest stories") +
    linkList(carLinks, "Cars featured in the quiz")
  );
}

function quizSchema(data, siteUrl) {
  const { quiz } = data;
  const en = quiz.en;
  const url = `${siteUrl}/car-quiz`;

  const sampleQuestions = quiz.questions.slice(0, 5).map((q) => ({
    "@type": "Question",
    name: q.prompt.en,
    acceptedAnswer: { "@type": "Answer", text: q.options[q.answer].en },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Quiz",
        "@id": `${url}#quiz`,
        name: "CarVibes Car Quiz — Automotive Trivia & Car Knowledge",
        description:
          "Free automotive trivia quiz with 160+ questions across 10 car categories and 5 difficulty levels. Guess the car, test your car knowledge, compare performance figures and guess prices.",
        url,
        inLanguage: "en",
        educationalUse: "practice",
        about: [{ "@type": "Thing", name: "Automobiles" }],
        numberOfItems: quiz.questions.length,
        hasPart: sampleQuestions,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: Object.keys(en)
          .filter((k) => /^quiz_faq_\d+_q$/.test(k))
          .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
          .map((q) => ({
            "@type": "Question",
            name: en[q],
            acceptedAnswer: { "@type": "Answer", text: en[q.replace(/_q$/, "_a")] },
          })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "CarVibes",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Car Quiz",
            item: url,
          },
        ],
      },
    ],
  };
}

// ---- Deterministic similar cars — mirrors src/lib/carUtils.ts recommendCars ----
function recommendCars(all, car, limit = 3) {
  const priceBand = (c) => Math.floor(c.price / 30000);
  const hpBand = (c) => Math.floor(c.hp / 100);
  return all
    .filter((c) => c.id !== car.id)
    .map((c) => {
      let score = 0;
      if (c.brand === car.brand) score += 4;
      score += c.categories.filter((x) => car.categories.includes(x)).length * 2;
      if (c.body === car.body) score += 2;
      if (priceBand(c) === priceBand(car)) score += 1;
      if (hpBand(c) === hpBand(car)) score += 1;
      return { car: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(a.car.hp - car.hp) - Math.abs(b.car.hp - car.hp))
    .slice(0, limit)
    .map((x) => x.car);
}

function carPage(car, siteUrl, data) {
  const seo = data.seo;
  const allCars = data.cars;
  const canonicalPath = seo.carCanonicalPath(car);
  const url = `${siteUrl}${canonicalPath}`;
  const name = `${car.brand} ${car.model}`;
  // First frame of the sheet's gallery — exactly what CarDetail.tsx
  // renders on landing (activeImage = 0). Same URL everywhere: preload,
  // splash <picture>, prerendered body <img>, hydrated <picture>.
  const heroUrl = Array.isArray(car.gallery) && car.gallery.length ? car.gallery[0] : car.image;
  const cover = data.images.cover(heroUrl);

  // Title / description / overview / FAQ / alt texts come from
  // src/lib/carSeo.ts — the exact same builders the runtime applies
  // after hydration, so both indexing passes agree.
  const title = seo.carTitle(car);
  const description = seo.carMetaDescription(car);
  const overview = seo.carOverviewText(car);
  const faq = seo.carFaq(car);
  const alt = seo.carAltText(car);

  const spec = (label, value) =>
    value === undefined || value === null || value === 0 || value === "N/A"
      ? ""
      : `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;

  const table = (rows) => `<table><tbody>${rows.join("")}</tbody></table>`;

  // ---- Engine group: the real engine string + its structured facts ----
  const { displacement, cylinders, aspiration } = seo.engineBreakdown(car.engine);
  const engineRows = [
    spec("Engine", car.engine && car.engine !== "N/A" ? car.engine : null),
    spec("Displacement", displacement),
    spec("Cylinders", cylinders),
    spec("Aspiration", aspiration),
    spec("Horsepower", car.hp ? `${car.hp} hp` : null),
    spec("Torque", car.torque ? `${car.torque} Nm` : null),
  ];

  // ---- Performance group: only values that exist ----
  const powerToWeight =
    car.weight && car.hp ? `${Math.round((car.hp / car.weight) * 1000)} hp/t` : null;
  const performanceRows = [
    spec("0–100 km/h", car.zeroToHundred ? `${car.zeroToHundred} s` : null),
    spec("Top speed", car.topSpeed ? `${car.topSpeed} km/h` : null),
    spec("Transmission", car.transmission),
    spec("Drivetrain", car.drivetrain),
    spec("Power-to-weight", powerToWeight),
  ];

  const dimensionsRows = [spec("Kerb weight", car.weight ? `${car.weight} kg` : null)];
  const efficiencyRows = [spec("Fuel", car.fuel)];
  const pricePerPower =
    car.price && car.hp
      ? `$${Math.round(car.price / car.hp).toLocaleString("en-US")} / hp`
      : null;
  const pricingRows = [
    spec("Retail price (approx. MSRP)", car.price ? `$${car.price.toLocaleString("en-US")}` : null),
    spec("Price per horsepower", pricePerPower),
  ];

  const group = (heading, rows) =>
    rows.some(Boolean) ? `<h3>${esc(heading)}</h3>${table(rows.filter(Boolean))}` : "";

  // ---- CarVibes Score: deterministic editorial rating from this page's
  // own data (never a manufacturer figure) — mirrors the runtime section.
  const score = seo.battleScore(car);
  const scoreBits = score.breakdown
    .map((b) => `${esc(b.label.replace(/_/g, " "))} ${Math.round(b.value)}/${b.max}`)
    .join(" · ");

  const faqHtml = faq.length
    ? `<section><h2>FAQ</h2>${faq
        .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
        .join("")}</section>`
    : "";

  // ---- Internal linking — same logic as runtime CarDetail.tsx ----
  const similar = recommendCars(allCars, car, 3);
  const sameBrand = allCars
    .filter((c) => c.brand === car.brand && c.id !== car.id && !similar.some((s) => s.id === c.id))
    .slice(0, 3);

  let comparePartner = null;
  if (similar.length > 0) comparePartner = similar[0];
  else if (sameBrand.length > 0) comparePartner = sameBrand[0];
  else {
    const primaryCat = car.categories[0];
    if (primaryCat) {
      comparePartner = allCars.find((c) => c.id !== car.id && c.categories.includes(primaryCat)) || null;
    }
    if (!comparePartner) comparePartner = allCars.find((c) => c.id !== car.id) || null;
  }

  const primaryCategory = car.categories[0] || "sports";
  const brandParam = encodeURIComponent(car.brand);
  const categoryParam = encodeURIComponent(primaryCategory);

  const similarLinks = similar.map((c) => ({
    href: `/car/${c.id}`,
    label: `${c.brand} ${c.model} (${c.year}) — similar to ${name}`,
  }));

  const brandLinks = sameBrand.map((c) => ({
    href: `/car/${c.id}`,
    label: `${c.brand} ${c.model} (${c.year}) — more ${car.brand}`,
  }));

  const exploreLinks = [
    { href: `/explore?brand=${brandParam}`, label: `Explore ${car.brand} cars — all ${car.brand} models` },
    { href: `/explore?category=${categoryParam}`, label: `Explore ${primaryCategory} cars — ${primaryCategory} category` },
    { href: "/brands", label: "All brands — browse 66 brands" },
    { href: "/explore", label: "Explore all cars — 509 cars" },
  ];

  const compareLinks = comparePartner
    ? [
        {
          href: `/compare?cars=${car.id},${comparePartner.id}`,
          label: `Compare ${name} vs ${comparePartner.brand} ${comparePartner.model} — head-to-head`,
        },
      ]
    : [];

  return {
    path: canonicalPath,
    file: path.join("car", `${car.id}.html`),
    title,
    description,
    url,
    image: car.image,
    type: "article",
    schemaOwner: "car",
    schema: seo.carJsonLd(car, siteUrl),
    // LCP discovery + splash paint for this exact cover (see renderHead).
    // Portrait viewports get the tall crop (splash is full-bleed; Chrome
    // skips upscaled images as LCP candidates); landscape gets the 5:3 set.
    preload: cover.optimizable
      ? data.images.preload(heroUrl, {
          portraitWebp: cover.portraitWebp,
          portraitMedia: cover.portraitMedia,
        })
      : [],
    bootHero: cover.optimizable
      ? data.images.splashPicture(heroUrl, {
          portraitWebp: cover.portraitWebp,
          portraitJpeg: cover.portraitJpeg,
          portraitMedia: cover.portraitMedia,
        })
      : "",
    body:
      `<article>` +
      // The H1 must be byte-identical to the hydrated one
      // (CarDetail.tsx renders `{car.brand} {car.model}` with no year —
      // the year stays in the meta line below the H1). Prerendered HTML
      // and post-hydration DOM must never disagree.
      `<h1>${esc(name)}</h1>` +
      (car.tagline ? `<p><em>“${esc(car.tagline)}”</em></p>` : "") +
      // Same URL set as the hydrated <picture> / preload / splash — one
      // cached image for the whole page, and the crawler still sees the
      // real cover with its descriptive alt text.
      (cover.optimizable
        ? `<img src="${esc(cover.src)}" srcset="${esc(cover.jpeg)}" sizes="${esc(cover.sizes)}" alt="${esc(alt)}" />`
        : `<img src="${esc(heroUrl)}" alt="${esc(alt)}" />`) +
      `<section><h2>Overview</h2><p>${esc(overview)}</p>` +
      (car.categories && car.categories.length
        ? `<p>CarVibes categories: ${esc(seo.categoryWords(car).join(", "))}.</p>`
        : "") +
      `</section>` +
      `<section><h2>Engine &amp; specifications</h2>` +
      group("Engine", engineRows) +
      group("Performance", performanceRows) +
      group("Dimensions", dimensionsRows) +
      group("Efficiency", efficiencyRows) +
      group("Pricing", pricingRows) +
      `</section>` +
      `<section><h2>CarVibes Score</h2>` +
      `<p>The CarVibes Score is a deterministic editorial rating derived from the specifications on this page — not a manufacturer figure.</p>` +
      `<p><strong>${score.total}/100</strong> — ${scoreBits}.</p></section>` +
      faqHtml +
      `<p><small>Specifications are indicative and may vary by market.</small></p>` +
      `</article>` +
      linkList(exploreLinks, "Explore more") +
      linkList(compareLinks, "Compare") +
      linkList(similarLinks, "Similar cars") +
      linkList(brandLinks, `More ${esc(car.brand)} cars`) +
      linkList(
        [
          { href: "/explore", label: "Explore all cars" },
          { href: "/brands", label: "All brands" },
          { href: "/used-cars", label: "Best used cars to buy" },
        ],
        "Continue browsing"
      ),
  };
}

function storyPage(story, siteUrl, data) {
  const url = `${siteUrl}/story/${story.id}`;
  const description = clamp(story.description);
  // Story covers render full-bleed (the reader hero spans the viewport),
  // so the srcset match uses 100vw — same sizes string in splash, preload
  // and the hydrated StoryImage <picture>.
  const cover = data.images.cover(story.image);

  // stories.ts uses { title, paragraphs: string[], quote? } — the old
  // code read ch.body/ch.text and produced empty sections for every
  // chapter. We render each paragraph correctly and surface quotes +
  // timeline so the prerendered HTML carries real indexable text.
  const chaptersHtml = Array.isArray(story.chapters)
    ? story.chapters
        .map((ch) => {
          const title = `<h2>${esc(ch.title ?? "")}</h2>`;
          // Prefer the canonical `paragraphs` field; keep a fallback for
          // any legacy shape so the build never silently emits blanks.
          const body = Array.isArray(ch.paragraphs) && ch.paragraphs.length
            ? ch.paragraphs.map((p) => `<p>${esc(clamp(p, 1200))}</p>`).join("")
            : `<p>${esc(clamp(ch.body ?? ch.text ?? "", 1200))}</p>`;
          const quote = ch.quote ? `<blockquote>${esc(ch.quote)}</blockquote>` : "";
          return `<section>${title}${body}${quote}</section>`;
        })
        .join("")
    : "";

  const timelineHtml =
    Array.isArray(story.timeline) && story.timeline.length
      ? `<section><h2>Timeline</h2><ul>` +
        story.timeline
          .map((e) => `<li><strong>${esc(e.year)}</strong> — ${esc(e.label)}: ${esc(e.detail)}</li>`)
          .join("") +
        `</ul></section>`
      : "";

  const metaLine =
    `<p>${esc(String(story.year))} · ${esc(story.brand)}` +
    (story.creator ? ` · ${esc(story.creator)}` : "") +
    ` · ${esc(String(story.readTime))} min</p>`;

  return {
    path: `/story/${story.id}`,
    file: path.join("story", `${story.id}.html`),
    title: `${story.title} — CarVibes`,
    description,
    url,
    image: story.image,
    type: "article",
    // LCP discovery + splash paint for the reader cover (full-bleed).
    preload: cover.optimizable
      ? data.images.preload(story.image, { sizes: "100vw", portraitWebp: cover.portraitWebp, portraitMedia: cover.portraitMedia })
      : [],
    bootHero: cover.optimizable
      ? data.images.splashPicture(story.image, {
          sizes: "100vw",
          portraitWebp: cover.portraitWebp,
          portraitJpeg: cover.portraitJpeg,
          portraitMedia: cover.portraitMedia,
        })
      : "",
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: clamp(story.title, 110),
      description,
      image: story.image,
      url,
      author: { "@type": "Organization", name: "CarVibes", url: siteUrl },
      publisher: { "@type": "Organization", name: "CarVibes", url: siteUrl },
      datePublished: String(story.year),
    },
    body:
      `<article><h1>${esc(story.title)}</h1>${metaLine}<p>${esc(description)}</p>` +
      chaptersHtml +
      timelineHtml +
      `</article>` +
      linkList([{ href: "/news", label: "All stories" }], "Continue reading"),
  };
}

// ------------------------------------------------------------
// 7. Run
// ------------------------------------------------------------
// ------------------------------------------------------------
// 7a. Per-route modulepreload plan (from the Vite manifest)
// ------------------------------------------------------------
// Map every prerendered route onto the lazy chunks it will import right
// after the entry runs (its own page chunk + shared data chunks). The
// closure subtracts what Vite already preloads for the entry so nothing
// is fetched twice, and routes without a manifest entry simply get no
// hints (the app still works — the hints are an optimisation).
function buildPreloadPlan(manifest) {
  if (!manifest) return () => [];
  const byFile = new Map();
  for (const m of Object.values(manifest)) if (m?.file) byFile.set(m.file, m);
  // Manifest file refs for shared chunks look like "_db-<hash>.js" (no
  // assets/ dir, leading underscore) while the real output is
  // "assets/db-<hash>.js". Normalise against the actual dist/ contents so
  // a hint can never 404 into the SPA fallback.
  const normalise = (f) => {
    if (!f || !f.endsWith(".js")) return null;
    const base = f.replace(/^\/+/, "").replace(/^assets\//, "").replace(/^_/, "");
    const cand = "assets/" + base;
    return existsSync(path.join(DIST, cand)) ? cand : null;
  };
  const collect = (files) => {
    const out = new Set();
    const stack = [...files];
    while (stack.length) {
      const f = stack.pop();
      if (out.has(f)) continue;
      out.add(f);
      const m = byFile.get(f);
      if (m) stack.push(...(m.imports || []));
    }
    return out;
  };
  const entryKey =
    Object.keys(manifest).find((k) => manifest[k]?.isEntry) || "src/main.tsx";
  const entryClosure = manifest[entryKey]
    ? collect([manifest[entryKey].file])
    : new Set();

  // `<link rel="modulepreload">` policy — two kinds of routes, two right
  // answers, because a hint is only free when it does not compete with the
  // thing the browser is waiting to paint:
  //
  //   * image-LCP routes (/, /car/:id, /story/:id) paint their LCP element
  //     from the FIRST bytes of HTML (the .boot-hero <picture> stamped by
  //     renderSplash below). Every extra hint there just steals the first
  //     ~200 KB of a 4G connection from that photo, so only the route's own
  //     chunk and the heavy shared datasets are hinted. Measured on the
  //     homepage: FCP 2 310 → 1 858 ms, LCP 2 611 → 2 168 ms, same bytes.
  //   * text-LCP routes (/explore, /news, /used-cars, /car-quiz, …) have no
  //     hero photo — their LCP candidate is painted by the app itself, so
  //     the entire module graph is on the critical path and hinting it in
  //     full removes two discovery round trips. They get every chunk.
  const forRoots = (roots, { minBytes = 0, rootsAlways = false } = {}) => {
    const rootFiles = new Set(roots.map((k) => manifest[k]?.file).filter(Boolean));
    const closure = new Set(rootFiles);
    for (const f of rootFiles) for (const dep of collect([f])) closure.add(dep);
    const out = [];
    for (const f of closure) {
      const keepRoot = rootsAlways && rootFiles.has(f);
      if (!keepRoot) {
        if (entryClosure.has(f)) continue;
        if (minBytes) {
          try {
            const sized = normalise(f);
            if (!sized || statSync(path.join(DIST, sized)).size < minBytes) continue;
          } catch {
            continue;
          }
        }
      }
      const n = normalise(f);
      if (n && !out.includes(n)) out.push(n);
    }
    return out;
  };

  // Chunks below this size are skipped for image-LCP routes: leaf helpers
  // (cards, buttons, image wrappers, utils) are a few KB each and are
  // discovered by the module graph the moment the route chunk runs.
  const IMAGE_LCP_MIN = 20 * 1024;

  const SHELL = ["src/pages/RoutePages.tsx"];
  const PLANS = {
    // Homepage sections mount one idle callback at a time (see
    // src/lib/progressive.ts), so nothing is hinted here: the entry chunk
    // plus the hero photo own the first 200 KB.
    "/": [],
    "/car": forRoots(["src/pages/CarDetailPage.tsx"], {
      minBytes: IMAGE_LCP_MIN,
      rootsAlways: true,
    }),
    "/story": forRoots(["src/pages/StoryDetailPage.tsx"], {
      minBytes: IMAGE_LCP_MIN,
      rootsAlways: true,
    }),
    "/car-quiz": forRoots([...SHELL, "src/components/quiz/QuizPage.tsx"]),
    "/used-cars": forRoots([...SHELL, "src/components/usedcars/UsedCarsPage.tsx"]),
    "/find-my-car": forRoots([...SHELL, "src/components/findmycar/FindMyCar.tsx"]),
    "/search": forRoots([...SHELL, "src/components/GlobalSearch.tsx"]),
    "/compare": forRoots([...SHELL, "src/components/compare/CompareModal.tsx"]),
    "/marketplace": forRoots([...SHELL, "src/pages/marketplace/MarketplacePage.tsx"]),
    "/marketplace/car": forRoots([...SHELL, "src/pages/marketplace/MarketplaceListingPage.tsx"]),
    "/marketplace/sell": forRoots([...SHELL, "src/components/marketplace/sell/SellWizard.tsx"]),
    "/admin/marketplace": forRoots([...SHELL, "src/pages/marketplace/AdminMarketplacePage.tsx"]),
    secondary: forRoots(SHELL),
  };
  const SECONDARY = new Set(["/explore", "/news", "/brands", "/favorites"]);
  return (routePath) => {
    if (routePath === "/") return PLANS["/"];
    if (routePath.startsWith("/car/")) return PLANS["/car"];
    if (routePath.startsWith("/marketplace/car/")) return PLANS["/marketplace/car"];
    if (routePath.startsWith("/marketplace/sell")) return PLANS["/marketplace/sell"];
    if (routePath.startsWith("/admin/")) return PLANS["/admin/marketplace"];
    if (routePath.startsWith("/marketplace")) return PLANS["/marketplace"];
    if (routePath.startsWith("/story/")) return PLANS["/story"];
    if (PLANS[routePath]) return PLANS[routePath];
    if (SECONDARY.has(routePath)) return PLANS.secondary;
    // Pure-text legal pages (contact/privacy/terms) and the 404 shell get
    // no hints at all: their chunk is tiny, and the RoutePages bundle
    // carries the car datasets that these pages never render.
    return [];
  };
}


// ------------------------------------------------------------
// 5c. MarketVibes — build-time marketplace data
// ------------------------------------------------------------
// Approved listings live in the marketplace store (data/marketplace/
// listings.json — the very file the API serves from), never in the app
// bundle. The build reads it through the SAME modules the API uses, so a
// prerendered listing page can never disagree with
// GET /api/marketplace/listings/<slug>: same title, same specs, same
// JSON-LD, same related cars.
//
// No store on disk (fresh clone, CI without data, seller data not
// deployed yet) simply means "no marketplace pages yet" — never a failed
// build. Pending and rejected listings are unreachable from here:
// publicListings() filters on APPROVED only.
async function loadMarketplace() {
  const importUrl = (rel) => pathToFileURL(path.join(ROOT, "server", "marketplace", rel)).href;
  try {
    const [store, view] = await Promise.all([import(importUrl("store.mjs")), import(importUrl("public-view.mjs"))]);
    const listings = await store.publicListings();
    const facets = view.facetPages(listings);
    return { store, view, listings, facets };
  } catch (error) {
    console.warn(
      `[prerender] marketplace store unavailable (${error.message}) — no listing pages prerendered`
    );
    return { store: null, view: null, listings: [], facets: [] };
  }
}

/** Related cars — mirrors the selection GET /listings/:slug performs. */
function marketplaceRelated(record, listings) {
  const others = listings.filter((l) => l.id !== record.id);
  return {
    similar: others
      .filter((l) => l.vehicle?.bodyType && l.vehicle?.bodyType === record.vehicle?.bodyType)
      .slice(0, 6),
    moreFromBrand: others.filter((l) => l.vehicle?.brand === record.vehicle?.brand).slice(0, 6),
    moreFromRegion: others.filter((l) => l.location?.country === record.location?.country).slice(0, 6),
  };
}

/** Real <a href> links for every listing — the crawl path into the detail pages. */
function marketplaceCards(items, view) {
  return (
    "<ul>" +
    items
      .map((l) => {
        const bits = [
          l.pricing?.price ? view.formatPrice(l.pricing.price, l.pricing.currency) : "",
          l.vehicle?.year ? String(l.vehicle.year) : "",
          l.vehicle?.condition === "new" ? "New" : "Used",
          [l.location?.city, l.location?.country].filter(Boolean).join(", "),
        ]
          .filter(Boolean)
          .join(" · ");
        return `<li><a href="${esc(view.listingPath(l))}">${esc(view.listingTitle(l))}</a> — ${esc(bits)}</li>`;
      })
      .join("") +
    "</ul>"
  );
}

/** The listing page's crawlable content: specs, gallery, description, links. */
function marketplaceListingBody(record, detail, market) {
  const view = market.view;
  const v = record.vehicle ?? {};
  const media = record.media ?? [];
  const location = [record.location?.city, record.location?.region, record.location?.country]
    .filter(Boolean)
    .join(", ");
  const specs = detail.specs
    .map((s) => `<tr><th scope="row">${esc(s.label)}</th><td>${esc(s.value)}</td></tr>`)
    .join("");
  const photos = media
    .map((m, index) => {
      const size = m.width && m.height ? ` width="${m.width}" height="${m.height}"` : "";
      return (
        `<img src="${esc(m.url)}" alt="${esc(
          index === 0 ? detail.title : `${detail.title} — photo ${index + 1}`
        )}"${index === 0 ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'}${size} />`
      );
    })
    .join("");
  const related = marketplaceRelated(record, market.listings);
  const heading = (text, items) => (items.length ? `<h2>${esc(text)}</h2>${marketplaceCards(items, view)}` : "");
  const brandPath = v.brand ? view.facetPath("brand", v.brand) : null;
  const countryPath = record.location?.country ? view.facetPath("country", record.location.country) : null;

  return (
    "<article>" +
    `<nav aria-label="Breadcrumb"><ol>` +
    `<li><a href="/marketplace">MarketVibes</a></li>` +
    (brandPath ? `<li><a href="${esc(brandPath)}">${esc(v.brand)}</a></li>` : "") +
    (countryPath ? `<li><a href="${esc(countryPath)}">${esc(record.location.country)}</a></li>` : "") +
    `<li aria-current="page">${esc(detail.title)}</li></ol></nav>` +
    `<h1>${v.year ? `${v.year} ` : ""}${esc(v.brand ?? "")} <span>${esc(v.model ?? "")}</span></h1>` +
    `<p><strong>${esc(detail.priceLabel)}</strong>${detail.negotiable ? " · Negotiable" : ""} · ${esc(
      detail.conditionLabel
    )}${v.year ? ` · ${v.year}` : ""}${detail.mileageLabel ? ` · ${esc(detail.mileageLabel)}` : ""}</p>` +
    `<p>For sale in ${esc(location || "—")} by a ${esc(detail.sellerTypeLabel.toLowerCase())}${
      detail.seller?.companyName ? ` — ${esc(detail.seller.companyName)}` : ""
    }.</p>` +
    (photos ? `<div>${photos}</div>` : "") +
    (specs ? `<h2>Specifications</h2><table><tbody>${specs}</tbody></table>` : "") +
    `<h2>Seller's description</h2><p>${esc(
      v.description || "The seller did not add a description."
    )}</p>` +
    `<h2>Contact the seller</h2><p><a href="${esc(detail.contact.href)}" rel="nofollow">${esc(
      detail.contact.cta
    )}</a> — the seller's contact details stay on the server and are only reached through that link.</p>` +
    `<p><em>CarVibes is not part of the transaction. Never pay a deposit before seeing the car.</em></p>` +
    heading("Similar cars", related.similar) +
    heading(v.brand ? `More cars from ${v.brand}` : "More cars from this brand", related.moreFromBrand) +
    heading(
      record.location?.country ? `More cars in ${record.location.country}` : "More cars in this region",
      related.moreFromRegion
    ) +
    `<nav aria-label="Marketplace"><ul>` +
    `<li><a href="/marketplace">Back to the marketplace</a></li>` +
    `<li><a href="/marketplace/sell">Sell your car</a></li>` +
    `<li><a href="/used-cars">Best used cars to buy</a></li>` +
    `</ul></nav>` +
    "</article>"
  );
}

/** Facet page (single filter, only when supply justifies it). */
function marketplaceFacetBody(facet, market) {
  const view = market.view;
  const items = market.listings.filter((l) => {
    if (facet.kind === "brand") return l.vehicle?.brand === facet.value;
    if (facet.kind === "country") return l.location?.country === facet.value;
    return l.vehicle?.condition === facet.value;
  });
  const h1 =
    facet.kind === "country"
      ? `Cars for sale in ${facet.value}`
      : facet.kind === "condition"
        ? `${facet.value === "new" ? "New" : "Used"} cars for sale`
        : `${facet.value} cars for sale`;
  const siblings = market.facets
    .filter((f) => f.kind === facet.kind && f.path !== facet.path)
    .slice(0, 12)
    .map((f) => ({ href: f.path, label: `${f.value} (${f.count})` }));

  return (
    "<article>" +
    `<nav aria-label="Breadcrumb"><ol><li><a href="/marketplace">MarketVibes</a></li>` +
    `<li aria-current="page">${esc(facet.value)}</li></ol></nav>` +
    `<h1>${esc(h1)}</h1>` +
    `<p>${esc(facet.description)}</p>` +
    marketplaceCards(items.slice(0, 48), view) +
    (siblings.length ? linkList(siblings, `More choices`) : "") +
    `<nav aria-label="Marketplace"><ul><li><a href="/marketplace">Back to the marketplace</a></li>` +
    `<li><a href="/marketplace/sell">Sell your car</a></li></ul></nav>` +
    "</article>"
  );
}

/** The marketplace landing page's crawlable content. */
function marketplaceIndexBody(market) {
  const view = market.view;
  // No listings at all — the marketplace is live and empty, exactly as it
  // ships. Same words as the React zero state (components/marketplace/
  // states.tsx), so the prerendered page and the hydrated one agree.
  if (!view || market.listings.length === 0) {
    return (
      "<article><h1>Find your next car.<span>Sell yours.</span></h1>" +
      "<h2>New feature — the CarVibes Marketplace has just launched!</h2>" +
      "<p>Discover the first listings and be among the first to publish your car.</p>" +
      "<h2>No cars listed yet</h2>" +
      "<p>Be the first to sell your car on MarketVibes. Every listing is reviewed by hand before it appears here.</p>" +
      `<nav aria-label="Marketplace"><ul><li><a href="/marketplace/sell">Sell your car</a></li>` +
      `<li><a href="/used-cars">Best used cars to buy in 2026–2027</a></li></ul></nav></article>`
    );
  }
  const groups = ["brand", "country", "condition"].map((kind) => {
    const pages = market.facets.filter((f) => f.kind === kind).slice(0, 16);
    const heading =
      kind === "brand" ? "Browse by make" : kind === "country" ? "Browse by country" : "Browse by condition";
    return pages.length ? linkList(pages.map((f) => ({ href: f.path, label: `${f.value} (${f.count})` })), heading) : "";
  });

  return (
    "<article>" +
    "<h1>Find your next car.<span>Sell yours.</span></h1>" +
    "<p>The CarVibes marketplace: cars listed for sale by private sellers and dealers. Filter by make, " +
    "country, condition and price, open a car for its full specification, photos and price, then contact " +
    `the seller directly. Every listing is reviewed before it goes live — ${market.listings.length} car${
      market.listings.length === 1 ? "" : "s"
    } listed right now.</p>` +
    groups.join("") +
    linkList(
      market.listings
        .slice(0, 24)
        .map((l) => ({
          href: view.listingPath(l),
          label: `${view.listingTitle(l)} — ${view.formatPrice(l.pricing?.price, l.pricing?.currency)}`,
        })),
      "Latest listings"
    ) +
    `<nav aria-label="Marketplace"><ul><li><a href="/marketplace/sell">Sell your car</a></li>` +
    `<li><a href="/used-cars">Best used cars to buy in 2026–2027</a></li></ul></nav>` +
    "</article>"
  );
}

/** The seller funnel: noindex, but still a real page with real links. */
function marketplaceSellBody() {
  return (
    "<article>" +
    "<h1>Sell your car on CarVibes MarketVibes</h1>" +
    "<p>List your car in a few minutes: vehicle, condition and price, location, photos and the contact method you " +
    "prefer. Submitting is free and every listing is reviewed by hand before it appears publicly — nothing is " +
    "published automatically.</p>" +
    "<h2>How it works</h2><ol>" +
    "<li>Fill in the vehicle, price and location.</li>" +
    "<li>Add a few photos — the first one becomes the main image.</li>" +
    "<li>Choose how buyers should reach you (WhatsApp, phone, Instagram or other).</li>" +
    "<li>Review everything and submit. The listing stays pending until an administrator approves it.</li>" +
    "</ol>" +
    "<p>Buyers contact you through a CarVibes link, so your phone number is never displayed as plain text.</p>" +
    `<nav aria-label="Marketplace"><ul><li><a href="/marketplace">Back to the marketplace</a></li></ul></nav>` +
    "</article>"
  );
}

/**
 * Approved listings + qualifying facet pages, as real prerendered routes.
 *
 * A listing page also embeds the exact payload the API serves at
 * GET /api/marketplace/listings/<slug> (id="mk-listing-bootstrap"). The
 * React page reads it during its first render, so the price, specs and the
 * gallery image are committed as soon as the bundle executes — the image
 * request no longer waits for a client-side fetch round trip. Background
 * revalidation still runs, so view counting and seller edits behave exactly
 * as on a client-side navigation.
 */
function marketplacePages(siteUrl, market) {
  if (!market.view) return [];
  const view = market.view;
  const pages = [];

  for (const record of market.listings) {
    const routePath = view.listingPath(record);
    const seo = view.buildListingSeo(record, siteUrl);
    const detail = view.toPublicDetail(record, [], [], [], { siteUrl });
    const payload = JSON.stringify({ ok: true, data: detail }).replace(/</g, "\\u003c");
    pages.push({
      path: routePath,
      file: `${routePath.replace(/^\//, "")}.html`,
      title: seo.title,
      description: seo.description,
      url: `${siteUrl}${routePath}`,
      image: seo.absoluteImage || DEFAULT_IMAGE,
      type: "website",
      schema: seo.jsonLd,
      schemaOwner: "marketplace",
      body:
        marketplaceListingBody(record, detail, market) +
        `<script type="application/json" id="mk-listing-bootstrap" data-slug="${esc(record.slug)}" ` +
        `data-public-id="${esc(record.publicId)}">${payload}</script>`,
    });
  }

  for (const facet of market.facets) {
    const listed = market.listings
      .filter((l) => {
        if (facet.kind === "brand") return l.vehicle?.brand === facet.value;
        if (facet.kind === "country") return l.location?.country === facet.value;
        return l.vehicle?.condition === facet.value;
      })
      .slice(0, 12);
    pages.push({
      path: facet.path,
      file: `${facet.path.replace(/^\//, "")}.html`,
      title: facet.title,
      description: facet.description,
      url: `${siteUrl}${facet.path}`,
      image: DEFAULT_IMAGE,
      type: "website",
      body: marketplaceFacetBody(facet, market),
      // Same shape the React page writes through useMarketplaceMeta():
      // an ItemList of the visible cars plus a BreadcrumbList.
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: listed.length,
          itemListElement: listed.map((l, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteUrl}${view.listingPath(l)}`,
            name: view.listingTitle(l),
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "MarketVibes", item: `${siteUrl}/marketplace` },
            { "@type": "ListItem", position: 2, name: facet.value, item: `${siteUrl}${facet.path}` },
          ],
        },
      ],
    });
  }

  return pages;
}

async function main() {
  const siteUrl = resolveSiteUrl();
  const shellRaw = readFileSync(path.join(DIST, "index.html"), "utf8");

  if (!shellRaw.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html has no empty <div id="root"></div> to prerender into.');
  }

  // The app stylesheet becomes NON-BLOCKING on prerendered pages.
  //
  // The first painted frame is the boot splash, which carries its own
  // inline styles (above) — the Tailwind bundle is only needed when React
  // takes over, a second or two later. Keeping the 94 KB stylesheet as a
  // blocking <link> therefore taxes every crawl-landing with an extra
  // render-blocking request for styles the splash does not need. Instead:
  //   * <link rel=preload as=style> starts the download immediately
  //     (parallel with the entry chunk, ~15 KB gzip);
  //   * the stylesheet itself loads via the media="print" swap trick, so
  //     it never blocks first paint;
  //   * <noscript> keeps the blocking link for JS-off crawlers, which
  //     still render the prerendered article as a user would;
  //   * the swap also flips a window flag and fires `cv-css-ready`, which
  //     src/lib/boot.ts waits for before revealing the app — revealing the
  //     prerendered body one frame before Tailwind's preflight (body
  //     margin:0, …) applies shifted every element on every page
  //     (CLS ≈ 0.026 in Lighthouse).
  let shell = shellRaw;
  const cssLink = shellRaw.match(
    /<link\s+rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/
  );
  if (cssLink) {
    const cssHref = cssLink[1];
    shell = shellRaw.replace(
      cssLink[0],
      `    <link rel="preload" as="style" href="${cssHref}" crossorigin />\n` +
        `    <link rel="stylesheet" href="${cssHref}" media="print" crossorigin data-cv-css onload="this.media='all';this.onload=null;window.__cvCss=1;window.dispatchEvent(new Event('cv-css-ready'))" />\n` +
        `    <noscript><link rel="stylesheet" href="${cssHref}" /></noscript>`
    );
    console.log(`[prerender] app stylesheet made non-blocking (${cssHref}) — splash paints without it`);
  }

  // The entry module script is an ENHANCEMENT on prerendered pages: the
  // first painted frame (boot splash + hero photo, and the full article
  // for JS-off crawlers) is pure HTML. A deferred `<script type="module">`
  // in <head> still joins Lighthouse's paint chain — measured FCP 2.11 s
  // for a page whose observed first paint is 94 ms — so it is loaded async:
  // React boots as soon as the chunk is there, and the reveal handshake
  // (src/lib/boot.ts) hands over the splash. Nothing waits for it before
  // the user can read the page.
  const entryScript = shell.match(/<script type="module"([^>]*)><\/script>/);
  if (entryScript && !/\basync\b/.test(entryScript[1])) {
    shell = shell.replace(
      entryScript[0],
      `<script type="module" async${entryScript[1]}></script>`
    );
    console.log("[prerender] entry module script loaded async (out of the paint-blocking chain)");
  }

  let manifest = null;
  for (const candidate of [
    path.join(DIST, ".vite", "manifest.json"),
    path.join(DIST, "manifest.json"),
  ]) {
    try {
      manifest = JSON.parse(readFileSync(candidate, "utf8"));
      break;
    } catch {
      /* manifest disabled / older build — skip the modulepreload hints */
    }
  }
  const preloadPlan = buildPreloadPlan(manifest);

  const data = await loadData();
  const market = await loadMarketplace();

  // Homepage LCP: the hero photo, painted inside the boot splash from the
  // first byte, preloaded with the very same srcset the <picture> in
  // Hero.tsx renders (shared constants in src/lib/images.ts).
  const HERO_LANDSCAPE_MEDIA = `(orientation: landscape), (min-width: 1280px)`;
  const homeHero = {
    preload: [
      { srcset: data.images.heroPortraitWebp, sizes: data.images.heroSizes, media: data.images.heroPortraitMedia },
      { srcset: data.images.heroWebpSrcset, sizes: data.images.heroSizes, media: HERO_LANDSCAPE_MEDIA },
    ],
    bootHero:
      `<picture><source media="${esc(data.images.heroPortraitMedia)}" type="image/webp" srcset="${esc(data.images.heroPortraitWebp)}" sizes="${esc(data.images.heroSizes)}">` +
      `<source media="${esc(data.images.heroPortraitMedia)}" srcset="${esc(data.images.heroPortraitJpeg)}" sizes="${esc(data.images.heroSizes)}">` +
      `<source type="image/webp" srcset="${esc(data.images.heroWebpSrcset)}" sizes="${esc(data.images.heroSizes)}">` +
      `<img src="${esc(data.images.heroFallbackSrc)}" srcset="${esc(data.images.heroJpegSrcset)}" sizes="${esc(data.images.heroSizes)}" alt="" ` +
      `fetchpriority="high" decoding="async" ` +
      `onerror="this.onerror=null;var w=this.closest('.boot-hero');if(w)w.style.display='none'"></picture>`,
  };

  // /news has no full-bleed hero photo, but its featured banner IS the LCP
  // element the moment the app mounts — so that exact candidate is preloaded
  // from the first bytes of the document. Without the hint the fetch only
  // starts when React renders (measured /news LCP 3.54 s on mobile, most of
  // it waiting for the banner itself).
  const featuredCover = data.featuredStory ? data.images.featured(data.featuredStory.image) : null;
  const newsHero = featuredCover
    ? { preload: [{ srcset: featuredCover.webp, sizes: featuredCover.sizes }] }
    : {};

  const pages = [
    ...STATIC_PAGES.map((p) => ({
      path: p.path,
      file: p.path === "/" ? "index.html" : `${p.path.replace(/^\//, "")}.html`,
      title: p.title,
      description: p.description,
      url: `${siteUrl}${p.path === "/" ? "/" : p.path}`,
      image: DEFAULT_IMAGE,
      type: "website",
      noindex: p.noindex,
      ...(p.path === "/" ? homeHero : {}),
      ...(p.path === "/news" ? newsHero : {}),
      body: staticBody(p.path, data, market),
      schema:
        p.path === "/car-quiz"
          ? quizSchema(data, siteUrl)
          : p.path === "/used-cars"
            ? usedCarsSchema(data.used, siteUrl)
            : undefined,
    })),
    ...data.cars.map((c) => carPage(c, siteUrl, data)),
    ...data.stories.map((s) => storyPage(s, siteUrl, data)),
    ...marketplacePages(siteUrl, market),
  ];

  // A 404 shell so unknown paths can answer with a real 404 status
  // instead of a soft 404 rendered by JavaScript.
  //
  // 404 rules (mirrored by usePageMeta() on the client side):
  //   - noindex
  //   - NO canonical (the old shell canonicalised to the homepage,
  //     which told Google a missing URL was a duplicate of "/")
  //   - one real H1, no homepage content
  pages.push({
    file: "404.html",
    title: "Page not found — CarVibes",
    description: "The page you are looking for does not exist.",
    url: `${siteUrl}/`,
    image: DEFAULT_IMAGE,
    type: "website",
    noindex: true,
    noCanonical: true,
    body: `<h1>Page not found</h1><p><a href="/">Back to CarVibes</a></p>`,
  });

  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.file)) throw new Error(`Duplicate output file: ${page.file}`);
    seen.add(page.file);

    if (manifest && !page.preloadChunks) {
      page.preloadChunks = preloadPlan(page.path || "");
    }

    const target = path.join(DIST, page.file);
    mkdirSync(path.dirname(target), { recursive: true });
    const html = renderSplash(renderBody(renderHead(shell, page), page.body), page);
    writeFileSync(target, html, "utf8");
  }

  console.log(
    `[prerender] ${pages.length} HTML files → dist/ ` +
      `(${STATIC_PAGES.length} static, ${data.cars.length} cars, ${data.stories.length} stories, ` +
      `${market.listings.length} marketplace listings, ${market.facets.length} facets, 1 x 404)`
  );
  console.log(`[prerender] canonical domain: ${siteUrl}`);
}

main().catch((error) => {
  console.error(`[prerender] ${error.message}`);
  process.exit(1);
});
