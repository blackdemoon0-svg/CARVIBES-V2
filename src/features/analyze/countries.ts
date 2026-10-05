// ============================================================
// CARVIBES ANALYSE — country registry
//
// One source of truth binding: country → flag, currency, mileage
// unit, market profile. The vehicle country drives the listing
// currency + units; the destination country drives conversion +
// import logic. Extensible: add a row, everything follows.
// ============================================================

import type { MileageUnit } from "./types";

export interface AnalyzeCountry {
  code: string;
  flag: string;
  names: { en: string; fr: string; es: string };
  currency: string;
  mileageUnit: MileageUnit;
  /** Shown first in the selector. */
  popular?: boolean;
  /** Rough used-market price level vs the US baseline (indicative). */
  marketIndex: number;
}

export const ANALYZE_COUNTRIES: AnalyzeCountry[] = [
  { code: "US", flag: "🇺🇸", names: { en: "United States", fr: "États-Unis", es: "Estados Unidos" }, currency: "USD", mileageUnit: "miles", popular: true, marketIndex: 1.0 },
  { code: "CA", flag: "🇨🇦", names: { en: "Canada", fr: "Canada", es: "Canadá" }, currency: "CAD", mileageUnit: "km", popular: true, marketIndex: 1.02 },
  { code: "MA", flag: "🇲🇦", names: { en: "Morocco", fr: "Maroc", es: "Marruecos" }, currency: "MAD", mileageUnit: "km", popular: true, marketIndex: 1.18 },
  { code: "FR", flag: "🇫🇷", names: { en: "France", fr: "France", es: "Francia" }, currency: "EUR", mileageUnit: "km", popular: true, marketIndex: 1.08 },
  { code: "DE", flag: "🇩🇪", names: { en: "Germany", fr: "Allemagne", es: "Alemania" }, currency: "EUR", mileageUnit: "km", popular: true, marketIndex: 1.05 },
  { code: "GB", flag: "🇬🇧", names: { en: "United Kingdom", fr: "Royaume-Uni", es: "Reino Unido" }, currency: "GBP", mileageUnit: "miles", popular: true, marketIndex: 1.06 },
  { code: "ES", flag: "🇪🇸", names: { en: "Spain", fr: "Espagne", es: "España" }, currency: "EUR", mileageUnit: "km", popular: true, marketIndex: 1.04 },
  { code: "AE", flag: "🇦🇪", names: { en: "United Arab Emirates", fr: "Émirats arabes unis", es: "Emiratos Árabes Unidos" }, currency: "AED", mileageUnit: "km", popular: true, marketIndex: 0.94 },
  { code: "JP", flag: "🇯🇵", names: { en: "Japan", fr: "Japon", es: "Japón" }, currency: "JPY", mileageUnit: "km", popular: true, marketIndex: 0.9 },
  { code: "IT", flag: "🇮🇹", names: { en: "Italy", fr: "Italie", es: "Italia" }, currency: "EUR", mileageUnit: "km", marketIndex: 1.05 },
  { code: "BE", flag: "🇧🇪", names: { en: "Belgium", fr: "Belgique", es: "Bélgica" }, currency: "EUR", mileageUnit: "km", marketIndex: 1.06 },
  { code: "NL", flag: "🇳🇱", names: { en: "Netherlands", fr: "Pays-Bas", es: "Países Bajos" }, currency: "EUR", mileageUnit: "km", marketIndex: 1.1 },
  { code: "CH", flag: "🇨🇭", names: { en: "Switzerland", fr: "Suisse", es: "Suiza" }, currency: "CHF", mileageUnit: "km", marketIndex: 1.12 },
  { code: "PT", flag: "🇵🇹", names: { en: "Portugal", fr: "Portugal", es: "Portugal" }, currency: "EUR", mileageUnit: "km", marketIndex: 1.07 },
  { code: "AT", flag: "🇦🇹", names: { en: "Austria", fr: "Autriche", es: "Austria" }, currency: "EUR", mileageUnit: "km", marketIndex: 1.07 },
  { code: "LU", flag: "🇱🇺", names: { en: "Luxembourg", fr: "Luxembourg", es: "Luxemburgo" }, currency: "EUR", mileageUnit: "km", marketIndex: 1.06 },
  { code: "SA", flag: "🇸🇦", names: { en: "Saudi Arabia", fr: "Arabie saoudite", es: "Arabia Saudita" }, currency: "SAR", mileageUnit: "km", marketIndex: 0.95 },
  { code: "QA", flag: "🇶🇦", names: { en: "Qatar", fr: "Qatar", es: "Catar" }, currency: "QAR", mileageUnit: "km", marketIndex: 0.95 },
  { code: "KR", flag: "🇰🇷", names: { en: "South Korea", fr: "Corée du Sud", es: "Corea del Sur" }, currency: "KRW", mileageUnit: "km", marketIndex: 0.92 },
  { code: "CN", flag: "🇨🇳", names: { en: "China", fr: "Chine", es: "China" }, currency: "CNY", mileageUnit: "km", marketIndex: 0.9 },
  { code: "TN", flag: "🇹🇳", names: { en: "Tunisia", fr: "Tunisie", es: "Túnez" }, currency: "TND", mileageUnit: "km", marketIndex: 1.22 },
  { code: "DZ", flag: "🇩🇿", names: { en: "Algeria", fr: "Algérie", es: "Argelia" }, currency: "DZD", mileageUnit: "km", marketIndex: 1.25 },
  { code: "EG", flag: "🇪🇬", names: { en: "Egypt", fr: "Égypte", es: "Egipto" }, currency: "EGP", mileageUnit: "km", marketIndex: 1.2 },
  { code: "SN", flag: "🇸🇳", names: { en: "Senegal", fr: "Sénégal", es: "Senegal" }, currency: "XOF", mileageUnit: "km", marketIndex: 1.2 },
  { code: "CI", flag: "🇨🇮", names: { en: "Ivory Coast", fr: "Côte d'Ivoire", es: "Costa de Marfil" }, currency: "XOF", mileageUnit: "km", marketIndex: 1.2 },
  { code: "CM", flag: "🇨🇲", names: { en: "Cameroon", fr: "Cameroun", es: "Camerún" }, currency: "XAF", mileageUnit: "km", marketIndex: 1.22 },
  { code: "TR", flag: "🇹🇷", names: { en: "Turkey", fr: "Turquie", es: "Turquía" }, currency: "TRY", mileageUnit: "km", marketIndex: 1.15 },
  { code: "MX", flag: "🇲🇽", names: { en: "Mexico", fr: "Mexique", es: "México" }, currency: "MXN", mileageUnit: "km", marketIndex: 0.98 },
  { code: "BR", flag: "🇧🇷", names: { en: "Brazil", fr: "Brésil", es: "Brasil" }, currency: "BRL", mileageUnit: "km", marketIndex: 1.1 },
  { code: "ZA", flag: "🇿🇦", names: { en: "South Africa", fr: "Afrique du Sud", es: "Sudáfrica" }, currency: "ZAR", mileageUnit: "km", marketIndex: 1.0 },
];

const BY_CODE = new Map(ANALYZE_COUNTRIES.map((c) => [c.code, c]));

export const DEFAULT_VEHICLE_COUNTRY = "US";
export const DEFAULT_DESTINATION_COUNTRY = "MA";

export function analyzeCountry(code: string | undefined | null): AnalyzeCountry {
  if (code) {
    const found = BY_CODE.get(String(code).toUpperCase());
    if (found) return found;
  }
  return BY_CODE.get(DEFAULT_VEHICLE_COUNTRY)!;
}

export function countryName(code: string, lang: string): string {
  const c = analyzeCountry(code);
  if (lang === "fr") return c.names.fr;
  if (lang === "es") return c.names.es;
  return c.names.en;
}

/** Popular countries first, then alphabetical in the UI language. */
export function sortedAnalyzeCountries(lang: string): AnalyzeCountry[] {
  const name = (c: AnalyzeCountry) =>
    lang === "fr" ? c.names.fr : lang === "es" ? c.names.es : c.names.en;
  return [...ANALYZE_COUNTRIES].sort((a, b) => {
    if (!!a.popular !== !!b.popular) return a.popular ? -1 : 1;
    return name(a).localeCompare(name(b));
  });
}
