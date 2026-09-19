// ============================================================
// CARVIBES / MARKETVIBES — /marketplace (+ /brand/:brand,
// /country/:country, /condition/:condition)
//
// One component drives the index and every facet page: the URL is the
// single source of truth for the filter state, so every result set is
// shareable, reload-safe and back-button correct.
//
// SEO: the index and single-facet clean paths are indexable; anything
// filtered further (price ranges, cities, sorting, page 2+, free-text
// search) renders the same UI but declares noindex + canonicalises to the
// cleanest URL that contains it — no thin duplicates, ever.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { fetchFacets, fetchListings } from "../../lib/marketplace/api";
import { trackMarketplace } from "../../lib/marketplace/analytics";
import { countActiveFilters, filtersFromParams, paramsFromFilters, resolveIndexability } from "../../lib/marketplace/filters";
import { formatNumber } from "../../lib/marketplace/format";
import { toSlug } from "../../lib/marketplace/taxonomy";
import type { FacetKind, FacetPage, FacetValue, Facets, ListingCard, ListingFilters, SortId } from "../../lib/marketplace/types";
import { breadcrumbJsonLd, itemListJsonLd, useMarketplaceMeta } from "../../lib/marketplace/useMeta";
import ListingCardView from "../../components/marketplace/ListingCard";
import MarketplaceHero from "../../components/marketplace/MarketplaceHero";
import LaunchBanner from "../../components/marketplace/LaunchBanner";
import { BrandDirectory, FacetLinks, LatestListingsLinks } from "../../components/marketplace/InternalLinks";
import { FilterControls, MarketplaceSearch, MobileFilterDrawer, SortSelect } from "../../components/marketplace/MarketplaceFilters";
import Pagination from "../../components/marketplace/Pagination";
import { EmptyListings, EmptyMarketplace, ErrorState, GridSkeleton, SectionHeading, SellBand } from "../../components/marketplace/states";
import { SlidersIcon } from "../../components/icons";

export interface MarketplaceFacet {
  kind: FacetKind;
  value: string;
}

/** Chip labels reuse the filter labels — one string per concept. */
const CHIP_LABEL: Record<string, string> = {
  brand: "mk_filter_brand",
  model: "mk_filter_model",
  condition: "mk_filter_condition",
  country: "mk_filter_country",
  city: "mk_filter_city",
  sellerType: "mk_filter_seller",
  priceMin: "mk_filter_price_min",
  priceMax: "mk_filter_price_max",
  q: "mk_search_label",
};

const EMPTY_FACETS: Facets = {
  brands: [],
  countries: [],
  cities: [],
  conditions: [],
  sellerTypes: [],
  total: 0,
};

