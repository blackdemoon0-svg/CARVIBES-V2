import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { t, type Lang } from "../../lib/i18n";
import { formatPrice } from "../../lib/marketplace/format";
import {
  ADVISOR_CATALOG_CURRENCY,
  ADVISOR_PRIORITIES,
  BUDGET_BANDS,
  type AdvisorBodyChoice,
  type AdvisorProfile,
  type AdvisorPriority,
  type AdvisorUse,
  type AnnualMileage,
  type FuelCostImportance,
  type FuelPreference,
  type PassengerCount,
  type PerformanceInterest,
  type PurchaseType,
  type TransmissionPreference,
} from "./advisorModel";
import { getAvailableAdvisorBodyChoices } from "./advisorEngine";
import { cars } from "../../lib/db";

const USES: AdvisorUse[] = ["city", "highway", "mixed", "longDistance", "family", "work", "weekend"];
const MILEAGE: AnnualMileage[] = ["under5000", "5000to10000", "10000to20000", "20000to30000", "30000plus"];
const FUELS: FuelPreference[] = ["petrol", "diesel", "hybrid", "plugInHybrid", "electric", "any"];
const TRANSMISSIONS: TransmissionPreference[] = ["automatic", "manual", "any"];
const PURCHASE_TYPES: PurchaseType[] = ["new", "used", "either"];
const PASSENGERS: PassengerCount[] = ["one", "two", "threeToFour", "fivePlus"];
const FUEL_COST_LEVELS: FuelCostImportance[] = ["notImportant", "low", "medium", "high", "critical"];
const PERFORMANCE_LEVELS: PerformanceInterest[] = ["notReally", "aLittle", "quiteALot", "aLot"];

