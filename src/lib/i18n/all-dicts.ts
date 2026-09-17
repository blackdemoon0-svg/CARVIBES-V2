// CarVibes — all base dictionaries in one module, for Node tooling only
// (scripts/validate-quiz.mjs, …). The browser never imports this file:
// src/lib/i18n.ts loads language packs on demand via ./langs/<code>.
import type { Dict } from "./dict";
import { dict as en } from "./base/en";
import { dict as de } from "./base/de";
import { dict as fr } from "./base/fr";
import { dict as es } from "./base/es";
import { dict as it } from "./base/it";
import { dict as pt } from "./base/pt";
import { dict as nl } from "./base/nl";
import { dict as ar } from "./base/ar";
import { dict as ja } from "./base/ja";
import { dict as zh } from "./base/zh";

export const baseDicts: Record<string, Dict> = {
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

export default baseDicts;
