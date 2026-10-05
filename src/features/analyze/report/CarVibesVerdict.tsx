import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisResult, VerdictKind } from "../types";
import { ScoreBar, ScoreRing, Section, Txt } from "./shared";

const VERDICT_META: Record<VerdictKind, { icon: string; ring: string; text: string; border: string }> = {
  GREAT: { icon: "🟢", ring: "az-verdict-great", text: "text-emerald-300", border: "border-emerald-400/30" },
  STUDY: { icon: "🟡", ring: "az-verdict-study", text: "text-accent-soft", border: "border-accent/30" },
  NEGOTIATE: { icon: "🟠", ring: "az-verdict-negotiate", text: "text-orange-300", border: "border-orange-400/30" },
  AVOID: { icon: "🔴", ring: "az-verdict-avoid", text: "text-red-300", border: "border-red-400/30" },
};

const SUB_KEYS = [
  "reliability",
  "visual",
  "mechanicalRisk",
  "price",
  "history",
  "valueForMoney",
  "totalCost",
  "usageFit",
] as const;

export default function CarVibesVerdict({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  const meta = VERDICT_META[result.verdict];
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <Section id="az-verdict" index="01" title={t(lang, "az_verdict_title")} className={`${meta.ring} !border ${meta.border}`}>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <ScoreRing value={result.overallScore} />
          <div className="min-w-0">
            <p className={`font-display text-2xl font-bold sm:text-3xl ${meta.text}`}>
              <span aria-hidden className="mr-2">{meta.icon}</span>
              {t(lang, `az_verdict_${result.verdict}`)}
            </p>
            <div className="mt-3 space-y-2">
              {result.verdictWhy.map((w, i) => (
                <p key={i} className="text-sm leading-relaxed text-mist">
                  <Txt lang={lang} text={w} />
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="az-scores" index="02" title={t(lang, "az_score_title")}>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {SUB_KEYS.map((k) => (
            <div key={k} className="flex items-center justify-between gap-3 border-b border-line/60 pb-2.5">
              <dt className="text-[13px] text-mist">{t(lang, `az_sub_${k}`)}</dt>
              <dd><ScoreBar value={result.subScores[k]} /></dd>
            </div>
          ))}
        </dl>
        {(result.strengths.length > 0 || result.watchouts.length > 0) && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {result.strengths.length > 0 && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold tracking-mega text-emerald-300/90">
                  {t(lang, "az_strengths").toUpperCase()}
                </h3>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-mist">
                      <span className="text-emerald-300" aria-hidden>＋</span>
                      <Txt lang={lang} text={s} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.watchouts.length > 0 && (
              <div>
                <h3 className="mb-2 text-[11px] font-semibold tracking-mega text-amber-300/90">
                  {t(lang, "az_watchouts").toUpperCase()}
                </h3>
                <ul className="space-y-1.5">
                  {result.watchouts.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-mist">
                      <span className="text-amber-300" aria-hidden>⚠</span>
                      <Txt lang={lang} text={s} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
