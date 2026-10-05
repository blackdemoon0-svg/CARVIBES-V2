// ============================================================
// CARVIBES ANALYSE — analysis engines (pure, testable)
//
// No React, no DOM, no t() here: engines return structured data
// carrying i18n keys, resolved by the UI. Every engine follows the
// honesty contract: OBSERVED / PROBABLE / TO_VERIFY / UNVERIFIABLE.
// Costs are ranges or null — never invented precise figures.
// ============================================================

import {
  brandProfile,
  CONFIG_RULES,
  depreciationFactor,
  MILEAGE_MILESTONES,
  mileageFactor,
  shippingBand,
  TIER_NEW_PRICE_USD,
} from "./knowledge";
import { analyzeCountry } from "./countries";
import { convertCurrency, getRates, toKm } from "./currency";
import type {
  AnalysisRequest,
  AnalysisResult,
  DeclaredDefect,
  I18nText,
  ImportEstimate,
  ImportLine,
  Inconsistency,
  ListingAnalysis,
  MechanicalRisk,
  ObservationLevel,
  PhotoCategory,
  PriceEstimate,
  PricePosition,
  SubScores,
  VerdictKind,
  VisualFinding,
} from "./types";
import { uid } from "./types";

export type Checklist = I18nText;

const tx = (key: string, params?: Record<string, string | number>): I18nText => ({ key, params });

const CURRENT_YEAR = new Date().getFullYear();

// ------------------------------------------------------------
// Photo taxonomy meta
// ------------------------------------------------------------

export interface PhotoGroup {
  id: string;
  titleKey: string;
  categories: { id: PhotoCategory; labelKey: string; hintKey: string }[];
}

export const PHOTO_GROUPS: PhotoGroup[] = [
  {
    id: "ext",
    titleKey: "az_photos_ext",
    categories: [
      { id: "ext_front", labelKey: "az_ph_ext_front", hintKey: "az_ph_ext_front_hint" },
      { id: "ext_rear", labelKey: "az_ph_ext_rear", hintKey: "az_ph_ext_rear_hint" },
      { id: "ext_left", labelKey: "az_ph_ext_left", hintKey: "az_ph_ext_left_hint" },
      { id: "ext_right", labelKey: "az_ph_ext_right", hintKey: "az_ph_ext_right_hint" },
      { id: "ext_wheels", labelKey: "az_ph_ext_wheels", hintKey: "az_ph_ext_wheels_hint" },
      { id: "ext_details", labelKey: "az_ph_ext_details", hintKey: "az_ph_ext_details_hint" },
    ],
  },
  {
    id: "int",
    titleKey: "az_photos_int",
    categories: [
      { id: "int_dashboard", labelKey: "az_ph_int_dashboard", hintKey: "az_ph_int_dashboard_hint" },
      { id: "int_cluster", labelKey: "az_ph_int_cluster", hintKey: "az_ph_int_cluster_hint" },
      { id: "int_wheel", labelKey: "az_ph_int_wheel", hintKey: "az_ph_int_wheel_hint" },
      { id: "int_seats", labelKey: "az_ph_int_seats", hintKey: "az_ph_int_seats_hint" },
      { id: "int_console", labelKey: "az_ph_int_console", hintKey: "az_ph_int_console_hint" },
      { id: "int_trunk", labelKey: "az_ph_int_trunk", hintKey: "az_ph_int_trunk_hint" },
    ],
  },
  {
    id: "eng",
    titleKey: "az_photos_eng",
    categories: [
      { id: "eng_bay", labelKey: "az_ph_eng_bay", hintKey: "az_ph_eng_bay_hint" },
      { id: "eng_details", labelKey: "az_ph_eng_details", hintKey: "az_ph_eng_details_hint" },
    ],
  },
  {
    id: "under",
    titleKey: "az_photos_under",
    categories: [
      { id: "under_body", labelKey: "az_ph_under_body", hintKey: "az_ph_under_body_hint" },
      { id: "under_leaks", labelKey: "az_ph_under_leaks", hintKey: "az_ph_under_leaks_hint" },
    ],
  },
  {
    id: "doc",
    titleKey: "az_photos_doc",
    categories: [
      { id: "doc_registration", labelKey: "az_ph_doc_registration", hintKey: "az_ph_doc_registration_hint" },
      { id: "doc_service", labelKey: "az_ph_doc_service", hintKey: "az_ph_doc_service_hint" },
      { id: "doc_inspection", labelKey: "az_ph_doc_inspection", hintKey: "az_ph_doc_inspection_hint" },
      { id: "doc_history", labelKey: "az_ph_doc_history", hintKey: "az_ph_doc_history_hint" },
      { id: "doc_other", labelKey: "az_ph_doc_other", hintKey: "az_ph_doc_other_hint" },
    ],
  },
];

export const ALL_PHOTO_CATEGORIES: PhotoCategory[] = PHOTO_GROUPS.flatMap((g) =>
  g.categories.map((c) => c.id)
);

