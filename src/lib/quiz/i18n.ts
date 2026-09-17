// ============================================================
// CARVIBES QUIZ — UI translations (Node barrel)
//
// The per-language dictionaries live in ./i18n/<code>.ts. The browser
// never imports this barrel: every quiz string is already merged into the
// central per-language packs in src/lib/i18n/langs/<code>.ts, so the whole
// site — homepage, explore, car pages, stories and the quiz — keeps
// exactly ONE lookup path (t(lang, key)) and ONE fetch per language.
// There is deliberately no second translation system to keep in sync.
//
// This module exists for the Node tooling (scripts/prerender.mjs stamps
// the quiz SEO copy straight from quizDicts.en; scripts/validate-quiz.mjs
// checks every language against the English key set).
// ============================================================
import type { Lang } from "../i18n";
import type { Dict } from "../i18n/dict";

import { dict as en } from "./i18n/en";
import { dict as de } from "./i18n/de";
import { dict as fr } from "./i18n/fr";
import { dict as es } from "./i18n/es";
import { dict as it } from "./i18n/it";
import { dict as pt } from "./i18n/pt";
import { dict as nl } from "./i18n/nl";
import { dict as ar } from "./i18n/ar";
import { dict as ja } from "./i18n/ja";
import { dict as zh } from "./i18n/zh";

export const quizDicts: Record<Lang, Dict> = {
  en,
  de,
  fr,
  es,
  it,
  pt,
  nl,
  ar,
  ja,
  zh,
};
// Re-export for API compatibility with the previous single-file layout
// (FAQ_COUNT is defined in the EN-only ./i18n/en-meta module).
export { FAQ_COUNT } from "./i18n/en-meta";
