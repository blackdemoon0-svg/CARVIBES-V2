// ============================================================
// CARVIBES QUIZ — question bank
//
// Single entry point for every question in the game. Splitting the bank
// across category files keeps each file reviewable; this module merges
// them and exposes lookup helpers used by the quiz resolver.
//
// Adding hundreds of questions later means appending to (or adding a
// new) data file below — nothing else changes.
// ============================================================
import { guessAndPrice } from "./q-visual";
import { knowledgeAndPerformance } from "./q-knowledge-performance";
import { germanAndJdm } from "./q-german-jdm";
import { italianSuperElectricLuxury } from "./q-culture";
import type { Difficulty, QuizCategoryId, QuizQuestion } from "../types";

export const QUESTIONS: QuizQuestion[] = [
  ...guessAndPrice,
  ...knowledgeAndPerformance,
  ...germanAndJdm,
  ...italianSuperElectricLuxury,
];

export const QUESTION_MAP: Map<string, QuizQuestion> = new Map(
  QUESTIONS.map((q) => [q.id, q])
);

/**
 * Defensive filter: a malformed question (wrong number of options, an
 * out-of-range answer index, …) can never reach the player. Data errors
 * are surfaced by `npm run validate:quiz` at build time; this guard only
 * makes sure the running app degrades gracefully instead of breaking.
 */
export function isValidQuestion(q: QuizQuestion): boolean {
  return (
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    Number.isInteger(q.answer) &&
    q.answer >= 0 &&
    q.answer < q.options.length &&
    !!q.prompt?.en &&
    !!q.hint?.en &&
    !!q.why?.en
  );
}

const VALID = QUESTIONS.filter(isValidQuestion);

export const VALID_QUESTIONS: QuizQuestion[] = VALID;

export function questionById(id: string): QuizQuestion | undefined {
  return QUESTION_MAP.get(id);
}

export function questionsIn(
  categories: QuizCategoryId[],
  difficulties: Difficulty[],
  opts: { visualOnly?: boolean } = {}
): QuizQuestion[] {
  const cats = new Set<string>(categories);
  const diffs = new Set<string>(difficulties);
  return VALID.filter((q) => {
    if (!cats.has(q.category) || !diffs.has(q.difficulty)) return false;
    if (opts.visualOnly && !q.carId && !q.image) return false;
    return true;
  });
}

// Development-only sanity net: a data mistake should be impossible to
// miss while working on the bank. `import.meta.env` is Vite-specific and
// not part of the project's TS types, hence the defensive cast.
const isDevBuild = (() => {
  try {
    return !!(import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  } catch {
    return false;
  }
})();

if (isDevBuild) {
  const dropped = QUESTIONS.length - VALID.length;
  if (dropped > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[CarVibes Quiz] ${dropped} malformed question(s) ignored.`);
  }
  const ids = new Set<string>();
  for (const q of QUESTIONS) {
    if (ids.has(q.id)) {
      // eslint-disable-next-line no-console
      console.warn(`[CarVibes Quiz] Duplicate question id: ${q.id}`);
    }
    ids.add(q.id);
  }
}
