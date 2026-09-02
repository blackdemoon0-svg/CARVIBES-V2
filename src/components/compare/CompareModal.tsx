import { useEffect, useMemo, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { cn } from "../../utils/cn";
import { cars } from "../../lib/db";
import type { Car } from "../../lib/cars";
import { getCompareIds, removeFromCompare, clearCompare, addToCompare, subscribePrefs } from "../../lib/prefs";
import { useOverlay } from "../../lib/useOverlay";
import { rankForBattle } from "../../lib/compare";
import { formatPrice, formatStat } from "../../lib/carUtils";
import { ArrowRight, SearchIcon } from "../icons";

type GroupId = "pricing" | "engine" | "performance" | "dimensions" | "efficiency";

const GROUPS: { id: GroupId; labelKey: string }[] = [
  { id: "pricing", labelKey: "cp_group_pricing" },
  { id: "engine", labelKey: "cp_group_engine" },
  { id: "performance", labelKey: "cp_group_performance" },
  { id: "dimensions", labelKey: "cp_group_dimensions" },
  { id: "efficiency", labelKey: "cp_group_efficiency" },
];

interface CompareRow {
  id: string;
  labelKey: string;
  group: GroupId;
  get: (c: Car, lang: Lang) => string;
  /** Raw numeric value for objective comparison — null when unavailable. */
  num?: (c: Car) => number | null;
  /** Whether a lower or higher value is better for this metric. */
  better?: "lower" | "higher";
}

// Only real fields from the vehicle database. Qualitative rows (engine,
// transmission, drivetrain, fuel) carry no `num`/`better` — they are never
// judged. Metrics with missing values render as unavailable.
const ROWS: CompareRow[] = [
  // PRICING & GENERAL
  {
    id: "price",
    labelKey: "cp_price",
    group: "pricing",
    get: (c, lang) => formatPrice(c.price, lang),
    num: (c) => (c.price > 0 ? c.price : null),
    better: "lower",
  },
  {
    id: "year",
    labelKey: "cp_year",
    group: "pricing",
    get: (c) => String(c.year),
  },
  {
    id: "body",
    labelKey: "detail_body",
    group: "pricing",
    get: (c) => c.body,
  },
  // ENGINE
  {
    id: "engine",
    labelKey: "cp_engine",
    group: "engine",
    get: (c) => c.engine,
  },
  {
    id: "hp",
    labelKey: "cp_hp",
    group: "engine",
    get: (c, lang) => (c.hp > 0 ? `${formatStat(c.hp)} hp` : t(lang, "cp_na")),
    num: (c) => (c.hp > 0 ? c.hp : null),
    better: "higher",
  },
  {
    id: "torque",
    labelKey: "cp_torque",
    group: "engine",
    get: (c, lang) => (c.torque ? `${formatStat(c.torque)} Nm` : t(lang, "cp_na")),
    num: (c) => c.torque || null,
    better: "higher",
  },
  // PERFORMANCE
  {
    id: "zto100",
    labelKey: "cp_0100",
    group: "performance",
    get: (c, lang) => (c.zeroToHundred ? `${c.zeroToHundred} s` : t(lang, "cp_na")),
    num: (c) => c.zeroToHundred || null,
    better: "lower",
  },
  {
    id: "top",
    labelKey: "cp_top",
    group: "performance",
    get: (c, lang) =>
      c.topSpeed ? `${formatStat(c.topSpeed)} km/h` : t(lang, "cp_na"),
    num: (c) => c.topSpeed || null,
    better: "higher",
  },
  {
    id: "trans",
    labelKey: "cp_trans",
    group: "performance",
    get: (c) => c.transmission,
  },
  {
    id: "drive",
    labelKey: "cp_drive",
    group: "performance",
    get: (c, lang) => c.drivetrain || t(lang, "cp_na"),
  },
  // DIMENSIONS
  {
    id: "weight",
    labelKey: "cp_weight",
    group: "dimensions",
    get: (c, lang) => (c.weight ? `${formatStat(c.weight)} kg` : t(lang, "cp_na")),
    num: (c) => c.weight || null,
    better: "lower",
  },
  // EFFICIENCY
  {
    id: "fuel",
    labelKey: "cp_fuel",
    group: "efficiency",
    get: (c) => c.fuel,
  },
];

export default function CompareModal({
  lang,
  onClose,
}: {
  lang: Lang;
  onClose: () => void;
}) {
  const [ids, setIds] = useState<string[]>(getCompareIds());
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [warning, setWarning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => subscribePrefs(() => setIds(getCompareIds())), []);

  // Body scroll lock + Escape-to-close for the battle overlay.
  useOverlay(onClose);

  const selectedCars = useMemo(
    () => ids.map((id) => cars.find((c) => c.id === id)).filter(Boolean) as Car[],
    [ids]
  );

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return cars
      .filter((c) => !ids.includes(c.id))
      .filter((c) => `${c.brand} ${c.model}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, ids]);

  const ranked = useMemo(() => rankForBattle(selectedCars), [selectedCars]);

  /**
   * Objective "best" per metric: only metrics where the value is numeric and
   * the direction (lower/higher better) is logically valid. Missing values
   * are excluded; ties produce no highlight.
   * Returns rowId -> index of the single best car.
   */
  const bestByRow = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of ROWS) {
      if (!row.num || !row.better) continue;
      const values = selectedCars
        .map((c, i) => ({ v: row.num!(c), i }))
        .filter((x): x is { v: number; i: number } => x.v !== null);
      if (values.length < 2) continue;
      const bestValue = values.reduce((a, b) =>
        row.better === "lower" ? (b.v < a.v ? b : a) : b.v > a.v ? b : a
      ).v;
      const winners = values.filter((x) => x.v === bestValue);
      if (winners.length === 1) map.set(row.id, winners[0].i);
    }
    return map;
  }, [selectedCars]);

  /** Objective metric leaders, shown as compact chips (ties included). */
  const leaders = useMemo(() => {
    const out: { row: CompareRow; label: string; car: Car | null }[] = [];
    for (const row of ROWS) {
      if (!row.num || !row.better) continue;
      const entries = selectedCars
        .map((c) => ({ car: c, v: row.num!(c) }))
        .filter((x): x is { car: Car; v: number } => x.v !== null);
      if (entries.length < 2) continue;
      const bestValue = entries.reduce((a, b) =>
        row.better === "lower" ? (b.v < a.v ? b : a) : b.v > a.v ? b : a
      ).v;
      const winners = entries.filter((x) => x.v === bestValue).map((x) => x.car);
      out.push({
        row,
        label: t(lang, row.labelKey),
        car: winners.length === 1 ? winners[0] : null,
      });
    }
    return out;
  }, [selectedCars, lang]);

  const addCar = (id: string) => {
    const res = addToCompare(id);
    if (res === "full") setWarning(true);
    setSearchOpen(false);
    setQuery("");
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  return (
    <div
      className="fixed inset-0 z-[55] overflow-y-auto bg-ink/98 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, "cp_battle")}
    >
      <div className="min-h-full">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between pb-6">
            <button
              onClick={onClose}
              className="group flex items-center gap-2 text-[12px] font-medium tracking-[0.18em] text-mist transition-colors hover:text-white"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              {t(lang, "detail_close").toUpperCase()}
            </button>
            <div className="flex items-center gap-3">
              {ids.length > 0 && (
                <button
                  onClick={() => {
                    clearCompare();
                    setRevealed(false);
                  }}
                  className="text-[11px] font-semibold tracking-[0.14em] text-fog transition-colors hover:text-accent-soft"
                >
                  {t(lang, "cp_clear")}
                </button>
              )}
              <span className="hidden font-display text-sm font-semibold tracking-[0.18em] text-fog md:inline">
                {t(lang, "cp_battle").toUpperCase()}
              </span>
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t(lang, "cp_battle")}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-mist">{t(lang, "cp_intro")}</p>

          {/* Warning toast */}
          {warning && (
            <div className="card-in mt-6 border border-accent/40 bg-accent/10 px-5 py-4 text-sm text-white">
              {t(lang, "cp_max_warning")}
              <button onClick={() => setWarning(false)} className="ml-3 text-accent-soft underline">
                ✕
              </button>
            </div>
          )}

          {/* Selected cars + add */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {selectedCars.map((car) => (
              <div key={car.id} className="group relative flex items-center gap-3 border border-line bg-charcoal pl-3 pr-2 py-2">
                <img src={car.image} alt={car.model} className="h-12 w-16 object-cover"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                <div className="pr-1">
                  <p className="text-sm font-semibold text-white">{car.brand} {car.model}</p>
                  <p className="text-[11px] text-fog">{car.year}</p>
                </div>
                <button
                  onClick={() => {
                    removeFromCompare(car.id);
                    setRevealed(false);
                  }}
                  aria-label={t(lang, "cp_remove")}
                  className="ml-1 text-fog transition-colors hover:text-accent-soft"
                >
                  ✕
                </button>
              </div>
            ))}

            {ids.length < 3 && (
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-[60px] items-center gap-2 border border-dashed border-white/25 px-5 text-[11px] font-semibold tracking-[0.14em] text-mist transition-colors hover:border-accent hover:text-white"
              >
                + {t(lang, "cp_add")}
              </button>
            )}
          </div>

          {/* Search panel */}
          {searchOpen && (
            <div className="card-in mt-4 border border-line bg-charcoal p-4">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(lang, "cp_search")}
                  aria-label={t(lang, "cp_search")}
                  className="h-11 w-full border border-line bg-ink pl-9 pr-3 text-sm text-white placeholder:text-fog focus:border-white/30 focus:outline-none"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => addCar(c.id)}
                      className="flex items-center gap-3 border border-line bg-ink px-3 py-2 text-left transition-colors hover:border-accent"
                    >
                      <img src={c.image} alt={c.model} className="h-10 w-14 object-cover" loading="lazy"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                      <div>
                        <p className="text-sm font-semibold text-white">{c.brand} {c.model}</p>
                        <p className="text-[11px] text-fog">{c.year} · {formatStat(c.hp)} hp</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {selectedCars.length === 0 && (
            <div className="mt-16 flex flex-col items-center justify-center border border-line py-24 text-center">
              <p className="font-display text-2xl font-semibold text-white">
                {t(lang, "cp_compare_cars")}
              </p>
              <p className="mt-3 max-w-sm text-sm text-mist">
                {t(lang, "cp_intro")}
              </p>
              <button
                onClick={() => setSearchOpen(true)}
                className="mt-6 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-white transition-colors hover:bg-accent-soft"
              >
                {t(lang, "cp_search")}
              </button>
            </div>
          )}

          {/* Comparison */}
          {selectedCars.length > 0 && (
            <div className="mt-12">
              {/* Objective leaders */}
              {selectedCars.length > 1 && (
                <div className="mb-10">
                  <h2 className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                    <span className="h-px w-6 bg-accent" />
                    {t(lang, "cp_obj_title")}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {leaders.map((l) => (
                      <div key={l.row.id} className="border border-line bg-charcoal px-4 py-3">
                        <p className="text-[10px] font-medium tracking-[0.16em] text-fog">
                          {l.label.toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {l.car ? (
                            <span className="text-accent-soft">
                              {l.car.brand} {l.car.model}
                            </span>
                          ) : (
                            <span className="text-fog">{t(lang, "cp_tie")}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 max-w-2xl text-[11px] leading-relaxed text-fog">
                    {t(lang, "cp_obj_sub")}
                  </p>
                </div>
              )}

              {/* Desktop: grouped comparison table */}
              <div className="hidden overflow-hidden border border-line lg:block">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-line bg-charcoal">
                      <th className="w-44 px-4 py-4 text-left align-bottom text-[10px] font-semibold tracking-[0.16em] text-fog" />
                      {selectedCars.map((c) => (
                        <th key={c.id} className="px-4 py-4 text-left align-bottom">
                          <img src={c.image} alt={c.model} className="mb-3 h-16 w-24 object-cover" loading="lazy"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                          <p className="font-display text-base font-bold text-white">{c.brand} {c.model}</p>
                          <p className="text-xs font-normal text-mist">{c.year} · {c.body}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {GROUPS.map((group) => (
                      <GroupRows
                        key={group.id}
                        group={group}
                        lang={lang}
                        cars={selectedCars}
                        bestByRow={bestByRow}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked per-vehicle cards */}
              <div className="space-y-4 lg:hidden">
                {selectedCars.map((car, carIndex) => (
                  <div key={car.id} className="border border-line bg-charcoal">
                    <div className="flex items-center gap-3 border-b border-line p-4">
                      <img src={car.image} alt={car.model} className="h-16 w-24 shrink-0 object-cover" loading="lazy"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base font-bold text-white">
                          {car.brand} {car.model}
                        </p>
                        <p className="mt-0.5 text-xs text-fog">{car.year} · {car.body}</p>
                        <p className="mt-1 font-display text-sm font-semibold text-white">
                          {formatPrice(car.price, lang)}
                        </p>
                      </div>
                    </div>
                    <dl className="divide-y divide-line">
                      {ROWS.map((row) => {
                        const isBest = bestByRow.get(row.id) === carIndex;
                        const value = row.get(car, lang);
                        const unavailable = value === t(lang, "cp_na");
                        return (
                          <div key={row.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                            <dt className="text-[12px] text-fog">{t(lang, row.labelKey)}</dt>
                            <dd
                              className={cn(
                                "text-right text-[12px] font-semibold",
                                unavailable ? "italic text-fog" : "text-white",
                                isBest && "text-accent-soft"
                              )}
                            >
                              {value}
                              {isBest && (
                                <span className="ml-1.5 text-[8px] font-bold tracking-[0.14em] text-accent-soft">
                                  {t(lang, "cp_best")}
                                </span>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                ))}
              </div>

              {/* Editorial CarVibes score (clearly labelled, not an objective verdict) */}
              <div className="mt-12 border border-line bg-charcoal p-6 sm:p-10">
                <h2 className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-accent">
                  <span className="h-px w-6 bg-accent" />
                  {t(lang, "detail_score").toUpperCase()}
                </h2>

                {!revealed ? (
                  <div>
                    <button
                      onClick={handleReveal}
                      className="group flex h-14 w-full items-center justify-center gap-3 bg-accent px-6 text-[12px] font-semibold tracking-[0.2em] text-white transition-colors hover:bg-accent-soft sm:inline-flex sm:w-auto sm:px-9"
                    >
                      {t(lang, "cp_winner_revealed")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-fog">
                      {t(lang, "cp_score_note")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ranked.map((r, i) => (
                      <div
                        key={r.car.id}
                        className={`card-in flex items-center gap-4 border p-4 ${
                          i === 0 ? "border-accent bg-accent/10" : "border-line bg-ink"
                        }`}
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        <div className="relative shrink-0">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent">
                            <span className="font-display text-2xl font-bold text-white">{r.total}</span>
                          </div>
                          {i === 0 && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-accent px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white">
                              🏆
                            </span>
                          )}
                        </div>
                        <img src={r.car.image} alt={r.car.model} className="hidden h-14 w-20 object-cover sm:block" loading="lazy"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                        <div className="flex-1">
                          <p className="font-display text-lg font-bold text-white">{r.car.brand} {r.car.model}</p>
                          <p className="text-xs text-mist">
                            {t(lang, "cp_overall")} · {r.total} / 100
                          </p>
                        </div>
                      </div>
                    ))}
                    <p className="max-w-2xl text-[11px] leading-relaxed text-fog">
                      {t(lang, "cp_score_note")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** One group: a full-width group header row + its metric rows. */
function GroupRows({
  group,
  lang,
  cars,
  bestByRow,
}: {
  group: { id: GroupId; labelKey: string };
  lang: Lang;
  cars: Car[];
  bestByRow: Map<string, number>;
}) {
  const rows = ROWS.filter((r) => r.group === group.id);
  return (
    <>
      <tr className="border-b border-line bg-graphite">
        <td
          colSpan={cars.length + 1}
          className="px-4 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-white"
        >
          {t(lang, group.labelKey)}
        </td>
      </tr>
      {rows.map((row, i) => (
        <tr key={row.id} className={`border-b border-line ${i % 2 ? "bg-charcoal/40" : ""}`}>
          <td className="px-4 py-3 text-[11px] font-medium tracking-[0.14em] text-mist">
            {t(lang, row.labelKey)}
          </td>
          {cars.map((c, carIndex) => {
            const isBest = bestByRow.get(row.id) === carIndex;
            const value = row.get(c, lang);
            const unavailable = value === t(lang, "cp_na");
            return (
              <td
                key={c.id}
                className={cn(
                  "px-4 py-3 font-display text-sm font-semibold",
                  unavailable ? "italic text-fog" : "text-white",
                  isBest && "bg-accent/10 text-accent-soft"
                )}
              >
                {value}
                {isBest && (
                  <span className="ml-1.5 align-middle text-[8px] font-bold tracking-[0.14em] text-accent-soft">
                    {t(lang, "cp_best")}
                  </span>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
