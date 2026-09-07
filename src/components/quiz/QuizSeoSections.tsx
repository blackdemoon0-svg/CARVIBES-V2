import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { FAQ_COUNT } from "../../lib/quiz/i18n";
import { DIFFICULTIES } from "../../lib/quiz/types";
import { QUIZ_CATEGORIES } from "../../lib/quiz/data/categories";
import { QUIZZES } from "../../lib/quiz/quizzes";
import { POINTS_PER_CORRECT } from "../../lib/quiz/economy";
import { cars } from "../../lib/db";
import { DifficultyBadge } from "./parts";

const POPULAR_CAR_IDS = [
  "porsche-911-gt3",
  "ferrari-f40",
  "nissan-skyline-gtr-r34",
  "toyota-supra-mk4",
  "tesla-model-s-plaid",
  "lamborghini-countach",
  "mclaren-f1",
  "bmw-m3-e30",
];

/**
 * Internal links for crawlers and players alike. Every label reuses an
 * existing site-wide translation key, so nothing new has to be kept in
 * sync.
 */
const ARTICLE_LINKS = [
  { to: "/explore", key: "nav_explore" },
  { to: "/find-my-car", key: "nav_find" },
  { to: "/news", key: "nav_stories" },
  { to: "/brands", key: "nav_brands" },
  { to: "/compare", key: "footer_compare" },
  { to: "/favorites", key: "nav_favorites" },
];

/**
 * Crawlable editorial layer for /car-quiz.
 *
 * The interactive hub above is a game; this is the semantic HTML that
 * tells search engines what the page is, in the same voice and layout as
 * the site's other content pages. Every string goes through the central
 * translation system, and the internal links point at real CarVibes
 * pages and real cars from the database.
 */
