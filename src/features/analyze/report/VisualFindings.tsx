import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisResult } from "../types";
import { LevelPill, Section, StatusPill, Txt } from "./shared";

export default function VisualFindings({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  return (
    <Section
      id="az-visual"
      index="05"
      title={t(lang, "az_visual_title")}
      sub={t(lang, "az_visual_sub")}
    >
      <ul className="space-y-3">
        {result.visualFindings.map((f) => (
          <li key={f.id} className="rounded-xl border border-line bg-ink/50 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusPill lang={lang} status={f.status} />
              <LevelPill lang={lang} level={f.level} />
              <span className="ml-auto text-[11px] tracking-wide text-fog">
                {f.confidence}% {t(lang, "az_confidence_label")}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              <Txt lang={lang} text={f.title} />
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-mist">
              <Txt lang={lang} text={f.detail} />
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
