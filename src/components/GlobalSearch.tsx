import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t, type Lang } from "../lib/i18n";
import { cars } from "../lib/db";
import { stories } from "../lib/stories";
import { applySearch, formatPrice } from "../lib/carUtils";
import { categoryKey, categoryList, type Car, type Category } from "../lib/cars";
import type { Story } from "../lib/stories";
import { ArrowRight, SearchIcon } from "./icons";

const MAX_CARS = 8;
const MAX_STORIES = 4;

export default function GlobalSearch({
  lang,
  onClose,
  onOpenCar,
  onOpenStory,
}: {
  lang: Lang;
  onClose: () => void;
  onOpenCar: (c: Car) => void;
  onOpenStory: (s: Story) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Real quick-search suggestions pulled from the database.
  const suggestions = useMemo(() => {
    if (query.trim().length >= 2)
      return { brands: [] as string[], cats: [] as { id: Category; key: string }[] };
    const counts = new Map<string, number>();
    for (const c of cars) counts.set(c.brand, (counts.get(c.brand) ?? 0) + 1);
    const brands = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([brand]) => brand);
    const cats = categoryList.slice(0, 4).map((c) => ({ id: c.id, key: c.key }));
    return { brands, cats };
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2)
      return { total: 0, cars: [] as Car[], stories: [] as Story[] };
    const carMatches = applySearch(cars, q);
    return {
      total: carMatches.length,
      cars: carMatches.slice(0, MAX_CARS),
      stories: stories
        .filter((s) => `${s.car} ${s.brand} ${s.title}`.toLowerCase().includes(q))
        .slice(0, MAX_STORIES),
    };
  }, [query]);

  const showPanel = query.trim().length >= 2;
  const hasResults = results.cars.length > 0 || results.stories.length > 0;

  const viewAll = () => {
    const q = query.trim();
    if (!q) return;
    onClose();
    navigate(`/explore?q=${encodeURIComponent(q)}`);
  };

  const clear = () => setQuery("");

  return (
    <div className="fixed inset-0 z-[58] overflow-y-auto bg-ink/95 backdrop-blur-xl" onClick={onClose}>
      {/* Always-visible close on mobile (and keyboard users) */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t(lang, "detail_close")}
        className="fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-line bg-charcoal/80 text-fog backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
      >
        ✕
      </button>
      <div className="mx-auto max-w-2xl px-5 pt-24 sm:pt-28" onClick={(e) => e.stopPropagation()}>
        {/* Search field */}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fog" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && showPanel) viewAll();
            }}
            placeholder={t(lang, "search_placeholder")}
            className="h-14 w-full border border-line bg-charcoal pl-12 pr-12 text-base text-white placeholder:text-fog focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label={t(lang, "filter_clear")}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-fog transition-colors hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggestions before typing */}
        {!showPanel && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-fog">
              {t(lang, "search_suggested")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setQuery(brand)}
                  className="border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-mist transition-colors hover:border-white/30 hover:text-white"
                >
                  {brand}
                </button>
              ))}
              {suggestions.cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setQuery(c.id)}
                  className="border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-mist transition-colors hover:border-white/30 hover:text-white"
                >
                  {t(lang, c.key)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {showPanel && hasResults && (
          <div className="mt-4 border border-line bg-charcoal">
            {results.cars.length > 0 && (
              <div className="px-4 pt-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                    {t(lang, "universe_eyebrow").toUpperCase()} ·{" "}
                    {results.cars.length} {t(lang, "results_showing")}
                  </p>
                  <span className="text-[10px] text-fog">
                    {t(lang, "search_results_of")} {results.total}
                  </span>
                </div>
                {results.cars.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onOpenCar(c);
                    }}
                    className="flex w-full items-center gap-3 border-b border-line py-3 text-left transition-colors hover:bg-ink"
                  >
                    <img src={c.image} alt={c.model} className="h-14 w-20 shrink-0 object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {c.brand} {c.model}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-fog">
                        {c.year} · {c.engine} · {c.hp} {t(lang, "card_hp")}
                      </p>
                      <span className="mt-1.5 inline-block border border-line px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-mist">
                        {t(lang, categoryKey(c.categories[0]))}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-mist">
                      {formatPrice(c.price, lang)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {results.stories.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                  {t(lang, "st_eyebrow").toUpperCase()} · {results.stories.length}{" "}
                  {t(lang, "st_results")}
                </p>
                {results.stories.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onOpenStory(s);
                    }}
                    className="flex w-full items-center gap-3 border-b border-line py-3 text-left transition-colors hover:bg-ink"
                  >
                    <img src={s.image} alt={s.title} className="h-14 w-20 shrink-0 object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{s.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-fog">
                        {s.car} · {s.year} · {s.readTime} {t(lang, "st_min_read")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {/* View everything matching this search */}
            <button
              type="button"
              onClick={viewAll}
              className="group flex w-full items-center justify-between px-4 py-4 text-[11px] font-semibold tracking-[0.18em] text-white transition-colors hover:bg-ink"
            >
              {t(lang, "search_all_results")}
              <span className="flex items-center gap-2 text-fog transition-colors group-hover:text-white">
                {results.total} {t(lang, "universe_count")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        )}

        {/* Empty state */}
        {showPanel && !hasResults && (
          <div className="mt-4 border border-line bg-charcoal px-5 py-12 text-center">
            <p className="font-display text-lg font-semibold text-white">
              {t(lang, "no_results")}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-mist">
              {t(lang, "search_empty_hint")}
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 border border-white/30 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-white transition-colors hover:border-accent hover:bg-accent"
            >
              {t(lang, "filter_clear").toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
