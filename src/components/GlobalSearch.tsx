import { useEffect, useMemo, useRef, useState } from "react";
import { t, type Lang } from "../lib/i18n";
import { cars } from "../lib/db";
import { stories } from "../lib/stories";
import type { Car } from "../lib/cars";
import type { Story } from "../lib/stories";
import { formatPrice } from "../lib/carUtils";
import { SearchIcon } from "./icons";

export default function GlobalSearch({
  lang,
  onClose,
  onOpenCar,
  onOpenStory,
}: {
  lang: Lang;
  onClose: () => void;
  onOpenCar: (c: Car) => void;
  onOpenStory: (s: Story) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { cars: [] as Car[], stories: [] as Story[] };
    const matchedCars = cars
      .filter((c) => `${c.brand} ${c.model}`.toLowerCase().includes(q))
      .slice(0, 6);
    const matchedStories = stories
      .filter((s) => `${s.car} ${s.brand} ${s.title}`.toLowerCase().includes(q))
      .slice(0, 3);
    return { cars: matchedCars, stories: matchedStories };
  }, [query]);

  const showPanel = query.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-[58] overflow-y-auto bg-ink/95 backdrop-blur-xl" onClick={onClose}>
      <div className="mx-auto max-w-2xl px-5 pt-24 sm:pt-28" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fog" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(lang, "cp_search")}
            className="h-14 w-full border border-line bg-charcoal pl-12 pr-4 text-base text-white placeholder:text-fog focus:border-accent focus:outline-none"
          />
        </div>

        {showPanel && (results.cars.length > 0 || results.stories.length > 0) && (
          <div className="card-in mt-4 max-h-[60vh] overflow-y-auto border border-line bg-charcoal">
            {results.cars.length > 0 && (
              <div className="px-4 pt-4">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                  {t(lang, "universe_eyebrow").toUpperCase()} · {results.cars.length}
                </p>
                {results.cars.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onOpenCar(c);
                    }}
                    className="flex w-full items-center gap-3 border-b border-line py-3 text-left transition-colors hover:bg-ink"
                  >
                    <img src={c.image} alt={c.model} className="h-12 w-16 object-cover" loading="lazy" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{c.brand} {c.model}</p>
                      <p className="text-[11px] text-fog">{c.year} · {c.engine}</p>
                    </div>
                    <span className="text-xs font-semibold text-mist">{formatPrice(c.price, lang)}</span>
                  </button>
                ))}
              </div>
            )}
            {results.stories.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                  {t(lang, "st_eyebrow").toUpperCase()} · {results.stories.length}
                </p>
                {results.stories.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onOpenStory(s);
                    }}
                    className="flex w-full items-center gap-3 border-b border-line py-3 text-left transition-colors hover:bg-ink"
                  >
                    <img src={s.image} alt={s.title} className="h-12 w-16 object-cover" loading="lazy" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{s.title}</p>
                      <p className="text-[11px] text-fog">{s.car} · {s.year}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {showPanel && results.cars.length === 0 && results.stories.length === 0 && (
          <div className="card-in mt-4 border border-line bg-charcoal px-5 py-12 text-center">
            <p className="font-display text-lg font-semibold text-white">{t(lang, "no_results")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