// ------------------------------------------------------------
// 1. Visual engine
// ------------------------------------------------------------

const DEFECT_META: Record<
  Exclude<DeclaredDefect, "none">,
  { level: ObservationLevel; confidence: number; category: PhotoCategory | "general" }
> = {
  dent: { level: "MEDIUM", confidence: 80, category: "ext_details" },
  scratch: { level: "LOW", confidence: 80, category: "ext_details" },
  rust: { level: "HIGH", confidence: 75, category: "ext_details" },
  paint_mismatch: { level: "MEDIUM", confidence: 60, category: "ext_details" },
  panel_gap: { level: "MEDIUM", confidence: 60, category: "ext_details" },
  tire_wear: { level: "MEDIUM", confidence: 75, category: "ext_wheels" },
  warning_light: { level: "HIGH", confidence: 80, category: "int_cluster" },
  interior_wear: { level: "LOW", confidence: 75, category: "int_seats" },
  visible_leak: { level: "HIGH", confidence: 70, category: "under_leaks" },
  modification: { level: "MEDIUM", confidence: 80, category: "general" },
  crack_glass: { level: "MEDIUM", confidence: 85, category: "ext_details" },
};

export function analyzeVisual(req: AnalysisRequest): VisualFinding[] {
  const findings: VisualFinding[] = [];
  const covered = new Set(req.photos.map((p) => p.category));
  const hasPhotos = req.photos.length > 0;

  // Declared defects → OBSERVED findings (observed by the user, not proven mechanical faults).
  for (const defect of req.declaredDefects) {
    if (defect === "none") continue;
    const meta = DEFECT_META[defect];
    if (!meta) continue;
    findings.push({
      id: uid("vf"),
      category: meta.category,
      status: "OBSERVED",
      level: meta.level,
      confidence: meta.confidence,
      title: tx(`az_defect_${defect}`),
      detail: tx(`az_defect_${defect}_detail`),
    });
  }

  // Coverage gaps → what cannot be verified.
  const missingCritical: PhotoCategory[] = (
    ["ext_front", "ext_rear", "ext_left", "ext_right", "int_cluster", "eng_bay"] as PhotoCategory[]
  ).filter((c) => !covered.has(c));

  if (!hasPhotos) {
    findings.push({
      id: uid("vf"),
      category: "general",
      status: "UNVERIFIABLE",
      level: "MEDIUM",
      confidence: 95,
      title: tx("az_vis_no_photos"),
      detail: tx("az_vis_no_photos_detail"),
    });
    return findings;
  }

  if (missingCritical.length > 0) {
    findings.push({
      id: uid("vf"),
      category: "general",
      status: "UNVERIFIABLE",
      level: missingCritical.length >= 4 ? "MEDIUM" : "LOW",
      confidence: 90,
      title: tx("az_vis_partial_coverage", { count: missingCritical.length }),
      detail: tx("az_vis_partial_coverage_detail"),
    });
  }

  // No engine-bay photo → leaks / bay condition unverifiable.
  if (!covered.has("eng_bay") && !covered.has("eng_details")) {
    findings.push({
      id: uid("vf"),
      category: "eng_bay",
      status: "UNVERIFIABLE",
      level: "MEDIUM",
      confidence: 90,
      title: tx("az_vis_no_engine"),
      detail: tx("az_vis_no_engine_detail"),
    });
  }
  // No cluster photo → warning lights unverifiable.
  if (!covered.has("int_cluster") && !covered.has("int_dashboard")) {
    findings.push({
      id: uid("vf"),
      category: "int_cluster",
      status: "UNVERIFIABLE",
      level: "LOW",
      confidence: 90,
      title: tx("az_vis_no_cluster"),
      detail: tx("az_vis_no_cluster_detail"),
    });
  }
  // No underbody photo → corrosion / leaks unverifiable.
  if (!covered.has("under_body") && !covered.has("under_leaks")) {
    findings.push({
      id: uid("vf"),
      category: "under_body",
      status: "UNVERIFIABLE",
      level: "LOW",
      confidence: 90,
      title: tx("az_vis_no_underbody"),
      detail: tx("az_vis_no_underbody_detail"),
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: uid("vf"),
      category: "general",
      status: "TO_VERIFY",
      level: "LOW",
      confidence: 50,
      title: tx("az_vis_ok_coverage"),
      detail: tx("az_vis_ok_coverage_detail"),
    });
  }
  return findings;
}

// ------------------------------------------------------------
// 2. Technical engine
// ------------------------------------------------------------

export interface TechnicalResult {
  strengths: I18nText[];
  watchouts: I18nText[];
  risks: MechanicalRisk[];
}

