// ============================================================
// CARVIBES / MARKETVIBES — submission validation + public queries
//
// The client validates too (immediate, friendly feedback) but the
// SERVER is the source of truth: every field is re-validated, sanitised
// and size-capped here, and the enums come from the same taxonomy.json
// the UI is built from.
// ============================================================

import taxonomy from "../../src/lib/marketplace/data/taxonomy.json" with { type: "json" };
import countries from "../../src/lib/marketplace/data/countries.json" with { type: "json" };
import { newListingId, randomId, STATUS } from "./store.mjs";
import { listingSlug } from "./public-view.mjs";

const COUNTRY_BY_CODE = new Map(countries.map((c) => [c.code.toUpperCase(), c]));
const FUELS = new Set(taxonomy.fuels.map((f) => f.id));
const TRANSMISSIONS = new Set(taxonomy.transmissions.map((t) => t.id));
const CURRENCIES = new Set(taxonomy.currencies);
const CONDITIONS = new Set(taxonomy.conditions.map((c) => c.id));
const SELLER_TYPES = new Set(taxonomy.sellerTypes.map((s) => s.id));
const CONTACT_METHODS = new Set(taxonomy.contactMethods.map((c) => c.id));
const CONTACT_CHANNELS = ["whatsapp", "phone", "instagram", "other"];

const MAX_YEAR = new Date().getFullYear() + 2;
const MIN_YEAR = 1900;

