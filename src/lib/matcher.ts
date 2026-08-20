// ============================================================
// CARVIBES — SMART MATCHING ENGINE
// Computes a transparent 0–100 compatibility score for every
// vehicle using real database fields + the user's answers.
//
// Score weights (sum to 100):
//   Budget        25%
//   Body type     15%
//   Performance   15%
//   Priorities    15%
//   Usage         10%
//   Fuel          10%
//   Transmission  10%
// ============================================================
import type { Car } from "./cars";

export type BodyChoice =
  | "sports"
  | "supercar"
  | "suv"
  | "sedan"
  | "coupe"
  | "convertible"
  | "hatchback"
  | "wagon"
  | "offroad"
  | "electric"
  | "luxury";

export type Priority =
  | "performance"
  | "comfort"
  | "luxury"
  | "reliability"
  | "economy"
  | "tech"
  | "practicality"
  | "offroad"
  | "style";

export type PerformanceLevel = "daily" | "balanced" | "sporty" | "extreme";

export type FuelChoice =
  | "petrol"
  | "diesel"
  | "hybrid"
  | "phev"
  | "electric"
  | "any";

export type TransmissionChoice = "automatic" | "manual" | "any";

export type Usage =
  | "commute"
  | "family"
  | "trips"
  | "weekend"
  | "track"
  | "offroad"
  | "mixed";

export type PowerChoice =
  | "under150"
  | "150-250"
  | "250-400"
  | "400-600"
  | "600-800"
  | "800plus"
  | "any";

export interface FinderAnswers {
  budget: number; // 0 = no limit
  bodyTypes: BodyChoice[];
  priorities: Priority[];
  performance: PerformanceLevel | null;
  fuel: FuelChoice;
  transmission: TransmissionChoice;
  usage: Usage[];
  power: PowerChoice;
}

export const defaultAnswers: FinderAnswers = {
  budget: 0,
  bodyTypes: [],
  priorities: [],
  performance: null,
  fuel: "any",
  transmission: "any",
  usage: [],
  power: "any",
};

export interface MatchResult {
  car: Car;
  score: number; // 0–100
  reasons: string[]; // human-readable "why this car"
  budget: number;
  body: number;
  performance: number;
  priorities: number;
  usage: number;
  fuel: number;
  transmission: number;
}

// --- Mapping helpers -------------------------------------------------------

// Map a chosen body type to the body/category strings in the database.
const BODY_MAP: Record<BodyChoice, (c: Car) => boolean> = {
  sports: (c) => c.body === "Coupe" || c.categories.includes("sports"),
  supercar: (c) =>
    c.categories.includes("supercar") ||
    (c.categories.includes("sports") && c.hp >= 550),
  suv: (c) => c.body === "SUV" || c.body === "Crossover",
  sedan: (c) => c.body === "Sedan",
  coupe: (c) => c.body === "Coupe",
  convertible: (c) => c.body === "Convertible" || c.body === "Roadster",
  hatchback: (c) => c.body === "Hatchback",
  wagon: (c) => c.body === "Wagon",
  offroad: (c) => c.categories.includes("offroad") || c.body === "Pickup",
  electric: (c) => c.categories.includes("electric") || c.fuel === "Electric",
  luxury: (c) => c.categories.includes("luxury"),
};

const PERFORMANCE_RANGES: Record<PerformanceLevel, [number, number]> = {
  daily: [0, 250],
  balanced: [180, 450],
  sporty: [350, 700],
  extreme: [550, Infinity],
};

const POWER_RANGES: Record<PowerChoice, [number, number]> = {
  under150: [0, 150],
  "150-250": [150, 250],
  "250-400": [250, 400],
  "400-600": [400, 600],
  "600-800": [600, 800],
  "800plus": [800, Infinity],
  any: [0, Infinity],
};

const FUEL_MAP: Record<FuelChoice, (c: Car) => boolean> = {
  petrol: (c) => c.fuel === "Petrol",
  diesel: (c) => c.fuel === "Diesel",
  hybrid: (c) => c.fuel === "Hybrid",
  phev: (c) => c.fuel === "Hybrid", // closest in dataset (plug-in represented as hybrid)
  electric: (c) => c.fuel === "Electric",
  any: () => true,
};

