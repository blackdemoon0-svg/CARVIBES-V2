import { Link } from "react-router-dom";
import { t, type Lang } from "../lib/i18n";
import { TargetIcon, CompareIcon, CompassIcon, HeartIcon, ArrowRight } from "./icons";

interface Feature {
  to: string;
  icon: typeof TargetIcon;
  titleKey: string;
  descKey: string;
  ctaKey: string;
  onboarding?: "compare" | "favorites";
}

const FEATURES: Feature[] = [
  {
    to: "/find-my-car",
    icon: TargetIcon,
    titleKey: "nav_find",
    descKey: "features_find_desc",
    ctaKey: "fmc_start",
  },
  {
    to: "/compare",
    icon: CompareIcon,
    titleKey: "cp_compare_cars",
    descKey: "features_compare_desc",
    ctaKey: "cp_compare",
    onboarding: "compare",
  },
  {
    to: "/explore",
    icon: CompassIcon,
    titleKey: "nav_explore",
    descKey: "features_explore_desc",
    ctaKey: "hero_explore",
  },
  {
    to: "/favorites",
    icon: HeartIcon,
    titleKey: "nav_favorites",
    descKey: "features_favorites_desc",
    ctaKey: "fav_title",
    onboarding: "favorites",
  },
];

export default function FeaturesSection({ lang }: { lang: Lang }) {
  return (
    <section
      id="features"
      className="relative border-t border-line bg-ink py-20 sm:py-24"
    >
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "features_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {t(lang, "features_title")}
            </h2>
          </div>
          <p
            className="reveal max-w-md text-sm leading-relaxed text-mist"
            data-delay="150"
          >
            {t(lang, "features_sub")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((f, i) => (
            <Link
              key={f.titleKey}
              to={f.to}
              data-onboarding={f.onboarding}
              className="reveal edge-light group relative flex flex-col border border-line bg-charcoal p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-graphite hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]"
              data-delay={i * 70}
            >
              <div className="flex h-12 w-12 items-center justify-center border border-line bg-ink text-accent-soft transition-all duration-300 group-hover:border-accent/50 group-hover:text-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-white">
                {t(lang, f.titleKey)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">
                {t(lang, f.descKey)}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-fog transition-colors duration-300 group-hover:text-white">
                {t(lang, f.ctaKey)}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
