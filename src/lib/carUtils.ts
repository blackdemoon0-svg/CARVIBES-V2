import type { Car, SortKey, Category } from "./cars";

/** Format a price as a compact, premium-looking string. */
export function formatPrice(value: number, lang: string): string {
  // European / Latin-American languages render in EUR; every other language
  // (English, Japanese, Chinese, Arabic…) uses the site's USD database prices.
  const eurLangs = new Set(["fr", "es", "de", "it", "pt", "nl"]);
  const useEur = eurLangs.has(lang);
  const localeMap: Record<string, string> = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    nl: "nl-NL",
    ar: "ar-MA",
    ja: "ja-JP",
    zh: "zh-CN",
  };
  const locale = localeMap[lang] ?? "en-US";
  const currency = useEur ? "EUR" : "USD";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

/** Format a number with a "+" where relevant. */
export function formatStat(value: number | string, suffix = ""): string {
  if (value === "N/A" || value == null) return "N/A";
  return `${Number(value).toLocaleString()}${suffix}`;
}

export interface Filters {
  categories: Category[]; // empty = all
  brand: string; // "" = all
  body: string; // "" = all
  fuel: string; // "" = all
  transmission: string; // "" = all
  maxPrice: number; // 0 = no limit
  minYear: number; // 0 = no limit
  minHp: number; // 0 = no limit
}

export const defaultFilters: Filters = {
  categories: [],
  brand: "",
  body: "",
  fuel: "",
  transmission: "",
  maxPrice: 0,
  minYear: 0,
  minHp: 0,
};

export function applyFilters(list: Car[], f: Filters): Car[] {
  return list.filter((c) => {
    if (f.categories.length > 0 && !c.categories.some((x) => f.categories.includes(x)))
      return false;
    if (f.brand && c.brand !== f.brand) return false;
    if (f.body && c.body !== f.body) return false;
    if (f.fuel && c.fuel !== f.fuel) return false;
    if (f.transmission && c.transmission !== f.transmission) return false;
    if (f.maxPrice > 0 && c.price > f.maxPrice) return false;
    if (f.minYear > 0 && c.year < f.minYear) return false;
    if (f.minHp > 0 && c.hp < f.minHp) return false;
    return true;
  });
}

export function applySearch(list: Car[], query: string): Car[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => {
    const haystack = [
      c.brand,
      c.model,
      c.generation,
      c.body,
      c.engine,
      c.fuel,
      String(c.year),
      ...c.categories,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function applySort(list: Car[], sort: SortKey): Car[] {
  const arr = [...list];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => b.year - a.year);
    case "cheapest":
      return arr.sort((a, b) => a.price - b.price);
    case "fastest":
      return arr.sort((a, b) => b.zeroToHundred === 0 ? 1 : a.zeroToHundred === 0 ? -1 : a.zeroToHundred - b.zeroToHundred);
    case "powerful":
      return arr.sort((a, b) => b.hp - a.hp);
    case "popular":
    default:
      // "Most popular" — deterministic bias favoring iconic/supercar flags then price.
      return arr.sort((a, b) => {
        const score = (c: Car) =>
          (c.categories.includes("supercar") ? 3 : 0) +
          (c.categories.includes("classic") ? 2 : 0) +
          (c.categories.includes("sports") ? 1 : 0) +
          (c.categories.includes("jdm") ? 1 : 0);
        return score(b) - score(a) || b.hp - a.hp;
      });
  }
}

/**
 * Smart recommendations — "You may also like".
 * Scores by brand, category, body type, price band and horsepower band,
 * then returns the closest matches from the database.
 */
export function recommendCars(all: Car[], car: Car, limit = 3): Car[] {
  const priceBand = (c: Car) => Math.floor(c.price / 30000);
  const hpBand = (c: Car) => Math.floor(c.hp / 100);

  return all
    .filter((c) => c.id !== car.id)
    .map((c) => {
      let score = 0;
      if (c.brand === car.brand) score += 4;
      score += c.categories.filter((x) => car.categories.includes(x)).length * 2;
      if (c.body === car.body) score += 2;
      if (priceBand(c) === priceBand(car)) score += 1;
      if (hpBand(c) === hpBand(car)) score += 1;
      return { car: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(a.car.hp - car.hp) - Math.abs(b.car.hp - car.hp))
    .slice(0, limit)
    .map((x) => x.car);
}

export const PRICE_STEPS = [
  { label: "Any", value: 0 },
  { label: "$60k", value: 60000 },
  { label: "$120k", value: 120000 },
  { label: "$250k", value: 250000 },
  { label: "$500k", value: 500000 },
  { label: "$1M", value: 1000000 },
];
