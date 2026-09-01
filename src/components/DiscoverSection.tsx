import { useMemo } from "react";
import { Link } from "react-router-dom";
import { t, type Lang } from "../lib/i18n";
import { cars, allBrands } from "../lib/db";
import { stories } from "../lib/stories";
import { categoryList } from "../lib/cars";
import { ArrowRight } from "./icons";

const BRAND_LIMIT = 8;

export default function DiscoverSection({ lang }: { lang: Lang }) {
  // Real counts derived from the live database — never hardcoded.
  const categoryCounts = useMemo(
    () =>
      new Map(
        categoryList.map((cat) => [
          cat.id,
          cars.filter((c) => c.categories.includes(cat.id)).length,
        ])
      ),
    []
  );

  const topBrands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cars) counts.set(c.brand, (counts.get(c.brand) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, BRAND_LIMIT);
  }, []);

  return (
    <section id="discover" className="relative border-t border-line bg-ink py-20 sm:py-24">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Heading */}
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "browse_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {t(lang, "browse_title")}
            </h2>
          </div>
          <p
            className="reveal max-w-md text-sm leading-relaxed text-mist"
            data-delay="150"
          >
            {t(lang, "browse_sub")}{" "}
            <span className="text-white/80">
              {cars.length.toLocaleString()} {t(lang, "browse_cars")} ·{" "}
              {allBrands.length} {t(lang, "stat_brands").toLowerCase()} ·{" "}
              {stories.length} {t(lang, "stat_stories").toLowerCase()} ·{" "}
              {categoryList.length}{" "}
              {t(lang, "stat_categories").toLowerCase()}
            </span>
          </p>
        </div>

        {/* Categories */}
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-accent" />
          <span className="text-[11px] font-semibold tracking-mega text-fog">
            {t(lang, "browse_categories")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categoryList.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/explore?cat=${cat.id}`}
              className="reveal edge-light group flex items-center justify-between gap-3 border border-line bg-charcoal px-5 py-5 transition-all duration-300 hover:border-white/25 hover:bg-graphite"
              data-delay={i * 50}
            >
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-white transition-colors duration-300 group-hover:text-accent-soft sm:text-xl">
                  {t(lang, cat.key)}
                </p>
                <p className="mt-1 text-xs text-fog">
                  {categoryCounts.get(cat.id)} {t(lang, "browse_cars")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-fog transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-soft" />
            </Link>
          ))}
        </div>

        {/* Popular brands */}
        <div className="mt-14 mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="text-[11px] font-semibold tracking-mega text-fog">
              {t(lang, "browse_brands")}
            </span>
          </div>
          <Link
            to="/brands"
            className="group flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-mist transition-colors duration-300 hover:text-white"
          >
            {t(lang, "browse_all_brands")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topBrands.map(([brand, count], i) => (
            <Link
              key={brand}
              to={`/explore?brand=${encodeURIComponent(brand)}`}
              className="reveal edge-light group flex items-center justify-between gap-3 border border-line bg-charcoal px-4 py-4 transition-all duration-300 hover:border-white/25 hover:bg-graphite"
              data-delay={i * 50}
            >
              <p className="truncate font-display text-base font-semibold text-white transition-colors duration-300 group-hover:text-accent-soft">
                {brand}
              </p>
              <span className="shrink-0 text-xs text-fog">{count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
