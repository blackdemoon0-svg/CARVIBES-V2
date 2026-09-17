// ============================================================
// CARVIBES — hydrated DOM verification (Part 3 detail routes)
//
// Proves the architecture fix at runtime, not just on paper. It
// boots the REAL built bundle (dist/ + hashed chunks) in jsdom for
// a set of scenarios and asserts the hydrated DOM contract:
//
//   A. /car/:id   — dedicated page: exactly 1 H1 (the car), NO
//                    homepage behind it, no dialog role, no body
//                    scroll lock, self-referencing canonical. The H1
//                    must be STRICTLY equal (same text) to the
//                    prerendered one — "brand model", no year.
//   A2/A3. same contract on a BMW sample and an electric car sample.
//   B. /story/:id — same contract for the story reader.
//   C. /car/not-a-real-car and /this-route-does-not-exist —
//                    real 404: noindex, NO canonical, 1 H1, no
//                    homepage content.
//   D. Homepage → car (click) → CLOSE (back) → forward.
//   E. Direct car landing (idx=0) → CLOSE → home via replace:
//      history.length must not grow.
//   F. DOM weight: element counts per page (car page must be a
//      fraction of the homepage — the old architecture rendered
//      homepage + sheet on top of it).
//
// Each scenario runs in its own child process (fresh jsdom + fresh
// module graph), because the bundle is a singleton per process.
//
// Usage: node scripts/verify-hydrated.mjs            (after build)
//        node scripts/verify-hydrated.mjs --measure   (snapshots only)
// ============================================================

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
// CV_DIST lets the harness point at any build output (e.g. a build of
// the previous revision, to measure before/after DOM weight).
const DIST = process.env.CV_DIST
  ? path.resolve(process.env.CV_DIST)
  : path.join(ROOT, "dist");
const MEASURE_ONLY = process.argv.includes("--measure");

let failures = 0;
let checks = 0;
const ok = (label) => {
  checks++;
  console.log(`  ✓ ${label}`);
};
const fail = (label) => {
  failures++;
  checks++;
  console.error(`  ✗ ${label}`);
};
const assert = (cond, label) => (cond ? ok(label) : fail(label));

