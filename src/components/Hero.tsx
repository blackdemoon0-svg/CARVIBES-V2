import { t, type Lang } from "../lib/i18n";
import { cars, allBrands } from "../lib/db";
import { stories } from "../lib/stories";
import { categoryList } from "../lib/cars";
import { ArrowRight, SearchIcon } from "./icons";

const HERO_IMG =
  "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=2200&h=1400";

export default function Hero({
  lang,
  onFind,
  onSearch,
  onBrands,
}: {
  lang: Lang;
  onFind?: () => void;
  onSearch?: () => void;
  onBrands?: () => void;
}) {
  // Real, live counts straight from the CarVibes database.
  const stats = [
    { value: cars.length, key: "stat_cars" },
    { value: allBrands.length, key: "stat_brands" },
    { value: stories.length, key: "stat_stories" },
    { value: categoryList.length, key: "stat_categories" },
  ];

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
          className="camera-drift h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).onerror = null;
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Cinematic vignettes + legibility overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/20 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/40" />
        {/* Radial vignette for richer cinematic depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(8,9,12,0.55) 100%)",
          }}
        />
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
            CARVIBES · AUTOMOTIVE DATABASE
          </p>

          {/* Title */}
          <h1 className="font-display text-[clamp(2.6rem,8vw,6.2rem)] font-extrabold leading-[0.95] tracking-tight text-white">
            <span
              className="hero-in block"
              style={{ animationDelay: "300ms" }}
            >
              {t(lang, "hero_title_1")}
            </span>
            <span
              className="hero-in block text-metallic"
              style={{ animationDelay: "480ms" }}
            >
              {t(lang, "hero_title_2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-in mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
            style={{ animationDelay: "680ms" }}
          >
            {t(lang, "hero_sub")}
          </p>

          {/* Global search — the fastest path into the database */}
          <button
            type="button"
            onClick={onSearch}
            className="hero-in group mt-8 flex h-13 w-full max-w-xl cursor-pointer items-center gap-3 border border-white/20 bg-ink/40 px-5 text-left backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-ink/60"
            style={{ animationDelay: "800ms" }}
          >
            <SearchIcon className="h-4.5 w-4.5 shrink-0 text-fog transition-colors duration-300 group-hover:text-accent-soft" />
            <span className="flex-1 truncate text-sm text-fog transition-colors duration-300 group-hover:text-mist">
              {t(lang, "hero_search_placeholder")}
            </span>
            <span className="hidden border border-white/15 px-2 py-1 text-[9px] font-semibold tracking-[0.18em] text-mist sm:inline">
              {t(lang, "nav_search")}
            </span>
          </button>

          {/* Buttons */}
          <div
            className="hero-in mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            style={{ animationDelay: "920ms" }}
          >
            <a
              href="#explore"
              className="group inline-flex h-13 items-center justify-center gap-3 bg-accent px-7 text-[12px] font-semibold tracking-[0.18em] text-white transition-all duration-300 hover:bg-accent-soft hover:shadow-[0_0_40px_-8px_rgba(227,38,46,0.6)] sm:w-auto"
            >
              {t(lang, "hero_explore")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <button
              type="button"
              onClick={onBrands}
              className="group inline-flex h-13 items-center justify-center gap-3 border border-white/30 px-7 text-[12px] font-semibold tracking-[0.18em] text-white transition-all duration-300 hover:border-white/70 hover:bg-white hover:text-ink sm:w-auto"
            >
              {t(lang, "hero_brands")}
            </button>
            <button
              type="button"
              onClick={onFind}
              className="group inline-flex h-13 items-center justify-center gap-2 px-1 text-[11px] font-medium tracking-[0.18em] text-fog underline decoration-line underline-offset-8 transition-colors duration-300 hover:text-white sm:w-auto"
            >
              {t(lang, "hero_find")}
            </button>
          </div>
        </div>
      </div>

      {/* Real database counts */}
      <div className="relative z-10 px-5 pb-10 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 sm:grid-cols-4 lg:gap-x-12">
          {stats.map((s, i) => (
            <div
              key={s.key}
              className="hero-in"
              style={{ animationDelay: `${1040 + i * 100}ms` }}
            >
              <div className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {s.value.toLocaleString()}
              </div>
              <div className="mt-1.5 text-[10px] font-medium tracking-[0.18em] text-fog sm:text-[10px] sm:tracking-[0.22em]">
                {t(lang, s.key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
