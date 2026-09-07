import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { HINT_COST, STREAK_BONUSES } from "../../lib/quiz/economy";
import { getPlayer, spendPoints } from "../../lib/quiz/progress";
import { saveSession, type QuizSession } from "../../lib/quiz/session";
import { pick, type RunSpec } from "../../lib/quiz/run";
import { categoryById } from "../../lib/quiz/data/categories";
import {
  CategoryBadge,
  DifficultyBadge,
  formatNumber,
  GhostButton,
  PrimaryButton,
  SegmentedBar,
} from "./parts";

export interface RunStats {
  score: number;
  total: number;
  bestStreak: number;
  hintsUsed: number;
  hintSpend: number;
  runPoints: number;
  /** Ids of the questions answered correctly — drives the review list. */
  correctIds: string[];
}

interface Feedback {
  correct: boolean;
  chosen: number;
  correctIndex: number;
  points: number;
  streak: number;
  streakBonus: number;
}

const LETTERS = ["A", "B", "C", "D"];

/**
 * The question screen — the part that has to feel like a game.
 *
 * Everything the player sees here is driven by `RunSpec`, and every
 * interaction writes through the shared session so a refresh mid-quiz
 * resumes exactly where it stopped.
 */
export default function QuizPlayer({
  lang,
  run,
  initialSession,
  onExit,
  onFinish,
}: {
  lang: Lang;
  run: RunSpec;
  initialSession: QuizSession;
  onExit: () => void;
  onFinish: (stats: RunStats) => void;
}) {
  const [session, setSession] = useState<QuizSession>(initialSession);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintUsedThisQuestion, setHintUsedThisQuestion] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const answerRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const total = run.questions.length;
  const index = Math.min(session.index, total - 1);
  const question = run.questions[index];
  const answered = session.phase === "answered";
  const isLast = index >= total - 1;
  const earned = session.score;
  const progress = answered ? (index + 1) / total : index / total;

  // Persist every change so the run survives a refresh.
  useEffect(() => {
    saveSession(session);
  }, [session]);

  // Reset transient state when the question changes.
  useEffect(() => {
    setHintOpen(false);
    setHintUsedThisQuestion(false);
    setHintError(null);
    setFeedback(null);
  }, [index]);

  const category = categoryById(question.category);
  const catLabel = category ? t(lang, category.nameKey) : "";

  const choose = useCallback(
    (choice: number) => {
      if (answered || !question) return;
      const option = question.options[choice];
      if (!option) return;

      const correct = option.correct;
      const correctIndex = question.options.findIndex((o) => o.correct);
      const streak = correct ? session.streak + 1 : 0;
      const bonus = correct
        ? STREAK_BONUSES.filter((b) => streak === b.at && b.at <= total).reduce(
            (sum, b) => sum + b.points,
            0
          )
        : 0;

      const answers = session.answers.slice();
      answers[index] = choice;

      setFeedback({
        correct,
        chosen: choice,
        correctIndex,
        points: correct ? question.reward : 0,
        streak,
        streakBonus: bonus,
      });

      if (correct) setFlyKey((k) => k + 1);
      else setShakeKey((k) => k + 1);

      setSession((prev) => ({
        ...prev,
        answers,
        selected: choice,
        phase: "answered",
        score: prev.score + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      }));

      // Bring the explanation into view on small screens.
      window.setTimeout(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
    },
    [answered, index, question, session.answers, session.streak, total]
  );

  const advance = useCallback(() => {
    if (!answered) return;
    if (isLast) {
      onFinish({
        score: session.score,
        total,
        bestStreak: session.bestStreak,
        hintsUsed: session.hintUsed,
        hintSpend: session.hintSpend,
        runPoints: run.maxPoints,
        correctIds: run.questions
          .map((q, i) => {
            const chosen = session.answers[i];
            return chosen !== null && chosen !== undefined && q.options[chosen]?.correct
              ? q.id
              : null;
          })
          .filter((id): id is string => !!id),
      });
      return;
    }
    setSession((prev) => ({
      ...prev,
      index: prev.index + 1,
      selected: null,
      phase: "question",
    }));
    nextRef.current?.blur();
  }, [answered, isLast, onFinish, run.maxPoints, session, total]);

  const useHint = useCallback(() => {
    if (hintUsedThisQuestion || answered) return;
    const cost = HINT_COST[question.difficulty];
    if (getPlayer().points < cost) {
      setHintError(
        t(lang, "quiz_hint_too_expensive", { cost: String(cost) })
      );
      window.setTimeout(() => setHintError(null), 3200);
      return;
    }
    const ok = spendPoints(cost);
    if (!ok) return;
    setHintUsedThisQuestion(true);
    setHintOpen(true);
    setSession((prev) => ({
      ...prev,
      hintUsed: prev.hintUsed + 1,
      hintSpend: prev.hintSpend + cost,
    }));
  }, [answered, hintUsedThisQuestion, lang, question.difficulty]);

  // Keyboard shortcuts: 1–4 / A–D answer, Enter advances.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      // A focused <button> already handles Enter/Space itself; reacting
      // here too would skip a question.
      if (target && target.closest("button")) return;
      if (!answered) {
        const digit = Number(event.key);
        if (digit >= 1 && digit <= 4) {
          event.preventDefault();
          choose(digit - 1);
          return;
        }
        const letter = event.key.toLowerCase();
        const letterIndex = LETTERS.indexOf(letter.toUpperCase());
        if (letterIndex >= 0) {
          event.preventDefault();
          choose(letterIndex);
        }
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, answered, choose]);

  // A run resumed from a saved session arrives with phase "answered" but
  // no in-memory feedback object — rebuild it from the session so the
  // player sees the reveal and the explanation, not a dead-end card.
  const activeFeedback: Feedback | null =
    feedback ??
    (answered && session.selected !== null && question.options[session.selected]
      ? {
          correct: question.options[session.selected].correct,
          chosen: session.selected,
          correctIndex: question.options.findIndex((o) => o.correct),
          points: question.options[session.selected].correct ? question.reward : 0,
          streak: session.streak,
          streakBonus: 0,
        }
      : null);

  const hintCost = HINT_COST[question.difficulty];
  const imageAlt = question.spoiler
    ? t(lang, "quiz_image_alt")
    : (question.imageName ?? t(lang, "quiz_image_alt"));

  const rewardLabel = useMemo(
    () => t(lang, "quiz_potential_reward", { points: String(question.reward) }),
    [lang, question.reward]
  );

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] quiz-arena">
      <div aria-hidden="true" className="quiz-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[1040px] px-4 pb-28 pt-5 sm:px-8 sm:pt-8">
        {/* ---- top bar ---- */}
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onExit}
            className="group inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-fog transition-colors hover:text-white"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            {t(lang, "quiz_exit")}
          </button>

          <div className="text-right">
            <p className="font-display text-sm font-extrabold tracking-[0.1em] text-white sm:text-base">
              {pick(run.title, lang)}
            </p>
            <p className="quiz-tabular mt-1 text-[10px] font-semibold tracking-[0.18em] text-fog">
              {t(lang, "quiz_question_of", {
                current: String(index + 1).padStart(2, "0"),
                total: String(total).padStart(2, "0"),
              })}
            </p>
          </div>
        </div>

        {/* ---- progress ---- */}
        <div className="mt-4">
          <SegmentedBar progress={progress} segments={Math.min(total, 20)} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold tracking-[0.16em] text-fog">
            <span>
              {t(lang, "quiz_score")}:{" "}
              <span className="quiz-tabular text-white">
                {earned}/{index + (answered ? 1 : 0)}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true">🔥</span>
                {t(lang, "quiz_streak")}:{" "}
                <span className="quiz-tabular text-white">{session.streak}</span>
              </span>
              <span className="hidden sm:inline">
                {t(lang, "quiz_potential_reward", {
                  points: formatNumber(run.maxPoints, lang),
                })}
              </span>
            </span>
          </div>
        </div>

        {/* ---- question card ---- */}
        <section
          key={question.id}
          aria-labelledby="quiz-question"
          className="quiz-in mt-5 overflow-hidden border border-line bg-charcoal/80 backdrop-blur-sm"
        >
          {question.image ? (
            <div className="relative h-44 overflow-hidden border-b border-line sm:h-72">
              <img
                src={question.image}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                className={cn(
                  "h-full w-full object-cover transition-transform duration-700",
                  question.spoiler
                    ? "scale-[1.35] blur-[30px] brightness-[0.38] contrast-[1.2] grayscale"
                    : "hover:scale-[1.03]"
                )}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/25 to-transparent"
              />
              {question.spoiler && (
                <>
                  {/* red duotone + vignette: an anonymous shape, not a giveaway */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-accent/25 mix-blend-color"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(70% 70% at 50% 55%, transparent 20%, rgba(8,9,12,0.85) 100%)",
                    }}
                  />
                </>
              )}
              {question.spoiler && (
                <span className="absolute left-4 top-4 border border-white/15 bg-ink/70 px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-white/80 backdrop-blur-sm">
                  {t(lang, "quiz_silhouette")}
                </span>
              )}
            </div>
          ) : (
            /* No car is linked to this question — keep the same card
               geometry with a branded panel instead of an empty gap. */
            <div
              className="relative flex h-32 items-center justify-center overflow-hidden border-b border-line sm:h-40"
              role="img"
              aria-label={t(lang, "quiz_image_alt")}
              style={{
                backgroundImage:
                  "radial-gradient(75% 130% at 50% 0%, rgba(227,38,46,0.22) 0%, transparent 65%), linear-gradient(180deg, #0c0d12 0%, #08090c 100%)",
              }}
            >
              <div aria-hidden="true" className="quiz-grid absolute inset-0 opacity-60" />
              <div className="relative flex flex-col items-center gap-2">
                <span aria-hidden="true" className="text-3xl sm:text-4xl">
                  {category?.icon ?? "◆"}
                </span>
                <p className="text-[10px] font-bold tracking-[0.28em] text-white/70 sm:text-[11px]">
                  {(catLabel || t(lang, "quiz_title")).toUpperCase()}
                </p>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={question.difficulty} lang={lang} />
              <CategoryBadge category={question.category} lang={lang} />
              <span className="ml-auto inline-flex items-center gap-1.5 border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-white">
                <span aria-hidden="true">+{question.reward} ⭐</span>
                <span className="sr-only">{rewardLabel}</span>
              </span>
            </div>

            <h2
              id="quiz-question"
              className="mt-4 font-display text-xl font-extrabold uppercase leading-snug tracking-[0.01em] text-white sm:text-2xl"
            >
              {pick(question.prompt, lang)}
            </h2>

            <p className="sr-only">{catLabel}</p>
          </div>
        </section>

        {/* ---- hint ---- */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={useHint}
              disabled={hintUsedThisQuestion || answered}
              aria-expanded={hintOpen}
              className={cn(
                "quiz-sheen inline-flex h-10 items-center gap-2 border px-4 text-[11px] font-bold tracking-[0.16em] transition-all duration-300",
                hintUsedThisQuestion || answered
                  ? "cursor-not-allowed border-line text-fog"
                  : "border-amber-300/30 bg-amber-300/10 text-amber-200 hover:border-amber-300/60 hover:bg-amber-300/15"
              )}
            >
              <span aria-hidden="true">💡</span>
              {t(lang, "quiz_hint")}
              <span className="quiz-tabular border-l border-amber-200/25 pl-2 text-[10px] opacity-80">
                −{hintCost} ⭐
              </span>
            </button>
            <span className="text-[10px] font-medium tracking-[0.14em] text-fog">
              {hintUsedThisQuestion
                ? t(lang, "quiz_hint_used")
                : t(lang, "quiz_hint_one_per_question")}
            </span>
          </div>

          {hintError && (
            <p
              role="alert"
              className="quiz-in mt-3 border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] font-semibold text-white"
            >
              {hintError}
            </p>
          )}

          {hintOpen && (
            <div className="quiz-in mt-3 border border-amber-300/25 bg-amber-300/[0.06] p-4">
              <p className="text-[10px] font-bold tracking-[0.2em] text-amber-200/80">
                {t(lang, "quiz_hint")} −{hintCost} ⭐
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                {pick(question.hint, lang)}
              </p>
            </div>
          )}
        </div>

        {/* ---- options ---- */}
        <ul className="mt-5 grid gap-2.5">
          {question.options.map((option, i) => {
            const isChosen = activeFeedback?.chosen === i;
            const isCorrectAnswer = activeFeedback?.correctIndex === i;
            const showCorrect = answered && isCorrectAnswer;
            const showWrong = answered && isChosen && !activeFeedback?.correct;

            return (
              <li key={`${question.id}-${i}`}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={answered}
                  aria-pressed={answered ? isChosen : undefined}
                  className={cn(
                    "quiz-option-in group flex w-full items-center gap-3 border px-3 py-3.5 text-left transition-all duration-300 sm:gap-4 sm:px-4 sm:py-4",
                    !answered &&
                      "border-line bg-charcoal/60 hover:translate-x-1 hover:border-white/30 hover:bg-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    answered && !showCorrect && !showWrong && "border-line/60 bg-charcoal/30 opacity-60",
                    showCorrect &&
                      "border-emerald-400/60 bg-emerald-400/10 text-white quiz-pop",
                    showWrong && "border-accent/70 bg-accent/10 text-white"
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center border font-display text-xs font-bold transition-colors",
                      showCorrect
                        ? "border-emerald-400/60 bg-emerald-400/20 text-white"
                        : showWrong
                          ? "border-accent/60 bg-accent/20 text-white"
                          : "border-line text-mist group-hover:border-white/30 group-hover:text-white"
                    )}
                  >
                    {answered && showCorrect ? "✓" : answered && showWrong ? "✕" : LETTERS[i]}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white/90 sm:text-base">
                    {pick(option.text, lang)}
                  </span>
                  {answered && showCorrect && (
                    <span className="quiz-tabular shrink-0 text-[11px] font-bold tracking-[0.14em] text-emerald-300">
                      +{question.reward} ⭐
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* ---- feedback ---- */}
        <div ref={answerRef} className="mt-4 min-h-[2px]">
          {activeFeedback && (
            <div
              key={flyKey || shakeKey}
              className={cn(
                "quiz-in border p-4 sm:p-5",
                activeFeedback.correct
                  ? "border-emerald-400/40 bg-emerald-400/[0.07]"
                  : "border-accent/40 bg-accent/[0.07]"
              )}
            >
              <div className="relative flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center border text-sm font-bold",
                    activeFeedback.correct
                      ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                      : "border-accent/50 bg-accent/15 text-white"
                  )}
                  aria-hidden="true"
                >
                  {activeFeedback.correct ? "✓" : "✕"}
                </span>
                <p className="font-display text-base font-extrabold tracking-[0.1em] text-white">
                  {activeFeedback.correct
                    ? `${t(lang, "quiz_correct")} +${activeFeedback.points} ⭐`
                    : t(lang, "quiz_incorrect")}
                </p>

                {activeFeedback.correct && (
                  <span
                    key={flyKey}
                    aria-hidden="true"
                    className="quiz-fly pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 font-display text-lg font-extrabold text-emerald-300"
                  >
                    +{activeFeedback.points} ⭐
                  </span>
                )}

                {activeFeedback.streakBonus > 0 && (
                  <span className="quiz-streak border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-amber-200">
                    🔥 {t(lang, "quiz_streak_bonus")} +{activeFeedback.streakBonus} ⭐
                  </span>
                )}
              </div>

              {!activeFeedback.correct && (
                <p className="mt-3 text-sm text-white/85">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-fog">
                    {t(lang, "quiz_correct_answer")}
                  </span>{" "}
                  <span className="font-semibold text-emerald-300">
                    {pick(question.options[activeFeedback.correctIndex].text, lang)}
                  </span>
                </p>
              )}

              <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-mist">
                {pick(question.why, lang)}
              </p>

              {question.carId && (
                <a
                  href={`/car/${question.carId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-accent transition-colors hover:text-white"
                >
                  {t(lang, "quiz_see_specs")}
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* ---- next ---- */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-medium tracking-[0.14em] text-fog">
            {answered
              ? t(lang, "quiz_keyboard_next")
              : t(lang, "quiz_keyboard_hint")}
          </p>
          <PrimaryButton
            onClick={advance}
            disabled={!answered}
            className="w-full sm:w-auto"
          >
            {isLast ? t(lang, "quiz_finish") : t(lang, "quiz_next")}
            <span aria-hidden="true">→</span>
          </PrimaryButton>
        </div>

        <div className="mt-6 flex justify-center">
          <GhostButton onClick={onExit} className="h-9 px-4 text-[10px]">
            {t(lang, "quiz_back_hub")}
          </GhostButton>
        </div>

        <p className="mt-6 text-center text-[10px] font-medium tracking-[0.14em] text-fog">
          {t(lang, "quiz_streak_label")}: {session.streak} · {t(lang, "quiz_score")}: {earned}/
          {total} · {t(lang, "quiz_progress")}: {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
}
