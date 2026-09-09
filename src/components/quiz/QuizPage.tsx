import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { useEscapeToClose, useBodyScrollLock } from "../../lib/useOverlay";
import { useReveal } from "../../lib/useReveal";
import { QUIZZES, maxReward, quizById } from "../../lib/quiz/quizzes";
import { QUIZ_CATEGORIES } from "../../lib/quiz/data/categories";
import { QUESTIONS } from "../../lib/quiz/data";
import {
  isDailyDone,
  isPremiumUnlocked,
  recordRun,
  unlockPremiumQuiz,
  usePlayer,
  type RunResult,
} from "../../lib/quiz/progress";
import { clearSession, createSession, loadSession, type QuizSession } from "../../lib/quiz/session";
import { nextQuizKey, prepareRun, pick, type RunSpec } from "../../lib/quiz/run";
import type { Difficulty, QuizDef } from "../../lib/quiz/types";
import PlayerHud from "./PlayerHud";
import QuizCard from "./QuizCard";
import QuizPlayer, { type RunStats } from "./QuizPlayer";
import ResultsScreen from "./ResultsScreen";
import LevelUpOverlay from "./LevelUpOverlay";
import AchievementsSection from "./AchievementsSection";
import DailyQuizCard from "./DailyQuizCard";
import QuizSeoSections from "./QuizSeoSections";
import {
  DifficultyBadge,
  formatNumber,
  GhostButton,
  PrimaryButton,
} from "./parts";

type FilterKey = "all" | "free" | "locked" | Difficulty;

/**
 * Languages the question bank itself is written in. Everything else in the
 * quiz is translated into all ten site languages; where a question has no
 * translation the player is told so instead of getting a silently mixed
 * interface. `npm run validate:quiz` enforces this list.
 */
const QUESTION_LANGS = new Set(["en", "fr", "es"]);

const FILTERS: { key: FilterKey; labelKey: string }[] = [
  { key: "all", labelKey: "quiz_filter_all" },
  { key: "free", labelKey: "quiz_filter_free" },
  { key: "locked", labelKey: "quiz_filter_locked" },
  { key: "easy", labelKey: "diff_easy" },
  { key: "medium", labelKey: "diff_medium" },
  { key: "hard", labelKey: "diff_hard" },
  { key: "expert", labelKey: "diff_expert" },
  { key: "insane", labelKey: "diff_insane" },
];

/**
 * /car-quiz — the CarVibes Quiz hub and game.
 *
 * The URL drives the mode: `/car-quiz` is the crawlable hub,
 * `/car-quiz?play=<quizId>` (or `?play=daily`) is a live run, so a run
 * survives a refresh and can be shared. Player progression lives in
 * `usePlayer()`, the in-flight run in `session.ts`.
 */
