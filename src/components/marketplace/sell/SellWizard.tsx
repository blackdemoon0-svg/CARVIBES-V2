// ============================================================
// CARVIBES / MARKETVIBES — "Sell your car" wizard
//
// Six short steps, one screen each, and a hard rule: the seller can only
// reach the next step with a valid one. The submit button lives on the
// review step, and the listing ALWAYS arrives as PENDING — the
// confirmation says so explicitly, because that is what will happen.
//
// The wizard only talks to the API (src/lib/marketplace/api.ts): no
// localStorage as a database, no fake success. Photos are uploaded to
// the API while the seller is still on the photos step; the listing is
// created by a single POST with the resulting media ids.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { t, type Lang } from "../../../lib/i18n";
import { submitListing, type SubmitPayload } from "../../../lib/marketplace/api";
import { trackMarketplace } from "../../../lib/marketplace/analytics";
import { formatBytes, formatDateShort, formatPrice } from "../../../lib/marketplace/format";
import {
  SELL_STEPS,
  errorMessageKey,
  initialValues,
  validateAll,
  validateStep,
  type SellErrors,
  type SellFormValues,
  type SellStep,
} from "../../../lib/marketplace/sellForm";
import {
  BODY_TYPES,
  COLORS,
  CONTACT_METHODS,
  COUNTRIES,
  CURRENCIES,
  FUELS,
  MAKES,
  SELLER_TYPES,
  TRANSMISSIONS,
  countryByCode,
} from "../../../lib/marketplace/taxonomy";
import type { ContactMethod, LocalPhoto, SellerType, VehicleCondition } from "../../../lib/marketplace/types";
import PhotoUploader from "./PhotoUploader";
import { CheckIcon, ChevronDown, ShieldIcon } from "../../icons";

const DRAFT_KEY = "carvibes.marketplace.draft";

interface WizardState {
  step: SellStep;
  errors: SellErrors;
}

