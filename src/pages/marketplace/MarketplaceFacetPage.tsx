// ============================================================
// CARVIBES / MARKETVIBES — facet routes
//
//   /marketplace/brand/:brand
//   /marketplace/country/:country
//   /marketplace/condition/:condition
//
// Clean, crawlable, self-canonicalising URLs for the facets that really
// have supply. The path segment is a slug (bmw, united-arab-emirates) and
// the API filters on the same slugified value, so /marketplace/brand/bmw
// can never disagree with /marketplace?brand=BMW.
//
// A facet with no listings at all renders the normal empty state (with
// the marketplace CTA) instead of a thin page — and is noindexed by
// MarketplacePage, because the API only reports facets with real supply.
// ============================================================

import { useParams } from "react-router-dom";
import type { Lang } from "../../lib/i18n";
import { COUNTRIES } from "../../lib/marketplace/taxonomy";
import type { FacetKind } from "../../lib/marketplace/types";
import MarketplacePage from "./MarketplacePage";

/** Turn a URL slug back into the value the API filters on. */
function valueFromSlug(kind: FacetKind, slug: string): string {
  if (kind === "country") {
    const match = COUNTRIES.find(
      (country) =>
        country.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug ||
        country.code.toLowerCase() === slug
    );
    if (match) return match.name;
  }
  if (kind === "brand") {
    // Brand slugs are lowercase-hyphenated ("mercedes-benz"); the API
    // matches slug-vs-slug, so passing the slug through is exact.
    return slug.replace(/-/g, " ");
  }
  return slug;
}

export default function MarketplaceFacetPage({ lang, kind }: { lang: Lang; kind: FacetKind }) {
  const params = useParams();
  const raw = (params.brand ?? params.country ?? params.condition ?? "").toLowerCase();
  const value = valueFromSlug(kind, raw);
  return <MarketplacePage lang={lang} facet={value ? { kind, value } : null} />;
}
