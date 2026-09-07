// ============================================================
// CARVIBES QUIZ — question authoring helper
//
// Keeps the question files readable: one call per question, positional
// arguments, and a compact `[en, fr, es]` triple for every string.
// Proper nouns (car names, engine codes, "$68,000") are passed as plain
// strings because they are identical in every language.
// ============================================================
import {
  tri,
  type Difficulty,
  type LS,
  type QuizCategoryId,
  type QuizQuestion,
  type Tri,
} from "../types";

type Opt = string | Tri;

export function Q(
  id: string,
  category: QuizCategoryId,
  difficulty: Difficulty,
  prompt: Tri,
  options: Opt[],
  answer: number,
  hint: Tri,
  why: Tri,
  extra: Partial<
    Pick<QuizQuestion, "carId" | "image" | "fact" | "claims">
  > = {}
): QuizQuestion {
  return {
    id,
    category,
    difficulty,
    prompt: tri(prompt),
    options: options.map((o): LS => (typeof o === "string" ? { en: o } : tri(o))),
    answer,
    hint: tri(hint),
    why: tri(why),
    ...extra,
  };
}
