// ============================================================
// CARVIBES QUIZ — quiz catalogue
//
// Quizzes are *data*, not components. The hub renders cards from this
// array, so a new quiz is one object here — no UI change required.
//
// Question sets are resolved from the shared bank by category +
// difficulty band with a seeded shuffle, so:
//   · every run differs (no memorising),
//   · the difficulty a player picks genuinely changes the questions,
//   · adding questions to the bank automatically enriches every quiz.
// ============================================================
import type { Difficulty, QuizCategoryId, QuizDef } from "./types";
import { questionsIn } from "./data";
import { POINTS_PER_CORRECT } from "./economy";
import type { LS } from "./types";

/** Authoring helper for localised quiz titles/blurbs (en / fr / es). */
const L = (en: string, fr: string, es: string): LS => ({ en, fr, es });

export const QUIZZES: QuizDef[] = [
  // ---------------- Free ----------------
  {
    id: "silhouette",
    title: L("SILHOUETTE", "SILHOUETTE", "SILUETA"),
    blurb: L(
      "Identify the exact model from its signature engineering.",
      "Identifiez le modèle exact à partir de son ingénierie caractéristique.",
      "Identifica el modelo exacto por su ingeniería característica."
    ),
    category: "guess",
    difficulty: "easy",
    count: 8,
    pool: { categories: ["guess"], difficulties: ["easy", "medium"] },
    visualOnly: true,
    featured: true,
  },
  {
    id: "warm-up-lap",
    title: L("WARM-UP LAP", "TOUR DE CHAUFFE", "VUELTA DE CALENTAMIENTO"),
    blurb: L(
      "Engines, brands and the facts every driver should know.",
      "Moteurs, marques et les bases que tout conducteur devrait connaître.",
      "Motores, marcas y lo básico que todo conductor debería saber."
    ),
    category: "knowledge",
    difficulty: "easy",
    count: 8,
    pool: { categories: ["knowledge"], difficulties: ["easy", "medium"] },
  },
  {
    id: "pit-lane",
    title: L("PIT LANE", "STANDS", "PIT LANE"),
    blurb: L(
      "Horsepower, 0–100 times, weight and drivetrain.",
      "Puissance, 0–100, poids et transmission.",
      "Potencia, 0–100, peso y tracción."
    ),
    category: "performance",
    difficulty: "medium",
    count: 10,
    pool: { categories: ["performance", "knowledge"], difficulties: ["medium", "hard"] },
  },
  {
    id: "jdm-cult",
    title: L("JDM CULT", "CULTE JDM", "CULTO JDM"),
    blurb: L(
      "Rotaries, RB26s and the golden era of Japanese performance.",
      "Rotatifs, RB26 et l'âge d'or de la performance japonaise.",
      "Rotativos, RB26 y la edad de oro del rendimiento japonés."
    ),
    category: "jdm",
    difficulty: "medium",
    count: 10,
    pool: { categories: ["jdm", "performance"], difficulties: ["medium", "hard"] },
  },
  {
    id: "german-precision",
    title: L("GERMAN PRECISION", "PRÉCISION ALLEMANDE", "PRECISIÓN ALEMANA"),
    blurb: L(
      "BMW, Mercedes-Benz, Porsche and Audi, engineering first.",
      "BMW, Mercedes-Benz, Porsche et Audi, l'ingénierie d'abord.",
      "BMW, Mercedes-Benz, Porsche y Audi, la ingeniería primero."
    ),
    category: "german",
    difficulty: "medium",
    count: 10,
    pool: { categories: ["german", "knowledge"], difficulties: ["medium", "hard"] },
  },
  {
    id: "silent-power",
    title: L("SILENT POWER", "PUISSANCE SILENCIEUSE", "POTENCIA SILENCIOSA"),
    blurb: L(
      "Tesla, Porsche, Rimac, Lucid and the electric era.",
      "Tesla, Porsche, Rimac, Lucid et l'ère électrique.",
      "Tesla, Porsche, Rimac, Lucid y la era eléctrica."
    ),
    category: "electric",
    difficulty: "medium",
    count: 10,
    pool: { categories: ["electric", "knowledge"], difficulties: ["medium", "hard"] },
  },
  {
    id: "first-class",
    title: L("FIRST CLASS", "PREMIÈRE CLASSE", "PRIMERA CLASE"),
    blurb: L(
      "Bentley, Rolls-Royce, Maybach and the ultra-luxury tier.",
      "Bentley, Rolls-Royce, Maybach et l'ultra-luxe.",
      "Bentley, Rolls-Royce, Maybach y el ultra-lujo."
    ),
    category: "luxury",
    difficulty: "medium",
    count: 10,
    pool: { categories: ["luxury", "knowledge"], difficulties: ["medium", "hard"] },
  },
  {
    id: "italian-passion",
    title: L("ITALIAN PASSION", "PASSION ITALIENNE", "PASIÓN ITALIANA"),
    blurb: L(
      "Ferrari, Lamborghini, Maserati and Alfa Romeo, in depth.",
      "Ferrari, Lamborghini, Maserati et Alfa Romeo, en profondeur.",
      "Ferrari, Lamborghini, Maserati y Alfa Romeo, a fondo."
    ),
    category: "italian",
    difficulty: "hard",
    count: 10,
    pool: { categories: ["italian", "supercars"], difficulties: ["hard", "expert"] },
  },
  {
    id: "apex-predators",
    title: L("APEX PREDATORS", "PRÉDATEURS", "DEPREDADORES"),
    blurb: L(
      "Exotic and high-performance machinery, no easy answers.",
      "Machines exotiques et très performantes, aucune réponse facile.",
      "Máquinas exóticas y muy rápidas, sin respuestas fáciles."
    ),
    category: "supercars",
    difficulty: "hard",
    count: 12,
    pool: {
      categories: ["supercars", "italian", "german"],
      difficulties: ["hard", "expert"],
    },
  },
  {
    id: "price-tag",
    title: L("PRICE TAG", "ÉTIQUETTE DE PRIX", "ETIQUETA DE PRECIO"),
    blurb: L(
      "What do these machines actually cost? Guess the CarVibes price.",
      "Combien coûtent vraiment ces machines ? Devinez le prix CarVibes.",
      "¿Cuánto cuestan de verdad? Adivina el precio en CarVibes."
    ),
    category: "price",
    difficulty: "hard",
    count: 7,
    pool: { categories: ["price"], difficulties: ["hard", "expert"] },
    visualOnly: true,
  },
  {
    id: "the-gauntlet",
    title: L("THE GAUNTLET", "LE DÉFI", "EL GUANTELETE"),
    blurb: L(
      "Insane-difficulty questions that separate fans from experts.",
      "Des questions de difficulté démentielle qui séparent les fans des experts.",
      "Preguntas de dificultad demencial que separan a los fans de los expertos."
    ),
    category: "knowledge",
    difficulty: "insane",
    count: 10,
    pool: {
      categories: ["knowledge", "supercars", "german", "jdm"],
      difficulties: ["insane"],
    },
  },

  // ---------------- Premium ----------------
  {
    id: "premium-rising-stars",
    title: L("RISING STARS", "ÉTOILES MONTANTES", "ESTRELLAS EMERGENTES"),
    blurb: L(
      "A cross-category warm-up for players ready for more.",
      "Un mélange de catégories pour les joueurs prêts à monter d'un cran.",
      "Una mezcla de categorías para jugadores listos para subir un nivel."
    ),
    category: "knowledge",
    difficulty: "medium",
    count: 12,
    pool: {
      categories: ["knowledge", "performance", "guess"],
      difficulties: ["medium", "hard"],
    },
    premium: true,
    cost: 750,
  },
  {
    id: "premium-precision-circuit",
    title: L("PRECISION CIRCUIT", "CIRCUIT DE PRÉCISION", "CIRCUITO DE PRECISIÓN"),
    blurb: L(
      "Hard-level engineering, German cars and performance data.",
      "Ingénierie niveau difficile, voitures allemandes et données de performance.",
      "Ingeniería de nivel difícil, coches alemanes y datos de rendimiento."
    ),
    category: "performance",
    difficulty: "hard",
    count: 14,
    pool: {
      categories: ["performance", "german", "knowledge"],
      difficulties: ["hard", "expert"],
    },
    premium: true,
    cost: 1500,
  },
  {
    id: "premium-electric-revolution",
    title: L("ELECTRIC REVOLUTION", "RÉVOLUTION ÉLECTRIQUE", "REVOLUCIÓN ELÉCTRICA"),
    blurb: L(
      "Batteries, voltage architectures and the fastest EVs built.",
      "Batteries, architectures de tension et les EV les plus rapides.",
      "Baterías, arquitecturas de voltaje y los EV más rápidos."
    ),
    category: "electric",
    difficulty: "hard",
    count: 12,
    pool: {
      categories: ["electric", "performance", "luxury"],
      difficulties: ["hard", "expert"],
    },
    premium: true,
    cost: 1500,
  },
  {
    id: "premium-german-engineering",
    title: L("GERMAN ENGINEERING", "INGÉNIERIE ALLEMANDE", "INGENIERÍA ALEMANA"),
    blurb: L(
      "Generations, engine codes and history only experts know.",
      "Générations, codes moteur et histoire que seuls les experts connaissent.",
      "Generaciones, códigos de motor e historia que solo conocen los expertos."
    ),
    category: "german",
    difficulty: "expert",
    count: 12,
    pool: {
      categories: ["german", "knowledge", "performance"],
      difficulties: ["expert", "insane"],
    },
    premium: true,
    cost: 3000,
  },
  {
    id: "premium-jdm-underground",
    title: L("JDM UNDERGROUND", "JDM UNDERGROUND", "JDM UNDERGROUND"),
    blurb: L(
      "Engine codes, homologation specials and JDM legends.",
      "Codes moteur, séries d'homologation et légendes JDM.",
      "Códigos de motor, series de homologación y leyendas JDM."
    ),
    category: "jdm",
    difficulty: "expert",
    count: 12,
    pool: {
      categories: ["jdm", "performance", "knowledge"],
      difficulties: ["expert", "insane"],
    },
    premium: true,
    cost: 3000,
  },
  {
    id: "premium-auction-block",
    title: L("AUCTION BLOCK", "ENCHÈRES", "SALA DE SUBASTAS"),
    blurb: L(
      "Guess the price of the rarest machines in the database.",
      "Devinez le prix des machines les plus rares de la base.",
      "Adivina el precio de las máquinas más raras de la base."
    ),
    category: "price",
    difficulty: "expert",
    count: 6,
    pool: { categories: ["price"], difficulties: ["expert", "insane"] },
    visualOnly: true,
    premium: true,
    cost: 3000,
  },
  {
    id: "premium-ultimate-supercars",
    title: L("ULTIMATE SUPERCARS", "SUPERCARS ULTIMES", "SUPERDEPORTIVOS DEFINITIVOS"),
    blurb: L(
      "Twenty insane questions. Only the very best get through it.",
      "Vingt questions démentielles. Seuls les meilleurs s'en sortent.",
      "Veinte preguntas demenciales. Solo los mejores lo superan."
    ),
    category: "supercars",
    difficulty: "insane",
    count: 16,
    pool: {
      categories: [
        "supercars",
        "italian",
        "german",
        "performance",
        "guess",
        "knowledge",
      ],
      difficulties: ["insane"],
    },
    premium: true,
    cost: 5000,
    featured: false,
  },
];

