import { t, type Lang } from "../lib/i18n";
import { dailyCards } from "../lib/data";
import { ArrowUpRight } from "./icons";

export default function DailySection({ lang }: { lang: Lang }) {
  const tagLabels: Record<string, string> = {
    cotd: t(lang, "daily_cotd"),
    story: t(lang, "daily_story"),
    trending: t(lang, "daily_trending"),
  };

  return (
    <section className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Heading */}
        <div className="mb-14 flex flex-col gap-4 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "daily_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {t(lang, "daily_title")}
            </h2>
          </div>
          <p className="reveal text-sm text-mist" data-delay="120">
            {t(lang, "daily_sub")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {dailyCards.map((card, i) => (
            <a
              key={card.kind}
              href="#explore"
              className="reveal group block cursor-pointer"
              data-delay={i * 120}
            >
              <div className="edge-light relative aspect-[4/3] overflow-hidden border border-line bg-charcoal transition-all duration-500 group-hover:border-white/25 group-hover:shadow-[0_30px_70px_-26px_rgba(0,0,0,0.95)]">
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-80" />
                {/* Tag badge */}
                <span className="absolute left-4 top-4 border border-white/20 bg-ink/50 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
                  {tagLabels[card.kind]}
                </span>
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/20 bg-ink/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="border border-t-0 border-line px-5 py-5">
                <h3 className="font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-accent-soft">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-[13px] text-fog">{card.meta}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
