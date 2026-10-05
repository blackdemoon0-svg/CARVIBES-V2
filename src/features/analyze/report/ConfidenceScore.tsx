import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisResult } from "../types";
import { ScoreRing, Txt } from "./shared";

export default function ConfidenceScore({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
      <ScoreRing value={result.confidence} size={120} />
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-white">{t(lang, "az_confidence_title")}</h3>
        {result.confidenceLimits.length > 0 && (
          <p className="mt-2 text-sm leading-relaxed text-mist">
            <span className="text-fog">{t(lang, "az_confidence_limits")} </span>
            {result.confidenceLimits.map((l, i) => (
              <span key={i}>
                <Txt lang={lang} text={l} />
                {i < result.confidenceLimits.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
