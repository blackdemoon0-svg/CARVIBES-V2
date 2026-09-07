// ============================================================
// CARVIBES QUIZ — in-progress session (refresh-proof)
//
// A refresh, an accidental reload or a returning tab must not throw the
// player's run away, so the live session is mirrored into localStorage
// after every state change and rehydrated on load.
// ============================================================
import type { RunSpec } from "./run";

const KEY = "carvibes.quiz.session.v1";
/** A half-finished run older than this is abandoned (24h). */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type Phase = "question" | "answered";

export interface QuizSession {
  v: 1;
  runKey: string;
  seedNonce: number;
  questionIds: string[];
  index: number;
  selected: number | null;
  phase: Phase;
  answers: (number | null)[];
  hintUsed: number;
  hintSpend: number;
  score: number;
  streak: number;
  bestStreak: number;
  savedAt: number;
}

export function createSession(run: RunSpec, seedNonce: number): QuizSession {
  return {
    v: 1,
    runKey: run.key,
    seedNonce,
    questionIds: run.questions.map((q) => q.id),
    index: 0,
    selected: null,
    phase: "question",
    answers: run.questions.map(() => null),
    hintUsed: 0,
    hintSpend: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    savedAt: Date.now(),
  };
}

export function loadSession(): QuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizSession;
    if (!parsed || parsed.v !== 1 || !parsed.runKey) return null;
    if (!Array.isArray(parsed.questionIds) || !parsed.questionIds.length) {
      return null;
    }
    if (Date.now() - (parsed.savedAt ?? 0) > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: QuizSession) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...session, savedAt: Date.now() }));
  } catch {
    /* storage unavailable — the run still works, it just is not resumable */
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
