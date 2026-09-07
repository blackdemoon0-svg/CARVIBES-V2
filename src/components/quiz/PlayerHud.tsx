import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { levelInfo } from "../../lib/quiz/economy";
import type { PlayerState } from "../../lib/quiz/types";
import { formatNumber, SegmentedBar } from "./parts";

/**
 * Persistent player HUD.
 *
 * Stays on screen for the whole quiz experience (hub, question, results)
 * but stays compact: on mobile it collapses to one line of numbers plus
 * the XP bar, so the play area never gets squeezed.
 */
export default function PlayerHud({
  lang,
  player,
  /** Bump to flash the balance (points just landed). */
  flashKey = 0,
  compact = false,
}: {
  lang: Lang;
  player: PlayerState;
  flashKey?: number;
  compact?: boolean;
}) {
  const info = levelInfo(player.xp);
  const [flash, setFlash] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 650);
    return () => window.clearTimeout(id);
  }, [flashKey]);

  return (
    <div
      className={cn(
        "glass sticky top-14 z-40 border-y border-white/[0.07] bg-ink/85 backdrop-blur-xl",
        compact ? "py-2.5" : "py-3 sm:py-4"
      )}
    >
      <div className="mx-auto max-w-[1480px] px-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          {/* Wordmark */}
          <p className="flex items-center gap-2 font-display text-sm font-extrabold tracking-[0.22em] text-white sm:text-base">
            <span className="hidden h-2 w-2 bg-accent sm:inline-block" aria-hidden="true" />
            {t(lang, "quiz_title")}
          </p>

          {/* Vitals */}
          <div className="flex flex-1 flex-wrap items-center justify-end gap-x-5 gap-y-2 sm:gap-x-8">
            {/* Points */}
            <div className="flex items-baseline gap-1.5">
              <span aria-hidden="true" className="text-sm">
                ⭐
              </span>
              <span
                className={cn(
                  "quiz-tabular font-display text-lg font-extrabold leading-none text-white sm:text-2xl",
                  flash && "quiz-balance"
                )}
              >
                {formatNumber(player.points, lang)}
              </span>
              <span className="sr-only">{t(lang, "quiz_hud_points")}</span>
            </div>

            {/* Level + title */}
            <div className="flex items-baseline gap-2">
              <span className="border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-display text-[11px] font-bold tracking-[0.12em] text-white">
                {t(lang, "quiz_lvl_abbr")} {info.level}
              </span>
              <span className="hidden text-[10px] font-semibold tracking-[0.18em] text-mist sm:inline">
                {t(lang, info.titleKey)}
              </span>
            </div>

            {/* Streak */}
            <div className="flex items-baseline gap-1.5">
              <span aria-hidden="true" className="text-sm">
                🔥
              </span>
              <span className="quiz-tabular font-display text-base font-bold leading-none text-white sm:text-lg">
                {player.streak}
              </span>
              <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
                {t(lang, "quiz_hud_day_streak")}
              </span>
            </div>

            {/* Best score */}
            <div className="hidden items-baseline gap-1.5 sm:flex">
              <span aria-hidden="true" className="text-sm">
                🏆
              </span>
              <span className="quiz-tabular font-display text-base font-bold leading-none text-white sm:text-lg">
                {player.bestScore}
              </span>
              <span className="text-[10px] font-medium tracking-[0.16em] text-fog">
                {t(lang, "quiz_hud_best")}
              </span>
            </div>
          </div>
        </div>

        {/* XP progression */}
        <div className="mt-3 flex items-center gap-3">
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.18em] text-fog">
            {t(lang, "quiz_hud_level")} {info.level}
          </span>
          <SegmentedBar
            progress={info.progress}
            segments={compact ? 12 : 20}
            className="h-1.5"
          />
          <span className="quiz-tabular shrink-0 text-[10px] font-medium tracking-[0.1em] text-mist">
            {formatNumber(info.into, lang)} / {formatNumber(info.to - info.from, lang)}{" "}
            {t(lang, "quiz_hud_xp")}
          </span>
        </div>
      </div>
    </div>
  );
}
