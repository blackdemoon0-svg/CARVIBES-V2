// ============================================================
// CARVIBES QUIZ — point economy, XP curve and level system
//
// Design goals
// ------------
//   1. Points must feel valuable: the only meaningful source is
//      answering questions correctly, and the payout scales with the
//      difficulty the player actually chose.
//   2. No farming: replaying a finished quiz pays a fraction of its
//      first-run reward and is capped per day, so grinding one easy
//      quiz can never fund the premium catalogue.
//   3. Every number lives here. Balancing the game is a one-file change.
// ============================================================
import type { Difficulty } from "./types";

export const DIFFICULTY_ORDER: Difficulty[] = [
  "easy",
  "medium",
  "hard",
  "expert",
  "insane",
];

/** Points awarded per correct answer, by quiz difficulty. */
export const POINTS_PER_CORRECT: Record<Difficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 175,
  expert: 250,
  insane: 400,
};

/** XP awarded per correct answer, by quiz difficulty. */
export const XP_PER_CORRECT: Record<Difficulty, number> = {
  easy: 30,
  medium: 60,
  hard: 105,
  expert: 150,
  insane: 240,
};

/**
 * Hints are never free, and an expensive question gets an expensive
 * hint — otherwise a 50-point easy question could be solved for free.
 */
export const HINT_COST: Record<Difficulty, number> = {
  easy: 25,
  medium: 50,
  hard: 75,
  expert: 100,
  insane: 125,
};

/** Bonus for consecutive correct answers inside a single run. */
export const STREAK_BONUSES: { at: number; points: number }[] = [
  { at: 3, points: 100 },
  { at: 5, points: 250 },
  { at: 10, points: 500 },
];

/** Awarded once for a flawless run (every question correct). */
export const PERFECT_BONUS = 250;
export const PERFECT_XP_BONUS = 120;

/** Daily quiz pays a fraction of a normal run — it is a habit hook. */
export const DAILY_MULTIPLIER = 0.6;
/** Replaying an already-completed quiz pays this fraction. */
export const REPLAY_MULTIPLIER = 0.25;
/** Rewarded replays allowed per quiz, per day. After that: XP only. */
export const MAX_REWARDED_REPLAYS_PER_DAY = 2;

/** Premium unlock tiers. */
export const PREMIUM_TIERS: Record<Difficulty, number> = {
  easy: 400,
  medium: 750,
  hard: 1500,
  expert: 3000,
  insane: 5000,
};

// ------------------------------------------------------------
// Level curve
// ------------------------------------------------------------
/**
 * Cumulative XP required to *reach* a level. `60 · (L-1)^1.75` grows
 * super-linearly, so early levels come fast (a hook) and later levels
 * require real dedication:
 *   L2 → 60 XP · L10 → 2,806 · L20 → 10,104 · L50 → 53,182 · L100 → 179,340
 */
export function cumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(60 * Math.pow(level - 1, 1.75));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (cumulativeXpForLevel(level + 1) <= xp && level < 999) level += 1;
  return level;
}

export interface LevelInfo {
  level: number;
  /** XP floor of the current level. */
  from: number;
  /** XP needed for the next level. */
  to: number;
  /** XP earned inside the current level. */
  into: number;
  /** XP required for the whole current level (0 at level 1). */
  span: number;
  /** 0–1 progress through the current level. */
  progress: number;
  titleKey: string;
  /** Translation key of the title for the next level. */
  nextTitleKey: string;
}

/** Level title tiers — every one has a translated name. */
export const LEVEL_TITLES: { min: number; key: string }[] = [
  { min: 1, key: "lvl_beginner" },
  { min: 5, key: "lvl_driver" },
  { min: 10, key: "lvl_enthusiast" },
  { min: 20, key: "lvl_gearhead" },
  { min: 30, key: "lvl_expert" },
  { min: 50, key: "lvl_master" },
  { min: 75, key: "lvl_elite" },
  { min: 100, key: "lvl_legend" },
];

export function titleKeyForLevel(level: number): string {
  let key = LEVEL_TITLES[0].key;
  for (const tier of LEVEL_TITLES) if (level >= tier.min) key = tier.key;
  return key;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelFromXp(xp);
  const from = cumulativeXpForLevel(level);
  const to = cumulativeXpForLevel(level + 1);
  const span = Math.max(1, to - from);
  return {
    level,
    from,
    to,
    into: Math.max(0, xp - from),
    span,
    progress: Math.min(1, Math.max(0, (xp - from) / span)),
    titleKey: titleKeyForLevel(level),
    nextTitleKey: titleKeyForLevel(level + 1),
  };
}

// ------------------------------------------------------------
// Reward helpers
// ------------------------------------------------------------
/** Maximum points a run can pay (all correct + perfect bonus). */
export function maxRunPoints(difficulty: Difficulty, count: number): number {
  const per = POINTS_PER_CORRECT[difficulty];
  const streak = STREAK_BONUSES.filter((s) => s.at <= count).reduce(
    (sum, s) => sum + s.points,
    0
  );
  return count * per + streak + PERFECT_BONUS;
}

/**
 * Multiplier applied to the points of a run.
 * Replays pay a fraction, and after the daily cap they pay nothing at
 * all — the player still earns XP, so a replay is never pointless.
 */
export function runPointMultiplier(opts: {
  replay: boolean;
  rewardedReplaysToday: number;
  daily: boolean;
}): number {
  let m = 1;
  if (opts.daily) m *= DAILY_MULTIPLIER;
  if (opts.replay) {
    m *=
      opts.rewardedReplaysToday < MAX_REWARDED_REPLAYS_PER_DAY
        ? REPLAY_MULTIPLIER
        : 0;
  }
  return m;
}

/** XP multiplier: replays keep 60% of their XP, never zero. */
export function runXpMultiplier(opts: { replay: boolean; daily: boolean }) {
  let m = 1;
  if (opts.daily) m *= DAILY_MULTIPLIER;
  if (opts.replay) m *= 0.6;
  return m;
}