export function analyzeTechnical(req: AnalysisRequest): TechnicalResult {
  const v = req.vehicle;
  const strengths: I18nText[] = [];
  const watchouts: I18nText[] = [];
  const risks: MechanicalRisk[] = [];
  const profile = brandProfile(v.brand);
  const rates = getRates();
  const toVehicle = (usd: number | null): number | null => {
    if (usd == null) return null;
    const c = convertCurrency(usd, "USD", v.askingCurrency || "USD", rates);
    return c == null ? null : Math.round(c);
  };

  // Brand baseline.
  if (profile.reliability > 0) strengths.push(tx(profile.noteKey));
  else if (profile.reliability < 0) watchouts.push(tx(profile.noteKey));
  else watchouts.push(tx(profile.noteKey));
  if (profile.partsCost > 0) {
    risks.push({
      id: uid("mr"),
      area: "parts",
      level: "LOW",
      confidence: 70,
      title: tx("az_tech_parts_cost"),
      reason: tx("az_tech_parts_cost_reason"),
      check: tx("az_tech_parts_cost_check"),
      costLow: null,
      costHigh: null,
    });
  }

  // Configuration rules.
  const ctx = {
    fuel: v.fuel || "",
    transmission: `${v.transmission} ${v.gearbox}`.trim(),
    engine: `${v.engine} ${v.displacement}`.trim(),
    version: v.version || "",
    year: v.year,
  };
  for (const rule of CONFIG_RULES) {
    let applies = false;
    try {
      applies = rule.match(ctx);
    } catch {
      applies = false;
    }
    if (!applies) continue;
    // Skip fuel-specific milestones mismatches (e.g. DPF on petrol).
    if (rule.id === "diesel_city" && /petrol|essence|gasolina|electric|hybrid/i.test(v.fuel)) continue;
    risks.push({
      id: uid("mr"),
      area: rule.id,
      level: rule.level,
      confidence: 65,
      title: tx(rule.titleKey),
      reason: tx(rule.reasonKey),
      check: tx(rule.checkKey),
      costLow: toVehicle(rule.costLowUSD),
      costHigh: toVehicle(rule.costHighUSD),
    });
  }

  // Mileage milestones.
  const km = v.mileage != null ? toKm(v.mileage, v.mileageUnit) : null;
  if (km != null) {
    for (const ms of MILEAGE_MILESTONES) {
      if (km < ms.fromKm) continue;
      if (ms.titleKey === "az_ms_dpf" && !/diesel|tdi|hdi|dci|cdti/i.test(`${v.fuel} ${v.engine}`)) continue;
      if (ms.titleKey === "az_ms_clutch" && /automat|auto|cvt|dct|dsg|edc/i.test(`${v.transmission} ${v.gearbox}`)) continue;
      risks.push({
        id: uid("mr"),
        area: "maintenance",
        level: ms.fromKm >= 150_000 ? "MEDIUM" : "LOW",
        confidence: 60,
        title: tx(ms.titleKey),
        reason: tx("az_ms_reason", { km: Math.round(km).toLocaleString("en-US") }),
        check: tx(ms.checkKey),
        costLow: toVehicle(ms.costLowUSD),
        costHigh: toVehicle(ms.costHighUSD),
      });
    }
    if (km < 60_000) strengths.push(tx("az_strength_low_mileage"));
  } else {
    watchouts.push(tx("az_watch_no_mileage"));
  }

  // History signals.
  const maint = (v.maintenance || "").toLowerCase();
  if (/(facture|invoice|carnet|stamped|full|complet|suivi|receipt|bill)/i.test(maint)) {
    strengths.push(tx("az_strength_history"));
  } else if (maint.trim().length > 0) {
    watchouts.push(tx("az_watch_history_partial"));
  } else {
    watchouts.push(tx("az_watch_history_missing"));
    risks.push({
      id: uid("mr"),
      area: "history",
      level: "MEDIUM",
      confidence: 55,
      title: tx("az_tech_unknown_history"),
      reason: tx("az_tech_unknown_history_reason"),
      check: tx("az_tech_unknown_history_check"),
      costLow: null,
      costHigh: null,
    });
  }

  const acc = (v.accident || "").toLowerCase();
  if (/(oui|yes|sí|accident|crash|choc|répar|repair|repaint|peint)/i.test(acc)) {
    watchouts.push(tx("az_watch_accident"));
    risks.push({
      id: uid("mr"),
      area: "accident",
      level: "MEDIUM",
      confidence: 50,
      title: tx("az_tech_accident"),
      reason: tx("az_tech_accident_reason"),
      check: tx("az_tech_accident_check"),
      costLow: null,
      costHigh: null,
    });
  }

  // Keys / inspection quick signals.
  if (/1|one|una|single/i.test(v.keys) && v.keys.trim().length > 0 && !/2/i.test(v.keys)) {
    watchouts.push(tx("az_watch_single_key"));
  }
  if (!v.inspection.trim()) watchouts.push(tx("az_watch_no_inspection"));

  return { strengths, watchouts, risks };
}

