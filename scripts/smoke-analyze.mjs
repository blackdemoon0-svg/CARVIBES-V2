// ============================================================
// CARVIBES ANALYSE — runtime smoke test
//
// `tsc` proves the types line up; this proves the module runs. It
// bundles the REAL engines with esbuild and exercises them in Node:
//
//   1. country registry: currency + mileage unit per country
//   2. currency layer: conversion, formatting, miles/km
//   3. local car (FR→FR): no import, EUR, km
//   4. imported car (US→MA): USD→MAD, miles, import totals
//   5. analysis without photos vs with photos
//   6. incomplete data lowers confidence
//   7. verdict / score ranges
//   8. i18n key parity across en / fr / es
//
// Usage: node scripts/smoke-analyze.mjs   (or: npm run smoke:analyze)
// ============================================================
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const failures = [];
const bad = (msg) => failures.push(msg);
let checks = 0;
const ok = (cond, msg) => {
  checks += 1;
  if (!cond) bad(msg);
};

function baseVehicle() {
  return {
    brand: "BMW",
    model: "330i",
    version: "M Sport",
    year: 2020,
    generation: "G20",
    engine: "2.0 turbo petrol",
    displacement: "1998 cm³",
    fuel: "Petrol",
    transmission: "Automatic",
    gearbox: "ZF 8HP",
    mileage: 64000,
    mileageUnit: "miles",
    askingPrice: 22500,
    askingCurrency: "USD",
    vin: "",
    owners: "2",
    maintenance: "Dealer serviced, last service at 58,000 miles.",
    accident: "None declared",
    keys: "2",
    inspection: "",
    sellerDescription: "Beautiful BMW 330i M Sport, never crashed, always garage kept.",
  };
}

function baseRequest() {
  return {
    id: "az_test",
    vehicle: baseVehicle(),
    vehicleCountry: "US",
    vehicleRegion: "Los Angeles, CA",
    destinationCountry: "MA",
    photos: [],
    declaredDefects: [],
    createdAt: Date.now(),
  };
}

function photo(id, category) {
  return { id, category, name: `${id}.jpg`, ref: `${category}_${id}`, addedAt: Date.now() };
}

