// ============================================================
// CARVIBES / MARKETVIBES — filter state ⇄ URL
//
// THE INDEXABILITY RULE (see docs/MARKETPLACE.md §SEO):
//   * Path-based facets — /marketplace/brand/bmw, /marketplace/country/
//     morocco, /marketplace/condition/used — are indexable, self-
//     canonicalising and only exist for facets with real supply.
//   * Query parameters (?brand=…&priceMax=…&sort=…) work for sharing and
//     deep-linking, but everything except a single matching facet is
//     noindex + canonicalised back to /marketplace, so no search engine
//     can ever crawl itself into thousands of thin combinations.
// ============================================================

import type { FacetKind, ListingFilters, SortId, VehicleCondition, SellerType } from "./types";
import { toSlug } from "./taxonomy";

export const FILTER_KEYS = [
  "brand",
  "model",
  "body",
  "fuel",
  "transmission",
  "condition",
  "country",
  "city",
  "sellerType",
  "priceMin",
  "priceMax",
  "q",
  "sort",
  "page",
] as const;

export function filtersFromParams(
  search: URLSearchParams,
  facet?: { kind: FacetKind; value: string } | null
): ListingFilters {
  const filters: ListingFilters = {
    brand: search.get("brand") ?? (facet?.kind === "brand" ? facet.value : undefined),
    model: search.get("model") ?? undefined,
    body: search.get("body") ?? undefined,
    fuel: search.get("fuel") ?? undefined,
    transmission: search.get("transmission") ?? undefined,
    condition: (search.get("condition") as VehicleCondition | null) ??
      ((facet?.kind === "condition" ? (facet.value as VehicleCondition) : undefined) || undefined),
    country: search.get("country") ?? (facet?.kind === "country" ? facet.value : undefined),
    city: search.get("city") ?? undefined,
    sellerType: (search.get("sellerType") as SellerType | null) ?? undefined,
    priceMin: numberOrNull(search.get("priceMin")),
    priceMax: numberOrNull(search.get("priceMax")),
    q: search.get("q")?.trim() || undefined,
    sort: (search.get("sort") as SortId | null) ?? "newest",
    page: Number(search.get("page") ?? 1) || 1,
  };
  return filters;
}

function numberOrNull(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function paramsFromFilters(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key as keyof ListingFilters];
    if (value === undefined || value === null || value === "" || value === "newest") continue;
    if (key === "page" && Number(value) <= 1) continue;
    params.set(key, String(value));
  }
  return params;
}

export function countActiveFilters(filters: ListingFilters): number {
  const keys: (keyof ListingFilters)[] = [
    "brand",
    "model",
    "body",
    "fuel",
    "transmission",
    "condition",
    "country",
    "city",
    "sellerType",
    "priceMin",
    "priceMax",
    "q",
  ];
  return keys.filter((key) => {
    const value = filters[key];
    return value !== undefined && value !== null && value !== "";
  }).length;
}

/**
 * The canonical, crawlable URL for a filter state — and the decision of
 * whether that URL may be indexed.
 *
 * Exactly ONE facet may be indexed at a time:
 *   /marketplace?brand=bmw          → indexable  (canonical /marketplace/brand/bmw)
 *   /marketplace?brand=bmw&page=2   → noindex     (canonical /marketplace/brand/bmw)
 *   /marketplace?priceMax=20000     → noindex     (canonical /marketplace)
 */
export interface Indexability {
  canonicalPath: string;
  indexable: boolean;
  /** True when a clean, crawlable path page exists for this filter set. */
  cleanFacet: { kind: FacetKind; value: string } | null;
}

export function resolveIndexability(filters: ListingFilters, extraParams: URLSearchParams): Indexability {
  const extra = Array.from(extraParams.keys()).filter((key) => key !== "page");
  const active: { kind: FacetKind; value: string }[] = [];
  if (filters.brand) active.push({ kind: "brand", value: filters.brand });
  if (filters.country) active.push({ kind: "country", value: filters.country });
  if (filters.condition) active.push({ kind: "condition", value: filters.condition });

  const otherFilters =
    Boolean(filters.model) ||
    Boolean(filters.body) ||
    Boolean(filters.fuel) ||
    Boolean(filters.transmission) ||
    Boolean(filters.city) ||
    Boolean(filters.sellerType) ||
    Boolean(filters.priceMin) ||
    Boolean(filters.priceMax) ||
    Boolean(filters.q) ||
    extra.some((key) => key !== "brand" && key !== "country" && key !== "condition");

  if (active.length === 1 && !otherFilters && !(filters.page && filters.page > 1)) {
    const [facet] = active;
    const path =
      facet.kind === "condition"
        ? `/marketplace/condition/${facet.value}`
        : `/marketplace/${facet.kind}/${toSlug(facet.value)}`;
    return { canonicalPath: path, indexable: true, cleanFacet: facet };
  }

  if (active.length === 1 && !otherFilters) {
    // Same facet, but paginated/filtered further: keep the page, drop the
    // variance from the index.
    const [facet] = active;
    const path =
      facet.kind === "condition"
        ? `/marketplace/condition/${facet.value}`
        : `/marketplace/${facet.kind}/${toSlug(facet.value)}`;
    return { canonicalPath: path, indexable: false, cleanFacet: facet };
  }

  if (active.length === 0 && !otherFilters && !(filters.page && filters.page > 1)) {
    // The marketplace landing page itself is indexable: it is the one
    // filter-free URL, and it is the canonical target every filtered or
    // paginated combination points at.
    return { canonicalPath: "/marketplace", indexable: true, cleanFacet: null };
  }

  return { canonicalPath: "/marketplace", indexable: false, cleanFacet: null };
}

/** Sort options are never indexed — they only reorder the same listings. */
export function isSorted(filters: ListingFilters): boolean {
  return Boolean(filters.sort && filters.sort !== "newest");
}
