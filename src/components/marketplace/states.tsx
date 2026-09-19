// ============================================================
// CARVIBES / MARKETVIBES — states
//
// Every empty / loading / error / unauthorized situation gets a real,
// translated, branded panel — the marketplace never renders a blank
// screen. Skeletons reserve the exact space of the content they replace,
// so loading never shifts the layout (CLS 0).
// ============================================================

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { ArrowRight, CameraIcon, SearchIcon } from "../icons";

// ------------------------------------------------------------
// Skeletons
// ------------------------------------------------------------
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden border border-line bg-charcoal", className)} aria-hidden="true">
      <div className="aspect-[16/11] w-full animate-pulse bg-graphite" />
      <div className="space-y-3 border-t border-line p-5">
        <div className="h-4 w-2/3 animate-pulse bg-graphite" />
        <div className="h-6 w-1/3 animate-pulse bg-graphite" />
        <div className="h-3 w-1/2 animate-pulse bg-graphite" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 flex-1 animate-pulse bg-graphite" />
          <div className="h-9 flex-1 animate-pulse bg-graphite" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6, lang }: { count?: number; lang: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t(lang, "mk_loading")}</span>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DetailSkeleton({ lang }: { lang: Lang }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t(lang, "mk_loading")}</span>
      <div className="h-4 w-52 animate-pulse bg-graphite" />
      <div className="mt-6 aspect-[16/10] w-full animate-pulse bg-graphite md:aspect-[16/7]" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse bg-graphite" />
          <div className="h-10 w-1/3 animate-pulse bg-graphite" />
          <div className="h-32 w-full animate-pulse bg-graphite" />
        </div>
        <div className="space-y-4">
          <div className="h-40 w-full animate-pulse bg-graphite" />
          <div className="h-12 w-full animate-pulse bg-graphite" />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Empty / error / unauthorized panels
// ------------------------------------------------------------
export function StatePanel({
  eyebrow,
  title,
  description,
  icon,
  children,
  tone = "neutral",
  iconTone = "neutral",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  tone?: "neutral" | "error";
  /** Accent styling for launch/onboarding panels. */
  iconTone?: "neutral" | "accent";
}) {
  return (
    <div
      className={cn(
        "edge-light mx-auto flex max-w-2xl flex-col items-center border px-6 py-14 text-center",
        tone === "error" ? "border-accent/40 bg-accent/[0.05]" : "border-line bg-charcoal"
      )}
      role={tone === "error" ? "alert" : undefined}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center border",
          tone === "error"
            ? "border-accent/50 text-accent"
            : iconTone === "accent"
              ? "border-accent/40 bg-accent/10 text-accent-soft"
              : "border-line text-mist"
        )}
        aria-hidden="true"
      >
        {icon ?? <SearchIcon className="h-5 w-5" />}
      </span>
      {eyebrow && (
        <p className="mt-5 text-[10px] font-semibold tracking-[0.28em] text-fog">{eyebrow.toUpperCase()}</p>
      )}
      <h2 className="mt-2 font-display text-2xl font-semibold text-white">{title}</h2>
      {description && <p className="mt-3 max-w-lg text-sm leading-relaxed text-mist">{description}</p>}
      {children && <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}

export function EmptyListings({ lang, onReset }: { lang: Lang; onReset?: () => void }) {
  return (
    <StatePanel
      eyebrow={t(lang, "mk_empty_eyebrow")}
      title={t(lang, "mk_empty_title")}
      description={t(lang, "mk_empty_desc")}
    >
      {onReset && (
        <button type="button" onClick={onReset} className="cv-btn cv-btn-sm cv-btn-outline h-11 px-6 text-[11px] font-semibold tracking-[0.18em]">
          {t(lang, "mk_reset_filters")}
        </button>
      )}
      <Link to="/marketplace/sell" className="cv-btn cv-btn-sm cv-btn-primary h-11 px-6 text-[11px] font-semibold tracking-[0.18em]">
        {t(lang, "mk_sell_cta")}
      </Link>
    </StatePanel>
  );
}

/**
 * The marketplace with no listings at all.
 *
 * Deliberately different from EmptyListings ("no cars match your search"):
 * there is no filter to clear here, and the one useful action is to list
 * the first car. The CTA is a real <a href> so it stays crawlable and
 * works without JavaScript.
 */
export function EmptyMarketplace({ lang }: { lang: Lang }) {
  return (
    <StatePanel
      eyebrow={t(lang, "mk_zero_eyebrow")}
      title={t(lang, "mk_zero_title")}
      description={t(lang, "mk_zero_desc")}
      icon={<CameraIcon className="h-5 w-5" />}
      iconTone="accent"
    >
      <Link
        to="/marketplace/sell"
        className="cv-btn cv-btn-sm cv-btn-primary h-11 px-6 text-[11px] font-semibold tracking-[0.18em]"
      >
        {t(lang, "mk_sell_cta")}
      </Link>
    </StatePanel>
  );
}

export function ErrorState({ lang, onRetry }: { lang: Lang; onRetry?: () => void }) {
  return (
    <StatePanel
      tone="error"
      icon={<span aria-hidden="true">⚠</span>}
      eyebrow={t(lang, "mk_error_eyebrow")}
      title={t(lang, "mk_error_title")}
      description={t(lang, "mk_error_desc")}
    >
      <Link to="/marketplace" className="cv-btn cv-btn-sm cv-btn-outline h-11 px-6 text-[11px] font-semibold tracking-[0.18em]">
        {t(lang, "mk_back_to_marketplace")}
      </Link>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cv-btn cv-btn-sm cv-btn-ghost h-11 px-6 text-[11px] font-semibold tracking-[0.18em]"
        >
          {t(lang, "mk_retry")}
        </button>
      )}
    </StatePanel>
  );
}

export function NotFoundState({ lang }: { lang: Lang }) {
  return (
    <StatePanel
      eyebrow={t(lang, "mk_404_eyebrow")}
      title={t(lang, "mk_404_title")}
      description={t(lang, "mk_404_desc")}
    >
      <Link to="/marketplace" className="cv-btn cv-btn-sm cv-btn-primary h-11 px-6 text-[11px] font-semibold tracking-[0.18em]">
        {t(lang, "mk_back_to_marketplace")}
      </Link>
    </StatePanel>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  /**
   * Facet pages have no hero headline, so their section heading IS the
   * page's single H1 (the prerendered HTML ships the same one).
   */
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[10px] font-semibold tracking-[0.3em] text-fog">{eyebrow.toUpperCase()}</p>}
        <Tag className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">{title}</Tag>
      </div>
      {action}
    </div>
  );
}

export function SellBand({ lang }: { lang: Lang }) {
  return (
    <section className="relative overflow-hidden border border-line bg-charcoal">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(80% 120% at 100% 0%, rgba(227,38,46,0.18) 0%, transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-start gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-accent">{t(lang, "mk_sell_band_eyebrow")}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">{t(lang, "mk_sell_band_title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">{t(lang, "mk_sell_band_desc")}</p>
        </div>
        <Link
          to="/marketplace/sell"
          className="cv-btn cv-btn-primary group inline-flex h-13 items-center gap-3 px-7 text-[12px] font-semibold tracking-[0.18em]"
        >
          {t(lang, "mk_sell_cta")}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
