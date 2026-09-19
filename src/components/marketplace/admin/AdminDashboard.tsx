// ============================================================
// CARVIBES / MARKETVIBES — private moderation dashboard
//
// Pending / approved / rejected queues, search, bulk approve + reject,
// per-listing review with a reason and an internal note. Every action
// goes to the API, which re-checks the session AND the allowlist — the
// UI hiding a button is never the protection.
//
// Nothing is published automatically: a submission stays PENDING until
// an administrator explicitly approves it here.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { t, type Lang } from "../../../lib/i18n";
import { adminBulk, adminListings, adminLogout, adminReview } from "../../../lib/marketplace/api";
import { trackMarketplace } from "../../../lib/marketplace/analytics";
import { formatDate, formatNumber, formatPrice } from "../../../lib/marketplace/format";
import type { AdminDetail, AdminListResponse, AdminListing, ListingStatus } from "../../../lib/marketplace/types";
import { adminListing } from "../../../lib/marketplace/api";
import ListingImage from "../ListingImage";
import { CloseIcon, ShieldIcon } from "../../icons";

const REJECT_REASONS = ["incomplete", "price_unrealistic", "duplicate", "contact_invalid", "suspicious", "other"];
const TABS: (ListingStatus | "all")[] = ["pending", "approved", "rejected", "all"];

