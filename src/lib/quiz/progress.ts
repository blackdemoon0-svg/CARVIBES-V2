// ============================================================
// CARVIBES QUIZ — player progression store
//
// CarVibes has no authentication layer, so the player profile is a
// local, versioned record in localStorage (the same approach the site
// already uses for favourites, the compare tray and the language
// preference). The store is a tiny pub/sub, so every quiz component
// reacts to the same single source of truth and nothing can drift.
//
// Everything an unlock, a run or a daily claim changes goes through
// here — including the anti-farming rules.
// ============================================================
import { useSyncExternalStore } from "react";
import {
  MAX_REWARDED_REPLAYS_PER_DAY,
  PERFECT_BONUS,
  PERFECT_XP_BONUS,
  POINTS_PER_CORRECT,
  STREAK_BONUSES,
  XP_PER_CORRECT,
  levelInfo,
  runPointMultiplier,
  runXpMultiplier,
} from "./economy";
import { ACHIEVEMENTS } from "./achievements";
import type {
  Achievement,
  Difficulty,
  PlayerState,
  QuizRecord,
  RunContext,
} from "./types";

const KEY = "carvibes.quiz.player.v1";

/**
 * Starting balance for a brand-new player. Without it the very first run
 * could never afford a hint, and the hint system would look broken
 * instead of strategic. It is far below the cheapest unlock (750 ⭐), so
 * it changes nothing about the economy.
 */
export const STARTING_POINTS = 100;

export function emptyPlayer(): PlayerState {
  return {
    version: 1,
    points: STARTING_POINTS,
    xp: 0,
    bestScore: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayedDay: "",
    totalCorrect: 0,
    totalAnswered: 0,
    completed: {},
    unlocked: [],
    achievements: [],
    daily: null,
    replayLog: {},
  };
}

// ------------------------------------------------------------
// Persistence
// ------------------------------------------------------------
function sanitise(raw: unknown): PlayerState {
  const base = emptyPlayer();
  if (!raw || typeof raw !== "object") return base;
  const v = raw as Partial<PlayerState>;
  const num = (value: unknown, fallback: number) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0
      ? value
      : fallback;
  return {
    version: 1,
    points: num(v.points, base.points),
    xp: num(v.xp, base.xp),
    bestScore: num(v.bestScore, base.bestScore),
    streak: num(v.streak, base.streak),
    bestStreak: num(v.bestStreak, base.bestStreak),
    lastPlayedDay: typeof v.lastPlayedDay === "string" ? v.lastPlayedDay : "",
    totalCorrect: num(v.totalCorrect, base.totalCorrect),
    totalAnswered: num(v.totalAnswered, base.totalAnswered),
    completed:
      v.completed && typeof v.completed === "object"
        ? (v.completed as Record<string, QuizRecord>)
        : {},
    unlocked: Array.isArray(v.unlocked) ? v.unlocked.filter((x) => typeof x === "string") : [],
    achievements: Array.isArray(v.achievements)
      ? v.achievements.filter((x) => typeof x === "string")
      : [],
    daily:
      v.daily && typeof v.daily.day === "string"
        ? { day: v.daily.day, done: !!v.daily.done }
        : null,
    replayLog:
      v.replayLog && typeof v.replayLog === "object"
        ? (v.replayLog as Record<string, number>)
        : {},
  };
}

export function loadPlayer(): PlayerState {
  if (typeof window === "undefined") return emptyPlayer();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitise(JSON.parse(raw)) : emptyPlayer();
  } catch {
    return emptyPlayer();
  }
}

function persist(state: PlayerState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — the session still works in memory */
  }
}

// ------------------------------------------------------------
// Store
// ------------------------------------------------------------
let state: PlayerState = loadPlayer();
const listeners = new Set<() => void>();