// ------------------------------------------------------------
// Sanitising helpers
// ------------------------------------------------------------
export function cleanText(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function cleanMultiline(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function digits(value) {
  return String(value ?? "").replace(/[^\d+]/g, "");
}

// ------------------------------------------------------------
// Validation
// ------------------------------------------------------------
/**
 * Validate a submission payload.
 * @returns {{ ok: boolean, errors: Record<string,string>, value?: object }}
 */
export function validateSubmission(payload, { stagedUploads = [], limits } = {}) {
  const errors = {};
  const input = payload ?? {};
  const mediaIds = Array.isArray(input.mediaIds)
    ? input.mediaIds.filter((id) => typeof id === "string").slice(0, limits?.maxPhotos ?? 8)
    : [];
  const vehicle = input.vehicle ?? {};
  const pricing = input.pricing ?? {};
  const location = input.location ?? {};
  const seller = input.seller ?? {};

  // --- Anti-spam -------------------------------------------------
  if (cleanText(input.website, 200)) errors.spam = "spam"; // honeypot
  const submittedAt = Number(input.formOpenedAt);
  if (Number.isFinite(submittedAt) && Date.now() - submittedAt < 2500) errors.spam = "too_fast";

  // --- Vehicle ---------------------------------------------------
  const brand = cleanText(vehicle.brand, 40);
  if (brand.length < 2) errors["vehicle.brand"] = "required";

  const model = cleanText(vehicle.model, 60);
  if (model.length < 1) errors["vehicle.model"] = "required";

  const year = Number(vehicle.year);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) errors["vehicle.year"] = "range";

  const condition = CONDITIONS.has(vehicle.condition) ? vehicle.condition : null;
  if (!condition) errors["vehicle.condition"] = "required";

  const fuel = vehicle.fuel ? cleanText(vehicle.fuel, 20) : null;
  if (fuel && !FUELS.has(fuel)) errors["vehicle.fuel"] = "invalid";

  const transmission = vehicle.transmission ? cleanText(vehicle.transmission, 20) : null;
  if (transmission && !TRANSMISSIONS.has(transmission)) errors["vehicle.transmission"] = "invalid";

  const bodyType = cleanText(vehicle.bodyType, 40) || null;
  const color = cleanText(vehicle.color, 30) || null;
  const description = cleanMultiline(vehicle.description, 3000) || "";

  let mileage = vehicle.mileage === "" || vehicle.mileage === null || vehicle.mileage === undefined
    ? null
    : Number(vehicle.mileage);
  if (mileage !== null) {
    if (!Number.isFinite(mileage) || mileage < 0 || mileage > 2_000_000) errors["vehicle.mileage"] = "range";
    else mileage = Math.round(mileage);
  }
  if (condition === "used" && mileage === null) errors["vehicle.mileage"] = "required";

  // --- Pricing ---------------------------------------------------
  const price = Number(pricing.price);
  if (!Number.isFinite(price) || price <= 0 || price > 500_000_000) errors["pricing.price"] = "range";

  const currency = CURRENCIES.has(pricing.currency) ? pricing.currency : null;
  if (!currency) errors["pricing.currency"] = "required";

  // --- Location --------------------------------------------------
  const countryCode = cleanText(location.countryCode, 2).toUpperCase();
  const countryEntry = COUNTRY_BY_CODE.get(countryCode);
  if (!countryEntry) errors["location.countryCode"] = "required";

  const city = cleanText(location.city, 60);
  if (city.length < 2) errors["location.city"] = "required";
  const region = cleanText(location.region, 60) || null;

  // --- Seller ----------------------------------------------------
  const sellerType = SELLER_TYPES.has(seller.type) ? seller.type : "individual";
  const companyName = cleanText(seller.companyName, 80) || null;
  if (sellerType !== "individual" && !companyName) errors["seller.companyName"] = "required";

  const contactMethod = CONTACT_METHODS.has(seller.contactMethod) ? seller.contactMethod : null;
  if (!contactMethod) errors["seller.contactMethod"] = "required";

  let contactValue = cleanText(seller.contactValue, 200);
  if (contactMethod === "whatsapp" || contactMethod === "phone") {
    const phone = digits(contactValue).replace(/^00/, "+");
    if (phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15) {
      errors["seller.contactValue"] = "phone";
    }
    contactValue = phone;
  } else if (contactMethod === "instagram") {
    const handle = contactValue.replace(/^@+/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "");
    if (!/^[A-Za-z0-9._]{2,30}$/.test(handle)) errors["seller.contactValue"] = "instagram";
    contactValue = handle;
  } else if (contactMethod === "other") {
    if (contactValue.length < 3) errors["seller.contactValue"] = "required";
  }

  // --- Photos ----------------------------------------------------
  if (!mediaIds.length) errors.media = "required";
  if (mediaIds.length > (limits?.maxPhotos ?? 8)) errors.media = "too_many";
  const unknown = mediaIds.filter((id) => !stagedUploads.some((u) => u.id === id));
  if (unknown.length) errors.media = "unknown";

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: {
      vehicle: {
        brand,
        model,
        year,
        condition,
        bodyType,
        fuel,
        transmission,
        mileage,
        color,
        description,
      },
      pricing: { price: Math.round(price), currency, negotiable: Boolean(pricing.negotiable) },
      location: { country: countryEntry.name, countryCode: countryEntry.code, city, region },
      seller: {
        type: sellerType,
        companyName,
        contactMethod,
        contactValue,
        contactChannel: CONTACT_CHANNELS.includes(contactMethod) ? contactMethod : "other",
      },
      mediaIds,
    },
  };
}

/** Build the stored listing record (always PENDING). */
export function buildListing(value, stagedUploads, meta = {}) {
  const byId = new Map(stagedUploads.map((u) => [u.id, u]));
  const media = value.mediaIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((upload, index) => ({
      id: upload.id,
      file: upload.file,
      url: upload.url,
      width: upload.width,
      height: upload.height,
      bytes: upload.bytes,
      alt: `${value.vehicle.year} ${value.vehicle.brand} ${value.vehicle.model}${
        index === 0 ? " — main photo" : ` — photo ${index + 1}`
      }`.trim(),
      position: index,
    }));

  const id = newListingId();
  const now = new Date().toISOString();
  const record = {
    id,
    publicId: `v${randomId(10)}`,
    slug: "",
    status: STATUS.pending,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
    reviewedAt: null,
    reviewedBy: null,
    publishedAt: null,
    vehicle: value.vehicle,
    pricing: value.pricing,
    location: value.location,
    seller: value.seller,
    media,
    moderation: { reason: null, note: null },
    views: 0,
    contactClicks: {},
    source: {
      locale: cleanText(meta.locale, 12) || "en",
      referer: cleanText(meta.referer, 200) || null,
    },
  };
  record.slug = listingSlug(record);
  return record;
}

