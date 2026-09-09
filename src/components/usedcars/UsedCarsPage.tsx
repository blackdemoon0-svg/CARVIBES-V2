import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Lang } from "../../lib/i18n";
import type { Car } from "../../lib/cars";
import { cn } from "../../utils/cn";
import {
  USED_CATEGORIES,
  USED_CAR_ENTRIES,
  isUsedCategoryId,
  usedCarsForCategory,
  type UsedCarEntry,
  type UsedCategory,
  type UsedCategoryId,
} from "../../lib/usedCars";
import { cars } from "../../lib/db";
import ImageWithFallback from "../ImageWithFallback";
import { SaveButton, CompareButton } from "../compare/ActionButtons";
import { ArrowRight } from "../icons";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * /used-cars — Best Used Cars to Buy in 2026–2027.
 * Editorial guide built on the real CarVibes database. Shares the visual
 * language of the Compare "battle" screen: dark arena background, hairline
 * grid, red accent, score rings and objective "best" highlights.
 */
export default function UsedCarsPage({
  lang,
  onOpenCar,
}: {
  lang: Lang;
  onOpenCar: (car: Car) => void;
}) {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get("category");
  const [active, setActive] = useState<UsedCategoryId>(
    isUsedCategoryId(fromUrl) ? fromUrl : "reliable"
  );
  const resultsRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Keep the URL shareable (?category=suv) without polluting history.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const next = new URLSearchParams(params);
    if (active === "reliable") next.delete("category");
    else next.set("category", active);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const category = USED_CATEGORIES.find((c) => c.id === active)!;
  const results = useMemo(() => usedCarsForCategory(active), [active]);

  // Objective leaders per metric inside the active category (ties = none).
  const leaders = useMemo(() => {
    const metrics: { key: keyof UsedCarEntry; label: string }[] = [
      { key: "reliability", label: "Reliability" },
      { key: "maintenance", label: "Maintenance" },
      { key: "fuelEconomy", label: "Fuel economy" },
      { key: "performance", label: "Performance" },
      { key: "value", label: "Value" },
    ];
    const map = new Map<string, string>(); // metric -> carId
    for (const m of metrics) {
      const best = Math.max(...results.map((r) => r[m.key] as number));
      const winners = results.filter((r) => (r[m.key] as number) === best);
      if (winners.length === 1) map.set(m.key, winners[0].carId);
    }
    return map;
  }, [results]);

  const select = (id: UsedCategoryId) => {
    setActive(id);
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const totalPicks = USED_CAR_ENTRIES.length;

  return (
    <div className="quiz-arena relative border-t border-line">
      <div className="quiz-grid pointer-events-none absolute inset-x-0 top-0 h-[70vh]" />

      {/* ------------------------------------------------------------ */}
      {/* HERO                                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="relative mx-auto max-w-[1480px] px-5 pb-16 pt-28 sm:px-8 sm:pt-36 lg:px-16">
        <nav aria-label="Breadcrumb" className="hero-in mb-6 text-[11px] tracking-[0.18em] text-fog">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="transition-colors hover:text-white">
                CARVIBES
              </Link>
            </li>
            <li aria-hidden="true" className="text-line">
              /
            </li>
            <li className="text-mist">USED CARS</li>
          </ol>
        </nav>

        <p
          className="hero-in mb-6 flex items-center gap-3 text-[11px] font-medium tracking-mega text-mist"
          style={{ animationDelay: "120ms" }}
        >
          <span className="h-px w-8 bg-accent" />
          USED CARS · 2026–2027 BUYER'S GUIDE
        </p>

        <h1 className="font-display text-[clamp(2.4rem,7vw,5.6rem)] font-extrabold leading-[0.95] tracking-tight text-white">
          <span className="hero-in block" style={{ animationDelay: "240ms" }}>
            BEST USED CARS
          </span>
          <span className="hero-in block" style={{ animationDelay: "400ms" }}>
            TO BUY IN <span className="text-accent">2026–2027</span>
          </span>
        </h1>

        <p
          className="hero-in mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg"
          style={{ animationDelay: "560ms" }}
        >
          CarVibes helps you discover the best used cars based on reliability,
          value for money, real-world performance, maintenance costs and fuel
          economy. Pick a category, compare the CarVibes Score and jump straight
          into the full spec sheet of every car.
        </p>

        {/* Live stats */}
        <div
          className="hero-in mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-7 sm:grid-cols-4"
          style={{ animationDelay: "700ms" }}
        >
          {[
            { value: `${totalPicks}`, label: "CURATED PICKS" },
            { value: `${USED_CATEGORIES.length}`, label: "CATEGORIES" },
            { value: "5", label: "SCORED FACTORS" },
            { value: "0–100", label: "EDITORIAL SCORE" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-[10px] font-medium tracking-[0.2em] text-fog">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* CATEGORY CARDS                                                 */}
      {/* ------------------------------------------------------------ */}
      <section
        id="categories"
        aria-labelledby="used-categories-heading"
        className="relative mx-auto max-w-[1480px] px-5 pb-16 sm:px-8 lg:px-16"
      >
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              CHOOSE A CATEGORY
            </p>
            <h2
              id="used-categories-heading"
              className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              What kind of used car are you after?
            </h2>
          </div>
          <p className="max-w-sm text-sm text-mist">
            Every list is ranked by CarVibes Score — a 0–100 blend of
            reliability, maintenance, fuel economy, performance and value.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Used car categories"
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4"
        >
          {USED_CATEGORIES.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={i}
              active={cat.id === active}
              count={usedCarsForCategory(cat.id).length}
              onSelect={() => select(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* RESULTS                                                        */}
      {/* ------------------------------------------------------------ */}
      <section
        ref={resultsRef}
        id="results"
        role="tabpanel"
        aria-labelledby={`used-tab-${active}`}
        className="relative mx-auto max-w-[1480px] scroll-mt-24 px-5 pb-16 sm:px-8 lg:px-16"
      >
        {/* Sticky chip bar for fast switching once you are deep in the list */}
        <div className="glass sticky top-14 z-20 border-y border-line -mx-5 mb-8 overflow-x-auto px-5 py-3 sm:-mx-8 sm:px-8 lg:-mx-16 lg:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {USED_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => select(cat.id)}
                aria-pressed={cat.id === active}
                className={cn(
                  "cv-btn cv-btn-sm inline-flex h-9 items-center gap-2 whitespace-nowrap border px-3.5 text-[11px] font-semibold tracking-[0.14em]",
                  cat.id === active
                    ? "border-accent bg-accent/15 text-white shadow-[0_0_24px_-8px_rgba(227,38,46,0.8)]"
                    : "border-line bg-charcoal/70 text-mist hover:border-white/30 hover:text-white"
                )}
              >
                <span aria-hidden="true">{cat.emoji}</span>
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div key={active} className="quiz-in">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 flex items-center gap-3 text-[11px] font-medium tracking-mega text-accent">
                <span className="h-px w-8 bg-accent" />
                {results.length} PICKS · RANKED BY CARVIBES SCORE
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                <span aria-hidden="true" className="mr-3">
                  {category.emoji}
                </span>
                {category.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">
                {category.description}
              </p>
            </div>
          </div>

          {/* Objective leaders — same pattern as the Battle screen */}
          {results.length > 1 && (
            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(
                [
                  ["reliability", "MOST RELIABLE"],
                  ["maintenance", "CHEAPEST TO RUN"],
                  ["fuelEconomy", "BEST ECONOMY"],
                  ["performance", "FASTEST"],
                  ["value", "BEST VALUE"],
                ] as const
              ).map(([key, label]) => {
                const id = leaders.get(key);
                const entry = results.find((r) => r.carId === id);
                return (
                  <div key={key} className="edge-light border border-line bg-charcoal px-4 py-3">
                    <p className="text-[10px] font-medium tracking-[0.16em] text-fog">{label}</p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {entry ? (
                        <span className="text-accent-soft">
                          {entry.car.brand} {entry.car.model}
                        </span>
                      ) : (
                        <span className="text-fog">Tie</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Editorial disclaimer — estimates, not live market data */}
          <p className="mb-6 flex max-w-3xl items-start gap-3 border border-line bg-ink/60 px-4 py-3 text-[11px] leading-relaxed text-fog">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent-soft">ⓘ</span>
            <span>
              <strong className="font-semibold text-mist">Editorial guide.</strong> Prices are
              CarVibes estimates for good-condition examples on the 2026–2027 used market — not
              live listings — and vary by mileage, region and trim. Scores are editorial ratings,
              not manufacturer or survey data.
            </span>
          </p>

          {/* Car cards */}
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-5">
            {results.map((entry, i) => (
              <li key={entry.carId} className="list-none">
                <UsedCarCard
                  entry={entry}
                  rank={i + 1}
                  index={i}
                  lang={lang}
                  leaders={leaders}
                  onOpen={() => onOpenCar(entry.car)}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* METHODOLOGY + INTERNAL LINKS                                   */}
      {/* ------------------------------------------------------------ */}
      <section
        aria-labelledby="used-method-heading"
        className="relative mx-auto max-w-[1480px] px-5 pb-24 sm:px-8 lg:px-16"
      >
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="edge-light border border-line bg-charcoal p-6 sm:p-10">
            <p className="mb-3 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              METHODOLOGY
            </p>
            <h2
              id="used-method-heading"
              className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              How the CarVibes used-car score works
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-mist">
              Each pick is scored from 0 to 100 on five factors, then blended
              into a single CarVibes Score: <strong className="text-white">reliability (30%)</strong>,{" "}
              <strong className="text-white">maintenance cost (20%)</strong>,{" "}
              <strong className="text-white">fuel economy (20%)</strong>,{" "}
              <strong className="text-white">performance (15%)</strong> and{" "}
              <strong className="text-white">value for money (15%)</strong>. Prices
              are estimates for good-condition examples on the 2026–2027 used
              market and vary by mileage, region and trim. Always check the
              service history and get an independent inspection before buying.
            </p>
            <div className="mt-6 grid grid-cols-5 gap-1.5">
              {[
                ["30", "RELIAB."],
                ["20", "MAINT."],
                ["20", "FUEL"],
                ["15", "PERF."],
                ["15", "VALUE"],
              ].map(([w, l]) => (
                <div key={l} className="border border-line bg-ink px-2 py-3 text-center">
                  <div className="font-display text-lg font-bold text-white">{w}%</div>
                  <div className="mt-0.5 text-[9px] font-semibold tracking-[0.14em] text-fog">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="edge-light flex flex-col border border-line bg-charcoal p-6 sm:p-10">
            <p className="mb-3 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              KEEP EXPLORING
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Not sure yet? Let CarVibes narrow it down.
            </h2>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-mist">
              Answer a few questions to match with your ideal car, put two of
              these picks head-to-head in a battle, or browse the full database
              of {cars.length}+ cars.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/find-my-car"
                className="cv-btn cv-btn-primary group inline-flex h-12 items-center justify-center gap-3 px-6 text-[11px] font-semibold tracking-[0.18em]"
              >
                FIND YOUR CAR
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/compare"
                className="cv-btn cv-btn-ghost inline-flex h-12 items-center justify-center gap-2 px-6 text-[11px] font-semibold tracking-[0.18em]"
              >
                ⚔ COMPARE
              </Link>
              <Link
                to="/explore"
                className="cv-btn cv-btn-ghost inline-flex h-12 items-center justify-center px-6 text-[11px] font-semibold tracking-[0.18em]"
              >
                EXPLORE ALL
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Category card                                                       */
/* ------------------------------------------------------------------ */
function CategoryCard({
  cat,
  index,
  active,
  count,
  onSelect,
}: {
  cat: UsedCategory;
  index: number;
  active: boolean;
  count: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      id={`used-tab-${cat.id}`}
      role="tab"
      aria-selected={active}
      aria-controls="results"
      onClick={onSelect}
      className={cn(
        "card-in quiz-sheen edge-light group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden border p-4 text-left transition-all duration-500 ease-out sm:min-h-[10.5rem] sm:p-5",
        "rounded-tl-[1.35rem] rounded-br-[1.35rem] rounded-tr-md rounded-bl-md",
        active
          ? "quiz-glow border-accent/70 bg-gradient-to-br from-accent/20 via-charcoal to-charcoal"
          : "border-line bg-charcoal hover:-translate-y-1 hover:border-white/25 hover:bg-graphite hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Corner glow */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500",
          active ? "bg-accent/40 opacity-100" : "bg-accent/30 opacity-0 group-hover:opacity-60"
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-11 w-11 items-center justify-center border text-xl transition-colors duration-300 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm",
            active
              ? "border-accent/60 bg-ink/60"
              : "border-line bg-ink group-hover:border-accent/40"
          )}
        >
          {cat.emoji}
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold tracking-[0.16em]",
            active ? "text-accent-soft" : "text-fog"
          )}
        >
          {count} CARS
        </span>
      </div>
      <div>
        <h3 className="font-display text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
          {cat.title}
        </h3>
        <span
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] transition-colors duration-300",
            active ? "text-white" : "text-fog group-hover:text-white"
          )}
        >
          {active ? "SHOWING" : "VIEW PICKS"}
          <ArrowRight
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300",
              !active && "group-hover:translate-x-1"
            )}
          />
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Car card                                                            */
/* ------------------------------------------------------------------ */
function UsedCarCard({
  entry,
  rank,
  index,
  lang,
  leaders,
  onOpen,
}: {
  entry: UsedCarEntry;
  rank: number;
  index: number;
  lang: Lang;
  leaders: Map<string, string>;
  onOpen: () => void;
}) {
  const { car } = entry;
  const podium = rank === 1;

  const metrics: { key: string; label: string; value: number; display?: string }[] = [
    { key: "reliability", label: "Reliability", value: entry.reliability },
    { key: "maintenance", label: "Maintenance", value: entry.maintenance },
    { key: "fuelEconomy", label: "Fuel economy", value: entry.fuelEconomy, display: entry.fuelLabel },
    { key: "performance", label: "Performance", value: entry.performance },
  ];

  return (
    <article
      className={cn(
        "card-in edge-light group relative flex h-full flex-col overflow-hidden border bg-charcoal transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(227,38,46,0.15)]",
        podium ? "border-accent/60" : "border-line hover:border-white/25"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
        <ImageWithFallback
          src={car.image}
          alt={`${car.brand} ${car.model} — used ${entry.years}`}
          title={`${car.brand} ${car.model}`}
          className="absolute inset-0"
          imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        <div className="absolute inset-0 bg-accent/0 transition-colors duration-700 group-hover:bg-accent/10" />

        {/* Rank */}
        <span
          className={cn(
            "absolute left-4 top-4 flex h-9 min-w-9 items-center justify-center border px-2 font-display text-sm font-bold backdrop-blur-sm rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm",
            podium
              ? "border-accent bg-accent text-white shadow-[0_0_24px_-6px_rgba(227,38,46,0.9)]"
              : "border-white/15 bg-ink/60 text-white"
          )}
        >
          {podium ? "🏆" : `#${rank}`}
        </span>

        {/* Score ring — the Battle screen signature */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[9px] font-semibold tracking-[0.18em] text-mist">CARVIBES SCORE</div>
            <div className="text-[10px] text-fog">out of 100</div>
          </div>
          <ScoreRing value={entry.score} highlight={podium} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold text-white">
              {car.brand} <span className="font-normal text-mist">{car.model}</span>
            </h3>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-fog">
              {entry.years} · {car.body.toUpperCase()} · {car.fuel.toUpperCase()}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[9px] font-semibold tracking-[0.18em] text-fog" title="CarVibes estimate — not a live market price">EST. USED PRICE*</div>
            <div className="font-display text-base font-bold tracking-tight text-white">
              {usd(entry.priceMin)}–{usd(entry.priceMax)}
            </div>
            <div className="text-[9px] text-fog">*estimate</div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-mist">{entry.why}</p>

        {/* Metric bars */}
        <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
          {metrics.map((m) => {
            const best = leaders.get(m.key) === entry.carId;
            return (
              <div key={m.key}>
                <div className="flex items-baseline justify-between text-[11px]">
                  <dt className="flex items-center gap-2 text-fog">
                    {m.label}
                    {best && (
                      <span className="text-[8px] font-bold tracking-[0.14em] text-accent-soft">
                        BEST
                      </span>
                    )}
                  </dt>
                  <dd className={cn("font-semibold", best ? "text-accent-soft" : "text-white")}>
                    {m.display ?? `${m.value}/100`}
                  </dd>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-ink">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-700 ease-out",
                      best ? "bg-accent" : "bg-white/40 group-hover:bg-white/60"
                    )}
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </dl>

        {/* CTAs — same trio as the Explore car cards */}
        <button
          type="button"
          onClick={onOpen}
          className="cv-btn cv-btn-outline group/btn mt-5 flex h-11 w-full items-center justify-between px-4 text-[11px] font-semibold tracking-[0.2em]"
        >
          VIEW FULL SPECS
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
        <div className="mt-2 flex gap-2">
          <SaveButton carId={car.id} lang={lang} className="cv-btn cv-btn-sm flex-1 justify-center" />
          <CompareButton carId={car.id} lang={lang} className="cv-btn cv-btn-sm flex-1 justify-center" />
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Score ring                                                          */
/* ------------------------------------------------------------------ */
function ScoreRing({ value, highlight }: { value: number; highlight?: boolean }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={r} fill="rgba(8,9,12,0.7)" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={highlight ? "#ff4a52" : "#e3262e"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="relative font-display text-base font-bold text-white">{value}</span>
    </div>
  );
}
