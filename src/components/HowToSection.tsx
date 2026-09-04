import { t, type Lang } from "../lib/i18n";
import { startOnboarding } from "../lib/onboarding";
import { SearchIcon, CompassIcon, CompareIcon, HeartIcon, ArrowRight } from "./icons";

interface Step {
  emoji: string;
  icon: typeof SearchIcon;
  titleKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  { emoji: "🔍", icon: SearchIcon, titleKey: "nav_search", descKey: "howto_search_desc" },
  { emoji: "🚗", icon: CompassIcon, titleKey: "nav_explore", descKey: "howto_explore_desc" },
  { emoji: "⚖️", icon: CompareIcon, titleKey: "cp_compare", descKey: "howto_compare_desc" },
  { emoji: "❤️", icon: HeartIcon, titleKey: "nav_favorites", descKey: "howto_save_desc" },
];

export default function HowToSection({ lang }: { lang: Lang }) {
  return (
    <section
      id="how-to"
      className="relative overflow-hidden border-t border-line bg-charcoal py-20 sm:py-28"
    >
      {/* Subtle accent glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 110%, rgba(227,38,46,0.08) 0%, rgba(9,9,9,0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="reveal flex items-center justify-center gap-3 text-[11px] font-medium tracking-mega text-fog">
            <span className="h-px w-8 bg-accent" />
            {t(lang, "howto_eyebrow")}
            <span className="h-px w-8 bg-accent" />
          </p>
          <h2 className="reveal mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {t(lang, "howto_title")}
          </h2>
          <p
            className="reveal mt-4 text-base leading-relaxed text-mist"
            data-delay="120"
          >
            {t(lang, "howto_sub")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((s, i) => (
            <div
              key={s.titleKey}
              className="reveal edge-light group relative flex flex-col items-center border border-line bg-ink px-6 py-9 text-center transition-all duration-300 hover:border-white/20 hover:bg-graphite"
              data-delay={i * 90}
            >
              {/* Step number */}
              <span className="absolute right-4 top-4 font-display text-xs font-bold tracking-[0.2em] text-fog">
                0{i + 1}
              </span>

              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-line transition-colors duration-300 group-hover:border-accent/50" />
                <s.icon className="h-6 w-6 text-accent-soft transition-colors duration-300 group-hover:text-accent" />
                <span
                  className="absolute -right-1 -top-1 text-xl"
                  aria-hidden="true"
                >
                  {s.emoji}
                </span>
              </div>

              <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-white">
                {t(lang, s.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                {t(lang, s.descKey)}
              </p>

              {/* Connector arrow (desktop) */}
              {i < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-accent lg:block" />
              )}
            </div>
          ))}
        </div>

        <div className="reveal mt-12 text-center" data-delay="200">
          <button
            type="button"
            onClick={startOnboarding}
            className="group inline-flex h-14 items-center gap-3 bg-accent px-8 text-[12px] font-semibold tracking-[0.18em] text-white transition-all duration-300 hover:bg-accent-soft hover:shadow-[0_0_50px_-10px_rgba(227,38,46,0.6)]"
          >
            {t(lang, "howto_full_guide")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
