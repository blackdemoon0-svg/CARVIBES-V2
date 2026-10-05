import { useState } from "react";
import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisResult } from "../types";
import { Section, Txt } from "./shared";

export default function SellerQuestions({ lang, result }: { lang: Lang; result: AnalysisResult }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = result.sellerQuestions
      .map((q, i) => `${i + 1}. ${t(lang, q.key, q.params)}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable — select fallback.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Section
      id="az-questions"
      index="11"
      title={t(lang, "az_questions_title")}
      sub={t(lang, "az_questions_sub")}
    >
      <ol className="space-y-2.5">
        {result.sellerQuestions.map((q, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-line bg-ink/50 p-3.5 text-sm leading-relaxed text-mist">
            <span className="az-step-dot !h-6 !w-6 shrink-0 !text-[10px]" data-state="active" aria-hidden>
              {i + 1}
            </span>
            <Txt lang={lang} text={q} />
          </li>
        ))}
      </ol>
      <button type="button" onClick={copy} className="az-btn-ghost az-no-print mt-4">
        {copied ? `✓ ${t(lang, "az_copied")}` : `⧉ ${t(lang, "az_copy_questions")}`}
      </button>
    </Section>
  );
}
