import { t, type Lang } from "../../../lib/i18n";
import { convertCurrency, formatMoney } from "../currency";
import type { AnalysisRequest, AnalysisResult, PricePosition } from "../types";
import CurrencyDisplay, { CurrencyRange } from "../components/CurrencyDisplay";
import { ScoreBar, Section, Txt } from "./shared";

const POSITION_META: Record<PricePosition, { icon: string; text: string }> = {
  GREAT_DEAL: { icon: "🟢", text: "text-emerald-300" },
  FAIR: { icon: "🟡", text: "text-accent-soft" },
  OVERPRICED: { icon: "🟠", text: "text-orange-300" },
  STRONGLY_OVERPRICED: { icon: "🔴", text: "text-red-300" },
  UNKNOWN: { icon: "⚪", text: "text-fog" },
};

export default function PriceEstimate({
  lang,
  request,
  result,
}: {
  lang: Lang;
  request: AnalysisRequest;
  result: AnalysisResult;
}) {
  const p = result.priceEstimate;
  const meta = POSITION_META[p.position];
  // Secondary conversion target: destination currency when importing.
  const secondary =
    request.destinationCountry !== request.vehicleCountry
      ? result.importEstimate.destinationCurrency
      : undefined;

  const midSecondary =
    secondary && p.estimatedLow != null && p.estimatedHigh != null
      ? convertCurrency((p.estimatedLow + p.estimatedHigh) / 2, p.currency, secondary)
      : null;

  return (
    <Section
      id="az-price"
      index="03"
      title={t(lang, "az_price_title")}
      sub={p.indicative ? t(lang, "az_indicative_note") : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-ink/50 p-4">
          <p className="text-[11px] font-semibold tracking-mega text-fog">
            {t(lang, "az_estimated_value").toUpperCase()}
          </p>
          <p className="mt-1.5 font-display text-xl font-bold text-white">
            <CurrencyRange low={p.estimatedLow} high={p.estimatedHigh} currency={p.currency} />
          </p>
          <div className="mt-2">
            <ScoreBar value={p.confidence} />
          </div>
        </div>
        <div className="rounded-xl border border-line bg-ink/50 p-4">
          <p className="text-[11px] font-semibold tracking-mega text-fog">
            {t(lang, "az_asking_price").toUpperCase()}
          </p>
          <p className="mt-1.5 font-display text-xl font-bold text-white">
            {p.askingPrice != null ? (
              <CurrencyDisplay amount={p.askingPrice} currency={p.currency} />
            ) : (
              <span className="text-fog">—</span>
            )}
          </p>
          <p className={`mt-2 text-sm font-semibold ${meta.text}`}>
            <span aria-hidden className="mr-1.5">{meta.icon}</span>
            {t(lang, `az_position_${p.position}`)}
          </p>
        </div>
        <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
          <p className="text-[11px] font-semibold tracking-mega text-fog">
            {t(lang, "az_negotiate_band").toUpperCase()}
          </p>
          <p className="mt-1.5 font-display text-xl font-bold text-accent-soft">
            {p.negotiateLow != null && p.negotiateHigh != null ? (
              <>
                {formatMoney(p.negotiateLow, p.currency)} – {formatMoney(p.negotiateHigh, p.currency)}
              </>
            ) : (
              <span className="text-fog">—</span>
            )}
          </p>
          {midSecondary != null && secondary && (
            <p className="mt-2 text-xs text-mist">
              {t(lang, "az_price_secondary", { amount: formatMoney(Math.round(midSecondary), secondary) })}
            </p>
          )}
        </div>
      </div>
      {p.factors.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {p.factors.map((f, i) => (
            <li
              key={i}
              className="rounded-full border border-line bg-ink/50 px-3 py-1 text-xs text-mist"
            >
              <Txt lang={lang} text={f} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
