import { t, type Lang } from "../../lib/i18n";
import type { Story } from "../../lib/stories";
import { ArrowRight } from "../icons";
import StoryImage from "./StoryImage";

export default function StoryCard({
  story,
  lang,
  onOpen,
  index = 0,
}: {
  story: Story;
  lang: Lang;
  onOpen: (s: Story) => void;
  index?: number;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${t(lang, "st_read_story")}: ${story.title}`}
      onClick={() => onOpen(story)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(story);
        }
      }}
      className="card-in edge-light group relative flex cursor-pointer flex-col overflow-hidden border border-line bg-charcoal transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(227,38,46,0.12)]"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/11] overflow-hidden bg-graphite">
        <StoryImage
          src={story.image}
          alt={story.title}
          title={story.title}
          accent={story.accent}
          className="absolute inset-0"
          imgClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent transition-opacity duration-700 group-hover:opacity-95" />
        {/* Category */}
        <span className="absolute left-4 top-4 border border-white/15 bg-ink/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
          {t(lang, `st_cat_${story.categories[0]}`)}
        </span>
        {/* Year */}
        <span className="absolute right-4 top-4 font-display text-sm font-semibold text-white/70">
          {story.year}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col border-t border-line p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-white transition-transform duration-500 group-hover:-translate-y-0.5">
          {story.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-mist">
          <span className="font-semibold text-white/90">{story.car}</span>
          {story.creator && <span>· {story.creator}</span>}
        </div>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-fog">
          {story.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="text-[10px] font-medium tracking-[0.18em] text-fog">
            {story.readTime} {t(lang, "st_min_read")}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-white">
            <span className="opacity-80 transition-opacity group-hover:opacity-100">
              {t(lang, "st_read_story")}
            </span>
            <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
          </span>
        </div>
      </div>
    </article>
  );
}
