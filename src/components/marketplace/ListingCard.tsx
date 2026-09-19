// ============================================================
// CARVIBES / MARKETVIBES — listing card
//
// Every action is a REAL <a href> (crawlable, middle-clickable,
// keyboard-accessible) — the router picks the navigation up — except the
// contact CTA, which points at the server-side redirect endpoint, so the
// seller's phone number is never present in the page or in the HTML.
// ============================================================

import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { formatMileage, formatPrice, formatRelativeTime } from "../../lib/marketplace/format";
import type { ListingCard as ListingCardType } from "../../lib/marketplace/types";
import { API_BASE } from "../../lib/marketplace/api";
import { trackMarketplace } from "../../lib/marketplace/analytics";
import ListingImage from "./ListingImage";

export function contactHref(listing: { publicId: string }): string {
  return `${API_BASE}/listings/${encodeURIComponent(listing.publicId)}/contact`;
}

export default function ListingCard({
  listing,
  lang,
  index = 0,
  priority = false,
}: {
  listing: ListingCardType;
  lang: Lang;
  index?: number;
  /** Set only for the first cards above the fold. */
  priority?: boolean;
}) {
  const location = [listing.city, listing.country].filter(Boolean).join(", ");
  const mileage = formatMileage(listing.mileage, lang);

  return (
    <article
      className="card-in edge-light group relative flex flex-col overflow-hidden border border-line bg-charcoal transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_30px_70px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(227,38,46,0.14)]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Photo — the whole area is a crawlable link to the listing. */}
      <Link
        to={listing.path}
        className="relative block aspect-[16/11] overflow-hidden bg-graphite"
        aria-label={`${listing.title} — ${t(lang, "mk_view_details")}`}
        onClick={() => trackMarketplace("listing_view", { id: listing.publicId, from: "card" })}
      >
        {listing.thumb ? (
          <ListingImage
            src={listing.thumb.url}
            alt={listing.thumb.alt || listing.title}
            priority={priority}
            imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-[11px] tracking-[0.24em] text-fog">
            NO PHOTO
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

        {/* Condition + photo count */}
        <span className="absolute left-3 top-3 border border-white/15 bg-ink/60 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-white backdrop-blur-sm">
          {listing.condition === "new" ? t(lang, "mk_condition_new") : t(lang, "mk_condition_used")}
        </span>
        {listing.photoCount > 1 && (
          <span className="absolute right-3 top-3 border border-white/15 bg-ink/60 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white backdrop-blur-sm">
            📷 {listing.photoCount}
          </span>
        )}

        {/* Price */}
        <span className="absolute bottom-3 left-3 font-display text-lg font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {formatPrice(listing.price, listing.currency, lang)}
          {listing.negotiable && (
            <span className="ml-2 align-middle text-[9px] font-semibold tracking-[0.16em] text-white/75">
              {t(lang, "mk_negotiable_short")}
            </span>
          )}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col border-t border-line p-4 sm:p-5">
        <h3 className="font-display text-base font-semibold leading-snug text-white sm:text-lg">
          <Link to={listing.path} className="transition-colors hover:text-accent-soft">
            {listing.year ? `${listing.year} ` : ""}
            {listing.brand} <span className="font-normal text-mist">{listing.model}</span>
          </Link>
        </h3>

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-mist">
          {mileage && <li>{mileage}</li>}
          {listing.fuelLabel && <li aria-hidden="true">· {listing.fuelLabel}</li>}
          {listing.transmissionLabel && <li aria-hidden="true">· {listing.transmissionLabel}</li>}
          {listing.bodyType && <li aria-hidden="true">· {listing.bodyType}</li>}
        </ul>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-fog">
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">📍</span>
              {location}
            </span>
          )}
          {listing.sellerTypeLabel && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">👤</span>
              {t(lang, `mk_seller_${listing.sellerType}`)}
            </span>
          )}
          {listing.publishedAt && (
            <span className="ml-auto text-[11px] text-fog/80">{formatRelativeTime(listing.publishedAt, lang)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-stretch gap-2 border-t border-line pt-4">
          <Link
            to={listing.path}
            className="cv-btn cv-btn-sm cv-btn-outline inline-flex h-10 flex-1 items-center justify-center px-3 text-[11px] font-semibold tracking-[0.14em]"
          >
            {t(lang, "mk_view_details")}
          </Link>
          <a
            href={contactHref(listing)}
            target="_blank"
            rel="nofollow noopener noreferrer"
            onClick={() => trackMarketplace("listing_contact_click", { id: listing.publicId, channel: listing.contactChannel, from: "card" })}
            className={cn(
              "cv-btn cv-btn-sm cv-btn-primary inline-flex h-10 flex-1 items-center justify-center px-3 text-[11px] font-semibold tracking-[0.14em]",
              listing.contactChannel === "instagram" && "bg-graphite text-white"
            )}
          >
            {t(lang, `mk_contact_${listing.contactChannel}`)}
          </a>
        </div>
      </div>
    </article>
  );
}
