import type { Car } from "../../lib/cars";
import type { UsedCarPick } from "../../lib/usedCars";
import {
  ADVISOR_CATALOG_CURRENCY,
  BUDGET_BANDS,
  type AdvisorBodyChoice,
  type AdvisorProfile,
  type AdvisorPriority,
  type AdvisorUse,
  type BudgetBandId,
} from "./advisorModel";

/**
 * CarVibes Advisor's deterministic matching engine.
 *
 * It uses only the unified CarVibes car catalogue and the existing used-car
 * editorial layer. Criteria with no matching source data are omitted from a
 * car's score (and reduce its displayed data coverage), never guessed.
 */
export type AdvisorFactorId =
  | "budget"
  | "body"
  | "fuel"
  | "transmission"
  | "usage"
  | "fuelEconomy"
  | "passengers"
  | `priority:${AdvisorPriority}`;

export interface AdvisorFactor {
  id: AdvisorFactorId;
  /** 0–1 agreement with this preference, based on supported catalog data. */
  score: number;
  /** Effective contribution weight after the profile importance is applied. */
  weight: number;
  /** Selected value for rendering a localized, personalized explanation. */
  preference?: string;
}

export interface AdvisorPriceEstimate {
  minimum: number;
  maximum: number;
  currency: string;
  source: "catalogue" | "used-guide";
}

export interface AdvisorMatch {
  car: Car;
  score: number;
  /** Portion of the profile for which CarVibes has usable data, 0–100. */
  dataCoverage: number;
  factors: AdvisorFactor[];
  price: AdvisorPriceEstimate | null;
  usedPick?: UsedCarPick;
}

const WEIGHTS = {
  budget: 24,
  body: 18,
  fuel: 12,
  transmission: 8,
  usage: 15,
  passengers: 6,
  priorities: 22,
} as const;

const FUEL_COST_WEIGHT: Record<NonNullable<AdvisorProfile["fuelCostImportance"]>, number> = {
  notImportant: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const MILEAGE_WEIGHT: Record<NonNullable<AdvisorProfile["annualMileage"]>, number> = {
  under5000: 2,
  "5000to10000": 3,
  "10000to20000": 4,
  "20000to30000": 5,
  "30000plus": 6,
};

const PERFORMANCE_INTEREST_WEIGHT: Record<
  NonNullable<AdvisorProfile["performanceInterest"]>,
  number
> = {
  notReally: 0,
  aLittle: 0.5,
  quiteALot: 1,
  aLot: 1.4,
};

const BODY_MATCHERS: Record<AdvisorBodyChoice, (car: Car) => boolean> = {
  city: (car) => car.categories.includes("daily") && ["Hatchback", "Crossover"].includes(car.body),
  hatchback: (car) => car.body === "Hatchback",
  sedan: (car) => car.body === "Sedan",
  suv: (car) => car.body === "SUV" || car.body === "Crossover",
  coupe: (car) => car.body === "Coupe",
  convertible: (car) => car.body === "Convertible" || car.body === "Roadster",
  wagon: (car) => car.body === "Wagon",
  sports: (car) => car.categories.includes("sports"),
  luxury: (car) => car.categories.includes("luxury"),
  pickup: (car) => car.body === "Pickup",
};

const BODY_PRIORITY_CHOICES: readonly AdvisorBodyChoice[] = [
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
];

/** Options are derived against the actual current catalogue, not a made-up taxonomy. */
export function getAvailableAdvisorBodyChoices(cars: readonly Car[]): AdvisorBodyChoice[] {
  return BODY_PRIORITY_CHOICES.filter((choice) => cars.some((car) => BODY_MATCHERS[choice](car)));
}

function sortedValues(values: number[]): number[] {
  return values.filter(Number.isFinite).sort((a, b) => a - b);
}

function percentile(value: number, sorted: number[], lowerIsBetter = false): number | null {
  if (!Number.isFinite(value) || sorted.length === 0) return null;
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (sorted[mid] < value) low = mid + 1;
    else high = mid;
  }
  const firstEqual = low;
  high = sorted.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (sorted[mid] <= value) low = mid + 1;
    else high = mid;
  }
  const middleRank = (firstEqual + low) / 2;
  const rank = sorted.length <= 1 ? 0.5 : (middleRank - 0.5) / (sorted.length - 1);
  const clamped = Math.max(0, Math.min(1, rank));
  return lowerIsBetter ? 1 - clamped : clamped;
}

