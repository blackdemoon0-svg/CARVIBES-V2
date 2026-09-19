// ============================================================
// CARVIBES / MARKETVIBES — related listings (internal linking)
//
// Three genuine discovery paths, each rendered as crawlable links:
//   similar cars (same body type),
//   more cars in the same country,
//   more cars from the same brand (deep-links to its facet page).
// ============================================================

import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { formatPrice } from "../../lib/marketplace/format";
import { toSlug } from "../../lib/marketplace/taxonomy";
import type { ListingCard } from "../../lib/marketplace/types";
import ListingImage from "./ListingImage";
import { SectionHeading } from "./states";

function CompactCard({ listing, lang }: { listing: ListingCard; lang: Lang }) {
  return (
    <Link
      to={listing.path}
      className="edge-light group flex items-center gap-3 border border-line bg-charcoal p-3 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
    >
      <span className="relative block h-16 w-24 shrink-0 overflow-hidden bg-graphite">
        {listing.thumb ? (
          <ListingImage src={listing.thumb.url} alt={listing.thumb.alt || listing.title} cropW={240} cropH={160} sizes="96px" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[13px] font-semibold text-white">
          {listing.year ? `${listing.year} ` : ""}
          {listing.brand} {listing.model}
        </span>
        <span className="mt-1 block truncate text-[11px] text-fog">
          {[listing.city, listing.country].filter(Boolean).join(", ")}
        </span>
        <span className="mt-1 block font-display text-[13px] font-bold text-accent-soft">
          {formatPrice(listing.price, listing.currency, lang)}
        </span>
      </span>
    </Link>
  );
}

export default function SimilarListings({
  lang,
  listing,
}: {
  lang: Lang;
  listing: {
    similar: ListingCard[];
    moreFromRegion: ListingCard[];
    moreFromBrand: ListingCard[];
    brand: string;
    country: string;
  };
}) {
  const groups: { key: string; title: string; items: ListingCard[]; facetPath?: string }[] = [];
  if (listing.similar.length) {
    groups.push({ key: "similar", title: t(lang, "mk_similar_title"), items: listing.similar.slice(0, 3) });
  }
  if (listing.moreFromBrand.length) {
    groups.push({
      key: "brand",
      title: t(lang, "mk_more_brand", { brand: listing.brand }),
      items: listing.moreFromBrand.slice(0, 3),
      facetPath: `/marketplace/brand/${toSlug(listing.brand)}`,
    });
  }
  if (listing.moreFromRegion.length) {
    groups.push({
      key: "region",
      title: t(lang, "mk_more_region", { country: listing.country }),
      items: listing.moreFromRegion.slice(0, 3),
      facetPath: `/marketplace/country/${toSlug(listing.country)}`,
    });
  }
  if (!groups.length) return null;

  return (
    <div className="mt-14 space-y-10 border-t border-line pt-10">
      {groups.map((group) => (
        <section key={group.key}>
          <SectionHeading
            title={group.title}
            action={
              group.facetPath ? (
                <Link
                  to={group.facetPath}
                  className="text-[11px] font-semibold tracking-[0.16em] text-mist underline decoration-line underline-offset-8 transition-colors hover:text-white"
                >
                  {t(lang, "mk_view_all")}
                </Link>
              ) : null
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <CompactCard key={item.id} listing={item} lang={lang} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
