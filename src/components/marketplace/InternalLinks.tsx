// ============================================================
// CARVIBES / MARKETVIBES — internal-linking blocks
//
// The crawl paths that make the marketplace discoverable: brand facets,
// country facets and the latest listings, all rendered as real
// <a href> links. Only facets with enough supply are linked (and only
// those are indexable — see src/lib/marketplace/filters.ts).
// ============================================================

import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { formatNumber } from "../../lib/marketplace/format";
import type { FacetPage } from "../../lib/marketplace/types";
import { MAKES } from "../../lib/marketplace/taxonomy";

export function FacetLinks({
  lang,
  facets,
  kind,
  limit = 16,
}: {
  lang: Lang;
  facets: FacetPage[];
  kind: "brand" | "country" | "condition";
  limit?: number;
}) {
  const items = facets
    .filter((page) => page.kind === kind)
    .slice(0, limit);
  if (!items.length) return null;

  const heading =
    kind === "brand"
      ? t(lang, "mk_links_brands")
      : kind === "country"
        ? t(lang, "mk_links_countries")
        : t(lang, "mk_links_conditions");

  return (
    <div>
      <h3 className="text-[10px] font-semibold tracking-[0.24em] text-fog">{heading.toUpperCase()}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((page) => (
          <li key={page.path}>
            <Link
              to={page.path}
              className="inline-flex items-center gap-2 border border-line bg-ink/60 px-3 py-1.5 text-[12px] text-mist transition-colors hover:border-white/30 hover:text-white"
            >
              {kind === "condition" ? t(lang, `mk_condition_${page.value}`) : page.value}
              <span className="text-[10px] text-fog">{formatNumber(page.count, lang)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A compact strip of the most recent listings (real links, no JS). */
export function LatestListingsLinks({
  lang,
  items,
}: {
  lang: Lang;
  items: { path: string; title: string; city: string; year: number | null }[];
}) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-[10px] font-semibold tracking-[0.24em] text-fog">{t(lang, "mk_links_latest").toUpperCase()}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className="text-[13px] text-mist transition-colors hover:text-white">
              {item.year ? `${item.year} ` : ""}
              {item.title}
              {item.city ? <span className="text-fog"> · {item.city}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Brand directory: every make in the taxonomy, marked when it has stock. */
export function BrandDirectory({ lang, facets }: { lang: Lang; facets: FacetPage[] }) {
  const withStock = new Map(
    facets.filter((page) => page.kind === "brand").map((page) => [page.value.toLowerCase(), page])
  );
  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-[10px] font-semibold tracking-[0.24em] text-fog hover:text-white">
        {t(lang, "mk_links_all_brands").toUpperCase()}
      </summary>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {MAKES.map((make) => {
          const facet = withStock.get(make.toLowerCase());
          return (
            <li key={make} className="text-[12px]">
              {facet ? (
                <Link to={facet.path} className="text-mist transition-colors hover:text-white">
                  {make} <span className="text-[10px] text-fog">{facet.count}</span>
                </Link>
              ) : (
                <span className="text-fog/60">{make}</span>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
