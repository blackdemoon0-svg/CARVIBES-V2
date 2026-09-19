// ============================================================
// CARVIBES / MARKETVIBES — API client
//
// Talks to the marketplace API. In the preview / dev server the API is
// mounted on the same origin (/api/marketplace); a deployed site can
// point at a separate host with VITE_MARKETPLACE_API_URL.
//
// Every call is typed, abortable and never throws on a 4xx: errors come
// back as a typed result the UI can translate.
// ============================================================

import type {
  AdminDetail,
  AdminListing,
  FacetPagesResponse,
  AdminListResponse,
  AdminSession,
  ListingDetail,
  ListResponse,
  ListingFilters,
  ListingStatus,
  MarketplaceConfig,
} from "./types";

declare global {
  interface ImportMetaEnv {
    readonly VITE_MARKETPLACE_API_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const API_BASE = (import.meta.env?.VITE_MARKETPLACE_API_URL ?? "/api/marketplace").replace(/\/$/, "");

/** True when the marketplace API is deliberately hosted on another origin. */
const CROSS_ORIGIN = /^https?:\/\//.test(API_BASE);

/**
 * Server-relative links (the contact redirect) must go to the API host
 * when the API is cross-origin — same-origin deployments get the plain
 * path they already ship with.
 */
function externalise<T extends { contact?: { href?: string } }>(data: T): T {
  const href = data?.contact?.href;
  if (!CROSS_ORIGIN || !href) return data;
  return { ...data, contact: { ...data.contact, href: API_BASE + href.replace(/^\/api\/marketplace/, "") } };
}

export interface ApiError {
  error: string;
  status: number;
  fields?: Record<string, string>;
  message?: string;
  retryAfter?: number;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

function isError(value: unknown): value is ApiError {
  return Boolean(value && typeof value === "object" && "error" in value);
}

function request<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  return send<T>(path, init);
}

async function send<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      // Admin sessions ride on an HttpOnly cookie: same-origin by default,
      // and "include" only when the API is deliberately hosted on another
      // origin (VITE_MARKETPLACE_API_URL + MARKETPLACE_CORS_ORIGINS).
      credentials: CROSS_ORIGIN ? "include" : "same-origin",
      ...init,
      headers: {
        ...(init.body && !(init.body instanceof FormData) ? { "content-type": "application/json" } : {}),
        ...init.headers,
      },
    });
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;
    if (!response.ok) {
      const error: ApiError = isError(payload)
        ? { ...(payload as ApiError), status: response.status }
        : { error: "request_failed", status: response.status };
      return { ok: false, error };
    }
    return { ok: true, data: payload as T };
  } catch (error) {
    return {
      ok: false,
      error: { error: "network_error", status: 0, message: String((error as Error)?.message ?? error) },
    };
  }
}

// ------------------------------------------------------------
// Public
// ------------------------------------------------------------
export function fetchConfig(signal?: AbortSignal) {
  return request<MarketplaceConfig>("/config", { signal });
}

export function fetchListings(filters: ListingFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return request<ListResponse>(`/listings${query ? `?${query}` : ""}`, { signal });
}

export function fetchFacets(signal?: AbortSignal) {
  return request<FacetPagesResponse>("/facets", { signal });
}

export async function fetchListing(slug: string, signal?: AbortSignal) {
  const result = await request<ListingDetail>(`/listings/${encodeURIComponent(slug)}`, { signal });
  return result.ok ? { ok: true as const, data: externalise(result.data) } : result;
}

export interface SubmitPayload {
  locale: string;
  formOpenedAt: number;
  website?: string;
  captchaToken?: string;
  vehicle: {
    brand: string;
    model: string;
    year: number | null;
    condition: string;
    bodyType?: string;
    fuel?: string;
    transmission?: string;
    mileage: number | null;
    color?: string;
    description?: string;
  };
  pricing: { price: number | null; currency: string; negotiable: boolean };
  location: { countryCode: string; city: string; region?: string };
  seller: {
    type: string;
    companyName?: string;
    contactMethod: string;
    contactValue: string;
  };
  mediaIds: string[];
}

export function submitListing(payload: SubmitPayload) {
  return request<{ ok: true; status: ListingStatus; publicId: string; reference: string }>("/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Upload one optimized photo with real progress. Uses XHR (fetch has no
 * upload progress events) but keeps the same error shape as `request`.
 */
export function uploadPhoto(
  blob: Blob,
  filename: string,
  { onProgress, signal }: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {}
): Promise<Result<{ files: { id: string; url: string; width: number; height: number }[] }>> {
  return new Promise((resolve) => {
    const form = new FormData();
    form.append("photo", blob, filename);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/uploads`, true);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, data: payload });
        else resolve({ ok: false, error: { ...payload, status: xhr.status } });
      } catch {
        resolve({ ok: false, error: { error: "upload_failed", status: xhr.status } });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: { error: "network_error", status: 0 } });
    xhr.onabort = () => resolve({ ok: false, error: { error: "aborted", status: 0 } });
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}

// ------------------------------------------------------------
// Admin
// ------------------------------------------------------------
export function adminSession(signal?: AbortSignal) {
  return request<AdminSession>("/admin/session", { signal });
}

export function adminLoginGoogle(credential: string) {
  return request<{ ok: true; email: string }>("/admin/login/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function adminLoginPasscode(email: string, passcode: string) {
  return request<{ ok: true; email: string }>("/admin/login/passcode", {
    method: "POST",
    body: JSON.stringify({ email, passcode }),
  });
}

export function adminLogout() {
  return request<{ ok: true }>("/admin/logout", { method: "POST" });
}

export function adminListings(
  params: { status?: ListingStatus | "all"; q?: string; page?: number },
  signal?: AbortSignal
) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return request<AdminListResponse>(`/admin/listings${query ? `?${query}` : ""}`, { signal });
}

export function adminListing(id: string, signal?: AbortSignal) {
  return request<AdminDetail>(`/admin/listings/${encodeURIComponent(id)}`, { signal });
}

export function adminReview(
  id: string,
  action: "approve" | "reject",
  extra: { reason?: string; note?: string } = {}
) {
  return request<{ ok: true; listing: AdminListing }>(`/admin/listings/${encodeURIComponent(id)}/review`, {
    method: "POST",
    body: JSON.stringify({ action, ...extra }),
  });
}

export function adminBulk(ids: string[], action: "approve" | "reject", extra: { reason?: string; note?: string } = {}) {
  return request<{ ok: true; updated: number }>("/admin/listings/bulk", {
    method: "POST",
    body: JSON.stringify({ ids, action, ...extra }),
  });
}
