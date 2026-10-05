// ============================================================
// CARVIBES ANALYSE — catalogue price matching
//
// Matches the analyzed car against the real CarVibes vehicle
// database to ground the price proxy in catalogue MSRP (USD).
// Matching is normalized + forgiving; no match → the price engine
// falls back to a brand-tier proxy (wider band, lower confidence).
// ============================================================

import { cars } from "../../lib/db";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Catalogue new-price proxies (USD) for brand+model, newest first.
 * Caps at 8 matches to keep the median stable.
 */
export function findCataloguePrices(brand: string, model: string): number[] {
  const b = norm(brand);
  const m = norm(model);
  if (!b || !m) return [];
  const modelTokens = m.split(" ").filter(Boolean);
  const scored: { price: number; year: number; score: number }[] = [];

  for (const car of cars) {
    if (typeof car.price !== "number" || !(car.price > 0)) continue;
    const cb = norm(car.brand ?? "");
    const cm = norm(car.model ?? "");
    if (!cb || !cm) continue;
    if (cb !== b && !cb.includes(b) && !b.includes(cb)) continue;
    // Model match: exact, contains, or strong token overlap.
    let score = 0;
    if (cm === m) score = 3;
    else if (cm.includes(m) || m.includes(cm)) score = 2;
    else {
      const overlap = modelTokens.filter((tk) => tk.length > 1 && cm.includes(tk)).length;
      if (overlap === 0) continue;
      score = overlap >= modelTokens.length ? 2 : 1;
    }
    scored.push({ price: car.price, year: car.year ?? 0, score });
  }

  scored.sort((a, b2) => b2.score - a.score || b2.year - a.year);
  return scored.slice(0, 8).map((s) => s.price);
}

/** Distinct catalogue brands for the form datalist. */
export function catalogueBrands(): string[] {
  const set = new Set<string>();
  for (const car of cars) {
    if (car.brand) set.add(car.brand);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Catalogue models for a brand (datalist suggestions). */
export function catalogueModels(brand: string): string[] {
  const b = norm(brand);
  if (!b) return [];
  const set = new Set<string>();
  for (const car of cars) {
    if (norm(car.brand ?? "") === b && car.model) set.add(car.model);
  }
  return [...set].sort((a, c) => a.localeCompare(c)).slice(0, 60);
}
