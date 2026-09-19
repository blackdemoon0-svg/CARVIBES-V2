// ============================================================
// CARVIBES / MARKETVIBES — presentation formatting
//
// All formatting is locale-aware but deterministic per language, so the
// UI (and anything a crawler reads) stays consistent.
// ============================================================

import type { Lang } from "../i18n";

const LOCALES: Record<Lang, string> = {
  en: "en-GB",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
  ar: "ar",
  ja: "ja-JP",
  zh: "zh-CN",
};

export function localeFor(lang: Lang): string {
  return LOCALES[lang] ?? "en-GB";
}

/**
 * Price formatting: Intl.NumberFormat with the listing's currency but the
 * visitor's numbering/locale conventions. Falls back gracefully for a
 * currency the runtime does not know.
 */
export function formatPrice(value: number | string | null | undefined, currency: string, lang: Lang): string {
  const amount = Number(value) || 0;
  const resolved = currency || "USD";
  try {
    return new Intl.NumberFormat(localeFor(lang), {
      style: "currency",
      currency: resolved,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    try {
      return `${new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 0 }).format(amount)} ${resolved}`;
    } catch {
      return `${amount} ${resolved}`;
    }
  }
}

export function formatNumber(value: number | string | null | undefined, lang: Lang): string {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat(localeFor(lang)).format(amount);
  } catch {
    return String(amount);
  }
}

export function formatMileage(value: number | null | undefined, lang: Lang): string | null {
  if (value === null || value === undefined) return null;
  return `${formatNumber(value, lang)} km`;
}

/**
 * Prices are compared and filtered in a single currency-free space, so
 * the filter UI simply labels the range with the currency most listings
 * use (or the visitor's chosen currency).
 */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string,
  lang: Lang
): string {
  const low = min ? formatPrice(min, currency, lang) : null;
  const high = max ? formatPrice(max, currency, lang) : null;
  if (low && high) return `${low} – ${high}`;
  if (low) return `${low}+`;
  if (high) return `≤ ${high}`;
  return "";
}

/** "2 days ago" in the visitor's language, without a date library. */
export function formatRelativeTime(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "";
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const seconds = Math.round((then - Date.now()) / 1000);
  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];
  try {
    const formatter = new Intl.RelativeTimeFormat(localeFor(lang), { numeric: "auto" });
    let value = seconds;
    for (const division of divisions) {
      if (Math.abs(value) < division.amount) return formatter.format(Math.round(value), division.unit);
      value /= division.amount;
    }
    return formatter.format(Math.round(value), "year");
  } catch {
    return new Date(then).toLocaleDateString(localeFor(lang));
  }
}

export function formatDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace("T", " ");
  }
}

export function formatDateShort(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: "medium" }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Photos are sized before upload; this keeps the label honest. */
export function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
