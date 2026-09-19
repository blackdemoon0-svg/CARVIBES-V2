// ============================================================
// CARVIBES / MARKETVIBES — filters (desktop panel + mobile drawer)
//
// Desktop: a dense, always-visible control grid above the results.
// Mobile: the same controls inside a clean bottom-sheet drawer that
// never takes over the whole screen (max 88svh, scrollable, closable by
// backdrop, Close button or Escape).
//
// The controls are a DRAFT until "Apply" is pressed: one navigation per
// decision instead of one per keystroke.
// ============================================================

import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { useBodyScrollLock, useEscapeToClose } from "../../lib/useOverlay";
import { BODY_TYPES, CONDITIONS, COUNTRIES, FUELS, MAKES, SELLER_TYPES, SORTS, TRANSMISSIONS } from "../../lib/marketplace/taxonomy";
import { formatNumber } from "../../lib/marketplace/format";
import type { Facets, ListingFilters, SellerType, SortId, VehicleCondition } from "../../lib/marketplace/types";
import { ChevronDown, SearchIcon } from "../icons";

export interface FilterProps {
  lang: Lang;
  filters: ListingFilters;
  facets: Facets | null;
  priceCurrency: string;
  onApply: (patch: Partial<ListingFilters>) => void;
  onReset: () => void;
}

const fieldClass =
  "h-11 w-full border border-line bg-ink px-3 text-[13px] text-white placeholder:text-fog focus:border-white/40 focus:outline-none";
const labelClass = "mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-fog";

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={cn(fieldClass, "appearance-none pr-9")}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
      </span>
    </label>
  );
}

/** The control grid itself — shared by the desktop panel and the drawer. */
export function FilterControls({ lang, facets, priceCurrency, draft, setDraft, onReset }: FilterProps & {
  draft: ListingFilters;
  setDraft: (next: ListingFilters) => void;
}) {
  const patch = (next: Partial<ListingFilters>) => setDraft({ ...draft, ...next, page: 1 });
  const makes = useMemo(() => {
    const fromFacets = (facets?.brands ?? []).map((f) => f.value);
    return Array.from(new Set([...fromFacets, ...MAKES])).sort((a, b) => a.localeCompare(b));
  }, [facets]);
  const countries = useMemo(() => {
    const fromFacets = (facets?.countries ?? []).map((f) => f.value);
    const list = fromFacets.length ? Array.from(new Set([...fromFacets, ...COUNTRIES.map((c) => c.name)])) : COUNTRIES.map((c) => c.name);
    return list.sort((a, b) => a.localeCompare(b));
  }, [facets]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Select label={t(lang, "mk_filter_brand")} value={draft.brand ?? ""} onChange={(value) => patch({ brand: value || undefined })}>
        <option value="">{t(lang, "mk_filter_any")}</option>
        {makes.map((make) => (
          <option key={make} value={make}>
            {make}
          </option>
        ))}
      </Select>

      <label className="block">
        <span className={labelClass}>{t(lang, "mk_filter_model")}</span>
        <input
          type="text"
          value={draft.model ?? ""}
          onChange={(event) => patch({ model: event.target.value || undefined })}
          placeholder={t(lang, "mk_filter_model_placeholder")}
          className={fieldClass}
          maxLength={60}
        />
      </label>

      <Select
        label={t(lang, "mk_filter_condition")}
        value={draft.condition ?? ""}
        onChange={(value) => patch({ condition: (value || undefined) as VehicleCondition | undefined })}
      >
        <option value="">{t(lang, "mk_filter_any")}</option>
        {CONDITIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {t(lang, `mk_condition_${option.id}`)}
          </option>
        ))}
      </Select>

      <Select label={t(lang, "mk_filter_country")} value={draft.country ?? ""} onChange={(value) => patch({ country: value || undefined })}>
        <option value="">{t(lang, "mk_filter_any")}</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </Select>

      <label className="block">
        <span className={labelClass}>{t(lang, "mk_filter_city")}</span>
        <input
          type="text"
          value={draft.city ?? ""}
          onChange={(event) => patch({ city: event.target.value || undefined })}
          placeholder={t(lang, "mk_filter_city_placeholder")}
          className={fieldClass}
          maxLength={60}
        />
      </label>

      <Select
        label={t(lang, "mk_filter_seller")}
        value={draft.sellerType ?? ""}
        onChange={(value) => patch({ sellerType: (value || undefined) as SellerType | undefined })}
      >
        <option value="">{t(lang, "mk_filter_any")}</option>
        {SELLER_TYPES.map((option) => (
          <option key={option.id} value={option.id}>
            {t(lang, `mk_seller_${option.id}`)}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>{t(lang, "mk_filter_price_min")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.priceMin ?? ""}
            onChange={(event) => patch({ priceMin: event.target.value ? Number(event.target.value) : null })}
            placeholder="0"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>{t(lang, "mk_filter_price_max")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.priceMax ?? ""}
            onChange={(event) => patch({ priceMax: event.target.value ? Number(event.target.value) : null })}
            placeholder={priceCurrency}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onReset}
          className="cv-btn cv-btn-sm cv-btn-subtle h-11 w-full px-4 text-[11px] font-semibold tracking-[0.16em]"
        >
          {t(lang, "mk_reset_filters")}
        </button>
      </div>

      {/* Extra vehicle technicalities live behind a disclosure so the
          first screen of filters stays short on mobile. */}
      <details className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
        <summary className="cursor-pointer list-none text-[11px] font-semibold tracking-[0.18em] text-mist hover:text-white">
          + {t(lang, "mk_filter_more")}
        </summary>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label={t(lang, "mk_filter_body")}
            value={draft.body ?? ""}
            onChange={(value) => patch({ body: value || undefined })}
          >
            <option value="">{t(lang, "mk_filter_any")}</option>
            {BODY_TYPES.map((body) => (
              <option key={body} value={body}>
                {body}
              </option>
            ))}
          </Select>
          <Select
            label={t(lang, "mk_filter_fuel")}
            value={draft.fuel ?? ""}
            onChange={(value) => patch({ fuel: value || undefined })}
          >
            <option value="">{t(lang, "mk_filter_any")}</option>
            {FUELS.map((option) => (
              <option key={option.id} value={option.id}>
                {t(lang, `mk_fuel_${option.id}`)}
              </option>
            ))}
          </Select>
          <Select
            label={t(lang, "mk_filter_transmission")}
            value={draft.transmission ?? ""}
            onChange={(value) => patch({ transmission: value || undefined })}
          >
            <option value="">{t(lang, "mk_filter_any")}</option>
            {TRANSMISSIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {t(lang, `mk_transmission_${option.id}`)}
              </option>
            ))}
          </Select>
        </div>
      </details>
    </div>
  );
}

