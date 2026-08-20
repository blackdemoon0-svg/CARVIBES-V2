import { useEffect, useMemo, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { cars } from "../../lib/db";
import type { Car } from "../../lib/cars";
import { getCompareIds, removeFromCompare, clearCompare, addToCompare, subscribePrefs } from "../../lib/prefs";
import { categoryWinners, rankForBattle } from "../../lib/compare";
import { formatStat } from "../../lib/carUtils";
import { ArrowRight, SearchIcon } from "../icons";

// Rows of the comparison table
const SPEC_ROWS: { key: string; label: string; get: (c: Car) => string }[] = [
  { key: "price", label: "cp_price", get: (c) => (c.price > 0 ? formatStat(c.price) : "N/A") },
  { key: "year", label: "cp_year", get: (c) => String(c.year) },
  { key: "hp", label: "cp_hp", get: (c) => (c.hp > 0 ? `${formatStat(c.hp)} hp` : "N/A") },
  { key: "torque", label: "cp_torque", get: (c) => (c.torque ? `${formatStat(c.torque)} Nm` : "N/A") },
  { key: "engine", label: "cp_engine", get: (c) => c.engine },
  { key: "trans", label: "cp_trans", get: (c) => c.transmission },
  { key: "drive", label: "cp_drive", get: (c) => c.drivetrain || "N/A" },
  { key: "0100", label: "cp_0100", get: (c) => (c.zeroToHundred ? `${c.zeroToHundred}s` : "N/A") },
  { key: "top", label: "cp_top", get: (c) => (c.topSpeed ? `${formatStat(c.topSpeed)} km/h` : "N/A") },
  { key: "weight", label: "cp_weight", get: (c) => (c.weight ? `${formatStat(c.weight)} kg` : "N/A") },
  { key: "fuel", label: "cp_fuel", get: (c) => c.fuel },
];

// Animated bar categories
const BAR_ROWS = [
  { key: "hp", label: "cp_hp", max: 1000, get: (c: Car) => c.hp || 0 },
  { key: "0100", label: "cp_0100", max: 12, get: (c: Car) => c.zeroToHundred || 0, invert: true },
  { key: "top", label: "cp_top", max: 440, get: (c: Car) => c.topSpeed || 0 },
  { key: "torque", label: "cp_torque", max: 2000, get: (c: Car) => c.torque || 0 },
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

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
  const winners = useMemo(() => categoryWinners(selectedCars), [selectedCars]);

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
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-ink/98 backdrop-blur-xl">
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
              <span className="font-display text-sm font-semibold tracking-[0.18em] text-fog">
                {t(lang, "cp_battle").toUpperCase()}
              </span>
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t(lang, "cp_battle")}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-mist">
            {t(lang, "fav_sub")}
          </p>

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
                <img src={car.image} alt={car.model} className="h-12 w-16 object-cover" />
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
                      <img src={c.image} alt={c.model} className="h-10 w-14 object-cover" loading="lazy" />
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
                {t(lang, "fav_sub")}
              </p>
              <button
                onClick={() => setSearchOpen(true)}
                className="mt-6 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-white transition-colors hover:bg-accent-soft"
              >
                {t(lang, "cp_search")}
              </button>
            </div>
          )}

          {/* Comparison table */}
          {selectedCars.length > 0 && (
            <div className="mt-12">
              {/* Head-to-head winner chips */}
              <div className="mb-8">
                <h2 className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                  <span className="h-px w-6 bg-accent" />
                  {t(lang, "cp_head_to_head")}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {winners.map((w) => (
                    <div key={w.key} className="border border-line bg-charcoal px-4 py-3">
                      <p className="text-[10px] font-medium tracking-[0.16em] text-fog">
                        {t(lang, `cp_${w.key}`).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {w.winner ? (
                          <span className="text-accent-soft">🏆 </span>
                        ) : (
                          <span className="text-fog">— </span>
                        )}
                        {w.winner ? `${w.winner.brand} ${w.winner.model}` : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spec table */}
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="w-40 px-4 py-4 text-left text-[10px] font-semibold tracking-[0.16em] text-fog" />
                      {selectedCars.map((c) => (
                        <th key={c.id} className="px-4 py-4 text-left">
                          <p className="font-display text-base font-bold text-white">{c.brand} {c.model}</p>
                          <p className="text-xs font-normal text-mist">{c.year}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SPEC_ROWS.map((row, i) => (
                      <tr key={row.key} className={`border-b border-line ${i % 2 ? "bg-charcoal/40" : ""}`}>
                        <td className="px-4 py-3 text-[11px] font-medium tracking-[0.14em] text-mist">
                          {t(lang, row.label)}
                        </td>
                        {selectedCars.map((c) => (
                          <td key={c.id} className="px-4 py-3 font-display text-sm font-semibold text-white">
                            {row.get(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Animated performance bars */}
              <h2 className="mb-5 mt-12 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "cp_performance").toUpperCase()}
              </h2>
              <div className="space-y-6">
                {BAR_ROWS.map((bar) => {
                  const values = selectedCars.map((c) => {
                    const raw = bar.get(c);
                    const pct = Math.max(4, Math.min(100, (raw / bar.max) * 100));
                    return { car: c, raw, pct: bar.invert ? (bar.max - raw) / bar.max * 100 : pct };
                  });
                  return (
                    <div key={bar.key}>
                      <div className="mb-2 flex items-center justify-between text-[10px] font-medium tracking-[0.16em] text-fog">
                        <span>{t(lang, bar.label).toUpperCase()}</span>
                        <span className="flex gap-4">
                          {values.map((v) => (
                            <span key={v.car.id} className="text-mist">{formatStat(v.raw)}</span>
                          ))}
                        </span>
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedCars.length}, 1fr)` }}>
                        {values.map((v, i) => (
                          <div key={v.car.id} className="h-2 w-full bg-line">
                            <div
                              className="h-full bg-accent transition-all duration-1000 ease-out"
                              style={{ width: `${v.pct}%`, opacity: 0.5 + (i === 0 ? 0.5 : 0) }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Winner */}
              <div className="mt-16 border border-line bg-charcoal p-6 sm:p-10">
                <h2 className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-accent">
                  <span className="h-px w-6 bg-accent" />
                  {t(lang, "cp_winner").toUpperCase()}
                </h2>

                {!revealed ? (
                  <button
                    onClick={handleReveal}
                    className="group inline-flex h-14 items-center gap-3 bg-accent px-9 text-[12px] font-semibold tracking-[0.2em] text-white transition-colors hover:bg-accent-soft"
                  >
                    {t(lang, "cp_winner_revealed")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
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
                        <img src={r.car.image} alt={r.car.model} className="hidden h-14 w-20 object-cover sm:block" loading="lazy" />
                        <div className="flex-1">
                          <p className="font-display text-lg font-bold text-white">{r.car.brand} {r.car.model}</p>
                          <p className="text-xs text-mist">
                            {t(lang, "cp_overall")} · {r.total} / 100
                          </p>
                        </div>
                      </div>
                    ))}
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
