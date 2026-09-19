// ============================================================
// CARVIBES / MARKETVIBES — route metadata hook
//
// Marketplace routes own their <head>: the list page has facet URLs, the
// listing page has per-listing metadata and both must be able to declare
// noindex (filtered combinations, seller funnel, admin). All of it goes
// through the same writer the rest of CarVibes uses, so canonicals,
// Open Graph and JSON-LD stay byte-compatible with the prerendered HTML.
// ============================================================

import { useEffect, useMemo } from "react";
import { applyHeadMeta, SITE_URL, syncMarketplaceJsonLd } from "../seo";

export interface MarketplaceMeta {
  title: string;
  description: string;
  /** Site-relative canonical path (e.g. /marketplace/brand/bmw). */
  canonicalPath: string;
  indexable: boolean;
  image?: string;
  jsonLd?: unknown[] | null;
}

export function useMarketplaceMeta({ title, description, canonicalPath, indexable, image, jsonLd }: MarketplaceMeta) {
  // Serialised so the effect only re-runs when the payload really changes.
  const jsonLdKey = useMemo(() => (jsonLd ? JSON.stringify(jsonLd) : ""), [jsonLd]);

  useEffect(() => {
    applyHeadMeta({
      title,
      description,
      canonical: `${SITE_URL}${canonicalPath}`,
      robots: indexable ? null : "noindex, follow",
      image,
    });
    syncMarketplaceJsonLd(jsonLdKey ? (JSON.parse(jsonLdKey) as unknown[]) : null);
    return () => syncMarketplaceJsonLd(null);
  }, [title, description, canonicalPath, indexable, image, jsonLdKey]);
}

/** BreadcrumbList JSON-LD for list/facet pages. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** ItemList JSON-LD for a page of listings. */
export function itemListJsonLd(items: { path: string; title: string }[]): unknown {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${item.path}`,
      name: item.title,
    })),
  };
}