interface CatalogRanks {
  horsepower: number[];
  acceleration: number[];
  topSpeed: number[];
  powerToWeight: number[];
  year: number[];
}

function makeCatalogRanks(cars: readonly Car[]): CatalogRanks {
  return {
    horsepower: sortedValues(cars.map((car) => car.hp).filter((hp) => hp > 0)),
    acceleration: sortedValues(
      cars.map((car) => car.zeroToHundred).filter((seconds) => seconds > 0),
    ),
    topSpeed: sortedValues(cars.map((car) => car.topSpeed ?? 0).filter((speed) => speed > 0)),
    powerToWeight: sortedValues(
      cars
        .filter((car) => car.hp > 0 && (car.weight ?? 0) > 0)
        .map((car) => car.hp / (car.weight ?? 1)),
    ),
    year: sortedValues(cars.map((car) => car.year).filter((year) => year > 0)),
  };
}

function average(values: Array<number | null>): number | null {
  const known = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!known.length) return null;
  return known.reduce((sum, value) => sum + value, 0) / known.length;
}

function performanceSignal(car: Car, ranks: CatalogRanks): number | null {
  const values: Array<number | null> = [];
  if (car.hp > 0) values.push(percentile(car.hp, ranks.horsepower));
  if (car.zeroToHundred > 0) values.push(percentile(car.zeroToHundred, ranks.acceleration, true));
  if ((car.topSpeed ?? 0) > 0) values.push(percentile(car.topSpeed ?? 0, ranks.topSpeed));
  if (car.hp > 0 && (car.weight ?? 0) > 0) {
    values.push(percentile(car.hp / (car.weight ?? 1), ranks.powerToWeight));
  }
  return average(values);
}

function hasPlugInEvidence(car: Car, pick?: UsedCarPick): boolean {
  const evidence = [car.model, car.engine, car.overview, pick?.fuelLabel, pick?.why]
    .filter(Boolean)
    .join(" ");
  return /plug[ -]?in|\bphev\b|\brecharge\b/i.test(evidence);
}

function fuelFit(
  car: Car,
  pick: UsedCarPick | undefined,
  preferred: AdvisorProfile["fuel"],
): number | null {
  if (preferred === "any") return null;
  if (!car.fuel) return null;
  if (preferred === "plugInHybrid") {
    if (car.fuel !== "Hybrid") return 0;
    // Hybrid is present in Car.fuel, but plug-in status is only known on
    // some existing used-guide records. Unknown hybrids are not guessed.
    return hasPlugInEvidence(car, pick) ? 1 : null;
  }
  const expected = {
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hybrid",
    electric: "Electric",
  }[preferred];
  return car.fuel === expected ? 1 : 0;
}

function bodyFit(car: Car, preferred: AdvisorProfile["bodyType"]): number | null {
  if (preferred === "any") return null;
  const matches = BODY_MATCHERS[preferred];
  return car.body && car.body !== "N/A" ? (matches(car) ? 1 : 0) : null;
}

function transmissionFit(
  car: Car,
  preferred: AdvisorProfile["transmission"],
): number | null {
  if (preferred === "any") return null;
  if (!car.transmission) return null;
  if (preferred === "manual") return car.transmission === "Manual" ? 1 : 0;
  return ["Automatic", "Dual-clutch", "CVT"].includes(car.transmission) ? 1 : 0;
}

