// ============================================================
// CARVIBES / MARKETVIBES — /marketplace/car/:slug
//
// The public listing page. Every important navigation is a real
// <a href>; the seller's phone number is never rendered, only a
// server-side contact endpoint (which also counts the click).
//
// Pending, rejected and unknown listings are indistinguishable from a
// missing page (404) — nothing about a private submission leaks.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { fetchListing } from "../../lib/marketplace/api";
import { trackMarketplace } from "../../lib/marketplace/analytics";
import { formatDateShort, formatMileage, formatPrice, formatRelativeTime } from "../../lib/marketplace/format";
import type { ListingDetail } from "../../lib/marketplace/types";
import { useMarketplaceMeta } from "../../lib/marketplace/useMeta";
import Gallery from "../../components/marketplace/Gallery";
import SimilarListings from "../../components/marketplace/SimilarListings";
import { DetailSkeleton, NotFoundState, SellBand } from "../../components/marketplace/states";
import { ShieldIcon } from "../../components/icons";

/**
 * The prerendered listing page embeds the exact payload the API would
 * return (id="mk-listing-bootstrap", written by scripts/prerender.mjs).
 * Reading it during the first render means the price, the specs and — most
 * importantly — the gallery image are committed as soon as the bundle
 * executes, instead of waiting for a fetch round trip that only starts
 * after React mounts. The request below still runs, so view counting,
 * seller edits and removals behave exactly as on a client-side navigation.
 */
function readBootstrap(slug: string): ListingDetail | null {
  if (typeof document === "undefined") return null;
  const node = document.getElementById("mk-listing-bootstrap");
  if (!node) return null;
  const known = node.getAttribute("data-slug");
  if (known && known !== slug) return null;
  try {
    const parsed = JSON.parse(node.textContent ?? "") as { ok?: boolean; data?: ListingDetail };
    return parsed?.ok && parsed.data ? parsed.data : null;
  } catch {
    return null;
  }
}