export default function QuizPage({ lang }: { lang: Lang }) {
  const [params, setParams] = useSearchParams();
  const player = usePlayer();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [unlockId, setUnlockId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [levelUp, setLevelUp] = useState<{ level: number; xp: number } | null>(
    null
  );
  const [state, setState] = useState<{
    run: RunSpec | null;
    session: QuizSession | null;
    result: RunResult | null;
    correctIds: string[];
  }>({ run: null, session: null, result: null, correctIds: [] });

  const playKey = params.get("play");
  useReveal([lang, filter, state.run?.key]);

  // ------------------------------------------------------------
  // Start / resume a run whenever ?play changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (state.result) return; // results are on screen — leave them alone
    if (!playKey) {
      setState({ run: null, session: null, result: null, correctIds: [] });
      return;
    }

    const daily = playKey === "daily";
    const quiz = daily ? null : quizById(playKey);

    if (!daily && !quiz) {
      setNotice(t(lang, "quiz_error_missing"));
      setParams({}, { replace: true });
      return;
    }
    if (quiz?.premium && !isPremiumUnlocked(player, quiz.id)) {
      setNotice(t(lang, "quiz_error_locked"));
      setParams({}, { replace: true });
      return;
    }
    if (daily && isDailyDone(player)) {
      setNotice(t(lang, "quiz_daily_done"));
      setParams({}, { replace: true });
      return;
    }

    // Resume the saved session when it belongs to this run, otherwise
    // deal a fresh set of questions.
    const saved = loadSession();

    if (saved && saved.runKey === playKey) {
      const restored = prepareRun(playKey, {
        seedNonce: saved.seedNonce,
        day: new Date().toISOString().slice(0, 10),
      });
      const sameQuestions =
        restored &&
        restored.questions.length === saved.questionIds.length &&
        restored.questions.every((q, i) => q.id === saved.questionIds[i]);
      if (restored && sameQuestions) {
        setNotice(t(lang, "quiz_resumed"));
        setState({ run: restored, session: saved, result: null, correctIds: [] });
        return;
      }
    }

    const nonce = Math.floor(Math.random() * 1_000_000);
    const run = prepareRun(playKey, {
      seedNonce: nonce,
      day: new Date().toISOString().slice(0, 10),
    });
    if (!run || !run.questions.length) {
      setNotice(t(lang, "quiz_error_empty"));
      setParams({}, { replace: true });
      return;
    }
    setState({ run, session: createSession(run, nonce), result: null, correctIds: [] });
    // `player` is intentionally excluded: unlocks/daily state are read
    // through getPlayer() and the guards above on entry only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey, lang, state.result]);

  // Auto-dismiss the status line.
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);

  const startQuiz = useCallback(
    (id: string) => {
      clearSession();
      setNotice(null);
      setLevelUp(null);
      setState({ run: null, session: null, result: null, correctIds: [] });
      setParams({ play: id });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams]
  );

  const exitToHub = useCallback(() => {
    clearSession();
    setParams({}, { replace: true });
    setState({ run: null, session: null, result: null, correctIds: [] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setParams]);

  const handleFinish = useCallback(
    (stats: RunStats) => {
      const run = state.run;
      if (!run) return;
      const result = recordRun({
        quizId: run.key,
        difficulty: run.difficulty,
        score: stats.score,
        total: stats.total,
        bestStreak: stats.bestStreak,
        hintsUsed: stats.hintsUsed,
        hintSpend: stats.hintSpend,
        premium: run.premium,
        daily: run.isDaily,
      });
      const correctIds = stats.correctIds;
      clearSession();
      setFlashKey((k) => k + 1);
      setState((prev) => ({ ...prev, result, correctIds }));
      if (result.levelAfter > result.levelBefore) {
        setLevelUp({ level: result.levelAfter, xp: result.player.xp });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [state.run]
  );

  const requestUnlock = useCallback((id: string) => {
    setUnlockId(id);
  }, []);

  const confirmUnlock = useCallback(() => {
    const quiz = unlockId ? quizById(unlockId) : null;
    if (!quiz) {
      setUnlockId(null);
      return;
    }
    const outcome = unlockPremiumQuiz(quiz.id, quiz.cost ?? 0);
    if (outcome.ok) {
      setFlashKey((k) => k + 1);
      setNotice(t(lang, "quiz_unlocked_ok", { name: pick(quiz.title, lang) }));
      setUnlockId(null);
      window.setTimeout(() => startQuiz(quiz.id), 650);
    } else {
      setNotice(
        outcome.reason === "insufficient"
          ? t(lang, "quiz_not_enough_points", {
              count: formatNumber(quiz.cost ?? 0, lang),
              current: formatNumber(outcome.player.points, lang),
            })
          : t(lang, "quiz_error_missing")
      );
      setUnlockId(null);
    }
  }, [lang, startQuiz, unlockId]);

  // ------------------------------------------------------------
  // Derived hub data
  // ------------------------------------------------------------
  const freeQuizzes = useMemo(() => QUIZZES.filter((q) => !q.premium), []);
  const premiumQuizzes = useMemo(() => QUIZZES.filter((q) => q.premium), []);
  const featured = useMemo(
    () => QUIZZES.find((q) => q.featured) ?? freeQuizzes[0],
    [freeQuizzes]
  );

  const filtered = useMemo(() => {
    const list = QUIZZES.filter((quiz) => {
      const locked = !!quiz.premium && !isPremiumUnlocked(player, quiz.id);
      switch (filter) {
        case "all":
          return true;
        case "free":
          return !locked;
        case "locked":
          return locked;
        default:
          return quiz.difficulty === filter;
      }
    });
    return list;
  }, [filter, player]);

  const nextKey = useMemo(() => {
    if (!state.run) return null;
    return nextQuizKey(state.run.key, player.unlocked);
  }, [player.unlocked, state.run]);

  /**
   * The <h1> must read "Car Quiz – Automotive Trivia & Car Knowledge" for
   * SEO, but as a hero it is shown as a big headline plus a smaller
   * sub-line. The element's text content is unchanged.
   */
  const [h1Main, h1Rest] = useMemo(() => {
    const full = t(lang, "quiz_h1");
    const [main, ...rest] = full.split("–");
    return [
      main.trim(),
      rest.join("–").replace(/\s*\|\s*CarVibes\s*$/i, "").trim(),
    ];
  }, [lang]);

  const completedCount = Object.keys(player.completed).length;
  const unlockedCount = player.unlocked.length;

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  const noticeNode = notice && (
    <p
      role="status"
      className="quiz-in fixed bottom-4 left-1/2 z-[70] w-[min(92vw,520px)] -translate-x-1/2 border border-accent/40 bg-ink/95 px-4 py-3 text-center text-[12px] font-semibold text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur"
    >
      {notice}
    </p>
  );

  if (state.run && state.session && !state.result) {
    return (
      <>
        <div aria-hidden="true" className="h-20" />
        <PlayerHud lang={lang} player={player} flashKey={flashKey} compact />
        <QuizPlayer
          lang={lang}
          run={state.run}
          initialSession={state.session}
          onExit={exitToHub}
          onFinish={handleFinish}
        />
        {noticeNode}
      </>
    );
  }

  if (state.run && state.result) {
    return (
      <>
        <div aria-hidden="true" className="h-20" />
        <PlayerHud lang={lang} player={player} flashKey={flashKey} />
        <ResultsScreen
          lang={lang}
          run={state.run}
          result={state.result}
          player={player}
          correctIds={state.correctIds}
          nextQuizTitle={
            nextKey ? (pick(quizById(nextKey)?.title ?? { en: "", fr: "", es: "" }, lang) || null) : null
          }
          onPlayAgain={() => startQuiz(state.run!.key)}
          onNextQuiz={() => nextKey && startQuiz(nextKey)}
          onHub={exitToHub}
        />
        {levelUp && (
          <LevelUpOverlay
            lang={lang}
            level={levelUp.level}
            xp={levelUp.xp}
            onClose={() => setLevelUp(null)}
          />
        )}
        {noticeNode}
      </>
    );
  }

  return (
    <div className="relative">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden quiz-arena">
        <div aria-hidden="true" className="quiz-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1480px] px-5 pb-10 pt-24 sm:px-8 sm:pt-28 lg:px-16 lg:pb-14">
          <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.24em] text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            {t(lang, "quiz_title")}
          </p>

          <h1 className="reveal mt-5 max-w-4xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-[0.01em] text-white sm:text-6xl lg:text-7xl">
            <span className="block">{h1Main}</span>
            {h1Rest && (
              <span className="mt-3 block text-[0.34em] font-bold leading-tight tracking-[0.16em] text-mist sm:mt-4 sm:text-[0.3em]">
                <span aria-hidden="true">–&nbsp;</span>
                {h1Rest}
              </span>
            )}
          </h1>
          <p className="reveal mt-5 max-w-2xl text-base leading-relaxed text-mist sm:text-lg" data-delay="80">
            {t(lang, "quiz_tagline")}
          </p>

          {!QUESTION_LANGS.has(lang) && (
            <p
              className="reveal mt-4 max-w-2xl border-l-2 border-accent/50 pl-3 text-[12px] leading-relaxed text-mist"
              data-delay="110"
            >
              {t(lang, "quiz_lang_notice")}
            </p>
          )}

          <div className="reveal mt-8 flex flex-wrap items-center gap-3" data-delay="140">
            <PrimaryButton onClick={() => startQuiz(featured.id)} className="h-12 px-6">
              {t(lang, "quiz_start_playing")}
              <span aria-hidden="true">→</span>
            </PrimaryButton>
            <GhostButton
              onClick={() => document.getElementById("quiz-collection")?.scrollIntoView({ behavior: "smooth" })}
              className="h-12 px-6"
            >
              {t(lang, "quiz_browse_quizzes")}
            </GhostButton>
          </div>

          <dl className="reveal mt-10 grid max-w-3xl grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4" data-delay="200">
            {[
              { label: t(lang, "quiz_stat_questions"), value: formatNumber(QUESTIONS.length, lang) },
              { label: t(lang, "quiz_stat_quizzes"), value: String(QUIZZES.length) },
              { label: t(lang, "quiz_stat_categories"), value: String(QUIZ_CATEGORIES.length) },
              { label: t(lang, "quiz_stat_levels"), value: "100" },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink/80 p-4">
                <dt className="text-[10px] font-semibold tracking-[0.16em] text-fog">{stat.label}</dt>
                <dd className="quiz-tabular mt-1.5 font-display text-2xl font-extrabold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          {completedCount > 0 && (
            <p className="reveal mt-5 text-[11px] font-semibold tracking-[0.16em] text-fog">
              {t(lang, "quiz_progress_summary", {
                count: String(completedCount),
                total: String(QUIZZES.length),
              })}
            </p>
          )}
        </div>
      </section>

      {/* ================= HUD ================= */}
      <PlayerHud lang={lang} player={player} flashKey={flashKey} />

      {/* ================= FEATURED ================= */}
      <section
        aria-labelledby="quiz-featured"
        className="border-t border-line bg-ink py-14 sm:py-20"
      >
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="quiz-featured"
              className="reveal font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
            >
              {t(lang, "quiz_featured_quiz")}
            </h2>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-fog">
              {t(lang, "quiz_reward")}:{" "}
              <span className="quiz-tabular text-white">
                {formatNumber(maxReward(featured), lang)} ⭐
              </span>
            </p>
          </div>
          <div className="mt-6">
            <QuizCard
              quiz={featured}
              lang={lang}
              player={player}
              onPlay={startQuiz}
              onUnlock={requestUnlock}
              size="featured"
            />
          </div>
        </div>
      </section>

      {/* ================= DAILY ================= */}
      <DailyQuizCard lang={lang} player={player} onPlay={() => startQuiz("daily")} />

      {/* ================= CATEGORIES ================= */}
      <section
        aria-labelledby="quiz-categories"
        className="border-t border-line bg-ink py-14 sm:py-20"
      >
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
          <h2
            id="quiz-categories"
            className="reveal font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
          >
            {t(lang, "quiz_categories")}
          </h2>

          <ul className="mt-8 flex flex-wrap gap-2">
            {QUIZ_CATEGORIES.map((category, i) => (
              <li key={category.id} data-delay={i * 30} className="reveal">
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    document
                      .getElementById("quiz-collection")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="cv-btn cv-btn-subtle group inline-flex h-11 items-center gap-2.5 px-4 text-[11px] font-bold tracking-[0.16em] text-mist transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-white"
                >
                  <span aria-hidden="true" className="text-base transition-transform duration-300 group-hover:scale-110">
                    {category.icon}
                  </span>
                  {t(lang, category.nameKey)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= COLLECTION ================= */}
      <section
        id="quiz-collection"
        aria-labelledby="quiz-collection-title"
        className="border-t border-line bg-charcoal/30 py-14 sm:py-20"
      >
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="quiz-collection-title"
              className="reveal font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
            >
              {t(lang, "quiz_collection")}
            </h2>
            <p className="quiz-tabular text-[11px] font-semibold tracking-[0.16em] text-fog">
              {filtered.length} {t(lang, "quiz_quizzes")}
            </p>
          </div>

          {/* filters */}
          <div
            role="group"
            aria-label={t(lang, "quiz_filters")}
            className="mt-6 flex flex-wrap gap-2"
          >
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={active}
                  className={cn(
                    "h-9 border px-3 text-[10px] font-bold tracking-[0.16em] transition-all duration-300",
                    active
                      ? "border-accent bg-accent text-white"
                      : "border-line text-mist hover:border-white/30 hover:text-white"
                  )}
                >
                  {t(lang, f.labelKey).toUpperCase()}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 border border-line bg-ink p-8 text-center text-sm text-mist">
              {t(lang, "quiz_empty_state")}
            </p>
          ) : (
            <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((quiz) => (
                <li key={quiz.id} className="reveal">
                  <QuizCard
                    quiz={quiz}
                    lang={lang}
                    player={player}
                    onPlay={startQuiz}
                    onUnlock={requestUnlock}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ================= PREMIUM ================= */}
      <section
        aria-labelledby="quiz-premium"
        className="border-t border-line bg-ink py-14 sm:py-20"
      >
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
          <div className="reveal border border-accent/25 bg-charcoal/60 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.24em] text-accent">
                  <span className="h-px w-8 bg-accent" aria-hidden="true" />
                  {t(lang, "quiz_locked")}
                </p>
                <h2
                  id="quiz-premium"
                  className="mt-4 font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
                >
                  {t(lang, "quiz_premium_collection")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
                  {t(lang, "quiz_premium_desc")}
                </p>
              </div>
              <p className="quiz-tabular text-[11px] font-semibold tracking-[0.16em] text-fog">
                {t(lang, "quiz_unlocked")}: {unlockedCount} / {premiumQuizzes.length}
              </p>
            </div>

            <ul className="mt-7 divide-y divide-white/5 border border-line bg-ink/60">
              {premiumQuizzes.map((quiz: QuizDef) => {
                const unlocked = isPremiumUnlocked(player, quiz.id);
                const affordable = player.points >= (quiz.cost ?? 0);
                return (
                  <li
                    key={quiz.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-display text-sm font-extrabold uppercase tracking-[0.06em] text-white">
                        {unlocked ? (
                          <span aria-hidden="true" className="text-emerald-300">
                            🔓
                          </span>
                        ) : (
                          <span aria-hidden="true" className="text-fog">
                            🔒
                          </span>
                        )}
                        {pick(quiz.title, lang)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={quiz.difficulty} lang={lang} />
                        <span className="quiz-tabular text-[10px] font-semibold tracking-[0.14em] text-fog">
                          {quiz.count} {t(lang, "quiz_q_short")}
                        </span>
                      </div>
                    </div>

                    {unlocked ? (
                      <PrimaryButton onClick={() => startQuiz(quiz.id)} className="h-10 shrink-0 px-4">
                        {t(lang, "quiz_play")}
                        <span aria-hidden="true">→</span>
                      </PrimaryButton>
                    ) : (
                      <PrimaryButton
                        onClick={() => requestUnlock(quiz.id)}
                        disabled={!affordable}
                        className="h-10 shrink-0 px-4"
                      >
                        <span aria-hidden="true">🔓</span>
                        {formatNumber(quiz.cost ?? 0, lang)} ⭐
                      </PrimaryButton>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 text-[11px] leading-relaxed text-fog">
              {t(lang, "quiz_premium_note")}
            </p>
          </div>
        </div>
      </section>

      {/* ================= ACHIEVEMENTS ================= */}
      <AchievementsSection lang={lang} player={player} />

      {/* ================= SEO / EDITORIAL ================= */}
      <QuizSeoSections lang={lang} />

      {/* ================= UNLOCK CONFIRM ================= */}
      <UnlockDialog
        lang={lang}
        quiz={unlockId ? quizById(unlockId) ?? null : null}
        player={player}
        onCancel={() => setUnlockId(null)}
        onConfirm={confirmUnlock}
      />

      {levelUp && (
        <LevelUpOverlay
          lang={lang}
          level={levelUp.level}
          xp={levelUp.xp}
          onClose={() => setLevelUp(null)}
        />
      )}
      {noticeNode}
    </div>
  );
}

/** Confirmation step before spending points on a premium quiz. */
function UnlockDialog({
  lang,
  quiz,
  player,
  onCancel,
  onConfirm,
}: {
  lang: Lang;
  quiz: QuizDef | null;
  player: ReturnType<typeof usePlayer>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const open = !!quiz;
  useBodyScrollLock(open);
  useEscapeToClose(open ? onCancel : undefined, open);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  if (!quiz) return null;
  const affordable = player.points >= (quiz.cost ?? 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-unlock-title"
      className="fixed inset-0 z-[75] flex items-center justify-center bg-ink/90 px-4 backdrop-blur-sm"
    >
      <div className="quiz-level-in w-full max-w-md border border-accent/40 bg-charcoal p-6 sm:p-8">
        <p className="text-[10px] font-bold tracking-[0.24em] text-accent">
          {t(lang, "quiz_locked")}
        </p>
        <h2
          id="quiz-unlock-title"
          className="mt-4 font-display text-2xl font-extrabold uppercase tracking-[0.03em] text-white"
        >
          {pick(quiz.title, lang)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          {t(lang, "quiz_unlock_confirm", {
            name: pick(quiz.title, lang),
            count: formatNumber(quiz.cost ?? 0, lang),
          })}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-px border border-line bg-line">
          <div className="bg-ink p-3">
            <dt className="text-[10px] font-semibold tracking-[0.16em] text-fog">
              {t(lang, "quiz_unlock_cost")}
            </dt>
            <dd className="quiz-tabular mt-1 font-display text-lg font-bold text-white">
              {formatNumber(quiz.cost ?? 0, lang)} ⭐
            </dd>
          </div>
          <div className="bg-ink p-3">
            <dt className="text-[10px] font-semibold tracking-[0.16em] text-fog">
              {t(lang, "quiz_balance")}
            </dt>
            <dd
              className={cn(
                "quiz-tabular mt-1 font-display text-lg font-bold",
                affordable ? "text-white" : "text-accent"
              )}
            >
              {formatNumber(player.points, lang)} ⭐
            </dd>
          </div>
        </dl>

        {!affordable && (
          <p className="mt-4 text-[12px] font-semibold text-accent">
            {t(lang, "quiz_not_enough_points", {
              count: formatNumber(quiz.cost ?? 0, lang),
              current: formatNumber(player.points, lang),
            })}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            onClick={onConfirm}
            disabled={!affordable}
            className="flex-1"
          >
            {t(lang, "quiz_unlock")}
          </PrimaryButton>
          <GhostButton onClick={onCancel} className="flex-1">
            {t(lang, "quiz_cancel")}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
