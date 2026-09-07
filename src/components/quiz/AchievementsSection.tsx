import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { ACHIEVEMENTS } from "../../lib/quiz/achievements";
import type { PlayerState } from "../../lib/quiz/types";

/**
 * Achievement wall. Unlocked badges are bright, locked ones are visible
 * but muted — knowing what you are playing toward is half the fun.
 */
export default function AchievementsSection({
  lang,
  player,
}: {
  lang: Lang;
  player: PlayerState;
}) {
  const unlocked = new Set(player.achievements);
  const earned = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;

  return (
    <section
      aria-labelledby="quiz-achievements"
      className="border-t border-line bg-ink py-14 sm:py-20"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.24em] text-accent">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              {t(lang, "quiz_achievements")}
            </p>
            <h2
              id="quiz-achievements"
              className="reveal mt-4 font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-5xl"
            >
              {t(lang, "quiz_achievements_heading")}
            </h2>
          </div>
          <p className="quiz-tabular text-[11px] font-semibold tracking-[0.18em] text-fog">
            {earned} / {ACHIEVEMENTS.length} {t(lang, "quiz_unlocked")}
          </p>
        </div>

        <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ACHIEVEMENTS.map((achievement, i) => {
            const got = unlocked.has(achievement.id);
            return (
              <li
                key={achievement.id}
                data-delay={i * 40}
                className={cn(
                  "reveal group flex items-start gap-4 p-5 transition-colors duration-300",
                  got ? "bg-charcoal" : "bg-ink/70"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center border text-xl transition-transform duration-300",
                    got
                      ? "border-amber-300/40 bg-amber-300/10 group-hover:scale-105"
                      : "border-line bg-charcoal/60 grayscale opacity-45"
                  )}
                >
                  {achievement.icon}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-display text-sm font-extrabold uppercase tracking-[0.08em]",
                      got ? "text-white" : "text-fog"
                    )}
                  >
                    {t(lang, achievement.nameKey)}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-mist">
                    {t(lang, achievement.descKey)}
                  </p>
                  <p className="quiz-tabular mt-2 text-[10px] font-bold tracking-[0.16em] text-accent">
                    +{achievement.points} ⭐
                    {achievement.xp > 0 && ` · +${achievement.xp} XP`}
                  </p>
                </div>
                {got && (
                  <span className="ml-auto text-[10px] font-bold tracking-[0.16em] text-emerald-300">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
