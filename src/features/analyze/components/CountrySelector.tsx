import { useEffect, useMemo, useRef, useState } from "react";
import { t, type Lang } from "../../../lib/i18n";
import { sortedAnalyzeCountries, type AnalyzeCountry } from "../countries";

interface Props {
  lang: Lang;
  value: string;
  onChange: (code: string) => void;
  label: string;
  hint?: string;
  id: string;
}

/** Flag + name + search country picker, popular countries first. */
export default function CountrySelector({ lang, value, onChange, label, hint, id }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const countries = useMemo(() => sortedAnalyzeCountries(lang), [lang]);
  const selected = countries.find((c) => c.code === value) ?? countries[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => {
      const names = [c.names.en, c.names.fr, c.names.es, c.code].join(" ").toLowerCase();
      return names.includes(q);
    });
  }, [countries, query]);

  const popular = filtered.filter((c) => c.popular && !query.trim());
  const rest = query.trim() ? filtered : filtered.filter((c) => !c.popular);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [open ]);

  const name = (c: AnalyzeCountry) =>
    lang === "fr" ? c.names.fr : lang === "es" ? c.names.es : c.names.en;

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="az-label">
        <span>{label}</span>
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="az-input flex items-center gap-3 text-left"
      >
        <span className="text-xl leading-none" aria-hidden>{selected.flag}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{name(selected)}</span>
        <span className="text-[11px] tracking-widest text-fog">{selected.currency}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden
          className={`shrink-0 text-fog transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-fog">{hint}</p>}

      {open && (
        <div className="az-glass absolute z-30 mt-2 w-full overflow-hidden rounded-xl">
          <div className="border-b border-line p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(lang, "az_search_country")}
              className="az-input"
              role="searchbox"
              aria-label={t(lang, "az_search_country")}
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5" role="listbox" aria-label={label}>
            {popular.length > 0 && (
              <>
                <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold tracking-mega text-fog">
                  {t(lang, "az_popular_countries").toUpperCase()}
                </p>
                {popular.map((c) => (
                  <CountryRow key={c.code} country={c} label={name(c)} active={c.code === value} onPick={pick} />
                ))}
                <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold tracking-mega text-fog">
                  {t(lang, "az_all_countries").toUpperCase()}
                </p>
              </>
            )}
            {rest.map((c) => (
              <CountryRow key={c.code} country={c} label={name(c)} active={c.code === value} onPick={pick} />
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-fog">{t(lang, "az_no_country")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CountryRow({
  country,
  label,
  active,
  onPick,
}: {
  country: AnalyzeCountry;
  label: string;
  active: boolean;
  onPick: (code: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => onPick(country.code)}
      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
        active ? "bg-accent/10 text-white" : "text-mist hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-lg leading-none" aria-hidden>{country.flag}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="text-[11px] tracking-widest text-fog">{country.currency}</span>
      {active && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="text-accent">
          <path d="M3 8.5l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