export default function AdminDashboard({
  lang,
  email,
  onSignedOut,
}: {
  lang: Lang;
  email: string | null;
  onSignedOut: () => void;
}) {
  const [status, setStatus] = useState<ListingStatus | "all">("pending");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AdminListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<AdminDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirm, setConfirm] = useState<
    | { kind: "single"; id: string; action: "approve" | "reject" }
    | { kind: "bulk"; action: "approve" | "reject" }
    | null
  >(null);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      void adminListings({ status, q: query }, signal).then((result) => {
        if (result.ok) {
          setData(result.data);
          setError(null);
        } else if (result.error.status === 401 || result.error.status === 403) {
          onSignedOut();
        } else {
          setError(result.error.error);
        }
        setLoading(false);
      });
    },
    [onSignedOut, query, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Debounced search
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const openDetail = useCallback((id: string) => {
    setDetailLoading(true);
    void adminListing(id).then((result) => {
      if (result.ok) setDetail(result.data);
      setDetailLoading(false);
    });
  }, []);

  const runSingle = useCallback(
    async (id: string, action: "approve" | "reject") => {
      setBusy(true);
      const result = await adminReview(id, action, action === "reject" ? { reason, note } : { note });
      setBusy(false);
      setConfirm(null);
      if (result.ok) {
        trackMarketplace("admin_review", { action });
        setDetail((current) => (current && current.id === id ? ({ ...current, ...result.data.listing } as AdminDetail) : current));
        load();
      } else if (result.error.status === 401 || result.error.status === 403) {
        onSignedOut();
      }
    },
    [load, note, onSignedOut, reason]
  );

  const runBulk = useCallback(
    async (action: "approve" | "reject") => {
      setBusy(true);
      const result = await adminBulk(selected, action, action === "reject" ? { reason, note } : { note });
      setBusy(false);
      setConfirm(null);
      if (result.ok) {
        trackMarketplace("admin_bulk_review", { action, count: selected.length });
        setSelected([]);
        load();
      } else if (result.error.status === 401 || result.error.status === 403) {
        onSignedOut();
      }
    },
    [load, note, onSignedOut, reason, selected]
  );

  const counts = data?.counts ?? { pending: 0, approved: 0, rejected: 0, all: 0 };
  const items = data?.items ?? [];
  const allSelected = items.length > 0 && items.every((item) => selected.includes(item.publicId));

  const tabLabel = useMemo(
    () => ({
      pending: t(lang, "mk_admin_tab_pending"),
      approved: t(lang, "mk_admin_tab_approved"),
      rejected: t(lang, "mk_admin_tab_rejected"),
      all: t(lang, "mk_admin_tab_all"),
    }),
    [lang]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 sm:pt-28">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.3em] text-accent">
            <ShieldIcon className="h-4 w-4" />
            {t(lang, "mk_admin_eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">{t(lang, "mk_admin_title")}</h1>
          <p className="mt-1 text-[12px] text-fog">
            {t(lang, "mk_admin_signed_in_as")} <span className="text-mist">{email}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/marketplace" className="cv-btn cv-btn-sm cv-btn-subtle inline-flex h-10 items-center px-4 text-[11px] font-semibold tracking-[0.16em]">
            {t(lang, "mk_admin_view_public")}
          </Link>
          <button
            type="button"
            onClick={() => {
              void adminLogout().then(() => onSignedOut());
            }}
            className="cv-btn cv-btn-sm cv-btn-ghost inline-flex h-10 items-center px-4 text-[11px] font-semibold tracking-[0.16em]"
          >
            {t(lang, "mk_admin_sign_out")}
          </button>
        </div>
      </div>

      {/* Overview — every figure is counted by the API, so a brand-new
          marketplace reads 0 / 0 / 0 / 0 / 0 instead of inventing traffic. */}
      <section className="mt-6" aria-label={t(lang, "mk_admin_overview")}>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ["total", counts.all, "mk_admin_stat_total", "text-white"],
              ["pending", counts.pending, "mk_admin_tab_pending", "text-amber-200"],
              ["approved", counts.approved, "mk_admin_tab_approved", "text-emerald-200"],
              ["rejected", counts.rejected, "mk_admin_tab_rejected", "text-accent-soft"],
              ["views", data?.views?.total ?? 0, "mk_admin_stat_views", "text-mist"],
            ] as [string, number, string, string][]
          ).map(([key, value, labelKey, tone]) => (
            <div key={key} className="edge-light border border-line bg-charcoal px-4 py-3.5">
              <dt className="text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, labelKey).toUpperCase()}</dt>
              <dd className={cn("mt-1 font-display text-2xl font-bold", tone)}>{formatNumber(value, lang)}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-[11px] text-fog">
          {t(lang, "mk_admin_clicks", {
            total: formatNumber(data?.clicks?.total ?? 0, lang),
            whatsapp: formatNumber(data?.clicks?.whatsapp ?? 0, lang),
            phone: formatNumber(data?.clicks?.phone ?? 0, lang),
            instagram: formatNumber(data?.clicks?.instagram ?? 0, lang),
          })}
          {data?.views?.approved ? (
            <>
              {" · "}
              {t(lang, "mk_admin_views_published", { count: formatNumber(data.views.approved, lang) })}
            </>
          ) : null}
        </p>
      </section>

      {/* Tabs + search */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t(lang, "mk_admin_status")}>
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={status === tab}
              type="button"
              onClick={() => {
                setStatus(tab);
                setSelected([]);
              }}
              className={cn(
                "cv-btn cv-btn-sm h-10 border px-4 text-[11px] font-semibold tracking-[0.16em]",
                status === tab ? "border-accent bg-accent/15 text-white" : "border-line bg-ink/50 text-mist hover:text-white"
              )}
            >
              {tabLabel[tab]}
              {tab === "pending" && counts.pending > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>
        <label className="flex h-11 w-full items-center border border-line bg-ink px-3 lg:max-w-sm">
          <span className="sr-only">{t(lang, "mk_admin_search")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t(lang, "mk_admin_search_placeholder")}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-fog focus:outline-none"
          />
        </label>
      </div>

      {/* Table */}
      <div className="mt-5">
        {loading && !data ? (
          <p className="border border-line bg-charcoal px-5 py-10 text-center text-[12px] text-fog" role="status">
            {t(lang, "mk_admin_loading")}
          </p>
        ) : error ? (
          <p className="border border-accent/40 bg-accent/[0.06] px-5 py-10 text-center text-[12px] text-white" role="alert">
            ⚠ {t(lang, "mk_admin_error")}
          </p>
        ) : items.length === 0 ? (
          <p className="border border-line bg-charcoal px-5 py-12 text-center text-[12px] text-fog">
            {status === "pending" ? t(lang, "mk_admin_empty_pending") : t(lang, "mk_admin_empty")}
          </p>
        ) : (
          <div className="overflow-hidden border border-line bg-charcoal">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <label className="flex items-center gap-2 text-[11px] text-mist">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => setSelected(event.target.checked ? items.map((item) => item.publicId) : [])}
                  className="h-4 w-4 accent-[#e3262e]"
                />
                {t(lang, "mk_admin_select_all")}
              </label>
              <span className="ml-auto text-[11px] text-fog">
                {t(lang, "mk_results_count", { count: formatNumber(data?.total ?? 0, lang) })}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <AdminRow
                  key={item.id}
                  listing={item}
                  lang={lang}
                  selected={selected.includes(item.publicId)}
                  onSelect={(checked) =>
                    setSelected((current) =>
                      checked ? [...current, item.publicId] : current.filter((id) => id !== item.publicId)
                    )
                  }
                  onOpen={() => openDetail(item.id)}
                  onQuick={(action) => setConfirm({ kind: "single", id: item.id, action })}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="safe-bottom fixed inset-x-0 z-40 mx-auto flex max-w-4xl flex-wrap items-center gap-3 border border-line bg-charcoal/95 px-4 py-3 backdrop-blur">
          <span className="text-[12px] text-mist">{t(lang, "mk_admin_selected", { count: formatNumber(selected.length, lang) })}</span>
          <button
            type="button"
            onClick={() => setConfirm({ kind: "bulk", action: "approve" })}
            className="cv-btn cv-btn-sm cv-btn-primary h-10 px-5 text-[11px] font-semibold tracking-[0.16em]"
          >
            {t(lang, "mk_admin_approve_selected")}
          </button>
          <button
            type="button"
            onClick={() => setConfirm({ kind: "bulk", action: "reject" })}
            className="cv-btn cv-btn-sm cv-btn-outline h-10 px-5 text-[11px] font-semibold tracking-[0.16em]"
          >
            {t(lang, "mk_admin_reject_selected")}
          </button>
          <button type="button" onClick={() => setSelected([])} className="ml-auto text-[11px] text-mist underline underline-offset-4 hover:text-white">
            {t(lang, "mk_admin_clear_selection")}
          </button>
        </div>
      )}

      {/* Review drawer */}
      {(detail || detailLoading) && (
        <ReviewDrawer
          lang={lang}
          listing={detail}
          loading={detailLoading}
          onClose={() => setDetail(null)}
          onAction={(action) => detail && setConfirm({ kind: "single", id: detail.id, action })}
        />
      )}

      {/* Confirmation */}
      {confirm && (
        <ConfirmDialog
          lang={lang}
          action={confirm.action}
          bulk={confirm.kind === "bulk"}
          count={confirm.kind === "bulk" ? selected.length : 1}
          reason={reason}
          setReason={setReason}
          note={note}
          setNote={setNote}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.kind === "bulk") void runBulk(confirm.action);
            else void runSingle(confirm.id, confirm.action);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status, lang }: { status: ListingStatus; lang: Lang }) {
  const tone =
    status === "approved"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      : status === "rejected"
        ? "border-accent/50 bg-accent/10 text-accent-soft"
        : "border-amber-400/40 bg-amber-400/10 text-amber-200";
  return (
    <span className={cn("border px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em]", tone)}>
      {t(lang, `mk_status_${status}`)}
    </span>
  );
}

function AdminRow({
  listing,
  lang,
  selected,
  onSelect,
  onOpen,
  onQuick,
}: {
  listing: AdminListing;
  lang: Lang;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onOpen: () => void;
  onQuick: (action: "approve" | "reject") => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-4 px-4 py-4 transition-colors hover:bg-graphite/40">
      <input
        type="checkbox"
        checked={selected}
        onChange={(event) => onSelect(event.target.checked)}
        aria-label={`${t(lang, "mk_admin_select")} ${listing.title}`}
        className="h-4 w-4 shrink-0 accent-[#e3262e]"
      />
      <span className="relative block h-14 w-20 shrink-0 overflow-hidden border border-line bg-graphite">
        {listing.thumb ? (
          <ListingImage src={listing.thumb.url} alt={listing.thumb.alt || listing.title} cropW={200} cropH={140} sizes="80px" />
        ) : null}
      </span>
      <span className="min-w-[12rem] flex-1">
        <span className="block truncate font-display text-[14px] font-semibold text-white">
          {listing.year ? `${listing.year} ` : ""}
          {listing.brand} {listing.model}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-fog">
          {listing.city}, {listing.country} · {t(lang, `mk_seller_${listing.sellerType}`)}
          {listing.mileageLabel ? ` · ${listing.mileageLabel}` : ""}
        </span>
        {/* The date that matters depends on the queue: sellers care when a
            submission arrived, published listings when they went live. */}
        <span className="mt-0.5 block truncate text-[11px] text-fog">
          {listing.status === "approved" && listing.publishedAt
            ? t(lang, "mk_admin_published_on", { date: formatDate(listing.publishedAt, lang) })
            : t(lang, "mk_admin_submitted_on", { date: formatDate(listing.submittedAt, lang) })}
          {listing.status === "approved" ? ` · ${t(lang, "mk_admin_views", { count: formatNumber(listing.views ?? 0, lang) })}` : ""}
        </span>
        {/* Administrative contact is deliberately visible here: a moderator
            has to be able to reach the seller about the submission. */}
        <span className="mt-0.5 block truncate text-[11px] text-mist">
          {t(lang, `mk_contact_${listing.contactChannel}`)} · {listing.contactValue}
        </span>
        {listing.status === "rejected" && listing.moderation.reason ? (
          <span className="mt-1 block truncate text-[11px] text-accent-soft">
            {t(lang, "mk_admin_reason")}: {t(lang, `mk_reason_${listing.moderation.reason}`)}
            {listing.moderation.note ? ` — ${listing.moderation.note}` : ""}
          </span>
        ) : null}
      </span>
      <span className="text-right">
        <span className="block font-display text-[14px] font-bold text-white">{formatPrice(listing.price, listing.currency, lang)}</span>
        <StatusBadge status={listing.status} lang={lang} />
      </span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="cv-btn cv-btn-sm cv-btn-subtle h-9 px-3 text-[10px] font-semibold tracking-[0.14em]"
        >
          {t(lang, "mk_admin_open")}
        </button>
        {listing.status !== "approved" && (
          <button
            type="button"
            onClick={() => onQuick("approve")}
            className="cv-btn cv-btn-sm cv-btn-primary h-9 px-3 text-[10px] font-semibold tracking-[0.14em]"
          >
            {t(lang, "mk_admin_approve")}
          </button>
        )}
        {listing.status !== "rejected" && (
          <button
            type="button"
            onClick={() => onQuick("reject")}
            className="cv-btn cv-btn-sm cv-btn-outline h-9 px-3 text-[10px] font-semibold tracking-[0.14em]"
          >
            {t(lang, "mk_admin_reject")}
          </button>
        )}
      </span>
    </li>
  );
}

function ReviewDrawer({
  lang,
  listing,
  loading,
  onClose,
  onAction,
}: {
  lang: Lang;
  listing: AdminDetail | null;
  loading: boolean;
  onClose: () => void;
  onAction: (action: "approve" | "reject") => void;
}) {
  const [zoom, setZoom] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") (zoom ? setZoom(null) : onClose());
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, zoom]);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={t(lang, "mk_admin_review_title")}>
      <button type="button" aria-label={t(lang, "mk_close")} onClick={onClose} className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-y-auto border-s border-line bg-charcoal">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-charcoal/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.24em] text-fog">{t(lang, "mk_admin_review_title").toUpperCase()}</p>
            {listing && <h2 className="mt-1 font-display text-lg font-semibold text-white">{listing.title}</h2>}
          </div>
          <button type="button" onClick={onClose} aria-label={t(lang, "mk_close")} className="flex h-9 w-9 items-center justify-center border border-line text-mist hover:text-white">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {loading || !listing ? (
          <p className="px-5 py-10 text-[12px] text-fog">{t(lang, "mk_admin_loading")}</p>
        ) : (
          <div className="flex-1 px-5 py-5">
            <div className="flex items-center gap-3">
              <StatusBadge status={listing.status} lang={lang} />
              <span className="text-[11px] text-fog">{formatDate(listing.submittedAt, lang)}</span>
              {listing.views > 0 && <span className="text-[11px] text-fog">{t(lang, "mk_admin_views", { count: listing.views })}</span>}
            </div>

            <ul className="mt-4 grid grid-cols-3 gap-2">
              {listing.photoCount === 0 && <li className="text-[12px] text-accent-soft">{t(lang, "mk_admin_no_photos")}</li>}
              {(listing.media.length
                ? listing.media
                : listing.thumb
                  ? [{ url: listing.thumb.url, alt: listing.thumb.alt, width: null, height: null }]
                  : []
              ).map((photo, index) => (
                <li key={`${photo.url}-${index}`} className="relative aspect-[4/3] overflow-hidden border border-line">
                  <button type="button" onClick={() => setZoom(photo.url)} className="block h-full w-full">
                    <ListingImage src={photo.url} alt={photo.alt || listing.title} cropW={480} cropH={360} sizes="200px" />
                  </button>
                </li>
              ))}
            </ul>

            <dl className="mt-5 grid grid-cols-2 gap-4 border border-line bg-ink/40 p-4 text-[12px] sm:grid-cols-3">
              <Row label={t(lang, "mk_field_price")} value={formatPrice(listing.price, listing.currency, lang)} />
              <Row label={t(lang, "mk_field_condition")} value={t(lang, `mk_condition_${listing.condition}`)} />
              <Row label={t(lang, "mk_field_year")} value={String(listing.year ?? "—")} />
              <Row label={t(lang, "mk_field_mileage")} value={listing.mileageLabel ?? "—"} />
              <Row label={t(lang, "mk_field_body")} value={listing.bodyType || "—"} />
              <Row label={t(lang, "mk_field_fuel")} value={listing.fuel ? t(lang, `mk_fuel_${listing.fuel}`) : "—"} />
              <Row label={t(lang, "mk_field_transmission")} value={listing.transmission ? t(lang, `mk_transmission_${listing.transmission}`) : "—"} />
              <Row label={t(lang, "mk_field_color")} value={listing.color || "—"} />
              <Row label={t(lang, "mk_field_city")} value={`${listing.city}, ${listing.country}`} />
              <Row label={t(lang, "mk_field_seller_type")} value={t(lang, `mk_seller_${listing.sellerType}`)} />
              <Row label={t(lang, "mk_field_company")} value={listing.companyName || "—"} />
              {/* The moderator has to be able to reach the seller, so the
                  real number/handle is shown here, not just the channel. */}
              <Row
                label={t(lang, "mk_admin_seller_contact")}
                value={`${t(lang, `mk_contact_${listing.contact.method}`)}${listing.contact.value ? ` · ${listing.contact.value}` : ""}`}
              />
            </dl>

            <div className="mt-5">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_admin_contact").toUpperCase()}</p>
              <a
                href={listing.contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block break-all text-[13px] text-accent-soft underline decoration-line underline-offset-4"
              >
                {listing.contact.value}
              </a>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_admin_description").toUpperCase()}</p>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-mist">
                {listing.description || t(lang, "mk_description_empty")}
              </p>
            </div>

            {listing.moderation.reason && (
              <p className="mt-5 border border-accent/40 bg-accent/[0.06] px-4 py-3 text-[12px] text-white">
                {t(lang, "mk_admin_reason")}: {t(lang, `mk_reason_${listing.moderation.reason}`)}
                {listing.moderation.note ? ` — ${listing.moderation.note}` : ""}
              </p>
            )}

            <div className="sticky bottom-0 mt-6 flex flex-wrap gap-3 border-t border-line bg-charcoal pt-4">
              <button
                type="button"
                onClick={() => onAction("approve")}
                className="cv-btn cv-btn-primary h-12 flex-1 text-[11px] font-semibold tracking-[0.16em]"
              >
                {t(lang, "mk_admin_approve_publish")}
              </button>
              <button
                type="button"
                onClick={() => onAction("reject")}
                className="cv-btn cv-btn-outline h-12 flex-1 text-[11px] font-semibold tracking-[0.16em]"
              >
                {t(lang, "mk_admin_reject")}
              </button>
              {listing.listingUrl && (
                <Link
                  to={listing.listingUrl}
                  className="cv-btn cv-btn-sm cv-btn-subtle inline-flex h-12 items-center px-4 text-[11px] font-semibold tracking-[0.14em]"
                >
                  {t(lang, "mk_admin_view_public")}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {zoom && (
        <button type="button" onClick={() => setZoom(null)} className="absolute inset-0 z-20 flex items-center justify-center bg-ink/95 p-6" aria-label={t(lang, "mk_close")}>
          <img src={zoom} alt="" className="max-h-full max-w-full object-contain" />
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-[0.16em] text-fog">{label.toUpperCase()}</dt>
      <dd className="mt-1 text-white">{value}</dd>
    </div>
  );
}

function ConfirmDialog({
  lang,
  action,
  bulk,
  count,
  reason,
  setReason,
  note,
  setNote,
  busy,
  onCancel,
  onConfirm,
}: {
  lang: Lang;
  action: "approve" | "reject";
  bulk: boolean;
  count: number;
  reason: string;
  setReason: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t(lang, "mk_admin_confirm_title")}>
      <button type="button" aria-label={t(lang, "mk_close")} onClick={onCancel} className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />
      <div className="relative w-full max-w-md border border-line bg-charcoal p-6">
        <h2 className="font-display text-lg font-semibold text-white">{t(lang, "mk_admin_confirm_title")}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-mist">
          {bulk
            ? t(lang, action === "approve" ? "mk_admin_confirm_bulk_approve" : "mk_admin_confirm_bulk_reject", { count })
            : t(lang, action === "approve" ? "mk_admin_confirm_approve" : "mk_admin_confirm_reject")}
        </p>

        {action === "reject" && (
          <>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_admin_reason").toUpperCase()}</span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="h-11 w-full border border-line bg-ink px-3 text-[13px] text-white focus:outline-none"
              >
                {REJECT_REASONS.map((option) => (
                  <option key={option} value={option}>
                    {t(lang, `mk_reason_${option}`)}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-[11px] leading-relaxed text-fog">{t(lang, "mk_admin_reject_note")}</p>
          </>
        )}

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_admin_note").toUpperCase()}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 1000))}
            rows={3}
            placeholder={t(lang, "mk_admin_note_placeholder")}
            className="w-full border border-line bg-ink px-3 py-2 text-[13px] text-white placeholder:text-fog focus:border-white/40 focus:outline-none"
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={cn(
              "cv-btn h-11 flex-1 text-[11px] font-semibold tracking-[0.16em] disabled:opacity-60",
              action === "approve" ? "cv-btn-primary" : "cv-btn-outline"
            )}
          >
            {busy ? t(lang, "mk_admin_working") : action === "approve" ? t(lang, "mk_admin_approve") : t(lang, "mk_admin_reject")}
          </button>
          <button type="button" onClick={onCancel} className="cv-btn cv-btn-subtle h-11 flex-1 text-[11px] font-semibold tracking-[0.16em]">
            {t(lang, "mk_cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
