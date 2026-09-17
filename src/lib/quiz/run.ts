// ============================================================
// CARVIBES QUIZ — run preparation & scoring
//
// A "run" is a concrete, replayable set of questions: the questions
// picked for it, their answer options already shuffled, and the reward
// each one carries. It is fully serialisable so a refresh mid-quiz can
// resume exactly where the player left off.
// ============================================================
import {
  POINTS_PER_CORRECT,
  STREAK_BONUSES,
  XP_PER_CORRECT,
} from "./economy";
import { DAILY_COUNT, DAILY_DIFFICULTY, hashSeed, quizById } from "./quizzes";
import { dailyQuestions, selectQuestions } from "./bank";
import { questionById } from "./data";
import { cars } from "../db";
import type { Difficulty, LS, QuizQuestion } from "./types";

import {
  nextQuizKey,
  pick,
  type PreparedOption,
  type PreparedQuestion,
  type RunSpec,
} from "./run-meta";

// Re-exports kept for existing consumers (tests, session restore path).
export { nextQuizKey, pick };
export type { PreparedOption, PreparedQuestion, RunSpec };


const CAR_NAMES: Map<string, string> = new Map(
  cars.map((c) => [c.id, `${c.brand} ${c.model}`.trim()])
);

/**
 * Every question that points at a car inherits that car's photo from the
 * database, so the visual always matches the machine being discussed and
 * nothing has to be maintained twice.
 */
const CAR_IMAGES: Map<string, string> = new Map(
  cars.filter((c) => c.image).map((c) => [c.id, c.image])
);

/** "brand model" phrases, longest first, used to find the car a question
 *  talks about when the author did not declare one. */
const CAR_PHRASES: { id: string; text: string }[] = cars
  .map((c) => ({ id: c.id, text: `${c.brand} ${c.model}`.toLowerCase().trim() }))
  .filter((p) => p.text.length > 4)
  .sort((a, b) => b.text.length - a.text.length);

const resolvedCarCache = new Map<string, string | null>();

/**
 * Finds the car a question is about by matching its text against the
 * database. Used only for the visual, and any car found this way is
 * rendered as a silhouette, so it can never give an answer away.
 */
function resolveCarId(question: QuizQuestion): string | null {
  const cached = resolvedCarCache.get(question.id);
  if (cached !== undefined) return cached;
  const haystack = `${question.prompt.en} ${question.options
    .map((o) => o.en)
    .join(" ")} ${question.why.en}`.toLowerCase();
  let found: string | null = null;
  for (const phrase of CAR_PHRASES) {
    if (haystack.includes(phrase.text)) {
      found = phrase.id;
      break;
    }
  }
  resolvedCarCache.set(question.id, found);
  return found;
}




const DAILY_TITLE: LS = {
  en: "DAILY CAR QUIZ",
  fr: "QUIZ QUOTIDIEN",
  es: "QUIZ DIARIO",
};

const DAILY_BLURB: LS = {
  en: "Five fresh questions every day. New set at midnight.",
  fr: "Cinq nouvelles questions chaque jour. Nouveau set à minuit.",
  es: "Cinco preguntas nuevas cada día. Nueva serie a medianoche.",
};

/** Deterministic shuffle (Fisher–Yates with a seeded PRNG). */
function shuffle<T>(items: T[], seed: number): T[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function prepareQuestion(question: QuizQuestion, seed: number): PreparedQuestion {
  const reward = POINTS_PER_CORRECT[question.difficulty];
  const xp = XP_PER_CORRECT[question.difficulty];
  const options = shuffle(
    question.options.map((text, index) => ({
      text,
      correct: index === question.answer,
    })),
    seed
  );
  const carId = question.carId ?? resolveCarId(question);
  const image = question.image ?? (carId ? CAR_IMAGES.get(carId) ?? null : null);
  // A photo is only revealed when the question is *about* that car, so
  // "which car is this?" style prompts are never spoiled by their visual.
  // Blur the photo only when it could actually give the answer away.
  const correctText =
    question.options[question.answer]?.en.toLowerCase() ?? "";
  const carName = (carId ? CAR_NAMES.get(carId) ?? "" : "").toLowerCase();
  const brand = carName.split(" ")[0];
  const model = carName.split(" ").slice(1).join(" ");
  const answerNamesCar =
    (!!brand && brand.length > 3 && correctText.includes(brand)) ||
    (!!model && model.length > 2 && correctText.includes(model));
  const factCar = question.fact?.carId ?? null;
  const spoiler =
    !image ||
    !carId ||
    question.category === "guess" ||
    question.category === "price" ||
    (factCar ? factCar !== carId : answerNamesCar);

  return {
    id: question.id,
    category: question.category,
    difficulty: question.difficulty,
    prompt: question.prompt,
    hint: question.hint,
    why: question.why,
    image,
    carId,
    spoiler,
    imageName: spoiler ? null : (CAR_NAMES.get(carId) ?? null),
    options,
    reward,
    xp,
  };
}

/**
 * Build a run. Returns null when the quiz does not exist or the bank
 * cannot supply any question for it — callers then show a friendly
 * fallback instead of an empty screen.
 */
export function prepareRun(
  key: string,
  opts: { day?: string; seedNonce?: number; exclude?: string[] } = {}
): RunSpec | null {
  const nonce = opts.seedNonce ?? 0;

  if (key === "daily") {
    const day = opts.day ?? new Date().toISOString().slice(0, 10);
    const picked = dailyQuestions(day, DAILY_COUNT);
    if (!picked.length) return null;
    const questions = picked.map((q, i) =>
      prepareQuestion(q, hashSeed(`daily:${day}:${q.id}:${i}`))
    );
    return {
      key: "daily",
      isDaily: true,
      quizId: null,
      title: DAILY_TITLE,
      blurb: DAILY_BLURB,
      difficulty: DAILY_DIFFICULTY,
      premium: false,
      questions,
      maxPoints: questions.reduce((s, q) => s + q.reward, 0),
      maxXp: questions.reduce((s, q) => s + q.xp, 0),
      streakBonuses: STREAK_BONUSES.filter((b) => b.at <= questions.length),
    };
  }

  const quiz = quizById(key);
  if (!quiz) return null;

  const seed = hashSeed(`${quiz.id}:${nonce}`);
  const picked = selectQuestions(quiz, seed, opts.exclude ?? []);
  if (!picked.length) return null;

  const questions = picked.map((q, i) =>
    prepareQuestion(q, hashSeed(`${quiz.id}:${nonce}:${q.id}:${i}`))
  );

  const representative = questions.reduce<Difficulty>((top, q) => {
    const order: Difficulty[] = ["easy", "medium", "hard", "expert", "insane"];
    return order.indexOf(q.difficulty) > order.indexOf(top) ? q.difficulty : top;
  }, questions[0].difficulty);

  return {
    key: quiz.id,
    isDaily: false,
    quizId: quiz.id,
    title: quiz.title,
    blurb: quiz.blurb,
    difficulty: representative,
    premium: !!quiz.premium,
    questions,
    maxPoints: questions.reduce((s, q) => s + q.reward, 0),
    maxXp: questions.reduce((s, q) => s + q.xp, 0),
    streakBonuses: STREAK_BONUSES.filter((b) => b.at <= questions.length),
  };
}


export function questionFromId(id: string): QuizQuestion | undefined {
  return questionById(id);
}

