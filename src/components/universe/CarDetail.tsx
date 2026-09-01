import { useEffect, useMemo, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { formatPrice, formatStat, recommendCars } from "../../lib/carUtils";
import { cars } from "../../lib/db";
import { battleScore } from "../../lib/compare";
import { categoryKey, type Car } from "../../lib/cars";
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

/**
 * Extract structured engine facts from the existing engine string.
 * Values are derived only from real data already in the database;
 * anything unrecognized is omitted (never guessed).
 */
function engineBreakdown(engine: string) {
  let displacement: string | undefined;
  let cylinders: string | undefined;
  let aspiration: string | undefined;

  const d = engine.match(/(\d+(?:\.\d+)?)L\b/);
  if (d) displacement = `${d[1]} L`;

  const block = engine.match(/\b([VWI])(\d{1,2})\b/);
  if (block) cylinders = `${block[1]}${block[2]}`;
  else {
    const flat = engine.match(/Flat-(\d{1,2})\b/i);
    if (flat) cylinders = `Flat-${flat[1]}`;
    else if (/rotary/i.test(engine)) cylinders = "Rotary";
  }

  if (/twin-turbo/i.test(engine)) aspiration = "Twin-turbo";
  else if (/quad-turbo/i.test(engine)) aspiration = "Quad-turbo";
  else if (/turbo/i.test(engine)) aspiration = "Turbocharged";
  else if (/supercharged/i.test(engine)) aspiration = "Supercharged";
  else if (/\bNA\b|naturally aspirated/i.test(engine)) aspiration = "Naturally aspirated";

  return { displacement, cylinders, aspiration };
}

/** Compact specification-group card: strong group label + scannable rows. */
function SpecGroup({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="border border-line bg-charcoal">
      <p className="border-b border-line px-4 py-3 text-[11px] font-semibold tracking-mega text-white">
        {title}
      </p>
      <dl className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
            <dt className="text-[12px] text-fog">{r.label}</dt>
            <dd className="text-right text-[12px] font-semibold text-white">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
      <span className="h-px w-6 bg-accent" />
      {children}
    </h3>
  );
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
  const sameBrand = useMemo(
    () =>
      cars
        .filter(
          (c) =>
            c.brand === car.brand &&
            c.id !== car.id &&
            !similar.some((s) => s.id === c.id)
        )
        .slice(0, 3),
    [car, similar]
  );

  const gallery = car.gallery?.length ? car.gallery : [car.image];

  const powerToWeight =
    car.weight && car.hp
      ? `${Math.round((car.hp / car.weight) * 1000)} ${t(lang, "detail_hp").toLowerCase()}/t`
      : null;
  const pricePerPower =
    car.price && car.hp
      ? `${formatPrice(Math.round(car.price / car.hp), lang)} / ${t(
          lang,
          "card_hp"
        ).toLowerCase()}`
      : null;

  const heroStats = [
    { key: "detail_hp", value: car.hp ? `${formatStat(car.hp)}` : "N/A", suffix: "hp" },
    { key: "detail_torque", value: car.torque ? formatStat(car.torque) : "N/A", suffix: "Nm" },
    { key: "detail_zerohundred", value: car.zeroToHundred ? `${car.zeroToHundred}` : "N/A", suffix: "s" },
    { key: "detail_topspeed", value: car.topSpeed ? formatStat(car.topSpeed) : "N/A", suffix: "km/h" },
    { key: "detail_engine", value: car.engine, suffix: "" },
    { key: "detail_transmission", value: car.transmission, suffix: "" },
  ];

  // ---- ENGINE — real engine facts from the existing engine field ----
  const { displacement, cylinders, aspiration } = engineBreakdown(car.engine);
  const engineRows: { label: string; value: string }[] = [
    { label: t(lang, "detail_engine"), value: car.engine },
  ];
  if (displacement)
    engineRows.push({ label: t(lang, "spec_displacement"), value: displacement });
  if (cylinders) engineRows.push({ label: t(lang, "spec_cylinders"), value: cylinders });
  if (aspiration) engineRows.push({ label: t(lang, "spec_aspiration"), value: aspiration });
  if (car.hp > 0) engineRows.push({ label: t(lang, "detail_hp"), value: `${formatStat(car.hp)} hp` });
  if (car.torque) engineRows.push({ label: t(lang, "detail_torque"), value: `${formatStat(car.torque)} Nm` });

  // ---- PERFORMANCE — only fields that exist ----
  const performanceRows: { label: string; value: string }[] = [];
  if (car.zeroToHundred)
    performanceRows.push({ label: t(lang, "detail_zerohundred"), value: `${car.zeroToHundred} s` });
  if (car.topSpeed)
    performanceRows.push({
      label: t(lang, "detail_topspeed"),
      value: `${formatStat(car.topSpeed)} km/h`,
    });
  performanceRows.push({ label: t(lang, "detail_transmission"), value: car.transmission });
  if (car.drivetrain)
    performanceRows.push({ label: t(lang, "detail_drivetrain"), value: car.drivetrain });
  if (powerToWeight)
    performanceRows.push({ label: t(lang, "detail_power_weight"), value: powerToWeight });

  // ---- DIMENSIONS — only where real data exists ----
  const dimensionsRows: { label: string; value: string }[] = [];
  if (car.weight)
    dimensionsRows.push({ label: t(lang, "detail_weight"), value: `${formatStat(car.weight)} kg` });

  // ---- EFFICIENCY — fuel type; consumption/CO2 are not stored ----
  const efficiencyRows: { label: string; value: string }[] = [
    { label: t(lang, "detail_fuel"), value: car.fuel },
  ];

  // ---- PRICING — real starting price + real derived per-power cost ----
  const pricingRows: { label: string; value: string }[] = [
    { label: t(lang, "detail_price"), value: formatPrice(car.price, lang) },
  ];
  if (pricePerPower) pricingRows.push({ label: t(lang, "detail_price_power"), value: pricePerPower });

  // ---- Data-driven PROS & CONS (every claim backed by a real value) ----
  const pros: string[] = [];
  if (car.hp >= 500) pros.push(`${t(lang, "detail_high_power")}: ${formatStat(car.hp)} hp`);
  if (car.zeroToHundred && car.zeroToHundred <= 3.5)
    pros.push(`${t(lang, "detail_very_quick")}: 0–100 in ${car.zeroToHundred}s`);
  if (car.topSpeed && car.topSpeed >= 300)
    pros.push(`${t(lang, "detail_high_top")}: ${formatStat(car.topSpeed)} km/h`);
  if (car.weight && car.weight < 1400)
    pros.push(`${t(lang, "detail_featherweight")}: ${formatStat(car.weight)} kg`);
  if (car.fuel === "Electric" || car.fuel === "Hybrid") pros.push(t(lang, "detail_electric"));
  if (car.drivetrain === "AWD" || car.drivetrain === "4WD") pros.push(t(lang, "detail_awd"));
  if (car.categories.includes("daily")) pros.push(t(lang, "detail_daily_use"));
  if (car.categories.includes("luxury")) pros.push(t(lang, "detail_luxury_class"));
  if (car.categories.includes("offroad")) pros.push(t(lang, "detail_offroad_cap"));
  if (car.categories.includes("classic")) pros.push(t(lang, "detail_collector"));

  const cons: string[] = [];
  if (car.price >= 500000) cons.push(`${t(lang, "detail_ultra_price")}: ${formatPrice(car.price, lang)}`);
  else if (car.price >= 300000) cons.push(`${t(lang, "detail_premium_price")}: ${formatPrice(car.price, lang)}`);
  if (car.weight && car.weight >= 2200) cons.push(`${t(lang, "detail_heavy")}: ${formatStat(car.weight)} kg`);
  if (car.hp > 0 && car.hp < 200) cons.push(`${t(lang, "detail_modest_power")}: ${formatStat(car.hp)} hp`);
  if (car.zeroToHundred && car.zeroToHundred >= 8)
    cons.push(`${t(lang, "detail_slow_accel")}: 0–100 in ${car.zeroToHundred}s`);
  if (!car.torque) cons.push(t(lang, "detail_no_torque"));
  if (!car.topSpeed) cons.push(t(lang, "detail_no_topspeed"));

  // ---- CarVibes score from the existing deterministic scoring engine ----
  const score = battleScore(car);
  const SCORE_LABELS: Record<string, string> = {
    performance: "cp_performance",
    value: "cp_value",
    acceleration: "cp_accel",
    top_speed: "cp_top",
    reliability: "cp_reliability",
    comfort: "cp_comfort",
    technology: "cp_tech",
  };

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
                    {[String(car.year), car.body, car.generation].filter(Boolean).join(" · ")}
                  </p>
                  {/* Categories */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {car.categories.map((cat) => (
                      <span
                        key={cat}
                        className="border border-white/20 bg-ink/40 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-white backdrop-blur-sm"
                      >
                        {t(lang, categoryKey(cat))}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium tracking-[0.2em] text-fog">
                    {t(lang, "detail_price").toUpperCase()}
                  </p>
                  <span className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    {formatPrice(car.price, lang)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery thumbnails */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-2 border border-t-0 border-line bg-ink p-2 sm:grid-cols-6">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-[16/10] overflow-hidden border transition-colors duration-300 ${
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
          )}

          {/* Hero stats strip */}
          <div className="grid grid-cols-2 gap-px border border-t-0 border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {heroStats.map((s) => (
              <div key={s.key} className="bg-charcoal px-4 py-4">
                <p className="text-[9px] font-medium tracking-[0.18em] text-fog">
                  {t(lang, s.key)}
                </p>
                <p className="mt-1.5 truncate font-display text-base font-semibold text-white sm:text-lg" title={`${s.value} ${s.suffix}`.trim()}>
                  {s.value}
                  {s.suffix && (
                    <span className="ml-1 text-xs font-normal text-mist">{s.suffix}</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* OVERVIEW */}
          <section className="mt-8">
            <SectionTitle>{t(lang, "detail_overview").toUpperCase()}</SectionTitle>
            {car.tagline && (
              <p className="max-w-2xl text-lg font-light italic leading-relaxed text-white">
                “{car.tagline}”
              </p>
            )}
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-mist">
              {car.overview ||
                `The ${car.brand} ${car.model} (${car.year}) is a ${car.body.toLowerCase()} powered by a ${car.engine} producing ${car.hp} hp.`}
            </p>
          </section>

          {/* SPECIFICATIONS — grouped database-style layout */}
          <section className="mt-10">
            <SectionTitle>{t(lang, "detail_specs")}</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {engineRows.length > 0 && (
                <SpecGroup title={t(lang, "spec_engine")} rows={engineRows} />
              )}
              {performanceRows.length > 0 && (
                <SpecGroup title={t(lang, "spec_performance")} rows={performanceRows} />
              )}
              {dimensionsRows.length > 0 && (
                <SpecGroup title={t(lang, "spec_dimensions")} rows={dimensionsRows} />
              )}
              {efficiencyRows.length > 0 && (
                <SpecGroup title={t(lang, "spec_efficiency")} rows={efficiencyRows} />
              )}
              {pricingRows.length > 0 && (
                <SpecGroup title={t(lang, "spec_pricing")} rows={pricingRows} />
              )}
            </div>
          </section>

          {/* CATEGORIES — real category tags */}
          <section className="mt-8">
            <SectionTitle>{t(lang, "detail_categories")}</SectionTitle>
            <div className="flex flex-wrap gap-2 border-y border-line py-4">
              {car.categories.map((cat) => (
                <span
                  key={cat}
                  className="border border-line px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-mist"
                >
                  {t(lang, categoryKey(cat))}
                </span>
              ))}
            </div>
          </section>

          {/* PROS & CONS */}
          {(pros.length > 0 || cons.length > 0) && (
            <section className="mt-10 grid gap-8 sm:grid-cols-2">
              {pros.length > 0 && (
                <div>
                  <SectionTitle>{t(lang, "detail_pros")}</SectionTitle>
                  <ul className="divide-y divide-line border-y border-line">
                    {pros.map((p) => (
                      <li key={p} className="flex items-start gap-3 py-2.5 text-[13px] text-white">
                        <span className="mt-0.5 text-accent-soft" aria-hidden="true">+</span>
                        <span className="text-mist">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons.length > 0 && (
                <div>
                  <SectionTitle>{t(lang, "detail_cons")}</SectionTitle>
                  <ul className="divide-y divide-line border-y border-line">
                    {cons.map((c) => (
                      <li key={c} className="flex items-start gap-3 py-2.5 text-[13px] text-white">
                        <span className="mt-0.5 text-fog" aria-hidden="true">−</span>
                        <span className="text-mist">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* CARVIBES SCORE — existing deterministic scoring engine */}
          <section className="mt-10">
            <SectionTitle>{t(lang, "detail_score")}</SectionTitle>
            <div className="border border-line bg-charcoal p-5">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-medium tracking-[0.16em] text-fog">
                  {t(lang, "cp_overall")}
                </span>
                <span className="font-display text-2xl font-bold text-white">
                  {score.total}
                  <span className="text-sm font-normal text-fog">/100</span>
                </span>
              </div>
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {score.breakdown.map((b) => (
                  <div key={b.key}>
                    <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium tracking-[0.16em] text-fog">
                      <span>
                        {t(lang, SCORE_LABELS[b.key] ?? "cp_performance").toUpperCase()}
                      </span>
                      <span className="text-mist">
                        {b.value}/{b.max}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-line">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${Math.min(100, (b.value / b.max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <p className="mt-6 text-[11px] leading-relaxed text-fog">
            {t(lang, "detail_notice")}
          </p>

          {/* Similar cars */}
          {similar.length > 0 && (
            <section className="mt-14 border-t border-line pt-10">
              <SectionTitle>{t(lang, "detail_similar").toUpperCase()}</SectionTitle>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {similar.map((c, i) => (
                  <CarCard key={c.id} car={c} lang={lang} onOpen={onOpen} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Related vehicles — same brand, real data */}
          {sameBrand.length > 0 && (
            <section className="mt-12 border-t border-line pt-10">
              <SectionTitle>{t(lang, "detail_related")}</SectionTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {sameBrand.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onOpen(c)}
                    className="group flex items-center justify-between gap-3 border border-line bg-charcoal px-4 py-4 text-left transition-colors hover:border-white/25 hover:bg-graphite"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-semibold text-white">
                        {c.brand} <span className="font-normal text-mist">{c.model}</span>
                      </p>
                      <p className="mt-1 text-xs text-fog">
                        {c.year} · {c.hp} {t(lang, "card_hp")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-white">
                        {formatPrice(c.price, lang)}
                      </p>
                      <ArrowRight className="ml-auto mt-1 h-4 w-4 text-fog transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
