// ============================================================
// CARVIBES QUIZ — runtime smoke test
//
// `tsc` proves the types line up; this proves the game actually runs.
// It bundles the REAL modules with esbuild and exercises them in Node:
//
//   1. every quiz resolves a full run (right question count, exactly
//      four options, exactly one correct answer, no duplicates)
//   2. the economy: point values, hint cost, streak bonuses, perfect
//      bonus, replay throttling, daily discount, level curve
//   3. progression: premium unlocks, insufficient balance, achievements
//   4. session: a saved run is rehydrated into the very same questions
//   5. the real React components render — hub, player, results — in all
//      ten languages, with no missing translation key and no unrendered
//      {placeholder} left in the output
//
// Usage: node scripts/smoke-quiz.mjs   (or: npm run smoke:quiz)
// ============================================================
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const failures = [];
const bad = (msg) => failures.push(msg);
let checks = 0;
const ok = (cond, msg) => {
  checks += 1;
  if (!cond) bad(msg);
};

// A tiny localStorage stand-in so the store behaves like the browser.
function installStorage() {
  const map = new Map();
  globalThis.window = globalThis.window || {};
  globalThis.window.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
  return map;
}

async function main() {
  // The bundle must live inside the repo so Node can resolve the
  // `external` packages (react, react-dom/server, react-router-dom).
  const outDir = path.join(ROOT, "node_modules", ".cache", "carvibes-smoke");
  mkdirSync(outDir, { recursive: true });
  const entry = path.join(outDir, "entry.tsx");
  const outfile = path.join(outDir, "bundle.mjs");

  writeFileSync(
    entry,
    `
import { QUIZZES, DAILY_COUNT, maxReward } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/quizzes.ts"))};
import { prepareRun } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/run.ts"))};
import {
  emptyPlayer, recordRun, unlockPremiumQuiz, spendPoints, getPlayer,
  isDailyDone, dayKey, msUntilNextDay,
} from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/progress.ts"))};
import {
  POINTS_PER_CORRECT, XP_PER_CORRECT, HINT_COST, STREAK_BONUSES,
  PREMIUM_TIERS, PERFECT_BONUS, levelInfo, cumulativeXpForLevel,
} from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/economy.ts"))};
import { ACHIEVEMENTS } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/achievements.ts"))};
import { createSession, saveSession, loadSession, clearSession } from ${JSON.stringify(path.join(ROOT, "src/lib/quiz/session.ts"))};
import QuizPage from ${JSON.stringify(path.join(ROOT, "src/components/quiz/QuizPage.tsx"))};
import QuizPlayer from ${JSON.stringify(path.join(ROOT, "src/components/quiz/QuizPlayer.tsx"))};
import ResultsScreen from ${JSON.stringify(path.join(ROOT, "src/components/quiz/ResultsScreen.tsx"))};
import PlayerHud from ${JSON.stringify(path.join(ROOT, "src/components/quiz/PlayerHud.tsx"))};
import { CarQuizPage, ExplorePage, BrandsPage, ContactPage, PrivacyPage, TermsPage } from ${JSON.stringify(path.join(ROOT, "src/pages/RoutePages.tsx"))};
import { Homepage } from ${JSON.stringify(path.join(ROOT, "src/App.tsx"))};
export {
  QUIZZES, prepareRun, DAILY_COUNT, maxReward, emptyPlayer, recordRun,
  unlockPremiumQuiz, spendPoints, getPlayer, isDailyDone, dayKey,
  msUntilNextDay, POINTS_PER_CORRECT, XP_PER_CORRECT, HINT_COST,
  STREAK_BONUSES, PREMIUM_TIERS, PERFECT_BONUS, levelInfo,
  cumulativeXpForLevel, ACHIEVEMENTS, createSession, saveSession,
  loadSession, clearSession, QuizPage, QuizPlayer, ResultsScreen, PlayerHud,
  CarQuizPage, ExplorePage, BrandsPage, ContactPage, PrivacyPage, TermsPage,
  Homepage,
};
`,
    "utf8"
  );

  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    jsx: "automatic",
    loader: { ".css": "empty" },
    external: ["react", "react-dom", "react-dom/server", "react-router-dom"],
    logLevel: "silent",
  });

  const storage = installStorage();
  const lib = await import(pathToFileURL(outfile).href);
  rmSync(outDir, { recursive: true, force: true });
  const React = (await import("react")).default;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { MemoryRouter } = await import("react-router-dom");

  // ----------------------------------------------------------
  // 1. Every quiz deals a complete, well-formed run
  // ----------------------------------------------------------
  for (const quiz of lib.QUIZZES) {
    const run = lib.prepareRun(quiz.id, { seedNonce: 7 });
    ok(!!run, `${quiz.id}: prepareRun returned nothing`);
    if (!run) continue;
    ok(
      run.questions.length === quiz.count,
      `${quiz.id}: expected ${quiz.count} questions, dealt ${run.questions.length}`
    );
    for (const q of run.questions) {
      ok(q.options.length === 4, `${quiz.id}/${q.id}: ${q.options.length} options`);
      const correct = q.options.filter((o) => o.correct).length;
      ok(correct === 1, `${quiz.id}/${q.id}: ${correct} correct options`);
      ok(
        !!q.prompt.en && !!q.hint.en && !!q.why.en,
        `${quiz.id}/${q.id}: missing prompt/hint/explanation`
      );
    }
    for (const q of run.questions) {
      if (q.carId) {
        ok(!!q.image, `${quiz.id}/${q.id}: has a car but no image resolved`);
      }
      if (q.category === "guess" || q.category === "price") {
        ok(q.spoiler, `${quiz.id}/${q.id}: a guess/price question must not reveal its photo`);
      }
    }

    // A different seed must deal a different order at least sometimes.
    const again = lib.prepareRun(quiz.id, { seedNonce: 99 });
    ok(
      !!again && again.questions.length === quiz.count,
      `${quiz.id}: reseeding broke the run`
    );
  }

  const daily = lib.prepareRun("daily", { day: "2026-03-01" });
  ok(!!daily && daily.questions.length === lib.DAILY_COUNT, "daily run has the wrong size");
  const daily2 = lib.prepareRun("daily", { day: "2026-03-02" });
  ok(
    !!daily && !!daily2 && daily.questions[0]?.id !== daily2.questions[0]?.id,
    "the daily quiz repeats the same first question the next day"
  );
  ok(lib.prepareRun("does-not-exist") === null, "an unknown quiz must not produce a run");

  // ----------------------------------------------------------
  // 2. Economy
  // ----------------------------------------------------------
  ok(
    JSON.stringify(lib.POINTS_PER_CORRECT) ===
      JSON.stringify({ easy: 50, medium: 100, hard: 175, expert: 250, insane: 400 }),
    `point values drifted: ${JSON.stringify(lib.POINTS_PER_CORRECT)}`
  );
  ok(
    JSON.stringify(lib.HINT_COST) ===
      JSON.stringify({ easy: 25, medium: 50, hard: 75, expert: 100, insane: 125 }),
    `hint costs drifted: ${JSON.stringify(lib.HINT_COST)}`
  );
  ok(
    JSON.stringify(lib.PREMIUM_TIERS) ===
      JSON.stringify({ easy: 400, medium: 750, hard: 1500, expert: 3000, insane: 5000 }),
    `premium tiers drifted: ${JSON.stringify(lib.PREMIUM_TIERS)}`
  );
  ok(
    [2, 5, 10, 20, 30, 50, 100].every(
      (lvl) => lib.cumulativeXpForLevel(lvl) > lib.cumulativeXpForLevel(lvl - 1)
    ),
    "the level curve is not strictly increasing"
  );
  ok(
    lib.levelInfo(0).level === 1 && lib.levelInfo(60).level === 2,
    `level boundaries are wrong (0→${lib.levelInfo(0).level}, 60→${lib.levelInfo(60).level})`
  );
  ok(
    lib.STREAK_BONUSES.map((b) => b.at).join() === "3,5,10",
    "streak bonus thresholds drifted"
  );

  // ----------------------------------------------------------
  // 3. Progression, unlocks, achievements
  // ----------------------------------------------------------
  storage.clear();
  ok(
    lib.emptyPlayer().points === 100,
    `new players should start with 100 points, got ${lib.emptyPlayer().points}`
  );
  ok(
    lib.emptyPlayer().points < Math.min(...Object.values(lib.PREMIUM_TIERS)),
    "the welcome balance must not be enough to unlock anything"
  );

  // A perfect 8-question medium run: 8×100 + streak bonuses (3,5) + perfect.
  const first = lib.recordRun({
    quizId: "warm-up-lap",
    difficulty: "medium",
    score: 8,
    total: 8,
    bestStreak: 8,
    hintsUsed: 0,
    hintSpend: 0,
    premium: false,
  });
  const expectedFirst = 8 * 100 + 100 + 250 + lib.PERFECT_BONUS;
  ok(
    first.points >= expectedFirst,
    `perfect run paid ${first.points}, expected at least ${expectedFirst}`
  );
  ok(first.player.totalCorrect === 8, "totalCorrect was not recorded");
  ok(first.player.streak === 1, "first play of the day must start a 1-day streak");
  ok(
    first.newAchievements.some((a) => a.id === "first_race"),
    "FIRST RACE achievement did not fire"
  );
  ok(
    first.newAchievements.some((a) => a.id === "perfect_score"),
    "PERFECT SCORE achievement did not fire"
  );

  // Replaying the same quiz the same day must pay far less.
  const replay = lib.recordRun({
    quizId: "warm-up-lap",
    difficulty: "medium",
    score: 8,
    total: 8,
    bestStreak: 8,
    hintsUsed: 0,
    hintSpend: 0,
    premium: false,
  });
  ok(
    replay.points < first.points / 2,
    `replay paid ${replay.points} vs first run ${first.points} — not throttled`
  );

  // Hints cost points and cannot be bought without a balance.
  const balanceBefore = lib.getPlayer().points;
  ok(lib.spendPoints(lib.HINT_COST.medium) === true, "spendPoints refused an affordable hint");
  ok(
    lib.getPlayer().points === balanceBefore - lib.HINT_COST.medium,
    "hint did not deduct the right amount"
  );
  ok(
    lib.spendPoints(balanceBefore * 10 + 1) === false,
    "spendPoints allowed an unaffordable hint"
  );

  // Premium unlock: not enough points, then enough.
  const broke = lib.unlockPremiumQuiz("premium-ultimate-supercars", 5000);
  ok(broke.ok === false && broke.reason === "insufficient", "unlock succeeded without funds");
  lib.getPlayer().points = 5000;
  const bought = lib.unlockPremiumQuiz("premium-ultimate-supercars", 5000);
  ok(bought.ok === true, "unlock failed with sufficient funds");
  ok(
    lib.getPlayer().unlocked.includes("premium-ultimate-supercars"),
    "unlocked quiz was not stored"
  );
  ok(
    lib.unlockPremiumQuiz("premium-ultimate-supercars", 5000).reason === "already",
    "the same quiz can be bought twice"
  );

  // Daily quiz flag.
  ok(lib.isDailyDone() === false, "daily should not be marked done yet");
  lib.recordRun({
    quizId: "daily",
    difficulty: "medium",
    score: 3,
    total: lib.DAILY_COUNT,
    bestStreak: 3,
    hintsUsed: 0,
    hintSpend: 0,
    premium: false,
    daily: true,
  });
  ok(lib.isDailyDone() === true, "daily was not marked done after playing");
  ok(lib.getPlayer().daily.day === lib.dayKey(), "daily record has the wrong day");

  // Achievements all have sane rewards and unique ids.
  const ids = new Set(lib.ACHIEVEMENTS.map((a) => a.id));
  ok(ids.size === lib.ACHIEVEMENTS.length, "duplicate achievement ids");

  // ----------------------------------------------------------
  // 4. Session persistence
  // ----------------------------------------------------------
  storage.clear();
  const run = lib.prepareRun("silhouette", { seedNonce: 42 });
  const session = lib.createSession(run, 42);
  session.index = 3;
  session.answers = session.answers.map((a, i) => (i < 3 ? (i % 4) : a));
  session.score = 2;
  lib.saveSession(session);
  const restored = lib.loadSession();
  ok(!!restored, "session did not persist");
  ok(restored.index === 3 && restored.score === 2, "session lost its progress");
  const rebuilt = lib.prepareRun("silhouette", { seedNonce: restored.seedNonce });
  ok(
    !!rebuilt &&
      rebuilt.questions.every((q, i) => q.id === restored.questionIds[i]),
    "a resumed session does not line up with the same questions"
  );
  lib.clearSession();
  ok(lib.loadSession() === null, "clearSession did not clear");

  ok(lib.msUntilNextDay() > 0 && lib.msUntilNextDay() <= 86_400_000, "countdown is out of range");

  // ----------------------------------------------------------
  // 5. The real components render, in every language
  // ----------------------------------------------------------
  const LANGS = ["en", "fr", "es", "de", "it", "pt", "nl", "ar", "ja", "zh"];
  const RAW_KEY = /\b(?:quiz|diff|cat|lvl|ach|nav)_[a-z0-9_]+/;
  const PLACEHOLDER = /\{[a-z]+\}/;

  for (const lang of LANGS) {
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/car-quiz"] },
        React.createElement(lib.QuizPage, { lang })
      )
    );
    ok(html.length > 20000, `${lang}: hub rendered suspiciously little HTML`);
    const leaked = html.match(RAW_KEY);
    ok(!leaked, `${lang}: untranslated key rendered — ${leaked && leaked[0]}`);
    const ph = html.match(PLACEHOLDER);
    ok(!ph, `${lang}: unrendered placeholder — ${ph && ph[0]}`);
    ok(
      html.includes("quiz-seo-how") && html.includes("quiz-seo-faq"),
      `${lang}: the crawlable SEO sections are missing`
    );
  }

  // The full page shell: navigation + footer must render the quiz entry in
  // the right place, in every language, with no leaked keys.
  const shellProps = {
    lang: "en",
    onLangChange: () => {},
    onCompare: () => {},
    onSearch: () => {},
    onOpenCar: () => {},
    onOpenStory: () => {},
    onCompareCar: () => {},
  };
  for (const lang of LANGS) {
    const shell = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/car-quiz"] },
        React.createElement(lib.CarQuizPage, { ...shellProps, lang })
      )
    );
    ok(shell.includes('href="/car-quiz"'), `${lang}: the shell has no quiz link`);
    ok(!RAW_KEY.test(shell), `${lang}: the shell leaked a translation key`);
  }

  // Order in the desktop bar: EXPLORE -> CARVIBES QUIZ -> BRANDS
  const shellHtml = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/car-quiz"] },
      React.createElement(lib.CarQuizPage, shellProps)
    )
  );
  const posExplore = shellHtml.indexOf(">EXPLORE<");
  const posQuiz = shellHtml.indexOf(">QUIZ<");
  const posBrands = shellHtml.indexOf(">BRANDS<");
  ok(
    posExplore > -1 && posQuiz > -1 && posBrands > -1,
    "nav links missing from the rendered shell"
  );
  ok(
    posExplore > -1 && posExplore < posQuiz && posQuiz < posBrands,
    `quiz button is not between EXPLORE and BRANDS (${posExplore}, ${posQuiz}, ${posBrands})`
  );
  ok(
    /<footer[\s\S]*href="\/car-quiz"/.test(shellHtml),
    "the footer has no link to the quiz"
  );

  // Regression: the pre-existing pages must still render after the nav,
  // footer, i18n and CSS changes the quiz required.
  for (const [name, Component] of [
    ["ExplorePage", lib.ExplorePage],
    ["BrandsPage", lib.BrandsPage],
    ["ContactPage", lib.ContactPage],
    ["PrivacyPage", lib.PrivacyPage],
    ["TermsPage", lib.TermsPage],
  ]) {
    let html = "";
    try {
      html = renderToStaticMarkup(
        React.createElement(
          MemoryRouter,
          { initialEntries: ["/"] },
          React.createElement(Component, shellProps)
        )
      );
    } catch (error) {
      ok(false, `${name} threw while rendering: ${error.message}`);
      continue;
    }
    ok(html.length > 5000, `${name} rendered almost nothing (${html.length} bytes)`);
    ok(html.includes("<footer"), `${name} lost the site footer`);
    ok(html.includes('href="/car-quiz"'), `${name} lost the quiz nav entry`);
  }

  // ---------------------------------------------------------------
  // The MAIN SITE header: the quiz button must be present on the
  // homepage itself, between EXPLORE and BRANDS, and light up on
  // /car-quiz.
  // ---------------------------------------------------------------
  const homeProps = { lang: "en", onLangChange: () => {} };
  const renderAt = (pathname, props = homeProps) =>
    renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: [pathname] },
        React.createElement(lib.Homepage, props)
      )
    );

  const home = renderAt("/");
  const homeExplore = home.indexOf(">EXPLORE<");
  const homeQuiz = home.indexOf(">QUIZ<");
  const homeBrands = home.indexOf(">BRANDS<");
  ok(homeExplore > -1, "homepage header has no EXPLORE link");
  ok(homeQuiz > -1, "homepage header has no QUIZ button");
  ok(homeBrands > -1, "homepage header has no BRANDS link");
  ok(
    homeExplore > -1 && homeExplore < homeQuiz && homeQuiz < homeBrands,
    `homepage header order is wrong (EXPLORE ${homeExplore}, QUIZ ${homeQuiz}, BRANDS ${homeBrands})`
  );
  ok(
    /<a[^>]+href="\/car-quiz"[^>]*>/.test(home),
    "the homepage quiz button does not link to /car-quiz"
  );
  // The full label appears from xl upwards, in the same nav.
  ok(home.includes(">CARVIBES QUIZ<"), "homepage header has no full CARVIBES QUIZ label");
  // Mobile menu row (rendered in the DOM for every breakpoint).
  ok(
    (home.match(/href="\/car-quiz"/g) || []).length >= 2,
    "the quiz entry is missing from the mobile menu on the homepage"
  );

  // Attribute order in the rendered markup is not fixed, so pull the whole
  // tag first and read its class list out of that.
  const quizTags = (html) =>
    [...html.matchAll(/<a\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((tag) => /href="\/car-quiz"/.test(tag));
  const classOf = (tag) => (tag || "").match(/class="([^"]*)"/)?.[1] ?? "";

  const activeTags = quizTags(renderAt("/car-quiz"));
  ok(activeTags.length > 0, "no quiz anchor found when on /car-quiz");
  const activeClass = classOf(activeTags[0]);
  ok(
    /border-accent bg-accent/.test(activeClass),
    `the quiz button has no active state on /car-quiz — class="${activeClass}"`
  );
  const idleClass = classOf(quizTags(home)[0]);
  ok(
    /border-accent\/40/.test(idleClass) && !/bg-accent /.test(idleClass),
    `the quiz button is not in its idle style on the homepage — class="${idleClass}"`
  );
  ok(
    /active:scale-\[0\.97\]/.test(idleClass) && /transition-all/.test(idleClass),
    "the quiz button has no press/transition styling"
  );
  ok(
    /focus-visible:outline-accent/.test(idleClass),
    "the quiz button has no visible focus ring"
  );

  const hub = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/car-quiz"] },
      React.createElement(lib.QuizPage, { lang: "en" })
    )
  );
  // Question content is authored in EN/FR/ES only — every other language
  // must say so instead of silently mixing languages.
  for (const lang of LANGS) {
    const page = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/car-quiz"] },
        React.createElement(lib.QuizPage, { lang })
      )
    );
    const authored = ["en", "fr", "es"].includes(lang);
    ok(
      authored ? !page.includes("quiz_lang_notice") : /quiz_lang_notice|border-l-2 border-accent/.test(page),
      `${lang}: language-scope notice is ${authored ? "shown but should not be" : "missing"}`
    );
  }

  // Structural hygiene on the rendered hub.
  const hubIds = [...hub.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupeIds = hubIds.filter((id, i) => hubIds.indexOf(id) !== i);
  ok(dupeIds.length === 0, `duplicate element ids in the hub: ${dupeIds.join(", ")}`);
  // Decorative rules and bar segments are empty by design; a real text
  // element rendering empty would mean a missing string.
  const emptyText = [...hub.matchAll(/<(p|li|dd|dt|h[1-6])([^>]*)>\s*<\/\1>/g)].filter(
    (m) => !/aria-hidden="true"/.test(m[2])
  );
  ok(
    emptyText.length === 0,
    `the hub renders ${emptyText.length} empty text element(s): ${emptyText
      .slice(0, 3)
      .map((m) => m[0])
      .join(" | ")}`
  );
  ok((hub.match(/<section/g) || []).length >= 7, "the hub is missing whole sections");

  const hubText = hub.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  ok(
    hubText.includes("Car Quiz – Automotive Trivia & Car Knowledge"),
    `hub H1 is not the required title — got: ${hubText.slice(0, 160)}`
  );
  for (const heading of [
    "Test Your Automotive Knowledge",
    "Car Quiz Categories",
    "Difficulty Levels",
    "Featured Car Quizzes",
    "How CarVibes Quiz Works",
  ]) {
    ok(hub.includes(heading), `hub is missing the "${heading}" section`);
  }
  ok(/FEATURED QUIZ/.test(hub), "no featured quiz block");
  ok(/PREMIUM COLLECTION/.test(hub), "no premium collection block");
  ok(/DAILY CAR QUIZ/.test(hub), "no daily quiz block");
  ok(/ACHIEVEMENTS/.test(hub), "no achievements block");
  ok((hub.match(/🔒/g) || []).length >= 7, "locked premium quizzes are not shown as locked");
  ok(hub.includes('href="/explore"'), "no internal link to Explore");
  ok(hub.includes('href="/find-my-car"'), "no internal link to Find My Car");
  ok(/href="\/car\/[a-z0-9-]+"/.test(hub), "no internal links to car pages");

  // Player
  const playRun = lib.prepareRun("silhouette", { seedNonce: 5 });
  const playerHtml = renderToStaticMarkup(
    React.createElement(lib.QuizPlayer, {
      lang: "en",
      run: playRun,
      initialSession: lib.createSession(playRun, 5),
      onExit: () => {},
      onFinish: () => {},
    })
  );
  ok(/QUESTION 01\/08/.test(playerHtml), "player does not show the question counter");
  ok((playerHtml.match(/<button/g) || []).length >= 6, "player is missing its buttons");
  ok(
    /quiz-arena/.test(playerHtml) && /object-cover/.test(playerHtml),
    "player renders no image area"
  );
  ok(/HINT/.test(playerHtml), "no hint button");
  ok(/−25 ⭐|−50 ⭐|−75 ⭐|−100 ⭐|−125 ⭐/.test(playerHtml), "hint cost is not displayed");
  ok(!RAW_KEY.test(playerHtml), "player leaked a translation key");
  ok(playerHtml.includes("quiz-option-in"), "options are not animated in");

  // A run resumed mid-question must show the reveal + explanation again.
  const resumed = lib.createSession(playRun, 5);
  resumed.index = 2;
  const wrongIndex = playRun.questions[2].options.findIndex((o) => !o.correct);
  resumed.answers = resumed.answers.map((a, i) => (i === 2 ? wrongIndex : a));
  resumed.selected = wrongIndex;
  resumed.phase = "answered";
  const resumedHtml = renderToStaticMarkup(
    React.createElement(lib.QuizPlayer, {
      lang: "en",
      run: playRun,
      initialSession: resumed,
      onExit: () => {},
      onFinish: () => {},
    })
  );
  ok(/QUESTION 03\/08/.test(resumedHtml), "resumed run shows the wrong question number");
  ok(/CORRECT ANSWER:/.test(resumedHtml), "resumed run does not reveal the right answer");
  ok(/INCORRECT/.test(resumedHtml), "resumed run does not show the incorrect state");

  // Results
  storage.clear();
  const scoreRun = lib.prepareRun("pit-lane", { seedNonce: 11 });
  const result = lib.recordRun({
    quizId: scoreRun.key,
    difficulty: scoreRun.difficulty,
    score: 6,
    total: scoreRun.questions.length,
    bestStreak: 4,
    hintsUsed: 1,
    hintSpend: 50,
    premium: false,
  });
  const resultsHtml = renderToStaticMarkup(
    React.createElement(lib.ResultsScreen, {
      lang: "en",
      run: scoreRun,
      result,
      player: result.player,
      correctIds: scoreRun.questions.slice(0, 6).map((q) => q.id),
      onPlayAgain: () => {},
      onNextQuiz: () => {},
      onHub: () => {},
      nextQuizTitle: "SILHOUETTE",
    })
  );
  ok(/RESULTS/.test(resultsHtml), "results screen has no heading");
  ok(/PLAY AGAIN/.test(resultsHtml), "results screen has no PLAY AGAIN button");
  ok(/NEXT QUIZ/.test(resultsHtml), "results screen has no NEXT QUIZ button");
  ok(/BACK TO QUIZ HUB|QUIZ HUB/.test(resultsHtml), "results screen has no hub button");
  ok(/ANSWER REVIEW/.test(resultsHtml), "results screen has no answer review");
  ok((resultsHtml.match(/✓/g) || []).length >= 6, "correct answers are not marked in the review");
  ok(!RAW_KEY.test(resultsHtml), "results screen leaked a translation key");

  // HUD
  const hudHtml = renderToStaticMarkup(
    React.createElement(lib.PlayerHud, { lang: "en", player: result.player })
  );
  ok(/CARVIBES QUIZ/.test(hudHtml), "HUD has no wordmark");
  ok(/LVL/.test(hudHtml), "HUD has no level");
  ok(/progressbar/.test(hudHtml), "HUD has no XP progress bar");

  // ----------------------------------------------------------
  // Report
  // ----------------------------------------------------------
  if (failures.length) {
    console.error(`[smoke-quiz] ${failures.length} of ${checks} checks FAILED:`);
    for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(
    `[smoke-quiz] OK — ${checks} checks passed across ` +
      `${lib.QUIZZES.length} quizzes, ${lib.ACHIEVEMENTS.length} achievements, ` +
      `${LANGS.length} languages, and the hub / player / results components.`
  );
}

main().catch((error) => {
  console.error(`[smoke-quiz] ${error.stack || error.message}`);
  process.exit(1);
});
