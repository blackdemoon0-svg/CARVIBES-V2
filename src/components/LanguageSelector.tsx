import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { LANGS, t, type Lang } from "../lib/i18n";
import { GlobeIcon, ChevronDown, CheckIcon } from "./icons";

/**
 * Modern, highly visible language selector used in the navbar.
 *
 * - Lists every supported language (Deutsch deliberately near the top).
 * - The dropdown is compact, scrollable and clamped to the viewport so it
 *   can never overflow on small mobile screens.
 * - Closes on outside click / Escape. Languages without a full dictionary
 *   still work (the i18n layer falls back to English).
 */
export default function LanguageSelector({
  lang,
  onLangChange,
  className,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t(lang, "nav_language")}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "group flex h-10 items-center gap-2 border px-2.5 text-[11px] font-semibold tracking-[0.14em] transition-colors duration-300 sm:px-3",
          open
            ? "border-white/30 text-white"
            : "border-line text-mist hover:border-white/25 hover:text-white"
        )}
      >
        <GlobeIcon className="h-4 w-4" />
        <span className="hidden uppercase min-[380px]:inline">{lang}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown — clamped to the viewport height on mobile, never wider
          than the screen, right-aligned under the button. */}
      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full z-[70] mt-2 w-[min(17rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden border border-line bg-charcoal/95 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <GlobeIcon className="h-4 w-4 text-fog" />
          <span className="text-[11px] font-semibold tracking-[0.2em] text-fog">
            {t(lang, "nav_language")}
          </span>
        </div>
        <div
          className="overflow-y-auto overscroll-contain"
          style={{ maxHeight: "min(24rem, calc(100dvh - 10rem))" }}
        >
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onLangChange(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200",
                  active
                    ? "bg-graphite text-white"
                    : "text-mist hover:bg-graphite/60 hover:text-white"
                )}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {l.flag}
                </span>
                <span className="flex-1 truncate font-display text-sm font-semibold tracking-wide">
                  {l.label}
                </span>
                {active && <CheckIcon className="h-4 w-4 text-accent" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
