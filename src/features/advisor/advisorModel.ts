import type { Lang } from "../../lib/i18n";

export const ADVISOR_CATALOG_CURRENCY = "USD" as const;
export const ADVISOR_STORAGE_KEY = "carvibes.advisor.progress.v1";
export const ADVISOR_STEP_COUNT = 11;

export type AdvisorScreen = "intro" | "questions" | "results";
export type BudgetBandId =
  | "under5000"
  | "5000to10000"
  | "10000to20000"
  | "20000to30000"
  | "30000to50000"
  | "50000to100000"
  | "100000plus";
export type PurchaseType = "new" | "used" | "either";
export type AdvisorUse =
  | "city"
  | "highway"
  | "mixed"
  | "longDistance"
  | "family"
  | "work"
  | "weekend";
export type AnnualMileage =
  | "under5000"
  | "5000to10000"
  | "10000to20000"
  | "20000to30000"
  | "30000plus";
export type FuelPreference =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "plugInHybrid"
  | "electric"
  | "any";
export type TransmissionPreference = "automatic" | "manual" | "any";
export type AdvisorBodyChoice =
  | "city"
  | "hatchback"
  | "sedan"
  | "suv"
  | "coupe"
  | "convertible"
  | "wagon"
  | "sports"
  | "luxury"
  | "pickup";
export type AdvisorPriority =
  | "performance"
  | "comfort"
  | "fuelEconomy"
  | "reliability"
  | "luxury"
  | "technology"
  | "practicality"
  | "design"
  | "space"
  | "drivingExperience";
export type PassengerCount = "one" | "two" | "threeToFour" | "fivePlus";
export type FuelCostImportance = "notImportant" | "low" | "medium" | "high" | "critical";
export type PerformanceInterest = "notReally" | "aLittle" | "quiteALot" | "aLot";

export interface AdvisorProfile {
  budgetBand: BudgetBandId | null;
  /** Currency of the existing CarVibes catalogue. Kept explicit for future conversion support. */
  currency: string;
  purchaseType: PurchaseType | null;
  uses: AdvisorUse[];
  annualMileage: AnnualMileage | null;
  fuel: FuelPreference;
  transmission: TransmissionPreference;
  bodyType: AdvisorBodyChoice | "any";
  priorities: Record<AdvisorPriority, number>;
  passengers: PassengerCount | null;
  fuelCostImportance: FuelCostImportance | null;
  performanceInterest: PerformanceInterest | null;
}

export const ADVISOR_PRIORITIES: readonly AdvisorPriority[] = [
  "performance",
  "comfort",
  "fuelEconomy",
  "reliability",
  "luxury",
  "technology",
  "practicality",
  "design",
  "space",
  "drivingExperience",
] as const;

export const DEFAULT_ADVISOR_PROFILE: AdvisorProfile = {
  budgetBand: null,
  currency: ADVISOR_CATALOG_CURRENCY,
  purchaseType: null,
  uses: [],
  annualMileage: null,
  fuel: "any",
  transmission: "any",
  bodyType: "any",
  priorities: {
    performance: 3,
    comfort: 3,
    fuelEconomy: 3,
    reliability: 3,
    luxury: 3,
    technology: 3,
    practicality: 3,
    design: 3,
    space: 3,
    drivingExperience: 3,
  },
  passengers: null,
  fuelCostImportance: null,
  performanceInterest: null,
};

export const BUDGET_BANDS: ReadonlyArray<{
  id: BudgetBandId;
  min: number;
  max: number | null;
}> = [
  { id: "under5000", min: 0, max: 5_000 },
  { id: "5000to10000", min: 5_000, max: 10_000 },
  { id: "10000to20000", min: 10_000, max: 20_000 },
  { id: "20000to30000", min: 20_000, max: 30_000 },
  { id: "30000to50000", min: 30_000, max: 50_000 },
  { id: "50000to100000", min: 50_000, max: 100_000 },
  // An open-ended band has no ceiling, so it is not treated as a fixed cap.
  { id: "100000plus", min: 100_000, max: null },
];

export interface AdvisorProgress {
  version: 1;
  profile: AdvisorProfile;
  screen: AdvisorScreen;
  step: number;
  started: boolean;
}

export function createInitialAdvisorProgress(): AdvisorProgress {
  return {
    version: 1,
    profile: { ...DEFAULT_ADVISOR_PROFILE, priorities: { ...DEFAULT_ADVISOR_PROFILE.priorities } },
    screen: "intro",
    step: 0,
    started: false,
  };
}

