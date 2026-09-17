// ============================================================
// CARVIBES QUIZ — run types + hub-safe helpers
//
// Tiny module with NO access to the question bank or the car dataset.
// The hub, the player and the results screen share these shapes; the
// heavy run-preparation code in ./run.ts depends on the bank and must
// therefore stay out of the statically-imported graph of hub-only
// components (bundle budget: the /car-quiz hub renders at ~40 KB gz
// without it — measured +0.5 s LCP / +120 ms TBT with it, sim Moto G4).
// ============================================================
import type { Difficulty, QuizCategoryId, LS } from "./types";
import type { Lang } from "../i18n";
import { quizById } from "./quizzes";

export interface PreparedOption {
  text: LS;
  correct: boolean;
}

export interface PreparedQuestion {
  id: string;
  category: QuizCategoryId;
  difficulty: Difficulty;
  prompt: LS;
  hint: LS;
  why: LS;
  image: string | null;
  carId: string | null;
  /**
   * True when showing the real photo would give the answer away (guess-
   * the-car and guess-the-price questions). The player then sees a
   * heavily treated "silhouette" instead of the actual car.
   */
  spoiler: boolean;
  /** Accessible name for the image, when it is safe to reveal it. */
  imageName: string | null;
  options: PreparedOption[];
  /** Points for a correct answer to this specific question. */
  reward: number;
  /** XP for a correct answer to this specific question. */
  xp: number;
}

export interface RunSpec {
  key: string;
  isDaily: boolean;
  quizId: string | null;
  title: LS;
  blurb: LS;
  difficulty: Difficulty;
  premium: boolean;
  questions: PreparedQuestion[];
  maxPoints: number;
  maxXp: number;
  /** Streak bonuses still reachable within this run. */
  streakBonuses: { at: number; points: number }[];
}

/** Which question to ask next when the player picks "NEXT QUIZ". */
export function nextQuizKey(currentKey: string, unlockedIds: string[]): string | null {
  const order = ["silhouette", "warm-up-lap", "pit-lane", "price-tag", "jdm-cult", "german-precision", "silent-power", "first-class", "italian-passion", "apex-predators", "the-gauntlet"];
  const free = order.filter((id) => id !== currentKey && quizById(id));
  const unlockedPremium = unlockedIds.filter((id) => id !== currentKey && quizById(id));
  const pool = [...free, ...unlockedPremium];
  return pool.length ? pool[0] : null;
}

/** Localised text helper for any run field (falls back to English). */
export function pick(localised: LS, lang: Lang): string {
  return localised[lang] ?? localised.en;
}