// ------------------------------------------------------------
// 3. Price engine
// ------------------------------------------------------------

export function estimatePrice(
  req: AnalysisRequest,
  catalogueNewPricesUSD: number[]
): PriceEstimate {
  const v = req.vehicle;
  const country = analyzeCountry(req.vehicleCountry);
  const currency = v.askingCurrency || country.currency;
  const rates = getRates();
  const factors: I18nText[] = [];

  const age = v.year != null ? Math.max(0, CURRENT_YEAR - v.year) : null;
  const km = v.mileage != null ? toKm(v.mileage, v.mileageUnit) : null;

  // New-price proxy: catalogue median when matched, else brand-tier fallback.
  let newUSD: number;
  let proxyQuality: "catalogue" | "tier";
  if (catalogueNewPricesUSD.length > 0) {
    const sorted = [...catalogueNewPricesUSD].sort((a, b) => a - b);
    newUSD = sorted[Math.floor(sorted.length / 2)];
    proxyQuality = "catalogue";
    factors.push(tx("az_price_factor_catalogue"));
  } else {
    newUSD = TIER_NEW_PRICE_USD[brandProfile(v.brand).tier];
    proxyQuality = "tier";
    factors.push(tx("az_price_factor_tier"));
  }

  const dep = depreciationFactor(age ?? 8);
  const mf = mileageFactor(km, age ?? 8);
  const market = country.marketIndex;
  factors.push(tx("az_price_factor_age", { years: age ?? 8 }));
  if (km != null) factors.push(tx("az_price_factor_mileage"));
  factors.push(tx("az_price_factor_market"));

  const midUSD = newUSD * dep * mf * market;
  // Band widens with uncertainty.
  const spread = proxyQuality === "catalogue" ? 0.09 : 0.16;
  const lowUSD = midUSD * (1 - spread);
  const highUSD = midUSD * (1 + spread);

  const toLocal = (usd: number) =>
    Math.round(convertCurrency(usd, "USD", currency, rates) ?? usd);
  const estimatedLow = toLocal(lowUSD);
  const estimatedHigh = toLocal(highUSD);

  let confidence = proxyQuality === "catalogue" ? 62 : 42;
  if (age != null) confidence += 6;
  if (km != null) confidence += 6;
  if (v.version.trim()) confidence += 3;
  if (req.photos.length >= 6) confidence += 4;
  confidence = Math.min(85, confidence);

  // Position vs asking price.
  const asking = v.askingPrice;
  let position: PricePosition = "UNKNOWN";
  let negotiateLow: number | null = null;
  let negotiateHigh: number | null = null;
  if (asking != null && asking > 0) {
    const mid = (estimatedLow + estimatedHigh) / 2;
    const ratio = asking / Math.max(1, mid);
    if (ratio <= 0.92) position = "GREAT_DEAL";
    else if (ratio <= 1.07) position = "FAIR";
    else if (ratio <= 1.2) position = "OVERPRICED";
    else position = "STRONGLY_OVERPRICED";
    negotiateLow = Math.round(mid * 0.96);
    negotiateHigh = Math.round(mid * 1.03);
  }

  return {
    confidence,
    currency,
    estimatedLow,
    estimatedHigh,
    askingPrice: asking,
    position,
    negotiateLow,
    negotiateHigh,
    indicative: true,
    factors,
  };
}

// ------------------------------------------------------------
// 4. Import engine
// ------------------------------------------------------------