function useFit(car: Car, pick: UsedCarPick | undefined, use: AdvisorUse): number | null {
  const body = car.body;
  const hasBody = Boolean(body && body !== "N/A");
  const hasCategories = car.categories.length > 0;
  const daily = hasCategories && car.categories.includes("daily");
  const luxury = hasCategories && car.categories.includes("luxury");
  const sports = hasCategories && (car.categories.includes("sports") || car.categories.includes("supercar"));
  const family = pick?.categories.includes("family") ?? false;
  const familyShape = hasBody && ["SUV", "Wagon", "Minivan", "Van", "Pickup"].includes(body);
  const standardBody = hasBody && ["Sedan", "SUV", "Wagon", "Hatchback", "Crossover", "Minivan", "Van"].includes(body);
  const hasAnySignal = hasBody || hasCategories || Boolean(pick);

  switch (use) {
    case "city":
      if (daily) return 1;
      return hasBody ? (["Hatchback", "Crossover"].includes(body) ? 0.65 : 0.3) : null;
    case "highway":
      if ((hasBody && ["Sedan", "Wagon", "SUV"].includes(body)) || luxury) return 0.9;
      return hasAnySignal ? 0.4 : null;
    case "mixed":
      if (daily || standardBody) return 1;
      return hasAnySignal ? 0.35 : null;
    case "longDistance":
      if ((hasBody && ["Sedan", "Wagon", "SUV"].includes(body)) || luxury) return 0.85;
      return hasAnySignal ? 0.35 : null;
    case "family":
      if (family) return 1;
      if (familyShape) return 0.8;
      return hasAnySignal ? 0.25 : null;
    case "work":
      if ((hasBody && ["Sedan", "SUV", "Pickup", "Van", "Wagon"].includes(body)) || daily) return 0.85;
      return hasAnySignal ? 0.35 : null;
    case "weekend":
      if (sports || (hasBody && ["Convertible", "Roadster", "Coupe"].includes(body))) return 1;
      return hasAnySignal ? 0.35 : null;
  }
}

function passengerFit(car: Car, pick: UsedCarPick | undefined, count: AdvisorProfile["passengers"]): number | null {
  if (!count) return null;
  // Seating capacity is not a Car field. For 1–2 people there is no reliable
  // catalogue distinction; for larger groups only body/family labels are used.
  if (count === "one" || count === "two") return null;
  const hasBody = Boolean(car.body && car.body !== "N/A");
  const hasGuideData = Boolean(pick?.categories.length);
  if (!hasBody && !hasGuideData) return null;
  const family = pick?.categories.includes("family") ?? false;
  const largerBody = hasBody && ["SUV", "Wagon", "Minivan", "Van", "Pickup"].includes(car.body);
  const smallerBody = hasBody && ["Sedan", "Hatchback", "Crossover"].includes(car.body);
  if (count === "fivePlus") return family || largerBody ? 1 : 0.2;
  return family || largerBody ? 1 : smallerBody ? 0.6 : 0.3;
}

function prioritySignal(
  car: Car,
  pick: UsedCarPick | undefined,
  priority: AdvisorPriority,
  ranks: CatalogRanks,
): number | null {
  const performance = performanceSignal(car, ranks);
  const hasBody = Boolean(car.body && car.body !== "N/A");
  const hasCategories = car.categories.length > 0;
  const luxury = hasCategories && car.categories.includes("luxury");
  const body = car.body;
  switch (priority) {
    case "performance":
      return performance;
    case "comfort": {
      const bodySignal = hasBody
        ? (["Sedan", "SUV", "Wagon", "Minivan", "Van"].includes(body) ? 1 : 0.25)
        : null;
      return average([bodySignal, hasCategories ? Number(luxury) : null]);
    }
    case "fuelEconomy":
      return pick ? Math.max(0, Math.min(100, pick.fuelEconomy)) / 100 : null;
    case "reliability":
      return pick ? Math.max(0, Math.min(100, pick.reliability)) / 100 : null;
    case "luxury":
      return hasCategories ? Number(luxury) : null;
    case "technology": {
      const modelYear = car.year > 0 ? percentile(car.year, ranks.year) : null;
      const powertrainSignal = !car.fuel
        ? null
        : car.fuel === "Electric"
          ? 1
          : car.fuel === "Hybrid"
            ? 0.7
            : 0.35;
      const signals: Array<{ value: number | null; weight: number }> = [
        { value: modelYear, weight: 0.65 },
        { value: powertrainSignal, weight: 0.35 },
      ];
      const known = signals.filter((signal): signal is { value: number; weight: number } => signal.value !== null);
      if (!known.length) return null;
      const totalWeight = known.reduce((sum, signal) => sum + signal.weight, 0);
      return known.reduce((sum, signal) => sum + signal.value * signal.weight, 0) / totalWeight;
    }
    case "practicality": {
      const bodySignal = hasBody
        ? Number(["SUV", "Wagon", "Hatchback", "Crossover", "Minivan", "Van", "Pickup"].includes(body))
        : null;
      const categorySignal = hasCategories
        ? Number(car.categories.includes("daily") || car.categories.includes("offroad"))
        : null;
      return average([bodySignal, categorySignal]);
    }
    case "design":
      // No verified design rating or selectable styling data exists.
      return null;
    case "space": {
      const bodySignal = hasBody
        ? Number(["SUV", "Wagon", "Minivan", "Van", "Pickup"].includes(body))
        : null;
      const familySignal = pick ? Number(pick.categories.includes("family")) : null;
      return average([bodySignal, familySignal]);
    }
    case "drivingExperience": {
      const sportSignal = hasCategories
        ? Number(car.categories.includes("sports") || car.categories.includes("supercar"))
        : null;
      return average([performance, sportSignal]);
    }
  }
}

