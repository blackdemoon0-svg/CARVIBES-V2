// ============================================================
// CARVIBES QUIZ — shared UI primitives
// Small presentational pieces reused by the hub, the player, the
// results screen and the achievements panel.
// ============================================================
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { DIFFICULTY_ORDER } from "../../lib/quiz/economy";
import type { Difficulty, QuizCategoryId } from "../../lib/quiz/types";
import { categoryById } from "../../lib/quiz/data/categories";

/** 1 234 → "1,234" with a narrow no-break space for FR, commas elsewhere. */
export function formatNumber(value: number, lang: Lang): string {
  try {
    return new Intl.NumberFormat(
      lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : lang === "de" ? "de-DE" : lang === "it" ? "it-IT" : lang === "pt" ? "pt-PT" : lang === "nl" ? "nl-NL" : lang === "ar" ? "ar-EG" : lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en-US"
    ).format(Math.round(value));
  } catch {
    return String(Math.round(value));
  }
}

export function formatPoints(value: number, lang: Lang): string {
  return `${formatNumber(value, lang)} ⭐`;
}

const DIFFICULTY_STARS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
  insane: 5,
};

const DIFFICULTY_TONE: Record<Difficulty, string> = {
  easy: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  medium: "text-amber-200 border-amber-300/30 bg-amber-300/10",
  hard: "text-orange-300 border-orange-400/30 bg-orange-400/10",
  expert: "text-rose-300 border-rose-400/30 bg-rose-400/10",
  insane: "text-fuchsia-300 border-fuchsia-400/30 bg-fuchsia-400/10",
};

export function DifficultyBadge({
  difficulty,
  lang,
  className,
  compact = false,
}: {
  difficulty: Difficulty;
  lang: Lang;
  className?: string;
  compact?: boolean;
}) {
  const stars = DIFFICULTY_STARS[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold tracking-[0.16em]",
        DIFFICULTY_TONE[difficulty],
        className
      )}
    >
      <span aria-hidden="true" className="tracking-[0.05em]">
        {"★".repeat(stars)}
        <span className="text-white/20">{"★".repeat(5 - stars)}</span>
      </span>
      {!compact && (
        <span>{t(lang, `diff_${difficulty}`).toUpperCase()}</span>
      )}
      <span className="sr-only">
        {t(lang, `diff_${difficulty}`)} —{" "}
        {t(lang, `diff_${difficulty}_sub`)}
      </span>
    </span>
  );
}

export function CategoryBadge({
  category,
  lang,
  className,
}: {
  category: QuizCategoryId;
  lang: Lang;
  className?: string;
}) {
  const cat = categoryById(category);
  if (!cat) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-mist",
        className
      )}
    >
      <span aria-hidden="true" className="text-xs">
        {cat.icon}
      </span>
      {t(lang, cat.nameKey)}
    </span>
  );
}

/** Segmented progress bar — used for XP and for question progress. */
export function SegmentedBar({
  progress,
  segments = 16,
  tone = "accent",
  className,
}: {
  progress: number;
  segments?: number;
  tone?: "accent" | "gold" | "green";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const filled = Math.round(clamped * segments);
  const toneClass =
    tone === "gold"
      ? "bg-gradient-to-r from-amber-300 to-yellow-500"
      : tone === "green"
        ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
        : "bg-gradient-to-r from-accent to-accent-soft";
  return (
    <div
      className={cn("flex h-2 w-full gap-px bg-line/70 p-px", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={cn(
            "flex-1 transition-colors duration-500",
            i < filled ? toneClass : "bg-transparent"
          )}
        />
      ))}
    </div>
  );
}

/** Small uppercase label + value pair used across the HUD and results. */
export function Stat({
  label,
  value,
  icon,
  className,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  icon?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.18em] text-fog">
        {icon && (
          <span aria-hidden="true" className="text-[11px]">
            {icon}
          </span>
        )}
        <span className="truncate">{label}</span>
      </p>
      <p
        className={cn(
          "quiz-tabular mt-1 font-display text-lg font-bold leading-none text-white sm:text-xl",
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Primary action button — the CarVibes red slab. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  type = "button",
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "quiz-sheen inline-flex h-11 items-center justify-center gap-2 bg-accent px-5 text-[11px] font-bold tracking-[0.18em] text-white transition-all duration-300",
        "hover:bg-accent-soft hover:shadow-[0_0_28px_-8px_rgba(227,38,46,0.75)] active:translate-y-px",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        "disabled:cursor-not-allowed disabled:bg-steel disabled:text-white/50 disabled:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Secondary action button — outlined, quiet. */
export function GhostButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 border border-line px-5 text-[11px] font-bold tracking-[0.18em] text-mist transition-all duration-300",
        "hover:border-white/30 hover:text-white active:translate-y-px",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}

export { DIFFICULTY_ORDER };
