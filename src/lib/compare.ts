// ============================================================
// CARVIBES — COMPARISON / "CAR BATTLE" SCORING ENGINE
// Deterministically scores vehicles from real database fields.
// No values are invented — missing specs are handled (0 → N/A).
// ============================================================
import type { Car } from "./cars";

export interface CompareScore {
  car: Car;
  total: number; // 0–100
  breakdown: { key: string; label: string; value: number; max: number }[];
}

const RELIABLE_BRANDS = new Set([
  "Toyota", "Honda", "Lexus", "Mazda", "Subaru", "Suzuki", "Datsun", "Volvo",
]);

function reliabilityScore(c: Car): number {
  let s = 50;
  if (RELIABLE_BRANDS.has(c.brand)) s += 25;
  if (c.categories.includes("daily")) s += 15;
  if (c.fuel === "Electric" || c.fuel === "Hybrid") s += 5;
  if (c.categories.includes("supercar")) s -= 10;
  if (c.hp > 600) s -= 5; // high-strung engines tend to cost more to maintain
  return Math.max(20, Math.min(95, s));
}

function comfortScore(c: Car): number {
  let s = 50;
  if (c.categories.includes("luxury")) s += 25;
  if (c.body === "Sedan" || c.body === "SUV" || c.body === "Wagon") s += 10;
  if (c.categories.includes("supercar") || c.categories.includes("sports")) s -= 10;
  if (c.body === "Coupe" || c.body === "Hatchback") s -= 5;
  return Math.max(20, Math.min(95, s));
}

function techScore(c: Car): number {
  let s = 40;
  if (c.fuel === "Electric") s += 30;
  if (c.fuel === "Hybrid") s += 20;
  if (c.year >= 2020) s += 20;
  else if (c.year >= 2015) s += 10;
  if (c.categories.includes("luxury")) s += 10;
  return Math.max(15, Math.min(95, s));
}

// Normalised 0–1 helpers (missing = 0)
function norm(v: number) {
  return v && v > 0 ? v : 0;
}

/**
 * Compute a 0–100 "battle" score from actual data.
 * Weights: Performance 20, Value 20, Acceleration 15, Top speed 10,
 *          Reliability 15, Comfort 10, Technology 10.
 */
export function battleScore(car: Car): CompareScore {
  // Performance (hp) — relative to 1000 hp ceiling
  const perf = Math.min(1, norm(car.hp) / 1000) * 20;

  // Value — reward higher hp per dollar while penalising very high price
  const hpPerPrice = car.price > 0 ? car.hp / car.price : 0;
  const value = Math.min(1, hpPerPrice * 40000) * 20;

  // Acceleration — faster 0–100 is better (assume slowest ~ 12s)
  const accel = c0to100Score(car) * 15;

  // Top speed — relative to 440 km/h
  const top = Math.min(1, norm(car.topSpeed || 0) / 440) * 10;

  const reliability = (reliabilityScore(car) / 100) * 15;
  const comfort = (comfortScore(car) / 100) * 10;
  const technology = (techScore(car) / 100) * 10;

  const components = [
    { label: "performance", value: perf, max: 20 },
    { label: "value", value: value, max: 20 },
    { label: "acceleration", value: accel, max: 15 },
    { label: "top_speed", value: top, max: 10 },
    { label: "reliability", value: reliability, max: 15 },
    { label: "comfort", value: comfort, max: 10 },
    { label: "technology", value: technology, max: 10 },
  ];

  const total = Math.round(components.reduce((s, x) => s + x.value, 0));

  return {
    car,
    total,
    breakdown: components.map((c) => ({
      key: c.label,
      label: c.label,
      value: Math.round(c.value),
      max: c.max,
    })),
  };
}

function c0to100Score(c: Car): number {
  const t = norm(c.zeroToHundred);
  if (!t) return 0;
  // 1.9s (fastest) → 1.0 ;  12s+ → 0
  return Math.max(0, Math.min(1, 1 - (t - 1.9) / 10));
}

/** Sort cars by battle score descending (highest CarVibes score first). */
export function rankForBattle(cars: Car[]): { car: Car; total: number }[] {
  return cars
    .map((c) => ({ car: c, total: battleScore(c).total }))
    .sort((a, b) => b.total - a.total);
}