function getBudgetMax(band: BudgetBandId | null): number | null {
  if (!band) return null;
  return BUDGET_BANDS.find((item) => item.id === band)?.max ?? null;
}

function budgetFit(minimum: number, maximum: number, budget: number): number {
  if (maximum <= budget) return 1;
  if (minimum <= budget && maximum > budget) {
    if (maximum === minimum) return 0;
    return Math.max(0, Math.min(1, (budget - minimum) / (maximum - minimum)));
  }
  const relativeGap = (minimum - budget) / Math.max(budget, 1);
  return Math.max(0, Math.min(1, 1 - relativeGap / 1.5));
}

function priceEstimate(
  car: Car,
  pick: UsedCarPick | undefined,
  purchaseType: AdvisorProfile["purchaseType"],
): AdvisorPriceEstimate | null {
  if (purchaseType === "used" && pick) {
    return {
      minimum: pick.priceMin,
      maximum: pick.priceMax,
      currency: ADVISOR_CATALOG_CURRENCY,
      source: "used-guide",
    };
  }
  return car.price > 0
    ? {
        minimum: car.price,
        maximum: car.price,
        currency: ADVISOR_CATALOG_CURRENCY,
        source: "catalogue",
      }
    : null;
}

function economyWeight(profile: AdvisorProfile): number {
  const mileage = profile.annualMileage ? MILEAGE_WEIGHT[profile.annualMileage] : 0;
  const fuelCost = profile.fuelCostImportance
    ? FUEL_COST_WEIGHT[profile.fuelCostImportance]
    : 0;
  return Math.min(10, mileage + fuelCost);
}

function addFactor(
  factors: AdvisorFactor[],
  id: AdvisorFactorId,
  score: number | null,
  weight: number,
  preference?: string,
): number {
  if (score === null || !Number.isFinite(score) || weight <= 0) return 0;
  const normalized = Math.max(0, Math.min(1, score));
  factors.push({ id, score: normalized, weight, preference });
  return weight;
}

