import { useCallback, useEffect, useMemo, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { cars } from "../../lib/db";
import {
  rankCars,
  formatEuro,
  PERFECT_THRESHOLD,
  defaultAnswers,
  type FinderAnswers,
  type BodyChoice,
  type Priority,
  type PerformanceLevel,
  type FuelChoice,
  type TransmissionChoice,
  type Usage,
  type PowerChoice,
  type MatchResult,
} from "../../lib/matcher";
import {
  toggleFavorite,
  addToCompare,
  isFavorite,
  isCompared,
  subscribePrefs,
} from "../../lib/prefs";
import { formatPrice, formatStat } from "../../lib/carUtils";
import CarDetail from "../universe/CarDetail";
import { ArrowRight, ArrowUpRight } from "../icons";

const BUDGET_OPTIONS = [1000, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 150000, 250000, 500000];

const BODY_OPTIONS: BodyChoice[] = [
  "sports", "supercar", "suv", "sedan", "coupe", "convertible",
  "hatchback", "wagon", "offroad", "electric", "luxury",
];

const PRIORITY_OPTIONS: Priority[] = [
  "performance", "comfort", "luxury", "reliability", "economy",
  "tech", "practicality", "offroad", "style",
];

const PERF_OPTIONS: PerformanceLevel[] = ["daily", "balanced", "sporty", "extreme"];

const FUEL_OPTIONS: FuelChoice[] = ["petrol", "diesel", "hybrid", "phev", "electric", "any"];

const TRANS_OPTIONS: TransmissionChoice[] = ["automatic", "manual", "any"];

const USE_OPTIONS: Usage[] = ["commute", "family", "trips", "weekend", "track", "offroad", "mixed"];

const POWER_OPTIONS: PowerChoice[] = ["under150", "150-250", "250-400", "400-600", "600-800", "800plus", "any"];

const TOTAL_QUESTIONS = 8;

type Stage = "intro" | "questions" | "calculating" | "results";

export default function FindMyCar({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FinderAnswers>(defaultAnswers);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<import("../../lib/cars").Car | null>(null);
  const [sortK, setSortK] = useState<"best" | "price" | "performance" | "reliability">("best");
  const [, force] = useState(0); // refresh favorite/compare toggles

  // Custom budget input state
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Refresh toggles on prefs change
  useEffect(() => subscribePrefs(() => force((x) => x + 1)), []);

  const runMatch = useCallback(() => {
    setStage("calculating");
    // Simulate a cinematic calculation while we actually compute instantly.
    const ranked = rankCars(cars, answers);
    const timer = setTimeout(() => {
      setResults(ranked.slice(0, 12));
      setStage("results");
    }, 1800);
    return () => clearTimeout(timer);
  }, [answers]);

  const canNext = useCallback((): boolean => {
    const a = answers;
    switch (step) {
      case 0: return true; // budget always allowed (0 = no limit)
      case 1: return a.bodyTypes.length > 0;
      case 2: return a.priorities.length > 0;
      case 3: return a.performance !== null;
      case 4: return true; // fuel has default "any"
      case 5: return true; // transmission default "any"
      case 6: return a.usage.length > 0;
      case 7: return true; // power default "any"
      default: return true;
    }
  }, [answers, step]);

  const next = () => {
    if (step < TOTAL_QUESTIONS - 1) {
      setStep((s) => s + 1);
    } else {
      runMatch();
    }
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
    else setStage("intro");
  };

  const toggle = <T extends string>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

  // Sorted results
  const sortedResults = useMemo(() => {
    const r = [...results];
    switch (sortK) {
      case "price": r.sort((a, b) => a.car.price - b.car.price); break;
      case "performance": r.sort((a, b) => b.car.hp - a.car.hp); break;
      case "reliability":
        r.sort((a, b) => {
          const rel = (c: typeof a.car) =>
            c.categories.includes("daily") || c.brand === "Toyota" || c.brand === "Honda" || c.brand === "Lexus" ? 1 : 0;
          return rel(b.car) - rel(a.car) || b.score - a.score;
        });
        break;
      default: r.sort((a, b) => b.score - a.score);
    }
    return r;
  }, [results, sortK]);

  const hasPerfect = results.some((r) => r.score >= PERFECT_THRESHOLD);
  const displayResults = sortedResults.slice(0, 5);

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-ink/98 backdrop-blur-xl">
      <div className="min-h-full">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-8 sm:px-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={stage === "intro" ? onClose : back}
              className="group flex items-center gap-2 text-[12px] font-medium tracking-[0.18em] text-mist transition-colors hover:text-white"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              {stage === "intro" ? t(lang, "detail_close").toUpperCase() : t(lang, "fmc_back")}
            </button>
            {stage === "questions" && (
              <span className="font-display text-sm font-semibold tracking-[0.18em] text-fog">
                {t(lang, "fmc_question")} {step + 1} / {TOTAL_QUESTIONS}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {stage === "questions" && (
            <div className="mt-6 mb-10">
              <div className="h-px w-full bg-line">
                <div
                  className="h-full bg-accent transition-all duration-500 ease-out"
                  style={{ width: `${((step + 1) / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-[10px] tracking-[0.2em] text-fog">
                <span>●</span>
                <span className="text-fog">
                  {Math.round(((step + 1) / TOTAL_QUESTIONS) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* ============ INTRO ============ */}
          {stage === "intro" && (
            <Intro lang={lang} onStart={() => setStage("questions")} />
          )}

          {/* ============ QUESTIONS ============ */}
          {stage === "questions" && (
            <div className="flex flex-1 flex-col">
              <div key={step} className="card-in flex-1">
                {step === 0 && (
                  <BudgetStep
                    lang={lang}
                    budget={answers.budget}
                    customOpen={customOpen}
                    customValue={customValue}
                    setCustomOpen={setCustomOpen}
                    setCustomValue={setCustomValue}
                    onSelect={(v) => setAnswers({ ...answers, budget: v })}
                  />
                )}
                {step === 1 && (
                  <MultiStep
                    title={t(lang, "fmc_q2")}
                    hint={t(lang, "fmc_q2_hint")}
                    options={BODY_OPTIONS}
                    selected={answers.bodyTypes}
                    label={(o) => t(lang, `fmc_body_${o}`)}
                    onToggle={(v) => setAnswers({ ...answers, bodyTypes: toggle(answers.bodyTypes, v) as BodyChoice[] })}
                  />
                )}
                {step === 2 && (
                  <MultiStep
                    title={t(lang, "fmc_q3")}
                    hint={t(lang, "fmc_q3_hint")}
                    options={PRIORITY_OPTIONS}
                    selected={answers.priorities}
                    label={(o) => t(lang, `fmc_prio_${o}`)}
                    onToggle={(v) => setAnswers({ ...answers, priorities: toggle(answers.priorities, v) as Priority[] })}
                  />
                )}
                {step === 3 && (
                  <PerformanceStep
                    lang={lang}
                    value={answers.performance}
                    onSelect={(v) => setAnswers({ ...answers, performance: v })}
                  />
                )}
                {step === 4 && (
                  <SingleStep
                    title={t(lang, "fmc_q5")}
                    options={FUEL_OPTIONS}
                    selected={answers.fuel}
                    label={(o) => (o === "any" ? t(lang, "fmc_any") : t(lang, `fmc_fuel_${o}`))}
                    onSelect={(v) => setAnswers({ ...answers, fuel: v as FuelChoice })}
                  />
                )}
                {step === 5 && (
                  <SingleStep
                    title={t(lang, "fmc_q6")}
                    options={TRANS_OPTIONS}
                    selected={answers.transmission}
                    label={(o) => (o === "any" ? t(lang, "fmc_any") : t(lang, `fmc_trans_${o}`))}
                    onSelect={(v) => setAnswers({ ...answers, transmission: v as TransmissionChoice })}
                  />
                )}
                {step === 6 && (
                  <MultiStep
                    title={t(lang, "fmc_q7")}
                    hint={t(lang, "fmc_q7_hint")}
                    options={USE_OPTIONS}
                    selected={answers.usage}
                    label={(o) => t(lang, `fmc_use_${o}`)}
                    onToggle={(v) => setAnswers({ ...answers, usage: toggle(answers.usage, v) as Usage[] })}
                  />
                )}
                {step === 7 && (
                  <SingleStep
                    title={t(lang, "fmc_q8")}
                    options={POWER_OPTIONS}
                    selected={answers.power}
                    label={(o) => (o === "any" ? t(lang, "fmc_any") : t(lang, `fmc_power_${o}`))}
                    onSelect={(v) => setAnswers({ ...answers, power: v as PowerChoice })}
                  />
                )}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <button
                  onClick={back}
                  className="border border-line px-6 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-mist transition-colors hover:border-white/30 hover:text-white"
                >
                  {t(lang, "fmc_back")}
                </button>
                <button
                  onClick={next}
                  disabled={!canNext()}
                  className={`group inline-flex items-center gap-3 bg-accent px-8 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-white transition-all duration-300 ${
                    canNext() ? "hover:bg-accent-soft" : "cursor-not-allowed opacity-40"
                  }`}
                >
                  {step === TOTAL_QUESTIONS - 1 ? t(lang, "fmc_calc") : t(lang, "fmc_next")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {/* ============ CALCULATING ============ */}
          {stage === "calculating" && <Calculating lang={lang} />}

          {/* ============ RESULTS ============ */}
          {stage === "results" && (
            <Results
              lang={lang}
              results={displayResults}
              hasPerfect={hasPerfect}
              sortK={sortK}
              setSortK={setSortK}
              onExplore={setSelected}
              onChangeAnswers={() => setStage("questions")}
              onRestart={() => {
                setAnswers(defaultAnswers);
                setStep(0);
                setStage("intro");
              }}
            />
          )}
        </div>
      </div>

      {selected && (
        <CarDetail
          key={selected.id}
          car={selected}
          lang={lang}
          onClose={() => setSelected(null)}
          onOpen={setSelected}
        />
      )}
    </div>
  );
}

/* ============ SUB-COMPONENTS ============ */

function Intro({ lang, onStart }: { lang: Lang; onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="mb-5 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
        <span className="h-px w-8 bg-accent" />
        CARVIBES
        <span className="h-px w-8 bg-accent" />
      </p>
      <h1 className="hero-in font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
        {t(lang, "fmc_intro_title")}
      </h1>
      <p className="hero-in mt-6 max-w-lg text-base leading-relaxed text-mist sm:text-lg" style={{ animationDelay: "150ms" }}>
        {t(lang, "fmc_intro_sub")}
      </p>
      <button
        onClick={onStart}
        className="hero-in group mt-12 inline-flex h-16 items-center gap-3 bg-accent px-12 text-[13px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:bg-accent-soft hover:shadow-[0_0_60px_-10px_rgba(227,38,46,0.7)]"
        style={{ animationDelay: "300ms" }}
      >
        {t(lang, "fmc_start")}
        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
      </button>
    </div>
  );
}

function StepShell({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      {hint && <p className="mt-4 text-sm text-mist">{hint}</p>}
      <div className="mt-10">{children}</div>
    </div>
  );
}

function OptionPill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[3.25rem] items-center justify-center border px-5 py-3 text-center text-[12px] font-semibold tracking-[0.1em] transition-all duration-300 ${
        selected
          ? "border-accent bg-accent text-white"
          : "border-line text-mist hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function BudgetStep({ lang, budget, customOpen, customValue, setCustomOpen, setCustomValue, onSelect }: {
  lang: Lang; budget: number; customOpen: boolean; customValue: string;
  setCustomOpen: React.Dispatch<React.SetStateAction<boolean>>; setCustomValue: (v: string) => void;
  onSelect: (v: number) => void;
}) {
  return (
    <StepShell title={t(lang, "fmc_q1")} hint={t(lang, "fmc_q1_hint")}>
      <div className="mb-8 flex items-baseline gap-3">
        <span className="font-display text-4xl font-bold text-white sm:text-5xl">
          {budget === 0 ? t(lang, "fmc_no_limit") : formatEuro(budget)}
        </span>
      </div>
      {/* Slider */}
      <input
        type="range"
        min={0}
        max={BUDGET_OPTIONS.length - 1}
        step={1}
        value={budget === 0 ? 2 : Math.max(0, BUDGET_OPTIONS.indexOf(budget))}
        onChange={(e) => {
          const idx = Number(e.target.value);
          onSelect(BUDGET_OPTIONS[idx]);
        }}
        className="carvibes-range w-full"
        aria-label="Budget"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {BUDGET_OPTIONS.map((b) => (
          <button
            key={b}
            onClick={() => onSelect(b)}
            className={`border px-3.5 py-2 text-[11px] font-semibold tracking-[0.08em] transition-colors ${
              budget === b ? "border-accent bg-accent text-white" : "border-line text-mist hover:border-white/30 hover:text-white"
            }`}
          >
            {b >= 1000000 ? "€1M" : b >= 1000 ? `€${b / 1000}k` : `€${b}`}
          </button>
        ))}
        <button
          onClick={() => onSelect(0)}
          className={`border px-3.5 py-2 text-[11px] font-semibold tracking-[0.08em] transition-colors ${
            budget === 0 ? "border-accent bg-accent text-white" : "border-line text-mist hover:border-white/30 hover:text-white"
          }`}
        >
          {t(lang, "fmc_no_limit")}
        </button>
      </div>

      {/* Custom budget */}
      <div className="mt-8 border-t border-line pt-6">
        <button
          onClick={() => setCustomOpen((v) => !v)}
          className="text-[11px] font-semibold tracking-[0.16em] text-mist transition-colors hover:text-white"
        >
          {t(lang, "fmc_custom")} <span className="text-accent">＋</span>
        </button>
        {customOpen && (
          <div className="card-in mt-4 flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={t(lang, "fmc_custom_placeholder")}
              className="h-12 w-56 border border-line bg-charcoal px-4 text-white placeholder:text-fog focus:border-white/30 focus:outline-none"
            />
            <button
              onClick={() => {
                const v = Number(customValue);
                if (!Number.isNaN(v) && v > 0) onSelect(v);
                setCustomOpen(false);
              }}
              className="h-12 border border-accent bg-accent px-6 text-[11px] font-semibold tracking-[0.16em] text-white transition-colors hover:bg-accent-soft"
            >
              {t(lang, "fmc_apply")}
            </button>
          </div>
        )}
      </div>
    </StepShell>
  );
}

function MultiStep({ title, hint, options, selected, label, onToggle }: {
  title: string; hint?: string; options: string[]; selected: string[];
  label: (o: string) => string; onToggle: (o: string) => void;
}) {
  return (
    <StepShell title={title} hint={hint}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <OptionPill key={o} selected={selected.includes(o)} onClick={() => onToggle(o)}>
            {label(o)}
          </OptionPill>
        ))}
      </div>
    </StepShell>
  );
}

function SingleStep({ title, options, selected, label, onSelect }: {
  title: string; options: string[]; selected: string;
  label: (o: string) => string; onSelect: (o: string) => void;
}) {
  return (
    <StepShell title={title}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <OptionPill key={o} selected={selected === o} onClick={() => onSelect(o)}>
            {label(o)}
          </OptionPill>
        ))}
      </div>
    </StepShell>
  );
}

function PerformanceStep({ lang, value, onSelect }: {
  lang: Lang; value: PerformanceLevel | null; onSelect: (v: PerformanceLevel) => void;
}) {
  return (
    <StepShell title={t(lang, "fmc_q4")}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PERF_OPTIONS.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={`group flex flex-col items-start border p-6 text-left transition-all duration-300 ${
              value === p ? "border-accent bg-accent/10" : "border-line hover:border-white/25"
            }`}
          >
            <span className={`font-display text-xl font-bold tracking-tight ${value === p ? "text-white" : "text-mist group-hover:text-white"}`}>
              {t(lang, `fmc_perf_${p}`)}
            </span>
            <span className="mt-2 text-sm text-fog">{t(lang, `fmc_perf_${p}_desc`)}</span>
          </button>
        ))}
      </div>
    </StepShell>
  );
}

function Calculating({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border border-line" />
        <div className="carvibes-spinner absolute inset-0 rounded-full border-2 border-transparent border-t-accent" />
        <span className="absolute inset-0 flex items-center justify-center text-accent">◈</span>
      </div>
      <p className="mt-8 font-display text-2xl font-semibold text-white">
        {t(lang, "fmc_calculating")}
      </p>
      <p className="mt-3 text-sm text-fog">CarVibes · Discovery Engine</p>
    </div>
  );
}

function Results({ lang, results, hasPerfect, sortK, setSortK, onExplore, onChangeAnswers, onRestart }: {
  lang: Lang; results: MatchResult[]; hasPerfect: boolean;
  sortK: "best" | "price" | "performance" | "reliability";
  setSortK: (s: "best" | "price" | "performance" | "reliability") => void;
  onExplore: (c: import("../../lib/cars").Car) => void;
  onChangeAnswers: () => void; onRestart: () => void;
}) {
  const toggleFav = (id: string) => { toggleFavorite(id); };
  const toggleCmp = (id: string) => { addToCompare(id); };

  return (
    <div className="flex-1">
      <div className="text-center">
        <p className="mb-4 text-[11px] font-medium tracking-mega text-fog">
          CARVIBES · {t(lang, "findmine_eyebrow")}
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          {hasPerfect ? t(lang, "fmc_results_title") : t(lang, "fmc_no_match_title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-mist">
          {hasPerfect ? t(lang, "fmc_results_sub") : t(lang, "fmc_no_match_sub")}
        </p>
      </div>

      {/* Sort + actions */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-[0.18em] text-fog">
            {t(lang, "fmc_sort").toUpperCase()}
          </span>
          <div className="flex border border-line">
            {(["best", "price", "performance", "reliability"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSortK(k)}
                className={`px-3 py-2 text-[10px] font-semibold tracking-[0.08em] transition-colors ${
                  sortK === k ? "bg-accent text-white" : "text-mist hover:text-white"
                }`}
              >
                {t(lang, `fmc_sort_${k}`)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onChangeAnswers}
          className="text-[11px] font-semibold tracking-[0.14em] text-mist underline-offset-4 transition-colors hover:text-accent-soft"
        >
          {t(lang, "fmc_change")}
        </button>
      </div>

      {/* Results cards */}
      <div className="mt-8 space-y-5">
        {results.map((r, i) => (
          <ResultCard
            key={r.car.id}
            lang={lang}
            result={r}
            index={i}
            onExplore={onExplore}
            onToggleFav={toggleFav}
            onToggleCmp={toggleCmp}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={onRestart}
          className="text-[11px] font-semibold tracking-[0.16em] text-fog transition-colors hover:text-white"
        >
          ↻ {t(lang, "fmc_start")} {t(lang, "fmc_change")}
        </button>
      </div>
    </div>
  );
}

function ResultCard({ lang, result, index, onExplore, onToggleFav, onToggleCmp }: {
  lang: Lang; result: MatchResult; index: number;
  onExplore: (c: import("../../lib/cars").Car) => void;
  onToggleFav: (id: string) => void; onToggleCmp: (id: string) => void;
}) {
  const { car, score } = result;
  const fav = isFavorite(car.id);
  const cmp = isCompared(car.id);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1200 + index * 150;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, index]);

  return (
    <div className="card-in group relative flex flex-col gap-5 border border-line bg-charcoal p-4 sm:flex-row sm:p-6" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Image */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-graphite sm:aspect-auto sm:w-64">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] text-mist">
              {car.brand.toUpperCase()} · {car.year}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-white">{car.model}</h3>
          </div>
          {/* Match score */}
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-line)" strokeWidth="5" />
              <circle
                cx="40" cy="40" r="34" fill="none" stroke="#e3262e" strokeWidth="5"
                strokeDasharray={`${(displayScore / 100) * 213.6} 213.6`} strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-lg font-bold leading-none text-white">{displayScore}%</span>
              <span className="mt-0.5 text-[7px] tracking-[0.14em] text-fog">{t(lang, "fmc_match")}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-fog">
          <span><span className="font-semibold text-white">{formatPrice(car.price, lang)}</span></span>
          <span><span className="font-semibold text-white">{formatStat(car.hp)}</span> HP</span>
          <span>0–100 <span className="font-semibold text-white">{car.zeroToHundred || "—"}</span>s</span>
          <span>{car.engine}</span>
        </div>

        {/* Why */}
        {result.reasons.length > 0 && (
          <p className="mt-3 text-[13px] leading-relaxed text-mist">
            <span className="font-semibold text-white">{t(lang, "fmc_why")}</span>{" "}
            {result.reasons.slice(0, 3).join(". ")}.
          </p>
        )}

        {/* Transparent score breakdown */}
        <div className="mt-4">
          <div className="flex h-1.5 w-full overflow-hidden bg-line">
            {[
              { v: result.budget, c: "bg-accent" },
              { v: result.body, c: "bg-[#ff7b52]" },
              { v: result.performance, c: "bg-[#e8d24a]" },
              { v: result.priorities, c: "bg-[#7bd88f]" },
              { v: result.usage, c: "bg-[#5aa9e6]" },
              { v: result.fuel, c: "bg-[#a884f5]" },
              { v: result.transmission, c: "bg-[#f5a8c8]" },
            ].map((seg, i) => (
              <div
                key={i}
                className={seg.c}
                style={{ width: `${seg.v}%` }}
                title={`${seg.v}%`}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] tracking-[0.08em] text-fog">
            <span>◂ {result.budget}%</span>
            <span>▸ {result.body}%</span>
            <span>⚡ {result.performance}%</span>
            <span>✱ {result.priorities}%</span>
            <span>◎ {result.usage}%</span>
            <span>⟐ {result.fuel}%</span>
            <span>⚙ {result.transmission}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => onExplore(car)}
            className="group inline-flex h-11 items-center gap-2 bg-accent px-5 text-[11px] font-semibold tracking-[0.14em] text-white transition-colors hover:bg-accent-soft"
          >
            {t(lang, "fmc_explore")}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button
            onClick={() => onToggleCmp(car.id)}
            className={`h-11 border px-5 text-[11px] font-semibold tracking-[0.14em] transition-colors ${
              cmp ? "border-accent bg-accent/10 text-white" : "border-white/25 text-mist hover:border-white/50 hover:text-white"
            }`}
          >
            {cmp ? "✓ " : ""}{t(lang, "fmc_compare")}
          </button>
          <button
            onClick={() => onToggleFav(car.id)}
            aria-label={t(lang, "fmc_save")}
            className={`h-11 border px-4 text-[11px] font-semibold tracking-[0.14em] transition-colors ${
              fav ? "border-accent bg-accent/10 text-white" : "border-white/25 text-mist hover:border-white/50 hover:text-white"
            }`}
          >
            <span className="mr-1">{fav ? "♥" : "♡"}</span>
            {fav ? t(lang, "fmc_saved") : t(lang, "fmc_save")}
          </button>
        </div>
      </div>
    </div>
  );
}
