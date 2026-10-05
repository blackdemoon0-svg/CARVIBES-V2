import { useEffect, useState } from "react";
import { t, type Lang } from "../../../lib/i18n";

const STEPS = ["az_prog_visual", "az_prog_tech", "az_prog_price", "az_prog_import", "az_prog_verdict"];

export default function AnalysisProgress({ lang, signalCount }: { lang: Lang; signalCount: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const timers = STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), 450 * (i + 1)));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-16 sm:py-24" role="status" aria-live="polite">
      <div className="az-glass relative overflow-hidden rounded-2xl p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px overflow-hidden">
          <div className="az-scanline h-full w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>
        <p className="mb-2 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
          <span className="h-px w-8 bg-accent" />
          CARVIBES ANALYSE
        </p>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          {t(lang, "az_progress_title")}
        </h2>
        <p className="az-thinking mt-2 text-sm text-mist">
          {t(lang, "az_progress_note", { count: signalCount })}
        </p>

        <div className="mt-8 space-y-3">
          {STEPS.map((key, i) => {
            const done = step > i;
            const active = step === i;
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] transition-all duration-300 ${
                    done
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                      : active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-line text-fog"
                  }`}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8.5l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={active ? "az-thinking" : ""}>●</span>
                  )}
                </span>
                <span className={`text-sm ${done || active ? "text-white" : "text-fog"}`}>
                  {t(lang, key)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 h-1 overflow-hidden rounded-full bg-graphite">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, (step / STEPS.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
