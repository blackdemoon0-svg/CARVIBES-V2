import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisResult } from "../types";
import { LevelPill, Section, StatusPill, Txt } from "./shared";

/** Red flags: critical + high findings across visual, mechanical and consistency. */
export function RedFlags({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  const flags = [
    ...result.visualFindings
      .filter((f) => f.status === "OBSERVED" && (f.level === "HIGH" || f.level === "CRITICAL"))
      .map((f) => ({ id: f.id, level: f.level, title: f.title, detail: f.detail })),
    ...result.mechanicalRisks
      .filter((r) => r.level === "HIGH")
      .map((r) => ({ id: r.id, level: r.level, title: r.title, detail: r.reason })),
    ...result.inconsistencies
      .filter((i) => i.level === "HIGH" || i.level === "MEDIUM")
      .map((i) => ({ id: i.id, level: i.level, title: i.title, detail: i.detail })),
  ];
  if (flags.length === 0) return null;
  return (
    <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-4">
      <ul className="space-y-2.5">
        {flags.map((f) => (
          <li key={f.id} className="flex gap-2.5 text-sm">
            <span aria-hidden className="mt-0.5 shrink-0">🚩</span>
            <span className="leading-relaxed text-mist">
              <span className="font-semibold text-white"><Txt lang={lang} text={f.title} /></span>
              {" — "}
              <Txt lang={lang} text={f.detail} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InconsistencyPanel({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  return (
    <Section
      id="az-inconsistencies"
      index="08"
      title={t(lang, "az_inc_title")}
      sub={t(lang, "az_inc_sub")}
    >
      {result.inconsistencies.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-mist">
          <span className="text-emerald-300" aria-hidden>✓</span>
          {t(lang, "az_inc_none")}
        </p>
      ) : (
        <ul className="space-y-3">
          {result.inconsistencies.map((inc) => (
            <li key={inc.id} className="rounded-xl border border-line bg-ink/50 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span aria-hidden>⚠️</span>
                <LevelPill lang={lang} level={inc.level} />
                <StatusPill lang={lang} status={inc.status} />
              </div>
              <p className="text-sm font-semibold text-white">
                <Txt lang={lang} text={inc.title} />
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-mist">
                <Txt lang={lang} text={inc.detail} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
