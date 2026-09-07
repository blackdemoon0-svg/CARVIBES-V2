import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import {
  DAILY_MULTIPLIER,
  POINTS_PER_CORRECT,
} from "../../lib/quiz/economy";
import { DAILY_COUNT, DAILY_DIFFICULTY } from "../../lib/quiz/quizzes";
import { isDailyDone, msUntilNextDay } from "../../lib/quiz/progress";
import type { PlayerState } from "../../lib/quiz/types";
import { formatNumber, PrimaryButton } from "./parts";

/** HH:MM:SS until the next local midnight. */
function useCountdown(): string {
  const [ms, setMs] = useState(() => msUntilNextDay());
  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * Daily Car Quiz — five questions, one per day, reduced reward.
 * Completing it keeps the day streak alive, which is the real prize.
 */
export default function DailyQuizCard({
  lang,
  player,
  onPlay,
}: {
  lang: Lang;
  player: PlayerState;
  onPlay: () => void;
}) {
  const done = isDailyDone(player);
  const countdown = useCountdown();
  const reward = Math.round(
    DAILY_COUNT * POINTS_PER_CORRECT[DAILY_DIFFICULTY] * DAILY_MULTIPLIER
  );

  return (
    <section
      aria-labelledby="quiz-daily"
      className="border-t border-line bg-charcoal py-12 sm:py-16"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        <div
          className={cn(
            "quiz-in relative overflow-hidden border p-6 sm:p-8",
            done ? "border-emerald-400/25 bg-emerald-400/[0.04]" : "border-accent/35 bg-ink"
          )}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: done
                ? "radial-gradient(70% 120% at 100% 0%, rgba(52,211,153,0.16) 0%, transparent 65%)"
                : "radial-gradient(70% 120% at 0% 0%, rgba(227,38,46,0.22) 0%, transparent 65%)",
            }}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 border border-white/15 px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-white">
                  <span aria-hidden="true" className="quiz-pulse">
                    ●
                  </span>
                  {t(lang, "quiz_daily")}
                </span>
                <span className="quiz-tabular border border-line px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-mist">
                  {DAILY_COUNT} {t(lang, "quiz_q_short")}
                </span>
                <span className="quiz-tabular border border-line px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-mist">
                  {t(lang, "quiz_reward")}: {formatNumber(reward, lang)} ⭐
                </span>
              </div>

              <h2
                id="quiz-daily"
                className="mt-5 font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
              >
                {t(lang, "quiz_daily_title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                {t(lang, "quiz_daily_desc")}
              </p>

              {done ? (
                <p className="mt-5 inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-emerald-300">
                  ✓ {t(lang, "quiz_completed_today")}
                </p>
              ) : (
                <div className="mt-6">
                  <PrimaryButton onClick={onPlay}>
                    {t(lang, "quiz_play_daily")}
                    <span aria-hidden="true">→</span>
                  </PrimaryButton>
                </div>
              )}
            </div>

            <div className="shrink-0 border border-line bg-ink/70 p-5 text-center lg:w-64">
              <p className="text-[10px] font-bold tracking-[0.2em] text-fog">
                {done ? t(lang, "quiz_next_daily") : t(lang, "quiz_resets_in")}
              </p>
              <p className="quiz-tabular mt-3 font-display text-4xl font-extrabold tracking-[0.06em] text-white">
                {countdown}
              </p>
              <p className="mt-3 text-[10px] font-medium tracking-[0.14em] text-fog">
                {t(lang, "quiz_streak")}: 🔥 {player.streak} · {t(lang, "quiz_best")}: 🏆{" "}
                {player.bestScore}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
