import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import {
  categoryKey,
  categoryList,
  type Car,
  type Category,
  type SortKey,
} from "../../lib/cars";
import { cars, allBrands, allBodyTypes, allFuels } from "../../lib/db";
import {
  applyFilters,
  applySearch,
  applySort,
  defaultFilters,
  type Filters,
} from "../../lib/carUtils";
import { PRICE_STEPS, formatPrice } from "../../lib/carUtils";
import CarCard from "./CarCard";
import { SearchIcon, ChevronDown, ArrowRight } from "../icons";

const PAGE_SIZE = 9;
const TRANSMISSIONS = ["Automatic", "Manual", "Dual-clutch", "CVT"];

const SORT_OPTIONS: { id: SortKey; key: string }[] = [
  { id: "popular", key: "sort_popular" },
  { id: "newest", key: "sort_newest" },
  { id: "fastest", key: "sort_fastest" },
  { id: "cheapest", key: "sort_cheapest" },
  { id: "powerful", key: "sort_powerful" },
];

export default function CarUniverse({
  lang,
  onOpen,
}: {
  lang: Lang;
  onOpen: (car: Car) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [searchParams] = useSearchParams();

  // Deep links: /explore?cat=sports, ?brand=BMW or ?q=911 preselect filters
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && categoryList.some((c) => c.id === cat)) {
      setActiveCat(cat as Category);
    }
    const brand = searchParams.get("brand");
    if (brand) {
      setFilters((f) => ({ ...f, brand }));
      setActiveCat(null);
    }
    const q = searchParams.get("q");
    if (q) setQuery(q);
    // Budget deep links: /explore?maxPrice=120000
    const maxPrice = Number(searchParams.get("maxPrice"));
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      setFilters((f) => ({ ...f, maxPrice }));
    }
  }, [searchParams]);

  // Reset pagination whenever inputs change
  useEffect(() => {
    setPage(0);
  }, [query, activeCat, filters, sort]);

  const filtered = useMemo(() => {
    let list = [...cars];
    list = applySearch(list, query);
    if (activeCat) list = list.filter((c) => c.categories.includes(activeCat));
    const f: Filters = {
      ...filters,
      categories: activeCat ? [activeCat] : filters.categories,
    };
    list = applyFilters(list, f);
    return applySort(list, sort);
  }, [query, activeCat, filters, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const toggleCat = (cat: Category) => {
    setActiveCat((cur) => (cur === cat ? null : cat));
  };

  const clearAll = () => {
    setFilters(defaultFilters);
    setQuery("");
    setActiveCat(null);
    setSort("popular");
  };

  const hasActiveFilters =
    query !== "" ||
    activeCat !== null ||
    filters.brand !== "" ||
    filters.body !== "" ||
    filters.fuel !== "" ||
    filters.transmission !== "" ||
    filters.maxPrice > 0 ||
    filters.minYear > 0 ||
    filters.minHp > 0;

  // Active filters as removable chips — what the search is currently doing.
  const activeChips: { label: string; clear: () => void }[] = [];
  if (activeCat)
    activeChips.push({
      label: t(lang, categoryKey(activeCat)),
      clear: () => setActiveCat(null),
    });
  if (filters.brand)
    activeChips.push({
      label: filters.brand,
      clear: () => setFilters({ ...filters, brand: "" }),
    });
  if (filters.maxPrice > 0)
    activeChips.push({
      label: PRICE_STEPS.find((p) => p.value === filters.maxPrice)?.label ??
        formatPrice(filters.maxPrice, lang),
      clear: () => setFilters({ ...filters, maxPrice: 0 }),
    });
  if (filters.minYear > 0)
    activeChips.push({
      label: `${filters.minYear}+`,
      clear: () => setFilters({ ...filters, minYear: 0 }),
    });
  if (filters.minHp > 0)
    activeChips.push({
      label: `${filters.minHp}+ ${t(lang, "card_hp")}`,
      clear: () => setFilters({ ...filters, minHp: 0 }),
    });
  if (filters.body)
    activeChips.push({
      label: filters.body,
      clear: () => setFilters({ ...filters, body: "" }),
    });
  if (filters.fuel)
    activeChips.push({
      label: filters.fuel,
      clear: () => setFilters({ ...filters, fuel: "" }),
    });
  if (filters.transmission)
    activeChips.push({
      label: filters.transmission,
      clear: () => setFilters({ ...filters, transmission: "" }),
    });

  return (
    <section
      id="explore"
      className="relative border-t border-line bg-ink py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Heading */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "universe_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {t(lang, "universe_title")}
            </h2>
          </div>
          <p
            className="reveal max-w-md text-sm leading-relaxed text-mist"
            data-delay="150"
          >
            {t(lang, "universe_sub")}{" "}
            <span className="text-white/80">
              {cars.length}+ {t(lang, "universe_count")}
            </span>
          </p>
        </div>

        {/* Search + sort */}
        <div className="reveal mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-fog" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(lang, "search_placeholder")}
              className="h-12 w-full border border-line bg-charcoal pl-11 pr-11 text-sm text-white placeholder:text-fog focus:border-accent/60 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t(lang, "filter_clear")}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-fog transition-colors hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={t(lang, "sort_label")}
              className="h-12 w-full cursor-pointer appearance-none border border-line bg-charcoal px-4 text-[11px] font-semibold tracking-[0.14em] text-white focus:border-white/30 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-charcoal">
                  {t(lang, o.key)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
          </div>
        </div>

        {/* Category chips */}
        <div className="reveal -mx-5 mb-8 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2">
            {categoryList.map((cat) => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  className={`whitespace-nowrap border px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] transition-all duration-300 ${
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-line text-mist hover:border-white/25 hover:text-white"
                  }`}
                >
                  {t(lang, cat.key)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters toggle */}
        <div className="reveal mb-6 flex items-center justify-between">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-mist transition-colors hover:text-white"
          >
            <span className={`h-2 w-2 ${showFilters ? "bg-accent" : "bg-fog"}`} />
            {t(lang, "filter_label")}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-[11px] font-medium tracking-[0.14em] text-fog transition-colors hover:text-accent-soft"
            >
              {t(lang, "filter_clear")} ✕
            </button>
          )}
        </div>

        {/* Filters panel */}
        <div
          className={`mb-10 grid origin-top grid-cols-2 items-end gap-4 overflow-hidden border border-line bg-charcoal/60 transition-all duration-500 sm:grid-cols-3 lg:grid-cols-4 ${
            showFilters
              ? "max-h-[600px] border-white/20 p-5 opacity-100"
              : "max-h-0 border-transparent opacity-0"
          }`}
        >
          {/* Brand */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_brand").toUpperCase()}
            </span>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="">{t(lang, "filter_all")}</option>
              {allBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          {/* Body type */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_body").toUpperCase()}
            </span>
            <select
              value={filters.body}
              onChange={(e) => setFilters({ ...filters, body: e.target.value })}
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="">{t(lang, "filter_all")}</option>
              {allBodyTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          {/* Fuel */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_fuel").toUpperCase()}
            </span>
            <select
              value={filters.fuel}
              onChange={(e) => setFilters({ ...filters, fuel: e.target.value })}
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="">{t(lang, "filter_all")}</option>
              {allFuels.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          {/* Transmission */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_transmission").toUpperCase()}
            </span>
            <select
              value={filters.transmission}
              onChange={(e) =>
                setFilters({ ...filters, transmission: e.target.value })
              }
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="">{t(lang, "filter_all")}</option>
              {TRANSMISSIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          {/* Price */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_price").toUpperCase()}
            </span>
            <select
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: Number(e.target.value) })
              }
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              {PRICE_STEPS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          {/* Year */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_year").toUpperCase()}
            </span>
            <select
              value={filters.minYear}
              onChange={(e) =>
                setFilters({ ...filters, minYear: Number(e.target.value) })
              }
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value={0}>{t(lang, "filter_all")}</option>
              {[2024, 2020, 2015, 2010, 2000, 1990, 1970, 1950].map((y) => (
                <option key={y} value={y}>
                  {y}+
                </option>
              ))}
            </select>
          </label>

          {/* Horsepower */}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
              {t(lang, "filter_hp").toUpperCase()}
            </span>
            <select
              value={filters.minHp}
              onChange={(e) =>
                setFilters({ ...filters, minHp: Number(e.target.value) })
              }
              className="h-10 border border-line bg-ink px-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value={0}>{t(lang, "filter_all")}</option>
              {[200, 400, 600, 800, 1000, 1500].map((h) => (
                <option key={h} value={h}>
                  {h}+ hp
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Active filters */}
        {activeChips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.clear}
                className="flex items-center gap-2 border border-line bg-charcoal px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-mist transition-colors hover:border-accent/60 hover:text-white"
              >
                {chip.label}
                <span aria-hidden="true">✕</span>
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-medium tracking-[0.14em] text-fog transition-colors hover:text-accent-soft"
              >
                {t(lang, "filter_clear").toUpperCase()} ✕
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between text-xs text-fog">
          <span>
            {filtered.length} {t(lang, "results_showing")}{" "}
            {t(lang, "search_results_of")} {cars.length.toLocaleString()}{" "}
            {t(lang, "universe_count")}
          </span>
        </div>

        {/* Grid */}
        {paged.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((car, i) => (
              <CarCard
                key={car.id}
                car={car}
                lang={lang}
                index={i}
                onOpen={onOpen}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-line px-5 py-24 text-center">
            <p className="font-display text-2xl font-semibold text-white">
              {t(lang, "no_results")}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
              {t(lang, "search_empty_hint")}
            </p>
            <button
              onClick={clearAll}
              className="mt-6 w-full border border-white/30 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-white transition-colors hover:border-accent hover:bg-accent sm:w-auto"
            >
              {t(lang, "filter_clear").toUpperCase()}
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i);
                  document
                    .getElementById("explore")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`flex h-10 w-10 items-center justify-center border text-sm font-semibold transition-all duration-300 ${
                  page === i
                    ? "border-accent bg-accent text-white"
                    : "border-line text-mist hover:border-white/30 hover:text-white"
                }`}
                aria-label={`${t(lang, "pagination_page")} ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
            {page < totalPages - 1 && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="ml-2 flex h-10 items-center gap-2 border border-line px-4 text-[11px] font-semibold tracking-[0.14em] text-mist transition-colors hover:border-white/30 hover:text-white"
                aria-label={t(lang, "aria_next_page")}
              >
                {t(lang, "pagination_next")}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
