import { useEffect, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { levelInfo } from "../../lib/quiz/economy";
import { GhostButton } from "./parts";

/**
 * Full-screen LEVEL UP celebration.
 *
 * Deliberately short-lived: it fires once, it is dismissible, it never
 * blocks the keyboard for long, and it respects `prefers-reduced-motion`
 * via the CSS layer.
 */
export default function LevelUpOverlay({
  lang,
  level,
  xp,
  onClose,
}: {
  lang: Lang;
  level: number;
  xp: number;
  onClose: () => void;
}) {
  const info = levelInfo(xp);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 30);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Sparks radiating from the level badge.
  const sparks = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    return {
      dx: `${Math.cos(angle) * 150}px`,
      dy: `${Math.sin(angle) * 150}px`,
      delay: `${i * 35}ms`,
    };
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, "quiz_level_up_title")}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 px-4 backdrop-blur-md"
    >
      {/* radial burst */}
      <div
        aria-hidden="true"
        className="quiz-burst absolute h-64 w-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(227,38,46,0.45) 0%, rgba(227,38,46,0.12) 45%, transparent 70%)",
        }}
      />

      {/* sparks */}
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
        {sparks.map((spark, i) => (
          <span
            key={i}
            className="quiz-spark absolute h-1.5 w-1.5 bg-accent"
            style={
              {
                "--dx": spark.dx,
                "--dy": spark.dy,
                animationDelay: spark.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div
        className={`relative w-full max-w-lg border border-accent/40 bg-charcoal p-8 text-center ${
          open ? "quiz-level-in" : "opacity-0"
        }`}
      >
        <p className="text-[10px] font-bold tracking-[0.28em] text-accent">
          {t(lang, "quiz_level_up_title")}
        </p>

        <div className="relative mx-auto mt-6 flex h-28 w-28 items-center justify-center border border-accent/50 bg-ink">
          <span className="quiz-tabular font-display text-5xl font-extrabold text-white">
            {level}
          </span>
          <span
            aria-hidden="true"
            className="quiz-burst absolute inset-0 border border-accent/40"
          />
        </div>

        <h2 className="mt-6 font-display text-2xl font-extrabold uppercase tracking-[0.04em] text-white sm:text-3xl">
          {t(lang, info.titleKey)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          {t(lang, "quiz_level_up_copy")}
        </p>

        <p className="quiz-tabular mt-5 text-[11px] font-semibold tracking-[0.16em] text-fog">
          {t(lang, "quiz_next_level")} {t(lang, info.nextTitleKey)} ·{" "}
          {t(lang, "quiz_lvl_abbr")} {info.level + 1}
        </p>

        <div className="mt-7">
          <GhostButton onClick={onClose} className="w-full">
            {t(lang, "quiz_continue")}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
