import { useEffect, useMemo, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { formatPrice, formatStat, recommendCars } from "../../lib/carUtils";
import { cars } from "../../lib/db";
import type { Car } from "../../lib/cars";
import { addRecent } from "../../lib/prefs";
import { ArrowRight } from "../icons";
import { SaveButton, CompareButton } from "../compare/ActionButtons";
import CarCard from "./CarCard";

function hideBody() {
  document.body.style.overflow = "hidden";
}
function showBody() {
  document.body.style.overflow = "";
}

export default function CarDetail({
  car,
  lang,
  onClose,
  onOpen,
}: {
  car: Car;
  lang: Lang;
  onClose: () => void;
  onOpen: (car: Car) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    hideBody();
    addRecent(car.id); // track recently viewed
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      showBody();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, car.id]);

  const similar = useMemo(() => recommendCars(cars, car, 3), [car]);

  const gallery = car.gallery?.length ? car.gallery : [car.image];

  const heroStats = [
    { key: "detail_hp", value: car.hp ? `${formatStat(car.hp)}` : "N/A", suffix: "hp" },
    { key: "detail_torque", value: car.torque ? formatStat(car.torque) : "N/A", suffix: "Nm" },
    { key: "detail_zerohundred", value: car.zeroToHundred ? `${car.zeroToHundred}` : "N/A", suffix: "s" },
    { key: "detail_topspeed", value: car.topSpeed ? formatStat(car.topSpeed) : "N/A", suffix: "km/h" },
    { key: "detail_engine", value: car.engine, suffix: "" },
    { key: "detail_transmission", value: car.transmission, suffix: "" },
  ];

  const specTable = [
    { key: "detail_brand", value: car.brand },
    { key: "detail_year", value: String(car.year) },
    { key: "detail_body", value: car.body },
    { key: "detail_fuel", value: car.fuel },
    { key: "detail_drivetrain", value: car.drivetrain || "N/A" },
    { key: "detail_weight", value: car.weight ? `${formatStat(car.weight)} kg` : "N/A" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-ink/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${car.brand} ${car.model}`}
    >
      <div className="min-h-full py-6 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between pb-5">
            <button
              onClick={onClose}
              className="group flex items-center gap-2 text-[12px] font-medium tracking-[0.18em] text-mist transition-colors hover:text-white"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              {t(lang, "detail_close").toUpperCase()}
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden text-[10px] font-medium tracking-mega text-fog sm:inline">
                CARVIBES · {car.brand.toUpperCase()}
              </span>
              <SaveButton carId={car.id} lang={lang} />
              <CompareButton carId={car.id} lang={lang} />
            </div>
          </div>

          {/* Hero image */}
          <div className="relative aspect-[16/9] overflow-hidden border border-line bg-graphite">
            <img
              src={gallery[activeImage]}
              alt={`${car.brand} ${car.model}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
            {/* Title overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.2em] text-mist">
                    {car.brand.toUpperCase()}
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-white sm:text-5xl">
                    {car.model}
                  </h2>
                  <p className="mt-2 text-sm text-mist">
                    {[car.generation, String(car.year)].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="font-display text-2xl font-semibold text-white sm:text-3xl">
                  {formatPrice(car.price, lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Hero stats strip */}
          <div className="grid grid-cols-2 gap-px border border-t-0 border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {heroStats.map((s) => (
              <div key={s.key} className="bg-charcoal px-4 py-4">
                <p className="text-[9px] font-medium tracking-[0.18em] text-fog">
                  {t(lang, s.key)}
                </p>
                <p className="mt-1.5 truncate font-display text-base font-semibold text-white sm:text-lg">
                  {s.value}
                  {s.suffix && (
                    <span className="ml-1 text-xs font-normal text-mist">{s.suffix}</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Body: overview + performance */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h3 className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "detail_overview").toUpperCase()}
              </h3>
              {car.tagline && (
                <p className="max-w-xl text-lg font-light italic leading-relaxed text-white">
                  “{car.tagline}”
                </p>
              )}
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-mist">
                {car.overview ||
                  `The ${car.brand} ${car.model} (${car.year}) is a ${car.body.toLowerCase()} powered by a ${car.engine} producing ${car.hp} hp.`}
              </p>

              {/* Performance spec table */}
              <h3 className="mb-4 mt-10 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "detail_performance").toUpperCase()}
              </h3>
              <dl className="divide-y divide-line border-y border-line">
                {specTable.map((s) => (
                  <div key={s.key} className="flex items-center justify-between py-3">
                    <dt className="text-sm text-fog">{t(lang, s.key)}</dt>
                    <dd className="text-sm font-medium text-white">{s.value || "N/A"}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-fog">
                {t(lang, "detail_notice")}
              </p>
            </div>

            {/* Gallery thumbnails */}
            <div>
              <h3 className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "detail_gallery").toUpperCase()}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square overflow-hidden border transition-colors duration-300 ${
                      activeImage === i
                        ? "border-accent"
                        : "border-line opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={g}
                      alt={`${car.brand} ${car.model} view ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Similar cars */}
          {similar.length > 0 && (
            <div className="mt-14 border-t border-line pt-10">
              <h3 className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "detail_similar").toUpperCase()}
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {similar.map((c, i) => (
                  <CarCard key={c.id} car={c} lang={lang} onOpen={onOpen} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
