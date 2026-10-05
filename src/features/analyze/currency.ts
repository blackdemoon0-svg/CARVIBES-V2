// ============================================================
// CARVIBES ANALYSE — centralized currency + units layer
//
// Every price, conversion and mileage display in the module MUST go
// through this file. Components never hard-code a rate or a symbol.
//
// Rates are INDICATIVE static references (base USD) so the module
// works fully offline. Architecture is ready for live rates:
// replace `getRates()` with a fetched table — same shape.
// ============================================================

import type { MileageUnit } from "./types";

export interface CurrencyMeta {
  code: string;
  symbol: string;
  /** Decimals used when formatting. */
  decimals: number;
  /** BCP-47 locale used for grouping (kept Latin digits everywhere). */
  locale: string;
}

export const CURRENCIES: Record<string, CurrencyMeta> = {
  USD: { code: "USD", symbol: "$", decimals: 0, locale: "en-US" },
  CAD: { code: "CAD", symbol: "CA$", decimals: 0, locale: "en-CA" },
  EUR: { code: "EUR", symbol: "€", decimals: 0, locale: "fr-FR" },
  GBP: { code: "GBP", symbol: "£", decimals: 0, locale: "en-GB" },
  AED: { code: "AED", symbol: "AED", decimals: 0, locale: "en-AE" },
  MAD: { code: "MAD", symbol: "DH", decimals: 0, locale: "fr-MA" },
  JPY: { code: "JPY", symbol: "¥", decimals: 0, locale: "ja-JP" },
  CHF: { code: "CHF", symbol: "CHF", decimals: 0, locale: "de-CH" },
  CNY: { code: "CNY", symbol: "¥", decimals: 0, locale: "zh-CN" },
  KRW: { code: "KRW", symbol: "₩", decimals: 0, locale: "ko-KR" },
  SAR: { code: "SAR", symbol: "SAR", decimals: 0, locale: "en-SA" },
  QAR: { code: "QAR", symbol: "QAR", decimals: 0, locale: "en-QA" },
  TND: { code: "TND", symbol: "DT", decimals: 0, locale: "fr-TN" },
  DZD: { code: "DZD", symbol: "DA", decimals: 0, locale: "fr-DZ" },
  EGP: { code: "EGP", symbol: "E£", decimals: 0, locale: "en-EG" },
  XOF: { code: "XOF", symbol: "CFA", decimals: 0, locale: "fr-SN" },
  XAF: { code: "XAF", symbol: "FCFA", decimals: 0, locale: "fr-CM" },
  TRY: { code: "TRY", symbol: "₺", decimals: 0, locale: "tr-TR" },
  MXN: { code: "MXN", symbol: "MX$", decimals: 0, locale: "es-MX" },
  BRL: { code: "BRL", symbol: "R$", decimals: 0, locale: "pt-BR" },
  ZAR: { code: "ZAR", symbol: "R", decimals: 0, locale: "en-ZA" },
};

export function currencyMeta(code: string): CurrencyMeta {
  return CURRENCIES[code] ?? { code, symbol: code, decimals: 0, locale: "en-US" };
}

/** Indicative units of currency per 1 USD. */
const STATIC_RATES_PER_USD: Record<string, number> = {
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  MAD: 10.05,
  JPY: 149,
  CHF: 0.89,
  CNY: 7.2,
  KRW: 1340,
  SAR: 3.75,
  QAR: 3.64,
  TND: 3.15,
  DZD: 134,
  EGP: 48.5,
  XOF: 603,
  XAF: 603,
  TRY: 32.5,
  MXN: 18.4,
  BRL: 5.4,
  ZAR: 18.2,
};

export const RATES_LABEL = "indicative · Oct 2026";

/** Swap this for a live fetch later — same return shape. */
export function getRates(): Record<string, number> {
  return STATIC_RATES_PER_USD;
}

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> = getRates()
): number | null {
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate || !Number.isFinite(amount)) return null;
  return (amount / fromRate) * toRate;
}

/** Round to a human-friendly step depending on magnitude. */
export function roundPrice(value: number): number {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return Math.round(value / 10_000) * 10_000;
  if (abs >= 100_000) return Math.round(value / 1_000) * 1_000;
  if (abs >= 20_000) return Math.round(value / 100) * 100;
  if (abs >= 2_000) return Math.round(value / 50) * 50;
  return Math.round(value);
}

export function formatMoney(amount: number, currency: string): string {
  const meta = currencyMeta(currency);
  const grouped = new Intl.NumberFormat(meta.locale, {
    maximumFractionDigits: meta.decimals,
    minimumFractionDigits: meta.decimals,
  }).format(amount);
  // Prefix symbols ($, €, £, ¥…) vs suffix codes (DH, CFA, AED…).
  const prefix = ["$", "€", "£", "¥", "₩", "₺", "R$", "R", "CA$", "MX$", "E£"].includes(meta.symbol);
  return prefix ? `${meta.symbol}${grouped}` : `${grouped} ${meta.symbol}`;
}

export function formatRange(
  low: number | null,
  high: number | null,
  currency: string
): string | null {
  if (low == null || high == null) return null;
  return `${formatMoney(roundPrice(low), currency)} – ${formatMoney(roundPrice(high), currency)}`;
}

// ------------------------------------------------------------
// Mileage units
// ------------------------------------------------------------

export const KM_PER_MILE = 1.60934;

export function toKm(value: number, unit: MileageUnit): number {
  return unit === "miles" ? value * KM_PER_MILE : value;
}

export function fromKm(km: number, unit: MileageUnit): number {
  return unit === "miles" ? km / KM_PER_MILE : km;
}

export function formatMileage(value: number, unit: MileageUnit, lang = "en"): string {
  const grouped = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  return unit === "miles" ? `${grouped} mi` : `${grouped} km`;
}

export function mileageUnitLabel(unit: MileageUnit, lang = "en"): string {
  if (lang === "fr") return unit === "miles" ? "miles" : "km";
  if (lang === "es") return unit === "miles" ? "millas" : "km";
  return unit === "miles" ? "miles" : "km";
}
