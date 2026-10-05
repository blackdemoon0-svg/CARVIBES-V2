import { useState } from "react";
import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisResult } from "../types";
import { Section, Txt } from "./shared";

export default function InspectionChecklist({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <Section
      id="az-checklist"
      index="12"
      title={t(lang, "az_checklist_title")}
      sub={t(lang, "az_checklist_sub")}
    >
      <ul className="space-y-2">
        {result.checklist.map((c, i) => {
          const done = checked.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={done}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all ${
                  done
                    ? "border-emerald-400/30 bg-emerald-400/5 text-mist"
                    : "border-line bg-ink/50 text-white hover:border-white/25"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
                    done ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300" : "border-line text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className={done ? "line-through opacity-70" : ""}>
                  <Txt lang={lang} text={c} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
