import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { analyzeCountry, countryName, DEFAULT_DESTINATION_COUNTRY, DEFAULT_VEHICLE_COUNTRY } from "./countries";
import { runAnalysis } from "./engines";
import { findCataloguePrices } from "./catalogue";
import { clearDraft, deleteAnalysis, listAnalyses, readDraft, saveAnalysis, saveDraft, type AnalyzeDraft } from "./storage";
import type { AnalysisRequest, AnalysisResult, StoredAnalysis } from "./types";
import { uid } from "./types";
import AnalysisProgress from "./components/AnalysisProgress";
import VehicleAnalysisForm, { emptyVehicle } from "./components/VehicleAnalysisForm";
import AnalysisReport from "./report/AnalysisReport";
import "./analyze.css";

type Screen = "intro" | "form" | "progress" | "report";

function newRequest(): AnalysisRequest {
  return {
    id: uid("az"),
    vehicle: emptyVehicle(DEFAULT_VEHICLE_COUNTRY),
    vehicleCountry: DEFAULT_VEHICLE_COUNTRY,
    vehicleRegion: "",
    destinationCountry: DEFAULT_DESTINATION_COUNTRY,
    photos: [],
    declaredDefects: [],
    createdAt: Date.now(),
  };
}

function demoRequest(): AnalysisRequest {
  const req = newRequest();
  req.vehicleCountry = "US";
  req.vehicleRegion = "Los Angeles, CA";
  req.destinationCountry = "MA";
  req.vehicle = {
    ...emptyVehicle("US"),
    brand: "BMW",
    model: "330i",
    version: "M Sport",
    year: 2020,
    generation: "G20",
    engine: "2.0 turbo petrol",
    displacement: "1998 cm³",
    fuel: "Petrol",
    transmission: "Automatic",
    gearbox: "ZF 8HP",
    mileage: 64000,
    mileageUnit: "miles",
    askingPrice: 22500,
    askingCurrency: "USD",
    owners: "2",
    maintenance: "Dealer serviced, last service at 58,000 miles. Invoices available.",
    accident: "None declared",
    keys: "2",
    inspection: "",
    vin: "",
    sellerDescription:
      "Beautiful BMW 330i M Sport, never crashed, always garage kept. Full service history at BMW dealer. New tires. Runs perfect, first hand feeling. Selling because moving abroad.",
  };
  return req;
}

function countSignals(req: AnalysisRequest): number {
  const v = req.vehicle;
  let n = 3; // countries + region baseline
  if (v.brand) n++;
  if (v.model) n++;
  if (v.year) n++;
  if (v.version) n++;
  if (v.engine) n++;
  if (v.fuel) n++;
  if (v.transmission) n++;
  if (v.mileage != null) n++;
  if (v.askingPrice != null) n++;
  if (v.vin) n++;
  if (v.maintenance) n++;
  if (v.sellerDescription.trim()) n += 2;
  n += Math.min(8, req.photos.length);
  n += req.declaredDefects.length;
  return n;
}

export interface AnalyzePrefill {
  brand: string;
  model: string;
  year: number | null;
}

