import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { formatNumber, formatPrice } from "../../lib/marketplace/format";
import { pexelsResize } from "../../lib/images";
import { CompareButton } from "../../components/compare/ActionButtons";
import { ArrowRight } from "../../components/icons";
import {
  mismatchFactors,
  positiveFactors,
  type AdvisorFactor,
  type AdvisorMatch,
} from "./advisorEngine";
import type {
  AdvisorBodyChoice,
  AdvisorPriority,
  AdvisorProfile,
  AdvisorUse,
  FuelPreference,
  TransmissionPreference,
} from "./advisorModel";

const PRIORITY_LABEL_KEYS: Record<AdvisorPriority, string> = {
  performance: "advisor_priority_performance",
  comfort: "advisor_priority_comfort",
  fuelEconomy: "advisor_priority_fuel_economy",
  reliability: "advisor_priority_reliability",
  luxury: "advisor_priority_luxury",
  technology: "advisor_priority_technology",
  practicality: "advisor_priority_practicality",
  design: "advisor_priority_design",
  space: "advisor_priority_space",
  drivingExperience: "advisor_priority_driving_experience",
};
const BODY_LABEL_KEYS: Record<AdvisorBodyChoice, string> = {
  city: "advisor_body_city",
  hatchback: "advisor_body_hatchback",
  sedan: "advisor_body_sedan",
  suv: "advisor_body_suv",
  coupe: "advisor_body_coupe",
  convertible: "advisor_body_convertible",
  wagon: "advisor_body_wagon",
  sports: "advisor_body_sports",
  luxury: "advisor_body_luxury",
  pickup: "advisor_body_pickup",
};
const FUEL_LABEL_KEYS: Record<FuelPreference, string> = {
  petrol: "fmc_fuel_petrol",
  diesel: "fmc_fuel_diesel",
  hybrid: "fmc_fuel_hybrid",
  plugInHybrid: "fmc_fuel_phev",
  electric: "fmc_fuel_electric",
  any: "fmc_any",
};
const TRANSMISSION_LABEL_KEYS: Record<TransmissionPreference, string> = {
  automatic: "fmc_trans_auto",
  manual: "fmc_trans_manual",
  any: "fmc_any",
};
const USAGE_LABEL_KEYS: Record<AdvisorUse, string> = {
  city: "advisor_use_city",
  highway: "advisor_use_highway",
  mixed: "advisor_use_mixed",
  longDistance: "advisor_use_long_distance",
  family: "advisor_use_family",
  work: "advisor_use_work",
  weekend: "advisor_use_weekend",
};
const FUEL_SPEC_KEYS: Record<string, string> = {
  Petrol: "fmc_fuel_petrol",
  Diesel: "fmc_fuel_diesel",
  Hybrid: "fmc_fuel_hybrid",
  Electric: "fmc_fuel_electric",
};
const BODY_SPEC_KEYS: Record<string, string> = {
  "City car": "advisor_body_city",
  Hatchback: "advisor_body_hatchback",
  Sedan: "advisor_body_sedan",
  SUV: "advisor_body_suv",
  Coupé: "advisor_body_coupe",
  Coupe: "advisor_body_coupe",
  Convertible: "advisor_body_convertible",
  Wagon: "advisor_body_wagon",
  Pickup: "advisor_body_pickup",
  Roadster: "advisor_spec_roadster",
  Crossover: "advisor_spec_crossover",
  Minivan: "advisor_spec_minivan",
  Van: "advisor_spec_van",
};

interface AdvisorResultsProps {
  lang: Lang;
  profile: AdvisorProfile;
  results: AdvisorMatch[];
  onEdit: () => void;
  onRestart: () => void;
  onCarClick: (carId: string, position: number) => void;
  onCompareMax: () => void;
}

