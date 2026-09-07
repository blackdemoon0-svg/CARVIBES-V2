// ============================================================
// CARVIBES QUIZ — shared data model
//
// Everything the game renders (quizzes, cards, rewards, filters) is
// derived from this structured data. Nothing is hardcoded into the UI,
// so new questions / quizzes / categories can be added without touching
// a single component.
// ============================================================
import type { Lang } from "../i18n";

/**
 * A localised string.
 *
 * English is always required; every other language is optional and falls
 * back to English through `tl()`. Question content is authored in the
 * three fully supported CarVibes languages (EN / FR / ES) — proper nouns
 * such as car and engine names are identical in every language.
 */
export type LS = { en: string } & Partial<Record<Lang, string>>;

/** Resolve a localised string for a language, falling back to English. */
export function tl(lang: Lang, value: LS | undefined): string {
  if (!value) return "";
  return value[lang] ?? value.en ?? "";
}

/** Authoring helper: en / fr / es triple. */
export type Tri = [string, string, string];
export const tri = ([en, fr, es]: Tri): LS => ({ en, fr, es });

export const DIFFICULTIES = [
  "easy",
  "medium",
  "hard",
  "expert",
  "insane",
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const CATEGORY_IDS = [
  "guess",
  "knowledge",
  "performance",
  "price",
  "supercars",
  "german",
  "jdm",
  "italian",
  "electric",
  "luxury",
] as const;
export type QuizCategoryId = (typeof CATEGORY_IDS)[number];

export interface QuizCategory {
  id: QuizCategoryId;
  /** Emoji badge — kept in data so categories can be added without UI edits. */
  icon: string;
  /** Key into the central i18n dictionary (translated in every language). */
  nameKey: string;
  blurbKey: string;
}

/** Car-database fields a question may be validated against. */
export type FactField =
  | "hp"
  | "zeroToHundred"
  | "topSpeed"
  | "weight"
  | "price"
  | "year"
  | "engine"
  | "drivetrain";

export interface QuizQuestion {
  id: string;
  category: QuizCategoryId;
  difficulty: Difficulty;
  prompt: LS;
  /** Exactly four plausible choices; only `answer` is correct. */
  options: LS[];
  /** Index into `options`. */
  answer: number;
  /** Nudge that helps without revealing the answer. */
  hint: LS;
  /** Short explanation shown after the answer is locked in. */
  why: LS;
  /** CarVibes car this question is about (drives the internal link). */
  carId?: string;
  /** Optional hero image. Falls back to the linked car's image. */
  image?: string;
  /**
   * Optional machine-checkable claim: the validator asserts the correct
   * option matches this value in the real CarVibes car database, so a
   * specification can never silently drift out of sync with the site.
   */
  fact?: { carId: string; field: FactField };
  /**
   * Figures this question relies on — quoted in the prompt ("800 hp") or
   * implied by the correct answer ("the Elise is the lightest"). Each one
   * is checked against the linked car in the database by the validator,
   * so a question can never contradict the specs published on CarVibes.
   */
  claims?: { field: FactField; value: number | string }[];
}

export interface QuizDef {
  id: string;
  title: LS;
  blurb: LS;
  /** Primary category — used for the card badge and the category filter. */
  category: QuizCategoryId;
  difficulty: Difficulty;
  /** How many questions a single run contains. */
  count: number;
  /** Question pool. Selection is seeded, so runs differ but stay fair. */
  pool: { categories: QuizCategoryId[]; difficulties: Difficulty[] };
  /** Only pick questions that carry an image. */
  visualOnly?: boolean;
  premium?: boolean;
  /** Unlock cost in CarVibes points. */
  cost?: number;
  /** Shown at the top of the hub. */
  featured?: boolean;
  /** The daily rotation draws from this pool. */
  daily?: boolean;
}

/** One finished run, as recorded on the player profile. */
export interface QuizRecord {
  quizId: string;
  score: number;
  total: number;
  points: number;
  xp: number;
  bestStreak: number;
  plays: number;
  /** Local date (YYYY-MM-DD) of the last completion. */
  lastPlayed: string;
}

export interface Achievement {
  id: string;
  icon: string;
  nameKey: string;
  descKey: string;
  points: number;
  xp: number;
  /** Evaluated after every run with the freshly updated player state. */
  test: (p: PlayerState, ctx: RunContext) => boolean;
}

/** Facts about the run that just finished (used by achievement tests). */
export interface RunContext {
  quizId: string;
  difficulty: Difficulty;
  score: number;
  total: number;
  bestStreak: number;
  hintsUsed: number;
  premium: boolean;
  daily: boolean;
  replay: boolean;
  level: number;
  /** Count of distinct quizzes completed at least once. */
  distinctQuizzes: number;
}

export interface PlayerState {
  version: 1;
  points: number;
  xp: number;
  /** Best score (correct answers) in a single run. */
  bestScore: number;
  /** Consecutive days with at least one completed run. */
  streak: number;
  bestStreak: number;
  /** Local date (YYYY-MM-DD) of the last completed run. */
  lastPlayedDay: string;
  /** Lifetime answer counters. */
  totalCorrect: number;
  totalAnswered: number;
  completed: Record<string, QuizRecord>;
  unlocked: string[];
  achievements: string[];
  /** Daily quiz state. */
  daily: { day: string; done: boolean } | null;
  /**
   * Anti-farming ledger: how many rewarded replays were claimed for a
   * given quiz on a given day, as `"YYYY-MM-DD|quizId" → count`.
   */
  replayLog: Record<string, number>;
}
