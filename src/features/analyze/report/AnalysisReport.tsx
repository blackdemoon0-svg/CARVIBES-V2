import { t, type Lang } from "../../../lib/i18n";
import { analyzeCountry, countryName } from "../countries";
import type { AnalysisRequest, AnalysisResult } from "../types";
import CarVibesVerdict from "./CarVibesVerdict";
import ConfidenceScore from "./ConfidenceScore";
import VisualFindings from "./VisualFindings";
import MechanicalRisks from "./MechanicalRisks";
import PriceEstimate from "./PriceEstimate";
import ImportCostEstimate from "./ImportCostEstimate";
import InconsistencyPanel, { RedFlags } from "./InconsistencyPanel";
import SellerQuestions from "./SellerQuestions";
import InspectionChecklist from "./InspectionChecklist";
import { Section, Txt } from "./shared";

interface Props {
  lang: Lang;
  request: AnalysisRequest;
  result: AnalysisResult;
  onNew: () => void;
  onEdit: () => void;
}

export default function AnalysisReport({ lang, request, result, onNew, onEdit }: Props) {
  const v = request.vehicle;
  const title = `${v.brand} ${v.model} ${v.version}`.trim();
  const date = new Date(result.createdAt).toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const historyRows: { label: string; value: string; ok: boolean }[] = [
    { label: t(lang, "az_f_vin"), value: v.vin.trim() || t(lang, "az_review_not_provided"), ok: !!v.vin.trim() },
    { label: t(lang, "az_f_maintenance"), value: v.maintenance.trim() || t(lang, "az_review_not_provided"), ok: !!v.maintenance.trim() },
    { label: t(lang, "az_f_inspection"), value: v.inspection.trim() || t(lang, "az_review_not_provided"), ok: !!v.inspection.trim() },
    { label: t(lang, "az_f_owners"), value: v.owners.trim() || t(lang, "az_review_not_provided"), ok: !!v.owners.trim() },
    {
      label: t(lang, "az_photos_doc"),
      value: t(lang, "az_photo_count", {
        count: request.photos.filter((p) => p.category.startsWith("doc_")).length,
      }),
      ok: request.photos.some((p) => p.category.startsWith("doc_")),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Report header */}
      <div className="az-glass az-rise rounded-2xl p-5 sm:p-7">
        <p className="mb-1.5 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
          <span className="h-px w-8 bg-accent" />
          {t(lang, "az_report_title").toUpperCase()} · {date}
        </p>
        <h2 className="font-display text-2xl font-bold text-white sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-mist">
          {v.year ?? "—"} · {analyzeCountry(request.vehicleCountry).flag}{" "}
          {countryName(request.vehicleCountry, lang)}
          {request.vehicleRegion ? ` (${request.vehicleRegion})` : ""} {t(lang, "az_review_to")}{" "}
          {analyzeCountry(request.destinationCountry).flag} {countryName(request.destinationCountry, lang)}
        </p>
        <p className="mt-1 text-xs text-fog">{t(lang, "az_report_sub")}</p>
        <div className="az-no-print mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button type="button" onClick={onNew} className="az-btn-primary !py-2.5">
            ＋ {t(lang, "az_new_analysis")}
          </button>
          <button type="button" onClick={onEdit} className="az-btn-ghost !py-2.5">
            {t(lang, "az_back_to_form")}
          </button>
          <button type="button" onClick={() => window.print()} className="az-btn-ghost !py-2.5">
            🖨 {t(lang, "az_print")}
          </button>
        </div>
      </div>

      {/* 01–02 Verdict + scores */}
      <CarVibesVerdict lang={lang} result={result} />

      {/* 03 Price */}
      <PriceEstimate lang={lang} request={request} result={result} />

      {/* 04 Risks overview */}
      <Section id="az-risks" index="04" title={t(lang, "az_watchouts")}>
        <RedFlags lang={lang} result={result} />
        {result.watchouts.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {result.watchouts.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-mist">
                <span className="text-amber-300" aria-hidden>⚠</span>
                <Txt lang={lang} text={w} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 05 Visual */}
      <VisualFindings lang={lang} result={result} />

      {/* 06 Mechanical */}
      <MechanicalRisks lang={lang} result={result} currency={result.priceEstimate.currency} />

      {/* 07 History + listing */}
      <Section id="az-history" index="07" title={t(lang, "az_listing_title")}>
        <div className="mb-5 overflow-hidden rounded-xl border border-line">
          {historyRows.map((r, i) => (
            <div
              key={i}
              className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${
                i % 2 === 0 ? "bg-ink/60" : "bg-ink/30"
              }`}
            >
              <span className="shrink-0 text-fog">{r.label}</span>
              <span className={`text-right ${r.ok ? "text-white" : "text-fog"}`}>
                {r.ok ? "✓ " : ""}
                {r.value.length > 90 ? `${r.value.slice(0, 90)}…` : r.value}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ListingCol title={t(lang, "az_claims")} items={result.listing.claims} lang={lang} icon="💬" />
          <ListingCol title={t(lang, "az_verifiable")} items={result.listing.verifiable} lang={lang} icon="✓" />
          <ListingCol title={t(lang, "az_unknown_list")} items={result.listing.unknown} lang={lang} icon="?" />
        </div>
        {result.listing.missingInfo.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-semibold tracking-mega text-fog">
              {t(lang, "az_missing_info").toUpperCase()}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {result.listing.missingInfo.map((m, i) => (
                <li key={i} className="rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-1 text-xs text-amber-200/90">
                  <Txt lang={lang} text={m} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* 08 Inconsistencies */}
      <InconsistencyPanel lang={lang} result={result} />

      {/* 09–10 Import + total */}
      <ImportCostEstimate lang={lang} result={result} />

      {/* 11 Questions */}
      <SellerQuestions lang={lang} result={result} />

      {/* 12 Checklist */}
      <InspectionChecklist lang={lang} result={result} />

      {/* 13 Limits + confidence */}
      <Section id="az-limits" index="13" title={t(lang, "az_limits_title")}>
        <ConfidenceScore lang={lang} result={result} />
        <ul className="mt-5 space-y-2 border-t border-line pt-5">
          {result.limitations.map((l, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-fog">
              <span aria-hidden className="shrink-0">·</span>
              <Txt lang={lang} text={l} />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function ListingCol({
  title,
  items,
  lang,
  icon,
}: {
  title: string;
  items: { key: string; params?: Record<string, string | number> }[];
  lang: Lang;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-ink/50 p-4">
      <h3 className="mb-2.5 text-[11px] font-semibold tracking-mega text-fog">{title.toUpperCase()}</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-fog">—</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-mist">
              <span aria-hidden className="shrink-0 text-accent-soft">{icon}</span>
              <Txt lang={lang} text={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