export const QUIZ_MAP: Map<string, QuizDef> = new Map(
  QUIZZES.map((q) => [q.id, q])
);

export function quizById(id: string): QuizDef | undefined {
  return QUIZ_MAP.get(id);
}

/** The daily rotation draws from every non-premium quiz's pool. */
export const DAILY_POOL: { categories: QuizCategoryId[]; difficulties: Difficulty[] } =
  {
    categories: [
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
    ],
    difficulties: ["easy", "medium", "hard"],
  };

/** How many questions the Daily Car Quiz contains. */
export const DAILY_COUNT = 5;

/** The difficulty the Daily Car Quiz pays out at. */
export const DAILY_DIFFICULTY: Difficulty = "medium";

// ------------------------------------------------------------
// Deterministic selection
// ------------------------------------------------------------
/** Small, fast PRNG so a seed always produces the same question order. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pick `count` questions for a quiz.
 *
 * Selection order: exact category first, then the rest of the pool, so a
 * category quiz really feels like that category even when the bank for
 * one difficulty band is still growing.
 */
export function selectQuestions(
  quiz: QuizDef,
  seed: number,
  exclude: string[] = []
) {
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
 * Used on the quiz cards as the "max reward" figure.
 */
export function maxReward(quiz: QuizDef): number {
  const pool = questionsIn(quiz.pool.categories, quiz.pool.difficulties, {
    visualOnly: quiz.visualOnly,
  }).sort(
    (a, b) =>
      POINTS_PER_CORRECT[b.difficulty] - POINTS_PER_CORRECT[a.difficulty]
  );
  return pool
    .slice(0, quiz.count)
    .reduce((sum, q) => sum + POINTS_PER_CORRECT[q.difficulty], 0);
}

/** Today's five questions — identical for every player on a given day. */
export function dailyQuestions(dayKey: string, count = DAILY_COUNT) {
  const seed = hashSeed(`daily:${dayKey}`);
  const pool = questionsIn(DAILY_POOL.categories, DAILY_POOL.difficulties);
  const rand = mulberry32(seed);
  const out = pool.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, Math.min(count, out.length));
}