const TRANSMISSION_MAP: Record<TransmissionChoice, (c: Car) => boolean> = {
  automatic: (c) =>
    c.transmission === "Automatic" ||
    c.transmission === "Dual-clutch" ||
    c.transmission === "CVT",
  manual: (c) => c.transmission === "Manual",
  any: () => true,
};

// A rough "practicality" proxy used for usage + priorities scoring.
function practicality(c: Car): number {
  let score = 0;
  if (c.body === "SUV" || c.body === "Wagon" || c.body === "Minivan" || c.body === "Pickup")
    score += 3;
  if (c.body === "Hatchback" || c.body === "Sedan") score += 2;
  if (c.categories.includes("daily")) score += 2;
  if (c.categories.includes("offroad")) score += 2;
  return score; // 0..7
}

// --- Scoring ---------------------------------------------------------------

function budgetScore(c: Car, budget: number): number {
  if (budget <= 0) return 1; // no budget = neutral
  if (c.price <= budget) return 1; // within budget = full marks
  // over budget: shrink proportionally, down to a floor of 0.2
  const over = c.price / budget;
  if (over >= 2.5) return 0.1;
  return Math.max(0.1, 1 - (over - 1) * 0.55);
}

function bodyScore(c: Car, choices: BodyChoice[]): number {
  if (choices.length === 0) return 0.6; // neutral when unanswered
  const hits = choices.filter((ch) => BODY_MAP[ch](c)).length;
  return hits / choices.length;
}

function performanceScore(c: Car, level: PerformanceLevel | null, power: PowerChoice): number {
  let score = 0.6;
  if (level) {
    const [lo, hi] = PERFORMANCE_RANGES[level];
    if (c.hp >= lo && c.hp <= hi) score = 1;
    else {
      const dist = c.hp < lo ? lo - c.hp : c.hp - hi;
      score = Math.max(0.15, 1 - dist / 600);
    }
  }
  // Blend the power-range answer as an additional signal.
  if (power !== "any") {
    const [lo, hi] = POWER_RANGES[power];
    if (c.hp >= lo && c.hp <= hi) {
      score = Math.max(score, 1);
    } else if (c.hp < lo) {
      score = Math.min(score, 0.4);
    } else if (c.hp > hi) {
      score = Math.min(score, 0.7); // more powerful than wanted is a mild mismatch
    }
  }
  return score;
}

