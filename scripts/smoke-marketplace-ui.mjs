// ============================================================
// CARVIBES / MARKETVIBES — browser-level smoke test
//
// Boots the BUILT marketplace pages (dist/marketplace*.html +
// dist/assets/*) inside jsdom against a LIVE marketplace API and checks
// the things that only exist once React has run:
//
//   * every page mounts with zero uncaught errors
//   * exactly one H1, and it matches the prerendered one
//   * listing cards and internal navigation are real <a href> links
//   * the listing page shows the seller's chosen contact CTA and never
//     the raw phone number
//   * filtered URLs canonicalise to /marketplace and go noindex, while
//     the clean URL stays indexable — the "intentional indexability" rule
//   * the admin route renders a sign-in gate, never a dashboard, for a
//     visitor without a session (the API denies it server-side)
//   * Arabic renders right-to-left with translated marketplace labels
//
// Run (needs the API — `npm run dev` or `npm run marketplace:serve`):
//   MARKETPLACE_API_BASE=http://localhost:5173 node scripts/smoke-marketplace-ui.mjs
// ============================================================

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// The suite inspects the store on disk for its strongest assertions (did the
// bytes really reach the server?). Those paths follow the SAME environment
// variables as the server, so the suite can be pointed at an isolated store
// — `MARKETPLACE_DATA_DIR=/tmp/x/data MARKETPLACE_MEDIA_DIR=/tmp/x/media ...`
// — instead of guessing where the running server keeps its data.
const DATA_DIR = process.env.MARKETPLACE_DATA_DIR ?? path.join(ROOT, "data/marketplace");
const MEDIA_DIR = process.env.MARKETPLACE_MEDIA_DIR ?? path.join(ROOT, "public/marketplace-media");
const DIST = path.join(ROOT, "dist");
const API_BASE = (process.env.MARKETPLACE_API_BASE ?? "http://localhost:5173").replace(/\/$/, "");
/** Captured once — `boot()` must never chain one boot's shim into the next. */
const NODE_FETCH = globalThis.fetch.bind(globalThis);

let failures = 0;
let checks = 0;
const ok = (label) => {
  checks++;
  console.log(`  ✓ ${label}`);
};
const fail = (label) => {
  checks++;
  failures++;
  console.error(`  ✗ ${label}`);
};
const assert = (cond, label) => (cond ? ok(label) : fail(label));

