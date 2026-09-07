// ============================================================
// CARVIBES QUIZ — data validation
//
// Runs against the REAL car database (bundled with esbuild, exactly like
// the sitemap and prerender scripts do), so a quiz question can never
// quietly contradict the specifications CarVibes publishes elsewhere.
//
// Checks performed
//   · every question id is unique and well formed
//   · exactly four options, no duplicates, no blanks
//   · the answer index points at a real option
//   · prompt / hint / explanation exist in EN, FR and ES
//   · difficulty and category are valid enum values
//   · every referenced carId exists in the database
//   · every `fact` claim: the correct option matches the database value
//     AND no distractor also matches it (no ambiguous questions)
//   · every `claims` number quoted in a prompt matches the database
//   · every quiz resolves to at least as many questions as it advertises
//   · premium costs match the tiers defined in the economy
//
// Usage: node scripts/validate-quiz.mjs   (or: npm run validate:quiz)
// ============================================================

import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const problems = [];
const fail = (msg) => problems.push(msg);

// ------------------------------------------------------------
// 1. Load the real quiz data + the real car database
// ------------------------------------------------------------
async function loadData() {
  const outDir = mkdtempSync(path.join(tmpdir(), "carvibes-quiz-"));
  const entry = path.join(outDir, "entry.ts");
  const outfile = path.join(outDir, "data.mjs");

  writeFileSync(
    entry,
    [
      `import { QUESTIONS } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/data/index.ts"))};`,
      `import { QUIZZES, DAILY_COUNT, dailyQuestions } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/quizzes.ts"))};`,
      `import { ACHIEVEMENTS } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/achievements.ts"))};`,
      `import { PREMIUM_TIERS } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/economy.ts"))};`,
      `import { cars } from ${JSON.stringify(path.join(ROOT, "src/lib/db.ts"))};`,
      `import { quizDicts } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/i18n.ts"))};`,
      `import { QUIZ_CATEGORIES } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/data/categories.ts"))};`,
      `import { LEVEL_TITLES } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/economy.ts"))};`,
      `import { baseDicts } from ${JSON.stringify(path.join(ROOT, "src/lib/i18n.ts"))};`,
      `export { QUESTIONS, QUIZZES, ACHIEVEMENTS, PREMIUM_TIERS, cars, DAILY_COUNT, dailyQuestions, quizDicts, QUIZ_CATEGORIES, LEVEL_TITLES, baseDicts };`,
    ].join("\n"),
    "utf8"
  );

  try {
    await build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node18",
      logLevel: "silent",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

// ------------------------------------------------------------
// 2. Comparison helpers
// ------------------------------------------------------------
const norm = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const DRIVETRAIN = {
  FWD: ["frontwheeldrive", "fwd"],
  RWD: ["rearwheeldrive", "rwd"],
  AWD: ["allwheeldrive", "awd"],
  "4WD": ["fourwheeldrive", "4wd"],
};

/** Format a database value the way a correct answer option should read. */
function expectedNeedle(field, value) {
  switch (field) {
    case "hp":
      return norm(`${value} hp`);
    case "zeroToHundred":
      return norm(`${value} s`);
    case "topSpeed":
      return norm(`${value} km/h`);
    case "weight":
      return norm(`${value} kg`);
    case "year":
      return norm(String(value));
    case "engine":
      return norm(value);
    case "drivetrain":
      return null; // handled separately
    default:
      return null;
  }
}

function optionMatchesField(option, field, value) {
  const n = norm(option);
  if (field === "price") {
    const digits = n.replace(/[^0-9]/g, "");
    if (!digits) return false;
    const parsed = Number(digits);
    return Math.abs(parsed - Number(value)) / Number(value) <= 0.02;
  }
  if (field === "drivetrain") {
    const needles = DRIVETRAIN[value] ?? [norm(value)];
    return needles.some((needle) => n.includes(needle));
  }
  const needle = expectedNeedle(field, value);
  return needle ? n.includes(needle) : false;
}

// ------------------------------------------------------------
// 2b. Translation coverage
//
// Every string the quiz shows must exist in every supported language,
// and every `t(lang, "…")` call in the quiz components must resolve to a
// real dictionary entry. This is what keeps the feature from silently
// falling back to English in one locale.
// ------------------------------------------------------------
const SUPPORTED = ["en", "fr", "es", "de", "it", "pt", "nl", "ar", "ja", "zh"];

function collectSource(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) collectSource(full, out);
    else if (/\.(tsx?|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

function checkTranslations({ quizDicts, baseDicts, QUIZ_CATEGORIES, LEVEL_TITLES, ACHIEVEMENTS }) {
  const enKeys = new Set(Object.keys(quizDicts.en));

  // (a) every quiz key exists in all 10 languages, non-empty
  for (const lang of SUPPORTED) {
    const dict = quizDicts[lang];
    if (!dict) {
      fail(`quizDicts has no "${lang}" entry at all.`);
      continue;
    }
    for (const key of enKeys) {
      const value = dict[key];
      if (!value || !String(value).trim()) {
        fail(`quizDicts.${lang} is missing "${key}".`);
      }
    }
  }

  // (b) every literal t(lang, "key") in the quiz UI resolves
  const files = collectSource(path.join(ROOT, "src/components/quiz")).concat(
    collectSource(path.join(ROOT, "src/lib/quiz"))
  );
  const literal = /\bt\(\s*lang\s*,\s*"([^"]+)"/g;
  const used = new Map();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    let match;
    while ((match = literal.exec(source))) {
      const key = match[1];
      if (!used.has(key)) used.set(key, path.relative(ROOT, file));
    }
  }
  for (const [key, where] of used) {
    if (!quizDicts.en[key] && !baseDicts.en[key]) {
      fail(`t(lang, "${key}") in ${where} has no dictionary entry.`);
    }
  }

  // (c) the data-driven keys the UI builds from enums must exist too
  const derived = [];
  for (const cat of QUIZ_CATEGORIES) {
    derived.push(cat.nameKey, `${cat.nameKey}_sub`);
  }
  for (const tier of LEVEL_TITLES) derived.push(tier.key);
  for (const a of ACHIEVEMENTS) derived.push(a.nameKey, a.descKey);
  for (const d of ["easy", "medium", "hard", "expert", "insane"]) {
    derived.push(`diff_${d}`, `diff_${d}_sub`);
  }
  for (const key of derived) {
    for (const lang of SUPPORTED) {
      if (!quizDicts[lang]?.[key]) {
        fail(`Derived quiz label "${key}" is missing in ${lang}.`);
      }
    }
  }

  return { literalKeys: used.size, quizKeys: enKeys.size };
}

// ------------------------------------------------------------
// 3. Run
// ------------------------------------------------------------
async function main() {
  const {
    QUESTIONS,
    QUIZZES,
    ACHIEVEMENTS,
    PREMIUM_TIERS,
    cars,
    DAILY_COUNT,
    dailyQuestions,
    quizDicts,
    QUIZ_CATEGORIES,
    LEVEL_TITLES,
    baseDicts,
  } = await loadData();

  const carMap = new Map(cars.map((c) => [c.id, c]));
  // Languages every question must be authored in. The UI shows a notice in
  // any other language, so this list is a contract, not a convenience.
  const LANGS = ["en", "fr", "es"];
  const DIFFICULTIES = ["easy", "medium", "hard", "expert", "insane"];
  const CATEGORIES = [
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
  ];

  const seenIds = new Set();
  let checkCoverage = { literalKeys: 0, quizKeys: 0 };
  let factsChecked = 0;
  let claimsChecked = 0;

  for (const q of QUESTIONS) {
    const label = q.id || "<no id>";
    if (!q.id) fail("A question is missing an id.");
    if (seenIds.has(q.id)) fail(`${label}: duplicate question id.`);
    seenIds.add(q.id);

    if (!DIFFICULTIES.includes(q.difficulty)) {
      fail(`${label}: invalid difficulty "${q.difficulty}".`);
    }
    if (!CATEGORIES.includes(q.category)) {
      fail(`${label}: invalid category "${q.category}".`);
    }

    for (const field of ["prompt", "hint", "why"]) {
      const value = q[field];
      if (!value) {
        fail(`${label}: missing ${field}.`);
        continue;
      }
      for (const lang of LANGS) {
        if (!value[lang] || !String(value[lang]).trim()) {
          fail(`${label}: ${field} has no ${lang} translation.`);
        }
      }
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      fail(`${label}: expected exactly 4 options, found ${q.options?.length}.`);
      continue;
    }
    const flat = q.options.map((o) => (o && o.en) || "");
    for (let i = 0; i < 4; i += 1) {
      if (!flat[i].trim()) fail(`${label}: option ${i + 1} is empty.`);
    }
    const normalised = flat.map(norm);
    if (new Set(normalised).size !== 4) {
      fail(`${label}: duplicate options (${flat.join(" | ")}).`);
    }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
      fail(`${label}: answer index ${q.answer} is out of range.`);
      continue;
    }

    if (q.carId && !carMap.has(q.carId)) {
      fail(`${label}: carId "${q.carId}" does not exist in the car database.`);
    }

    // --- correct answer must match the database -----------------
    if (q.fact) {
      const car = carMap.get(q.fact.carId);
      if (!car) {
        fail(`${label}: fact references unknown car "${q.fact.carId}".`);
      } else {
        const dbValue = car[q.fact.field];
        if (dbValue === undefined || dbValue === null || dbValue === 0) {
          fail(
            `${label}: car ${q.fact.carId} has no "${q.fact.field}" in the database.`
          );
        } else {
          factsChecked += 1;
          const correct = q.options[q.answer];
          if (!optionMatchesField(correct.en, q.fact.field, dbValue)) {
            fail(
              `${label}: correct option "${correct.en}" does not match ` +
                `${q.fact.carId}.${q.fact.field} = ${dbValue}.`
            );
          }
          for (let i = 0; i < 4; i += 1) {
            if (i === q.answer) continue;
            if (optionMatchesField(q.options[i].en, q.fact.field, dbValue)) {
              fail(
                `${label}: distractor "${q.options[i].en}" also matches ` +
                  `${q.fact.carId}.${q.fact.field} = ${dbValue} — ambiguous question.`
              );
            }
          }
        }
      }
    }

    // --- numbers quoted in the prompt ---------------------------
    for (const claim of q.claims ?? []) {
      const carId = q.carId ?? q.fact?.carId;
      const car = carId ? carMap.get(carId) : undefined;
      if (!car) {
        fail(`${label}: claim "${claim.field}" has no linked car.`);
        continue;
      }
      const dbValue = car[claim.field];
      claimsChecked += 1;
      const ok =
        typeof claim.value === "number"
          ? Number(dbValue) === Number(claim.value)
          : norm(dbValue) === norm(claim.value);
      if (!ok) {
        fail(
          `${label}: prompt claims ${claim.field} = ${claim.value}, ` +
            `but ${carId}.${claim.field} = ${dbValue}.`
        );
      }
    }
  }

  // ------------------------------------------------------------
  // 4. Quiz catalogue
  // ------------------------------------------------------------
  const byCatDiff = (categories, difficulties, visualOnly) =>
    QUESTIONS.filter((q) => {
      if (!categories.includes(q.category)) return false;
      if (!difficulties.includes(q.difficulty)) return false;
      if (visualOnly && !q.carId && !q.image) return false;
      return true;
    }).length;

  const seenQuiz = new Set();
  for (const quiz of QUIZZES) {
    if (seenQuiz.has(quiz.id)) fail(`Duplicate quiz id: ${quiz.id}`);
    seenQuiz.add(quiz.id);

    if (!DIFFICULTIES.includes(quiz.difficulty)) {
      fail(`${quiz.id}: invalid difficulty "${quiz.difficulty}".`);
    }
    if (!CATEGORIES.includes(quiz.category)) {
      fail(`${quiz.id}: invalid category "${quiz.category}".`);
    }
    for (const field of ["title", "blurb"]) {
      for (const lang of LANGS) {
        if (!quiz[field]?.[lang]?.trim()) {
          fail(`${quiz.id}: ${field} has no ${lang} translation.`);
        }
      }
    }
    if (!(quiz.count >= 5)) {
      fail(`${quiz.id}: count must be at least 5 (got ${quiz.count}).`);
    }

    const available = byCatDiff(
      quiz.pool.categories,
      quiz.pool.difficulties,
      quiz.visualOnly
    );
    if (available < quiz.count) {
      fail(
        `${quiz.id}: needs ${quiz.count} questions but its pool only holds ${available}.`
      );
    }

    if (quiz.premium) {
      if (!Number.isFinite(quiz.cost) || quiz.cost <= 0) {
        fail(`${quiz.id}: premium quiz must define a positive unlock cost.`);
      } else if (quiz.cost !== PREMIUM_TIERS[quiz.difficulty]) {
        fail(
          `${quiz.id}: unlock cost ${quiz.cost} does not match the ` +
            `${quiz.difficulty} premium tier (${PREMIUM_TIERS[quiz.difficulty]}).`
        );
      }
    } else if (quiz.cost) {
      fail(`${quiz.id}: free quiz must not define an unlock cost.`);
    }
  }

  const featured = QUIZZES.filter((q) => q.featured);
  if (featured.length !== 1) {
    fail(`Exactly one quiz must be featured, found ${featured.length}.`);
  }

  // ------------------------------------------------------------
  // 5. Daily quiz + achievements
  // ------------------------------------------------------------
  const daily = dailyQuestions("2026-01-01", DAILY_COUNT);
  if (daily.length !== DAILY_COUNT) {
    fail(`Daily quiz resolved ${daily.length} questions, expected ${DAILY_COUNT}.`);
  }
  if (dailyQuestions("2026-01-02", DAILY_COUNT).every((q, i) => q.id === daily[i]?.id)) {
    fail("Daily quiz returns the same questions on consecutive days.");
  }

  const seenAch = new Set();
  for (const a of ACHIEVEMENTS) {
    if (seenAch.has(a.id)) fail(`Duplicate achievement id: ${a.id}`);
    seenAch.add(a.id);
    if (typeof a.test !== "function") fail(`${a.id}: missing test().`);
    if (a.points > 500 || a.xp > 200) {
      fail(`${a.id}: reward (${a.points} ⭐ / ${a.xp} XP) is too large for an achievement.`);
    }
  }

  // ------------------------------------------------------------
  // 5b. Translation coverage — nothing may ship half-translated
  // ------------------------------------------------------------
  checkCoverage = checkTranslations({ quizDicts, baseDicts, QUIZ_CATEGORIES, LEVEL_TITLES, ACHIEVEMENTS });

  // ------------------------------------------------------------
  // 6. Report
  // ------------------------------------------------------------
  if (problems.length) {
    console.error(`[validate-quiz] ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  const coverage = checkCoverage;
  const byDifficulty = DIFFICULTIES.map(
    (d) => `${d} ${QUESTIONS.filter((q) => q.difficulty === d).length}`
  ).join(" · ");

  console.log(
    `[validate-quiz] OK — ${QUESTIONS.length} questions (${byDifficulty}), ` +
      `${coverage.quizKeys} strings × 10 languages (${coverage.literalKeys} used in the UI), ` +
      `${QUESTIONS.filter((q) => q.category === "guess" || q.category === "price").length} image-based, ` +
      `${factsChecked} spec answers + ${claimsChecked} prompt figures verified against ` +
      `${cars.length} cars, ${QUIZZES.length} quizzes (${QUIZZES.filter((q) => q.premium).length} premium), ` +
      `${ACHIEVEMENTS.length} achievements.`
  );
}

main().catch((error) => {
  console.error(`[validate-quiz] ${error.message}`);
  process.exit(1);
});
