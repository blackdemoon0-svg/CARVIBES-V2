import type { ReactNode } from "react";
import { t, type Lang } from "../../../lib/i18n";
import type { EvidenceStatus, I18nText, ObservationLevel } from "../types";

/** Resolve an engine-produced translated sentence. */
export function Txt({ lang, text }: { lang: Lang; text: I18nText }) {
  return <>{t(lang, text.key, text.params)}</>;
}

export function Section({
  id,
  index,
  title,
  sub,
  children,
  className = "",
}: {
  id: string;
  index: string;
  title: string;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`az-glass az-rise scroll-mt-24 rounded-2xl p-5 sm:p-7 ${className}`}>
      <header className="mb-5">
        <p className="mb-1.5 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-accent/60" aria-hidden />
        </p>
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{title}</h2>
        {sub && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mist">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

const LEVEL_CLASS: Record<ObservationLevel, string> = {
  LOW: "az-pill-low",
  MEDIUM: "az-pill-medium",
  HIGH: "az-pill-high",
  CRITICAL: "az-pill-critical",
};

export function LevelPill({ lang, level }: { lang: Lang; level: ObservationLevel }) {
  return <span className={`az-pill ${LEVEL_CLASS[level]}`}>{t(lang, `az_level_${level}`)}</span>;
}

const STATUS_CLASS: Record<EvidenceStatus, string> = {
  OBSERVED: "az-pill-high",
  PROBABLE: "az-pill-medium",
  TO_VERIFY: "az-pill-low",
  UNVERIFIABLE: "az-pill-critical",
};

export function StatusPill({ lang, status }: { lang: Lang; status: EvidenceStatus }) {
  const dot =
    status === "OBSERVED" ? "●" : status === "PROBABLE" ? "◐" : status === "TO_VERIFY" ? "○" : "✕";
  return (
    <span className={`az-pill ${STATUS_CLASS[status]}`}>
      <span aria-hidden>{dot}</span> {t(lang, `az_status_${status}`)}
    </span>
  );
}

export function ScoreBar({ value, max = 100 }: { value: number | null; max?: number }) {
  if (value == null) return <span className="text-sm text-fog">—</span>;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color =
    value >= 75 ? "from-emerald-400 to-emerald-300" : value >= 55 ? "from-accent to-accent-soft" : value >= 40 ? "from-amber-400 to-orange-300" : "from-red-400 to-red-300";
  return (
    <span className="flex items-center gap-2.5">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-graphite sm:w-32">
        <span className={`block h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="font-display text-sm font-bold text-white">{value}</span>
    </span>
  );
}

export function ScoreRing({ value, size = 148 }: { value: number; size?: number }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const color = value >= 75 ? "#34d399" : value >= 55 ? "#24c8f3" : value >= 40 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="az-ring" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="az-ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          className="az-ring-value"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-4xl font-bold text-white">{value}</p>
        <p className="text-[10px] tracking-mega text-fog">/ 100</p>
      </div>
    </div>
  );
}