function emit() {
  persist(state);
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot() {
  return state;
}

/** Reactive player profile for React components. */
export function usePlayer(): PlayerState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getPlayer(): PlayerState {
  return state;
}

// ------------------------------------------------------------
// Dates / streaks
// ------------------------------------------------------------
/** Local calendar day as YYYY-MM-DD — streaks follow the player's clock. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return key;
  const date = new Date(y, m - 1, d + days);
  return dayKey(date);
}

/** Milliseconds until the player's next local midnight (daily reset). */
export function msUntilNextDay(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

// ------------------------------------------------------------
// Run recording
// ------------------------------------------------------------
export interface RunInput {
  quizId: string;
  difficulty: Difficulty;
  score: number;
  total: number;
  bestStreak: number;
  hintsUsed: number;
  hintSpend: number;
  premium: boolean;
  daily?: boolean;
}

export interface RunResult {
  points: number;
  xp: number;
  perfect: boolean;
  replay: boolean;
  streakBonus: number;
  rewardedReplaysToday: number;
  newAchievements: Achievement[];
  levelBefore: number;
  levelAfter: number;
  player: PlayerState;
  isRecord: boolean;
}

/** How many rewarded replays of `quizId` were already claimed today. */
export function rewardedReplaysToday(
  player: PlayerState,
  quizId: string,
  day = dayKey()
): number {
  return player.replayLog[`${day}|${quizId}`] ?? 0;
}

export function recordRun(input: RunInput): RunResult {
  const prev = state;
  const today = dayKey();
  const existing = prev.completed[input.quizId];
  const replay = !!existing;
  const rewardedReplays = rewardedReplaysToday(prev, input.quizId, today);

  const perfect = input.total > 0 && input.score === input.total;

  // --- points -------------------------------------------------
  const pointMult = runPointMultiplier({
    replay,
    rewardedReplaysToday: rewardedReplays,
    daily: !!input.daily,
  });
  const base = input.score * POINTS_PER_CORRECT[input.difficulty];
  const streakBonus = STREAK_BONUSES.filter(
    (s) => input.bestStreak >= s.at && s.at <= input.total
  ).reduce((sum, s) => sum + s.points, 0);
  const perfectBonus = perfect ? PERFECT_BONUS : 0;
  const points = Math.round((base + streakBonus + perfectBonus) * pointMult);

  // --- xp -----------------------------------------------------
  const xpMult = runXpMultiplier({ replay, daily: !!input.daily });
  const xp = Math.round(
    (input.score * XP_PER_CORRECT[input.difficulty] +
      (perfect ? PERFECT_XP_BONUS : 0)) *
      xpMult
  );

  // --- daily streak -------------------------------------------
  let streak = prev.streak;
  if (prev.lastPlayedDay !== today) {
    streak = prev.lastPlayedDay === shiftDay(today, -1) ? prev.streak + 1 : 1;
  }

  const record: QuizRecord = {
    quizId: input.quizId,
    score: input.score,
    total: input.total,
    points: existing ? Math.max(existing.points, points) : points,
    xp,
    bestStreak: Math.max(input.bestStreak, existing?.bestStreak ?? 0),
    plays: (existing?.plays ?? 0) + 1,
    lastPlayed: today,
  };

  const next: PlayerState = {
    ...prev,
    points: Math.max(0, prev.points + points),
    xp: prev.xp + xp,
    bestScore: Math.max(prev.bestScore, input.score),
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    lastPlayedDay: today,
    totalCorrect: prev.totalCorrect + input.score,
    totalAnswered: prev.totalAnswered + input.total,
    completed: { ...prev.completed, [input.quizId]: record },
    unlocked: prev.unlocked,
    achievements: prev.achievements,
    daily: input.daily ? { day: today, done: true } : prev.daily,
    replayLog:
      replay && points > 0
        ? {
            ...prev.replayLog,
            [`${today}|${input.quizId}`]: rewardedReplays + 1,
          }
        : prev.replayLog,
  };

  const levelBefore = levelInfo(prev.xp).level;
  const levelAfter = levelInfo(next.xp).level;

  // --- achievements -------------------------------------------
  const ctx: RunContext = {
    quizId: input.quizId,
    difficulty: input.difficulty,
    score: input.score,
    total: input.total,
    bestStreak: input.bestStreak,
    hintsUsed: input.hintsUsed,
    premium: input.premium,
    daily: !!input.daily,
    replay,
    level: levelAfter,
    distinctQuizzes: Object.keys(next.completed).length,
  };

  const unlockedSoFar = new Set(next.achievements);
  const newly: Achievement[] = [];
  let bonusPoints = 0;
  let bonusXp = 0;
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedSoFar.has(achievement.id)) continue;
    let hit = false;
    try {
      hit = achievement.test(next, ctx);
    } catch {
      hit = false;
    }
    if (!hit) continue;
    newly.push(achievement);
    unlockedSoFar.add(achievement.id);
    bonusPoints += achievement.points;
    bonusXp += achievement.xp;
  }

  const final: PlayerState = newly.length
    ? {
        ...next,
        achievements: [...unlockedSoFar],
        points: next.points + bonusPoints,
        xp: next.xp + bonusXp,
      }
    : next;

  state = final;
  emit();

  return {
    points: points + bonusPoints,
    xp: xp + bonusXp,
    perfect,
    replay,
    streakBonus: Math.round(streakBonus * pointMult),
    rewardedReplaysToday: rewardedReplays,
    newAchievements: newly,
    levelBefore,
    levelAfter: levelInfo(final.xp).level,
    player: final,
    isRecord: input.score > (prev.bestScore ?? 0),
  };
}

// ------------------------------------------------------------
// Premium unlocks
// ------------------------------------------------------------
export type UnlockOutcome =
  | { ok: true; player: PlayerState }
  | { ok: false; reason: "already" | "insufficient" | "missing"; player: PlayerState };

export function unlockPremiumQuiz(quizId: string, cost: number): UnlockOutcome {
  const prev = state;
  if (prev.unlocked.includes(quizId)) {
    return { ok: false, reason: "already", player: prev };
  }
  if (!Number.isFinite(cost) || cost < 0) {
    return { ok: false, reason: "missing", player: prev };
  }
  if (prev.points < cost) {
    return { ok: false, reason: "insufficient", player: prev };
  }
  state = {
    ...prev,
    points: prev.points - cost,
    unlocked: [...prev.unlocked, quizId],
  };
  emit();
  return { ok: true, player: state };
}

/** Spend points (hints). Returns false when the player cannot afford it. */
export function spendPoints(amount: number): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return true;
  if (state.points < amount) return false;
  state = { ...state, points: state.points - amount };
  emit();
  return true;
}

export function isDailyDone(player: PlayerState = state): boolean {
  return !!player.daily && player.daily.day === dayKey() && player.daily.done;
}

export function isPremiumUnlocked(player: PlayerState, quizId: string): boolean {
  return player.unlocked.includes(quizId);
}

export const ANTI_FARM_LIMIT = MAX_REWARDED_REPLAYS_PER_DAY;