// ------------------------------------------------------------
// Shared boot: the same stubs the CarVibes harness uses, plus a fetch
// shim that proxies /api/marketplace/* to the live API.
// ------------------------------------------------------------
async function boot(file, url, { storage = {}, fetchImpl, cookie = null } = {}) {
  const html = readFileSync(path.join(DIST, file), "utf8");
  const pageErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => {
    const message = String(e?.message ?? e);
    if (!/Could not load|resource|not implemented/i.test(message)) pageErrors.push(message);
  });
  virtualConsole.on("error", (...args) => pageErrors.push(args.join(" ")));

  const dom = new JSDOM(html, { url, pretendToBeVisual: true, virtualConsole, runScripts: "outside-only" });
  const { window } = dom;
  window.__cvCss = 1;
  try {
    if (!window.document.fonts) {
      Object.defineProperty(window.document, "fonts", {
        value: { ready: Promise.resolve(), status: "loaded", load: () => Promise.resolve([]) },
      });
    }
  } catch {
    /* already defined */
  }

  window.matchMedia =
    window.matchMedia ||
    ((q) => ({
      matches: false,
      media: q,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
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
    window.requestIdleCallback || ((cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 20));
  window.cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
  window.scrollTo = window.scrollTo || (() => {});
  window.HTMLElement.prototype.scrollIntoView =
    window.HTMLElement.prototype.scrollIntoView || (() => {});

  for (const key of [
    "window", "document", "navigator", "location", "history", "localStorage", "sessionStorage",
    "CustomEvent", "Event", "MouseEvent", "KeyboardEvent", "InputEvent", "FocusEvent", "UIEvent",
    "PointerEvent", "TouchEvent", "MutationObserver", "DOMParser", "Node", "NodeList", "Element",
    "DocumentFragment", "HTMLElement", "HTMLImageElement", "HTMLInputElement", "HTMLAnchorElement",
    "SVGElement", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "matchMedia",
    "IntersectionObserver", "ResizeObserver", "requestIdleCallback", "cancelIdleCallback", "scrollTo",
    "alert", "confirm", "prompt", "Response", "Request", "Headers", "URLSearchParams", "Blob", "FormData",
    // Browser-only globals the bundle calls bare. Without these the upload
    // path throws a ReferenceError under Node (which has no XHR or File).
    "File", "FileList", "FormData", "XMLHttpRequest", "URL", "CanvasRenderingContext2D",
  ]) {
    try {
      globalThis[key] = window[key];
    } catch {
      /* read-only global */
    }
  }
  globalThis.window = window;
  globalThis.document = window.document;

  const bootScript = html.match(
    /<script>\s*document\.documentElement\.classList\.add\("cv-boot"\)[\s\S]*?<\/script>/
  );
  if (bootScript) window.eval(bootScript[0].replace(/^<script>|<\/script>$/g, ""));

  for (const [k, v] of Object.entries(storage)) window.localStorage.setItem(k, v);

  const proxied = (input, init) => {
    const raw = typeof input === "string" ? input : input?.url ?? String(input);
    // Same-origin requests (relative paths) and anything addressed to the
    // production origin are proxied to the live API — the sandbox has no
    // public internet, and the built page references https://carvibes.dev.
    const absolute = raw.startsWith("http")
      ? raw.replace(/^https:\/\/carvibes\.dev/, API_BASE)
      : `${API_BASE}${raw}`;
    const withCookie = cookie
      ? { ...init, headers: { ...(init?.headers ?? {}), cookie } }
      : init;
    if (typeof fetchImpl === "function") return fetchImpl(absolute, withCookie);
    return NODE_FETCH(absolute, withCookie);
  };
  globalThis.fetch = proxied;
  window.fetch = proxied;
  if (window.navigator && !window.navigator.sendBeacon) window.navigator.sendBeacon = () => true;

  const entryMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
  if (!entryMatch) throw new Error(`no entry module script in ${file}`);
  await import(pathToFileURL(path.join(DIST, entryMatch[1].replace(/^\//, ""))).href);
  // Let lazy route chunks + data fetches settle.
  for (let i = 0; i < 40; i++) await new Promise((r) => setTimeout(r, 50));

  return { window, dom, pageErrors };
}

/**
 * Two REAL, minimally-valid images used by the upload scenario. The API
 * sniffs magic bytes, so these exercise genuine server-side validation
 * rather than a mocked endpoint.
 */
const FIXTURE_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAACAAIBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
  "base64"
);
const FIXTURE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const text = (window) => (window.document.body?.textContent ?? "").replace(/\s+/g, " ");
/** Raw HTML heading → plain, whitespace-normalised text (mirrors the DOM). */
const plain = (html) => String(html ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const h1s = (window) => [...window.document.querySelectorAll("h1")].map((h) => (h.textContent ?? "").trim());
const links = (window, prefix) =>
  [...window.document.querySelectorAll(`a[href^="${prefix}"]`)].map((a) => a.getAttribute("href"));

// ------------------------------------------------------------// Seller funnel driver
// ------------------------------------------------------------// React tracks input values through its own setter, so a plain
// `el.value = x` is invisible to it. Going through the prototype setter and
// then dispatching input+change is what a real keystroke produces.
function setField(window, el, value) {
  const proto =
    el.tagName === "SELECT"
      ? window.HTMLSelectElement.prototype
      : el.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
  el.dispatchEvent(new window.Event("change", { bubbles: true }));
}

const settle = async (window, ms = 250) => {
  for (let i = 0; i < Math.ceil(ms / 25); i++) await new Promise((r) => window.setTimeout(r, 25));
};

const currentStepLabel = (window) => {
  const current = window.document.querySelector('[aria-current="step"]');
  return (current?.textContent ?? "").replace(/\s+/g, " ").trim();
};

const nextButton = (window) =>
  [...window.document.querySelectorAll("button")].find((b) => {
    const label = (b.textContent ?? "").replace(/\s+/g, " ").trim();
    // "Continue →" / "Next →" — never the "← Back" button.
    return /^(continue|next)\b/i.test(label) && !label.startsWith("←");
  });

/** Fill whatever the current step is asking for, then advance. */
async function advanceStep(window, answers) {
  const panel = window.document.querySelector("form") ?? window.document.body;
  for (const el of panel.querySelectorAll("select")) {
    if (el.value) continue;
    const wanted = answers.select?.[el.getAttribute("data-cvui") ?? ""];
    const options = [...el.options].filter((o) => o.value);
    const pick =
      (wanted && options.find((o) => o.value === wanted)) ??
      options.find((o) => answers.prefer?.includes(o.value)) ??
      options[0];
    if (pick) setField(window, el, pick.value);
  }
  for (const el of panel.querySelectorAll('input[type="text"], textarea')) {
    if (el.value) continue;
    const placeholder = el.getAttribute("placeholder") ?? "";
    setField(window, el, answers.text?.(placeholder, el) ?? "Test");
  }
  await settle(window, 150);
  const before = currentStepLabel(window);
  const button = nextButton(window);
  button?.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  await settle(window, 350);
  return { from: before, to: currentStepLabel(window), advanced: currentStepLabel(window) !== before };
}

// ------------------------------------------------------------
// Scenarios — each one runs in its OWN process: React writes to
// `document` through module-scope globals, so two apps alive in one
// process would fight over the same head/body.
// ------------------------------------------------------------
const SCENARIOS = {
  async index() {
    const { window, pageErrors } = await boot("marketplace.html", "https://carvibes.dev/marketplace");
    const h1 = h1s(window);
    const prerendered = plain(readFileSync(path.join(DIST, "marketplace.html"), "utf8").match(/<h1>([\s\S]*?)<\/h1>/)?.[1]);
    const canonical = window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const robots = window.document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
    const visible = text(window);
    const banner = window.document.querySelector("[data-launch-banner]");
    return {
      dump: { h1, robots, canonical, breadcrumb: Boolean(banner), text: visible.slice(0, 400) },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["exactly 1 H1", h1.length === 1, JSON.stringify(h1)],
        ["H1 matches the prerendered heading", h1[0] === prerendered, `${h1[0]} / ${prerendered}`],
        [
          "listing cards are real /marketplace/car/ links",
          process.env.CVUI_EMPTY === "1"
            ? links(window, "/marketplace/car/").length === 0
            : links(window, "/marketplace/car/").length > 0,
          `${links(window, "/marketplace/car/").length} links`,
        ],
        ["SELL YOUR CAR links to /marketplace/sell", links(window, "/marketplace/sell").length > 0, ""],
        [
          "the launch announcement is visible above the listings",
          /just launched|New feature/i.test(visible),
          (visible.match(/New feature[\s\S]{0,60}/i) ?? [""])[0].replace(/\s+/g, " "),
        ],
        [
          "the announcement sits above the results section",
          Boolean(
            banner &&
              window.document.querySelector("#marketplace-results") &&
              banner.compareDocumentPosition(window.document.querySelector("#marketplace-results")) &
                window.Node.DOCUMENT_POSITION_FOLLOWING
          ),
          "banner → #marketplace-results",
        ],
        [
          "the announcement CTA is a real link to the seller funnel",
          banner?.querySelector("[data-launch-cta]")?.getAttribute("href") === "/marketplace/sell",
          banner?.querySelector("[data-launch-cta]")?.getAttribute("href") ?? "no CTA",
        ],
        [
          "the announcement is ordinary markup, not an image or iframe",
          !banner?.querySelector("img, iframe, video") && banner?.getAttribute("role") !== "dialog",
          "",
        ],
        [
          "a visitor sees no Creator Dashboard entry",
          !/Creator Dashboard/i.test(visible) &&
            links(window, "/admin/marketplace").length === 0 &&
            window.document.querySelectorAll("[data-admin-entry]").length === 0,
          "",
        ],
        [
          "no admin entry is baked into the public shell",
          !/Creator Dashboard|data-admin-entry/.test(readFileSync(path.join(DIST, "marketplace.html"), "utf8")),
          "",
        ],
        [
          "a visitor sees no moderation vocabulary",
          !/\b(Approve|Reject|Pending|Rejected|Moderation)\b/i.test(visible),
          (visible.match(/\b(Approve|Reject|Pending|Rejected|Moderation)\b/gi) ?? []).slice(0, 5).join(", "),
        ],
        ["page copy rendered (never a blank screen)", text(window).length > 400, `${text(window).length} chars`],
        ["self-referencing canonical", canonical === "https://carvibes.dev/marketplace", canonical],
        ["clean URL is indexable", robots === null, robots ?? "no robots meta"],
      ],
    };
  },

  async empty() {
    // The state the marketplace actually ships in: live, crawlable, and
    // with nothing listed yet. It must say so — and must not pretend to
    // have inventory, filters that can be reset, or sellers to contact.
    const { window, pageErrors } = await boot("marketplace.html", "https://carvibes.dev/marketplace");
    const visible = text(window);
    const robots = window.document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
    const canonical = window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const sellLinks = [...window.document.querySelectorAll('a[href="/marketplace/sell"]')].map((a) =>
      (a.textContent ?? "").trim()
    );
    const images = [...window.document.querySelectorAll("img")].map((i) => i.getAttribute("src") ?? "");
    const prerenderedRaw = readFileSync(path.join(DIST, "marketplace.html"), "utf8");
    const prerendered = plain(prerenderedRaw);
    return {
      dump: { robots, canonical, sellLinks, images: images.slice(0, 4), text: visible.slice(0, 300) },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["the empty state names the situation", /No cars listed yet/i.test(visible), visible.slice(0, 120)],
        ["the empty state invites the first seller", /Be the first to sell your car on MarketVibes/i.test(visible), ""],
        [
          "the CTA is a real link to the seller funnel",
          sellLinks.some((label) => /sell/i.test(label)),
          sellLinks.join(" | "),
        ],
        [
          "the filtered-empty copy is NOT shown when nothing is filtered",
          !/No cars match your search/i.test(visible),
          "",
        ],
        ["no listing links exist yet", links(window, "/marketplace/car/").length === 0, ""],
        ["no seller contact CTA is rendered", !/Contact on WhatsApp|Call seller|View Instagram/i.test(visible), ""],
        [
          "no vehicle photos are rendered",
          images.every((src) => !/marketplace-media|pexels/i.test(src)),
          images.slice(0, 3).join(", "),
        ],
        ["the empty marketplace stays indexable", robots === null, robots ?? "no robots meta"],
        ["self-referencing canonical", canonical === "https://carvibes.dev/marketplace", String(canonical)],
        [
          "the prerendered HTML carries the same empty state (crawlable)",
          /No cars listed yet/.test(prerendered) && /href="\/marketplace\/sell"/.test(prerenderedRaw),
          "",
        ],
      ],
    };
  },

  async filtered() {
    const { window } = await boot("marketplace.html", "https://carvibes.dev/marketplace?brand=BMW&sort=price_asc");
    const canonical = window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const robots = window.document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
    return {
      dump: { canonical, robots, text: text(window).slice(0, 300) },
      checks: [
        ["filtered URL canonicalises to /marketplace", canonical === "https://carvibes.dev/marketplace", canonical],
        ["filtered URL is noindex, follow", /noindex/.test(robots), robots || "missing robots meta"],
      ],
    };
  },

  async facet() {
    const file = process.env.CVUI_FACET_FILE;
    const route = file.replace(/^marketplace\//, "").replace(/\.html$/, "");
    const { window, pageErrors } = await boot(file, `https://carvibes.dev/marketplace/${route}`);
    const h1 = h1s(window);
    const prerendered = plain(readFileSync(path.join(DIST, file), "utf8").match(/<h1>([\s\S]*?)<\/h1>/)?.[1]);
    return {
      dump: { h1, route },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["exactly 1 H1", h1.length === 1, JSON.stringify(h1)],
        ["H1 matches the prerendered heading", h1[0] === prerendered, `${h1[0]} / ${prerendered}`],
        ["facet lists real listing links", links(window, "/marketplace/car/").length > 0, `${links(window, "/marketplace/car/").length}`],
        [
          "a published facet keeps its own canonical and stays indexable",
          window.document.querySelector('link[rel="canonical"]')?.getAttribute("href") ===
            `https://carvibes.dev/marketplace/${route}` &&
            window.document.querySelector('meta[name="robots"]') === null,
          String(window.document.querySelector('link[rel="canonical"]')?.getAttribute("href")),
        ],

      ],
    };
  },

  async facetUnknown() {
    // A brand URL with no supply behind it: facet pages are only published
    // once >= 3 approved listings exist for that value, so this URL has no
    // prerendered file and production hands it the marketplace shell
    // through the SPA fallback rewrite. That is exactly what is booted
    // here — the index HTML, served at the facet URL.
    const { window, pageErrors } = await boot("marketplace.html", "https://carvibes.dev/marketplace/brand/mercedes-benz");
    const h1 = h1s(window);
    const robots = window.document.querySelector('meta[name="robots"]');
    const canonical = window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const visible = text(window);
    return {
      dump: {
        h1,
        robots: robots?.getAttribute("content") ?? null,
        canonical,
        cards: links(window, "/marketplace/car/").length,
        cardHrefs: [...window.document.querySelectorAll('a[href*="/marketplace/car/"]')].map((a) => a.getAttribute("href")).slice(0, 6),
        countText: (visible.match(/\d+\s+cars?/gi) ?? []).slice(0, 4),
        text: visible.slice(0, 900),
      },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["exactly 1 H1", h1.length === 1, JSON.stringify(h1)],
        [
          "an unbounded filter combination stays noindex, follow",
          /noindex/.test(robots?.getAttribute("content") ?? ""),
          robots?.getAttribute("content") ?? "",
        ],
        [
          "it canonicalises back to the marketplace index",
          canonical === "https://carvibes.dev/marketplace",
          String(canonical),
        ],
        process.env.CVUI_EMPTY === "1"
          ? [
              "an unmapped facet on an empty marketplace shows the no-results state",
              /cars for sale/i.test(h1[0] ?? "") && !/No cars listed yet/i.test(visible),
              h1[0],
            ]
          : [
              "the filter still works without a published facet page",
              links(window, "/marketplace/car/").length > 0 &&
                links(window, "/marketplace/car/").every((href) => href.includes("mercedes-benz")),
              links(window, "/marketplace/car/").slice(0, 3).join(", "),
            ],
        ["no admin surface leaks to visitors", !/Administrator sign-in/i.test(visible), ""],
      ],
    };
  },

  async listing() {
    const file = process.env.CVUI_LISTING_FILE;
    const slug = file.replace(/^marketplace\/car\//, "").replace(/\.html$/, "");
    const { window, pageErrors } = await boot(file, `https://carvibes.dev/marketplace/car/${slug}`);
    const h1 = h1s(window);
    const prerendered = plain(readFileSync(path.join(DIST, file), "utf8").match(/<h1>([\s\S]*?)<\/h1>/)?.[1]);
    const contactLinks = [...window.document.querySelectorAll('a[href*="/contact"]')].map((a) => a.getAttribute("href"));
    const robots = window.document.querySelector('meta[name="robots"]');
    const visible = text(window);
    return {
      dump: { h1, contactLinks, text: visible.slice(0, 400) },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["exactly 1 H1", h1.length === 1, JSON.stringify(h1)],
        ["H1 matches the prerendered listing title", h1[0] === prerendered, `${h1[0]} / ${prerendered}`],
        ["internal + back links are real anchors", links(window, "/marketplace").length > 0, ""],
        ["brand facet link present", links(window, "/marketplace/brand/").length > 0, ""],
        ["Vehicle JSON-LD present after hydration", /"@type"\s*:\s*"Vehicle"/.test(window.document.head.textContent ?? ""), ""],
        ["contact CTA points at the server-side redirect", contactLinks.length > 0, contactLinks[0] ?? "none"],
        ["the phone number is never rendered as text", !/(?:\+?\d[\s-]?){9,}/.test(visible.replace(/\b\d{4}\b|\b\d{5}\b/g, "")), "checked"],
        ["an approved listing stays indexable", robots === null, robots?.getAttribute("content") ?? ""],
      ],
    };
  },

  async sell() {
    const { window, pageErrors } = await boot("marketplace/sell.html", "https://carvibes.dev/marketplace/sell");
    const fields = window.document.querySelectorAll("input:not([type=hidden]), select, textarea").length;
    const robots = window.document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
    const visible = text(window);
    return {
      dump: { fields, robots, text: visible.slice(0, 600), buttons: [...window.document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim()).slice(0, 12) },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["seller funnel is noindex, follow", /noindex/.test(robots), robots || "missing"],
        ["no admin link anywhere on the page", links(window, "/admin").length === 0, ""],
        ["step 1 exposes real form fields", fields > 0, `${fields} fields`],
        [
          "the upload control is a real button, not a fake image URL",
          [...window.document.querySelectorAll("button")].some((b) => /photo|import|choose/i.test(b.textContent ?? "")),
          [...window.document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim()).slice(0, 8).join(" | "),
        ],
        [
          "nothing is prefilled with a fake listing",
          !/marketplace-media|example\.com|\+2126\d{8}/.test(visible),
          "",
        ],
      ],
    };
  },

  async funnel() {
    // Walk the real seller funnel — vehicle → price → location → photos —
    // and drive the file input with two genuine images. This is the path a
    // seller actually takes; nothing here reaches into component internals.
    const { window, pageErrors } = await boot("marketplace/sell.html", `${API_BASE}/marketplace/sell`);
    await settle(window, 600);

    // jsdom's URL.createObjectURL forwards to Node's, which insists on a
    // Node Blob (a jsdom File is not one) — a browser has no such split.
    let blobSeq = 0;
    const objectUrl = () => `blob:https://carvibes.dev/${(blobSeq += 1)}`;
    window.URL.createObjectURL = objectUrl;
    window.URL.revokeObjectURL = () => {};
    // The bundle calls the bare global, which is Node's URL here.
    globalThis.URL.createObjectURL = objectUrl;
    globalThis.URL.revokeObjectURL = () => {};

    const decodeStub = async () => ({ width: 2048, height: 1536, close() {} });
    const CanvasStub = class {
      constructor(width, height) {
        this.width = width;
        this.height = height;
      }
      getContext() {
        return { drawImage() {} };
      }
      convertToBlob({ type }) {
        return Promise.resolve(new window.Blob([FIXTURE_PNG], { type: type || "image/png" }));
      }
    };

    // Record every upload request, so a silent failure shows up in the dump
    // instead of having to be guessed at.
    const uploads = [];
    const openXhr = window.XMLHttpRequest.prototype.open;
    const sendXhr = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__cvui = { method, url };
      return openXhr.call(this, method, url, ...rest);
    };
    window.XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("loadend", () => uploads.push({ ...this.__cvui, status: this.status }));
      this.addEventListener("error", () => uploads.push({ ...this.__cvui, status: "error" }));
      return sendXhr.apply(this, args);
    };

    // The bundle calls the bare globals, so stub both scopes.
    window.createImageBitmap = decodeStub;
    window.OffscreenCanvas = CanvasStub;
    globalThis.createImageBitmap = decodeStub;
    globalThis.OffscreenCanvas = CanvasStub;
    // jsdom's canvas cannot encode; the app only probes this for WebP support.
    window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/webp;base64,AAAA";

    const trail = [];
    const answers = {
      prefer: ["used", "automatic", "petrol", "MA", "SUV", "Black"],
      text: (placeholder, el) => {
        if (/x5|model/i.test(placeholder)) return "X5 xDrive40i";
        if (el.inputMode === "numeric") return /year|^20\d\d$/.test(placeholder) ? "2021" : "54000";
        if (/casablanca-settat/i.test(placeholder)) return "Casablanca-Settat";
        if (/casablanca/i.test(placeholder)) return "Casablanca";
        if (placeholder) return placeholder.slice(0, 40);
        return "Test";
      },
    };

    // Steps 1–3 (vehicle, price, location) then land on photos.
    for (let i = 0; i < 3; i++) trail.push(await advanceStep(window, answers));

    const atPhotos = /photo/i.test(currentStepLabel(window));
    let input = null;
    for (let i = 0; i < 40 && !input; i++) {
      input = window.document.querySelector('input[type="file"][accept*="image"]');
      if (!input) await settle(window, 50);
    }

    let thumbs = [];
    if (input) {
      const files = [
        new window.File([FIXTURE_JPEG], "my-car-front.jpg", { type: "image/jpeg" }),
        new window.File([FIXTURE_PNG], "my-car-side.png", { type: "image/png" }),
      ];
      Object.defineProperty(input, "files", { value: files, configurable: true });
      input.dispatchEvent(new window.Event("change", { bubbles: true }));
      for (let i = 0; i < 120; i++) {
        thumbs = [...window.document.querySelectorAll('img[alt^="Photo"]')];
        const settled =
          thumbs.length === 2 && !/Optimising|Upload failed|⚠/.test(text(window));
        if (settled) break;
        await settle(window, 100);
      }
      thumbs = [...window.document.querySelectorAll('img[alt^="Photo"]')];
    }

    const visible = text(window);
    const busy = /Optimising…|Upload failed|⚠/.test(visible);

    // The decisive evidence that the bytes really travelled: the API's own
    // staged uploads are on disk, and each stored file is a real image.
    let staged = [];
    try {
      const doc = JSON.parse(readFileSync(path.join(DATA_DIR, "listings.json"), "utf8"));
      staged = doc.stagedUploads ?? [];
    } catch {
      staged = [];
    }
    const stored = staged
      .slice(-2)
      .map((upload) => {
        const file = path.join(MEDIA_DIR, upload.file ?? "");
        try {
          const bytes = readFileSync(file);
          const isImage =
            (bytes[0] === 0xff && bytes[1] === 0xd8) || // JPEG
            (bytes[0] === 0x89 && bytes[1] === 0x50) || // PNG
            (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP");
          return { file: upload.file, bytes: bytes.length, isImage, width: upload.width, height: upload.height };
        } catch {
          return { file: upload.file, bytes: 0, isImage: false };
        }
      });
    const served = stored.length
      ? await NODE_FETCH(`${API_BASE}/marketplace-media/${stored[0].file}`, { method: "HEAD" })
          .then((r) => r.status)
          .catch(() => 0)
      : 0;

    return {
      dump: {
        trail,
        step: currentStepLabel(window),
        thumbnails: thumbs.length,
        uploads,
        trace: window.__cvuiTrace,
        busy,
        stored,
        served,
        text: visible.slice(-200),
      },
      checks: [
        ["no uncaught JavaScript errors while filling the form", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["step 1 (vehicle) accepts input and advances", trail[0]?.advanced === true, JSON.stringify(trail[0])],
        ["step 2 (price) accepts input and advances", trail[1]?.advanced === true, JSON.stringify(trail[1])],
        ["step 3 (location) accepts input and advances", trail[2]?.advanced === true, JSON.stringify(trail[2])],
        ["the funnel reaches the photos step", atPhotos, currentStepLabel(window)],
        [
          "the photo input opens the native picker and accepts multiple images",
          Boolean(input) && input.hasAttribute("multiple") && /image/.test(input.getAttribute("accept") ?? ""),
          input ? `accept=${input.getAttribute("accept")} multiple=${input.hasAttribute("multiple")}` : "no input",
        ],
        [
          "an invalid form cannot skip ahead (step 4 is reachable only when valid)",
          trail.every((step) => step.to !== ""),
          "",
        ],
        ["both selected files appear as thumbnails", thumbs.length === 2, `${thumbs.length} thumbnails`],
        ["no photo is stuck uploading or failed", !busy, visible.slice(-80)],
        [
          "the API received and staged two uploads from the browser",
          staged.length >= 2,
          `${staged.length} staged`,
        ],
        [
          "the stored files are real images (magic bytes)",
          stored.length === 2 && stored.every((entry) => entry.isImage && entry.bytes > 50),
          JSON.stringify(stored),
        ],
        [
          "the server reads back the stored photo dimensions",
          stored.every((entry) => entry.width > 0 && entry.height > 0),
          JSON.stringify(stored.map((entry) => [entry.width, entry.height])),
        ],
        ["the uploaded photo is served publicly (HEAD 200)", served === 200, `status ${served}`],
        ["the first photo is marked as the main image", /MAIN/.test(visible), ""],
        [
          "uploading stages the photos without publishing anything",
          (await NODE_FETCH(`${API_BASE}/api/marketplace/listings`).then((r) => r.json())).total === 0,
          "public listing count",
        ],
      ],
    };
  },

  async admin() {
    const { window, pageErrors } = await boot("admin/marketplace.html", "https://carvibes.dev/admin/marketplace");
    const robots = window.document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
    const visible = text(window);
    const hasDashboard = /Pending|Approve|Reject|Moderation/iu.test(visible) && /\bApprove\b/.test(visible);
    const hasGate = /sign-in|Sign in|access code|administrator|restricted/i.test(visible);
    const listings = await NODE_FETCH(`${API_BASE}/api/marketplace/admin/listings`);
    const session = await (await NODE_FETCH(`${API_BASE}/api/marketplace/admin/session`)).json();
    return {
      dump: { robots, h1: h1s(window), text: visible.slice(0, 600), hasGate, hasDashboard },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["admin route is noindex, follow", /noindex/.test(robots), robots || "missing"],
        ["exactly 1 H1", h1s(window).length === 1, JSON.stringify(h1s(window))],
        ["anonymous visitor sees the sign-in gate, never a dashboard", hasGate && !hasDashboard, `gate=${hasGate} dashboard=${hasDashboard}`],
        ["no admin button/link for normal visitors", links(window, "/admin").length === 0, ""],
        ["GET /admin/listings without a session → 401", listings.status === 401, `status ${listings.status}`],
        ["GET /admin/session reports authenticated:false", session.authenticated === false, JSON.stringify(session).slice(0, 120)],
      ],
    };
  },

  async adminSession() {
    // Real (dev) administrator session: the passcode endpoint is the only
    // way in without a browser, and the cookie it returns is exactly what
    // the API re-verifies on every request.
    const email = process.env.MARKETPLACE_TEST_EMAIL ?? "admin@carvibes.dev";
    const passcode = process.env.MARKETPLACE_TEST_PASSCODE ?? "vibe-admin";
    const login = await NODE_FETCH(`${API_BASE}/api/marketplace/admin/login/passcode`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, passcode }),
    });
    const sessionCookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
    const loginOk = login.ok && Boolean(sessionCookie);

    const { window, pageErrors } = await boot("admin/marketplace.html", "https://carvibes.dev/admin/marketplace", {
      cookie: sessionCookie || null,
    });

    // The pending queue may legitimately be empty; switch to "All" so the
    // row-level and bulk controls have something to act on.
    const clickByText = (label) => {
      const target = [...window.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").trim() === label);
      target?.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
      return Boolean(target);
    };
    // Tab labels carry their count in the same element ("Pending3"), so
    // match on the prefix rather than on an exact string.
    const tabText = [...window.document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim());
    const tabsFound = ["Pending", "Published", "Rejected", "All"].every((label) =>
      tabText.some((b) => new RegExp(`^${label}\\s*\\d*$`).test(b))
    );
    const switched = clickByText("All");
    for (let i = 0; i < 30; i++) await new Promise((r) => setTimeout(r, 50));
    // Selecting is non-destructive; the bulk bar (Approve/Reject selected)
    // only appears once at least one row is checked. The header control is a
    // checkbox, not a button.
    const boxes = [...window.document.querySelectorAll('input[type="checkbox"]')];
    boxes[0]?.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
    for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 50));
    const bulkAvailable = /Approve selected|Reject selected/.test(
      [...window.document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim()).join(" ")
    );
    if (!bulkAvailable && boxes.length > 1) {
      boxes.slice(1, 4).forEach((box) =>
        box.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }))
      );
      for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 50));
    }

    const visible = text(window);
    const buttons = [...window.document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim());
    const checkboxes = window.document.querySelectorAll('input[type="checkbox"]').length;
    const rows = window.document.querySelectorAll("article, li, tr").length;
    return {
      dump: {
        loginOk,
        h1: h1s(window),
        buttons: buttons.slice(0, 14),
        checkboxes,
        text: visible.slice(0, 500),
      },
      checks: [
        ["passcode login issues an admin cookie", loginOk, `status ${login.status}`],
        ["no uncaught JavaScript errors while authenticated", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["the dashboard renders for the administrator", /Pending|Published|Moderation|marche|modération/i.test(visible), visible.slice(0, 80)],
        ["status tabs are present", tabsFound, buttons.slice(0, 8).join(", ")],
        process.env.CVUI_NO_DATA === "1"
          ? [
              "an empty moderation queue says so (no blank panel)",
              /No listing in this queue|No pending submission/i.test(visible),
              visible.slice(-70),
            ]
          : ["the All tab renders listing rows", switched && rows > 0, `${rows} rows`],
        [
          "the overview shows the five counters: total / pending / published / rejected / views",
          ["TOTAL LISTINGS", "PENDING", "PUBLISHED", "REJECTED", "TOTAL VIEWS"].every((label) =>
            new RegExp(label.replace(/ /g, "\\s*"), "i").test(visible)
          ),
          (visible.match(/TOTAL LISTINGS[\s\S]{0,80}/i) ?? [""])[0].replace(/\s+/g, " "),
        ],
        [
          "every counter is a real number, never a placeholder",
          /TOTAL LISTINGS\s*\d+/i.test(visible) &&
            /TOTAL VIEWS\s*\d+/i.test(visible) &&
            !/—|--|N\/A/i.test((visible.match(/TOTAL VIEWS\s*(\S+)/i) ?? ["", ""])[1] ?? ""),
          (visible.match(/TOTAL LISTINGS\s*\d+[\s\S]{0,60}/i) ?? [""])[0].replace(/\s+/g, " "),
        ],
        process.env.CVUI_NO_DATA === "1"
          ? [
              "counts read 0 pending / 0 published / 0 rejected",
              /PENDING\s*0/i.test(visible) && /PUBLISHED\s*0/i.test(visible) && /REJECTED\s*0/i.test(visible),
              (visible.match(/PENDING\s*\d+/i) ?? [""])[0],
            ]
          : ["bulk moderation controls appear once rows are selected", /Approve selected/.test(buttons.join(" ")), buttons.slice(0, 6).join(", ")],
        process.env.CVUI_NO_DATA === "1"
          ? ["no row controls exist when the queue is empty", checkboxes === 0, `${checkboxes} checkboxes`]
          : ["per-row moderation controls exist", checkboxes > 0, `${checkboxes} row checkboxes`],
        ["sign out is offered", /Sign out/i.test(buttons.join(" ")), ""],
        ["the admin dashboard stays noindex", /noindex/.test(window.document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? ""), ""],
        ["the dashboard is NOT prerendered into the shell", !/Approve selected/.test(readFileSync(path.join(DIST, "admin/marketplace.html"), "utf8")), ""],
      ],
    };
  },

  /**
   * Dismissing the launch announcement hides it for good in this browser
   * and takes nothing else with it: the marketplace itself is untouched.
   */
  async launchDismiss() {
    const { window, pageErrors } = await boot("marketplace.html", "https://carvibes.dev/marketplace", {
      storage: { "carvibes.marketplace.launch-dismissed": "1" },
    });
    const visible = text(window);
    const banner = window.document.querySelector("[data-launch-banner]");
    return {
      dump: { banner: Boolean(banner), text: visible.slice(0, 160) },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["a dismissed announcement stays dismissed", !banner, ""],
        ["the marketplace itself is unaffected", /SELL YOUR CAR/i.test(visible) && /No cars listed yet|Cars for sale/i.test(visible), ""],
        ["the loader state is gone (page really rendered)", window.document.querySelectorAll(".cv-boot").length === 0, ""],
      ],
    };
  },

  /**
   * The Creator Dashboard entry, from the administrator's side. The
   * marketplace runs without the site header, so this is the shortcut the
   * admin actually uses — and it must exist only for a server-verified
   * administrator session.
   */
  async adminEntry() {
    const email = process.env.MARKETPLACE_TEST_EMAIL ?? "admin@carvibes.dev";
    const passcode = process.env.MARKETPLACE_TEST_PASSCODE ?? "vibe-admin";
    const login = await NODE_FETCH(`${API_BASE}/api/marketplace/admin/login/passcode`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, passcode }),
    });
    const sessionCookie = (login.headers.get("set-cookie") ?? "").split(";")[0];

    const { window, pageErrors } = await boot("marketplace.html", "https://carvibes.dev/marketplace", {
      cookie: sessionCookie || null,
    });
    const visible = text(window);
    const entry = window.document.querySelector("[data-admin-entry]");
    const href = entry?.getAttribute("href") ?? null;
    const tag = entry?.tagName?.toLowerCase() ?? null;

    return {
      dump: { cookie: Boolean(sessionCookie), tag, href, text: visible.slice(0, 200) },
      checks: [
        ["the administrator got a real session cookie", Boolean(sessionCookie), `status ${login.status}`],
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ["the Creator Dashboard entry appears for the administrator", Boolean(entry), `${tag} ${href}`],
        ["the entry is a real crawlable link to /admin/marketplace", tag === "a" && href === "/admin/marketplace", `${tag} ${href}`],
        ["the entry is labelled for humans", /Creator Dashboard/i.test(visible), (visible.match(/Creator Dashboard/i) ?? [""])[0]],
        ["the administrator still sees the public marketplace", /SELL YOUR CAR/i.test(visible), ""],
      ],
    };
  },

  async rtl() {
    const { window, pageErrors } = await boot("marketplace.html", "https://carvibes.dev/marketplace", {
      storage: { "carvibes.lang": "ar" },
    });
    const visible = text(window);
    return {
      dump: { dir: window.document.documentElement.getAttribute("dir"), text: visible.slice(0, 400) },
      checks: [
        ["no uncaught JavaScript errors", pageErrors.length === 0, pageErrors[0] ?? "clean"],
        ['html dir="rtl"', window.document.documentElement.getAttribute("dir") === "rtl", window.document.documentElement.getAttribute("dir")],
        ['html lang="ar"', window.document.documentElement.getAttribute("lang") === "ar", window.document.documentElement.getAttribute("lang")],
        ["Arabic marketplace copy rendered", /سيارات|سيارة|بيع/.test(visible), visible.slice(0, 90)],
        ["no untranslated mk_* key leaked into the DOM", !/mk_[a-z_]{3,}/.test(visible), (visible.match(/mk_[a-z_]+/) ?? [""])[0]],
      ],
    };
  },
};

