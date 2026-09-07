import { useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import type { PlayerState, QuizDef } from "../../lib/quiz/types";
import { maxReward } from "../../lib/quiz/quizzes";
import { isPremiumUnlocked } from "../../lib/quiz/progress";
import {
  CategoryBadge,
  DifficultyBadge,
  formatNumber,
  PrimaryButton,
} from "./parts";

/**
 * One quiz in the collection. Cards are generated purely from the quiz
 * definition, so adding a quiz to `QUIZZES` renders it here automatically.
 *
 * Three states: ready to play, completed (shows the best score) and
 * locked (premium — shows the unlock price before you commit).
 */
export default function QuizCard({
  quiz,
  lang,
  player,
  onPlay,
  onUnlock,
  size = "normal",
}: {
  quiz: QuizDef;
  lang: Lang;
  player: PlayerState;
  onPlay: (id: string) => void;
  onUnlock: (id: string) => void;
  size?: "normal" | "featured";
}) {
  const [busy, setBusy] = useState(false);
  const record = player.completed[quiz.id];
  const unlocked = isPremiumUnlocked(player, quiz.id);
  const locked = !!quiz.premium && !unlocked;
  const reward = maxReward(quiz);
  const affordable = player.points >= (quiz.cost ?? 0);

  const handleUnlock = () => {
    if (busy || !affordable) return;
    setBusy(true);
    onUnlock(quiz.id);
    window.setTimeout(() => setBusy(false), 600);
  };

  if (size === "featured") {
    return (
      <article className="quiz-in relative overflow-hidden border border-line bg-charcoal">
        <div
          className="absolute inset-0 opacity-[0.16]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(60% 120% at 0% 0%, rgba(227,38,46,0.9) 0%, transparent 70%)",
          }}
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-accent px-2 py-1 text-[10px] font-bold tracking-[0.2em] text-white">
                <span aria-hidden="true">★</span>
                {t(lang, "quiz_featured")}
              </span>
              <CategoryBadge category={quiz.category} lang={lang} />
              <DifficultyBadge difficulty={quiz.difficulty} lang={lang} />
            </div>

            <h3 className="mt-5 font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-5xl">
              {quiz.title[lang] ?? quiz.title.en}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
              {quiz.blurb[lang] ?? quiz.blurb.en}
            </p>

            <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                  {t(lang, "quiz_questions")}
                </dt>
                <dd className="quiz-tabular mt-1 font-display text-xl font-bold text-white">
                  {quiz.count}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                  {t(lang, "quiz_reward_max")}
                </dt>
                <dd className="quiz-tabular mt-1 font-display text-xl font-bold text-white">
                  {formatNumber(reward, lang)} ⭐
                </dd>
              </div>
              {record && (
                <div>
                  <dt className="text-[10px] font-semibold tracking-[0.18em] text-fog">
                    {t(lang, "quiz_best_score")}
                  </dt>
                  <dd className="quiz-tabular mt-1 font-display text-xl font-bold text-white">
                    {record.score}/{record.total}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => onPlay(quiz.id)}>
                {record ? t(lang, "quiz_play_again") : t(lang, "quiz_play")}
                <span aria-hidden="true">→</span>
              </PrimaryButton>
              <a
                href="#quiz-seo-how"
                className="inline-flex h-11 items-center justify-center border border-line px-5 text-[11px] font-bold tracking-[0.18em] text-mist transition-all duration-300 hover:border-white/30 hover:text-white"
              >
                {t(lang, "quiz_seo_how_h")}
              </a>
            </div>
          </div>

          <FeaturedPreview quiz={quiz} lang={lang} />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group quiz-sheen relative flex flex-col justify-between gap-5 bg-charcoal p-5 transition-colors duration-300 sm:p-6",
        locked ? "hover:bg-charcoal" : "hover:bg-charcoal/60"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <CategoryBadge category={quiz.category} lang={lang} />
          {locked && (
            <span
              aria-hidden="true"
              className="text-base leading-none opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              title={t(lang, "quiz_locked")}
            >
              🔒
            </span>
          )}
        </div>

        <h3
          className={cn(
            "mt-4 font-display text-xl font-extrabold uppercase leading-tight tracking-[0.02em]",
            locked ? "text-mist" : "text-white"
          )}
        >
          {quiz.title[lang] ?? quiz.title.en}
        </h3>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-mist">
          {quiz.blurb[lang] ?? quiz.blurb.en}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={quiz.difficulty} lang={lang} />
          <span className="quiz-tabular border border-line px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-mist">
            {quiz.count} {t(lang, "quiz_q_short")}
          </span>
          {record && (
            <span className="border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-emerald-300">
              ✓ {record.score}/{record.total}
            </span>
          )}
        </div>

        {locked && !affordable && (
          <p className="mt-4 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2 text-[11px] font-medium leading-snug text-amber-200/90">
            {t(lang, "quiz_not_enough_points", {
              count: String(quiz.cost ?? 0),
              current: formatNumber(player.points, lang),
            })}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-fog">
            {t(lang, "quiz_reward_max")}
          </p>
          <p className="quiz-tabular mt-1 font-display text-lg font-bold text-white">
            {formatNumber(reward, lang)} ⭐
          </p>
        </div>

        {locked ? (
          <PrimaryButton
            onClick={handleUnlock}
            disabled={!affordable || busy}
            className="quiz-unlock h-10 px-4"
            ariaLabel={t(lang, "quiz_unlock", { count: String(quiz.cost ?? 0) })}
          >
            <span aria-hidden="true">🔓</span>
            {formatNumber(quiz.cost ?? 0, lang)} ⭐
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => onPlay(quiz.id)} className="h-10 px-4">
            {record ? t(lang, "quiz_play_again") : t(lang, "quiz_play")}
            <span aria-hidden="true">→</span>
          </PrimaryButton>
        )}
      </div>

    </article>
  );
}

/** Decorative difficulty meter for the featured card. */
function FeaturedPreview({ quiz, lang }: { quiz: QuizDef; lang: Lang }) {
  const tiers = ["easy", "medium", "hard", "expert", "insane"] as const;
  const index = tiers.indexOf(quiz.difficulty);
  return (
    <div className="relative border border-white/10 bg-ink/60 p-5">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(227,38,46,0.10) 0%, transparent 60%)",
        }}
      />
      <p className="relative text-[10px] font-semibold tracking-[0.2em] text-fog">
        {t(lang, "quiz_difficulty_label")}
      </p>
      <div className="relative mt-3 space-y-2">
        {tiers.map((tier, i) => (
          <div key={tier} className="flex items-center gap-3">
            <span
              className={cn(
                "h-1.5 flex-1 transition-all duration-500",
                i <= index ? "bg-accent" : "bg-line"
              )}
            />
            <span
              className={cn(
                "w-20 text-right text-[10px] font-semibold tracking-[0.16em]",
                i === index ? "text-white" : "text-fog"
              )}
            >
              {t(lang, `diff_${tier}`).toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <p className="relative mt-5 text-xs leading-relaxed text-mist">
        {t(lang, `diff_${quiz.difficulty}_sub`)}
      </p>
    </div>
  );
}