// ------------------------------------------------------------
// Public queries (approved listings only — enforced here, once)
// ------------------------------------------------------------
const norm = (value) => cleanText(value, 80).toLowerCase();

export function applyFilters(listings, query) {
  const brand = query.brand ? norm(query.brand) : null;
  const model = query.model ? norm(query.model) : null;
  const condition = query.condition ? norm(query.condition) : null;
  const country = query.country ? norm(query.country) : null;
  const city = query.city ? norm(query.city) : null;
  const sellerType = query.sellerType ? norm(query.sellerType) : null;
  const body = query.body ? norm(query.body) : null;
  const fuel = query.fuel ? norm(query.fuel) : null;
  const transmission = query.transmission ? norm(query.transmission) : null;
  const minPrice = query.priceMin !== undefined ? Number(query.priceMin) : null;
  const maxPrice = query.priceMax !== undefined ? Number(query.priceMax) : null;
  const search = query.q ? norm(query.q) : null;

  return listings.filter((listing) => {
    if (brand && norm(listing.vehicle?.brand).replace(/\s+/g, "-") !== brand.replace(/\s+/g, "-")) return false;
    if (model && !norm(listing.vehicle?.model).includes(model)) return false;
    if (condition && listing.vehicle?.condition !== condition) return false;
    if (country && norm(listing.location?.country).replace(/\s+/g, "-") !== country.replace(/\s+/g, "-")) return false;
    if (city && !norm(listing.location?.city).includes(city)) return false;
    if (sellerType && listing.seller?.type !== sellerType) return false;
    if (body && norm(listing.vehicle?.bodyType) !== body) return false;
    if (fuel && norm(listing.vehicle?.fuel) !== fuel) return false;
    if (transmission && norm(listing.vehicle?.transmission) !== transmission) return false;
    if (Number.isFinite(minPrice) && (listing.pricing?.price ?? 0) < minPrice) return false;
    if (Number.isFinite(maxPrice) && (listing.pricing?.price ?? 0) > maxPrice) return false;
    if (search) {
      const haystack = [
        listing.vehicle?.brand,
        listing.vehicle?.model,
        listing.vehicle?.bodyType,
        listing.vehicle?.color,
        listing.location?.city,
        listing.location?.country,
        listing.pricing?.currency,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function sortListings(listings, sort) {
  const by = sort === "price-asc" ? "asc" : sort === "price-desc" ? "desc" : null;
  const copy = [...listings];
  if (by) {
    copy.sort((a, b) => {
      const delta = (a.pricing?.price ?? 0) - (b.pricing?.price ?? 0);
      return by === "asc" ? delta : -delta;
    });
    return copy;
  }
  copy.sort((a, b) =>
    String(b.publishedAt ?? b.createdAt).localeCompare(String(a.publishedAt ?? a.createdAt))
  );
  return copy;
}

export function paginate(items, page, pageSize) {
  const size = Math.max(1, Math.min(Number(pageSize) || 12, 24));
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), total, page: current, pages, pageSize: size };
}

/** Filter options with real counts (approved listings only). */
export function buildFacets(listings) {
  const count = (getter) => {
    const map = new Map();
    for (const listing of listings) {
      const value = getter(listing);
      if (!value) continue;
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([value, total]) => ({ value, total }))
      .sort((a, b) => b.total - a.total || String(a.value).localeCompare(String(b.value)));
  };
  return {
    brands: count((l) => l.vehicle?.brand),
    countries: count((l) => l.location?.country),
    cities: count((l) => l.location?.city),
    conditions: count((l) => l.vehicle?.condition),
    sellerTypes: count((l) => l.seller?.type),
    total: listings.length,
  };
}
