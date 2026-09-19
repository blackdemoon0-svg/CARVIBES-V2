// ============================================================
// CARVIBES / MARKETVIBES — pagination
//
// Real <a href> links (not buttons), so paginated result sets stay
// crawlable, shareable and openable in a new tab. rel="prev"/"next" is
// declared for search engines, and the current page is marked with
// aria-current.
// ============================================================

import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";

export default function Pagination({
  page,
  pages,
  buildHref,
  lang,
}: {
  page: number;
  pages: number;
  buildHref: (page: number) => string;
  lang: Lang;
}) {
  if (pages <= 1) return null;
  const window = 2;
  const numbers: number[] = [];
  for (let index = page - window; index <= page + window; index += 1) {
    if (index >= 1 && index <= pages) numbers.push(index);
  }
  const linkClass =
    "cv-btn cv-btn-sm inline-flex h-10 min-w-10 items-center justify-center border px-3 text-[12px] font-semibold tracking-[0.1em] transition-colors";

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={t(lang, "mk_pagination")}>
      {page > 1 && (
        <Link rel="prev" to={buildHref(page - 1)} className={cn(linkClass, "cv-btn-subtle")}>
          ← {t(lang, "mk_prev")}
        </Link>
      )}
      {numbers[0] > 1 && (
        <>
          <Link to={buildHref(1)} className={cn(linkClass, "cv-btn-subtle")}>
            1
          </Link>
          {numbers[0] > 2 && <span className="px-1 text-fog">…</span>}
        </>
      )}
      {numbers.map((number) => (
        <Link
          key={number}
          to={buildHref(number)}
          aria-current={number === page ? "page" : undefined}
          className={cn(
            linkClass,
            number === page ? "cv-btn-primary border-accent" : "cv-btn-subtle"
          )}
        >
          {number}
        </Link>
      ))}
      {numbers[numbers.length - 1] < pages && (
        <>
          {numbers[numbers.length - 1] < pages - 1 && <span className="px-1 text-fog">…</span>}
          <Link to={buildHref(pages)} className={cn(linkClass, "cv-btn-subtle")}>
            {pages}
          </Link>
        </>
      )}
      {page < pages && (
        <Link rel="next" to={buildHref(page + 1)} className={cn(linkClass, "cv-btn-subtle")}>
          {t(lang, "mk_next")} →
        </Link>
      )}
    </nav>
  );
}
