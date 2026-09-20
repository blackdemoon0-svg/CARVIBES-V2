import { Link } from "react-router-dom";
import { t, type Lang } from "../lib/i18n";
import { MAKES, COUNTRIES, CURRENCIES } from "../lib/marketplace/taxonomy";
import { MAX_PHOTOS } from "../lib/marketplace/sellForm";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CompareBar from "../components/compare/CompareBar";
import { ArrowRight } from "../components/icons";

/**
 * /marketcar — "MarketCar", the indexable landing page that explains the
 * CarVibes Marketplace.
 *
 * Why a separate page: /marketplace is the live listings grid (client-side
 * search, filters, pagination) and its prerendered shell is intentionally
 * thin. MarketCar is the evergreen, fully crawlable guide ABOUT the
 * marketplace: what is listed, how search and the discovery pages work, what
 * a listing page contains, how buyers reach sellers, the six-step seller
 * funnel and the manual moderation. Every claim below describes behaviour
 * that exists in the code today (see docs/MARKETPLACE.md).
 *
 * Contract with the build:
 *  - Meta (title / description / canonical / robots) comes from
 *    ROUTE_META["/marketcar"] in src/lib/seo.ts via the shell's usePageMeta.
 *  - scripts/prerender.mjs renders the same structure with the English
 *    dictionary, so the crawlable HTML matches the hydrated English DOM
 *    (same H1, same sections, same internal links).
 *  - Copy is fully translated (mc_* keys, 10 languages); the numbers are read
 *    from the marketplace taxonomy so they can never drift from the product.
 */