// ============================================================
// Worker mode — one jsdom boot per scenario, run in a child process
// ============================================================
async function runWorker(spec) {
  const { file, url, actions, storage } = spec;
  const html = readFileSync(path.join(DIST, file), "utf8");

  const pageErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => {
    if (!/Could not load|resource/i.test(String(e?.message ?? e)))
      pageErrors.push(String(e));
  });
  virtualConsole.on("error", (...a) => pageErrors.push(a.join(" ")));

  const dom = new JSDOM(html, {
    url,
    pretendToBeVisual: true,
    virtualConsole,
    runScripts: "outside-only",
  });
  const { window } = dom;
  // jsdom never fetches the app stylesheet, so the non-blocking CSS link
  // (see scripts/prerender.mjs) would never report ready and src/lib/boot.ts
  // would reveal only after its 2.5 s guard. Pretend it applied.
  window.__cvCss = 1;
  // jsdom has no real font loader; src/lib/boot.ts waits (bounded) for the
  // font set to settle before revealing the app, so stub it as settled.
  try {
    if (window.document && !window.document.fonts) {
      Object.defineProperty(window.document, "fonts", {
        value: { ready: Promise.resolve(), status: "loaded", load: () => Promise.resolve([]) },
      });
    }
  } catch {}



  // --- browser API stubs (same set as scripts/smoke-perf.mjs) ---
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
    window.requestIdleCallback ||
    ((cb) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 60));
  window.cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
  window.scrollTo = window.scrollTo || (() => {});
  window.HTMLElement.prototype.scrollIntoView =
    window.HTMLElement.prototype.scrollIntoView || (() => {});

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

  // Head bootstrap scripts run at parse time in a real browser —
  // reproduce that order.
  const bootMatch = html.match(
    /<script>\s*document\.documentElement\.classList\.add\("cv-boot"\)[\s\S]*?<\/script>/
  );
  if (bootMatch) window.eval(bootMatch[0].replace(/^<script>|<\/script>$/g, ""));

  // Visitor preferences (e.g. stored language — used by the RTL test).
  for (const [k, v] of Object.entries(storage ?? {})) {
    window.localStorage.setItem(k, v);
  }

  // Hermetic network.
  const offlineFetch = () =>
    Promise.resolve(
      new Response("{}", { status: 200, headers: { "content-type": "application/json" } })
    );
  globalThis.fetch = offlineFetch;
  window.fetch = offlineFetch;
  if (window.navigator && !window.navigator.sendBeacon) {
    window.navigator.sendBeacon = () => true;
  }

  const doc = window.document;

  // --- helpers ------------------------------------------------
  const snapshot = () => {
    const bodyText = doc.body?.textContent ?? "";
    const h1s = [...doc.querySelectorAll("h1")].map((h) =>
      (h.textContent ?? "").trim()
    );
    const canonicals = [
      ...doc.head?.querySelectorAll('link[rel="canonical"]') ?? [],
    ].map((l) => l.getAttribute("href"));
    const robots = doc.head?.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
    const root = doc.getElementById("root");
    const buttons = [...(root?.querySelectorAll("button") ?? [])]
      .slice(0, 20)
      .map((b) => (b.textContent ?? "").replace(/\s+/g, " ").trim());
    return {
      pathname: window.location.pathname,
      dir: doc.documentElement.getAttribute("dir"),
      htmlLang: doc.documentElement.getAttribute("lang"),
      idx: (window.history.state && window.history.state.idx) ?? null,
      historyLength: window.history.length,
      h1: h1s,
      h2: doc.querySelectorAll("h2").length,
      elementCount: doc.querySelectorAll("*").length,
      rootElementCount: root ? root.querySelectorAll("*").length : 0,
      textLength: bodyText.length,
      bodyText: bodyText.slice(0, 20000),
      canonicals,
      robots,
      dialogCount: doc.querySelectorAll('[role="dialog"]').length,
      bodyOverflow: doc.body.style.overflow || null,
      homepage: {
        hero: bodyText.includes("FIND YOUR PERFECT"),
        discover: bodyText.includes("AUTOMOTIVE DATABASE"),
        popular: bodyText.includes("POPULAR CARS"),
        rankings: Boolean(doc.getElementById("rankings")),
        howto: Boolean(doc.getElementById("how-to")),
        stories: Boolean(doc.getElementById("stories")),
      },
      links: {
        car: doc.querySelectorAll('a[href^="/car/"]').length,
        story: doc.querySelectorAll('a[href^="/story/"]').length,
        explore: doc.querySelectorAll('a[href^="/explore"]').length,
        brands: doc.querySelectorAll('a[href^="/brands"]').length,
        news: doc.querySelectorAll('a[href^="/news"]').length,
      },
      buttons,
      pageErrors,
    };
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const clickSelector = (selector) => {
    const el = doc.querySelector(selector);
    if (!el) throw new Error(`click: no element matches ${selector}`);
    el.dispatchEvent(
      new window.MouseEvent("click", { bubbles: true, cancelable: true, view: window })
    );
    return el.getAttribute("href") ?? null;
  };

  const clickButtonWithText = (text) => {
    const el = [...doc.querySelectorAll("button")].find((b) =>
      (b.textContent ?? "").toUpperCase().includes(text.toUpperCase())
    );
    if (!el) throw new Error(`click: no button contains "${text}"`);
    el.dispatchEvent(
      new window.MouseEvent("click", { bubbles: true, cancelable: true, view: window })
    );
    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  };

  // --- boot the built entry chunk (relative chunk imports resolve
  // --- from dist/assets exactly as in the browser)
  const entryMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
  if (!entryMatch) throw new Error("no entry module script in page");
  const entryAbs = path.join(DIST, entryMatch[1].replace(/^\//, ""));
  await import(pathToFileURL(entryAbs).href);
  await wait(1200);

  const results = [];
  const act = async (action) => {
    if (action.type === "click") {
      const href = clickSelector(action.selector);
      await wait(900);
      results.push({ action: `click ${action.selector}`, clickedHref: href, snap: snapshot() });
    } else if (action.type === "clickButton") {
      const label = clickButtonWithText(action.text);
      await wait(900);
      results.push({ action: `clickButton ${action.text}`, clicked: label, snap: snapshot() });
    } else if (action.type === "history") {
      if (action.op === "forward") window.history.forward();
      else if (action.op === "back") window.history.back();
      else throw new Error(`unknown history op ${action.op}`);
      await wait(900);
      results.push({ action: `history.${action.op}`, snap: snapshot() });
    } else {
      throw new Error(`unknown action ${action.type}`);
    }
  };

  const initial = snapshot();
  for (const action of actions ?? []) await act(action);

  process.stdout.write(`CVH:${JSON.stringify({ initial, results })}\n`);
  window.close();
}

// ============================================================
// Parent — scenarios + assertions
// ============================================================
async function main() {
  if (!existsSync(DIST)) {
    console.error("[verify-hydrated] dist/ not found — run `npm run build` first.");
    process.exit(1);
  }

  // The prerenderer escapes entity characters (& < > " ') — decode so
  // all comparisons are against real text, not markup.
  const decodeHtml = (s) =>
    String(s)
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

  // ------------------------------------------------------------------
  // [1] Static (prerendered) checks (skipped in measure mode)
  // ------------------------------------------------------------------
  const carFiles = readdirSync(path.join(DIST, "car")).filter((f) => f.endsWith(".html"));
  const storyFiles = readdirSync(path.join(DIST, "story")).filter((f) => f.endsWith(".html"));

  if (!MEASURE_ONLY) {
    console.log("\n[1] Prerendered HTML checks");
    assert(carFiles.length === 509, `exactly 509 car pages prerendered (${carFiles.length})`);
    assert(storyFiles.length > 0, `${storyFiles.length} story pages prerendered`);

    // Read every prerendered detail page once; the raw HTML is reused by
    // the static checks below AND by the hydrated-scenario assertions.
    const detailHtml = new Map();
    for (const f of carFiles) detailHtml.set(`car/${f}`, readFileSync(path.join(DIST, "car", f), "utf8"));
    for (const f of storyFiles) detailHtml.set(`story/${f}`, readFileSync(path.join(DIST, "story", f), "utf8"));

    const h1Of = (html) => html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "";
    const titleOf = (html) => html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";

    // Structural rule: exactly one <h1> in every prerendered detail page.
    const badH1 = [];
    for (const [f, html] of detailHtml) {
      const n = [...html.matchAll(/<h1>/g)].length;
      if (n !== 1) badH1.push(`${f}: ${n} H1`);
    }
    assert(badH1.length === 0, `every car/story prerendered page has exactly 1 H1${badH1.length ? ` — ${badH1.slice(0, 5).join(" | ")}` : ""}`);

    // STRICT H1 contract, all 509 car pages: the prerendered H1 must be
    // byte-identical (decoded text) to what the hydrated DOM renders —
    // CarDetail.tsx renders `{car.brand} {car.model}` with NO year, and
    // the <title> stamped by the same build is
    // `{brand} {model} ({year}) — CarVibes`, so the expected H1 is the
    // title minus that suffix. This can never drift from the data.
    const h1Mismatch = [];
    const h1WithYear = [];
    for (const [f, html] of detailHtml) {
      if (!f.startsWith("car/")) continue;
      const h1 = decodeHtml(h1Of(html)).trim();
      const expected = decodeHtml(titleOf(html).replace(/ \(\d{4}\) — CarVibes$/, "")).trim();
      if (h1 !== expected) h1Mismatch.push(`${f}: "${h1}" ≠ title-derived "${expected}"`);
      if (/\(\d{4}\)\s*$/.test(h1)) h1WithYear.push(f);
    }
    assert(
      h1Mismatch.length === 0,
      `all 509 prerendered car H1s are exactly "brand model" (no year)${h1Mismatch.length ? ` — ${h1Mismatch.slice(0, 3).join(" | ")}` : ""}`
    );
    assert(h1WithYear.length === 0, `no prerendered car H1 ends with (year)${h1WithYear.length ? ` — ${h1WithYear.slice(0, 3).join(", ")}` : ""}`);

    // Same contract for stories: prerendered H1 == title minus suffix.
    const storyH1Mismatch = [];
    for (const [f, html] of detailHtml) {
      if (!f.startsWith("story/")) continue;
      const h1 = decodeHtml(h1Of(html)).trim();
      const expected = decodeHtml(titleOf(html).replace(/ — CarVibes$/, "")).trim();
      if (h1 !== expected) storyH1Mismatch.push(`${f}: "${h1}" ≠ "${expected}"`);
    }
    assert(
      storyH1Mismatch.length === 0,
      `all ${storyFiles.length} prerendered story H1s are exactly the story title${storyH1Mismatch.length ? ` — ${storyH1Mismatch.slice(0, 3).join(" | ")}` : ""}`
    );

    const forty = readFileSync(path.join(DIST, "404.html"), "utf8");
    assert(!forty.includes('rel="canonical"'), "404.html carries NO canonical");
    assert(/<meta name="robots" content="noindex/.test(forty), "404.html is noindex");
    assert((forty.match(/<h1>/g) ?? []).length === 1, "404.html has exactly 1 H1");
    assert(!forty.includes("FIND YOUR PERFECT"), "404.html has no homepage content");

    const sitemap = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
    const locs = sitemap.match(/<loc>/g)?.length ?? 0;
    assert(
      locs === 509 + storyFiles.length + 10,
      `sitemap lists 509 cars + ${storyFiles.length} stories + 10 static pages (${locs})`
    );
  }

  // ------------------------------------------------------------------
  // [2] Hydrated DOM scenarios (child process each)
  // ------------------------------------------------------------------
  const carId =
    (carFiles.find((f) => f.startsWith("ferrari-812-superfast.")) ?? carFiles[0]).replace(/\.html$/, "");
  const carRoute = `/car/${carId}`;
  const carFile = `car/${carId}.html`;
  const storyId = storyFiles[0].replace(/\.html$/, "");
  const storyFile = `story/${storyId}.html`;
  const storyRoute = `/story/${storyId}`;

  // Required samples: a BMW, a Ferrari (scenario A) and an electric car
  // with a known year. Picked straight from the prerendered pages.
  const pickCar = (test) => {
    for (const f of carFiles) {
      const html = readFileSync(path.join(DIST, "car", f), "utf8");
      if (test(html)) return { id: f.replace(/\.html$/, ""), file: `car/${f}` };
    }
    return null;
  };
  const bmwCar = pickCar((h) => h.includes("<h1>BMW "));
  const evCar = pickCar((h) => h.includes("<td>Electric</td>"));

  const scenarios = [
    {
      name: `A. direct ${carRoute}`,
      spec: { file: carFile, url: `https://carvibes.dev${carRoute}`, actions: [] },
    },
    ...(bmwCar
      ? [{
          name: `A2. direct /car/${bmwCar.id} (BMW sample)`,
          spec: { file: bmwCar.file, url: `https://carvibes.dev/car/${bmwCar.id}`, actions: [] },
        }]
      : []),
    ...(evCar
      ? [{
          name: `A3. direct /car/${evCar.id} (EV sample, year available)`,
          spec: { file: evCar.file, url: `https://carvibes.dev/car/${evCar.id}`, actions: [] },
        }]
      : []),
    {
      name: `B. direct ${storyRoute} + start reading`,
      spec: {
        file: storyFile,
        url: `https://carvibes.dev${storyRoute}`,
        actions: [{ type: "clickButton", text: "START STORY" }],
      },
    },
    {
      name: "C. 404 on /car/not-a-real-car",
      spec: {
        file: "index.html",
        url: "https://carvibes.dev/car/not-a-real-car",
        actions: [],
      },
    },
    {
      name: "D. 404 on /this-route-does-not-exist",
      spec: {
        file: "index.html",
        url: "https://carvibes.dev/this-route-does-not-exist",
        actions: [],
      },
    },
    {
      name: "E. homepage → car → CLOSE (back) → forward",
      spec: {
        file: "index.html",
        url: "https://carvibes.dev/",
        actions: [
          { type: "click", selector: 'a[href^="/car/"]' },
          { type: "clickButton", text: "CLOSE" },
          { type: "history", op: "forward" },
        ],
      },
    },
    {
      name: "F. direct car (idx=0) → CLOSE → home (replace)",
      spec: {
        file: carFile,
        url: `https://carvibes.dev${carRoute}`,
        actions: [{ type: "clickButton", text: "CLOSE" }],
      },
    },
    {
      name: "G. homepage → story → CLOSE (back)",
      spec: {
        file: "index.html",
        url: "https://carvibes.dev/",
        actions: [
          { type: "click", selector: 'a[href^="/story/"]' },
          { type: "clickButton", text: "STORIES" },
        ],
      },
    },
    {
      name: "H. explore → car (direct /explore landing)",
      spec: {
        file: "explore.html",
        url: "https://carvibes.dev/explore",
        actions: [{ type: "click", selector: 'a[href^="/car/"]' }],
      },
    },
    {
      name: "I. RTL (ar) on the car page",
      spec: {
        file: carFile,
        url: `https://carvibes.dev${carRoute}`,
        storage: { "carvibes.lang": "ar" },
        actions: [],
      },
    },
  ];

  // Measure mode only needs the weight/H1 baseline scenarios — the
  // 404 and story-flow scenarios assert NEW behaviour that the
  // previous revision does not have (e.g. story cards are not anchors
  // there), so running them against an old build would just crash.
  const activeScenarios = MEASURE_ONLY
    ? scenarios.filter((s) => /^[ABE]\./.test(s.name))
    : scenarios;

  const results = {};
  for (const sc of activeScenarios) {
    console.log(`\n[2] ${sc.name}`);
    const r = spawnSync(
      process.execPath,
      [fileURLToPath(import.meta.url), "--worker", JSON.stringify(sc.spec)],
      { encoding: "utf8", timeout: 120_000, cwd: ROOT }
    );
    const line = (r.stdout ?? "").split("\n").filter((l) => l.startsWith("CVH:")).pop();
    if (!line) {
      if (MEASURE_ONLY) console.error(`  (scenario unavailable in this build: ${(r.stderr ?? "").split("\n").pop()})`);
      else fail(`scenario crashed: ${(r.stderr ?? "").slice(-400)}`);
      continue;
    }
    const parsed = JSON.parse(line.slice(4));
    results[sc.name] = parsed;

    if (MEASURE_ONLY) {
      const s = parsed.initial;
      console.log(
        `    ${s.pathname.padEnd(30)} H1=${s.h1.length} root=${s.rootElementCount} ` +
          `text=${s.textLength} canonical=${(s.canonicals[0] ?? "none").slice(0, 48)} ` +
          `robots=${s.robots ?? "-"} homepageBehind=${
            s.homepage.hero || s.homepage.discover || s.homepage.popular
          }`
      );
    }
  }

  // ------------------------------------------------------------------
  // [3] Assertions on the hydrated DOM
  // ------------------------------------------------------------------
  if (!MEASURE_ONLY) {
    const noHome = (s, label) => {
      const h = s.homepage;
      assert(
        !h.hero && !h.discover && !h.popular && !h.rankings && !h.howto && !h.stories,
        `${label}: NO homepage content in hydrated DOM`
      );
    };

    // Shared contract for every /car/:id scenario: exactly 1 H1, and
    // that H1 is STRICTLY equal (same text) to the prerendered one.
    // CarDetail renders `{brand} {model}` — no year in the H1; the year
    // stays on the page in the meta line under the H1.
    const assertCarContract = (label, s, htmlFile) => {
      const html = readFileSync(path.join(DIST, htmlFile), "utf8");
      const preH1 = decodeHtml(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "").trim();
      assert(s.h1.length === 1, `${label}: exactly 1 H1 after hydration (${JSON.stringify(s.h1)})`);
      assert(
        s.h1[0] === preH1,
        `${label}: H1 STRICTLY equal prerendered vs hydrated ("${s.h1[0] ?? ""}" / "${preH1}")`
      );
      assert(!/\(\d{4}\)\s*$/.test(s.h1[0] ?? ""), `${label}: H1 carries no year`);
      const year = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.match(/ \((\d{4})\)/)?.[1];
      if (year) {
        assert(
          new RegExp(`\\b${year}\\b`).test(s.bodyText ?? ""),
          `${label}: year ${year} (available in data) still visible on the page, outside the H1`
        );
      }
      noHome(s, label);
      assert(s.dialogCount === 0, `${label}: no role=dialog (not an overlay)`);
      assert(s.bodyOverflow === null || s.bodyOverflow === "", `${label}: body scroll NOT locked`);
    };

    // A — dedicated car page (the Ferrari sample)
    const a = results[`A. direct ${carRoute}`];
    if (a) {
      const s = a.initial;
      assertCarContract("A", s, carFile);
      assert(
        s.h1[0]?.toLowerCase().startsWith(carRoute.split("/")[2].split("-")[0]),
        `A: H1 starts with the car's brand (${s.h1[0]})`
      );
      assert(
        s.canonicals.length === 1 &&
          s.canonicals[0] === `https://carvibes.dev${carRoute}`,
        `A: self-referencing canonical (${s.canonicals[0] ?? "none"})`
      );
      assert(s.robots === null, "A: indexable (no robots noindex)");
      assert(s.idx === 0, "A: direct landing => history idx 0");
      assert(s.links.car > 0, `A: crawlable /car/ links present (${s.links.car})`);
      assert(s.links.explore > 0 && s.links.brands > 0, "A: crawlable Explore + Brands links");
      assert(
        s.buttons.some((b) => b.toUpperCase().startsWith("CLOSE")),
        "A: CLOSE button still visible on direct landing"
      );
    } else fail("A: missing scenario result");

    // A2 — BMW sample, A3 — EV sample (both with a year in the data)
    for (const [label, name, file] of [
      ["A2", `A2. direct /car/${bmwCar?.id ?? "?"} (BMW sample)`, bmwCar?.file],
      ["A3", `A3. direct /car/${evCar?.id ?? "?"} (EV sample, year available)`, evCar?.file],
    ]) {
      if (!file) {
        fail(`${label}: sample car not found in the build`);
        continue;
      }
      const v = results[name];
      if (v) assertCarContract(label, v.initial, file);
      else fail(`${label}: missing scenario result`);
    }

    // B — dedicated story page
    const b = Object.values(results).find((v) => v.initial.pathname.startsWith("/story/"));
    if (b) {
      const s = b.initial;
      const storyId = s.pathname.split("/")[2];
      const storyHtml = readFileSync(path.join(DIST, "story", `${storyId}.html`), "utf8");
      const prerenderH1 = decodeHtml(storyHtml.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] ?? "").trim();
      assert(s.h1.length === 1, `B: exactly 1 H1 after hydration (${JSON.stringify(s.h1)})`);
      assert(
        s.h1[0] === prerenderH1,
        `B: story H1 STRICTLY equal prerendered vs hydrated — no divergence ("${s.h1[0] ?? ""}" / "${prerenderH1.slice(0, 60)}")`
      );
      noHome(s, "B");
      assert(s.dialogCount === 0, "B: no role=dialog (not an overlay anymore)");
      assert(s.bodyOverflow === null || s.bodyOverflow === "", "B: body scroll NOT locked");
      assert(
        s.canonicals.length === 1 &&
          s.canonicals[0] === `https://carvibes.dev${s.pathname}`,
        `B: self-referencing canonical (${s.canonicals[0] ?? "none"})`
      );
      assert(s.links.news > 0 && s.links.explore > 0, "B: crawlable Stories + Explore exit links");
      // The cinematic reader reveals chapters + related stories after
      // one explicit click (by design); from then on every internal
      // link is a real crawlable <a>.
      const started = b.results.find((r) => r.action?.includes("START STORY"));
      assert(
        Boolean(started?.snap) && started.snap.links.story > 0,
        `B: after starting, crawlable /story/ links present (${started?.snap.links.story})`
      );
      assert(
        (started?.snap.h2 ?? 0) > 0 &&
          started.snap.textLength - s.textLength > 400,
        `B: starting the reader exposes the chapters (${started?.snap.h2} H2, +${(started?.snap.textLength ?? 0) - s.textLength} chars)`
      );
    } else fail("B: missing scenario result");

    // C + D — invalid routes
    for (const key of ["C. 404 on /car/not-a-real-car", "D. 404 on /this-route-does-not-exist"]) {
      const v = results[key];
      if (!v) {
        fail(`${key}: missing scenario result`);
        continue;
      }
      const s = v.initial;
      assert(/noindex/.test(s.robots ?? ""), `${key}: robots noindex (${s.robots})`);
      assert(s.canonicals.length === 0, `${key}: NO canonical on 404`);
      assert(s.h1.length === 1, `${key}: 1 H1 on 404 (${JSON.stringify(s.h1)})`);
      assert(s.h1[0]?.toUpperCase().includes("NOT FOUND"), `${key}: H1 is the 404 title`);
      noHome(s, key);
      assert(!v.initial.pageErrors.length, `${key}: no uncaught JS errors`);
    }

    // E — homepage → car → CLOSE → forward
    const e = results["E. homepage → car → CLOSE (back) → forward"];
    if (e) {
      assert(e.initial.homepage.hero, "E: homepage renders on direct load");
      assert(e.initial.h1.length === 1, "E: homepage has exactly 1 H1");
      const afterClick = e.results[0];
      assert(afterClick?.clickedHref?.startsWith("/car/"), `E: clicked a real /car/ link (${afterClick?.clickedHref})`);
      assert(afterClick.snap.pathname === afterClick.clickedHref, "E: URL is the car page");
      assert(afterClick.snap.h1.length === 1, "E: car page has 1 H1 after in-app nav");
      assert(afterClick.snap.idx === 1, "E: in-app navigation pushed history (idx=1)");
      const afterClose = e.results[1];
      assert(afterClose?.snap.pathname === "/", "E: CLOSE with history goes back home");
      assert(afterClose.snap.idx === 0, "E: back to idx 0");
      assert(afterClose.snap.homepage.hero, "E: homepage rendered again (not the car overlay)");
      const afterFwd = e.results[2];
      assert(afterFwd?.snap.pathname === afterClick.clickedHref, "E: browser forward returns to the car");
      assert(afterFwd?.snap.h1.length === 1, "E: forward renders the car page again");
    } else fail("E: missing scenario result");

    // F — direct car, CLOSE with idx=0 => home via replace
    const f = results["F. direct car (idx=0) → CLOSE → home (replace)"];
    if (f) {
      assert(f.initial.idx === 0, "F: direct landing idx=0");
      const afterClose = f.results[0];
      assert(afterClose?.snap.pathname === "/", "F: CLOSE with idx=0 goes to /");
      assert(
        afterClose?.snap.historyLength === f.initial.historyLength,
        `F: history entry REPLACED (length ${f.initial.historyLength} → ${afterClose?.snap.historyLength})`
      );
      assert(afterClose?.snap.homepage.hero, "F: homepage rendered after CLOSE");
    } else fail("F: missing scenario result");

    // G — homepage → story → CLOSE
    const g = results["G. homepage → story → CLOSE (back)"];
    if (g) {
      const afterClick = g.results[0];
      assert(afterClick?.clickedHref?.startsWith("/story/"), `G: clicked a real /story/ link (${afterClick?.clickedHref})`);
      assert(afterClick?.snap.h1.length === 1, "G: story page has 1 H1 after in-app nav");
      const afterClose = g.results[1];
      assert(afterClose?.snap.pathname === "/", "G: CLOSE goes back home");
    } else fail("G: missing scenario result");

    // H — explore (dedicated route) → car
    const h = results["H. explore → car (direct /explore landing)"];
    if (h) {
      const afterClick = h.results[0];
      assert(afterClick?.clickedHref?.startsWith("/car/"), `H: explore cards are real /car/ links (${afterClick?.clickedHref})`);
      assert(afterClick?.snap.h1.length === 1, "H: car page has 1 H1 after explore nav");
      assert(!afterClick?.snap.homepage.hero, "H: no homepage behind the car page");
    } else fail("H: missing scenario result");

    // I — Arabic / RTL
    const i = results["I. RTL (ar) on the car page"];
    if (i) {
      const s = i.initial;
      assert(s.dir === "rtl", `I: <html dir="rtl"> for Arabic (dir=${s.dir})`);
      assert(s.htmlLang === "ar", `I: <html lang="ar"> (lang=${s.htmlLang})`);
      assert(s.h1.length === 1, `I: exactly 1 H1 in RTL (${JSON.stringify(s.h1)})`);
      assert(!s.homepage.hero && !s.homepage.discover, "I: no homepage behind the RTL car page");
      assert(
        s.buttons.some((b) => /إغلاق/.test(b)),
        "I: CLOSE button is translated (Arabic)"
      );
    } else fail("I: missing scenario result");

    // ------------------------------------------------------------------
    // [4] DOM weight comparison
    // ------------------------------------------------------------------
    console.log("\n[4] DOM weight (hydrated element counts)");
    const homeV = e?.initial ?? null;
    const carV = results[`A. direct ${carRoute}`];
    const storyV = results[`B. direct ${storyRoute} + start reading`];
    const notFoundV = results["C. 404 on /car/not-a-real-car"]?.initial;

    const table = [];
    if (homeV) table.push(["homepage /", homeV.rootElementCount]);
    if (carV) table.push([`car ${carV.initial.pathname}`, carV.initial.rootElementCount]);
    if (storyV) table.push([`story ${storyV.initial.pathname}`, storyV.initial.rootElementCount]);
    if (notFoundV) table.push(["404", notFoundV.rootElementCount]);
    for (const [label, count] of table) console.log(`    ${label.padEnd(34)} ${count} elements`);

    if (homeV && carV) {
      // The legacy architecture rendered the FULL homepage plus the car
      // sheet as an overlay; the sheet DOM is essentially what the new
      // car page renders (same component). So legacy ≈ home + car.
      const legacyEstimate = homeV.rootElementCount + carV.initial.rootElementCount;
      const saved = legacyEstimate - carV.initial.rootElementCount;
      console.log(
        `    legacy /car/:id ≈ home + sheet = ${legacyEstimate} elements; new = ${carV.initial.rootElementCount} (−${saved}, −${Math.round((saved / legacyEstimate) * 100)}%)`
      );
      assert(
        carV.initial.rootElementCount < homeV.rootElementCount,
        "car page DOM is lighter than the homepage alone"
      );
    }
  }

  // ------------------------------------------------------------------
  console.log(
    failures === 0
      ? `\nVERIFY-HYDRATED PASSED — ${checks} check(s) OK${MEASURE_ONLY ? " (measure-only)" : ""}.`
      : `\nVERIFY-HYDRATED FAILED — ${failures}/${checks} check(s) failed.`
  );
  process.exit(failures === 0 ? 0 : 1);
}

// ============================================================
if (process.argv[2] === "--worker") {
  runWorker(JSON.parse(process.argv[3])).catch((err) => {
    console.error("worker error:", err);
    process.exit(2);
  });
} else {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
