import { useMemo } from "react";
import { t, type Lang } from "../../../lib/i18n";
import { analyzeCountry, countryName } from "../countries";
import { CURRENCIES, currencyMeta, mileageUnitLabel } from "../currency";
import { catalogueBrands, catalogueModels } from "../catalogue";
import type { AnalysisRequest, DeclaredDefect, MileageUnit, VehicleInput } from "../types";
import CountrySelector from "./CountrySelector";
import PhotoUploader from "./PhotoUploader";

interface Props {
  lang: Lang;
  request: AnalysisRequest;
  step: number;
  onRequestChange: (req: AnalysisRequest) => void;
  onStepChange: (step: number) => void;
  onAnalyze: () => void;
}

export const FORM_STEPS = [
  "az_step_location",
  "az_step_vehicle",
  "az_step_photos",
  "az_step_listing",
  "az_step_review",
];

const DEFECTS: DeclaredDefect[] = [
  "dent",
  "scratch",
  "rust",
  "paint_mismatch",
  "panel_gap",
  "tire_wear",
  "warning_light",
  "interior_wear",
  "visible_leak",
  "modification",
  "crack_glass",
  "none",
];

export function emptyVehicle(countryCode: string): VehicleInput {
  const c = analyzeCountry(countryCode);
  return {
    brand: "",
    model: "",
    version: "",
    year: null,
    generation: "",
    engine: "",
    displacement: "",
    fuel: "",
    transmission: "",
    gearbox: "",
    mileage: null,
    mileageUnit: c.mileageUnit,
    askingPrice: null,
    askingCurrency: c.currency,
    vin: "",
    owners: "",
    maintenance: "",
    accident: "",
    keys: "",
    inspection: "",
    sellerDescription: "",
  };
}

