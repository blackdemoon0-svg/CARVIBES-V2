import { t, type Lang } from "../lib/i18n";
import { ArrowRight } from "./icons";

const HERO_IMG =
  "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=2200&h=1400";

const STATS = [
  { value: "500", key: "stat_cars", suffix: "+" },
  { value: "50", key: "stat_brands", suffix: "+" },
  { value: "100", key: "stat_stories", suffix: "+" },
];

export default function Hero({ lang, onFind }: { lang: Lang; onFind?: () => void }) {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Background image with slow camera drift */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Black luxury coupe in a dark studio"
          className="camera-drift h-full w-full object-cover object-center lg:brightness-105"
          fetchPriority="high"
          decoding="async"
        />
        {/* Cinematic vignettes + legibility overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/20 to-ink" />
        {/* Directional scrim: dark stage behind the copy (left), car reads brighter on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-transparent lg:from-ink/90 lg:via-ink/35" />
        {/* Radial vignette for richer cinematic depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(8,9,12,0.55) 100%)",
          }}
        />
        {/* Subtle electric-blue ambient glow (top-left) for a modern feel */}
        <div
          className="absolute -left-40 -top-40 h-[60vmin] w-[60vmin] rounded-full opacity-[0.16] blur-[120px]"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
        />
        {/* Soft stage light behind the copy — anchors the headline into the scene */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(45% 55% at 30% 48%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "radial-gradient(85% 50% at 50% 30%, rgba(255,255,255,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Subtle light reflection sweep */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2">
          <div
            className="sheen absolute inset-y-0 left-0 w-1/3 opacity-[0.12]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
              filter: "blur(12px)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pt-24 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <p
            className="hero-in mb-7 flex items-center gap-3 text-[11px] font-medium tracking-mega text-mist"
            style={{ animationDelay: "150ms" }}
          >
            <span className="h-px w-8 bg-accent" />
            CARVIBES · AUTOMOTIVE DISCOVERY
          </p>

          {/* Title */}
          <h1 className="font-display text-[clamp(2.5rem,6.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            <span
              className="hero-in block"
              style={{
                animationDelay: "300ms",
                textShadow:
                  "0 2px 8px rgba(0,0,0,0.55), 0 16px 60px rgba(0,0,0,0.6)",
              }}
            >
              {t(lang, "hero_title_1")}
            </span>
            <span
              className="hero-in relative block text-metallic"
              style={{ animationDelay: "480ms" }}
            >
              {/* Soft dark aura behind the metallic line — seats it into the scene */}
              <span
                aria-hidden="true"
                className="absolute inset-0 translate-y-1 select-none text-ink opacity-60 blur-[18px]"
              >
                {t(lang, "hero_title_2")}
              </span>
              {t(lang, "hero_title_2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-in mt-5 max-w-xl text-base leading-[1.7] tracking-normal text-mist sm:mt-6 sm:text-lg"
            style={{
              animationDelay: "680ms",
              textShadow: "0 2px 14px rgba(0,0,0,0.6)",
            }}
          >
            {t(lang, "hero_sub")}
          </p>

          {/* Buttons */}
          <div
            className="hero-in mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-14"
            style={{ animationDelay: "840ms" }}
          >
            <a
              href="#explore"
              className="group inline-flex h-13 items-center gap-3 bg-accent px-7 text-[12px] font-semibold tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-soft hover:shadow-[0_0_40px_-8px_rgba(227,38,46,0.6)] active:translate-y-0"
            >
              {t(lang, "hero_explore")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#find-my-car"
              onClick={(e) => {
                if (onFind) {
                  e.preventDefault();
                  onFind();
                }
              }}
              className="group inline-flex h-13 items-center gap-3 border border-white/30 px-7 text-[12px] font-semibold tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white hover:text-ink active:translate-y-0"
            >
              {t(lang, "hero_find")}
            </a>
            <a
              href="#stories"
              className="group inline-flex h-13 items-center gap-2 px-1 text-[11px] font-medium tracking-[0.18em] text-fog underline-offset-8 transition-colors duration-300 hover:text-white"
            >
              <span className="h-px w-5 bg-fog transition-colors group-hover:bg-accent" />
              <span className="underline decoration-line underline-offset-8 transition-colors group-hover:decoration-accent">
                {t(lang, "hero_story")}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="relative z-10 px-5 pb-10 sm:px-10 lg:px-16">
        <div className="flex flex-col border-t border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex divide-x divide-white/10">
            {STATS.map((s, i) => (
              <div
                key={s.key}
                className="hero-in px-4 py-4 first:pl-0 sm:px-10 sm:py-5"
                style={{ animationDelay: `${1000 + i * 120}ms` }}
              >
                <div className="font-display text-2xl font-bold text-white sm:text-5xl">
                  {s.value}
                  <span className="text-accent">{s.suffix}</span>
                </div>
                <div className="mt-1 text-[9px] font-medium tracking-[0.18em] text-fog sm:text-[10px] sm:tracking-[0.22em]">
                  {t(lang, s.key)}
                </div>
              </div>
            ))}
          </div>

          <div className="hero-in flex items-center justify-between gap-2 py-4 sm:flex-col sm:justify-center sm:gap-2 sm:py-5" style={{ animationDelay: "1400ms" }}>
            <span className="text-[10px] font-medium tracking-[0.22em] text-fog">
              {t(lang, "scroll_hint")}
            </span>
            <span className="scroll-cue text-fog" aria-hidden="true">
              ↓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
