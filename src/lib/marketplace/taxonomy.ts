// ============================================================
// CARVIBES / MARKETVIBES — taxonomy + country helpers
//
// The lists come from the SAME JSON files the API validates against
// (src/lib/marketplace/data/*.json), so a value the UI offers can never
// be rejected by the server, and a value the server enforces can never
// be missing from the form.
// ============================================================

import taxonomy from "./data/taxonomy.json";
import countries from "./data/countries.json";

export interface Option {
  id: string;
  label: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  dial: string;
}

export const MAKES: string[] = taxonomy.makes;
export const BODY_TYPES: string[] = taxonomy.bodyTypes;
export const COLORS: string[] = taxonomy.colors;
export const CURRENCIES: string[] = taxonomy.currencies;
export const FUELS: Option[] = taxonomy.fuels;
export const TRANSMISSIONS: Option[] = taxonomy.transmissions;
export const CONDITIONS: Option[] = taxonomy.conditions;
export const SELLER_TYPES: Option[] = taxonomy.sellerTypes;
export const CONTACT_METHODS: Option[] = taxonomy.contactMethods;
export const SORTS: Option[] = taxonomy.sorts;
export const COUNTRIES: Country[] = countries;

const COUNTRY_BY_CODE = new Map(countries.map((c) => [c.code, c]));

export function countryByCode(code: string | undefined | null): Country | null {
  return code ? COUNTRY_BY_CODE.get(String(code).toUpperCase()) ?? null : null;
}

export function countryByName(name: string | undefined | null): Country | null {
  if (!name) return null;
  const target = String(name).trim().toLowerCase();
  return countries.find((c) => c.name.toLowerCase() === target) ?? null;
}

/** URL slug used by /marketplace/brand/:brand and /marketplace/country/:country. */
export function toSlug(value: string | undefined | null, max = 64): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

/** i18n key for a taxonomy option (falls back to its English label). */
export function optionKey(prefix: string, id: string): string {
  return `mk_${prefix}_${id}`;
}

export const DEFAULT_CURRENCY = "USD";

/** Sensible currency for a country (used to pre-fill the sell form). */
export function currencyForCountry(code: string | null | undefined): string {
  return countryByCode(code)?.currency ?? DEFAULT_CURRENCY;
}
