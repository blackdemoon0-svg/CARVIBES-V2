import { useMemo } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { levelInfo } from "../../lib/quiz/economy";
import type { PlayerState } from "../../lib/quiz/types";
import type { RunResult } from "../../lib/quiz/progress";
import type { RunSpec } from "../../lib/quiz/run";
import { pick } from "../../lib/quiz/run";
import {
  formatNumber,
  GhostButton,
  PrimaryButton,
  SegmentedBar,
  Stat,
} from "./parts";

/**
 * End-of-run summary: what you scored, what it paid, what you unlocked,
 * and three obvious ways forward.
 */
export default function ResultsScreen({
  lang,
  run,
  result,
  player,
  correctIds,
  onPlayAgain,
  onNextQuiz,
  onHub,
  nextQuizTitle,
}: {
  lang: Lang;
  run: RunSpec;
  result: RunResult;
  player: PlayerState;
  correctIds: string[];
  onPlayAgain: () => void;
  onNextQuiz: () => void;
  onHub: () => void;
  nextQuizTitle: string | null;
}) {
  const score = result.player.completed[run.key]?.score ?? 0;
  const total = run.questions.length;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const info = levelInfo(player.xp);
  const leveledUp = result.levelAfter > result.levelBefore;

  const verdict = useMemo(() => {
    if (result.perfect) return t(lang, "quiz_result_perfect");
    if (accuracy >= 80) return t(lang, "quiz_result_great");
    if (accuracy >= 50) return t(lang, "quiz_result_good");
    return t(lang, "quiz_result_keep");
  }, [accuracy, lang, result.perfect]);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] quiz-arena">
      <div aria-hidden="true" className="quiz-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto w-full max-w-[1040px] px-4 pb-24 pt-8 sm:px-8 sm:pt-12">
        {/* headline */}
        <div className="quiz-in border border-line bg-charcoal/80 p-6 text-center backdrop-blur-sm sm:p-10">
          <p className="text-[10px] font-bold tracking-[0.24em] text-accent">
            {t(lang, "quiz_results")}
          </p>
          <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl">
            {pick(run.title, lang)}
          </h2>
          <p className="mt-2 text-sm text-mist">{verdict}</p>

          <div className="mt-7 flex items-end justify-center gap-2">
            <span className="quiz-tabular font-display text-6xl font-extrabold leading-none text-white sm:text-8xl">
              {score}
            </span>
            <span className="quiz-tabular mb-1 font-display text-2xl font-bold text-fog sm:text-3xl">
              / {total}
            </span>
          </div>

          <div className="mx-auto mt-6 max-w-md">
            <SegmentedBar progress={accuracy / 100} tone={result.perfect ? "gold" : "accent"} />
            <p className="quiz-tabular mt-2 text-[10px] font-semibold tracking-[0.18em] text-fog">
              {t(lang, "quiz_accuracy")}: {accuracy}%
            </p>
          </div>

          {leveledUp && (
            <p className="quiz-in mx-auto mt-6 inline-flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-white">
              <span aria-hidden="true">🎉</span>
              {t(lang, "quiz_level_up_title")} — {t(lang, info.titleKey)}
            </p>
          )}

          {result.replay && (
            <p className="mx-auto mt-4 max-w-md text-[11px] leading-relaxed text-fog">
              {t(lang, "quiz_replay_reduced")}
            </p>
          )}
        </div>

        {/* stats */}
        <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          <div className="bg-charcoal p-4">
            <Stat
              label={t(lang, "quiz_points_earned")}
              value={`+${formatNumber(result.points, lang)}`}
              icon="⭐"
              valueClassName="text-accent"
            />
          </div>
          <div className="bg-charcoal p-4">
            <Stat
              label={t(lang, "quiz_xp_earned")}
              value={`+${formatNumber(result.xp, lang)}`}
              icon="✦"
            />
          </div>
          <div className="bg-charcoal p-4">
            <Stat
              label={t(lang, "quiz_best_streak")}
              value={result.player.bestStreak}
              icon="🔥"
            />
          </div>
          <div className="bg-charcoal p-4">
            <Stat
              label={t(lang, "quiz_level")}
              value={`${result.levelAfter}`}
              icon="◆"
              valueClassName="text-white"
            />
          </div>
        </div>

        {/* level progression */}
        <div className="mt-6 border border-line bg-charcoal/70 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-sm font-extrabold tracking-[0.12em] text-white">
              {t(lang, "quiz_lvl_abbr")} {info.level} · {t(lang, info.titleKey)}
            </p>
            <p className="quiz-tabular text-[11px] font-semibold tracking-[0.14em] text-fog">
              {formatNumber(info.into, lang)} / {formatNumber(info.to - info.from, lang)}{" "}
              {t(lang, "quiz_hud_xp")}
            </p>
          </div>
          <SegmentedBar progress={info.progress} className="mt-3" />
          <p className="mt-3 text-[11px] font-medium tracking-[0.12em] text-fog">
            {t(lang, "quiz_next_level")} {t(lang, info.nextTitleKey)}
          </p>
        </div>

        {/* answer review */}
        <div className="mt-6 border border-line bg-charcoal/70">
          <p className="border-b border-line px-5 py-3 text-[10px] font-bold tracking-[0.2em] text-fog">
            {t(lang, "quiz_review")}
          </p>
          <ul className="divide-y divide-white/5">
            {run.questions.map((q, i) => {
              const ok = correctIds.includes(q.id);
              return (
                <li key={q.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center border text-[11px] font-bold",
                      ok
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                        : "border-accent/50 bg-accent/10 text-white"
                    )}
                    aria-hidden="true"
                  >
                    {ok ? "✓" : "✕"}
                  </span>
                  <span className="quiz-tabular w-8 shrink-0 text-[10px] font-semibold tracking-[0.14em] text-fog">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-mist">
                    {pick(q.prompt, lang)}
                  </span>
                  <span className="quiz-tabular shrink-0 text-[10px] font-bold tracking-[0.14em] text-fog">
                    {ok ? `+${q.reward} ⭐` : "0 ⭐"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* achievements earned this run */}
        {result.newAchievements.length > 0 && (
          <div className="mt-6 border border-amber-300/25 bg-amber-300/[0.06] p-5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-amber-200/90">
              {t(lang, "quiz_achievements_unlocked")}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.newAchievements.map((a) => (
                <li
                  key={a.id}
                  className="quiz-in inline-flex items-center gap-2 border border-amber-300/30 bg-ink/50 px-3 py-2"
                >
                  <span aria-hidden="true" className="text-base">
                    {a.icon}
                  </span>
                  <span className="text-[11px] font-bold tracking-[0.14em] text-white">
                    {t(lang, a.nameKey)}
                  </span>
                  <span className="quiz-tabular text-[10px] font-semibold text-amber-200/80">
                    +{a.points} ⭐
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton onClick={onPlayAgain} className="flex-1">
            {t(lang, "quiz_play_again")}
          </PrimaryButton>
          {nextQuizTitle && (
            <GhostButton onClick={onNextQuiz} className="flex-1">
              {t(lang, "quiz_next_quiz")} · {nextQuizTitle}
            </GhostButton>
          )}
          <GhostButton onClick={onHub} className="flex-1">
            {t(lang, "quiz_back_hub")}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