export default function SellWizard({ lang }: { lang: Lang }) {
  const [values, setValues] = useState<SellFormValues>(() => {
    const base = initialValues();
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) return { ...base, ...(JSON.parse(stored) as Partial<SellFormValues>) };
    } catch {
      /* ignore a corrupt draft */
    }
    return base;
  });
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [state, setState] = useState<WizardState>({ step: "vehicle", errors: {} });
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference: string; status: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const openedAt = useRef(Date.now());
  const formTop = useRef<HTMLDivElement>(null);

  // Draft autosave: text fields only (photos cannot be persisted), so a
  // reload or a phone call never costs the seller their typing.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        /* storage full / private mode — never block the form */
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [values]);

  useEffect(() => {
    trackMarketplace("sell_started", { lang });
  }, [lang]);

  const uploadedPhotos = useMemo(() => photos.filter((photo) => photo.status === "done" && photo.uploadedId), [photos]);
  const busyPhotos = photos.some((photo) => photo.status === "optimizing" || photo.status === "uploading");
  const stepIndex = SELL_STEPS.indexOf(state.step);
  const country = countryByCode(values.countryCode);

  const setValue = useCallback(<K extends keyof SellFormValues>(key: K, value: SellFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setState((current) => {
      if (!current.errors[key]) return current;
      const errors = { ...current.errors };
      delete errors[key];
      return { ...current, errors };
    });
  }, []);

  const goTo = useCallback((step: SellStep) => {
    setState((current) => ({ ...current, step, errors: {} }));
    window.requestAnimationFrame(() => formTop.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }, []);

  const next = useCallback(() => {
    const errors = validateStep(state.step, values, uploadedPhotos.length);
    if (Object.keys(errors).length) {
      setState((current) => ({ ...current, errors }));
      return;
    }
    const index = SELL_STEPS.indexOf(state.step);
    if (index < SELL_STEPS.length - 1) goTo(SELL_STEPS[index + 1]);
  }, [goTo, state.step, uploadedPhotos.length, values]);

  const back = useCallback(() => {
    const index = SELL_STEPS.indexOf(state.step);
    if (index > 0) goTo(SELL_STEPS[index - 1]);
  }, [goTo, state.step]);

  const submit = useCallback(async () => {
    const errors = validateAll(values, uploadedPhotos.length);
    if (Object.keys(errors).length) {
      // Land on the first step that failed and keep every message visible.
      const step = stepFor(errors);
      setState((current) => ({ ...current, step, errors }));
      window.requestAnimationFrame(() => formTop.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
      return;
    }

    const payload: SubmitPayload = {
      locale: lang,
      formOpenedAt: openedAt.current,
      website: honeypot,
      vehicle: {
        brand: values.brand.trim(),
        model: values.model.trim(),
        year: Number(values.year),
        condition: values.condition as VehicleCondition,
        bodyType: values.bodyType || undefined,
        fuel: values.fuel || undefined,
        transmission: values.transmission || undefined,
        mileage: values.mileage === "" ? null : Number(values.mileage),
        color: values.color || undefined,
        description: values.description.trim() || undefined,
      },
      pricing: {
        price: Number(values.price),
        currency: values.currency,
        negotiable: values.negotiable,
      },
      location: {
        countryCode: values.countryCode,
        city: values.city.trim(),
        region: values.region.trim() || undefined,
      },
      seller: {
        type: values.sellerType,
        companyName: values.companyName.trim() || undefined,
        contactMethod: values.contactMethod,
        contactValue: values.contactValue.trim(),
      },
      mediaIds: uploadedPhotos.map((photo) => photo.uploadedId as string),
    };

    setSubmitting(true);
    setSubmitError(null);
    const response = await submitListing(payload);
    setSubmitting(false);

    if (response.ok) {
      setResult({ reference: response.data.reference, status: response.data.status });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      trackMarketplace("sell_submitted", { country: values.countryCode, currency: values.currency });
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
      return;
    }

    if (response.error.fields) {
      setState({ step: state.step, errors: mapServerErrors(response.error.fields) });
    }
    setSubmitError(response.error.error);
    trackMarketplace("sell_failed", { stage: "submit", reason: response.error.error });
  }, [goTo, honeypot, lang, state.step, uploadedPhotos, values]);

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <div className="edge-light border border-line bg-charcoal p-8 text-center sm:p-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-accent/50 bg-accent/10 text-accent">
            <CheckIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold text-white sm:text-3xl">{t(lang, "mk_sell_done_title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">{t(lang, "mk_sell_done_desc")}</p>
          <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4 border border-line bg-ink/50 p-4 text-left">
            <div>
              <dt className="text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_sell_done_reference")}</dt>
              <dd className="mt-1 font-display text-sm font-bold text-white">{result.reference}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_sell_done_status")}</dt>
              <dd className="mt-1 font-display text-sm font-bold text-accent-soft">{t(lang, "mk_status_pending")}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/marketplace" className="cv-btn cv-btn-primary inline-flex h-12 items-center px-6 text-[11px] font-semibold tracking-[0.16em]">
              {t(lang, "mk_back_to_marketplace")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setValues(initialValues(values.countryCode, values.currency));
                setPhotos([]);
                openedAt.current = Date.now();
                goTo("vehicle");
              }}
              className="cv-btn cv-btn-ghost inline-flex h-12 items-center px-6 text-[11px] font-semibold tracking-[0.16em]"
            >
              {t(lang, "mk_sell_again")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28" ref={formTop}>
      <p className="text-[10px] font-semibold tracking-[0.4em] text-accent">{t(lang, "mk_brand_name")}</p>
      <h1 className="mt-3 font-display text-2xl font-extrabold text-white sm:text-4xl">{t(lang, "mk_sell_title")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">{t(lang, "mk_sell_subtitle")}</p>

      <p className="mt-4 flex items-start gap-2 border border-line bg-charcoal px-4 py-3 text-[12px] leading-relaxed text-mist">
        <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        {t(lang, "mk_sell_review_notice")}
      </p>

      {/* Stepper */}
      <ol className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label={t(lang, "mk_sell_steps")}>
        {SELL_STEPS.map((step, index) => {
          const done = index < stepIndex;
          const current = index === stepIndex;
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => (index <= stepIndex ? goTo(step) : undefined)}
                aria-current={current ? "step" : undefined}
                disabled={index > stepIndex}
                className={cn(
                  "flex w-full flex-col gap-1.5 border px-2 py-2 text-left transition-colors",
                  current ? "border-accent bg-accent/[0.08]" : done ? "border-line bg-charcoal" : "border-line/60 bg-ink/40 opacity-60"
                )}
              >
                <span className={cn("text-[10px] font-bold tracking-[0.18em]", current ? "text-accent" : "text-fog")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-[11px] text-mist">{t(lang, `mk_step_${step}`)}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Steps */}
      <div className="mt-8 border border-line bg-charcoal p-5 sm:p-7">
        {state.step === "vehicle" && (
          <StepShell title={t(lang, "mk_step_vehicle")} hint={t(lang, "mk_step_vehicle_hint")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t(lang, "mk_field_brand")} required error={state.errors.brand} lang={lang}>
                <SelectInput
                  value={values.brand}
                  onChange={(value) => setValue("brand", value)}
                  placeholder={t(lang, "mk_field_select")}
                  options={MAKES.map((make) => ({ value: make, label: make }))}
                />
              </Field>
              <Field label={t(lang, "mk_field_model")} required error={state.errors.model} lang={lang}>
                <TextInput value={values.model} onChange={(value) => setValue("model", value)} maxLength={60} placeholder="X5 xDrive40i" />
              </Field>
              <Field label={t(lang, "mk_field_year")} required error={state.errors.year} lang={lang}>
                <TextInput
                  value={values.year}
                  onChange={(value) => setValue("year", value.replace(/[^\d]/g, "").slice(0, 4))}
                  inputMode="numeric"
                  placeholder={String(new Date().getFullYear())}
                />
              </Field>
              <Field label={t(lang, "mk_field_condition")} required error={state.errors.condition} lang={lang}>
                <div className="grid grid-cols-2 gap-2">
                  {(["used", "new"] as VehicleCondition[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("condition", option)}
                      aria-pressed={values.condition === option}
                      className={cn(
                        "h-11 border text-[12px] font-semibold tracking-[0.14em] transition-colors",
                        values.condition === option ? "border-accent bg-accent/15 text-white" : "border-line bg-ink/50 text-mist hover:text-white"
                      )}
                    >
                      {t(lang, `mk_condition_${option}`)}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t(lang, "mk_field_body")} error={state.errors.bodyType} lang={lang}>
                <SelectInput
                  value={values.bodyType}
                  onChange={(value) => setValue("bodyType", value)}
                  placeholder={t(lang, "mk_field_select")}
                  options={BODY_TYPES.map((body) => ({ value: body, label: body }))}
                />
              </Field>
              <Field label={t(lang, "mk_field_fuel")} error={state.errors.fuel} lang={lang}>
                <SelectInput
                  value={values.fuel}
                  onChange={(value) => setValue("fuel", value)}
                  placeholder={t(lang, "mk_field_select")}
                  options={FUELS.map((fuel) => ({ value: fuel.id, label: t(lang, `mk_fuel_${fuel.id}`) }))}
                />
              </Field>
              <Field label={t(lang, "mk_field_transmission")} error={state.errors.transmission} lang={lang}>
                <SelectInput
                  value={values.transmission}
                  onChange={(value) => setValue("transmission", value)}
                  placeholder={t(lang, "mk_field_select")}
                  options={TRANSMISSIONS.map((option) => ({ value: option.id, label: t(lang, `mk_transmission_${option.id}`) }))}
                />
              </Field>
              <Field
                label={t(lang, "mk_field_mileage")}
                error={state.errors.mileage}
                hint={values.condition === "new" ? t(lang, "mk_field_mileage_new") : undefined}
                required={values.condition === "used"}
                lang={lang}
              >
                <TextInput
                  value={values.mileage}
                  onChange={(value) => setValue("mileage", value.replace(/[^\d]/g, "").slice(0, 7))}
                  inputMode="numeric"
                  placeholder="45000"
                  suffix="km"
                />
              </Field>
              <Field label={t(lang, "mk_field_color")} error={state.errors.color} lang={lang}>
                <SelectInput
                  value={values.color}
                  onChange={(value) => setValue("color", value)}
                  placeholder={t(lang, "mk_field_select")}
                  options={COLORS.map((color) => ({ value: color, label: color }))}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label={t(lang, "mk_field_description")}
                  error={state.errors.description}
                  hint={t(lang, "mk_field_description_hint")}
                  lang={lang}
                >
                  <textarea
                    value={values.description}
                    onChange={(event) => setValue("description", event.target.value.slice(0, 3000))}
                    rows={5}
                    placeholder={t(lang, "mk_field_description_placeholder")}
                    className="w-full border border-line bg-ink px-3 py-2.5 text-[13px] text-white placeholder:text-fog focus:border-white/40 focus:outline-none"
                  />
                  <span className="mt-1 block text-right text-[10px] text-fog">{values.description.length} / 3000</span>
                </Field>
              </div>
            </div>
          </StepShell>
        )}

        {state.step === "pricing" && (
          <StepShell title={t(lang, "mk_step_pricing")} hint={t(lang, "mk_step_pricing_hint")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t(lang, "mk_field_price")} required error={state.errors.price} lang={lang}>
                <TextInput
                  value={values.price}
                  onChange={(value) => setValue("price", value.replace(/[^\d]/g, "").slice(0, 12))}
                  inputMode="numeric"
                  placeholder="25000"
                />
              </Field>
              <Field label={t(lang, "mk_field_currency")} required error={state.errors.currency} lang={lang}>
                <SelectInput
                  value={values.currency}
                  onChange={(value) => setValue("currency", value)}
                  options={CURRENCIES.map((currency) => ({ value: currency, label: currency }))}
                />
              </Field>
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-3 border border-line bg-ink/40 px-4 py-3">
              <input
                type="checkbox"
                checked={values.negotiable}
                onChange={(event) => setValue("negotiable", event.target.checked)}
                className="h-4 w-4 accent-[#e3262e]"
              />
              <span className="text-[13px] text-mist">{t(lang, "mk_field_negotiable")}</span>
            </label>
          </StepShell>
        )}

        {state.step === "location" && (
          <StepShell title={t(lang, "mk_step_location")} hint={t(lang, "mk_step_location_hint")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t(lang, "mk_field_country")} required error={state.errors.countryCode} lang={lang}>
                <SelectInput
                  value={values.countryCode}
                  onChange={(value) => setValue("countryCode", value)}
                  placeholder={t(lang, "mk_field_select")}
                  options={COUNTRIES.map((item) => ({ value: item.code, label: item.name }))}
                />
              </Field>
              <Field label={t(lang, "mk_field_city")} required error={state.errors.city} lang={lang}>
                <TextInput value={values.city} onChange={(value) => setValue("city", value)} maxLength={60} placeholder="Casablanca" />
              </Field>
              <Field label={t(lang, "mk_field_region")} error={state.errors.region} lang={lang}>
                <TextInput value={values.region} onChange={(value) => setValue("region", value)} maxLength={60} placeholder="Casablanca-Settat" />
              </Field>
            </div>
          </StepShell>
        )}

        {state.step === "photos" && (
          <StepShell title={t(lang, "mk_step_photos")} hint={t(lang, "mk_step_photos_hint")}>
            <PhotoUploader lang={lang} photos={photos} onChange={setPhotos} error={state.errors.media} />
            {state.errors.media && (
              <p className="mt-3 text-[12px] text-accent-soft" role="alert">
                ⚠ {t(lang, errorMessageKey(state.errors.media))}
              </p>
            )}
            {busyPhotos && (
              <p className="mt-3 text-[12px] text-fog" role="status">
                {t(lang, "mk_upload_in_progress")}
              </p>
            )}
          </StepShell>
        )}

        {state.step === "contact" && (
          <StepShell title={t(lang, "mk_step_contact")} hint={t(lang, "mk_step_contact_hint")}>
            <fieldset>
              <legend className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-fog">
                {t(lang, "mk_field_seller_type").toUpperCase()}
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {SELLER_TYPES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setValue("sellerType", option.id as SellerType)}
                    aria-pressed={values.sellerType === option.id}
                    className={cn(
                      "h-11 border text-[12px] font-semibold tracking-[0.12em] transition-colors",
                      values.sellerType === option.id ? "border-accent bg-accent/15 text-white" : "border-line bg-ink/50 text-mist hover:text-white"
                    )}
                  >
                    {t(lang, `mk_seller_${option.id}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            {values.sellerType !== "individual" && (
              <div className="mt-5">
                <Field label={t(lang, "mk_field_company")} required error={state.errors.companyName} lang={lang}>
                  <TextInput value={values.companyName} onChange={(value) => setValue("companyName", value)} maxLength={80} />
                </Field>
              </div>
            )}

            <fieldset className="mt-6">
              <legend className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-fog">
                {t(lang, "mk_field_contact_method").toUpperCase()}
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CONTACT_METHODS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setValue("contactMethod", option.id as ContactMethod);
                      setValue("contactValue", "");
                    }}
                    aria-pressed={values.contactMethod === option.id}
                    className={cn(
                      "h-11 border text-[12px] font-semibold tracking-[0.12em] transition-colors",
                      values.contactMethod === option.id ? "border-accent bg-accent/15 text-white" : "border-line bg-ink/50 text-mist hover:text-white"
                    )}
                  >
                    {t(lang, `mk_contact_${option.id}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            {values.contactMethod && (
              <div className="mt-5">
                <Field
                  label={t(lang, `mk_contact_field_${values.contactMethod}`)}
                  required
                  error={state.errors.contactValue}
                  hint={values.contactMethod === "whatsapp" || values.contactMethod === "phone" ? t(lang, "mk_field_phone_hint") : undefined}
                  lang={lang}
                >
                  <TextInput
                    value={values.contactValue}
                    onChange={(value) => setValue("contactValue", value)}
                    maxLength={120}
                    inputMode={values.contactMethod === "whatsapp" || values.contactMethod === "phone" ? "tel" : "text"}
                    placeholder={
                      values.contactMethod === "whatsapp" || values.contactMethod === "phone"
                        ? `+${country?.dial.replace("+", "") ?? "212"} 6 12 34 56 78`
                        : values.contactMethod === "instagram"
                          ? "@yourhandle"
                          : "https://…"
                    }
                  />
                </Field>
                <p className="mt-2 text-[11px] leading-relaxed text-fog">{t(lang, "mk_contact_privacy_note")}</p>
              </div>
            )}
          </StepShell>
        )}

        {state.step === "review" && (
          <StepShell title={t(lang, "mk_step_review")} hint={t(lang, "mk_step_review_hint")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewBlock title={t(lang, "mk_review_vehicle")} onEdit={() => goTo("vehicle")} editLabel={t(lang, "mk_edit")}>
                <ReviewRow label={t(lang, "mk_field_brand")} value={`${values.brand} ${values.model}`} />
                <ReviewRow label={t(lang, "mk_field_year")} value={values.year} />
                <ReviewRow label={t(lang, "mk_field_condition")} value={t(lang, `mk_condition_${values.condition || "used"}`)} />
                {values.mileage && <ReviewRow label={t(lang, "mk_field_mileage")} value={`${values.mileage} km`} />}
                {values.fuel && <ReviewRow label={t(lang, "mk_field_fuel")} value={t(lang, `mk_fuel_${values.fuel}`)} />}
                {values.transmission && (
                  <ReviewRow label={t(lang, "mk_field_transmission")} value={t(lang, `mk_transmission_${values.transmission}`)} />
                )}
              </ReviewBlock>

              <ReviewBlock title={t(lang, "mk_review_price")} onEdit={() => goTo("pricing")} editLabel={t(lang, "mk_edit")}>
                <ReviewRow label={t(lang, "mk_field_price")} value={formatPrice(Number(values.price) || 0, values.currency, lang)} />
                <ReviewRow label={t(lang, "mk_field_negotiable")} value={values.negotiable ? t(lang, "mk_yes") : t(lang, "mk_no")} />
              </ReviewBlock>

              <ReviewBlock title={t(lang, "mk_review_location")} onEdit={() => goTo("location")} editLabel={t(lang, "mk_edit")}>
                <ReviewRow label={t(lang, "mk_field_country")} value={country?.name ?? values.countryCode} />
                <ReviewRow label={t(lang, "mk_field_city")} value={values.city} />
                {values.region && <ReviewRow label={t(lang, "mk_field_region")} value={values.region} />}
              </ReviewBlock>

              <ReviewBlock title={t(lang, "mk_review_seller")} onEdit={() => goTo("contact")} editLabel={t(lang, "mk_edit")}>
                <ReviewRow label={t(lang, "mk_field_seller_type")} value={t(lang, `mk_seller_${values.sellerType}`)} />
                {values.companyName && <ReviewRow label={t(lang, "mk_field_company")} value={values.companyName} />}
                <ReviewRow label={t(lang, "mk_field_contact_method")} value={t(lang, `mk_contact_${values.contactMethod || "other"}`)} />
                <ReviewRow
                  label={t(lang, "mk_contact_value")}
                  value={values.contactMethod === "instagram" ? `@${values.contactValue.replace(/^@/, "")}` : values.contactValue}
                />
              </ReviewBlock>

              <ReviewBlock title={t(lang, "mk_review_photos")} onEdit={() => goTo("photos")} editLabel={t(lang, "mk_edit")}>
                {uploadedPhotos.length === 0 ? (
                  <p className="text-[12px] text-accent-soft">{t(lang, "mk_review_no_photos")}</p>
                ) : (
                  <ul className="grid grid-cols-4 gap-2">
                    {uploadedPhotos.slice(0, 8).map((photo, index) => (
                      <li key={photo.id} className="relative aspect-[4/3] overflow-hidden border border-line">
                        <img src={photo.previewUrl} alt={t(lang, "mk_upload_photo_alt", { index: index + 1 })} loading="lazy" className="h-full w-full object-cover" />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 bg-accent px-1.5 py-0.5 text-[8px] font-bold text-white">
                            {t(lang, "mk_upload_main")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-fog">
                  {t(lang, "mk_review_photos_meta", { count: uploadedPhotos.length, size: formatBytes(uploadedPhotos.reduce((sum, photo) => sum + photo.bytes, 0)) })}
                </p>
              </ReviewBlock>
            </div>

            {values.description && (
              <div className="mt-5 border border-line bg-ink/40 p-4">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-fog">{t(lang, "mk_field_description").toUpperCase()}</p>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-mist">{values.description}</p>
              </div>
            )}

            {/* Honeypot: hidden from humans, irresistible to bots. */}
            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
              <label htmlFor="mk-website">Website</label>
              <input id="mk-website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
            </div>

            {submitError && (
              <p className="mt-5 border border-accent/50 bg-accent/[0.07] px-4 py-3 text-[12px] text-white" role="alert">
                ⚠ {t(lang, "mk_submit_error")}
                {submitError === "rate_limited" ? ` — ${t(lang, "mk_submit_rate_limited")}` : ""}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void submit()}
                disabled={submitting || busyPhotos}
                className="cv-btn cv-btn-primary inline-flex h-13 items-center px-8 text-[12px] font-semibold tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t(lang, "mk_submitting") : t(lang, "mk_submit_listing")}
              </button>
            </div>
          </StepShell>
        )}

        {/* Step navigation */}
        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0}
            className="cv-btn cv-btn-sm cv-btn-subtle h-11 px-5 text-[11px] font-semibold tracking-[0.16em] disabled:opacity-40"
          >
            ← {t(lang, "mk_back")}
          </button>
          <span className="text-[11px] tracking-[0.16em] text-fog">
            {t(lang, "mk_step_of", { current: stepIndex + 1, total: SELL_STEPS.length })}
          </span>
          {state.step !== "review" && (
            <button
              type="button"
              onClick={next}
              className="cv-btn cv-btn-sm cv-btn-primary h-11 px-6 text-[11px] font-semibold tracking-[0.16em]"
            >
              {t(lang, "mk_continue")} →
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-fog">
        {t(lang, "mk_sell_terms")}{" "}
        <Link to="/terms" className="underline decoration-line underline-offset-4 hover:text-white">
          {t(lang, "nav_terms")}
        </Link>
      </p>
      <p className="mt-2 text-[11px] text-fog">
        {t(lang, "mk_draft_saved")} · {formatDateShort(new Date().toISOString(), lang)}
      </p>
    </div>
  );
}

function stepFor(errors: SellErrors): SellStep {
  if (errors.brand || errors.model || errors.year || errors.condition || errors.mileage) return "vehicle";
  if (errors.price || errors.currency) return "pricing";
  if (errors.countryCode || errors.city) return "location";
  if (errors.media) return "photos";
  if (errors.companyName || errors.contactMethod || errors.contactValue) return "contact";
  return "review";
}

/** Server error keys → form fields (the API is the source of truth). */
function mapServerErrors(fields: Record<string, string>): SellErrors {
  const mapped: SellErrors = {};
  for (const [key, value] of Object.entries(fields)) {
    const field = key.split(".").pop() as keyof SellFormValues;
    if (field) mapped[field] = value;
    if (key === "media") mapped.media = value;
    if (key === "spam") mapped.form = value;
  }
  return mapped;
}

// ------------------------------------------------------------
// Small presentational helpers (kept local: they exist only here)
// ------------------------------------------------------------
function StepShell({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-[12px] text-fog">{hint}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  error,
  hint,
  required,
  lang,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  lang: Lang;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-fog">
        {label.toUpperCase()}
        {required && <span className="ml-1 text-accent">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] text-fog">{hint}</span>}
      {error && (
        <span className="mt-1 block text-[11px] text-accent-soft" role="alert">
          {t(lang, errorMessageKey(error))}
        </span>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
  suffix,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel";
  maxLength?: number;
  suffix?: string;
}) {
  return (
    <span className="flex items-center border border-line bg-ink focus-within:border-white/40">
      <input
        type="text"
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white placeholder:text-fog focus:outline-none"
      />
      {suffix && <span className="pr-3 text-[11px] text-fog">{suffix}</span>}
    </span>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none border border-line bg-ink pl-3 pr-9 text-[13px] text-white focus:border-white/40 focus:outline-none"
      >
        <option value="">{placeholder ?? "—"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog" />
    </span>
  );
}

function ReviewBlock({
  title,
  onEdit,
  editLabel,
  children,
}: {
  title: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-ink/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-semibold tracking-[0.2em] text-fog">{title.toUpperCase()}</h3>
        <button type="button" onClick={onEdit} className="text-[10px] font-semibold tracking-[0.16em] text-mist underline underline-offset-4 hover:text-white">
          {editLabel}
        </button>
      </div>
      <dl className="mt-3 space-y-1.5">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px]">
      <dt className="text-fog">{label}</dt>
      <dd className="text-right text-mist">{value || "—"}</dd>
    </div>
  );
}
