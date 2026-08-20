import { useEffect, useState } from "react";
import { LANGS, type Lang } from "../lib/i18n";
import { LogoMark } from "./Logo";
import { ArrowRight } from "./icons";

export default function LanguageScreen({
  onSelect,
}: {
  onSelect: (lang: Lang) => void;
}) {
  // Stage 0 = logo, 1 = subtitle, 2 = buttons
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 500),
      window.setTimeout(() => setStage(2), 950),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6">
      {/* Cinematic backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 42%, rgba(40,40,45,0.55) 0%, rgba(9,9,9,0) 70%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(227,38,46,0.35) 0%, rgba(227,38,46,0) 70%)",
          }}
        />
        {/* Faint grid lines for showroom feel */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />
      </div>

      {/* Logo */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-out ${
          stage >= 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        style={{ transitionDelay: "0ms" }}
      >
        <LogoMark className="h-14 w-14 text-white" />
        <span
          className="mt-5 font-display text-4xl font-extrabold tracking-[0.14em] text-white sm:text-5xl"
        >
          CAR<span className="text-accent">VIBES</span>
        </span>
      </div>

      {/* Welcome */}
      <div
        className={`relative z-10 mt-10 text-center transition-all duration-700 ease-out ${
          stage >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <p className="text-sm font-medium tracking-mega text-mist">WELCOME TO CARVIBES</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
          Choose your language
        </h1>
      </div>

      {/* Language options */}
      <div className="relative z-10 mt-12 flex w-full max-w-sm flex-col gap-3">
        {LANGS.map((l, i) => (
          <button
            key={l.code}
            onClick={() => onSelect(l.code)}
            disabled={stage < 2}
            className={`edge-light group relative flex items-center justify-between overflow-hidden border border-white/10 bg-white/[0.03] px-6 py-5 text-left backdrop-blur-sm transition-all duration-500 ease-out hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.9)] ${
              stage >= 2
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
            style={{
              transitionDelay: `${stage >= 2 ? i * 140 + 200 : 0}ms`,
            }}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-y-100" />
            <span className="flex items-center gap-4">
              <span className="text-2xl" aria-hidden="true">
                {l.flag}
              </span>
              <span className="font-display text-base font-semibold tracking-[0.14em] text-white">
                {l.label}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 -translate-x-2 text-fog opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-white" />
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p
        className={`relative z-10 mt-12 text-xs tracking-[0.2em] text-fog transition-opacity duration-700 ${
          stage >= 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        DISCOVER · FEEL · DRIVE
      </p>
    </div>
  );
}
