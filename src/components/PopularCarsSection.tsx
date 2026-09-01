import { useMemo } from "react";
import { t, type Lang } from "../lib/i18n";
import { cars } from "../lib/db";
import { applySort, formatPrice } from "../lib/carUtils";
import { categoryKey, type Car } from "../lib/cars";
import ImageWithFallback from "./ImageWithFallback";
import { ArrowRight } from "./icons";

const LIMIT = 6;

export default function PopularCarsSection({
  lang,
  onOpen,
}: {
  lang: Lang;
  onOpen: (car: Car) => void;
}) {
  // Most popular per the project's own ranking logic (supercar/classic/
  // sports/JDM bias + power), sliced to a compact editorial row.
  const popular = useMemo(() => applySort(cars, "popular").slice(0, LIMIT), []);

  return (
    <section
      id="popular-cars"
      className="relative border-t border-line bg-ink py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "popular_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {t(lang, "popular_title")}
            </h2>
            <p
              className="reveal mt-4 max-w-md text-sm leading-relaxed text-mist"
              data-delay="120"
            >
              {t(lang, "popular_sub")}
            </p>
          </div>
          <a
            href="#explore"
            className="reveal group inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-mist transition-colors duration-300 hover:text-white"
            data-delay="150"
          >
            {t(lang, "popular_view_all")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Compact strip: horizontal snap on mobile, grid on desktop */}
        <div className="reveal -mx-5 snap-x snap-mandatory overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-4 lg:grid lg:w-auto lg:grid-cols-3 lg:gap-5">
            {popular.map((car, i) => (
              <button
                key={car.id}
                type="button"
                onClick={() => onOpen(car)}
                className="edge-light group w-[78vw] max-w-[320px] shrink-0 snap-start border border-line bg-charcoal text-left transition-all duration-300 hover:border-white/25 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)] sm:w-[300px] lg:w-auto"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
                  <ImageWithFallback
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    title={`${car.brand} ${car.model}`}
                    className="absolute inset-0"
                    imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 border border-white/15 bg-ink/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
                    {t(lang, categoryKey(car.categories[0]))}
                  </span>
                  <span className="absolute right-3 top-3 font-display text-sm font-bold text-white/70">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="border-t border-line p-4">
                  <h3 className="truncate font-display text-base font-semibold text-white">
                    {car.brand}{" "}
                    <span className="font-normal text-mist">{car.model}</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-fog">
                    <span className="font-semibold text-white">
                      {formatPrice(car.price, lang)}
                    </span>
                    <span>
                      {car.hp} {t(lang, "card_hp")} · {car.year}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
