// ============================================================
// CARVIBES / MARKETVIBES — public projection + SEO builders
//
// ONE implementation shared by three consumers, so a listing can never
// look different to Google, to the crawler's raw HTML and to a visitor:
//
//   1. the API (list + detail responses),
//   2. scripts/prerender.mjs  (the static HTML for approved listings),
//   3. scripts/generate-sitemap.mjs (approved listings + facet pages).
//
// It is plain Node ESM on purpose: the numbers/strings are identical
// everywhere, and the browser only ever *receives* the result as JSON.
//
// PRIVACY: the contact value (phone number, WhatsApp number, Instagram
// handle) never leaves the server. Visitors get a channel + a
// server-side redirect endpoint instead, which also counts clicks.
// ============================================================

export const PUBLIC_MEDIA_PREFIX = "/marketplace-media";

const CONDITION_LABEL = { new: "New", used: "Used" };
const SELLER_LABEL = { individual: "Private seller", professional: "Professional seller", dealer: "Dealer" };
const TRANSMISSION_LABEL = {
  automatic: "Automatic",
  manual: "Manual",
  dct: "Dual-clutch (DCT)",
  cvt: "CVT",
  other: "Other",
};
const FUEL_LABEL = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  phev: "Plug-in hybrid",
  electric: "Electric",
  lpg: "LPG",
  other: "Other",
};

export const CONTACT_CHANNELS = {
  whatsapp: { label: "WhatsApp", cta: "Contact on WhatsApp" },
  phone: { label: "Phone", cta: "Call seller" },
  instagram: { label: "Instagram", cta: "View Instagram" },
  other: { label: "Other", cta: "Contact seller" },
};

// ------------------------------------------------------------
// Slugs
// ------------------------------------------------------------
export function slugify(value, max = 48) {
  const base = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, max).replace(/-+$/g, "");
}

/**
 * Stable public URL tail: `<publicId>-<brand>-<model>-<year>`.
 * The descriptive part is cosmetic and may be cleaned up at any time —
 * lookups accept the bare public id as well, so a URL never dies.
 */
export function listingSlug(record) {
  const parts = [record.publicId];
  const brand = slugify(record.vehicle?.brand, 24);
  const model = slugify(record.vehicle?.model, 24);
  if (brand) parts.push(brand);
  if (model && model !== brand) parts.push(model);
  if (record.vehicle?.year) parts.push(String(record.vehicle.year));
  return parts.filter(Boolean).join("-");
}

export function listingPath(record) {
  return `/marketplace/car/${record.slug ?? listingSlug(record)}`;
}

