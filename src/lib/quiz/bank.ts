// ============================================================
// CARVIBES QUIZ — question-bank consumers
//
// Everything that needs the REAL questions at runtime lives here:
// seeded selection, the daily rotation, and the true max-reward
// computation. The hub (QuizPage / QuizCard) never imports this
// module — it reads its headline figures from the build-time
// generated ./counts.ts instead — so the ~150 KB bank only rides
// along the lazy player/run chunk (src/lib/quiz/run.ts). Splitting
// it wrongly is caught by smoke-quiz + validate-quiz, which compare
// the generated numbers against computeMaxReward() from this file.
// ============================================================
import type { Difficulty, QuizDef } from "./types";
import { questionsIn } from "./data";
import { POINTS_PER_CORRECT } from "./economy";
import { DAILY_COUNT, DAILY_POOL, hashSeed } from "./quizzes";

/** Small, fast PRNG so a seed always produces the same question order. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick `count` questions for a quiz.
 *
 * Selection order: exact category first, then the rest of the pool, so a
 * category quiz really feels like that category even when the bank for
 * one difficulty band is still growing.
 */
export function selectQuestions(quiz: QuizDef, seed: number, exclude: string[] = []) {
  const { categories, difficulties } = quiz.pool;
  const excluded = new Set(exclude);
  const pool = questionsIn(categories, difficulties, {
    visualOnly: quiz.visualOnly,
  }).filter((q) => !excluded.has(q.id));

  const primary = pool.filter((q) => q.category === quiz.category);
  const secondary = pool.filter((q) => q.category !== quiz.category);

  const shuffle = <T,>(items: T[]): T[] => {
    const rand = mulberry32(seed + items.length);
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const ordered = [...shuffle(primary), ...shuffle(secondary)];
  return ordered.slice(0, Math.min(quiz.count, ordered.length));
}

/**
 * The most points a perfect run of this quiz can pay out, computed from
 * the real question bank (each question pays its own difficulty's value).
 * Reference implementation — the hub's generated MAX_REWARDS snapshot is
 * built from exactly this function.
 */
export function computeMaxReward(quiz: QuizDef): number {
  const pool = questionsIn(quiz.pool.categories, quiz.pool.difficulties, {
    visualOnly: quiz.visualOnly,
  }).sort((a, b) => POINTS_PER_CORRECT[b.difficulty] - POINTS_PER_CORRECT[a.difficulty]);
  return pool.slice(0, quiz.count).reduce((sum, q) => sum + POINTS_PER_CORRECT[q.difficulty], 0);
}

/** Today's five questions — identical for every player on a given day. */
export function dailyQuestions(dayKey: string, count: number = DAILY_COUNT) {
  const seed = hashSeed(`daily:${dayKey}`);
  const pool = questionsIn(DAILY_POOL.categories, DAILY_POOL.difficulties as Difficulty[]);
  const rand = mulberry32(seed);
  const out = pool.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, Math.min(count, out.length));
}
