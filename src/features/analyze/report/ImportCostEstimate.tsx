import { t, type Lang } from "../../../lib/i18n";
import { formatMoney } from "../currency";
import type { AnalysisResult } from "../types";
import { Section, Txt } from "./shared";

export default function ImportCostEstimate({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  const imp = result.importEstimate;
  return (
    <Section
      id="az-import"
      index="09"
      title={t(lang, "az_import_title")}
      sub={imp.needed ? t(lang, "az_import_sub") : undefined}
    >
      {!imp.needed ? (
        <p className="text-sm leading-relaxed text-mist">{t(lang, "az_import_local")}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <tbody>
                {imp.lines.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 last:border-0">
                    <td className="py-3 pr-3 text-mist">
                      <Txt lang={lang} text={l.label} />
                      {!l.verified && l.low == null && (
                        <span className="mt-1 block text-xs leading-relaxed text-amber-200/80">
                          {t(lang, "az_import_duties_detail")}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 text-right font-semibold text-white">
                      {l.low != null && l.high != null ? (
                        l.low === l.high ? (
                          formatMoney(l.low, imp.vehicleCurrency)
                        ) : (
                          `${formatMoney(Math.round(l.low), imp.vehicleCurrency)} – ${formatMoney(Math.round(l.high), imp.vehicleCurrency)}`
                        )
                      ) : (
                        <span className="font-normal text-fog">{t(lang, "az_import_na")}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-4 text-right text-[13px] text-fog">
                      {l.destLow != null && l.destHigh != null ? (
                        l.destLow === l.destHigh ? (
                          formatMoney(l.destLow, imp.destinationCurrency)
                        ) : (
                          `${formatMoney(Math.round(l.destLow), imp.destinationCurrency)} – ${formatMoney(Math.round(l.destHigh), imp.destinationCurrency)}`
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 pr-3">
                    <span className="font-display font-bold text-white">{t(lang, "az_import_total")}</span>
                    <span className="block text-xs text-fog">{t(lang, "az_import_excl_duties")}</span>
                  </td>
                  <td className="whitespace-nowrap py-3 text-right font-display text-base font-bold text-accent-soft">
                    {imp.totalLow != null && imp.totalHigh != null
                      ? `≈ ${formatMoney(Math.round(imp.totalLow), imp.vehicleCurrency)} – ${formatMoney(Math.round(imp.totalHigh), imp.vehicleCurrency)}`
                      : t(lang, "az_import_na")}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-4 text-right font-display text-base font-bold text-accent-soft">
                    {imp.destTotalLow != null && imp.destTotalHigh != null
                      ? `≈ ${formatMoney(Math.round(imp.destTotalLow), imp.destinationCurrency)} – ${formatMoney(Math.round(imp.destTotalHigh), imp.destinationCurrency)}`
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-fog">
            <Txt lang={lang} text={imp.rateNote} />
          </p>
        </>
      )}
    </Section>
  );
}
