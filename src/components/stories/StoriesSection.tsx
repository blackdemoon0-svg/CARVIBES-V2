import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { stories, featuredStory, storyCategories, type Story, type StoryCategory } from "../../lib/stories";
import StoryCard from "./StoryCard";
import StoryImage from "./StoryImage";
import { ArrowRight, SearchIcon } from "../icons";

const COMPACT_COUNT = 6;

export default function StoriesSection({
  lang,
  onOpen,
  compact = false,
}: {
  lang: Lang;
  onOpen: (s: Story) => void;
  /** Homepage mode: featured story + a short grid, with a link to the full news library. */
  compact?: boolean;
}) {
  const [category, setCategory] = useState<StoryCategory | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...stories];
    if (category !== "all") list = list.filter((s) => s.categories.includes(category));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((s) =>
        [s.title, s.car, s.brand, s.creator || "", String(s.year)]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return list;
  }, [category, query]);

  const featured = featuredStory;
  const hidden = stories.filter((s) => s.hidden);
  const gridStories = compact
    ? stories.filter((s) => !s.featured).slice(0, COMPACT_COUNT)
    : filtered;

  return (
    <section id="stories" className="relative bg-ink py-20 sm:py-24">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* ---- Hero ---- */}
        <div className="mb-14 flex flex-col items-center gap-6 text-center">
          <p className="reveal mb-0 flex items-center justify-center gap-3 text-[11px] font-medium tracking-mega text-fog">
            <span className="h-px w-8 bg-accent" />
            {t(lang, "st_eyebrow")}
            <span className="h-px w-8 bg-accent" />
          </p>
          <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t(lang, "st_hero_title")}
          </h2>
          <p className="reveal mx-auto mt-0 max-w-2xl text-base leading-relaxed text-mist sm:text-lg" data-delay="120">
            {t(lang, "st_hero_sub")}
          </p>
          {compact && (
            <Link
              to="/news"
              className="reveal group inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-mist transition-colors duration-300 hover:text-white"
              data-delay="160"
            >
              {t(lang, "st_view_all")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* ---- Featured story ---- */}
        {featured && (
          <div className="reveal mb-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <span className="text-[11px] font-semibold tracking-mega text-fog">
                {t(lang, "st_featured")}
              </span>
            </div>
            <button
              onClick={() => onOpen(featured)}
              className="group relative block w-full overflow-hidden border border-line text-left"
            >
              <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
                <StoryImage
                  src={featured.image}
                  alt={featured.title}
                  title={featured.title}
                  accent={featured.accent}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-12">
                  <div className="max-w-3xl">
                    <p className="text-xs font-medium tracking-[0.2em] text-mist">
                      {featured.car.toUpperCase()} · {featured.year}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-bold leading-[1.05] text-white transition-transform duration-500 group-hover:-translate-x-0 sm:text-5xl lg:text-6xl">
                      {featured.title}
                    </h3>
                    <p className="mt-4 hidden max-w-xl text-sm leading-relaxed text-mist sm:block">
                      {featured.description}
                    </p>
                    <span className="mt-6 flex h-13 w-full max-w-xs items-center justify-center gap-3 bg-accent px-5 text-[12px] font-semibold tracking-[0.18em] text-white transition-colors group-hover:bg-accent-soft sm:inline-flex sm:w-auto sm:max-w-none sm:px-7">
                      {t(lang, "st_enter_story")}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ---- Search + category filters (full library only) ---- */}
        {!compact && (
          <div className="mb-8 space-y-5">
            <div className="reveal relative max-w-xl">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-fog" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(lang, "st_search")}
                className="h-12 w-full border border-line bg-charcoal pl-11 pr-4 text-sm text-white placeholder:text-fog focus:border-white/30 focus:outline-none"
              />
            </div>

            <div className="reveal -mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
              <div className="flex w-max gap-2">
                <button
                  onClick={() => setCategory("all")}
                  className={`whitespace-nowrap border px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] transition-all duration-300 ${
                    category === "all"
                      ? "border-accent bg-accent text-white"
                      : "border-line text-mist hover:border-white/25 hover:text-white"
                  }`}
                >
                  {t(lang, "st_all")}
                </button>
                {storyCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`whitespace-nowrap border px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] transition-all duration-300 ${
                      category === c.id
                        ? "border-accent bg-accent text-white"
                        : "border-line text-mist hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {t(lang, c.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---- Story count + grid ---- */}
        <div className="mb-6 flex items-center justify-between text-xs text-fog">
          <span>
            {compact ? stories.length : filtered.length} {t(lang, "st_results")}
          </span>
        </div>
        {gridStories.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gridStories.map((s, i) => (
              <StoryCard key={s.id} story={s} lang={lang} onOpen={onOpen} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-line py-24 text-center">
            <p className="font-display text-xl font-semibold text-white">
              {t(lang, "fmc_no_match_title")}
            </p>
          </div>
        )}

        {/* ---- Hidden Legends (full library only) ---- */}
        {!compact && hidden.length > 0 && (
          <div className="mt-24">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-semibold tracking-mega text-fog">
                {t(lang, "st_eyebrow")} · {t(lang, "st_hidden_title")}
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t(lang, "st_hidden_title")}
              </h3>
              <p className="mt-3 text-sm text-mist">{t(lang, "st_hidden_sub")}</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hidden.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => onOpen(s)}
                  className="reveal group relative block aspect-[4/3] overflow-hidden border border-line text-left"
                  data-delay={i * 100}
                >
                  {/* Muted silhouette until hover */}
                  <StoryImage
                    src={s.image}
                    alt={s.car}
                    title={s.car}
                    accent={s.accent}
                    className="absolute inset-0 h-full w-full"
                    imgClassName="opacity-30 grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-medium tracking-[0.2em] text-fog">
                      {t(lang, "st_reveal")}
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold text-white opacity-60 transition-opacity group-hover:opacity-100">
                      {s.car}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