const USES = new Set<AdvisorUse>([
  "city",
  "highway",
  "mixed",
  "longDistance",
  "family",
  "work",
  "weekend",
]);
const FUEL_PREFERENCES = new Set<FuelPreference>([
  "petrol",
  "diesel",
  "hybrid",
  "plugInHybrid",
  "electric",
  "any",
]);
const TRANSMISSION_PREFERENCES = new Set<TransmissionPreference>([
  "automatic",
  "manual",
  "any",
]);
const BODY_CHOICES = new Set<AdvisorBodyChoice | "any">([
  "city",
  "hatchback",
  "sedan",
  "suv",
  "coupe",
  "convertible",
  "wagon",
  "sports",
  "luxury",
  "pickup",
  "any",
]);
const PURCHASE_TYPES = new Set<PurchaseType>(["new", "used", "either"]);
const MILEAGE_BANDS = new Set<AnnualMileage>([
  "under5000",
  "5000to10000",
  "10000to20000",
  "20000to30000",
  "30000plus",
]);
const PASSENGER_COUNTS = new Set<PassengerCount>([
  "one",
  "two",
  "threeToFour",
  "fivePlus",
]);
const FUEL_COST_LEVELS = new Set<FuelCostImportance>([
  "notImportant",
  "low",
  "medium",
  "high",
  "critical",
]);
const PERFORMANCE_LEVELS = new Set<PerformanceInterest>([
  "notReally",
  "aLittle",
  "quiteALot",
  "aLot",
]);
const BUDGET_IDS = new Set<BudgetBandId>(BUDGET_BANDS.map((band) => band.id));

function oneOf<T extends string>(value: unknown, allowed: Set<T>): T | null {
  return typeof value === "string" && allowed.has(value as T) ? (value as T) : null;
}

function normalizeProfile(value: unknown): AdvisorProfile {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const rawPriorities =
    raw.priorities && typeof raw.priorities === "object"
      ? (raw.priorities as Record<string, unknown>)
      : {};
  const priorities = Object.fromEntries(
    ADVISOR_PRIORITIES.map((key) => {
      const amount = Number(rawPriorities[key]);
      return [key, Number.isFinite(amount) ? Math.max(1, Math.min(5, Math.round(amount))) : 3];
    }),
  ) as Record<AdvisorPriority, number>;
  return {
    budgetBand: oneOf(raw.budgetBand, BUDGET_IDS),
    // The source database stores every catalogue MSRP in USD. Never infer
    // an exchange rate from language or geography when there is no FX source.
    currency: ADVISOR_CATALOG_CURRENCY,
    purchaseType: oneOf(raw.purchaseType, PURCHASE_TYPES),
    uses: Array.isArray(raw.uses)
      ? Array.from(new Set(raw.uses.filter((item): item is AdvisorUse => USES.has(item as AdvisorUse))))
      : [],
    annualMileage: oneOf(raw.annualMileage, MILEAGE_BANDS),
    fuel: oneOf(raw.fuel, FUEL_PREFERENCES) ?? "any",
    transmission: oneOf(raw.transmission, TRANSMISSION_PREFERENCES) ?? "any",
    bodyType: oneOf(raw.bodyType, BODY_CHOICES) ?? "any",
    priorities,
    passengers: oneOf(raw.passengers, PASSENGER_COUNTS),
    fuelCostImportance: oneOf(raw.fuelCostImportance, FUEL_COST_LEVELS),
    performanceInterest: oneOf(raw.performanceInterest, PERFORMANCE_LEVELS),
  };
}

export function readAdvisorProgress(): AdvisorProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(ADVISOR_STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (parsed.version !== 1) return null;
    const screen = parsed.screen === "questions" || parsed.screen === "results" ? parsed.screen : "intro";
    const rawStep = Number(parsed.step);
    return {
      version: 1,
      profile: normalizeProfile(parsed.profile),
      screen,
      step: Number.isFinite(rawStep) ? Math.max(0, Math.min(ADVISOR_STEP_COUNT - 1, Math.floor(rawStep))) : 0,
      started: parsed.started === true,
    };
  } catch {
    return null;
  }
}

export function writeAdvisorProgress(progress: AdvisorProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADVISOR_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The advisor remains usable if browser storage is disabled or full.
  }
}

export function clearAdvisorProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADVISOR_STORAGE_KEY);
  } catch {
    // Private browsing / storage restrictions must not block a restart.
  }
}

export type AdvisorLanguage = Lang;