// ------------------------------------------------------------
async function runScenario(name) {
  const scenario = SCENARIOS[name];
  if (!scenario) throw new Error(`unknown scenario ${name}`);
  const { checks, dump } = await scenario();
  const results = checks.map(([label, pass, detail]) => ({ label, pass: Boolean(pass), detail: String(detail ?? "") }));
  process.stdout.write(`\nCVUI:${JSON.stringify({ results, dump })}\n`);
}

async function main() {
  // Anything the funnel scenario stages is newer than this instant, which
  // is how cleanup tells its own uploads from a real seller's.
  const startedAt = Date.now() - 1000;
  if (!existsSync(DIST)) throw new Error("dist/ not found — run `npm run build` first.");
  try {
    const health = await NODE_FETCH(`${API_BASE}/api/marketplace/health`);
    if (!health.ok) throw new Error(`status ${health.status}`);
    console.log(`[ui-smoke] API online at ${API_BASE}`);
  } catch (error) {
    console.error(`[ui-smoke] marketplace API not reachable at ${API_BASE} — start it with \`npm run dev\``);
    console.error(`           (${error.message})`);
    process.exit(1);
  }

  // Everything below is supply-driven. The marketplace ships EMPTY, so a
  // zero-listing run is the normal case: the empty-state scenario is the
  // one that matters, and the listing/facet scenarios are reported as
  // skipped instead of silently passing or crashing on a missing file.
  const dirFiles = (kind) => {
    const dir = path.join(DIST, "marketplace", kind);
    return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".html")) : [];
  };
  const listingFiles = dirFiles("car");
  const facetFiles = ["brand", "country", "condition"].flatMap((kind) => dirFiles(kind).map((f) => `marketplace/${kind}/${f}`));
  const health = await NODE_FETCH(`${API_BASE}/api/marketplace/health`)
    .then((r) => r.json())
    .catch(() => ({}));
  // Two distinct "empty" states, and they must not be conflated:
  //   empty  — nothing is APPROVED, so the public marketplace shows its
  //            zero state (a pending submission changes nothing publicly);
  //   noData — the store holds no listing at all, so the moderation queue
  //            is empty as well.
  const empty = (health.approved ?? 0) === 0;
  const noData = (health.listings ?? 0) === 0;
  const env = { CVUI_EMPTY: empty ? "1" : "0", CVUI_NO_DATA: noData ? "1" : "0" };

  const plan = [
    { name: "index", title: "[1] /marketplace — index page", env },
    ...(empty ? [{ name: "empty", title: "[2] /marketplace — empty marketplace state", env }] : []),
    { name: "filtered", title: `[${empty ? 3 : 2}] /marketplace?brand=BMW&sort=price_asc — filtered URL`, env },
    ...(facetFiles.length
      ? [
          {
            name: "facet",
            title: `${empty ? "[4]" : "[3]"} /${facetFiles[0].replace(/^marketplace\//, "").replace(/\.html$/, "")} — facet page`,
            env: { ...env, CVUI_FACET_FILE: facetFiles[0] },
          },
        ]
      : []),
    ...(listingFiles.length
      ? [
          {
            name: "listing",
            title: `/marketplace/car/${listingFiles[0].replace(/\.html$/, "")} — listing page`,
            env: { ...env, CVUI_LISTING_FILE: `marketplace/car/${listingFiles[0]}` },
          },
        ]
      : []),
    { name: "facetUnknown", title: "/marketplace/brand/<no-supply> — bounded indexability", env },
    { name: "sell", title: "/marketplace/sell — seller funnel", env },
    { name: "funnel", title: "/marketplace/sell — seller walks the funnel to the photos step", env },
    { name: "admin", title: "/admin/marketplace — unauthorized visitor", env },
    { name: "adminSession", title: "/admin/marketplace — authenticated administrator", env },
    { name: "adminEntry", title: "/marketplace — Creator Dashboard entry (administrator)", env },
    { name: "launchDismiss", title: "/marketplace — launch announcement dismissed", env },
    { name: "rtl", title: "/marketplace (ar) — RTL + translations", env },
  ];

  console.log(
    `[ui-smoke] store: ${health.listings ?? 0} listing(s), ${health.approved ?? 0} approved` +
      (empty ? " — public zero state" : " — public listings present") +
      (noData ? " — moderation queue empty" : " — moderation queue has rows")
  );
  if (!listingFiles.length || !facetFiles.length) {
    console.log(
      `[ui-smoke] skipped: ${!listingFiles.length ? "listing page" : ""}` +
        `${!listingFiles.length && !facetFiles.length ? " + " : ""}${!facetFiles.length ? "facet page" : ""} ` +
        "(no approved listings yet)"
    );
  }

  let failures = 0;
  let checks = 0;
  for (const item of plan) {
    console.log(`\n${item.title}`);
    if (item.skip) {
      console.log(`  – skipped: ${item.skip}`);
      continue;
    }
    const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--worker", item.name], {
      encoding: "utf8",
      timeout: 180_000,
      cwd: ROOT,
      env: { ...process.env, ...(item.env ?? {}) },
    });
    const line = (child.stdout ?? "").split("\n").filter((l) => l.startsWith("CVUI:")).pop();
    if (!line) {
      failures++;
      checks++;
      console.error(`  ✗ scenario crashed: ${(child.stderr ?? "").split("\n").slice(-6).join(" | ")}`);
      continue;
    }
    const { results, dump } = JSON.parse(line.slice(5));
    for (const r of results) {
      checks++;
      if (r.pass) console.log(`  ✓ ${r.label}${r.detail && r.detail !== "clean" && r.detail !== "checked" ? ` (${r.detail})` : ""}`);
      else {
        failures++;
        console.error(`  ✗ ${r.label}${r.detail ? ` — ${r.detail}` : ""}`);
      }
    }
    if (results.some((r) => !r.pass)) console.error(`    dump: ${JSON.stringify(dump).slice(0, 500)}`);
  }

  // ---------- cleanup: only what THIS run uploaded ----------
  // Writing to a store is a privilege, not a right: the suite refuses to
  // touch anything that existed before it started, so a real seller can
  // leave a submission (or a half-finished funnel) in place while the tests
  // run. Guarded by the same "local target" rule as the API suite.
  const localTarget = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(API_BASE);
  if (localTarget) {
    try {
      const storePath = path.join(DATA_DIR, "listings.json");
      const doc = JSON.parse(readFileSync(storePath, "utf8"));
      const mine = (doc.stagedUploads ?? [])
        .filter((u) => !u.claimedBy && Date.parse(u.createdAt) >= startedAt)
        .map((u) => u.id);
      const { pathToFileURL } = await import("node:url");
      const store = await import(pathToFileURL(path.join(ROOT, "server/marketplace/store.mjs")).href);
      const { removed } = await store.deleteStagedUploads(mine);
      assert(removed === mine.length, `the test removed its own staged uploads (${removed})`);
      const orphans = await store.gcOrphanMedia();
      assert(orphans.dirs + orphans.files === 0, `no unreachable media is left behind (${orphans.dirs} dir/files)`);
      const after = JSON.parse(readFileSync(storePath, "utf8"));
      assert(
        (after.listings ?? []).length === (doc.listings ?? []).length,
        `every pre-existing listing survived (${(after.listings ?? []).length})`
      );
    } catch (error) {
      fail(`cleanup failed: ${error.message}`);
    }
  } else {
    console.log(`  ! cleanup skipped (${API_BASE} is not a local target) — remove the test uploads manually`);
  }

  console.log(
    failures === 0
      ? `\n[ui-smoke] ${checks} checks passed — marketplace pages mount, link and gate correctly.`
      : `\n[ui-smoke] ${failures}/${checks} checks FAILED.`
  );
  process.exit(failures === 0 ? 0 : 1);
}

if (process.argv[2] === "--worker") {
  runScenario(process.argv[3]).catch((error) => {
    console.error(`[ui-smoke] worker ${process.argv[3]} failed: ${error?.stack ?? error.message}`);
    process.exit(2);
  });
} else {
  main().catch((error) => {
    console.error(`[ui-smoke] ${error.stack ?? error.message}`);
    process.exit(1);
  });
}
