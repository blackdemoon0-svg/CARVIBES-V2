import { t, type Lang } from "../../../lib/i18n";
import { formatMoney } from "../currency";
import type { AnalysisResult } from "../types";
import { LevelPill, Section, Txt } from "./shared";

export default function MechanicalRisks({
  lang,
  result,
  currency,
}: {
  lang: Lang;
  result: AnalysisResult;
  currency: string;
}) {
  return (
    <Section
      id="az-mechanical"
      index="06"
      title={t(lang, "az_mech_title")}
      sub={t(lang, "az_mech_sub")}
    >
      {result.mechanicalRisks.length === 0 ? (
        <p className="text-sm text-mist">{t(lang, "az_mech_none")}</p>
      ) : (
        <ul className="space-y-3">
          {result.mechanicalRisks.map((r) => (
            <li key={r.id} className="rounded-xl border border-line bg-ink/50 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <LevelPill lang={lang} level={r.level} />
                <span className="ml-auto text-[11px] tracking-wide text-fog">
                  {r.confidence}% {t(lang, "az_confidence_label")}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                <Txt lang={lang} text={r.title} />
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-mist">
                <Txt lang={lang} text={r.reason} />
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">
                <span className="font-semibold text-accent-soft">{t(lang, "az_check_label")}: </span>
                <Txt lang={lang} text={r.check} />
              </p>
              <p className="mt-2 text-xs text-fog">
                {t(lang, "az_cost_range")}:{" "}
                {r.costLow != null && r.costHigh != null ? (
                  <span className="font-semibold text-mist">
                    {formatMoney(Math.round(r.costLow), currency)} – {formatMoney(Math.round(r.costHigh), currency)}
                  </span>
                ) : (
                  t(lang, "az_cost_unknown")
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