export function estimateImport(req: AnalysisRequest): ImportEstimate {
  const v = req.vehicle;
  const needed = req.vehicleCountry !== req.destinationCountry;
  const vehicleCountry = analyzeCountry(req.vehicleCountry);
  const destCountry = analyzeCountry(req.destinationCountry);
  const vehicleCurrency = v.askingCurrency || vehicleCountry.currency;
  const destinationCurrency = destCountry.currency;
  const rates = getRates();
  const rateNote = tx("az_import_rate_note");

  if (!needed) {
    return {
      needed,
      vehicleCurrency,
      destinationCurrency,
      rateNote,
      lines: [],
      totalLow: null,
      totalHigh: null,
      destTotalLow: null,
      destTotalHigh: null,
    };
  }

  const conv = (amount: number | null, from: string, to: string): number | null => {
    if (amount == null) return null;
    const c = convertCurrency(amount, from, to, rates);
    return c == null ? null : Math.round(c);
  };

  const lines: ImportLine[] = [];
  const asking = v.askingPrice;

  lines.push({
    id: uid("il"),
    label: tx("az_import_vehicle_price"),
    low: asking,
    high: asking,
    destLow: conv(asking, vehicleCurrency, destinationCurrency),
    destHigh: conv(asking, vehicleCurrency, destinationCurrency),
    verified: asking != null,
  });

  const [shipLowUSD, shipHighUSD] = shippingBand(req.vehicleCountry, req.destinationCountry);
  const shipLow = conv(shipLowUSD, "USD", vehicleCurrency);
  const shipHigh = conv(shipHighUSD, "USD", vehicleCurrency);
  lines.push({
    id: uid("il"),
    label: tx("az_import_shipping"),
    low: shipLow,
    high: shipHigh,
    destLow: conv(shipLowUSD, "USD", destinationCurrency),
    destHigh: conv(shipHighUSD, "USD", destinationCurrency),
    verified: false,
  });

  // Duties & taxes: NEVER presented as known — architecture ready for regulatory tables.
  lines.push({
    id: uid("il"),
    label: tx("az_import_duties"),
    low: null,
    high: null,
    destLow: null,
    destHigh: null,
    verified: false,
  });

  // Admin / registration: small indicative band.
  const adminLowUSD = 150;
  const adminHighUSD = 600;
  lines.push({
    id: uid("il"),
    label: tx("az_import_admin"),
    low: conv(adminLowUSD, "USD", vehicleCurrency),
    high: conv(adminHighUSD, "USD", vehicleCurrency),
    destLow: conv(adminLowUSD, "USD", destinationCurrency),
    destHigh: conv(adminHighUSD, "USD", destinationCurrency),
    verified: false,
  });

  // Totals sum the calculable lines only. Unverifiable duties/taxes are
  // excluded and flagged, never silently zeroed or invented.
  const sum = (pick: (l: ImportLine) => number | null): number | null => {
    let total = 0;
    let any = false;
    for (const l of lines) {
      const n = pick(l);
      if (n == null) continue;
      total += n;
      any = true;
    }
    return any ? total : null;
  };

  return {
    needed,
    vehicleCurrency,
    destinationCurrency,
    rateNote,
    lines,
    totalLow: sum((l) => l.low),
    totalHigh: sum((l) => l.high),
    destTotalLow: sum((l) => l.destLow),
    destTotalHigh: sum((l) => l.destHigh),
  };
}

// ------------------------------------------------------------
// 5. Inconsistency engine
// ------------------------------------------------------------

export function analyzeInconsistencies(req: AnalysisRequest): Inconsistency[] {
  const out: Inconsistency[] = [];
  const v = req.vehicle;
  const km = v.mileage != null ? toKm(v.mileage, v.mileageUnit) : null;
  const age = v.year != null ? Math.max(0, CURRENT_YEAR - v.year) : null;
  const desc = (v.sellerDescription || "").toLowerCase();

  // Mileage vs wear.
  const worn = req.declaredDefects.includes("interior_wear");
  if (km != null && age != null && age > 0) {
    const perYear = km / age;
    if (perYear < 4_000 && (worn || req.photos.length === 0)) {
      out.push({
        id: uid("ic"),
        level: "MEDIUM",
        status: "PROBABLE",
        title: tx("az_inc_mileage_wear"),
        detail: tx("az_inc_mileage_wear_detail"),
      });
    }
    if (perYear > 45_000) {
      out.push({
        id: uid("ic"),
        level: "LOW",
        status: "OBSERVED",
        title: tx("az_inc_high_use"),
        detail: tx("az_inc_high_use_detail"),
      });
    }
  }

  // Mileage missing but wear declared.
  if (km == null && worn) {
    out.push({
      id: uid("ic"),
      level: "LOW",
      status: "TO_VERIFY",
      title: tx("az_inc_wear_no_mileage"),
      detail: tx("az_inc_wear_no_mileage_detail"),
    });
  }

  // "Never crashed" claim + paint/panel signals.
  const claimsNoCrash = /(never|jamais|nunca).{0,30}(crash|accident|accidenté|accidentado|choc|paint|peint|pint)/i.test(desc);
  const paintSignals =
    req.declaredDefects.includes("paint_mismatch") || req.declaredDefects.includes("panel_gap");
  if (claimsNoCrash && paintSignals) {
    out.push({
      id: uid("ic"),
      level: "MEDIUM",
      status: "PROBABLE",
      title: tx("az_inc_claim_vs_visual"),
      detail: tx("az_inc_claim_vs_visual_detail"),
    });
  }

  // "First hand / single owner" vs owners field.
  const claimsFirstHand = /(first hand|première main|primera mano|single owner|one owner|1st owner)/i.test(desc);
  const ownersNum = parseInt(v.owners.replace(/\D/g, ""), 10);
  if (claimsFirstHand && Number.isFinite(ownersNum) && ownersNum > 1) {
    out.push({
      id: uid("ic"),
      level: "MEDIUM",
      status: "PROBABLE",
      title: tx("az_inc_owners"),
      detail: tx("az_inc_owners_detail"),
    });
  }

  // "Full service history" vs empty maintenance.
  const claimsFSH = /(full service|carnet complet|entretien complet|historial completo|full history|toutes les factures)/i.test(desc);
  if (claimsFSH && !v.maintenance.trim() && !req.photos.some((p) => p.category.startsWith("doc_"))) {
    out.push({
      id: uid("ic"),
      level: "LOW",
      status: "TO_VERIFY",
      title: tx("az_inc_history_claim"),
      detail: tx("az_inc_history_claim_detail"),
    });
  }

  // VIN format sanity (17 chars, no I/O/Q).
  const vin = v.vin.trim().toUpperCase();
  if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    out.push({
      id: uid("ic"),
      level: "LOW",
      status: "OBSERVED",
      title: tx("az_inc_vin_format"),
      detail: tx("az_inc_vin_format_detail"),
    });
  }

  // Year vs equipment anachronisms (light-touch).
  if (age != null && age >= 15 && /(carplay|android auto|adaptive cruise|head-up|panoramic roof)/i.test(desc)) {
    out.push({
      id: uid("ic"),
      level: "LOW",
      status: "TO_VERIFY",
      title: tx("az_inc_year_equipment"),
      detail: tx("az_inc_year_equipment_detail"),
    });
  }

  return out;
}