const USE_LABELS: Record<AdvisorUse, string> = {
  city: "advisor_use_city",
  highway: "advisor_use_highway",
  mixed: "advisor_use_mixed",
  longDistance: "advisor_use_long_distance",
  family: "advisor_use_family",
  work: "advisor_use_work",
  weekend: "advisor_use_weekend",
};
const PURCHASE_LABELS: Record<PurchaseType, string> = {
  new: "advisor_purchase_new",
  used: "advisor_purchase_used",
  either: "advisor_purchase_either",
};
const MILEAGE_LABELS: Record<AnnualMileage, string> = {
  under5000: "advisor_mileage_under_5000",
  "5000to10000": "advisor_mileage_5000_10000",
  "10000to20000": "advisor_mileage_10000_20000",
  "20000to30000": "advisor_mileage_20000_30000",
  "30000plus": "advisor_mileage_30000_plus",
};
const FUEL_LABELS: Record<FuelPreference, string> = {
  petrol: "fmc_fuel_petrol",
  diesel: "fmc_fuel_diesel",
  hybrid: "fmc_fuel_hybrid",
  plugInHybrid: "fmc_fuel_phev",
  electric: "fmc_fuel_electric",
  any: "fmc_any",
};
const TRANSMISSION_LABELS: Record<TransmissionPreference, string> = {
  automatic: "fmc_trans_auto",
  manual: "fmc_trans_manual",
  any: "fmc_any",
};
const BODY_LABELS: Record<AdvisorBodyChoice, string> = {
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
const PRIORITY_LABELS: Record<AdvisorPriority, string> = {
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
const PASSENGER_LABELS: Record<PassengerCount, string> = {
  one: "advisor_passengers_one",
  two: "advisor_passengers_two",
  threeToFour: "advisor_passengers_three_to_four",
  fivePlus: "advisor_passengers_five_plus",
};
const FUEL_COST_LABELS: Record<FuelCostImportance, string> = {
  notImportant: "advisor_fuel_cost_not_important",
  low: "advisor_fuel_cost_low",
  medium: "advisor_fuel_cost_medium",
  high: "advisor_fuel_cost_high",
  critical: "advisor_fuel_cost_critical",
};
const PERFORMANCE_LABELS: Record<PerformanceInterest, string> = {
  notReally: "advisor_performance_not_really",
  aLittle: "advisor_performance_a_little",
  quiteALot: "advisor_performance_quite_a_lot",
  aLot: "advisor_performance_a_lot",
};

interface AdvisorQuestionsProps {
  lang: Lang;
  step: number;
  profile: AdvisorProfile;
  canContinue: boolean;
  onUpdate: (update: Partial<AdvisorProfile>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function AdvisorQuestions({
  lang,
  step,
  profile,
  canContinue,
  onUpdate,
  onBack,
  onNext,
}: AdvisorQuestionsProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const totalSteps = 11;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  const question = questionForStep(step, lang);
  const availableBodies = useMemo(() => getAvailableAdvisorBodyChoices(cars), []);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-14 pt-28 sm:px-8 sm:pt-32">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-mist transition-colors hover:text-white"
        >
          <span aria-hidden="true" className="text-lg transition-transform group-hover:-translate-x-1">←</span>
          {t(lang, "advisor_back")}
        </button>
        <span className="shrink-0 text-xs font-semibold tracking-[0.12em] text-mist sm:text-sm">
          {t(lang, "advisor_step", { current: step + 1, total: totalSteps })}
        </span>
      </div>

      <div className="mt-5" role="progressbar" aria-label={t(lang, "advisor_progress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="advisor-progress-fill h-full rounded-full bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-fog">
          <span>{t(lang, "advisor_brand")}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <section className="advisor-step-in mt-9" key={step} aria-labelledby="advisor-question-title">
        <div className="mb-8">
          {question.optional && (
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-soft">
              {t(lang, "advisor_optional")}
            </p>
          )}
          <h1
            ref={heading}
            id="advisor-question-title"
            tabIndex={-1}
            className="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-white outline-none sm:text-5xl"
          >
            {question.title}
          </h1>
          {question.hint && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mist sm:text-base">{question.hint}</p>}
        </div>

        {step === 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.17em] text-mist">{t(lang, "advisor_total_budget")}</h2>
            <div role="group" aria-label={question.title} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BUDGET_BANDS.map((band) => {
                const selected = profile.budgetBand === band.id;
                return (
                  <OptionButton key={band.id} selected={selected} onClick={() => onUpdate({ budgetBand: band.id })}>
                    {budgetBandLabel(band, lang)}
                  </OptionButton>
                );
              })}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-fog">{t(lang, "advisor_usd_note")}</p>
          </div>
        )}

        {step === 1 && (
          <div role="group" aria-label={question.title} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PURCHASE_TYPES.map((value) => (
              <OptionButton key={value} selected={profile.purchaseType === value} onClick={() => onUpdate({ purchaseType: value })}>
                {t(lang, PURCHASE_LABELS[value])}
              </OptionButton>
            ))}
            <p className="mt-2 text-xs leading-relaxed text-fog sm:col-span-3">{t(lang, "advisor_purchase_note")}</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <OptionGrid label={question.title}>
              {USES.map((value) => (
                <OptionButton
                  key={value}
                  selected={profile.uses.includes(value)}
                  onClick={() => onUpdate({ uses: toggleValue(profile.uses, value) })}
                >
                  {t(lang, USE_LABELS[value])}
                </OptionButton>
              ))}
            </OptionGrid>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-fog">{t(lang, "advisor_usage_data_note")}</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <OptionGrid label={question.title}>
              {MILEAGE.map((value) => (
                <OptionButton key={value} selected={profile.annualMileage === value} onClick={() => onUpdate({ annualMileage: value })}>
                  {t(lang, MILEAGE_LABELS[value])}
                </OptionButton>
              ))}
            </OptionGrid>
            <SkipButton lang={lang} onClick={() => onUpdate({ annualMileage: null })} selected={profile.annualMileage === null} />
          </div>
        )}

        {step === 4 && (
          <OptionGrid label={question.title}>
            {FUELS.map((value) => (
              <OptionButton key={value} selected={profile.fuel === value} onClick={() => onUpdate({ fuel: value })}>
                {t(lang, FUEL_LABELS[value])}
              </OptionButton>
            ))}
          </OptionGrid>
        )}

        {step === 5 && (
          <OptionGrid label={question.title}>
            {TRANSMISSIONS.map((value) => (
              <OptionButton key={value} selected={profile.transmission === value} onClick={() => onUpdate({ transmission: value })}>
                {t(lang, TRANSMISSION_LABELS[value])}
              </OptionButton>
            ))}
          </OptionGrid>
        )}

        {step === 6 && (
          <OptionGrid label={question.title}>
            {availableBodies.map((value) => (
              <OptionButton key={value} selected={profile.bodyType === value} onClick={() => onUpdate({ bodyType: value })}>
                {t(lang, BODY_LABELS[value])}
              </OptionButton>
            ))}
            <OptionButton selected={profile.bodyType === "any"} onClick={() => onUpdate({ bodyType: "any" })}>
              {t(lang, "advisor_no_preference")}
            </OptionButton>
          </OptionGrid>
        )}

        {step === 7 && (
          <div>
            <div className="space-y-2">
              {ADVISOR_PRIORITIES.map((priority) => (
                <PrioritySlider
                  key={priority}
                  lang={lang}
                  priority={priority}
                  value={profile.priorities[priority]}
                  onChange={(value) => onUpdate({ priorities: { ...profile.priorities, [priority]: value } })}
                />
              ))}
            </div>
            <p className="mt-5 border-l-2 border-accent/70 pl-3 text-xs leading-relaxed text-fog">{t(lang, "advisor_priority_data_note")}</p>
          </div>
        )}

        {step === 8 && (
          <div>
            <OptionGrid label={question.title} columns="four">
              {PASSENGERS.map((value) => (
                <OptionButton key={value} selected={profile.passengers === value} onClick={() => onUpdate({ passengers: value })}>
                  {t(lang, PASSENGER_LABELS[value])}
                </OptionButton>
              ))}
            </OptionGrid>
            <SkipButton lang={lang} onClick={() => onUpdate({ passengers: null })} selected={profile.passengers === null} />
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-fog">{t(lang, "advisor_passenger_data_note")}</p>
          </div>
        )}

        {step === 9 && (
          <div>
            <OptionGrid label={question.title} columns="five">
              {FUEL_COST_LEVELS.map((value) => (
                <OptionButton key={value} selected={profile.fuelCostImportance === value} onClick={() => onUpdate({ fuelCostImportance: value })}>
                  {t(lang, FUEL_COST_LABELS[value])}
                </OptionButton>
              ))}
            </OptionGrid>
            <SkipButton lang={lang} onClick={() => onUpdate({ fuelCostImportance: null })} selected={profile.fuelCostImportance === null} />
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-fog">{t(lang, "advisor_economy_data_note")}</p>
          </div>
        )}

        {step === 10 && (
          <div>
            <OptionGrid label={question.title} columns="four">
              {PERFORMANCE_LEVELS.map((value) => (
                <OptionButton key={value} selected={profile.performanceInterest === value} onClick={() => onUpdate({ performanceInterest: value })}>
                  {t(lang, PERFORMANCE_LABELS[value])}
                </OptionButton>
              ))}
            </OptionGrid>
            <SkipButton lang={lang} onClick={() => onUpdate({ performanceInterest: null })} selected={profile.performanceInterest === null} />
          </div>
        )}

        {!canContinue && (
          <p id="advisor-required-message" role="status" className="mt-8 text-end text-xs leading-relaxed text-fog">
            {t(lang, "advisor_required")}
          </p>
        )}
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onBack} className="min-h-12 px-4 text-sm font-medium text-mist transition-colors hover:text-white">
            {t(lang, "advisor_back")}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            aria-describedby={!canContinue ? "advisor-required-message" : undefined}
            className="cv-btn cv-btn-primary inline-flex min-h-14 w-full items-center justify-center gap-3 px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-56"
          >
            {step === totalSteps - 1 ? t(lang, "advisor_show_matches") : t(lang, "advisor_continue")}
            <span aria-hidden="true" className="text-lg">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function budgetBandLabel(band: (typeof BUDGET_BANDS)[number], lang: Lang): string {
  if (band.max === null) {
    return t(lang, "advisor_budget_from", { amount: formatPrice(band.min, ADVISOR_CATALOG_CURRENCY, lang) });
  }
  if (band.min === 0) {
    return t(lang, "advisor_budget_under", { amount: formatPrice(band.max, ADVISOR_CATALOG_CURRENCY, lang) });
  }
  return t(lang, "advisor_budget_between", {
    min: formatPrice(band.min, ADVISOR_CATALOG_CURRENCY, lang),
    max: formatPrice(band.max, ADVISOR_CATALOG_CURRENCY, lang),
  });
}

function questionForStep(step: number, lang: Lang): { title: string; hint?: string; optional?: boolean } {
  const entries = [
    { title: t(lang, "advisor_q_budget") },
    { title: t(lang, "advisor_q_purchase") },
    { title: t(lang, "advisor_q_usage"), hint: t(lang, "advisor_select_all") },
    { title: t(lang, "advisor_q_mileage"), optional: true },
    { title: t(lang, "advisor_q_fuel") },
    { title: t(lang, "advisor_q_transmission") },
    { title: t(lang, "advisor_q_body") },
    { title: t(lang, "advisor_q_priorities"), hint: t(lang, "advisor_priority_hint") },
    { title: t(lang, "advisor_q_passengers"), optional: true },
    { title: t(lang, "advisor_q_fuel_cost"), optional: true },
    { title: t(lang, "advisor_q_performance"), optional: true },
  ];
  return entries[step] ?? entries[0];
}

function OptionGrid({
  children,
  label,
  columns = "two",
}: {
  children: ReactNode;
  label: string;
  columns?: "two" | "four" | "five";
}) {
  const grid = columns === "five" ? "sm:grid-cols-3 lg:grid-cols-5" : columns === "four" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2";
  return <div role="group" aria-label={label} className={`grid grid-cols-1 gap-3 ${grid}`}>{children}</div>;
}

function OptionButton({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`advisor-option group flex min-h-14 items-center justify-between gap-3 border px-4 py-3 text-start text-sm font-medium transition-colors sm:min-h-16 sm:px-5 ${
        selected
          ? "border-accent bg-accent/[0.09] text-white"
          : "border-line bg-charcoal/60 text-mist hover:border-white/30 hover:bg-graphite hover:text-white"
      }`}
    >
      <span>{children}</span>
      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${selected ? "border-accent bg-accent text-white" : "border-white/20 text-transparent"}`}>
        ✓
      </span>
    </button>
  );
}

function PrioritySlider({
  lang,
  priority,
  value,
  onChange,
}: {
  lang: Lang;
  priority: AdvisorPriority;
  value: number;
  onChange: (value: number) => void;
}) {
  const label = t(lang, PRIORITY_LABELS[priority]);
  return (
    <div className="grid gap-3 border border-line bg-charcoal/55 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(200px,1fr)_2.25rem] sm:items-center sm:gap-6 sm:px-5">
      <label htmlFor={`advisor-priority-${priority}`} className="text-sm font-medium text-white">{label}</label>
      <div className="flex items-center gap-3">
        <span className="hidden text-[10px] text-fog sm:inline">{t(lang, "advisor_not_important")}</span>
        <input
          id={`advisor-priority-${priority}`}
          className="advisor-range w-full"
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          aria-label={t(lang, "advisor_priority_value", { priority: label, value, max: 5 })}
          aria-valuetext={t(lang, "advisor_priority_value", { priority: label, value, max: 5 })}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
        <span className="hidden text-[10px] text-fog sm:inline">{t(lang, "advisor_very_important")}</span>
      </div>
      <output htmlFor={`advisor-priority-${priority}`} className="font-display text-sm font-semibold tabular-nums text-accent-soft sm:text-center">{value}/5</output>
    </div>
  );
}

function SkipButton({ lang, onClick, selected }: { lang: Lang; onClick: () => void; selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`mt-4 min-h-10 text-xs underline decoration-white/25 underline-offset-4 transition-colors ${selected ? "text-white" : "text-mist hover:text-white"}`}
    >
      {t(lang, "advisor_skip")}
    </button>
  );
}

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}