export default function MarketCarPage({
  lang,
  onLangChange,
  onCompare,
  onSearch,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare: () => void;
  onSearch: () => void;
}) {
  const facts = {
    makes: MAKES.length,
    countries: COUNTRIES.length,
    currencies: CURRENCIES.length,
    photos: MAX_PHOTOS,
  };
  const tr = (key: string) => t(lang, key, facts);

  const stats: { value: number; labelKey: string }[] = [
    { value: facts.makes, labelKey: "mc_stat_makes" },
    { value: facts.countries, labelKey: "mc_stat_countries" },
    { value: facts.currencies, labelKey: "mc_stat_currencies" },
    { value: facts.photos, labelKey: "mc_stat_photos" },
  ];

  const features: { id: string; headingKey: string; bodyKey: string }[] = [
    { id: "listings", headingKey: "mc_listings_h", bodyKey: "mc_listings_p" },
    { id: "search", headingKey: "mc_search_h", bodyKey: "mc_search_p" },
    { id: "discover", headingKey: "mc_discover_h", bodyKey: "mc_discover_p" },
    { id: "listing-page", headingKey: "mc_detail_h", bodyKey: "mc_detail_p" },
    { id: "contact", headingKey: "mc_contact_h", bodyKey: "mc_contact_p" },
    { id: "moderation", headingKey: "mc_trust_h", bodyKey: "mc_trust_p" },
  ];

  const steps: { titleKey: string; bodyKey: string }[] = [
    { titleKey: "mk_step_vehicle", bodyKey: "mc_step_vehicle_p" },
    { titleKey: "mk_step_pricing", bodyKey: "mc_step_pricing_p" },
    { titleKey: "mk_step_location", bodyKey: "mc_step_location_p" },
    { titleKey: "mk_step_photos", bodyKey: "mc_step_photos_p" },
    { titleKey: "mk_step_contact", bodyKey: "mc_step_contact_p" },
    { titleKey: "mk_step_review", bodyKey: "mc_step_review_p" },
  ];

  const faq = [1, 2, 3, 4, 5].map((n) => ({
    q: tr(`mc_faq_${n}_q`),
    a: tr(`mc_faq_${n}_a`),
  }));

  const more: { to: string; labelKey: string }[] = [
    { to: "/marketplace", labelKey: "mc_link_marketplace" },
    { to: "/marketplace/sell", labelKey: "mk_sell_title" },
    { to: "/explore", labelKey: "footer_explore" },
    { to: "/used-cars", labelKey: "nav_used_cars" },
    { to: "/brands", labelKey: "nav_brands" },
    { to: "/find-my-car", labelKey: "nav_find" },
  ];

  const sectionTitle =
    "font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-3xl";

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navigation lang={lang} onLangChange={onLangChange} onCompare={onCompare} onSearch={onSearch} />
      <main>
        <article>
          {/* ---- Hero -------------------------------------------------- */}
          <header className="quiz-arena relative overflow-hidden border-b border-line">
            <div aria-hidden="true" className="quiz-grid pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32">
              <nav aria-label="Breadcrumb" className="hero-in text-[11px] tracking-[0.18em] text-fog">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link to="/" className="transition-colors hover:text-white">
                      CARVIBES
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="uppercase text-mist">
                    {tr("mc_breadcrumb")}
                  </li>
                </ol>
              </nav>
              <p className="hero-in mt-6 text-[10px] font-semibold uppercase tracking-[0.4em] text-accent" style={{ animationDelay: "60ms" }}>
                {tr("mc_eyebrow")}
              </p>
              <h1
                className="hero-in mt-3 max-w-4xl font-display text-3xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "120ms" }}
              >
                {tr("mc_h1")}
              </h1>
              <p className="hero-in mt-5 max-w-3xl text-sm leading-relaxed text-mist sm:text-base" style={{ animationDelay: "180ms" }}>
                {tr("mc_intro")}
              </p>

              <div className="hero-in mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ animationDelay: "240ms" }}>
                <Link
                  to="/marketplace"
                  className="cv-btn cv-btn-primary group inline-flex h-13 items-center justify-center gap-3 px-7 text-[12px] font-semibold tracking-[0.18em] sm:min-w-[12rem]"
                >
                  {tr("mc_cta_browse")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/marketplace/sell"
                  className="cv-btn cv-btn-ghost inline-flex h-13 items-center justify-center px-7 text-[12px] font-semibold tracking-[0.18em] sm:min-w-[12rem]"
                >
                  {tr("mk_sell_cta")}
                </Link>
              </div>

              {/* Real numbers, read from the marketplace taxonomy. */}
              <ul className="hero-in mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4" style={{ animationDelay: "300ms" }}>
                {stats.map((s) => (
                  <li key={s.labelKey} className="edge-light bg-charcoal px-4 py-4 sm:px-5">
                    <span className="block font-display text-2xl font-extrabold text-white sm:text-3xl">{s.value}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-fog">{tr(s.labelKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          {/* ---- Features ---------------------------------------------- */}
          <section aria-labelledby="mc-features" className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
              <h2 id="mc-features" className={sectionTitle}>
                {tr("mc_features_h")}
              </h2>
              <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f, i) => (
                  <section key={f.id} id={f.id} className="edge-light bg-charcoal p-6 sm:p-7">
                    <span aria-hidden="true" className="font-display text-[11px] font-bold tracking-[0.3em] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold text-white">{tr(f.headingKey)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{tr(f.bodyKey)}</p>
                  </section>
                ))}
              </div>
            </div>
          </section>

          {/* ---- Sell in six steps ------------------------------------- */}
          <section aria-labelledby="mc-sell" className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2 id="mc-sell" className={sectionTitle}>
                    {tr("mc_sell_h")}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-mist sm:text-base">{tr("mc_sell_p")}</p>
                </div>
                <Link
                  to="/marketplace/sell"
                  className="cv-btn cv-btn-outline inline-flex h-12 items-center justify-center gap-3 self-start px-6 text-[12px] font-semibold tracking-[0.18em] lg:self-auto"
                >
                  {tr("mk_sell_cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ol className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {steps.map((s, i) => (
                  <li key={s.titleKey} className="edge-light bg-charcoal p-6 sm:p-7">
                    <span aria-hidden="true" className="font-display text-[11px] font-bold tracking-[0.3em] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-base font-bold uppercase tracking-[0.06em] text-white">{tr(s.titleKey)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{tr(s.bodyKey)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ---- FAQ --------------------------------------------------- */}
          <section aria-labelledby="mc-faq" className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
              <h2 id="mc-faq" className={sectionTitle}>
                {tr("mc_faq_h")}
              </h2>
              <dl className="mt-8 grid gap-px border border-line bg-line lg:grid-cols-2">
                {faq.map((item) => (
                  <div key={item.q} className="edge-light bg-charcoal p-6 sm:p-7">
                    <dt className="font-display text-base font-bold text-white">{item.q}</dt>
                    <dd className="mt-3 text-sm leading-relaxed text-mist">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ---- Continue on CarVibes ---------------------------------- */}
          <section aria-labelledby="mc-more">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
              <h2 id="mc-more" className={sectionTitle}>
                {tr("mc_more_h")}
              </h2>
              <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                {more.map((m) => (
                  <li key={m.to} className="bg-ink">
                    <Link
                      to={m.to}
                      className="group flex h-full items-center justify-between gap-4 bg-charcoal px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-graphite"
                    >
                      <span>{tr(m.labelKey)}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-fog transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </main>
      <Footer lang={lang} onLangChange={onLangChange} onCompare={onCompare} />
      <CompareBar lang={lang} onOpen={onCompare} />
    </div>
  );
}