// ------------------------------------------------------------
// 6. Listing analysis
// ------------------------------------------------------------

const CLAIM_PATTERNS: { re: RegExp; key: string }[] = [
  { re: /(never|jamais|nunca).{0,30}(crash|accident|choc)/i, key: "az_claim_no_crash" },
  { re: /(full service|carnet.{0,15}complet|entretien.{0,15}complet|historial completo)/i, key: "az_claim_fsh" },
  { re: /(first hand|première main|primera mano|one owner|single owner)/i, key: "az_claim_first_hand" },
  { re: /(garage kept|dormi.{0,10}garage|garaje)/i, key: "az_claim_garage" },
  { re: /(non[- ]?smoker|non[- ]?fumeur|no fumador)/i, key: "az_claim_nonsmoker" },
  { re: /(new tires|pneus neufs|neumáticos nuevos)/i, key: "az_claim_tires" },
  { re: /(timing|distribution|distribución).{0,20}(done|faite|faite|hecha|new|neuve|nueva)/i, key: "az_claim_timing" },
  { re: /(still under|sous garantie|en garantía|warranty)/i, key: "az_claim_warranty" },
];

export function analyzeListing(req: AnalysisRequest): ListingAnalysis {
  const desc = (req.vehicle.sellerDescription || "").trim();
  if (!desc) {
    return { hasListing: false, claims: [], verifiable: [], unknown: [], missingInfo: [tx("az_listing_none")] };
  }
  const claims = CLAIM_PATTERNS.filter((p) => p.re.test(desc)).map((p) => tx(p.key));
  const verifiable: I18nText[] = [];
  const unknown: I18nText[] = [];
  const missingInfo: I18nText[] = [];

  if (!req.vehicle.maintenance.trim()) missingInfo.push(tx("az_missing_maintenance"));
  if (!req.vehicle.vin.trim()) missingInfo.push(tx("az_missing_vin"));
  if (req.vehicle.mileage == null) missingInfo.push(tx("az_missing_mileage"));
  if (!req.photos.some((p) => p.category === "eng_bay")) missingInfo.push(tx("az_missing_engine_photo"));
  if (!req.photos.some((p) => p.category.startsWith("doc_"))) missingInfo.push(tx("az_missing_docs"));
  if (!/(reason|raison|motivo|sale|vente|venta)/i.test(desc)) missingInfo.push(tx("az_missing_sale_reason"));

  for (const c of claims) {
    if (c.key === "az_claim_no_crash" || c.key === "az_claim_fsh") unknown.push(c);
    else verifiable.push(c);
  }
  if (claims.length === 0) unknown.push(tx("az_listing_generic"));

  return { hasListing: true, claims, verifiable, unknown, missingInfo };
}

// ------------------------------------------------------------
// 7. Scores, verdict, confidence
// ------------------------------------------------------------

function clampScore(n: number): number {
  return Math.max(5, Math.min(98, Math.round(n)));
}

export function computeConfidence(req: AnalysisRequest): { confidence: number; limits: I18nText[] } {
  let score = 34;
  const limits: I18nText[] = [];
  const v = req.vehicle;

  if (v.mileage != null) score += 8;
  else limits.push(tx("az_limit_mileage"));
  if (v.askingPrice != null) score += 6;
  else limits.push(tx("az_limit_price"));
  if (v.year != null) score += 4;
  if (v.version.trim() || v.engine.trim()) score += 3;
  if (v.fuel.trim()) score += 2;
  if (v.transmission.trim()) score += 2;
  if (req.photos.length >= 3) score += 6;
  else limits.push(tx("az_limit_photos"));
  if (req.photos.some((p) => p.category === "eng_bay" || p.category === "eng_details")) score += 5;
  else limits.push(tx("az_limit_engine_photo"));
  if (req.photos.some((p) => p.category.startsWith("doc_")) || v.maintenance.trim()) score += 6;
  else limits.push(tx("az_limit_history"));
  if (v.vin.trim()) score += 4;
  else limits.push(tx("az_limit_vin"));
  if (v.sellerDescription.trim().length > 80) score += 4;
  if (v.inspection.trim()) score += 3;
  if (req.declaredDefects.length > 0) score += 3;

  return { confidence: Math.min(94, score), limits };
}