/** Sort selector — a native select (fast, accessible, no JS dropdown). */
export function SortSelect({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: SortId;
  onChange: (value: SortId) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-[10px] font-semibold tracking-[0.2em] text-fog">
        {t(lang, "mk_sort_label")}
      </label>
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as SortId)}
          className="h-10 appearance-none border border-line bg-ink pl-3 pr-9 text-[12px] font-medium text-white focus:border-white/40 focus:outline-none"
        >
          {SORTS.map((option) => (
            <option key={option.id} value={option.id}>
              {t(lang, `mk_sort_${option.id.replace("-", "_")}`)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
      </span>
    </div>
  );
}

/** Mobile drawer wrapper: bottom sheet, scrollable, never full-screen. */
export function MobileFilterDrawer({
  open,
  onClose,
  lang,
  children,
  resultCount,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  children: React.ReactNode;
  resultCount: number | null;
  onApply: () => void;
}) {
  useBodyScrollLock(open);
  useEscapeToClose(onClose, open);
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[70] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      inert={!open}
      aria-label={t(lang, "mk_filters_title")}
    >
      <button
        type="button"
        aria-label={t(lang, "mk_close")}
        onClick={onClose}
        className={cn("absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto border-t border-line bg-charcoal transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-charcoal/95 px-4 py-3 backdrop-blur">
          <h2 className="font-display text-base font-semibold text-white">{t(lang, "mk_filters_title")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cv-btn cv-btn-sm cv-btn-subtle h-9 px-3 text-[11px] font-semibold tracking-[0.14em]"
          >
            {t(lang, "mk_close")}
          </button>
        </div>
        <div className="px-4 py-5">{children}</div>
        <div className="safe-bottom sticky bottom-0 border-t border-line bg-charcoal/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={onApply}
            className="cv-btn cv-btn-primary h-12 w-full text-[12px] font-semibold tracking-[0.18em]"
          >
            {resultCount === null
              ? t(lang, "mk_apply_filters")
              : t(lang, "mk_apply_filters_count", { count: formatNumber(resultCount, lang) })}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Search field used in the hero and in the results bar. */
export function MarketplaceSearch({
  lang,
  value,
  onSubmit,
  autoFocus = false,
  size = "lg",
}: {
  lang: Lang;
  value: string;
  onSubmit: (value: string) => void;
  autoFocus?: boolean;
  size?: "lg" | "md";
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const id = useId();
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft.trim());
      }}
      className={cn(
        "edge-light flex w-full items-center gap-2 border border-line bg-ink/90 p-1.5 backdrop-blur-sm focus-within:border-white/35",
        size === "lg" ? "h-14 sm:h-16" : "h-12"
      )}
    >
      <label htmlFor={id} className="sr-only">
        {t(lang, "mk_search_placeholder")}
      </label>
      <SearchIcon className={cn("ms-3 shrink-0 text-fog", size === "lg" ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={draft}
        autoFocus={autoFocus}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={t(lang, "mk_search_placeholder")}
        className={cn("min-w-0 flex-1 bg-transparent text-white placeholder:text-fog focus:outline-none", size === "lg" ? "text-sm sm:text-base" : "text-sm")}
      />
      <button
        type="submit"
        className={cn(
          "cv-btn cv-btn-sm cv-btn-primary shrink-0 px-4 text-[11px] font-semibold tracking-[0.18em] sm:px-6",
          size === "lg" ? "h-11 sm:h-13" : "h-9"
        )}
      >
        {t(lang, "mk_search_button")}
      </button>
    </form>
  );
}
