// ============================================================
// CARVIBES ANALYSE — data model
//
// AnalysisRequest  : everything the user provides (form input).
// AnalysisResult   : everything the engines produce (report).
//
// The model is designed to outlive the current client-only
// implementation: requests + results are serializable so they can
// later move to /garage/analyses behind authentication without
// changing shape. Photos are referenced (never embedded) in the
// persisted request — binary blobs stay in-session only.
// ============================================================

export type MileageUnit = "km" | "miles";

export type ObservationLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Epistemic status — CarVibes never presents a deduction as a fact. */
export type EvidenceStatus =
  | "OBSERVED" // seen in a photo / stated in a document
  | "PROBABLE" // strongly suggested, not proven
  | "TO_VERIFY" // must be checked before buying
  | "UNVERIFIABLE"; // cannot be checked from what was provided

export type VerdictKind =
  | "GREAT" // 🟢 Achat intéressant
  | "STUDY" // 🟡 Achat à étudier
  | "NEGOTIATE" // 🟠 Négociation forte recommandée
  | "AVOID"; // 🔴 Achat à éviter

export type PricePosition =
  | "GREAT_DEAL"
  | "FAIR"
  | "OVERPRICED"
  | "STRONGLY_OVERPRICED"
  | "UNKNOWN";

export type PhotoCategory =
  | "ext_front"
  | "ext_rear"
  | "ext_left"
  | "ext_right"
  | "ext_wheels"
  | "ext_details"
  | "int_dashboard"
  | "int_cluster"
  | "int_wheel"
  | "int_seats"
  | "int_console"
  | "int_trunk"
  | "eng_bay"
  | "eng_details"
  | "under_body"
  | "under_leaks"
  | "doc_registration"
  | "doc_service"
  | "doc_inspection"
  | "doc_history"
  | "doc_other";

export interface AnalysisPhoto {
  id: string;
  category: PhotoCategory;
  /** Display name of the file. */
  name: string;
  /** In-session object URL (never persisted). */
  url?: string;
  /** Persisted reference (photo count / hash placeholder for later backend). */
  ref: string;
  addedAt: number;
}

/** Defects the user declares seeing on their own photos. */
export type DeclaredDefect =
  | "dent"
  | "scratch"
  | "rust"
  | "paint_mismatch"
  | "panel_gap"
  | "tire_wear"
  | "warning_light"
  | "interior_wear"
  | "visible_leak"
  | "modification"
  | "crack_glass"
  | "none";

export interface VehicleInput {
  brand: string;
  model: string;
  version: string;
  year: number | null;
  generation: string;
  engine: string;
  displacement: string;
  fuel: string;
  transmission: string;
  gearbox: string;
  mileage: number | null;
  mileageUnit: MileageUnit;
  askingPrice: number | null;
  askingCurrency: string;
  vin: string;
  owners: string;
  maintenance: string;
  accident: string;
  keys: string;
  inspection: string;
  sellerDescription: string;
}

export interface AnalysisRequest {
  id: string;
  vehicle: VehicleInput;
  /** ISO country code where the car physically is. */
  vehicleCountry: string;
  vehicleRegion: string;
  /** ISO country code where the buyer wants to use it. */
  destinationCountry: string;
  photos: AnalysisPhoto[];
  declaredDefects: DeclaredDefect[];
  createdAt: number;
}

/** A translated sentence: resolved in the UI via t(lang, key, params). */
export interface I18nText {
  key: string;
  params?: Record<string, string | number>;
}

export interface VisualFinding {
  id: string;
  category: PhotoCategory | "general";
  status: EvidenceStatus;
  level: ObservationLevel;
  /** 0–100. */
  confidence: number;
  title: I18nText;
  detail: I18nText;
}

export interface MechanicalRisk {
  id: string;
  area: string;
  level: ObservationLevel;
  /** 0–100. */
  confidence: number;
  title: I18nText;
  reason: I18nText;
  check: I18nText;
  /** Indicative cost range in the VEHICLE currency, when a reliable range exists. */
  costLow: number | null;
  costHigh: number | null;
}

export interface PriceEstimate {
  /** 0–100 confidence of the estimate itself. */
  confidence: number;
  currency: string;
  estimatedLow: number | null;
  estimatedHigh: number | null;
  askingPrice: number | null;
  position: PricePosition;
  /** Suggested negotiation band in vehicle currency. */
  negotiateLow: number | null;
  negotiateHigh: number | null;
  indicative: boolean;
  factors: I18nText[];
}

export interface ImportLine {
  id: string;
  label: I18nText;
  low: number | null;
  high: number | null;
  /** Converted destination-currency equivalents. */
  destLow: number | null;
  destHigh: number | null;
  verified: boolean;
}

export interface ImportEstimate {
  needed: boolean;
  vehicleCurrency: string;
  destinationCurrency: string;
  rateNote: I18nText;
  lines: ImportLine[];
  totalLow: number | null;
  totalHigh: number | null;
  destTotalLow: number | null;
  destTotalHigh: number | null;
}

export interface Inconsistency {
  id: string;
  level: ObservationLevel;
  title: I18nText;
  detail: I18nText;
  status: EvidenceStatus;
}

export interface ListingAnalysis {
  hasListing: boolean;
  claims: I18nText[];
  verifiable: I18nText[];
  unknown: I18nText[];
  missingInfo: I18nText[];
}

export interface SubScores {
  reliability: number | null;
  visual: number | null;
  mechanicalRisk: number | null;
  price: number | null;
  history: number | null;
  valueForMoney: number | null;
  totalCost: number | null;
  usageFit: number | null;
}

export interface AnalysisResult {
  requestId: string;
  createdAt: number;
  overallScore: number;
  /** 0–100, driven by information completeness. */
  confidence: number;
  confidenceLimits: I18nText[];
  verdict: VerdictKind;
  verdictWhy: I18nText[];
  subScores: SubScores;
  strengths: I18nText[];
  watchouts: I18nText[];
  visualFindings: VisualFinding[];
  mechanicalRisks: MechanicalRisk[];
  priceEstimate: PriceEstimate;
  importEstimate: ImportEstimate;
  inconsistencies: Inconsistency[];
  listing: ListingAnalysis;
  sellerQuestions: I18nText[];
  checklist: I18nText[];
  limitations: I18nText[];
}

/** Stored history entry — the shape /garage/analyses will reuse. */
export interface StoredAnalysis {
  id: string;
  createdAt: number;
  summary: {
    brand: string;
    model: string;
    year: number | null;
    vehicleCountry: string;
    destinationCountry: string;
    askingPrice: number | null;
    askingCurrency: string;
    photoCount: number;
  };
  request: AnalysisRequest;
  result: AnalysisResult;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
