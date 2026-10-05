// ============================================================
// CARVIBES ANALYSE — technical knowledge base
//
// Transparent, rule-based automotive knowledge. Everything here is
// generic engineering guidance (maintenance intervals, configuration
// risk factors, brand reliability tiers) — never a diagnosis of the
// specific car. Each rule maps to i18n keys so the UI stays
// translated; costs are wide indicative ranges in USD.
// ============================================================

export type BrandTier = "TOP" | "GOOD" | "AVERAGE" | "MIXED" | "DELICATE";

export interface BrandProfile {
  tier: BrandTier;
  /** +1 strong / 0 neutral / -1 weak per dimension. */
  reliability: number;
  partsCost: number; // +1 = expensive parts
  noteKey: string;
}

const T = (tier: BrandTier, reliability: number, partsCost: number, noteKey: string): BrandProfile => ({
  tier,
  reliability,
  partsCost,
  noteKey,
});

export const BRAND_PROFILES: Record<string, BrandProfile> = {
  toyota: T("TOP", 1, 0, "az_brand_toyota"),
  lexus: T("TOP", 1, 1, "az_brand_lexus"),
  honda: T("TOP", 1, 0, "az_brand_honda"),
  mazda: T("TOP", 1, 0, "az_brand_mazda"),
  subaru: T("GOOD", 0, 0, "az_brand_subaru"),
  suzuki: T("GOOD", 1, -1, "az_brand_suzuki"),
  hyundai: T("GOOD", 0, -1, "az_brand_hyundai"),
  kia: T("GOOD", 0, -1, "az_brand_kia"),
  nissan: T("AVERAGE", 0, 0, "az_brand_nissan"),
  mitsubishi: T("AVERAGE", 0, -1, "az_brand_mitsubishi"),
  volkswagen: T("AVERAGE", 0, 0, "az_brand_vw"),
  skoda: T("GOOD", 0, -1, "az_brand_skoda"),
  seat: T("AVERAGE", 0, -1, "az_brand_seat"),
  audi: T("AVERAGE", 0, 1, "az_brand_audi"),
  bmw: T("AVERAGE", 0, 1, "az_brand_bmw"),
  "mercedes-benz": T("AVERAGE", 0, 1, "az_brand_mercedes"),
  mercedes: T("AVERAGE", 0, 1, "az_brand_mercedes"),
  porsche: T("GOOD", 0, 1, "az_brand_porsche"),
  volvo: T("GOOD", 0, 1, "az_brand_volvo"),
  peugeot: T("AVERAGE", 0, 0, "az_brand_peugeot"),
  renault: T("AVERAGE", 0, -1, "az_brand_renault"),
  citroen: T("AVERAGE", 0, -1, "az_brand_citroen"),
  dacia: T("GOOD", 0, -1, "az_brand_dacia"),
  fiat: T("MIXED", 0, -1, "az_brand_fiat"),
  alfa: T("MIXED", 0, 1, "az_brand_alfa"),
  "alfa romeo": T("MIXED", 0, 1, "az_brand_alfa"),
  ford: T("AVERAGE", 0, 0, "az_brand_ford"),
  chevrolet: T("AVERAGE", 0, 0, "az_brand_chevrolet"),
  opel: T("AVERAGE", 0, 0, "az_brand_opel"),
  jeep: T("MIXED", 0, 0, "az_brand_jeep"),
  land: T("MIXED", 0, 1, "az_brand_land"),
  "land rover": T("MIXED", 0, 1, "az_brand_land"),
  range: T("MIXED", 0, 1, "az_brand_land"),
  mini: T("AVERAGE", 0, 1, "az_brand_mini"),
  tesla: T("MIXED", 0, 1, "az_brand_tesla"),
  byd: T("GOOD", 0, 0, "az_brand_byd"),
  mg: T("AVERAGE", 0, -1, "az_brand_mg"),
};

export function brandProfile(brand: string): BrandProfile {
  const key = brand.trim().toLowerCase();
  return (
    BRAND_PROFILES[key] ?? {
      tier: "AVERAGE",
      reliability: 0,
      partsCost: 0,
      noteKey: "az_brand_generic",
    }
  );
}

// ------------------------------------------------------------
// Mileage milestones (km) — maintenance that is typically due.
// Each entry: [fromKm, titleKey, checkKey, costLowUSD, costHighUSD]
// ------------------------------------------------------------

export interface Milestone {
  fromKm: number;
  titleKey: string;
  checkKey: string;
  costLowUSD: number | null;
  costHighUSD: number | null;
}

