import { t, type Lang } from "../lib/i18n";
import { categories } from "../lib/data";
import { ArrowRight } from "./icons";

export default function DiscoverSection({ lang }: { lang: Lang }) {
  const names: Record<string, string> = {
    sport: t(lang, "cat_sport"),
    luxury: t(lang, "cat_luxury"),
    everyday: t(lang, "cat_everyday"),
  };
  const descs: Record<string, string> = {
    sport: t(lang, "cat_sport_desc"),
    luxury: t(lang, "cat_luxury_desc"),
    everyday: t(lang, "cat_everyday_desc"),
  };

  return (
    <section id="discover" className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Heading */}
        <div className="mb-14 flex flex-col gap-6 sm:mb-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
              <span className="h-px w-8 bg-accent" />
              {t(lang, "discover_eyebrow")}
            </p>
            <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              {t(lang, "discover_title")}
            </h2>
          </div>
          <p
            className="reveal max-w-xs text-sm leading-relaxed text-mist"
            data-delay="150"
          >
            {t(lang, "discover_sub")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {categories.map((cat, i) => (
            <a
              key={cat.id}
              href="#explore"
              className="reveal edge-light group relative block h-[62vh] min-h-[420px] cursor-pointer overflow-hidden border border-line bg-charcoal transition-all duration-500 hover:border-white/25 hover:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] sm:h-[68vh]"
              data-delay={i * 130}
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
              />
              {/* Lighting + legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-accent/0 transition-colors duration-700 group-hover:bg-accent/10" />

              {/* Index number */}
              <span className="absolute right-5 top-5 font-display text-sm font-semibold text-white/40 transition-colors duration-500 group-hover:text-white">
                {cat.number}
              </span>

              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h3 className="font-display text-4xl font-bold tracking-tight text-white transition-transform duration-500 ease-out group-hover:-translate-y-1.5 sm:text-5xl">
                  {names[cat.id]}
                </h3>
                <p className="mt-2 max-w-[90%] text-sm text-mist opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus:opacity-100">
                  {descs[cat.id]}
                </p>

                <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-white">
                  <span className="translate-x-0 transition-transform duration-500 group-hover:translate-x-0">
                    {t(lang, "cat_view")}
                  </span>
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                  <span className="h-px w-0 bg-accent transition-all duration-500 group-hover:w-8" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
