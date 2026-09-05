// ============================================================
// CARVIBES — post-build static prerenderer
//
// Why this exists
// ---------------
// `vite build` produces exactly ONE HTML document (dist/index.html) that
// Vercel's SPA rewrite serves for all 542 routes. That single document
// carries the homepage <title>, the homepage description, the homepage
// og:url and NO <link rel="canonical">. Every per-route value is written
// later, by JavaScript, from src/lib/seo.ts.
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
// prerendered markup inside #root is simply replaced on hydration, and
// src/lib/seo.ts rewrites the same head values to the same strings.
//
// Runs automatically as part of `npm run build`.
// ============================================================

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
      `export { cars, stories };`,
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
    return { cars: mod.cars, stories: mod.stories };
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
// the inlined script/style bundle and everything else stay byte-identical.
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
  out = out.replace(
    "</head>",
    `    <link rel="canonical" href="${esc(page.url)}" />\n  </head>`
  );

  if (page.noindex) {
    out = out.replace(
      "</head>",
      `    <meta name="robots" content="noindex, follow" />\n  </head>`
    );
  }

  if (page.schema) {
    out = out.replace(
      "</head>",
      `    <script type="application/ld+json">\n${jsonLd(page.schema)}\n    </script>\n  </head>`
    );
  }

  return out;
}

// ------------------------------------------------------------
// 5. Crawlable body content
// ------------------------------------------------------------
// React replaces this on hydration. Its only job is to give the
// first-wave crawler real text and real <a href> links to follow, so
// discovery does not depend on JavaScript execution.
function renderBody(html, content) {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`
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
];

function staticBody(routePath, { cars, stories }) {
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
    default: {
      const page = STATIC_PAGES.find((p) => p.path === routePath);
      return `<h1>${esc(page.title.replace(/ — CarVibes$/, ""))}</h1><p>${esc(page.description)}</p>`;
    }
  }
}

function carPage(car, siteUrl) {
  const url = `${siteUrl}/car/${car.id}`;
  const name = `${car.brand} ${car.model}`;
  const description = clamp(
    car.overview ||
      car.tagline ||
      `${name} (${car.year}): ${car.engine}, ${car.hp} hp.`
  );

  const spec = (label, value) =>
    value === undefined || value === null || value === 0 || value === "N/A"
      ? ""
      : `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;

  return {
    file: path.join("car", `${car.id}.html`),
    title: `${name} (${car.year}) — CarVibes`,
    description,
    url,
    image: car.image,
    type: "article",
    schema: {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      name: `${name} ${car.year}`,
      brand: { "@type": "Brand", name: car.brand },
      model: car.model,
      vehicleModelDate: String(car.year),
      bodyType: car.body,
      fuelType: car.fuel,
      vehicleTransmission: car.transmission,
      ...(car.hp
        ? {
            vehicleEngine: {
              "@type": "EngineSpecification",
              name: car.engine,
              enginePower: { "@type": "QuantitativeValue", value: car.hp, unitCode: "BHP" },
            },
          }
        : {}),
      ...(car.topSpeed
        ? { speed: { "@type": "QuantitativeValue", value: car.topSpeed, unitCode: "KMH" } }
        : {}),
      image: car.image,
      url,
      description,
    },
    body:
      `<article><h1>${esc(name)} (${esc(car.year)})</h1>` +
      `<p>${esc(description)}</p>` +
      `<table><tbody>` +
      spec("Brand", car.brand) +
      spec("Model", car.model) +
      spec("Year", car.year) +
      spec("Body", car.body) +
      spec("Engine", car.engine) +
      spec("Fuel", car.fuel) +
      spec("Horsepower", car.hp ? `${car.hp} hp` : null) +
      spec("Torque", car.torque ? `${car.torque} Nm` : null) +
      spec("Transmission", car.transmission) +
      spec("Drivetrain", car.drivetrain) +
      spec("0–100 km/h", car.zeroToHundred ? `${car.zeroToHundred} s` : null) +
      spec("Top speed", car.topSpeed ? `${car.topSpeed} km/h` : null) +
      spec("Weight", car.weight ? `${car.weight} kg` : null) +
      `</tbody></table></article>` +
      linkList(
        [
          { href: "/explore", label: "Explore all cars" },
          { href: "/brands", label: "All brands" },
        ],
        "Continue browsing"
      ),
  };
}

function storyPage(story, siteUrl) {
  const url = `${siteUrl}/story/${story.id}`;
  const description = clamp(story.description);

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
    file: path.join("story", `${story.id}.html`),
    title: `${story.title} — CarVibes`,
    description,
    url,
    image: story.image,
    type: "article",
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
async function main() {
  const siteUrl = resolveSiteUrl();
  const shell = readFileSync(path.join(DIST, "index.html"), "utf8");

  if (!shell.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html has no empty <div id="root"></div> to prerender into.');
  }

  const data = await loadData();

  const pages = [
    ...STATIC_PAGES.map((p) => ({
      file: p.path === "/" ? "index.html" : `${p.path.replace(/^\//, "")}.html`,
      title: p.title,
      description: p.description,
      url: `${siteUrl}${p.path === "/" ? "/" : p.path}`,
      image: DEFAULT_IMAGE,
      type: "website",
      noindex: p.noindex,
      body: staticBody(p.path, data),
    })),
    ...data.cars.map((c) => carPage(c, siteUrl)),
    ...data.stories.map((s) => storyPage(s, siteUrl)),
  ];

  // A 404 shell so unknown paths can answer with a real 404 status
  // instead of a soft 404 rendered by JavaScript.
  pages.push({
    file: "404.html",
    title: "Page not found — CarVibes",
    description: "The page you are looking for does not exist.",
    url: `${siteUrl}/`,
    image: DEFAULT_IMAGE,
    type: "website",
    noindex: true,
    body: `<h1>Page not found</h1><p><a href="/">Back to CarVibes</a></p>`,
  });

  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.file)) throw new Error(`Duplicate output file: ${page.file}`);
    seen.add(page.file);

    const target = path.join(DIST, page.file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, renderBody(renderHead(shell, page), page.body), "utf8");
  }

  console.log(
    `[prerender] ${pages.length} HTML files → dist/ ` +
      `(${STATIC_PAGES.length} static, ${data.cars.length} cars, ${data.stories.length} stories, 1 x 404)`
  );
  console.log(`[prerender] canonical domain: ${siteUrl}`);
}

main().catch((error) => {
  console.error(`[prerender] ${error.message}`);
  process.exit(1);
});