export default function MarketplacePage({ lang, facet = null }: { lang: Lang; facet?: MarketplaceFacet | null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const filters = useMemo(() => filtersFromParams(searchParams, facet), [searchParams, facet]);
  const indexability = useMemo(() => resolveIndexability(filters, searchParams), [filters, searchParams]);

  const [items, setItems] = useState<ListingCard[] | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [facets, setFacets] = useState<Facets>(EMPTY_FACETS);
  const [facetPages, setFacetPages] = useState<FacetPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<ListingFilters>(filters);

  const requestId = useRef(0);
  const firstLoad = useRef(true);

  const queryKey = searchParams.toString() + (facet ? `${facet.kind}:${facet.value}` : "");

  // Keep the draft controls in sync when the URL changes (back button,
  // chip removal, hero search…).
  useEffect(() => setDraft(filters), [filters]);

  const load = useCallback(
    (signal?: AbortSignal) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(false);
      void fetchListings(filters, signal).then((result) => {
        if (id !== requestId.current) return;
        if (result.ok) {
          setItems(result.data.items);
          setTotal(result.data.total);
          setPages(result.data.pages);
          setFacets(result.data.facets);
        } else {
          setError(true);
          setItems([]);
        }
        setLoading(false);
        firstLoad.current = false;
      });
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, queryKey]);

  // Facet directory (indexable pages + counts) — one lightweight request,
  // shared by the internal-linking blocks and the facet page metadata.
  useEffect(() => {
    const controller = new AbortController();
    void fetchFacets(controller.signal).then((result) => {
      if (result.ok) setFacetPages(result.data.pages);
    });
    return () => controller.abort();
  }, []);

  // ------------------------------------------------------------
  // Metadata
  // ------------------------------------------------------------
  const activeFacetPage = useMemo(() => {
    if (!facet) return null;
    const slug = facet.kind === "condition" ? facet.value : toSlug(facet.value);
    return facetPages.find((page) => page.kind === facet.kind && page.slug === slug) ?? null;
  }, [facet, facetPages]);

  const indexable = indexability.indexable && (!facet || Boolean(activeFacetPage));

  /**
   * The URL segment is a slug ("bmw", "mercedes-benz"). The facet directory
   * carries the API's own value ("BMW", "Mercedes-Benz"), so headings,
   * breadcrumbs and metadata adopt it once it arrives — the slug stays the
   * canonical URL either way.
   */
  const displayValue =
    activeFacetPage?.value ??
    (facet
      ? facet.value
          .split(/[\s\-_]+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "");
  const meta = useMemo(() => {
    if (facet) {
      return {
        title: activeFacetPage?.title ?? `${displayValue} cars for sale | CarVibes MarketVibes`,
        description:
          activeFacetPage?.description ??
          t(lang, "mk_facet_empty_desc", { value: displayValue }),
        // Only a facet with real supply (a published facet page) is
        // allowed to stand on its own URL; a hand-typed brand that has no
        // page behind it consolidates onto the marketplace index.
        canonicalPath: activeFacetPage ? indexability.canonicalPath : "/marketplace",
      };
    }
    if (indexability.canonicalPath !== "/marketplace") {
      const match = facetPages.find((page) => page.path === indexability.canonicalPath);
      return {
        title: match?.title ?? t(lang, "mk_meta_title"),
        description: match?.description ?? t(lang, "mk_meta_desc"),
        canonicalPath: indexability.canonicalPath,
      };
    }
    return {
      title: t(lang, "mk_meta_title"),
      description: t(lang, "mk_meta_desc"),
      canonicalPath: "/marketplace",
    };
  }, [activeFacetPage, facet, facetPages, indexability.canonicalPath, lang]);

  const jsonLd = useMemo(() => {
    const crumbs = [{ name: "CarVibes", path: "/" }, { name: t(lang, "mk_brand_name"), path: "/marketplace" }];
    if (facet) crumbs.push({ name: facet.value, path: indexability.canonicalPath });
    const list = indexable && items?.length ? [itemListJsonLd(items.slice(0, 12))] : [];
    return [...list, breadcrumbJsonLd(crumbs)];
  }, [facet, indexability.canonicalPath, indexable, items, lang]);

  useMarketplaceMeta({
    title: meta.title,
    description: meta.description,
    canonicalPath: meta.canonicalPath,
    indexable,
    jsonLd,
  });

  useEffect(() => {
    trackMarketplace("marketplace_view", { facet: facet ? `${facet.kind}:${facet.value}` : "index" });
  }, [facet]);

  // ------------------------------------------------------------
  // Navigation helpers — the URL is the state
  // ------------------------------------------------------------
  const applyPatch = useCallback(
    (patch: Partial<ListingFilters>) => {
      const next = { ...filters, ...patch, page: 1 };
      const params = paramsFromFilters(next);
      setSearchParams(params, { replace: false });
      setDrawerOpen(false);
      trackMarketplace("marketplace_filter", {
        brand: patch.brand ?? "",
        country: patch.country ?? "",
        condition: patch.condition ?? "",
      });
    },
    [filters, setSearchParams]
  );

  const reset = useCallback(() => {
    if (facet) {
      navigate(indexability.canonicalPath, { replace: false });
      setDrawerOpen(false);
      return;
    }
    setSearchParams(new URLSearchParams(), { replace: false });
    setDrawerOpen(false);
  }, [facet, indexability.canonicalPath, navigate, setSearchParams]);

  const buildPageHref = useCallback(
    (page: number) => {
      const params = paramsFromFilters({ ...filters, page });
      const suffix = params.toString();
      const base = facet ? location.pathname : "/marketplace";
      return suffix ? `${base}?${suffix}` : base;
    },
    [facet, filters, location.pathname]
  );

  const priceCurrency = facets.brands.length || items?.length ? items?.[0]?.currency ?? "USD" : "USD";
  const activeCount = countActiveFilters(filters);

  // Collect the facets the API considers indexable, for the link blocks.
  const facetPagesByKind = useMemo(() => {
    const byKind: Record<string, FacetPage[]> = { brand: [], country: [], condition: [] };
    for (const page of facetPages) byKind[page.kind]?.push(page);
    return byKind;
  }, [facetPages]);

  const heroStats = useMemo(() => {
    if (!facets.total) return null;
    return {
      listings: facets.total,
      brands: facets.brands.length,
      countries: facets.countries.length,
    };
  }, [facets]);

  const heading = facet
    ? facet.kind === "brand"
      ? t(lang, "mk_heading_brand", { value: displayValue })
      : facet.kind === "country"
        ? t(lang, "mk_heading_country", { value: displayValue })
        : t(lang, "mk_heading_condition", { value: t(lang, `mk_condition_${facet.value}`) })
    : t(lang, "mk_heading_all");

  const topCities: FacetValue[] = facets.cities.slice(0, 8);

  return (
    <>
      {!facet && (
        <MarketplaceHero
          lang={lang}
          query={filters.q ?? ""}
          stats={heroStats}
          onSearch={(value) => applyPatch({ q: value || undefined })}
        />
      )}

      {/* Launch announcement — its own band between the hero and the
          results, landing page only, and it retires itself once the
          marketplace has real inventory. */}
      {!facet && (
        <div className="mx-auto max-w-6xl px-4 pt-7 sm:px-6 sm:pt-9">
          <LaunchBanner lang={lang} listingCount={total} />
        </div>
      )}

      <section id="marketplace-results" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {facet && (
          <nav aria-label={t(lang, "mk_breadcrumb")} className="mb-4 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.14em] text-fog">
            <a href="/marketplace" className="transition-colors hover:text-white">
              {t(lang, "mk_brand_name")}
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-mist">{facet.kind === "condition" ? t(lang, `mk_condition_${facet.value}`) : displayValue}</span>
          </nav>
        )}

        <SectionHeading
          as={facet ? "h1" : "h2"}
          eyebrow={t(lang, "mk_results_eyebrow")}
          title={heading}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <SortSelect
                lang={lang}
                value={filters.sort ?? "newest"}
                onChange={(sort: SortId) => {
                  applyPatch({ sort });
                  trackMarketplace("marketplace_sort", { sort });
                }}
              />
            </div>
          }
        />

        {/* Search + mobile filter trigger */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="lg:max-w-xl lg:flex-1">
            <MarketplaceSearch lang={lang} value={filters.q ?? ""} onSubmit={(value) => applyPatch({ q: value || undefined })} size="md" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="cv-btn cv-btn-sm cv-btn-ghost inline-flex h-12 flex-1 items-center justify-center gap-2 px-5 text-[11px] font-semibold tracking-[0.16em] lg:hidden"
              aria-expanded={drawerOpen}
            >
              <SlidersIcon className="h-4 w-4" />
              {t(lang, "mk_filters_button")}
              {activeCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <p className="hidden text-[12px] tracking-[0.14em] text-fog lg:block" aria-live="polite">
              {loading && items === null
                ? t(lang, "mk_loading")
                : t(lang, "mk_results_count", { count: formatNumber(total, lang) })}
            </p>
          </div>
        </div>

        {/* Desktop filters */}
        <div className="mb-6 hidden border border-line bg-charcoal p-5 lg:block">
          <FilterControls
            lang={lang}
            filters={filters}
            facets={facets}
            priceCurrency={priceCurrency}
            onApply={applyPatch}
            onReset={reset}
            draft={draft}
            setDraft={setDraft}
          />
          {(activeCount > 0 || (filters.sort && filters.sort !== "newest")) && (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => applyPatch(draft)}
                className="cv-btn cv-btn-sm cv-btn-primary h-10 px-5 text-[11px] font-semibold tracking-[0.16em]"
              >
                {t(lang, "mk_apply_filters")}
              </button>
              <button type="button" onClick={reset} className="text-[11px] font-semibold tracking-[0.16em] text-mist underline underline-offset-4 hover:text-white">
                {t(lang, "mk_reset_filters")}
              </button>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <ul className="mb-6 flex flex-wrap items-center gap-2">
            {(
              [
                ["brand", filters.brand],
                ["model", filters.model],
                ["condition", filters.condition],
                ["country", filters.country],
                ["city", filters.city],
                ["sellerType", filters.sellerType],
                ["priceMin", filters.priceMin],
                ["priceMax", filters.priceMax],
                ["q", filters.q],
              ] as [keyof ListingFilters, string | number | undefined | null][]
            )
              .filter(([, value]) => value !== undefined && value !== null && value !== "")
              .map(([key, value]) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => applyPatch({ [key]: undefined } as Partial<ListingFilters>)}
                    className="inline-flex items-center gap-2 border border-line bg-ink/70 px-3 py-1.5 text-[12px] text-mist transition-colors hover:border-accent/60 hover:text-white"
                  >
                    <span className="text-fog">{t(lang, CHIP_LABEL[key] ?? "mk_filter_brand")}:</span>
                    {key === "condition" ? t(lang, `mk_condition_${value}`) : String(value)}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">{t(lang, "mk_remove_filter")}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}

        {/* Results */}
        <div aria-live="polite" aria-busy={loading}>
          {error ? (
            <ErrorState lang={lang} onRetry={() => load()} />
          ) : items === null ? (
            <GridSkeleton count={6} lang={lang} />
          ) : items.length === 0 ? (
            // Nothing listed at all is a different story from "your filters
            // matched nothing": the first invites the seller, the second
            // invites a wider search.
            total === 0 && activeCount === 0 && !facet ? (
              <EmptyMarketplace lang={lang} />
            ) : (
              <EmptyListings lang={lang} onReset={activeCount > 0 ? reset : undefined} />
            )
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((listing, index) => (
                  <ListingCardView key={listing.id} listing={listing} lang={lang} index={index} priority={index < 2 && firstLoad.current} />
                ))}
              </div>
              {loading && (
                <p className="mt-4 text-center text-[11px] tracking-[0.18em] text-fog" role="status">
                  {t(lang, "mk_loading")}
                </p>
              )}
              <Pagination page={filters.page ?? 1} pages={pages} buildHref={buildPageHref} lang={lang} />
            </>
          )}
        </div>

        {/* Seller funnel */}
        <div className="mt-12">
          <SellBand lang={lang} />
        </div>

        {/* Internal linking (crawl paths + genuine discovery) */}
        <div className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
          <FacetLinks lang={lang} facets={facetPagesByKind.brand ?? []} kind="brand" />
          <FacetLinks lang={lang} facets={facetPagesByKind.country ?? []} kind="country" />
          <FacetLinks lang={lang} facets={facetPagesByKind.condition ?? []} kind="condition" />
          {topCities.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold tracking-[0.24em] text-fog">{t(lang, "mk_links_cities").toUpperCase()}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {topCities.map((city) => (
                  <li key={city.value}>
                    <button
                      type="button"
                      onClick={() => applyPatch({ city: city.value })}
                      className="border border-line bg-ink/60 px-3 py-1.5 text-[12px] text-mist transition-colors hover:border-white/30 hover:text-white"
                    >
                      {city.value} <span className="text-[10px] text-fog">{city.total}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="sm:col-span-2">
            <LatestListingsLinks
              lang={lang}
              items={(items ?? []).slice(0, 9).map((listing) => ({
                path: listing.path,
                title: `${listing.brand} ${listing.model}`,
                city: listing.city,
                year: listing.year,
              }))}
            />
          </div>
          <div className="sm:col-span-2">
            <BrandDirectory lang={lang} facets={facetPagesByKind.brand ?? []} />
          </div>
        </div>
      </section>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lang={lang}
        resultCount={null}
        onApply={() => applyPatch(draft)}
      >
        <FilterControls
          lang={lang}
          filters={filters}
          facets={facets}
          priceCurrency={priceCurrency}
          onApply={applyPatch}
          onReset={reset}
          draft={draft}
          setDraft={setDraft}
        />
      </MobileFilterDrawer>
    </>
  );
}