export default function VehicleAnalysisForm({
  lang,
  request,
  step,
  onRequestChange,
  onStepChange,
  onAnalyze,
}: Props) {
  const v = request.vehicle;
  const vehicleCountry = analyzeCountry(request.vehicleCountry);

  const setVehicle = (patch: Partial<VehicleInput>) =>
    onRequestChange({ ...request, vehicle: { ...v, ...patch } });

  const setVehicleCountry = (code: string) => {
    const c = analyzeCountry(code);
    onRequestChange({
      ...request,
      vehicleCountry: code,
      vehicle: { ...v, askingCurrency: c.currency, mileageUnit: c.mileageUnit },
    });
  };

  const brands = useMemo(() => catalogueBrands(), []);
  const models = useMemo(() => catalogueModels(v.brand), [v.brand]);

  const canContinue =
    step === 1
      ? v.brand.trim().length > 0 && v.model.trim().length > 0 && v.year != null && v.year >= 1950 && v.year <= new Date().getFullYear() + 1
      : true;

  const toggleDefect = (d: DeclaredDefect) => {
    const current = request.declaredDefects;
    if (d === "none") {
      onRequestChange({ ...request, declaredDefects: current.includes("none") ? [] : ["none"] });
      return;
    }
    const withoutNone = current.filter((x) => x !== "none");
    const next = withoutNone.includes(d)
      ? withoutNone.filter((x) => x !== d)
      : [...withoutNone, d];
    onRequestChange({ ...request, declaredDefects: next });
  };

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-1.5 sm:gap-2" aria-label={t(lang, "az_step_of", { current: step + 1, total: FORM_STEPS.length })}>
        {FORM_STEPS.map((key, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li key={key} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && onStepChange(i)}
                disabled={i >= step}
                className="flex min-w-0 items-center gap-2 disabled:cursor-default"
                aria-current={i === step ? "step" : undefined}
              >
                <span className="az-step-dot" data-state={state}>
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span
                  className={`hidden truncate text-[11px] font-semibold tracking-wider lg:inline ${
                    i === step ? "text-white" : "text-fog"
                  }`}
                >
                  {t(lang, key).toUpperCase()}
                </span>
              </button>
              {i < FORM_STEPS.length - 1 && <span className="h-px min-w-2 flex-1 bg-line sm:min-w-4" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {step === 0 && (
        <div className="az-rise grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <CountrySelector
              id="az-vehicle-country"
              lang={lang}
              value={request.vehicleCountry}
              onChange={setVehicleCountry}
              label={t(lang, "az_vehicle_country")}
              hint={t(lang, "az_vehicle_country_hint")}
            />
          </div>
          <div className="sm:col-span-1">
            <Field
              label={t(lang, "az_region")}
              optional={`${t(lang, "az_optional")} · ${t(lang, "az_recommended")}`}
            >
              <input
                className="az-input"
                value={request.vehicleRegion}
                onChange={(e) => onRequestChange({ ...request, vehicleRegion: e.target.value })}
                placeholder={t(lang, "az_region_ph")}
                autoComplete="off"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <CountrySelector
              id="az-destination-country"
              lang={lang}
              value={request.destinationCountry}
              onChange={(code) => onRequestChange({ ...request, destinationCountry: code })}
              label={t(lang, "az_destination")}
              hint={t(lang, "az_destination_hint")}
            />
          </div>
          <div className="az-glass grid gap-3 rounded-xl p-4 sm:col-span-2 sm:grid-cols-2">
            <AutoFact
              label={t(lang, "az_currency_auto")}
              value={`${vehicleCountry.flag} ${v.askingCurrency} · ${currencyMeta(v.askingCurrency).symbol}`}
            />
            <AutoFact
              label={t(lang, "az_units_auto")}
              value={mileageUnitLabel(v.mileageUnit, lang)}
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="az-rise">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t(lang, "az_f_brand")}>
              <input
                className="az-input"
                list="az-brands"
                value={v.brand}
                onChange={(e) => setVehicle({ brand: e.target.value })}
                placeholder={t(lang, "az_f_brand_ph")}
                autoComplete="off"
              />
              <datalist id="az-brands">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
            <Field label={t(lang, "az_f_model")}>
              <input
                className="az-input"
                list="az-models"
                value={v.model}
                onChange={(e) => setVehicle({ model: e.target.value })}
                placeholder={t(lang, "az_f_model_ph")}
                autoComplete="off"
              />
              {models.length > 0 && (
                <datalist id="az-models">
                  {models.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              )}
            </Field>
            <Field label={t(lang, "az_f_version")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.version} onChange={(e) => setVehicle({ version: e.target.value })} placeholder={t(lang, "az_f_version_ph")} autoComplete="off" />
            </Field>
            <Field label={t(lang, "az_f_year")}>
              <input
                className="az-input"
                type="number"
                inputMode="numeric"
                min={1950}
                max={new Date().getFullYear() + 1}
                value={v.year ?? ""}
                onChange={(e) => setVehicle({ year: e.target.value ? Number(e.target.value) : null })}
                placeholder={t(lang, "az_f_year_ph")}
              />
            </Field>
            <Field label={t(lang, "az_f_generation")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.generation} onChange={(e) => setVehicle({ generation: e.target.value })} placeholder={t(lang, "az_f_generation_ph")} autoComplete="off" />
            </Field>
            <Field label={t(lang, "az_f_engine")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.engine} onChange={(e) => setVehicle({ engine: e.target.value })} placeholder={t(lang, "az_f_engine_ph")} autoComplete="off" />
            </Field>
            <Field label={t(lang, "az_f_displacement")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.displacement} onChange={(e) => setVehicle({ displacement: e.target.value })} placeholder={t(lang, "az_f_displacement_ph")} autoComplete="off" />
            </Field>
            <Field label={t(lang, "az_f_fuel")} optional={t(lang, "az_optional")}>
              <input className="az-input" list="az-fuels" value={v.fuel} onChange={(e) => setVehicle({ fuel: e.target.value })} placeholder={t(lang, "az_f_fuel_ph")} autoComplete="off" />
              <datalist id="az-fuels">
                <option value="Petrol" />
                <option value="Diesel" />
                <option value="Hybrid" />
                <option value="Plug-in hybrid" />
                <option value="Electric" />
                <option value="LPG" />
              </datalist>
            </Field>
            <Field label={t(lang, "az_f_transmission")} optional={t(lang, "az_optional")}>
              <input className="az-input" list="az-trans" value={v.transmission} onChange={(e) => setVehicle({ transmission: e.target.value })} placeholder={t(lang, "az_f_transmission_ph")} autoComplete="off" />
              <datalist id="az-trans">
                <option value="Automatic" />
                <option value="Manual" />
                <option value="CVT" />
                <option value="Dual-clutch (DCT/DSG)" />
              </datalist>
            </Field>
            <Field label={t(lang, "az_f_gearbox")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.gearbox} onChange={(e) => setVehicle({ gearbox: e.target.value })} placeholder={t(lang, "az_f_gearbox_ph")} autoComplete="off" />
            </Field>

            <Field label={t(lang, "az_f_mileage")} optional={t(lang, "az_recommended")}>
              <div className="flex gap-2">
                <input
                  className="az-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={v.mileage ?? ""}
                  onChange={(e) => setVehicle({ mileage: e.target.value ? Number(e.target.value) : null })}
                  placeholder={t(lang, "az_f_mileage_ph")}
                />
                <UnitToggle
                  value={v.mileageUnit}
                  onChange={(u: MileageUnit) => setVehicle({ mileageUnit: u })}
                />
              </div>
            </Field>
            <Field label={t(lang, "az_f_price")} optional={t(lang, "az_recommended")}>
              <div className="flex gap-2">
                <input
                  className="az-input"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={v.askingPrice ?? ""}
                  onChange={(e) => setVehicle({ askingPrice: e.target.value ? Number(e.target.value) : null })}
                  placeholder={t(lang, "az_f_price_ph")}
                />
                <select
                  className="az-input w-28 shrink-0"
                  value={v.askingCurrency}
                  onChange={(e) => setVehicle({ askingCurrency: e.target.value })}
                  aria-label={t(lang, "az_currency_auto")}
                >
                  {Object.keys(CURRENCIES).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label={t(lang, "az_f_vin")} optional={t(lang, "az_optional")}>
              <input className="az-input uppercase" value={v.vin} onChange={(e) => setVehicle({ vin: e.target.value })} placeholder={t(lang, "az_f_vin_ph")} autoComplete="off" maxLength={17} />
            </Field>
            <Field label={t(lang, "az_f_owners")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.owners} onChange={(e) => setVehicle({ owners: e.target.value })} placeholder={t(lang, "az_f_owners_ph")} autoComplete="off" />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t(lang, "az_f_maintenance")} optional={t(lang, "az_recommended")}>
                <textarea className="az-input min-h-20 resize-y" value={v.maintenance} onChange={(e) => setVehicle({ maintenance: e.target.value })} placeholder={t(lang, "az_f_maintenance_ph")} rows={2} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t(lang, "az_f_accident")} optional={t(lang, "az_optional")}>
                <textarea className="az-input min-h-16 resize-y" value={v.accident} onChange={(e) => setVehicle({ accident: e.target.value })} placeholder={t(lang, "az_f_accident_ph")} rows={2} />
              </Field>
            </div>
            <Field label={t(lang, "az_f_keys")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.keys} onChange={(e) => setVehicle({ keys: e.target.value })} placeholder={t(lang, "az_f_keys_ph")} autoComplete="off" />
            </Field>
            <Field label={t(lang, "az_f_inspection")} optional={t(lang, "az_optional")}>
              <input className="az-input" value={v.inspection} onChange={(e) => setVehicle({ inspection: e.target.value })} placeholder={t(lang, "az_f_inspection_ph")} autoComplete="off" />
            </Field>
          </div>
          {!canContinue && (
            <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-200/90">
              {t(lang, "az_vehicle_required")}
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="az-rise">
          <p className="mb-5 max-w-2xl text-sm leading-relaxed text-mist">{t(lang, "az_photos_sub")}</p>
          <PhotoUploader
            lang={lang}
            photos={request.photos}
            onChange={(photos) => onRequestChange({ ...request, photos })}
          />
          <div className="az-glass mt-8 rounded-2xl p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold text-white">{t(lang, "az_defects_title")}</h3>
            <p className="mb-4 mt-1 text-sm text-mist">{t(lang, "az_defects_sub")}</p>
            <div className="flex flex-wrap gap-2">
              {DEFECTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={request.declaredDefects.includes(d)}
                  onClick={() => toggleDefect(d)}
                  className="az-chip"
                >
                  {t(lang, `az_defect_${d}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="az-rise">
          <Field label={t(lang, "az_f_listing")} optional={t(lang, "az_recommended")}>
            <textarea
              className="az-input min-h-56 resize-y leading-relaxed"
              value={v.sellerDescription}
              onChange={(e) => setVehicle({ sellerDescription: e.target.value })}
              placeholder={t(lang, "az_f_listing_ph")}
              rows={10}
            />
          </Field>
          <p className="mt-2 text-xs text-fog">{t(lang, "az_f_listing_hint")}</p>
        </div>
      )}

      {step === 4 && (
        <div className="az-rise grid gap-4 sm:grid-cols-2">
          <ReviewCard title={t(lang, "az_review_location")} onEdit={() => onStepChange(0)} editLabel={t(lang, "az_edit")}>
            <p className="text-sm text-white">
              {analyzeCountry(request.vehicleCountry).flag} {countryName(request.vehicleCountry, lang)}
              {request.vehicleRegion ? ` · ${request.vehicleRegion}` : ""}
            </p>
            <p className="mt-1 text-sm text-mist">
              {t(lang, "az_review_to")} {analyzeCountry(request.destinationCountry).flag}{" "}
              {countryName(request.destinationCountry, lang)}
            </p>
          </ReviewCard>
          <ReviewCard title={t(lang, "az_review_vehicle")} onEdit={() => onStepChange(1)} editLabel={t(lang, "az_edit")}>
            <p className="text-sm font-semibold text-white">
              {v.brand} {v.model} {v.version} {v.year ? `· ${v.year}` : ""}
            </p>
            <p className="mt-1 text-sm text-mist">
              {v.mileage != null ? `${v.mileage.toLocaleString("en-US")} ${mileageUnitLabel(v.mileageUnit, lang)}` : t(lang, "az_review_not_provided")}
              {" · "}
              {v.askingPrice != null ? `${v.askingPrice.toLocaleString("en-US")} ${v.askingCurrency}` : t(lang, "az_review_not_provided")}
            </p>
          </ReviewCard>
          <ReviewCard title={t(lang, "az_review_photos")} onEdit={() => onStepChange(2)} editLabel={t(lang, "az_edit")}>
            <p className="text-sm text-white">{t(lang, "az_photo_count", { count: request.photos.length })}</p>
            {request.declaredDefects.length > 0 && (
              <p className="mt-1 text-sm text-mist">
                {request.declaredDefects.map((d) => t(lang, `az_defect_${d}`)).join(" · ")}
              </p>
            )}
          </ReviewCard>
          <ReviewCard title={t(lang, "az_review_listing")} onEdit={() => onStepChange(3)} editLabel={t(lang, "az_edit")}>
            <p className="line-clamp-3 text-sm text-mist">
              {v.sellerDescription.trim() || t(lang, "az_review_not_provided")}
            </p>
          </ReviewCard>
          <p className="text-sm leading-relaxed text-mist sm:col-span-2">{t(lang, "az_review_sub")}</p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <div>
          {step > 0 && (
            <button type="button" onClick={() => onStepChange(step - 1)} className="az-btn-ghost">
              ← {t(lang, "az_back")}
            </button>
          )}
        </div>
        <div>
          {step < FORM_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => canContinue && onStepChange(step + 1)}
              disabled={!canContinue}
              className="az-btn-primary"
            >
              {t(lang, "az_continue")} →
            </button>
          ) : (
            <button type="button" onClick={onAnalyze} className="az-btn-primary">
              ◈ {t(lang, "az_analyze_cta")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="az-label">
        <span>{label}</span>
        {optional && <span className="az-opt">{optional}</span>}
      </div>
      {children}
    </div>
  );
}

function AutoFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-ink/50 px-4 py-3">
      <span className="text-xs tracking-wide text-fog">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function UnitToggle({ value, onChange }: { value: MileageUnit; onChange: (u: MileageUnit) => void }) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-[0.65rem] border border-line" role="group" aria-label="unit">
      {(["km", "miles"] as MileageUnit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          aria-pressed={value === u}
          className={`px-3 text-xs font-semibold transition-colors ${
            value === u ? "bg-accent/15 text-accent-soft" : "bg-ink/60 text-fog hover:text-white"
          }`}
        >
          {u === "km" ? "km" : "mi"}
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
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
    <div className="az-glass rounded-xl p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold tracking-mega text-fog">{title.toUpperCase()}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-accent hover:text-accent-soft">
          {editLabel}
        </button>
      </div>
      {children}
    </div>
  );
}