export const MILEAGE_MILESTONES: Milestone[] = [
  { fromKm: 60_000, titleKey: "az_ms_belt", checkKey: "az_ms_belt_check", costLowUSD: 300, costHighUSD: 1200 },
  { fromKm: 80_000, titleKey: "az_ms_atf", checkKey: "az_ms_atf_check", costLowUSD: 150, costHighUSD: 600 },
  { fromKm: 80_000, titleKey: "az_ms_suspension", checkKey: "az_ms_suspension_check", costLowUSD: 200, costHighUSD: 1500 },
  { fromKm: 100_000, titleKey: "az_ms_brakes", checkKey: "az_ms_brakes_check", costLowUSD: 150, costHighUSD: 800 },
  { fromKm: 100_000, titleKey: "az_ms_cooling", checkKey: "az_ms_cooling_check", costLowUSD: 100, costHighUSD: 700 },
  { fromKm: 120_000, titleKey: "az_ms_clutch", checkKey: "az_ms_clutch_check", costLowUSD: 400, costHighUSD: 1500 },
  { fromKm: 150_000, titleKey: "az_ms_turbo", checkKey: "az_ms_turbo_check", costLowUSD: 500, costHighUSD: 2500 },
  { fromKm: 150_000, titleKey: "az_ms_dpf", checkKey: "az_ms_dpf_check", costLowUSD: 300, costHighUSD: 2000 },
  { fromKm: 180_000, titleKey: "az_ms_high_mileage", checkKey: "az_ms_high_mileage_check", costLowUSD: null, costHighUSD: null },
];

// ------------------------------------------------------------
// Configuration risk factors — matched on normalized input.
// ------------------------------------------------------------

export interface ConfigRule {
  id: string;
  match: (v: { fuel: string; transmission: string; engine: string; version: string; year: number | null }) => boolean;
  level: "LOW" | "MEDIUM" | "HIGH";
  titleKey: string;
  reasonKey: string;
  checkKey: string;
  costLowUSD: number | null;
  costHighUSD: number | null;
}

const has = (s: string, ...needles: string[]) => {
  const n = s.toLowerCase();
  return needles.some((w) => n.includes(w));
};

export const CONFIG_RULES: ConfigRule[] = [
  {
    id: "dct",
    match: (v) => has(v.transmission, "dct", "dsg", "double", "double-clutch", "double clutch", "edc", "powershift"),
    level: "MEDIUM",
    titleKey: "az_cfg_dct",
    reasonKey: "az_cfg_dct_reason",
    checkKey: "az_cfg_dct_check",
    costLowUSD: 800,
    costHighUSD: 3500,
  },
  {
    id: "cvt",
    match: (v) => has(v.transmission, "cvt", "multitronic", "xtronic", "e-cvt"),
    level: "MEDIUM",
    titleKey: "az_cfg_cvt",
    reasonKey: "az_cfg_cvt_reason",
    checkKey: "az_cfg_cvt_check",
    costLowUSD: 500,
    costHighUSD: 4000,
  },
  {
    id: "diesel_city",
    match: (v) => has(v.fuel, "diesel", "dFab", "tdi", "hdi", "dci", "cdti", "d-4d") || has(v.engine, "diesel", "tdi", "hdi"),
    level: "MEDIUM",
    titleKey: "az_cfg_diesel",
    reasonKey: "az_cfg_diesel_reason",
    checkKey: "az_cfg_diesel_check",
    costLowUSD: 300,
    costHighUSD: 2500,
  },
  {
    id: "small_turbo",
    match: (v) =>
      (has(v.engine, "1.0", "1,0", "1.2", "1,2") && has(v.engine, "t", "turbo", "tsi", "tfsi", "tgdi", "puretech", "tce")) ||
      has(v.engine, "puretech", "1.2 puretech"),
    level: "MEDIUM",
    titleKey: "az_cfg_small_turbo",
    reasonKey: "az_cfg_small_turbo_reason",
    checkKey: "az_cfg_small_turbo_check",
    costLowUSD: 400,
    costHighUSD: 3000,
  },
  {
    id: "air_suspension",
    match: (v) => has(v.version, "air", "pneumatic", "airmatic", "active suspension") || has(v.engine, "airmatic"),
    level: "MEDIUM",
    titleKey: "az_cfg_air",
    reasonKey: "az_cfg_air_reason",
    checkKey: "az_cfg_air_check",
    costLowUSD: 600,
    costHighUSD: 3000,
  },
  {
    id: "old_premium",
    match: (v) => (v.year ?? 9999) <= new Date().getFullYear() - 10,
    level: "MEDIUM",
    titleKey: "az_cfg_age",
    reasonKey: "az_cfg_age_reason",
    checkKey: "az_cfg_age_check",
    costLowUSD: null,
    costHighUSD: null,
  },
  {
    id: "hybrid_battery",
    match: (v) => has(v.fuel, "hybrid", "hybride", "híbrid") && !has(v.fuel, "mild", "mhev"),
    level: "LOW",
    titleKey: "az_cfg_hybrid",
    reasonKey: "az_cfg_hybrid_reason",
    checkKey: "az_cfg_hybrid_check",
    costLowUSD: 1000,
    costHighUSD: 5000,
  },
  {
    id: "ev_battery",
    match: (v) => has(v.fuel, "electric", "électrique", "eléctrico", "bev") || has(v.engine, "ev ", " bev"),
    level: "MEDIUM",
    titleKey: "az_cfg_ev",
    reasonKey: "az_cfg_ev_reason",
    checkKey: "az_cfg_ev_check",
    costLowUSD: 2000,
    costHighUSD: 12000,
  },
];