// ------------------------------------------------------------
// Formatting (deterministic across Node + browser)
// ------------------------------------------------------------
export function formatPrice(amount, currency) {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString("en-US")} ${currency ?? ""}`.trim();
  }
}

export function formatMileage(km) {
  if (km === null || km === undefined || km === "") return null;
  const value = Number(km);
  if (!Number.isFinite(value)) return null;
  if (value === 0) return "0 km";
  return `${value.toLocaleString("en-US")} km`;
}

// ------------------------------------------------------------
// Card / detail projections
// ------------------------------------------------------------
function mediaList(record) {
  // URLs are already absolute-in-site terms ("/marketplace-media/…") or full
  // CDN URLs (MARKETPLACE_MEDIA_URL_PREFIX) — both are used verbatim.
  return (record.media ?? []).map((m) => ({
    url: m.url,
    width: m.width ?? 0,
    height: m.height ?? 0,
    alt: m.alt ?? "",
  }));
}

/** Everything a listing card needs — and nothing private. */
export function toPublicCard(record) {
  const primary = record.media?.[0];
  return {
    id: record.id,
    publicId: record.publicId,
    slug: record.slug,
    path: listingPath(record),
    title: listingTitle(record),
    brand: record.vehicle?.brand ?? "",
    model: record.vehicle?.model ?? "",
    year: record.vehicle?.year ?? null,
    condition: record.vehicle?.condition ?? "used",
    conditionLabel: CONDITION_LABEL[record.vehicle?.condition] ?? "Used",
    bodyType: record.vehicle?.bodyType ?? "",
    fuel: record.vehicle?.fuel ?? "",
    fuelLabel: FUEL_LABEL[record.vehicle?.fuel] ?? "",
    transmission: record.vehicle?.transmission ?? "",
    transmissionLabel: TRANSMISSION_LABEL[record.vehicle?.transmission] ?? "",
    mileage: record.vehicle?.mileage ?? null,
    mileageLabel: formatMileage(record.vehicle?.mileage),
    color: record.vehicle?.color ?? "",
    price: record.pricing?.price ?? 0,
    currency: record.pricing?.currency ?? "USD",
    priceLabel: formatPrice(record.pricing?.price, record.pricing?.currency),
    negotiable: Boolean(record.pricing?.negotiable),
    country: record.location?.country ?? "",
    countryCode: record.location?.countryCode ?? "",
    city: record.location?.city ?? "",
    region: record.location?.region ?? "",
    sellerType: record.seller?.type ?? "individual",
    sellerTypeLabel: SELLER_LABEL[record.seller?.type] ?? "Private seller",
    companyName: record.seller?.companyName ?? "",
    contactChannel: record.seller?.contactMethod ?? "other",
    contactValue: record.seller?.contactMethod === "other" ? record.seller?.contactValue ?? "" : "",
    photoCount: (record.media ?? []).length,
    thumb: primary ? { ...primaryMeta(primary), url: primary.url } : null,
    publishedAt: record.publishedAt ?? record.updatedAt ?? record.createdAt,
  };
}

function primaryMeta(media) {
  return { width: media.width ?? 0, height: media.height ?? 0, alt: media.alt ?? "" };
}

/** Detail page payload: card + gallery + description + contact CTA. */
export function toPublicDetail(
  record,
  similar = [],
  moreFromRegion = [],
  moreFromBrand = [],
  { siteUrl = "" } = {}
) {
  const card = toPublicCard(record);
  const channel = record.seller?.contactMethod ?? "other";
  return {
    ...card,
    description: record.vehicle?.description ?? "",
    media: mediaList(record),
    contact: {
      // The raw value stays on the server: this is a redirect endpoint.
      channel,
      label: CONTACT_CHANNELS[channel]?.label ?? "Seller",
      cta: CONTACT_CHANNELS[channel]?.cta ?? "Contact seller",
      href: `/api/marketplace/listings/${record.publicId}/contact`,
      safeValueLabel:
        channel === "instagram"
          ? record.seller?.contactValue
          : channel === "other"
            ? record.seller?.contactValue
            : null,
    },
    seller: {
      type: card.sellerType,
      typeLabel: card.sellerTypeLabel,
      companyName: record.seller?.companyName ?? "",
      memberSince: record.publishedAt ?? record.createdAt,
    },
    specs: buildSpecs(record),
    // Absolute canonical / og:image / JSON-LD URLs whenever the caller
    // knows the public origin (the handler passes it from config).
    seo: buildListingSeo(record, siteUrl),
    similar: similar.map(toPublicCard),
    moreFromRegion: moreFromRegion.map(toPublicCard),
    moreFromBrand: moreFromBrand.map(toPublicCard),
  };
}

function buildSpecs(record) {
  const v = record.vehicle ?? {};
  const specs = [
    { key: "condition", label: CONDITION_LABEL[v.condition] ?? "", value: CONDITION_LABEL[v.condition] ?? "" },
    { key: "year", label: "Year", value: v.year ? String(v.year) : "" },
    { key: "mileage", label: "Mileage", value: formatMileage(v.mileage) ?? "" },
    { key: "transmission", label: "Transmission", value: TRANSMISSION_LABEL[v.transmission] ?? "" },
    { key: "fuel", label: "Fuel", value: FUEL_LABEL[v.fuel] ?? "" },
    { key: "body", label: "Body type", value: v.bodyType ?? "" },
    { key: "color", label: "Colour", value: v.color ?? "" },
  ];
  return specs.filter((s) => s.value);
}

// ------------------------------------------------------------
// SEO
// ------------------------------------------------------------
/**
 * Human title — used for the H1, the cards and every internal link.
 * Location is part of it so "2019 BMW 320i" never appears bare.
 */
export function listingTitle(record) {
  const v = record.vehicle ?? {};
  const year = v.year ? `${v.year} ` : "";
  const condition = CONDITION_LABEL[v.condition] ?? "Used";
  const city = record.location?.city ?? "";
  const core = `${year}${v.brand ?? ""} ${v.model ?? ""}`.trim();
  return `${core} — ${condition}${city ? ` in ${city}` : ""}`;
}

/** Short, stable, human-quotable reference derived from the public id. */
export function listingReference(record) {
  const source = String(record.publicId ?? record.id ?? "").replace(/^v/, "");
  return `MK-${source.slice(-6).toUpperCase()}`;
}

/**
 * <title> — the human title plus the listing reference. The reference is
 * what guarantees uniqueness: two identical cars in the same city are two
 * different listings, and scripts/verify-seo.mjs fails the build on a
 * duplicate <title> across indexable pages. Buyers can quote it when they
 * contact the seller.
 */
export function listingSeoTitle(record) {
  return `${listingTitle(record)} · ${listingReference(record)}`;
}

const clamp = (text, max) => {
  const s = String(text ?? "").replace(/\s+/g, " ").trim();
  return s.length <= max ? s : `${s.slice(0, max - 1).replace(/[\s,.;:—-]+$/, "")}…`;
};

export function listingMetaDescription(record) {
  const v = record.vehicle ?? {};
  const bits = [
    `${listingSeoTitle(record)} for sale`,
    formatPrice(record.pricing?.price, record.pricing?.currency),
    formatMileage(v.mileage),
    v.fuel ? FUEL_LABEL[v.fuel] : null,
    v.transmission ? TRANSMISSION_LABEL[v.transmission] : null,
    [record.location?.city, record.location?.country].filter(Boolean).join(", "),
    "Contact the seller on CarVibes MarketVibes.",
  ].filter(Boolean);
  return clamp(bits.join(" · "), 158);
}

export function buildListingSeo(record, siteUrl = "") {
  const path = listingPath(record);
  const image = record.media?.[0]?.url ?? "";
  return {
    title: `${listingSeoTitle(record)} for sale | CarVibes MarketVibes`,
    description: listingMetaDescription(record),
    canonicalPath: path,
    canonical: siteUrl ? `${siteUrl}${path}` : path,
    image,
    absoluteImage: image && siteUrl ? `${siteUrl}${image}` : image,
    jsonLd: listingJsonLd(record, siteUrl),
    breadcrumbs: [
      { name: "MarketVibes", path: "/marketplace" },
      { name: record.vehicle?.brand || "Cars", path: `/marketplace/brand/${slugify(record.vehicle?.brand)}` },
      { name: listingTitle(record), path },
    ],
  };
}

/**
 * schema.org Vehicle + Offer (+ BreadcrumbList). Deliberately modest:
 * only facts the seller actually provided — no invented ratings.
 */
export function listingJsonLd(record, siteUrl = "") {
  const v = record.vehicle ?? {};
  const path = listingPath(record);
  const url = siteUrl ? `${siteUrl}${path}` : path;
  const images = (record.media ?? []).map((m) => (siteUrl ? `${siteUrl}${m.url}` : m.url));
  const brandName = [v.brand, v.model].filter(Boolean).join(" ").trim();

  return [
    {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      name: listingTitle(record),
      description: clamp(v.description || listingMetaDescription(record), 400),
      url,
      ...(images.length ? { image: images } : {}),
      ...(v.brand ? { brand: { "@type": "Brand", name: v.brand } } : {}),
      ...(v.model ? { model: v.model } : {}),
      ...(brandName ? { vehicleConfiguration: brandName } : {}),
      ...(v.year ? { vehicleModelDate: String(v.year) } : {}),
      ...(v.color ? { color: v.color } : {}),
      ...(v.bodyType ? { bodyType: v.bodyType } : {}),
      ...(v.mileage !== null && v.mileage !== undefined
        ? {
            mileageFromOdometer: {
              "@type": "QuantitativeValue",
              value: Number(v.mileage),
              unitCode: "KMT",
            },
          }
        : {}),
      ...(v.fuel ? { fuelType: FUEL_LABEL[v.fuel] ?? v.fuel } : {}),
      ...(v.transmission ? { vehicleTransmission: TRANSMISSION_LABEL[v.transmission] ?? v.transmission } : {}),
      ...(v.condition === "new" ? { itemCondition: "https://schema.org/NewCondition" } : {}),
      offers: {
        "@type": "Offer",
        url,
        price: Number(record.pricing?.price) || 0,
        priceCurrency: record.pricing?.currency ?? "USD",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": record.seller?.type === "individual" ? "Person" : "Organization",
          name: record.seller?.companyName || record.seller?.typeLabel || SELLER_LABEL[record.seller?.type] || "Seller",
        },
        ...(record.location?.country
          ? {
              areaServed: {
                "@type": "Place",
                name: [record.location.city, record.location.country].filter(Boolean).join(", "),
              },
            }
          : {}),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "MarketVibes", item: siteUrl ? `${siteUrl}/marketplace` : "/marketplace" },
        {
          "@type": "ListItem",
          position: 2,
          name: v.brand || "Cars",
          item: siteUrl ? `${siteUrl}/marketplace/brand/${slugify(v.brand)}` : `/marketplace/brand/${slugify(v.brand)}`,
        },
        { "@type": "ListItem", position: 3, name: listingTitle(record), item: url },
      ],
    },
  ];
}

// ------------------------------------------------------------
// Facet pages (indexable, supply-driven — see docs/MARKETPLACE.md)
// ------------------------------------------------------------
export const FACET_KINDS = ["brand", "country", "condition"];

/** Path of an indexable facet page. */
export function facetPath(kind, value) {
  if (kind === "condition") return `/marketplace/condition/${value}`;
  return `/marketplace/${kind}/${slugify(value)}`;
}

/** Slug used in facet URLs (countries/brands are free text). */
export function facetSlug(value) {
  return slugify(value, 64);
}

export function facetTitle(kind, value) {
  if (kind === "brand") return `Used & new ${value} cars for sale | CarVibes MarketVibes`;
  if (kind === "country") return `Cars for sale in ${value} | CarVibes MarketVibes`;
  if (kind === "condition") return `${value === "new" ? "New" : "Used"} cars for sale | CarVibes MarketVibes`;
  return "Cars for sale | CarVibes MarketVibes";
}

export function facetDescription(kind, value, count) {
  if (kind === "brand")
    return `Browse ${count} ${value} cars listed for sale by private sellers and dealers: prices, mileage, photos and direct contact with the seller on CarVibes MarketVibes.`;
  if (kind === "country")
    return `${count} cars for sale in ${value} — new and used vehicles from private sellers and dealers, with prices, photos and direct seller contact on CarVibes MarketVibes.`;
  if (kind === "condition")
    return `${count} ${value} cars for sale from private sellers and dealers on CarVibes MarketVibes: photos, full specs, prices and direct contact.`;
  return "Cars for sale on CarVibes MarketVibes.";
}

/**
 * Which filter combinations get their own indexable URL. Only SINGLE
 * facets, and only when the marketplace actually has enough supply —
 * this is the "intentional indexability" rule that keeps thousands of
 * thin, near-duplicate facet pages out of the index.
 */
export const FACET_MIN_LISTINGS = 3;

export function facetPages(listings) {
  const groups = { brand: new Map(), country: new Map(), condition: new Map() };
  for (const listing of listings) {
    const brand = listing.vehicle?.brand;
    if (brand) groups.brand.set(brand, (groups.brand.get(brand) ?? 0) + 1);
    const country = listing.location?.country;
    if (country) groups.country.set(country, (groups.country.get(country) ?? 0) + 1);
    const condition = listing.vehicle?.condition;
    if (condition) groups.condition.set(condition, (groups.condition.get(condition) ?? 0) + 1);
  }
  const pages = [];
  for (const kind of FACET_KINDS) {
    for (const [value, count] of groups[kind]) {
      if (count < FACET_MIN_LISTINGS) continue;
      const slug = kind === "condition" ? value : facetSlug(value);
      if (!slug) continue;
      pages.push({
        kind,
        value,
        slug,
        count,
        path: facetPath(kind, value),
        title: facetTitle(kind, value),
        description: facetDescription(kind, value, count),
      });
    }
  }
  return pages.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));
}
