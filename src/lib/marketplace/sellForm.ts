// ============================================================
// CARVIBES / MARKETVIBES — sell form model + validation
//
// The browser validates for immediate, friendly feedback; the API
// validates the same rules again as the source of truth
// (server/marketplace/listings.mjs). Error values are i18n keys, never
// sentences, so every message is translated.
// ============================================================

import type { ContactMethod, SellerType, VehicleCondition } from "./types";
import { CURRENCIES } from "./taxonomy";

export const SELL_STEPS = ["vehicle", "pricing", "location", "photos", "contact", "review"] as const;
export type SellStep = (typeof SELL_STEPS)[number];

export interface SellFormValues {
  brand: string;
  model: string;
  year: string;
  condition: VehicleCondition | "";
  bodyType: string;
  fuel: string;
  transmission: string;
  mileage: string;
  color: string;
  description: string;
  price: string;
  currency: string;
  negotiable: boolean;
  countryCode: string;
  city: string;
  region: string;
  sellerType: SellerType;
  companyName: string;
  contactMethod: ContactMethod | "";
  contactValue: string;
}

export type SellErrors = Partial<Record<keyof SellFormValues | "media" | "form", string>>;

export const MAX_PHOTOS = 8;
const MAX_YEAR = new Date().getFullYear() + 2;

export function initialValues(countryCode = "", currency = ""): SellFormValues {
  return {
    brand: "",
    model: "",
    year: "",
    condition: "used",
    bodyType: "",
    fuel: "",
    transmission: "",
    mileage: "",
    color: "",
    description: "",
    price: "",
    currency: currency || CURRENCIES[0],
    negotiable: false,
    countryCode,
    city: "",
    region: "",
    sellerType: "individual",
    companyName: "",
    contactMethod: "",
    contactValue: "",
  };
}

const phoneOk = (value: string) => {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

/** Validate one step. Returns error keys (empty object = valid). */
export function validateStep(step: SellStep, values: SellFormValues, photoCount: number): SellErrors {
  const errors: SellErrors = {};

  if (step === "vehicle") {
    if (values.brand.trim().length < 2) errors.brand = "required";
    if (!values.model.trim()) errors.model = "required";
    const year = Number(values.year);
    if (!Number.isInteger(year) || year < 1900 || year > MAX_YEAR) errors.year = "range";
    if (!values.condition) errors.condition = "required";
    const mileage = values.mileage === "" ? null : Number(values.mileage);
    if (values.condition === "used" && (mileage === null || !Number.isFinite(mileage))) errors.mileage = "required";
    else if (mileage !== null && (!Number.isFinite(mileage) || mileage < 0 || mileage > 2_000_000)) errors.mileage = "range";
    if (values.description.length > 3000) errors.description = "too_long";
  }

  if (step === "pricing") {
    const price = Number(values.price);
    if (!Number.isFinite(price) || price <= 0) errors.price = "required";
    else if (price > 500_000_000) errors.price = "range";
    if (!CURRENCIES.includes(values.currency)) errors.currency = "required";
  }

  if (step === "location") {
    if (!/^[A-Z]{2}$/.test(values.countryCode)) errors.countryCode = "required";
    if (values.city.trim().length < 2) errors.city = "required";
  }

  if (step === "photos") {
    if (photoCount < 1) errors.media = "required";
    if (photoCount > MAX_PHOTOS) errors.media = "too_many";
  }

  if (step === "contact") {
    if (values.sellerType !== "individual" && values.companyName.trim().length < 2) errors.companyName = "required";
    if (!values.contactMethod) errors.contactMethod = "required";
    else if (values.contactMethod === "whatsapp" || values.contactMethod === "phone") {
      if (!phoneOk(values.contactValue)) errors.contactValue = "phone";
    } else if (values.contactMethod === "instagram") {
      const handle = values.contactValue.replace(/^@+/, "").trim();
      if (!/^[A-Za-z0-9._]{2,30}$/.test(handle)) errors.contactValue = "instagram";
    } else if (values.contactValue.trim().length < 3) {
      errors.contactValue = "required";
    }
  }

  return errors;
}

/** Full-form validation, used by the review step before submitting. */
export function validateAll(values: SellFormValues, photoCount: number): SellErrors {
  return SELL_STEPS.reduce<SellErrors>((acc, step) => ({ ...acc, ...validateStep(step, values, photoCount) }), {});
}

export function stepForField(field: keyof SellFormValues): SellStep {
  if (["brand", "model", "year", "condition", "bodyType", "fuel", "transmission", "mileage", "color", "description"].includes(field))
    return "vehicle";
  if (["price", "currency", "negotiable"].includes(field)) return "pricing";
  if (["countryCode", "city", "region"].includes(field)) return "location";
  if (["sellerType", "companyName", "contactMethod", "contactValue"].includes(field)) return "contact";
  return "review";
}

/** i18n key for a validation code (`required`, `range`, `phone`, …). */
export function errorMessageKey(error: string): string {
  return `mk_err_${error}`;
}