async function main() {
  const outDir = path.join(ROOT, "node_modules", ".cache", "carvibes-smoke-analyze");
  mkdirSync(outDir, { recursive: true });
  const entry = path.join(outDir, "entry.ts");
  const outfile = path.join(outDir, "bundle.mjs");
  writeFileSync(
    entry,
    [
      `import { analyzeCountry, ANALYZE_COUNTRIES } from ${JSON.stringify(path.join(ROOT, "src/features/analyze/countries.ts"))};`,
      `import { convertCurrency, formatMoney, formatRange, toKm, fromKm, roundPrice, CURRENCIES } from ${JSON.stringify(path.join(ROOT, "src/features/analyze/currency.ts"))};`,
      `import { runAnalysis, estimatePrice, estimateImport, analyzeVisual, computeConfidence } from ${JSON.stringify(path.join(ROOT, "src/features/analyze/engines.ts"))};`,
      `export { analyzeCountry, ANALYZE_COUNTRIES, convertCurrency, formatMoney, formatRange, toKm, fromKm, roundPrice, CURRENCIES, runAnalysis, estimatePrice, estimateImport, analyzeVisual, computeConfidence };`,
    ].join("\n"),
    "utf8"
  );
  await build({ entryPoints: [entry], outfile, bundle: true, format: "esm", platform: "node" });
  const M = await import(pathToFileURL(outfile).href);

  // --- 1. country registry ---
  ok(M.analyzeCountry("US").currency === "USD", "US currency is USD");
  ok(M.analyzeCountry("US").mileageUnit === "miles", "US uses miles");
  ok(M.analyzeCountry("MA").currency === "MAD", "MA currency is MAD");
  ok(M.analyzeCountry("MA").mileageUnit === "km", "MA uses km");
  ok(M.analyzeCountry("GB").mileageUnit === "miles", "GB uses miles");
  ok(M.analyzeCountry("FR").currency === "EUR", "FR currency is EUR");
  ok(M.analyzeCountry("JP").currency === "JPY", "JP currency is JPY");
  ok(M.analyzeCountry("AE").currency === "AED", "AE currency is AED");
  ok(M.analyzeCountry("CA").currency === "CAD", "CA currency is CAD");
  ok(M.ANALYZE_COUNTRIES.filter((c) => c.popular).length >= 8, "popular countries exist");
  ok(M.analyzeCountry("XX").code === "US", "unknown country falls back to US");

  // --- 2. currency layer ---
  const mad = M.convertCurrency(18500, "USD", "MAD");
  ok(mad !== null && Math.abs(mad - 18500 * 10.05) < 1, `USD→MAD conversion sane (got ${mad})`);
  ok(M.convertCurrency(100, "USD", "USD") === 100, "identity conversion");
  ok(M.convertCurrency(100, "USD", "XXX") === null, "unknown currency returns null");
  const usd = M.formatMoney(18500, "USD");
  ok(usd.includes("$") && usd.includes("18"), `USD formats with $ (got ${usd})`);
  const madF = M.formatMoney(185925, "MAD");
  ok(madF.includes("DH"), `MAD formats with DH (got ${madF})`);
  ok(M.formatRange(16800, 18200, "USD") !== null, "range formats");
  ok(M.formatRange(null, 18200, "USD") === null, "range with null returns null");
  const km = M.toKm(64000, "miles");
  ok(Math.abs(km - 102995) < 5, `64,000 mi ≈ 102,995 km (got ${km})`);
  ok(M.toKm(100, "km") === 100, "km identity");
  ok(Math.abs(M.fromKm(km, "miles") - 64000) < 0.01, "miles round-trip");
  ok(M.roundPrice(18234) === 18250, "roundPrice steps");
  for (const code of ["USD", "CAD", "EUR", "GBP", "AED", "MAD", "JPY"]) {
    ok(M.CURRENCIES[code] !== undefined, `currency meta exists: ${code}`);
  }

  // --- 3. local car (FR→FR) ---
  const local = baseRequest();
  local.vehicleCountry = "FR";
  local.destinationCountry = "FR";
  local.vehicle.mileageUnit = "km";
  local.vehicle.mileage = 95000;
  local.vehicle.askingPrice = 24500;
  local.vehicle.askingCurrency = "EUR";
  const localRes = M.runAnalysis(local, [45000]);
  ok(localRes.importEstimate.needed === false, "local car: no import");
  ok(localRes.priceEstimate.currency === "EUR", "local car: EUR estimate");
  ok(localRes.priceEstimate.estimatedLow < localRes.priceEstimate.estimatedHigh, "local: band ordered");
  ok(localRes.priceEstimate.indicative === true, "estimate flagged indicative");

  // --- 4. imported car (US→MA, the reference case) ---
  const imp = baseRequest();
  const impRes = M.runAnalysis(imp, [41000]);
  ok(impRes.priceEstimate.currency === "USD", "US car priced in USD (never MAD as primary)");
  ok(impRes.importEstimate.needed === true, "US→MA: import needed");
  ok(impRes.importEstimate.vehicleCurrency === "USD", "import vehicle currency USD");
  ok(impRes.importEstimate.destinationCurrency === "MAD", "import destination currency MAD");
  ok(
    impRes.importEstimate.destTotalLow != null && impRes.importEstimate.destTotalLow > 150000,
    `MAD landed total sane (got ${impRes.importEstimate.destTotalLow})`
  );
  const duties = impRes.importEstimate.lines.find((l) => l.label.key === "az_import_duties");
  ok(duties && duties.low === null && duties.verified === false, "duties never invented, flagged unverified");
  ok(["GREAT", "STUDY", "NEGOTIATE", "AVOID"].includes(impRes.verdict), "verdict is valid");
  ok(impRes.overallScore >= 5 && impRes.overallScore <= 98, "score in 5–98");
  ok(impRes.sellerQuestions.length >= 3 && impRes.sellerQuestions.length <= 10, "3–10 seller questions");
  ok(impRes.checklist.length >= 5 && impRes.checklist.length <= 12, "5–12 checklist items");

  // --- 5. without photos vs with photos ---
  const noPhoto = M.runAnalysis(baseRequest(), [41000]);
  ok(
    noPhoto.visualFindings.some((f) => f.status === "UNVERIFIABLE"),
    "no photos → UNVERIFIABLE findings"
  );
  const withPhotos = baseRequest();
  withPhotos.photos = [
    photo("p1", "ext_front"), photo("p2", "ext_rear"), photo("p3", "ext_left"),
    photo("p4", "ext_right"), photo("p5", "int_cluster"), photo("p6", "eng_bay"),
    photo("p7", "under_body"), photo("p8", "doc_service"),
  ];
  withPhotos.declaredDefects = ["scratch"];
  const withPhotoRes = M.runAnalysis(withPhotos, [41000]);
  ok(
    withPhotoRes.visualFindings.some((f) => f.status === "OBSERVED"),
    "declared defect → OBSERVED finding"
  );
  ok(
    withPhotoRes.confidence > noPhoto.confidence,
    `photos raise confidence (${withPhotoRes.confidence} > ${noPhoto.confidence})`
  );
  // Declared rust must surface as HIGH observed (never a proven fault).
  const rusty = baseRequest();
  rusty.declaredDefects = ["rust", "warning_light"];
  const rustyRes = M.runAnalysis(rusty, [41000]);
  ok(
    rustyRes.visualFindings.some((f) => f.level === "HIGH" && f.status === "OBSERVED"),
    "rust/warning light → HIGH OBSERVED findings"
  );

  // --- 6. incomplete data lowers confidence ---
  const bare = baseRequest();
  bare.vehicle = {
    ...bare.vehicle, version: "", engine: "", fuel: "", transmission: "", mileage: null,
    askingPrice: null, vin: "", maintenance: "", sellerDescription: "",
  };
  const bareRes = M.runAnalysis(bare, []);
  ok(bareRes.confidence < impRes.confidence, "incomplete data lowers confidence");
  ok(bareRes.priceEstimate.position === "UNKNOWN", "no asking price → UNKNOWN position");
  ok(bareRes.confidenceLimits.length >= 3, "confidence limits listed");

  // --- 7. verdict / score sanity on an adverse case ---
  const adverse = baseRequest();
  adverse.vehicle.askingPrice = 45000; // strongly overpriced
  adverse.vehicle.maintenance = "";
  adverse.declaredDefects = ["rust", "visible_leak", "warning_light"];
  const advRes = M.runAnalysis(adverse, [41000]);
  ok(
    advRes.priceEstimate.position === "STRONGLY_OVERPRICED" || advRes.priceEstimate.position === "OVERPRICED",
    `overpricing detected (got ${advRes.priceEstimate.position})`
  );
  ok(advRes.verdict === "AVOID" || advRes.verdict === "NEGOTIATE", `adverse case punished (got ${advRes.verdict})`);
  ok(advRes.overallScore < impRes.overallScore, "adverse case scores lower");

  // --- 8. i18n key parity en/fr/es ---
  const dictDir = path.join(ROOT, "src", "lib", "i18n", "analyze");
  const dictEntry = path.join(outDir, "dict-entry.ts");
  const dictOut = path.join(outDir, "dict.mjs");
  writeFileSync(
    dictEntry,
    [
      `import en from ${JSON.stringify(path.join(dictDir, "en.ts"))};`,
      `import fr from ${JSON.stringify(path.join(dictDir, "fr.ts"))};`,
      `import es from ${JSON.stringify(path.join(dictDir, "es.ts"))};`,
      `export { en, fr, es };`,
    ].join("\n"),
    "utf8"
  );
  await build({ entryPoints: [dictEntry], outfile: dictOut, bundle: true, format: "esm", platform: "node" });
  const D = await import(pathToFileURL(dictOut).href);
  const enKeys = Object.keys(D.en);
  ok(enKeys.length > 200, `EN analyze dict is substantial (${enKeys.length} keys)`);
  for (const key of enKeys) {
    if (D.fr[key] === undefined) bad(`missing FR key: ${key}`);
    if (D.es[key] === undefined) bad(`missing ES key: ${key}`);
  }
  checks += 1;
  // Every key the engines emit must exist in EN.
  const probe = M.runAnalysis(
    (() => {
      const r = baseRequest();
      r.photos = [photo("p1", "ext_front")];
      r.declaredDefects = ["dent", "scratch", "rust", "paint_mismatch", "panel_gap", "tire_wear", "warning_light", "interior_wear", "visible_leak", "modification", "crack_glass"];
      r.vehicle.vin = "BADVIN";
      return r;
    })(),
    []
  );
  const emitted = new Set();
  const collect = (node) => {
    if (!node) return;
    if (Array.isArray(node)) return node.forEach(collect);
    if (typeof node === "object") {
      if (typeof node.key === "string") emitted.add(node.key);
      Object.values(node).forEach(collect);
    }
  };
  collect(probe);
  let missingEmitted = 0;
  for (const key of emitted) {
    if (D.en[key] === undefined) {
      bad(`engine emits unknown i18n key: ${key}`);
      missingEmitted++;
    }
  }
  checks += 1;
  ok(missingEmitted === 0, `all ${emitted.size} engine-emitted keys exist in EN`);

  // --- 9. report components render in en/fr/es with zero missing keys ---
  const reportEntry = path.join(outDir, "report-entry.tsx");
  const reportOut = path.join(outDir, "report.mjs");
  writeFileSync(
    reportEntry,
    [
      `import AnalysisReport from ${JSON.stringify(path.join(ROOT, "src/features/analyze/report/AnalysisReport.tsx"))};`,
      `import VehicleAnalysisForm from ${JSON.stringify(path.join(ROOT, "src/features/analyze/components/VehicleAnalysisForm.tsx"))};`,
      `export { AnalysisReport, VehicleAnalysisForm };`,
    ].join("\n"),
    "utf8"
  );
  await build({
    entryPoints: [reportEntry],
    outfile: reportOut,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    jsx: "automatic",
    loader: { ".css": "empty" },
    external: ["react", "react-dom", "react-dom/server", "react-router-dom"],
    logLevel: "silent",
  });
  const R = await import(pathToFileURL(reportOut).href);
  const React = (await import("react")).default;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const fullReq = baseRequest();
  fullReq.photos = [
    photo("p1", "ext_front"), photo("p2", "ext_rear"), photo("p3", "ext_left"),
    photo("p4", "ext_right"), photo("p5", "int_cluster"), photo("p6", "eng_bay"),
    photo("p7", "under_body"), photo("p8", "doc_service"),
  ];
  fullReq.declaredDefects = ["paint_mismatch", "tire_wear"];
  fullReq.vehicle.vin = "WBA5R7C50LFK12345";
  const fullRes = M.runAnalysis(fullReq, [41000]);
  for (const lang of ["en", "fr", "es"]) {
    let html = "";
    try {
      html = renderToStaticMarkup(
        React.createElement(R.AnalysisReport, {
          lang, request: fullReq, result: fullRes, onNew: () => {}, onEdit: () => {},
        })
      );
    } catch (e) {
      bad(`AnalysisReport crashed in ${lang}: ${e.message}`);
    }
    ok(html.length > 5000, `report renders substantially in ${lang} (${html.length} chars)`);
    ok(!html.includes("az_"), `no raw az_ i18n keys leak in ${lang} report`);
    ok(!html.includes("{count}") && !html.includes("{years}"), `no unrendered placeholders in ${lang}`);
    // Every wizard step renders without crashing.
    for (let step = 0; step <= 4; step += 1) {
      try {
        const form = renderToStaticMarkup(
          React.createElement(R.VehicleAnalysisForm, {
            lang, request: fullReq, step,
            onRequestChange: () => {}, onStepChange: () => {}, onAnalyze: () => {},
          })
        );
        ok(form.length > 1000, `${lang} form step ${step} renders (${form.length} chars)`);
        ok(!form.includes("az_"), `no raw az_ keys in ${lang} form step ${step}`);
      } catch (e) {
        bad(`VehicleAnalysisForm step ${step} crashed in ${lang}: ${e.message}`);
      }
    }
  }
  // Non-covered language falls back to English without crashing.
  try {
    const deHtml = renderToStaticMarkup(
      React.createElement(R.AnalysisReport, {
        lang: "de", request: fullReq, result: fullRes, onNew: () => {}, onEdit: () => {},
      })
    );
    ok(deHtml.includes("CarVibes Verdict"), "de falls back to English strings");
  } catch (e) {
    bad(`AnalysisReport crashed in de: ${e.message}`);
  }

  // --- 10. launch campaign: modal, persistence, CTA wiring ---
  const annEntry = path.join(outDir, "ann-entry.ts");
  const annOut = path.join(outDir, "ann.mjs");
  writeFileSync(
    annEntry,
    `import { shouldShowAnnouncement, dismissAnnouncement, resetAnnouncement, ANALYZE_LAUNCH } from ${JSON.stringify(path.join(ROOT, "src/lib/announcements.ts"))};
     export { shouldShowAnnouncement, dismissAnnouncement, resetAnnouncement, ANALYZE_LAUNCH };`,
    "utf8"
  );
  await build({ entryPoints: [annEntry], outfile: annOut, bundle: true, format: "esm", platform: "node", external: ["react", "react-dom"] });
  // Fake browser storage for the announcement system.
  const store = new Map();
  globalThis.window = globalThis.window ?? {};
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(k),
  };
  const A = await import(pathToFileURL(annOut).href);
  A.resetAnnouncement(A.ANALYZE_LAUNCH);
  ok(A.shouldShowAnnouncement(A.ANALYZE_LAUNCH) === true, "launch modal shows initially");
  A.dismissAnnouncement(A.ANALYZE_LAUNCH);
  ok(A.shouldShowAnnouncement(A.ANALYZE_LAUNCH) === false, "dismissal hides the modal");
  const afterQuiet = Date.now() + (A.ANALYZE_LAUNCH.quietDays + 1) * 86400000;
  ok(A.shouldShowAnnouncement(A.ANALYZE_LAUNCH, afterQuiet) === true, "modal re-arms after quiet period");
  A.resetAnnouncement(A.ANALYZE_LAUNCH);
  ok(A.shouldShowAnnouncement(A.ANALYZE_LAUNCH) === true, "reset restores visibility");
  delete globalThis.localStorage;

  // Wiring: /analyze route, nav badge, contextual CTAs.
  const appSrc = readFileSync(path.join(ROOT, "src/App.tsx"), "utf8");
  ok(appSrc.includes('path="/analyze"'), "App wires /analyze route");
  ok(appSrc.includes("AnalyzeLaunchModal"), "App mounts the launch modal");
  const navSrc = readFileSync(path.join(ROOT, "src/components/Navigation.tsx"), "utf8");
  ok(navSrc.includes("ANALYZE_LINK") && navSrc.includes("az_new_badge"), "nav shows badged Analyze entry");
  for (const [file, variant] of [
    ["src/components/universe/CarDetail.tsx", "car"],
    ["src/components/usedcars/UsedCarsPage.tsx", "used"],
    ["src/pages/marketplace/MarketplacePage.tsx", "marketplace"],
  ]) {
    const src = readFileSync(path.join(ROOT, file), "utf8");
    ok(src.includes("AnalyzePromoBanner") && src.includes(`variant="${variant}"`), `CTA banner (${variant}) in ${file}`);
  }
  const pageSrc = readFileSync(path.join(ROOT, "src/pages/AnalyzePage.tsx"), "utf8");
  ok(pageSrc.includes("useSearchParams") && pageSrc.includes("prefill"), "AnalyzePage supports CTA prefill");

  // Modal + banners render in en/fr/es with zero missing keys.
  const promoEntry = path.join(outDir, "promo-entry.tsx");
  const promoOut = path.join(outDir, "promo.mjs");
  writeFileSync(
    promoEntry,
    [
      `import AnalyzeLaunchModal from ${JSON.stringify(path.join(ROOT, "src/features/analyze/promo/AnalyzeLaunchModal.tsx"))};`,
      `import AnalyzePromoBanner from ${JSON.stringify(path.join(ROOT, "src/features/analyze/promo/AnalyzePromoBanner.tsx"))};`,
      `import { ensureLocale } from ${JSON.stringify(path.join(ROOT, "src/lib/i18n.ts"))};`,
      `export { AnalyzeLaunchModal, AnalyzePromoBanner, ensureLocale };`,
    ].join("\n"),
    "utf8"
  );
  await build({
    entryPoints: [promoEntry], outfile: promoOut, bundle: true, format: "esm",
    platform: "node", target: "node18", jsx: "automatic",
    loader: { ".css": "empty" },
    external: ["react", "react-dom", "react-dom/server", "react-router-dom"],
    logLevel: "silent",
  });
  const P = await import(pathToFileURL(promoOut).href);
  const { MemoryRouter } = await import("react-router-dom");
  for (const lang of ["en", "fr", "es"]) {
    await P.ensureLocale(lang);
    const modal = renderToStaticMarkup(
      React.createElement(MemoryRouter, null,
        React.createElement(P.AnalyzeLaunchModal, { lang, open: true, onClose: () => {} }))
    );
    ok(modal.length > 800, `launch modal renders in ${lang} (${modal.length} chars)`);
    ok(modal.includes(D[lang]["az_launch_cta"]), `modal keeps localized HTML CTA in ${lang}`);
    ok(modal.includes(D[lang]["az_launch_text"]), `modal keeps localized short text in ${lang}`);
    ok(!modal.includes("az_"), `no raw az_ keys in ${lang} modal`);
    ok(modal.includes(`/images/analyze-launch-${lang}.jpg`), `modal embeds ${lang} campaign visual`);
    ok(modal.includes("az-launch-title"), `modal keeps an accessible title (${lang})`);
    for (const variant of ["car", "used", "marketplace"]) {
      const banner = renderToStaticMarkup(
        React.createElement(MemoryRouter, null,
          React.createElement(P.AnalyzePromoBanner, { lang, variant }))
      );
      ok(banner.includes("/analyze"), `${variant} banner links to /analyze (${lang})`);
      ok(!banner.includes("az_"), `no raw az_ keys in ${variant} banner (${lang})`);
    }
  }

  // --- 11. simplified photos: 3 essentials only ---
  const simple = baseRequest();
  simple.photos = [photo("f", "ext_front"), photo("r", "ext_rear"), photo("i", "int_dashboard")];
  const simpleRes = M.runAnalysis(simple, [41000]);
  ok(["GREAT", "STUDY", "NEGOTIATE", "AVOID"].includes(simpleRes.verdict), "3-photo analysis yields a verdict");
  ok(simpleRes.confidence > M.runAnalysis(baseRequest(), [41000]).confidence, "3 photos beat zero photos");
  ok(simpleRes.sellerQuestions.length >= 3, "3-photo analysis still asks seller questions");

  // --- 12. long free-text fields: no artificial limits ---
  const formSrc = readFileSync(path.join(ROOT, "src/features/analyze/components/VehicleAnalysisForm.tsx"), "utf8");
  const lowLimits = (formSrc.match(/maxLength=\{(\d+)\}/g) ?? []).filter((m) => Number(m.replace(/\D/g, "")) < 17);
  ok(lowLimits.length === 0, `no artificially low maxLength in form (${lowLimits.join(",") || "none"})`);
  const longDesc = baseRequest();
  longDesc.vehicle.sellerDescription = "Full service history at BMW. ".repeat(200); // ~5,400 chars
  longDesc.vehicle.maintenance = "Dealer serviced every year. ".repeat(100);
  let longRes = null;
  try {
    longRes = M.runAnalysis(longDesc, [41000]);
  } catch (e) {
    bad(`long-text analysis crashed: ${e.message}`);
  }
  ok(longRes !== null && longRes.listing.hasListing === true, "5k-char listing analyzes fine");
  ok(longRes !== null && longRes.listing.claims.length > 0, "claims detected in long listing");

  rmSync(outDir, { recursive: true, force: true });

  if (failures.length > 0) {
    console.error(`\n❌ smoke-analyze: ${failures.length}/${checks} checks failed:`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`✅ smoke-analyze: ${checks} checks passed.`);
}

main().catch((e) => {
  console.error("❌ smoke-analyze crashed:", e);
  process.exit(1);
});
