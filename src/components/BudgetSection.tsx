import { useMemo } from "react";
import { Link } from "react-router-dom";
import { t, type Lang } from "../lib/i18n";
import { cars } from "../lib/db";
import { formatPrice } from "../lib/carUtils";
import { ArrowRight } from "./icons";

interface BudgetBand {
  max: number;
  emoji: string;
}

// Real, filterable price bands — each deep-links to the explore page with the
// matching `maxPrice` filter (handled by CarUniverse).
const BANDS: BudgetBand[] = [
  { max: 60000, emoji: "💡" },
  { max: 120000, emoji: "🚗" },
  { max: 250000, emoji: "🔥" },
  { max: 1000000, emoji: "🏁" },
];

export default function BudgetSection({ lang }: { lang: Lang }) {
  const bands = useMemo(
    () =>
      BANDS.map((b, i) => {
        const max = b.max;
        const min = i === 0 ? 0 : BANDS[i - 1].max;
        // Number of cars inside this band (the last one is "this or more").
        const count =
          i === BANDS.length - 1
            ? cars.filter((c) => c.price >= min).length
            : cars.filter((c) => c.price >= min && c.price < max).length;
        return { ...b, count };
      }),
    []
  );

  return (
    <section
      id="budget"
      className="relative border-t border-line bg-charcoal py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        <div className="mb-12">
          <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
            <span className="h-px w-8 bg-accent" />
            {t(lang, "budget_eyebrow")}
          </p>
          <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            {t(lang, "budget_title")}
          </h2>
          <p
            className="reveal mt-4 max-w-xl text-sm leading-relaxed text-mist"
            data-delay="120"
          >
            {t(lang, "budget_sub")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {bands.map((b, i) => (
            <Link
              key={b.max}
              to={`/explore?maxPrice=${b.max}`}
              className="reveal edge-light group relative flex flex-col justify-between overflow-hidden border border-line bg-ink px-6 py-7 transition-all duration-300 hover:border-white/25 hover:bg-graphite"
              data-delay={i * 60}
            >
              <span
                className="pointer-events-none absolute -right-6 -top-6 text-7xl opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.16]"
                aria-hidden="true"
              >
                {b.emoji}
              </span>
              <div>
                <p className="text-2xl" aria-hidden="true">
                  {b.emoji}
                </p>
                <p className="mt-4 font-display text-xl font-bold text-white sm:text-2xl">
                  {t(lang, "budget_up_to")}{" "}
                  <span className="text-accent-soft">
                    {formatPrice(b.max, lang)}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                <span className="text-xs text-fog">
                  {b.count} {t(lang, "browse_cars")}
                </span>
                <ArrowRight className="h-4 w-4 text-fog transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-soft" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