export default function AdvisorResults({
  lang,
  profile,
  results,
  onEdit,
  onRestart,
  onCarClick,
  onCompareMax,
}: AdvisorResultsProps) {
  const top = results[0];
  const alternatives = results.slice(1, 5);
  const visibleMatchIds = new Set(results.slice(0, 5).map((match) => match.car.id));
  const whyNot = results
    .filter((match) => !visibleMatchIds.has(match.car.id) && match.score < 70 && mismatchFactors(match).length > 0)
    .sort((a, b) => a.score - b.score || b.dataCoverage - a.dataCoverage)
    .slice(0, 3);

  if (!top) {
    return (
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-soft">{t(lang, "advisor_brand")}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-white">{t(lang, "advisor_results_title")}</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist">{t(lang, "advisor_no_results")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={onEdit} className="cv-btn cv-btn-primary min-h-12 px-6 text-sm font-semibold">{t(lang, "advisor_edit_answers")}</button>
          <button onClick={onRestart} className="cv-btn cv-btn-ghost min-h-12 px-6 text-sm font-semibold">{t(lang, "advisor_restart")}</button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-12">
      <div className="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
            <span className="h-px w-7 bg-accent" />{t(lang, "advisor_brand")}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">{t(lang, "advisor_results_title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">{t(lang, "advisor_results_intro")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={onEdit} className="cv-btn cv-btn-ghost min-h-11 px-4 text-xs font-semibold">{t(lang, "advisor_edit_answers")}</button>
          <button type="button" onClick={onRestart} className="cv-btn cv-btn-subtle min-h-11 px-4 text-xs font-semibold">{t(lang, "advisor_restart")}</button>
        </div>
      </div>

      <section className="mt-9" aria-labelledby="advisor-top-match-title">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/50 bg-accent/10 font-display text-sm font-bold text-accent-soft">1</span>
          <h2 id="advisor-top-match-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-mist">{t(lang, "advisor_top_match")}</h2>
        </div>
        <TopMatchCard
          match={top}
          lang={lang}
          profile={profile}
          onCarClick={() => onCarClick(top.car.id, 1)}
          onCompareMax={onCompareMax}
        />
      </section>

      {alternatives.length > 0 && (
        <section className="mt-16" aria-labelledby="advisor-alternatives-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fog">{t(lang, "advisor_other_options")}</p>
              <h2 id="advisor-alternatives-title" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{t(lang, "advisor_alternatives")}</h2>
            </div>
            <span className="text-xs text-fog">{t(lang, "advisor_ranked_by_profile")}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {alternatives.map((match, index) => (
              <AlternativeCard
                key={match.car.id}
                match={match}
                lang={lang}
                profile={profile}
                position={index + 2}
                onCarClick={() => onCarClick(match.car.id, index + 2)}
                onCompareMax={onCompareMax}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 border-t border-line pt-9" aria-labelledby="advisor-why-not-title">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fog">{t(lang, "advisor_profile_check")}</p>
        <h2 id="advisor-why-not-title" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{t(lang, "advisor_why_not")}</h2>
        {whyNot.length ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {whyNot.map((match) => (
              <WhyNotCard key={match.car.id} match={match} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist">{t(lang, "advisor_no_strong_mismatches")}</p>
        )}
      </section>

      <div className="mt-14 grid gap-3 border border-line bg-charcoal/50 p-5 sm:grid-cols-2 sm:p-6">
        {profile.purchaseType === "new" && (
          <p className="text-xs leading-relaxed text-mist sm:col-span-2">{t(lang, "advisor_new_data_note")}</p>
        )}
        {profile.purchaseType === "used" && (
          <p className="text-xs leading-relaxed text-mist sm:col-span-2">{t(lang, "advisor_used_data_note")}</p>
        )}
        <p className="text-xs leading-relaxed text-mist">{t(lang, "advisor_price_data_note")}</p>
        <p className="text-xs leading-relaxed text-mist">{t(lang, "advisor_score_data_note")}</p>
      </div>
    </div>
  );
}

function TopMatchCard({
  match,
  lang,
  profile,
  onCarClick,
  onCompareMax,
}: {
  match: AdvisorMatch;
  lang: Lang;
  profile: AdvisorProfile;
  onCarClick: () => void;
  onCompareMax: () => void;
}) {
  const { car } = match;
  const reasons = positiveFactors(match).slice(0, 4);
  return (
    <article className="advisor-result-card overflow-hidden border border-white/[0.12] bg-charcoal shadow-[0_22px_70px_-42px_rgba(0,0,0,0.95)]">
      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative aspect-[16/10] min-h-56 overflow-hidden bg-graphite lg:aspect-auto lg:min-h-[440px]">
          <img
            src={pexelsResize(car.image, 1000, 680)}
            alt={`${car.brand} ${car.model} ${car.year}`}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
          <span className="absolute start-4 top-4 border border-white/20 bg-ink/75 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:start-6 sm:top-6">
            {t(lang, "advisor_top_match")}
          </span>
          <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between gap-4 sm:bottom-6 sm:start-6 sm:end-6">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">{car.brand}</p>
              <p className="mt-1 break-words font-display text-2xl font-bold text-white sm:text-4xl">{car.model}</p>
            </div>
            <div className="shrink-0 border border-white/25 bg-ink/75 px-3 py-2 text-center backdrop-blur-sm sm:px-4 sm:py-3">
              <p className="font-display text-2xl font-bold leading-none text-white sm:text-3xl">{match.score}%</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-mist">{t(lang, "advisor_match")}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-7 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fog">{t(lang, "advisor_estimated_price")}</p>
              <PriceLabel match={match} lang={lang} profile={profile} prominent />
            </div>
            <div className="max-w-28 text-end">
              <p className="font-display text-lg font-semibold tabular-nums text-white">{match.dataCoverage}%</p>
              <p className="text-[9px] leading-tight text-fog">{t(lang, "advisor_data_coverage")}</p>
            </div>
          </div>

          <CarSpecs match={match} lang={lang} />

          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">{t(lang, "advisor_why_matches")}</h3>
            {reasons.length ? (
              <ul className="mt-3 space-y-2">
                {reasons.map((factor, index) => (
                  <li key={`${factor.id}-${index}`} className="flex items-start gap-2.5 text-xs leading-relaxed text-mist">
                    <span aria-hidden="true" className="mt-0.5 text-accent-soft">✓</span>
                    {factorDescription(factor, lang, true)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-mist">{t(lang, "advisor_match_reason_fallback")}</p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-7 sm:flex-row">
            <Link
              to={`/car/${car.id}`}
              onClick={onCarClick}
              className="cv-btn cv-btn-primary inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-5 text-xs font-semibold"
            >
              {t(lang, "advisor_view_car")}<ArrowRight className="h-4 w-4" />
            </Link>
            <CompareButton carId={car.id} lang={lang} onMax={onCompareMax} className="min-h-12 justify-center px-4" />
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-3 sm:px-7">
        <p className="text-[10px] leading-relaxed text-fog">{t(lang, "advisor_result_price_note")}</p>
      </div>
    </article>
  );
}

function AlternativeCard({
  match,
  lang,
  profile,
  position,
  onCarClick,
  onCompareMax,
}: {
  match: AdvisorMatch;
  lang: Lang;
  profile: AdvisorProfile;
  position: number;
  onCarClick: () => void;
  onCompareMax: () => void;
}) {
  const { car } = match;
  return (
    <article className="advisor-result-card flex min-w-0 flex-col overflow-hidden border border-line bg-charcoal/75 transition-colors hover:border-white/25">
      <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
        <img
          src={pexelsResize(car.image, 640, 410)}
          alt={`${car.brand} ${car.model} ${car.year}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]"
        />
        <span className="absolute start-3 top-3 border border-white/15 bg-ink/75 px-2.5 py-1.5 font-display text-xs font-bold text-white backdrop-blur-sm">#{position}</span>
        <span className="absolute end-3 top-3 border border-white/15 bg-ink/75 px-2.5 py-1.5 font-display text-sm font-bold text-white backdrop-blur-sm">{match.score}%</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fog">{car.brand} · {car.year}</p>
        <h3 className="mt-1 line-clamp-2 min-h-12 font-display text-lg font-semibold leading-snug text-white">{car.model}</h3>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-fog">{t(lang, "advisor_estimated_price")}</p>
        <PriceLabel match={match} lang={lang} profile={profile} />
        <CarSpecs match={match} lang={lang} compact />
        <div className="mt-auto flex flex-col gap-2 pt-5">
          <Link
            to={`/car/${car.id}`}
            onClick={onCarClick}
            className="cv-btn cv-btn-outline inline-flex min-h-11 items-center justify-center gap-2 px-4 text-xs font-semibold"
          >
            {t(lang, "advisor_view_car")}<ArrowRight className="h-4 w-4" />
          </Link>
          <CompareButton carId={car.id} lang={lang} onMax={onCompareMax} className="min-h-10 w-full justify-center px-3" />
        </div>
      </div>
    </article>
  );
}

function WhyNotCard({ match, lang }: { match: AdvisorMatch; lang: Lang }) {
  const concerns = mismatchFactors(match);
  return (
    <article className="border border-line bg-charcoal/45 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-fog">{match.car.brand}</p>
          <h3 className="mt-1 break-words font-display text-base font-semibold text-white">{match.car.model}</h3>
        </div>
        <span className="shrink-0 font-display text-lg font-bold text-mist">{match.score}%</span>
      </div>
      <ul className="mt-4 space-y-2">
        {concerns.map((factor, index) => (
          <li key={`${factor.id}-${index}`} className="flex items-start gap-2 text-xs leading-relaxed text-mist">
            <span aria-hidden="true" className="mt-0.5 text-accent-soft">–</span>
            {factorDescription(factor, lang, false)}
          </li>
        ))}
      </ul>
      <Link to={`/car/${match.car.id}`} className="mt-4 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-white underline decoration-white/25 underline-offset-4 transition-colors hover:text-accent-soft">
        {t(lang, "advisor_view_car")}<ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

function PriceLabel({
  match,
  lang,
  profile,
  prominent = false,
}: {
  match: AdvisorMatch;
  lang: Lang;
  profile: AdvisorProfile;
  prominent?: boolean;
}) {
  const price = match.price;
  if (!price) return <p className={prominent ? "mt-1 text-lg font-semibold text-white" : "mt-1 text-sm font-semibold text-white"}>{t(lang, "advisor_price_unavailable")}</p>;
  const minimum = formatPrice(price.minimum, price.currency, lang);
  const maximum = formatPrice(price.maximum, price.currency, lang);
  const text = price.minimum === price.maximum ? minimum : `${minimum}–${maximum}`;
  return (
    <div>
      <p className={prominent ? "mt-1 break-words font-display text-xl font-bold text-white sm:text-2xl" : "mt-1 break-words font-display text-base font-semibold text-white"}>{text}</p>
      <span className="sr-only">{price.source === "used-guide" ? t(lang, "advisor_used_price") : t(lang, "advisor_catalogue_msrp")}</span>
      {profile.purchaseType === "used" && price.source === "used-guide" && (
        <span className="mt-1 block text-[10px] text-fog">{t(lang, "advisor_used_price")}</span>
      )}
    </div>
  );
}

function CarSpecs({
  match,
  lang,
  compact = false,
}: {
  match: AdvisorMatch;
  lang: Lang;
  compact?: boolean;
}) {
  const { car } = match;
  const specs: Array<{ label: string; value: string }> = [];
  if (car.year > 0) specs.push({ label: t(lang, "detail_year"), value: String(car.year) });
  if (car.fuel) specs.push({ label: t(lang, "filter_fuel"), value: FUEL_SPEC_KEYS[car.fuel] ? t(lang, FUEL_SPEC_KEYS[car.fuel]) : car.fuel });
  if (car.hp > 0) specs.push({ label: t(lang, "detail_hp"), value: `${formatNumber(car.hp, lang)} hp` });
  if (car.transmission) specs.push({ label: t(lang, "detail_transmission"), value: transmissionLabel(car.transmission, lang) });
  if (car.body) specs.push({ label: t(lang, "filter_body"), value: BODY_SPEC_KEYS[car.body] ? t(lang, BODY_SPEC_KEYS[car.body]) : car.body });
  return (
    <dl className={`grid grid-cols-2 gap-x-3 gap-y-3 border-y border-line ${compact ? "mt-4 py-3" : "mt-5 py-4 sm:grid-cols-2"}`}>
      {specs.map((spec) => (
        <div key={spec.label} className="min-w-0">
          <dt className="truncate text-[9px] font-semibold uppercase tracking-[0.13em] text-fog">{spec.label}</dt>
          <dd className="mt-1 truncate text-xs font-medium text-mist">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function transmissionLabel(value: string, lang: Lang): string {
  if (value === "Automatic") return t(lang, "fmc_trans_auto");
  if (value === "Manual") return t(lang, "fmc_trans_manual");
  if (value === "Dual-clutch") return t(lang, "advisor_spec_dual_clutch");
  if (value === "CVT") return t(lang, "advisor_spec_cvt");
  return value;
}

function factorDescription(factor: AdvisorFactor, lang: Lang, positive: boolean) {
  const rawFactor = factor.id.split(":")[0];
  const factorKey = rawFactor === "fuelEconomy" ? "fuel_economy" : rawFactor;
  const key = `${positive ? "advisor_reason_fit_" : "advisor_reason_gap_"}${factorKey}`;
  if (factor.id === "usage" && factor.preference === "multiple") {
    return t(lang, `${key}_multiple`);
  }
  let preference = factor.preference ?? "";
  if (factor.id === "body" && preference in BODY_LABEL_KEYS) {
    preference = t(lang, BODY_LABEL_KEYS[preference as AdvisorBodyChoice]);
  } else if (factor.id === "fuel" && preference in FUEL_LABEL_KEYS) {
    preference = t(lang, FUEL_LABEL_KEYS[preference as FuelPreference]);
  } else if (factor.id === "transmission" && preference in TRANSMISSION_LABEL_KEYS) {
    preference = t(lang, TRANSMISSION_LABEL_KEYS[preference as TransmissionPreference]);
  } else if (factor.id === "usage" && profileUse(preference)) {
    preference = t(lang, USAGE_LABEL_KEYS[preference]);
  } else if (factor.id.startsWith("priority:") && preference in PRIORITY_LABEL_KEYS) {
    preference = t(lang, PRIORITY_LABEL_KEYS[preference as AdvisorPriority]);
  }
  return t(lang, key, preference ? { preference } : undefined);
}

function profileUse(value: string): value is AdvisorUse {
  return value in USAGE_LABEL_KEYS;
}