// ------------------------------------------------------------
// Price model — depreciation + adjustments (indicative).
// ------------------------------------------------------------

/** Residual value fraction of the new-price proxy by age. */
export function depreciationFactor(ageYears: number): number {
  if (ageYears < 0) return 1;
  if (ageYears === 0) return 0.92;
  if (ageYears === 1) return 0.82;
  if (ageYears === 2) return 0.74;
  if (ageYears === 3) return 0.67;
  if (ageYears === 4) return 0.61;
  if (ageYears === 5) return 0.55;
  if (ageYears === 6) return 0.5;
  if (ageYears === 7) return 0.46;
  if (ageYears === 8) return 0.42;
  if (ageYears === 9) return 0.39;
  if (ageYears === 10) return 0.36;
  if (ageYears <= 15) return Math.max(0.18, 0.36 - (ageYears - 10) * 0.035);
  return 0.15;
}

/** Mileage adjustment vs the expected 15,000 km/year. */
export function mileageFactor(km: number | null, ageYears: number): number {
  if (km == null || ageYears <= 0) return 1;
  const expected = ageYears * 15_000;
  if (expected <= 0) return 1;
  const ratio = km / expected;
  if (ratio <= 0.5) return 1.08;
  if (ratio <= 0.8) return 1.04;
  if (ratio <= 1.25) return 1.0;
  if (ratio <= 1.6) return 0.95;
  if (ratio <= 2.2) return 0.9;
  return 0.84;
}

/** Fallback new-price proxies (USD) by brand tier when the catalogue has no match. */
export const TIER_NEW_PRICE_USD: Record<BrandTier, number> = {
  TOP: 32_000,
  GOOD: 34_000,
  AVERAGE: 42_000,
  MIXED: 48_000,
  DELICATE: 60_000,
};

// ------------------------------------------------------------
// Import model — indicative shipping bands (USD) by corridor.
// Explicitly rough; duties/taxes are NEVER presented as known.
// ------------------------------------------------------------

export type WorldRegion =
  | "NORTH_AMERICA"
  | "EUROPE"
  | "UK"
  | "MIDDLE_EAST"
  | "ASIA"
  | "NORTH_AFRICA"
  | "SUB_AFRICA"
  | "LATAM"
  | "OTHER";

export function regionOf(countryCode: string): WorldRegion {
  switch (countryCode) {
    case "US":
    case "CA":
    case "MX":
      return "NORTH_AMERICA";
    case "FR":
    case "DE":
    case "ES":
    case "IT":
    case "BE":
    case "NL":
    case "CH":
    case "PT":
    case "AT":
    case "LU":
    case "TR":
      return "EUROPE";
    case "GB":
      return "UK";
    case "AE":
    case "SA":
    case "QA":
      return "MIDDLE_EAST";
    case "JP":
    case "KR":
    case "CN":
      return "ASIA";
    case "MA":
    case "TN":
    case "DZ":
    case "EG":
      return "NORTH_AFRICA";
    case "SN":
    case "CI":
    case "CM":
    case "ZA":
      return "SUB_AFRICA";
    case "BR":
      return "LATAM";
    default:
      return "OTHER";
  }
}

/** [lowUSD, highUSD] RoRo/container shipping proxy between regions. */
export function shippingBand(from: string, to: string): [number, number] {
  const a = regionOf(from);
  const b = regionOf(to);
  if (a === b) return [400, 1200];
  const key = [a, b].sort().join(">");
  const table: Record<string, [number, number]> = {
    "EUROPE>NORTH_AFRICA": [500, 1400],
    "MIDDLE_EAST>NORTH_AFRICA": [900, 2000],
    "NORTH_AMERICA>NORTH_AFRICA": [1200, 2800],
    "ASIA>NORTH_AFRICA": [1400, 3000],
    "EUROPE>NORTH_AMERICA": [1100, 2400],
    "ASIA>NORTH_AMERICA": [1300, 2800],
    "EUROPE>MIDDLE_EAST": [900, 2200],
    "ASIA>MIDDLE_EAST": [800, 1800],
    "NORTH_AMERICA>SUB_AFRICA": [1600, 3200],
    "EUROPE>SUB_AFRICA": [1200, 2600],
    "ASIA>EUROPE": [1200, 2600],
    "MIDDLE_EAST>NORTH_AMERICA": [1400, 3000],
    "EUROPE>UK": [400, 1000],
    "LATAM>NORTH_AMERICA": [900, 2000],
    "EUROPE>LATAM": [1300, 2800],
  };
  return table[key] ?? [1000, 2500];
}
