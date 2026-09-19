// ============================================================
// CARVIBES / MARKETVIBES — shared marketplace types
//
// These mirror the server's public projections
// (server/marketplace/public-view.mjs). The server is the source of
// truth: nothing here is trusted for authorization, only for rendering.
// ============================================================

export type ListingStatus = "pending" | "approved" | "rejected";
export type VehicleCondition = "new" | "used";
export type SellerType = "individual" | "professional" | "dealer";
export type ContactMethod = "whatsapp" | "phone" | "instagram" | "other";
export type SortId = "newest" | "price-asc" | "price-desc";
export type FacetKind = "brand" | "country" | "condition";

export interface ListingMedia {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface ListingCard {
  id: string;
  publicId: string;
  slug: string;
  path: string;
  title: string;
  brand: string;
  model: string;
  year: number | null;
  condition: VehicleCondition;
  conditionLabel: string;
  bodyType: string;
  fuel: string;
  fuelLabel: string;
  transmission: string;
  transmissionLabel: string;
  mileage: number | null;
  mileageLabel: string | null;
  color: string;
  price: number;
  currency: string;
  priceLabel: string;
  negotiable: boolean;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  sellerType: SellerType;
  sellerTypeLabel: string;
  companyName: string;
  contactChannel: ContactMethod;
  contactValue: string;
  photoCount: number;
  thumb: ListingMedia | null;
  publishedAt: string;
}

export interface ListingContact {
  channel: ContactMethod;
  label: string;
  cta: string;
  href: string;
  safeValueLabel: string | null;
}

export interface ListingSpec {
  key: string;
  label: string;
  value: string;
}

export interface ListingSeo {
  title: string;
  description: string;
  canonicalPath: string;
  canonical: string;
  image: string;
  absoluteImage: string;
  jsonLd: unknown[];
  breadcrumbs: { name: string; path: string }[];
}

export interface ListingDetail extends ListingCard {
  description: string;
  media: ListingMedia[];
  contact: ListingContact;
  seller: { type: SellerType; typeLabel: string; companyName: string; memberSince: string };
  specs: ListingSpec[];
  seo: ListingSeo;
  similar: ListingCard[];
  moreFromRegion: ListingCard[];
  moreFromBrand: ListingCard[];
}

/** An indexable, path-based facet page (computed server-side). */
export interface FacetPage {
  kind: FacetKind;
  value: string;
  slug: string;
  count: number;
  path: string;
  title: string;
  description: string;
}

export interface FacetPagesResponse {
  pages: FacetPage[];
  total: number;
  minListings: number;
}

export interface FacetValue {
  value: string;
  total: number;
}

export interface Facets {
  brands: FacetValue[];
  countries: FacetValue[];
  cities: FacetValue[];
  conditions: FacetValue[];
  sellerTypes: FacetValue[];
  total: number;
}

export interface ListResponse {
  items: ListingCard[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  facets: Facets;
}

export interface ListingFilters {
  brand?: string;
  model?: string;
  body?: string;
  fuel?: string;
  transmission?: string;
  condition?: VehicleCondition | "";
  country?: string;
  city?: string;
  sellerType?: SellerType | "";
  priceMin?: number | null;
  priceMax?: number | null;
  q?: string;
  sort?: SortId;
  page?: number;
}

export interface MarketplaceConfig {
  google: { clientId: string | null };
  admin: { passcodeLogin: boolean; adminCount: number; devMode: boolean };
  captcha: { provider: string | null };
  limits: { maxPhotos: number; maxPhotoBytes: number };
  features: { similarCars: boolean; bulkReview: boolean; contactProxy: boolean };
}

export interface AdminSession {
  authenticated: boolean;
  email: string | null;
  method: string | null;
  config: { googleClientId: string | null; passcodeLogin: boolean; devMode: boolean };
}

export interface AdminListing extends Omit<ListingCard, "publishedAt"> {
  /** Null while a listing is pending or rejected — it has no publish date. */
  publishedAt: string | null;
  status: ListingStatus;
  submittedAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  views: number;
  contactClicks: Record<string, number>;
  moderation: { reason: string | null; note: string | null };
  listingUrl: string | null;
}

export interface AdminListResponse {
  items: AdminListing[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  counts: { pending: number; approved: number; rejected: number; all: number };
  clicks: { total: number } & Record<string, number>;
  /** Real view counters: total plus a breakdown by listing status. */
  views: { total: number; pending: number; approved: number; rejected: number };
}

export interface AdminDetail extends AdminListing {
  description: string;
  /** Every uploaded photo, in seller order — the review gallery. */
  media: { url: string; alt: string; width: number | null; height: number | null }[];
  contact: { method: ContactMethod; value: string; link: string };
  audit: { submittedAt: string; reviewedAt: string | null; reviewedBy: string | null; note: string; reason: string };
  source: { locale: string; referer: string | null } | null;
}

/** A photo the seller picked, still in the browser. */
export interface LocalPhoto {
  id: string;
  name: string;
  previewUrl: string;
  width: number;
  height: number;
  bytes: number;
  /** Set once the optimized blob has been uploaded to the API. */
  uploadedId?: string;
  status: "pending" | "optimizing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}
