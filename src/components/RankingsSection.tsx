import { useMemo } from "react";
import { t, type Lang } from "../lib/i18n";
import { cars } from "../lib/db";
import { rankForBattle } from "../lib/compare";
import type { Car } from "../lib/cars";
import { ArrowRight } from "./icons";

const LIMIT = 8;

export default function RankingsSection({
  lang,
  onOpen,
}: {
  lang: Lang;
  onOpen: (car: Car) => void;
}) {
  // Real ranking from the existing CarVibes battle-scoring engine.
  const ranked = useMemo(() => rankForBattle(cars).slice(0, LIMIT), []);

  return (
    <section
      id="rankings"
      className="relative border-t border-line bg-charcoal py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "rank_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {t(lang, "rank_title")}
            </h2>
          </div>
          <p
            className="reveal max-w-md text-sm leading-relaxed text-mist"
            data-delay="150"
          >
            {t(lang, "rank_sub")}{" "}
            <span className="text-white/80">
              {cars.length.toLocaleString()} {t(lang, "rank_count")}
            </span>
          </p>
        </div>

        {/* Top cars by CarVibes score */}
        <ol className="grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-2">
          {ranked.map(({ car, total }, i) => (
            <li key={car.id}>
              <button
                type="button"
                onClick={() => onOpen(car)}
                className="group flex w-full items-center gap-4 bg-charcoal px-5 py-4 text-left transition-colors duration-300 hover:bg-graphite sm:gap-6 sm:px-6"
              >
                <span className="w-10 shrink-0 font-display text-2xl font-bold text-white/25 transition-colors duration-300 group-hover:text-accent-soft sm:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold text-white">
                    {car.brand}{" "}
                    <span className="font-normal text-mist">{car.model}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-fog">
                    {car.hp} {t(lang, "card_hp")} ·{" "}
                    {car.zeroToHundred
                      ? `${car.zeroToHundred}s ${t(lang, "detail_zerohundred")}`
                      : t(lang, "detail_na")}{" "}
                    · {car.year}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden h-1 w-20 bg-line sm:block lg:w-24">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${total}%` }}
                    />
                  </div>
                  <span className="font-display text-lg font-bold text-white sm:text-xl">
                    {total}
                  </span>
                  <ArrowRight className="hidden h-4 w-4 text-fog transition-all duration-300 group-hover:translate-x-1 group-hover:text-white sm:block" />
                </div>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