export function computeScores(
  req: AnalysisRequest,
  tech: TechnicalResult,
  visual: VisualFinding[],
  price: PriceEstimate,
  inconsistencies: Inconsistency[]
): { overall: number; subs: SubScores; verdict: VerdictKind; why: I18nText[] } {
  const v = req.vehicle;
  const profile = brandProfile(v.brand);
  const km = v.mileage != null ? toKm(v.mileage, v.mileageUnit) : null;

  // Reliability baseline from brand tier.
  let reliability = profile.tier === "TOP" ? 82 : profile.tier === "GOOD" ? 74 : profile.tier === "AVERAGE" ? 66 : 58;
  if (km != null && km > 180_000) reliability -= 8;
  else if (km != null && km > 120_000) reliability -= 4;

  // Visual: penalize declared defects, reward coverage.
  let visualScore: number | null = req.photos.length === 0 ? null : 78;
  if (visualScore != null) {
    for (const f of visual) {
      if (f.status !== "OBSERVED") continue;
      if (f.level === "CRITICAL") visualScore -= 18;
      else if (f.level === "HIGH") visualScore -= 10;
      else if (f.level === "MEDIUM") visualScore -= 5;
      else visualScore -= 2;
    }
    if (req.photos.length >= 10) visualScore += 4;
  }

  // Mechanical risk → inverted to a score.
  let mechPenalty = 0;
  for (const r of tech.risks) {
    if (r.level === "HIGH") mechPenalty += 9;
    else if (r.level === "MEDIUM") mechPenalty += 5;
    else mechPenalty += 2;
  }
  const mechanicalRisk = clampScore(80 - Math.min(45, mechPenalty));

  // Price.
  let priceScore: number | null = null;
  if (price.position === "GREAT_DEAL") priceScore = 88;
  else if (price.position === "FAIR") priceScore = 74;
  else if (price.position === "OVERPRICED") priceScore = 55;
  else if (price.position === "STRONGLY_OVERPRICED") priceScore = 38;

  // History.
  let history = 45;
  if (v.maintenance.trim()) history += 15;
  if (req.photos.some((p) => p.category.startsWith("doc_"))) history += 15;
  if (v.vin.trim()) history += 8;
  if (v.inspection.trim()) history += 7;
  history = Math.min(95, history);

  const valueForMoney =
    priceScore != null ? clampScore(priceScore * 0.6 + reliability * 0.4) : null;
  const totalCost = priceScore; // refined by import in the UI note; kept simple + honest
  const usageFit: number | null = null; // unknown usage → not scored, shown as "—"

  const parts = [reliability, visualScore ?? 60, mechanicalRisk, priceScore ?? 60, history];
  let overall = parts.reduce((a, b) => a + b, 0) / parts.length;
  for (const i of inconsistencies) {
    if (i.level === "HIGH") overall -= 6;
    else if (i.level === "MEDIUM") overall -= 3;
    else overall -= 1;
  }
  overall = clampScore(overall);

  // Verdict.
  let verdict: VerdictKind;
  const why: I18nText[] = [];
  const badPrice = price.position === "OVERPRICED" || price.position === "STRONGLY_OVERPRICED";
  const criticalVisual = visual.some((f) => f.status === "OBSERVED" && (f.level === "CRITICAL" || f.level === "HIGH"));

  if (overall >= 76 && !badPrice && !criticalVisual && inconsistencies.length <= 1) {
    verdict = "GREAT";
    why.push(tx("az_verdict_great_why"));
  } else if (overall >= 62 && !criticalVisual) {
    verdict = badPrice ? "NEGOTIATE" : "STUDY";
    why.push(tx(badPrice ? "az_verdict_negotiate_why" : "az_verdict_study_why"));
  } else if (overall >= 45) {
    verdict = "NEGOTIATE";
    why.push(tx("az_verdict_negotiate_why"));
  } else {
    verdict = "AVOID";
    why.push(tx("az_verdict_avoid_why"));
  }
  if (badPrice && verdict !== "NEGOTIATE") why.push(tx("az_verdict_price_note"));
  if (criticalVisual) why.push(tx("az_verdict_visual_note"));
  if (!v.maintenance.trim() && !req.photos.some((p) => p.category.startsWith("doc_"))) {
    why.push(tx("az_verdict_history_note"));
  }

  return {
    overall,
    subs: {
      reliability: clampScore(reliability),
      visual: visualScore == null ? null : clampScore(visualScore),
      mechanicalRisk,
      price: priceScore,
      history: clampScore(history),
      valueForMoney,
      totalCost,
      usageFit,
    },
    verdict,
    why,
  };
}