function priorityScore(c: Car, priorities: Priority[]): number {
  if (priorities.length === 0) return 0.6;
  const scores = priorities.map((p) => {
    switch (p) {
      case "performance":
        return c.hp >= 400 ? 1 : c.hp >= 250 ? 0.7 : 0.3;
      case "comfort":
        return c.categories.includes("luxury") ||
          c.body === "Sedan" ||
          c.body === "SUV"
          ? 1
          : 0.4;
      case "luxury":
        return c.categories.includes("luxury") ? 1 : c.price >= 90000 ? 0.7 : 0.2;
      case "reliability":
        return c.categories.includes("daily") || c.brand === "Toyota" ||
          c.brand === "Honda" || c.brand === "Lexus" || c.brand === "Mazda"
          ? 1
          : 0.6;
      case "economy":
        return c.fuel === "Electric" || c.fuel === "Hybrid" ? 1 : c.hp <= 200 ? 0.8 : 0.3;
      case "tech":
        return c.fuel === "Electric" || c.year >= 2020 ? 1 : 0.5;
      case "practicality":
        return practicality(c) >= 4 ? 1 : practicality(c) >= 2 ? 0.7 : 0.3;
      case "offroad":
        return c.categories.includes("offroad") ? 1 : 0.2;
      case "style":
        return c.categories.includes("sports") ||
          c.categories.includes("supercar") ||
          c.price >= 50000
          ? 1
          : 0.5;
      default:
        return 0.5;
    }
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function usageScore(c: Car, usage: Usage[]): number {
  if (usage.length === 0) return 0.6;
  const scores = usage.map((u) => {
    switch (u) {
      case "commute":
        return c.fuel === "Electric" || c.categories.includes("daily") ? 1 : 0.5;
      case "family":
        return c.body === "SUV" || c.body === "Wagon" || c.body === "Minivan"
          ? 1
          : 0.4;
      case "trips":
        return c.categories.includes("luxury") || c.body === "Sedan" || c.body === "Wagon"
          ? 1
          : 0.5;
      case "weekend":
        return c.categories.includes("sports") || c.body === "Convertible" ? 1 : 0.4;
      case "track":
        return c.categories.includes("sports") || c.categories.includes("supercar")
          ? 1
          : c.hp >= 400
          ? 0.7
          : 0.2;
      case "offroad":
        return c.categories.includes("offroad") ? 1 : 0.2;
      case "mixed":
        return practicality(c) >= 2 ? 1 : 0.5;
      default:
        return 0.5;
    }
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function fuelScore(c: Car, fuel: FuelChoice): number {
  return FUEL_MAP[fuel](c) ? 1 : 0;
}

function transmissionScore(c: Car, transmission: TransmissionChoice): number {
  return TRANSMISSION_MAP[transmission](c) ? 1 : 0;
}

// Build reasons for a matched car based on the answers.
function buildReasons(c: Car, a: FinderAnswers): string[] {
  const r: string[] = [];
  if (a.budget > 0 && c.price <= a.budget)
    r.push(`within your ${formatEuro(a.budget)} budget`);
  if (a.budget > 0 && c.price > a.budget)
    r.push(`slightly above your ${formatEuro(a.budget)} budget`);
  if (a.bodyTypes.length > 0) {
    const hit = a.bodyTypes.find((b) => BODY_MAP[b](c));
    if (hit) r.push(`matches your ${hit} preference`);
  }
  if (a.performance) r.push(`suits ${a.performance} performance`);
  if (a.fuel !== "any") r.push(`powered by ${a.fuel}`);
  if (a.transmission !== "any") r.push(`${a.transmission} gearbox`);
  if (a.priorities.includes("performance") && c.hp >= 400)
    r.push(`${c.hp} hp delivers the performance you asked for`);
  if (a.priorities.includes("luxury") && c.categories.includes("luxury"))
    r.push("offers the luxury you value");
  if (a.priorities.includes("practicality") && c.body === "SUV")
    r.push("practical and spacious");
  return r;
}

// --- Main entrypoint -------------------------------------------------------

const WEIGHTS = {
  budget: 25,
  body: 15,
  performance: 15,
  priorities: 15,
  usage: 10,
  fuel: 10,
  transmission: 10,
};

export function rankCars(cars: Car[], answers: FinderAnswers): MatchResult[] {
  return cars
    .map((car) => {
      const budget = budgetScore(car, answers.budget) * WEIGHTS.budget;
      const body = bodyScore(car, answers.bodyTypes) * WEIGHTS.body;
      const performance =
        performanceScore(car, answers.performance, answers.power) *
        WEIGHTS.performance;
      const priorities =
        priorityScore(car, answers.priorities) * WEIGHTS.priorities;
      const usage = usageScore(car, answers.usage) * WEIGHTS.usage;
      const fuel = fuelScore(car, answers.fuel) * WEIGHTS.fuel;
      const transmission =
        transmissionScore(car, answers.transmission) * WEIGHTS.transmission;

      const score = Math.round(
        budget + body + performance + priorities + usage + fuel + transmission
      );

      return {
        car,
        score,
        reasons: buildReasons(car, answers),
        budget: Math.round(budget),
        body: Math.round(body),
        performance: Math.round(performance),
        priorities: Math.round(priorities),
        usage: Math.round(usage),
        fuel: Math.round(fuel),
        transmission: Math.round(transmission),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function formatEuro(amount: number): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `€${amount}`;
  }
}

// The "high watermark" — a score below this means no strong match.
export const PERFECT_THRESHOLD = 80;
