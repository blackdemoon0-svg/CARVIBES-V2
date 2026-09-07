// ============================================================
// CARVIBES QUIZ — achievements
//
// Small, deliberate rewards. Every payout here is a fraction of a single
// quiz run, so achievements feel good without ever becoming a source of
// points that breaks the economy.
// ============================================================
import type { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_race",
    icon: "🏁",
    nameKey: "ach_first_race",
    descKey: "ach_first_race_d",
    points: 50,
    xp: 50,
    test: (p) => Object.keys(p.completed).length >= 1,
  },
  {
    id: "enthusiast",
    icon: "🧠",
    nameKey: "ach_enthusiast",
    descKey: "ach_enthusiast_d",
    points: 150,
    xp: 150,
    test: (p) => p.totalCorrect >= 50,
  },
  {
    id: "on_fire",
    icon: "🔥",
    nameKey: "ach_on_fire",
    descKey: "ach_on_fire_d",
    points: 100,
    xp: 100,
    test: (_p, ctx) => ctx.bestStreak >= 10,
  },
  {
    id: "perfect_score",
    icon: "🏆",
    nameKey: "ach_perfect",
    descKey: "ach_perfect_d",
    points: 150,
    xp: 150,
    test: (_p, ctx) => ctx.total >= 8 && ctx.score === ctx.total,
  },
  {
    id: "unassisted",
    icon: "🎯",
    nameKey: "ach_nohint",
    descKey: "ach_nohint_d",
    points: 100,
    xp: 100,
    test: (_p, ctx) =>
      ctx.total >= 8 && ctx.score === ctx.total && ctx.hintsUsed === 0,
  },
  {
    id: "gearhead",
    icon: "🔧",
    nameKey: "ach_gearhead",
    descKey: "ach_gearhead_d",
    points: 100,
    xp: 0,
    test: (_p, ctx) => ctx.level >= 10,
  },
  {
    id: "car_master",
    icon: "👑",
    nameKey: "ach_master",
    descKey: "ach_master_d",
    points: 500,
    xp: 0,
    test: (_p, ctx) => ctx.level >= 50,
  },
  {
    id: "keyholder",
    icon: "🗝️",
    nameKey: "ach_keyholder",
    descKey: "ach_keyholder_d",
    points: 100,
    xp: 100,
    test: (p) => p.unlocked.length >= 1,
  },
  {
    id: "daily_driver",
    icon: "📅",
    nameKey: "ach_daily",
    descKey: "ach_daily_d",
    points: 50,
    xp: 50,
    test: (_p, ctx) => ctx.daily,
  },
  {
    id: "week_runner",
    icon: "⚡",
    nameKey: "ach_week",
    descKey: "ach_week_d",
    points: 200,
    xp: 100,
    test: (p) => p.streak >= 7,
  },
  {
    id: "explorer",
    icon: "🧭",
    nameKey: "ach_explorer",
    descKey: "ach_explorer_d",
    points: 150,
    xp: 150,
    test: (_p, ctx) => ctx.distinctQuizzes >= 5,
  },
  {
    id: "no_fear",
    icon: "💀",
    nameKey: "ach_insane",
    descKey: "ach_insane_d",
    points: 250,
    xp: 200,
    test: (_p, ctx) => ctx.difficulty === "insane",
  },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