// ------------------------------------------------------------
// 8. Questions + checklist
// ------------------------------------------------------------

export function buildSellerQuestions(
  req: AnalysisRequest,
  tech: TechnicalResult,
  inconsistencies: Inconsistency[],
  listing: ListingAnalysis
): I18nText[] {
  const q: I18nText[] = [];
  const v = req.vehicle;

  if (!v.maintenance.trim()) q.push(tx("az_q_maintenance"));
  const topRisk = tech.risks.find((r) => r.level === "HIGH" || r.level === "MEDIUM");
  if (topRisk) q.push(tx("az_q_top_risk"));

  if (req.declaredDefects.includes("paint_mismatch") || req.declaredDefects.includes("panel_gap")) {
    q.push(tx("az_q_repaint"));
  }
  if (req.declaredDefects.includes("visible_leak")) q.push(tx("az_q_leak"));
  if (req.declaredDefects.includes("warning_light")) q.push(tx("az_q_warning"));
  if (req.declaredDefects.includes("rust")) q.push(tx("az_q_rust"));
  if (!v.vin.trim()) q.push(tx("az_q_vin"));
  if (!v.inspection.trim()) q.push(tx("az_q_inspection"));
  if (v.mileage == null) q.push(tx("az_q_mileage"));
  for (const inc of inconsistencies.slice(0, 2)) {
    if (inc.id) q.push(tx("az_q_inconsistency"));
    break;
  }
  if (listing.hasListing && listing.missingInfo.length > 0) q.push(tx("az_q_documents"));
  q.push(tx("az_q_cold_start"));
  q.push(tx("az_q_sale_reason"));
  q.push(tx("az_q_negotiation"));

  // De-duplicate while preserving order.
  const seen = new Set<string>();
  return q.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  }).slice(0, 10);
}

export function buildChecklist(
  req: AnalysisRequest,
  tech: TechnicalResult,
  visual: VisualFinding[]
): Checklist[] {
  const c: Checklist[] = [
    tx("az_check_cold_start"),
    tx("az_check_vin"),
    tx("az_check_history"),
    tx("az_check_road_test"),
    tx("az_check_independent"),
  ];
  if (visual.some((f) => f.category === "int_cluster" || f.status === "OBSERVED")) {
    c.splice(2, 0, tx("az_check_warnings"));
  }
  if (/automat|auto|cvt|dct|dsg|edc/i.test(`${req.vehicle.transmission} ${req.vehicle.gearbox}`)) {
    c.splice(3, 0, tx("az_check_gearbox"));
  } else if (req.vehicle.transmission.trim()) {
    c.splice(3, 0, tx("az_check_clutch"));
  }
  if (tech.risks.some((r) => r.area === "maintenance")) c.push(tx("az_check_service_due"));
  if (req.declaredDefects.includes("tire_wear")) c.push(tx("az_check_tires"));
  else c.push(tx("az_check_tires_basic"));
  if (!req.photos.some((p) => p.category.startsWith("under_"))) c.push(tx("az_check_underbody"));
  if (!req.photos.some((p) => p.category.startsWith("doc_"))) c.push(tx("az_check_documents"));
  return c.slice(0, 12);
}

// ------------------------------------------------------------
// Orchestrator
// ------------------------------------------------------------

export function runAnalysis(
  req: AnalysisRequest,
  catalogueNewPricesUSD: number[] = []
): AnalysisResult {
  const visual = analyzeVisual(req);
  const tech = analyzeTechnical(req);
  const price = estimatePrice(req, catalogueNewPricesUSD);
  const importEst = estimateImport(req);
  const inconsistencies = analyzeInconsistencies(req);
  const listing = analyzeListing(req);
  const { confidence, limits } = computeConfidence(req);
  const { overall, subs, verdict, why } = computeScores(req, tech, visual, price, inconsistencies);
  const sellerQuestions = buildSellerQuestions(req, tech, inconsistencies, listing);
  const checklist = buildChecklist(req, tech, visual);

  const limitations: I18nText[] = [tx("az_limit_disclaimer")];
  if (req.photos.length === 0) limitations.push(tx("az_limit_no_photo_analysis"));
  if (!req.vehicle.vin.trim()) limitations.push(tx("az_limit_no_vin_check"));
  limitations.push(tx("az_limit_estimate"));

  return {
    requestId: req.id,
    createdAt: Date.now(),
    overallScore: overall,
    confidence,
    confidenceLimits: limits,
    verdict,
    verdictWhy: why,
    subScores: subs,
    strengths: tech.strengths,
    watchouts: tech.watchouts,
    visualFindings: visual,
    mechanicalRisks: tech.risks,
    priceEstimate: price,
    importEstimate: importEst,
    inconsistencies,
    listing,
    sellerQuestions,
    checklist,
    limitations,
  };
}