function rankOneCar(
  car: Car,
  profile: AdvisorProfile,
  pick: UsedCarPick | undefined,
  ranks: CatalogRanks,
): AdvisorMatch {
  const factors: AdvisorFactor[] = [];
  let expectedWeight = 0;
  let supportedWeight = 0;

  const expected = (weight: number, score: number | null, id: AdvisorFactorId, preference?: string) => {
    if (weight <= 0) return;
    expectedWeight += weight;
    supportedWeight += addFactor(factors, id, score, weight, preference);
  };

  const budgetMax = getBudgetMax(profile.budgetBand);
  if (budgetMax !== null) {
    const estimate = priceEstimate(car, pick, profile.purchaseType);
    expected(WEIGHTS.budget, estimate ? budgetFit(estimate.minimum, estimate.maximum, budgetMax) : null, "budget");
  }

  if (profile.bodyType !== "any") {
    expected(WEIGHTS.body, bodyFit(car, profile.bodyType), "body", profile.bodyType);
  }

  if (profile.fuel !== "any") {
    expected(WEIGHTS.fuel, fuelFit(car, pick, profile.fuel), "fuel", profile.fuel);
  }

  if (profile.transmission !== "any") {
    expected(WEIGHTS.transmission, transmissionFit(car, profile.transmission), "transmission", profile.transmission);
  }

  if (profile.uses.length > 0) {
    const selectedUseFit = average(profile.uses.map((use) => useFit(car, pick, use)));
    expected(WEIGHTS.usage, selectedUseFit, "usage", profile.uses.length === 1 ? profile.uses[0] : "multiple");
  }

  const economyFactorWeight = economyWeight(profile);
  if (economyFactorWeight > 0) {
    const economyScore = pick
      ? Math.max(0, Math.min(100, pick.fuelEconomy)) / 100
      : null;
    expected(economyFactorWeight, economyScore, "fuelEconomy");
  }

  if (profile.passengers) {
    expected(WEIGHTS.passengers, passengerFit(car, pick, profile.passengers), "passengers", profile.passengers);
  }

  const performanceMultiplier = profile.performanceInterest
    ? PERFORMANCE_INTEREST_WEIGHT[profile.performanceInterest]
    : 1;
  const priorityWeights = Object.fromEntries(
    Object.entries(profile.priorities).map(([key, value]) => [
      key,
      key === "performance" ? value * performanceMultiplier : value,
    ]),
  ) as Record<AdvisorPriority, number>;
  const allPriorityWeight = Object.values(priorityWeights).reduce((sum, value) => sum + value, 0);
  if (allPriorityWeight > 0) {
    expectedWeight += WEIGHTS.priorities;
    for (const [priority, importance] of Object.entries(priorityWeights) as Array<[
      AdvisorPriority,
      number,
    ]>) {
      if (importance <= 0) continue;
      const weight = (WEIGHTS.priorities * importance) / allPriorityWeight;
      const score = prioritySignal(car, pick, priority, ranks);
      supportedWeight += addFactor(
        factors,
        `priority:${priority}`,
        score,
        weight,
        priority,
      );
    }
  }

  const scoreWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const weightedScore = factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0);
  const price = priceEstimate(car, pick, profile.purchaseType);

  return {
    car,
    score: scoreWeight > 0 ? Math.max(0, Math.min(100, Math.round((weightedScore / scoreWeight) * 100))) : 0,
    dataCoverage: expectedWeight > 0 ? Math.round((supportedWeight / expectedWeight) * 100) : 0,
    factors,
    price,
    usedPick: pick,
  };
}

/**
 * Rank a vehicle set for a profile. No popularity sort or random scores are
 * used: equal scores are ordered by catalog coverage, then stable model name.
 */
export function rankAdvisorCars(
  vehicles: readonly Car[],
  profile: AdvisorProfile,
  usedPicks: readonly UsedCarPick[] = [],
): AdvisorMatch[] {
  const usedById = new Map(usedPicks.map((pick) => [pick.carId, pick]));
  const candidates = profile.purchaseType === "used"
    ? vehicles.filter((car) => usedById.has(car.id))
    : vehicles;
  const ranks = makeCatalogRanks(vehicles);

  return candidates
    .map((car) => rankOneCar(car, profile, usedById.get(car.id), ranks))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.dataCoverage - a.dataCoverage ||
        a.car.brand.localeCompare(b.car.brand) ||
        a.car.model.localeCompare(b.car.model),
    );
}

/** Available facts used to make transparent explanations on result cards. */
export function positiveFactors(match: AdvisorMatch): AdvisorFactor[] {
  return [...match.factors]
    .filter((factor) => factor.score >= 0.72)
    .sort((a, b) => b.weight * b.score - a.weight * a.score)
    .slice(0, 4);
}

/** Contradictions are derived from supported, low-scoring signals only. */
export function mismatchFactors(match: AdvisorMatch): AdvisorFactor[] {
  return [...match.factors]
    .filter((factor) => factor.score <= 0.34 && factor.weight >= 2)
    .sort((a, b) => a.score - b.score || b.weight - a.weight)
    .slice(0, 3);
}