export default function QuizSeoSections({ lang }: { lang: Lang }) {
  const popularCars = POPULAR_CAR_IDS.map((id) => cars.find((c) => c.id === id)).filter(
    (c): c is NonNullable<typeof c> => !!c
  );

  return (
    <div className="border-t border-line bg-ink">
      {/* ---------- intro ---------- */}
      <section
        aria-labelledby="quiz-seo-intro"
        className="mx-auto max-w-[900px] px-5 py-14 sm:px-8 sm:py-20"
      >
        <h2
          id="quiz-seo-intro"
          className="reveal font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
        >
          {t(lang, "quiz_seo_intro_h")}
        </h2>
        <div className="reveal mt-5 space-y-4 text-[15px] leading-relaxed text-mist">
          <p>{t(lang, "quiz_seo_intro_p1")}</p>
          <p>{t(lang, "quiz_seo_intro_p2")}</p>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      <section
        aria-labelledby="quiz-seo-categories"
        className="border-t border-line bg-charcoal/40"
      >
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
          <h2
            id="quiz-seo-categories"
            className="reveal font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
          >
            {t(lang, "quiz_seo_categories_h")}
          </h2>
          <p className="reveal mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">
            {t(lang, "quiz_seo_categories_p")}
          </p>

          <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {QUIZ_CATEGORIES.map((category, i) => (
              <li key={category.id} data-delay={i * 30} className="reveal bg-ink p-5">
                <p className="font-display text-sm font-extrabold uppercase tracking-[0.08em] text-white">
                  <span aria-hidden="true" className="mr-2">
                    {category.icon}
                  </span>
                  {t(lang, category.nameKey)}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-mist">
                  {t(lang, `${category.nameKey}_sub`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- difficulties ---------- */}
      <section
        aria-labelledby="quiz-seo-difficulties"
        className="border-t border-line"
      >
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
          <h2
            id="quiz-seo-difficulties"
            className="reveal font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
          >
            {t(lang, "quiz_seo_diff_h")}
          </h2>

          <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {DIFFICULTIES.map((difficulty, i) => (
              <div key={difficulty} data-delay={i * 40} className="reveal bg-ink p-5">
                <dt>
                  <DifficultyBadge difficulty={difficulty} lang={lang} />
                </dt>
                <dd className="mt-3 text-[13px] leading-snug text-mist">
                  {t(lang, `diff_${difficulty}_sub`)}
                </dd>
                <dd className="quiz-tabular mt-3 text-[10px] font-bold tracking-[0.16em] text-accent">
                  +{POINTS_PER_CORRECT[difficulty]} ⭐ /{" "}
                  {t(lang, "quiz_correct")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- featured quizzes ---------- */}
      <section
        aria-labelledby="quiz-seo-featured"
        className="border-t border-line bg-charcoal/40"
      >
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
          <h2
            id="quiz-seo-featured"
            className="reveal font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
          >
            {t(lang, "quiz_seo_featured_h")}
          </h2>
          <p className="reveal mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">
            {t(lang, "quiz_seo_featured_p")}
          </p>

          <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {QUIZZES.slice(0, 9).map((quiz, i) => (
              <li key={quiz.id} data-delay={i * 30} className="reveal bg-ink p-5">
                <p className="font-display text-base font-extrabold uppercase tracking-[0.04em] text-white">
                  {quiz.title[lang] ?? quiz.title.en}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-fog">
                  {quiz.blurb[lang] ?? quiz.blurb.en}
                </p>
                <p className="quiz-tabular mt-3 text-[10px] font-bold tracking-[0.16em] text-mist">
                  {quiz.count} {t(lang, "quiz_q_short")} · {t(lang, `diff_${quiz.difficulty}`)}
                  {quiz.premium && ` · ${t(lang, "quiz_locked")}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section aria-labelledby="quiz-seo-how" className="border-t border-line">
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
          <h2
            id="quiz-seo-how"
            className="reveal font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
          >
            {t(lang, "quiz_seo_how_h")}
          </h2>
          {/* A connected step flow, deliberately unlike the grids above it. */}
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <li key={n} data-delay={i * 60} className="reveal relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent/40 bg-accent/10 font-display text-sm font-extrabold text-white">
                    {String(n).padStart(2, "0")}
                  </span>
                  {n < 5 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-gradient-to-r from-accent/50 to-line lg:block"
                    />
                  )}
                </div>
                <p className="mt-4 font-display text-sm font-extrabold uppercase tracking-[0.08em] text-white">
                  {t(lang, `quiz_seo_step${n}`)}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-mist">
                  {t(lang, `quiz_seo_step${n}_p`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section
        aria-labelledby="quiz-seo-faq"
        className="border-t border-line bg-charcoal/40"
      >
        <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-8 sm:py-20">
          <h2
            id="quiz-seo-faq"
            className="reveal font-display text-3xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-4xl"
          >
            {t(lang, "quiz_seo_faq_h")}
          </h2>

          <div className="mt-8 divide-y divide-white/5 border border-line bg-ink">
            {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n) => (
              <details key={n} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white transition-colors hover:text-accent">
                  {t(lang, `quiz_faq_${n}_q`)}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-mist">
                  {t(lang, `quiz_faq_${n}_a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- internal links ---------- */}
      <section
        aria-labelledby="quiz-seo-explore"
        className="border-t border-line"
      >
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 lg:px-16">
          <h2
            id="quiz-seo-explore"
            className="reveal font-display text-2xl font-extrabold uppercase tracking-[0.02em] text-white sm:text-3xl"
          >
            {t(lang, "quiz_seo_explore_h")}
          </h2>

          <ul className="mt-6 flex flex-wrap gap-2">
            {ARTICLE_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex h-9 items-center gap-2 border border-line px-3 text-[11px] font-semibold tracking-[0.14em] text-mist transition-colors hover:border-white/30 hover:text-white"
                >
                  {t(lang, link.key)}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>

          {popularCars.length > 0 && (
            <>
              <h3 className="mt-10 text-[11px] font-bold tracking-[0.2em] text-fog">
                {t(lang, "quiz_seo_cars_h")}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {popularCars.map((car) => (
                  <li key={car.id}>
                    <Link
                      to={`/car/${car.id}`}
                      className="inline-flex h-9 items-center gap-2 border border-line px-3 text-[11px] font-semibold tracking-[0.12em] text-mist transition-colors hover:border-accent/40 hover:text-white"
                    >
                      {car.brand} {car.model}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
