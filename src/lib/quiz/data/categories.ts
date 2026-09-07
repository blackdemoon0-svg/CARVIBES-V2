// ============================================================
// CARVIBES QUIZ — categories
//
// Adding a category is a one-line change here plus its translation
// keys; the hub, the filters and the quiz cards all read from this.
// ============================================================
import type { QuizCategory } from "../types";

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: "guess",
    icon: "🚗",
    nameKey: "cat_guess",
    blurbKey: "cat_guess_sub",
  },
  {
    id: "knowledge",
    icon: "🧠",
    nameKey: "cat_knowledge",
    blurbKey: "cat_knowledge_sub",
  },
  {
    id: "performance",
    icon: "🏁",
    nameKey: "cat_performance",
    blurbKey: "cat_performance_sub",
  },
  {
    id: "price",
    icon: "💰",
    nameKey: "cat_price",
    blurbKey: "cat_price_sub",
  },
  {
    id: "supercars",
    icon: "🏎️",
    nameKey: "cat_supercars",
    blurbKey: "cat_supercars_sub",
  },
  {
    id: "german",
    icon: "🇩🇪",
    nameKey: "cat_german",
    blurbKey: "cat_german_sub",
  },
  {
    id: "jdm",
    icon: "🇯🇵",
    nameKey: "cat_jdm",
    blurbKey: "cat_jdm_sub",
  },
  {
    id: "italian",
    icon: "🇮🇹",
    nameKey: "cat_italian",
    blurbKey: "cat_italian_sub",
  },
  {
    id: "electric",
    icon: "⚡",
    nameKey: "cat_electric",
    blurbKey: "cat_electric_sub",
  },
  {
    id: "luxury",
    icon: "👑",
    nameKey: "cat_luxury",
    blurbKey: "cat_luxury_sub",
  },
];

export const CATEGORY_MAP = new Map(QUIZ_CATEGORIES.map((c) => [c.id, c]));

export function categoryById(id: string): QuizCategory | undefined {
  return CATEGORY_MAP.get(id as QuizCategory["id"]);
}
