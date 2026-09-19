// ============================================================
// CARVIBES / MARKETVIBES — marketplace hero
//
// The first screen has to answer one question in under a second:
// "here I can find cars for sale, or sell mine." So it carries the
// name, one honest sentence, the search field, the seller CTA and real
// numbers from the database — nothing else. No hero photo is loaded:
// the band is pure CSS (gradient + hairline grid), so the marketplace
// has no image LCP cost at all and stays fast on 3G.
// ============================================================

import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { formatNumber } from "../../lib/marketplace/format";
import { ArrowRight } from "../icons";
import { MarketplaceSearch } from "./MarketplaceFilters";
import AdminEntry from "./AdminEntry";

export default function MarketplaceHero({
  lang,
  query,
  onSearch,
  stats,
}: {
  lang: Lang;
  query: string;
  onSearch: (value: string) => void;
  stats: { listings: number; brands: number; countries: number } | null;
}) {
  return (
    <section id="marketplace-hero" className="quiz-arena relative overflow-hidden border-b border-line">
      {/* Hairline technical grid + accent glow — the CarVibes surface
          language, zero images, zero layout shift. */}
      <div aria-hidden="true" className="quiz-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(90% 60% at 50% -20%, rgba(227,38,46,0.16) 0%, transparent 60%)",
        }}
      />
      {/* Admin-only shortcut, in the band's own top-right corner. Renders
          nothing at all for visitors and normal sellers (server-verified). */}
      <div className="absolute end-4 top-6 z-10 sm:end-6 sm:top-8">
        <AdminEntry lang={lang} />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-32">
        <p className="hero-in text-[10px] font-semibold tracking-[0.4em] text-accent">
          {t(lang, "mk_brand_name")}
        </p>
        <h1
          className="hero-in mt-3 max-w-3xl font-display text-3xl font-extrabold leading-[1.08] text-white sm:text-5xl"
          style={{ animationDelay: "60ms" }}
        >
          {t(lang, "mk_title_1")}
          <span className="block text-metallic">{t(lang, "mk_title_2")}</span>
        </h1>
        <p className="hero-in mt-4 max-w-2xl text-sm leading-relaxed text-mist sm:text-base" style={{ animationDelay: "120ms" }}>
          {t(lang, "mk_subtitle")}
        </p>

        <div className="hero-in mt-7 max-w-3xl" style={{ animationDelay: "180ms" }}>
          <MarketplaceSearch lang={lang} value={query} onSubmit={onSearch} />
        </div>

        <div className="hero-in mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ animationDelay: "240ms" }}>
          <Link
            to="/marketplace/sell"
            className="cv-btn cv-btn-primary group inline-flex h-13 items-center justify-center gap-3 px-7 text-[12px] font-semibold tracking-[0.18em] sm:min-w-[12rem]"
          >
            {t(lang, "mk_sell_cta")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a
            href="#marketplace-results"
            className="cv-btn cv-btn-ghost inline-flex h-13 items-center justify-center px-7 text-[12px] font-semibold tracking-[0.18em] sm:min-w-[12rem]"
          >
            {t(lang, "mk_browse_cta")}
          </a>
        </div>

        {/* Trust + real numbers */}
        <div className="hero-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] tracking-[0.14em] text-fog" style={{ animationDelay: "300ms" }}>
          <span className="inline-flex items-center gap-2 text-mist">
            <span aria-hidden="true" className="text-accent">
              ◆
            </span>
            {t(lang, "mk_trust_reviewed")}
          </span>
          {stats && (
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-baseline gap-2">
                <dd className="font-display text-base font-bold text-white">{formatNumber(stats.listings, lang)}</dd>
                <dt>{t(lang, "mk_stat_listings")}</dt>
              </div>
              <div className="flex items-baseline gap-2">
                <dd className="font-display text-base font-bold text-white">{formatNumber(stats.brands, lang)}</dd>
                <dt>{t(lang, "mk_stat_brands")}</dt>
              </div>
              <div className="flex items-baseline gap-2">
                <dd className="font-display text-base font-bold text-white">{formatNumber(stats.countries, lang)}</dd>
                <dt>{t(lang, "mk_stat_countries")}</dt>
              </div>
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
