// Small EN-only derived module. QuizSeoSections (inside the quiz chunk)
// imports FAQ_COUNT from HERE rather than from the quiz/i18n barrel, so
// the quiz chunk never drags the nine translated dictionaries along.
import { dict as en } from "./en";

/**
 * Number of FAQ entries the dictionaries define. Derived from the data so
 * the UI, the prerendered HTML and the FAQ structured data can never
 * disagree about how many questions there are.
 */
export const FAQ_COUNT = Object.keys(en).filter((key) =>
  /^quiz_faq_\d+_q$/.test(key)
).length;
