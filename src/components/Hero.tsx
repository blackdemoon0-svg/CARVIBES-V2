import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // The search bar is a real input: pressing Enter / clicking Search runs the
  // query against the explore page; focusing the empty field still offers the
  // full-screen search experience via onSearch.
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/explore?q=${encodeURIComponent(q)}`);
    } else {
      onSearch?.();
    }
  };

  // Real, live counts straight from the CarVibes database.
  const stats = [
    { value: cars.length, key: "stat_cars" },
    { value: allBrands.length, key: "stat_brands" },
    { value: stories.length, key: "stat_stories" },
    { value: categoryList.length, key: "stat_categories" },
  ];

  const scrollToContent = () => {
    document
      .getElementById("discover")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/30 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-transparent to-ink/40" />
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
              className="hero-in block"
              style={{ animationDelay: "480ms" }}
            >
              <span className="text-accent">{t(lang, "hero_title_2")}</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-in mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
            style={{ animationDelay: "680ms" }}
          >
            {t(lang, "hero_sub")}
          </p>

          {/* Main search bar — the primary path into the database */}
          <form
            onSubmit={submit}
            data-onboarding="search"
            className="hero-in mt-8 flex h-13 w-full max-w-xl items-center gap-2 border border-white/20 bg-ink/50 p-1.5 backdrop-blur-md transition-all duration-300 focus-within:border-accent/70 focus-within:bg-ink/70"
            style={{ animationDelay: "800ms" }}
          >
            <SearchIcon className="ml-3 h-4.5 w-4.5 shrink-0 text-fog" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                // Offer the richer full-screen search when the bar is empty.
                if (!query.trim()) onSearch?.();
              }}
              placeholder={t(lang, "hero_search_placeholder")}
              aria-label={t(lang, "hero_search_placeholder")}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-fog focus:outline-none"
            />
            <button
              type="submit"
              className="h-10 shrink-0 bg-accent px-5 text-[11px] font-semibold tracking-[0.18em] text-white transition-all duration-300 hover:bg-accent-soft hover:shadow-[0_0_24px_-6px_rgba(227,38,46,0.7)]"
            >
              {t(lang, "hero_search_button")}
            </button>
          </form>

          {/* Buttons */}
          <div
            className="hero-in mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            style={{ animationDelay: "920ms" }}
          >
            <a
              href="#discover"
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

      {/* Scroll-to-explore indicator — signals there's content below.
          Compact icon on mobile, full label + mouse shape on desktop. */}
      <button
        type="button"
        onClick={scrollToContent}
        aria-label={t(lang, "scroll_hint_2")}
        className="hero-in group absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-fog transition-colors duration-300 hover:text-white"
        style={{ animationDelay: "1150ms" }}
      >
        <span className="hidden text-[10px] font-semibold tracking-[0.24em] sm:block">
          {t(lang, "scroll_hint_2").toUpperCase()}
        </span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-current p-1 sm:h-9 sm:w-5">
          <span className="scroll-dot h-1.5 w-1.5 rounded-full bg-current" />
        </span>
        <span className="text-sm leading-none sm:hidden" aria-hidden="true">
          ↓
        </span>
      </button>

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
                {s.value.toLocaleString()}+
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
