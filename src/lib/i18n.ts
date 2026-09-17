// ============================================================
// CARVIBES — I18N CORE  (single `t(lang, key)` lookup for the whole app)
//
// PERFORMANCE ARCHITECTURE
// ------------------------
// Translations used to be ONE ~350 KB module statically imported by every
// component — so the browser paid all 10 languages (base UI + quiz) before
// it could paint anything, and that was ~50 % of the entry bundle.
//
// Now the dictionaries live in `./i18n/langs/<code>.ts` (each file = the
// base UI dict merged with the quiz dict — same merge order as the old
// central `dicts` object). Only EN is part of the entry bundle: it is the
// fallback every lookup may need. The visitor's detected language is
// fetched as its own hashed chunk via `ensureLocale()` (see src/App.tsx,
// which keeps the boot splash up until the pack is registered, so users
// never see an English flash).
//
// Node tooling (prerender, validation) uses `./i18n/all-dicts.ts` and
// `./quiz/i18n.ts` instead — the browser never imports those.
//
// `t()` stays 100 % synchronous; unregistered/incomplete languages fall
// back to English exactly like before.
// ============================================================

export type Lang =
  | "fr"
  | "en"
  | "es"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "ar"
  | "ja"
  | "zh";

export interface LangDef {
  code: Lang;
  /** Native language name (shown in the selector). */
  label: string;
  flag: string;
  /** Right-to-left script (Arabic). */
  rtl?: boolean;
}

import type { Dict } from "./i18n/dict";
// English is the only dictionary the entry bundle ships: it is the fallback
// every other language may need, and the default language for visitors.
import enPack from "./i18n/langs/en";

// Order matters: English first (default), then Deutsch — Germany is one of
// the world's most important automotive markets — followed by the rest.
export const LANGS: LangDef[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const LANG_CODES = new Set<Lang>(LANGS.map((l) => l.code));

export const RTL_LANGS: Lang[] = LANGS.filter((l) => l.rtl).map((l) => l.code);

export function isRtl(lang: Lang): boolean {
  return RTL_LANGS.includes(lang);
}

export const LANGUAGE_KEY = "carvibes.lang";

export function getStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LANGUAGE_KEY);
  return v && LANG_CODES.has(v as Lang) ? (v as Lang) : null;
}

export function storeLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_KEY, lang);
}

/**
 * Pick a sensible default language without ever blocking the visitor:
 * stored preference first, then the browser language, then English.
 */
export function detectLang(): Lang {
  const stored = getStoredLang();
  if (stored) return stored;
  if (typeof navigator !== "undefined" && navigator.language) {
    const base = navigator.language.toLowerCase().split("-")[0];
    const match = LANGS.find((l) => l.code === base);
    if (match) return match.code;
  }
  return "en";
}

// ------------------------------------------------------------
// Locale registry
// ------------------------------------------------------------
// `en` is always loaded (statically). Every other language is one
// dynamic import away; the bundler gives each pack its own hashed
// chunk, so a visitor never downloads a language they do not speak.
const dicts: Record<string, Dict> = {
  // base + quiz already merged inside ./i18n/langs/en
  en: enPack,
};

const LOADERS: Partial<Record<Lang, () => Promise<{ default: Dict }>>> = {
  de: () => import("./i18n/langs/de"),
  fr: () => import("./i18n/langs/fr"),
  es: () => import("./i18n/langs/es"),
  it: () => import("./i18n/langs/it"),
  pt: () => import("./i18n/langs/pt"),
  nl: () => import("./i18n/langs/nl"),
  ar: () => import("./i18n/langs/ar"),
  ja: () => import("./i18n/langs/ja"),
  zh: () => import("./i18n/langs/zh"),
};

const loading = new Map<Lang, Promise<void>>();

/** True when the language's dictionary is available for `t()`. */
export function isLocaleLoaded(lang: Lang): boolean {
  return lang === "en" || Boolean(dicts[lang]);
}

/**
 * Load a language pack on demand and register it. Resolves immediately for
 * English and for already-loaded languages; a missing / blocked dictionary
 * resolves to the English fallback instead of rejecting, so the UI can
 * never be stuck. Concurrent calls share one in-flight fetch.
 */
export function ensureLocale(lang: Lang): Promise<void> {
  if (isLocaleLoaded(lang)) return Promise.resolve();
  let p = loading.get(lang);
  if (!p) {
    const load = LOADERS[lang];
    if (!load) {
      // Unknown code (should not happen — LANGS gates it): English wins.
      dicts[lang] = dicts.en;
      return Promise.resolve();
    }
    p = load()
      .then((m) => {
        if (!dicts[lang]) dicts[lang] = m.default;
      })
      .catch(() => {
        dicts[lang] = dicts.en;
      });
    loading.set(lang, p);
  }
  return p;
}

export function t(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  // Falls back to the *merged* English dictionary, so feature strings
  // (CarVibes Quiz, …) resolve even in a language that lacks them — and
  // while a non-English pack is still downloading.
  const raw = dicts[lang]?.[key] ?? dicts.en?.[key] ?? key;
  if (!params) return raw;
  // {token} interpolation for the few dynamic strings (costs, counters).
  return raw.replace(/\{(\w+)\}/g, (match, token: string) =>
    params[token] === undefined ? match : String(params[token])
  );
}