export default function AnalyzeExperience({
  lang,
  prefill,
}: {
  lang: Lang;
  prefill?: AnalyzePrefill;
}) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [request, setRequest] = useState<AnalysisRequest>(newRequest);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<StoredAnalysis[]>([]);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const progressTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setHistory(listAnalyses());
    // Explicit prefill (e.g. from a car sheet CTA) wins over a saved draft.
    if (prefill?.brand && prefill?.model) {
      setRequest((current) => ({
        ...current,
        vehicle: {
          ...current.vehicle,
          brand: prefill.brand,
          model: prefill.model,
          year:
            prefill.year != null && prefill.year >= 1950 && prefill.year <= new Date().getFullYear() + 1
              ? prefill.year
              : current.vehicle.year,
        },
      }));
      setRestoredDraft(false);
      return;
    }
    const draft: AnalyzeDraft | null = readDraft();
    if (draft?.request?.vehicle) {
      setRequest({ ...draft.request, photos: [] });
      setStep(Math.min(4, Math.max(0, draft.step)));
      setRestoredDraft(true);
    }
    // Runs once on mount; prefill is stable per navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    if (progressTimer.current !== undefined) window.clearTimeout(progressTimer.current);
  }, []);

  // Autosave draft while filling the form.
  useEffect(() => {
    if (screen !== "form") return;
    const id = window.setTimeout(() => saveDraft({ request, step, updatedAt: Date.now() }), 600);
    return () => window.clearTimeout(id);
  }, [request, step, screen]);

  const start = useCallback((demo: boolean) => {
    clearDraft();
    setRequest(demo ? demoRequest() : newRequest());
    setStep(0);
    setResult(null);
    setRestoredDraft(false);
    setScreen("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const resumeDraft = useCallback(() => {
    setScreen("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const run = useCallback(() => {
    setScreen("progress");
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Let the progress animation breathe, then compute (engines are synchronous).
    progressTimer.current = window.setTimeout(() => {
      const prices = findCataloguePrices(request.vehicle.brand, request.vehicle.model);
      const res = runAnalysis(request, prices);
      setResult(res);
      saveAnalysis({
        id: request.id,
        createdAt: Date.now(),
        summary: {
          brand: request.vehicle.brand,
          model: request.vehicle.model,
          year: request.vehicle.year,
          vehicleCountry: request.vehicleCountry,
          destinationCountry: request.destinationCountry,
          askingPrice: request.vehicle.askingPrice,
          askingCurrency: request.vehicle.askingCurrency,
          photoCount: request.photos.length,
        },
        request,
        result: res,
      });
      setHistory(listAnalyses());
      clearDraft();
      setScreen("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2600);
  }, [request]);

  const openStored = useCallback((entry: StoredAnalysis) => {
    setRequest(entry.request);
    setResult(entry.result);
    setScreen("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const removeStored = useCallback((id: string) => {
    deleteAnalysis(id);
    setHistory(listAnalyses());
  }, []);

  const signalCount = useMemo(() => countSignals(request), [request]);

  return (
    <div className="az-shell">
      {screen === "intro" && (
        <Intro
          lang={lang}
          history={history}
          hasDraft={restoredDraft}
          onStart={() => start(false)}
          onDemo={() => start(true)}
          onResume={resumeDraft}
          onOpen={openStored}
          onDelete={removeStored}
        />
      )}

      {screen === "form" && (
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
          <FormHeader lang={lang} request={request} />
          <div className="az-glass mt-6 rounded-2xl p-5 sm:p-8">
            <VehicleAnalysisForm
              lang={lang}
              request={request}
              step={step}
              onRequestChange={setRequest}
              onStepChange={setStep}
              onAnalyze={run}
            />
          </div>
        </div>
      )}

      {screen === "progress" && (
        <div className="pt-20">
          <AnalysisProgress lang={lang} signalCount={signalCount} />
        </div>
      )}

      {screen === "report" && result && (
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
          <AnalysisReport
            lang={lang}
            request={request}
            result={result}
            onNew={() => start(false)}
            onEdit={() => setScreen("form")}
          />
        </div>
      )}
    </div>
  );
}

function FormHeader({ lang, request }: { lang: Lang; request: AnalysisRequest }) {
  const v = request.vehicle;
  const title = v.brand || v.model ? `${v.brand} ${v.model}`.trim() : t(lang, "az_title");
  return (
    <div>
      <p className="mb-2 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
        <span className="h-px w-8 bg-accent" />
        CARVIBES ANALYSE
      </p>
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-mist">
        {analyzeCountry(request.vehicleCountry).flag} {countryName(request.vehicleCountry, lang)}
        {" "}{t(lang, "az_review_to")}{" "}
        {analyzeCountry(request.destinationCountry).flag} {countryName(request.destinationCountry, lang)}
      </p>
    </div>
  );
}

function Intro({
  lang,
  history,
  hasDraft,
  onStart,
  onDemo,
  onResume,
  onOpen,
  onDelete,
}: {
  lang: Lang;
  history: StoredAnalysis[];
  hasDraft: boolean;
  onStart: () => void;
  onDemo: () => void;
  onResume: () => void;
  onOpen: (e: StoredAnalysis) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
      <div className="text-center">
        <p className="az-rise mb-4 inline-flex items-center gap-3 rounded-full border border-line bg-charcoal/70 px-4 py-1.5 text-[11px] font-medium tracking-mega text-fog">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          CARVIBES ANALYSE
        </p>
        <h1 className="az-rise az-rise-1 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
          {t(lang, "az_subtitle")}
        </h1>
        <p className="az-rise az-rise-2 mx-auto mt-5 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
          {t(lang, "az_tagline")}
        </p>
        <p className="az-rise az-rise-3 mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-fog">
          {t(lang, "az_intro")}
        </p>
        <div className="az-rise az-rise-4 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onStart} className="az-btn-primary">
            ◈ {t(lang, "az_start")}
          </button>
          <button type="button" onClick={onDemo} className="az-btn-ghost">
            {t(lang, "az_demo_fill")}
          </button>
        </div>
        <p className="az-rise az-rise-5 mt-3 text-xs text-fog">
          {t(lang, "az_duration")} · {t(lang, "az_demo_note")}
        </p>
        {hasDraft && (
          <button
            type="button"
            onClick={onResume}
            className="az-rise mt-4 rounded-full border border-accent/40 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent-soft transition-colors hover:bg-accent/15"
          >
            → {t(lang, "az_back_to_form")}
          </button>
        )}
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "◈", title: "az_promise_price", desc: "az_promise_price_desc" },
          { icon: "⬡", title: "az_promise_risk", desc: "az_promise_risk_desc" },
          { icon: "⬢", title: "az_promise_verdict", desc: "az_promise_verdict_desc" },
        ].map((c, i) => (
          <div key={c.title} className={`az-glass az-card-hover az-rise rounded-2xl p-6 az-rise-${i + 1}`}>
            <p className="text-2xl text-accent" aria-hidden>{c.icon}</p>
            <h2 className="mt-3 font-display text-lg font-bold text-white">{t(lang, c.title)}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">{t(lang, c.desc)}</p>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
            <span className="h-px w-8 bg-accent/60" />
            {t(lang, "az_history_title").toUpperCase()}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {history.slice(0, 6).map((h) => (
              <div key={h.id} className="az-glass az-card-hover flex items-center gap-4 rounded-xl p-4">
                <ScoreMini value={h.result.overallScore} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {h.summary.brand} {h.summary.model} {h.summary.year ? `· ${h.summary.year}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-fog">
                    {analyzeCountry(h.summary.vehicleCountry).flag} → {analyzeCountry(h.summary.destinationCountry).flag}
                    {" · "}{t(lang, "az_photo_count", { count: h.summary.photoCount })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpen(h)}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-mist transition-colors hover:border-accent/50 hover:text-white"
                >
                  {t(lang, "az_history_view")}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(h.id)}
                  aria-label={t(lang, "az_history_delete")}
                  title={t(lang, "az_history_delete")}
                  className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-fog transition-colors hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreMini({ value }: { value: number }) {
  const color = value >= 75 ? "text-emerald-300 border-emerald-400/40" : value >= 55 ? "text-accent-soft border-accent/40" : value >= 40 ? "text-amber-300 border-amber-400/40" : "text-red-300 border-red-400/40";
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-ink/60 font-display text-base font-bold ${color}`}>
      {value}
    </span>
  );
}
