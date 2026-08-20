import { t, type Lang } from "../../lib/i18n";
import { formatPrice, formatStat } from "../../lib/carUtils";
import { categoryKey, type Car } from "../../lib/cars";
import { ArrowUpRight } from "../icons";
import ImageWithFallback from "../ImageWithFallback";
import { SaveButton, CompareButton } from "../compare/ActionButtons";

export default function CarCard({
  car,
  lang,
  onOpen,
  index,
}: {
  car: Car;
  lang: Lang;
  onOpen: (car: Car) => void;
  index: number;
}) {
  return (
    <article
      className="card-in edge-light group relative flex flex-col overflow-hidden border border-line bg-charcoal transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(227,38,46,0.15)]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/11] overflow-hidden bg-graphite">
        <ImageWithFallback
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          title={`${car.brand} ${car.model}`}
          className="absolute inset-0"
          imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
        />
        {/* Lighting shift on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-accent/0 transition-colors duration-700 group-hover:bg-accent/10" />

        {/* Category tag */}
        <span className="absolute left-4 top-4 border border-white/15 bg-ink/50 px-2.5 py-1 text-[9px] font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
          {t(lang, categoryKey(car.categories[0]))}
        </span>

        {/* Year */}
        <span className="absolute right-4 top-4 font-display text-sm font-semibold text-white/70">
          {car.year}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col border-t border-line p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate font-display text-lg font-semibold text-white">
            {car.brand} <span className="font-normal text-mist">{car.model}</span>
          </h3>
        </div>
        <p className="mt-1 text-sm text-mist">{car.engine}</p>

        {/* Price + stats */}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm font-semibold tracking-tight text-white">
            {formatPrice(car.price, lang)}
          </span>
          <div className="flex items-center gap-4 text-xs text-fog">
            <span className="flex items-baseline gap-1">
              <span className="font-semibold text-white">{formatStat(car.hp)}</span>
              {t(lang, "card_hp")}
            </span>
            <span className="h-3 w-px bg-line" />
            <span>
              <span className="font-semibold text-white">
                {car.zeroToHundred ? car.zeroToHundred : "—"}
              </span>
              s
            </span>
          </div>
        </div>

        {/* Reveal specs + CTA */}
        <div className="mt-4 grid grid-rows-[0fr] transition-all duration-500 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <dl className="space-y-1.5 border-t border-line pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-fog">{t(lang, "detail_torque")}</dt>
                <dd className="text-white">
                  {car.torque ? `${formatStat(car.torque)} Nm` : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fog">{t(lang, "detail_topspeed")}</dt>
                <dd className="text-white">
                  {car.topSpeed ? `${formatStat(car.topSpeed)} km/h` : "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onOpen(car)}
          className="group/btn mt-4 flex h-11 items-center justify-between border border-white/20 px-4 text-[11px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:border-accent hover:bg-accent hover:shadow-[0_8px_26px_-10px_rgba(227,38,46,0.7)]"
        >
          {t(lang, "card_explore")}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>

        {/* Save + Compare */}
        <div className="mt-2 flex gap-2">
          <SaveButton carId={car.id} lang={lang} className="flex-1 justify-center" />
          <CompareButton carId={car.id} lang={lang} className="flex-1 justify-center" />
        </div>
      </div>
    </article>
  );
}