export default function MarketplaceListingPage({ lang }: { lang: Lang }) {
  const { slug = "" } = useParams();
  const boot = useMemo(() => readBootstrap(slug), [slug]);
  const [listing, setListing] = useState<ListingDetail | null>(boot);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(
    boot ? "ready" : "loading"
  );

  const load = useCallback(
    (signal?: AbortSignal) => {
      if (!boot) setStatus("loading");
      void fetchListing(slug, signal).then((result) => {
        if (result.ok) {
          setListing(result.data);
          setStatus("ready");
          return;
        }
        // A 404 means the listing is gone (rejected / removed) — the boot
        // payload must not keep showing it. Any other failure keeps the
        // prerendered content on screen instead of blanking the page.
        if (result.error.status === 404) {
          setListing(null);
          setStatus("missing");
          return;
        }
        setStatus(boot ? "ready" : "error");
      });
    },
    [boot, slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (status === "ready" && listing) {
      trackMarketplace("listing_view", { id: listing.publicId, brand: listing.brand, currency: listing.currency });
    }
  }, [status, listing]);

  const meta = useMemo(
    () => ({
      title: listing?.seo.title ?? t(lang, "mk_meta_title"),
      description: listing?.seo.description ?? t(lang, "mk_meta_desc"),
      canonicalPath: listing?.seo.canonicalPath ?? `/marketplace/car/${slug}`,
      image: listing?.seo.absoluteImage || undefined,
      jsonLd: listing?.seo.jsonLd ?? null,
    }),
    [lang, listing, slug]
  );

  useMarketplaceMeta({
    title: meta.title,
    description: meta.description,
    canonicalPath: meta.canonicalPath,
    indexable: status === "ready",
    image: meta.image,
    jsonLd: meta.jsonLd,
  });

  if (status === "loading") return <DetailSkeleton lang={lang} />;
  if (status === "missing" || status === "error") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <NotFoundState lang={lang} />
      </div>
    );
  }
  if (!listing) return null;

  const location = [listing.city, listing.region, listing.country].filter(Boolean).join(", ");
  const specs = listing.specs.filter((spec) => spec.key !== "condition");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      {/* Breadcrumbs — real links, mirrored by BreadcrumbList JSON-LD */}
      <nav aria-label={t(lang, "mk_breadcrumb")} className="mb-5 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.14em] text-fog">
        <Link to="/marketplace" className="transition-colors hover:text-white">
          {t(lang, "mk_brand_name")}
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/marketplace/brand/${listing.brand.toLowerCase().replace(/\s+/g, "-")}`} className="transition-colors hover:text-white">
          {listing.brand}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-mist">
          {listing.year ? `${listing.year} ` : ""}
          {listing.model}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:gap-10">
        <div>
          <Gallery media={listing.media} title={listing.title} lang={lang} />

          {/* Title + price (mobile shows price again below the gallery) */}
          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-white">
                {listing.condition === "new" ? t(lang, "mk_condition_new") : t(lang, "mk_condition_used")}
              </span>
              <span className="border border-line bg-ink/60 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-mist">
                {listing.sellerTypeLabel && t(lang, `mk_seller_${listing.sellerType}`)}
              </span>
              {listing.publishedAt && (
                <span className="text-[11px] text-fog">{formatRelativeTime(listing.publishedAt, lang)}</span>
              )}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
              {listing.year ? `${listing.year} ` : ""}
              {listing.brand} <span className="font-normal text-mist">{listing.model}</span>
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mist">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true">📍</span>
                  {location}
                </span>
              )}
            </p>
            <p className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
              {formatPrice(listing.price, listing.currency, lang)}
              {listing.negotiable && (
                <span className="ml-3 align-middle border border-line px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-mist">
                  {t(lang, "mk_negotiable")}
                </span>
              )}
            </p>
          </header>

          {/* Specs */}
          <section className="mt-8 border border-line bg-charcoal" aria-labelledby="mk-specs">
            <h2 id="mk-specs" className="border-b border-line px-5 py-4 text-[10px] font-semibold tracking-[0.24em] text-fog">
              {t(lang, "mk_specs_title").toUpperCase()}
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.18em] text-fog">{t(lang, "mk_spec_year")}</dt>
                <dd className="mt-1 text-sm text-white">{listing.year ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.18em] text-fog">{t(lang, "mk_spec_mileage")}</dt>
                <dd className="mt-1 text-sm text-white">{formatMileage(listing.mileage, lang) ?? "—"}</dd>
              </div>
              {specs.map((spec) => (
                <div key={spec.key}>
                  <dt className="text-[10px] font-semibold tracking-[0.18em] text-fog">{spec.label.toUpperCase()}</dt>
                  <dd className="mt-1 text-sm text-white">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Description */}
          <section className="mt-8" aria-labelledby="mk-description">
            <h2 id="mk-description" className="font-display text-lg font-semibold text-white">
              {t(lang, "mk_description_title")}
            </h2>
            <div className="mt-3 max-w-3xl whitespace-pre-line text-[14px] leading-relaxed text-mist">
              {listing.description || t(lang, "mk_description_empty")}
            </div>
          </section>

          <div className="mt-8">
            <Link
              to="/marketplace"
              className="cv-btn cv-btn-sm cv-btn-subtle inline-flex h-11 items-center px-5 text-[11px] font-semibold tracking-[0.16em]"
            >
              ← {t(lang, "mk_back_to_marketplace")}
            </Link>
          </div>
        </div>

        {/* Contact / seller column — sticky on desktop */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="edge-light border border-line bg-charcoal p-5">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-fog">{t(lang, "mk_seller_title").toUpperCase()}</p>
            <p className="mt-2 font-display text-base font-semibold text-white">
              {listing.companyName || t(lang, `mk_seller_${listing.sellerType}`)}
            </p>
            {listing.companyName && (
              <p className="mt-1 text-[12px] text-fog">{t(lang, `mk_seller_${listing.sellerType}`)}</p>
            )}
            {listing.seller.memberSince && (
              <p className="mt-1 text-[12px] text-fog">
                {t(lang, "mk_listed_on", { date: formatDateShort(listing.seller.memberSince, lang) })}
              </p>
            )}

            <a
              href={listing.contact.href}
              target="_blank"
              rel="nofollow noopener noreferrer"
              onClick={() => trackMarketplace("listing_contact_click", { id: listing.publicId, channel: listing.contact.channel, from: "detail" })}
              className="cv-btn cv-btn-primary mt-5 flex h-13 w-full items-center justify-center px-5 text-[12px] font-semibold tracking-[0.16em]"
            >
              {t(lang, `mk_contact_cta_${listing.contact.channel}`)}
            </a>

            {listing.contact.safeValueLabel && listing.contact.channel === "instagram" && (
              <p className="mt-3 text-center text-[12px] text-mist">@{listing.contact.safeValueLabel}</p>
            )}
            {listing.contact.safeValueLabel && listing.contact.channel === "other" && (
              <p className="mt-3 break-words text-center text-[12px] text-mist">{listing.contact.safeValueLabel}</p>
            )}

            <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-[11px] leading-relaxed text-fog">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {t(lang, "mk_safety_note")}
            </p>
          </div>

          <div className="mt-4 border border-line bg-charcoal p-5">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-fog">{t(lang, "mk_location_title").toUpperCase()}</p>
            <p className="mt-2 text-sm text-white">{location || "—"}</p>
            <Link
              to={`/marketplace/country/${listing.country.toLowerCase().replace(/\s+/g, "-")}`}
              className="mt-2 inline-block text-[12px] text-mist underline decoration-line underline-offset-4 hover:text-white"
            >
              {t(lang, "mk_more_region", { country: listing.country })}
            </Link>
          </div>
        </aside>
      </div>

      <SimilarListings
        lang={lang}
        listing={{
          similar: listing.similar,
          moreFromRegion: listing.moreFromRegion,
          moreFromBrand: listing.moreFromBrand,
          brand: listing.brand,
          country: listing.country,
        }}
      />

      <div className="mt-14">
        <SellBand lang={lang} />
      </div>
    </div>
  );
}
