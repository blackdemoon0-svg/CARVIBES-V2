// ============================================================
// CARVIBES — UNIFIED CAR DATABASE
// Merges the curated hero cars with the full brand datasets.
// The single source of truth for all vehicle queries.
// ============================================================
import { curatedCars, type Car, type Fuel } from "./cars";
import { luxury } from "./data/cars-luxury";
import { german } from "./data/cars-german";
import { japanese } from "./data/cars-japanese";
import { american } from "./data/cars-american";
import { asianEv } from "./data/cars-asian-ev";
import { europeanMass } from "./data/cars-european";
import { more } from "./data/cars-more";

const allVehicles: Car[] = [
  ...curatedCars,
  ...luxury,
  ...german,
  ...japanese,
  ...american,
  ...asianEv,
  ...europeanMass,
  ...more,
];

// Safety net: de-duplicate by id (in case of accidental duplicate entries)
// so React keys always remain unique and filters operate on a clean set.
const seen = new Set<string>();
export const cars: Car[] = allVehicles.filter((c) => {
  if (seen.has(c.id)) return false;
  seen.add(c.id);
  return true;
});

export const allBrands = Array.from(new Set(cars.map((c) => c.brand))).sort();
export const allBodyTypes = Array.from(new Set(cars.map((c) => c.body))).sort();
export const allFuels: Fuel[] = Array.from(new Set(cars.map((c) => c.fuel))).sort();

export const totalCars = cars.length;

// Log the verified database size + any removed duplicates for verification.
if (typeof window !== "undefined") {
  if (allVehicles.length !== cars.length) {
    console.warn(
      `[CarVibes] Removed ${allVehicles.length - cars.length} duplicate vehicle(s) from the database.`
    );
  }
  console.info(
    `[CarVibes] Vehicle database loaded: ${totalCars} unique real vehicles across ${allBrands.length} brands.`
  );
}
