import type { Lang } from "../lib/i18n";
import { useSearchParams } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CompareBar from "../components/compare/CompareBar";
import AnalyzeExperience from "../features/analyze/AnalyzeExperience";

export interface AnalyzePageProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare: () => void;
  onSearch: () => void;
}

/** Dedicated lazy route: the Analyse module downloads only on /analyze. */
export default function AnalyzePage({ lang, onLangChange, onCompare, onSearch }: AnalyzePageProps) {
  // Prefill from contextual CTAs: /analyze?brand=BMW&model=330i&year=2021
  const [params] = useSearchParams();
  const prefill = {
    brand: (params.get("brand") ?? "").slice(0, 60),
    model: (params.get("model") ?? "").slice(0, 60),
    year: Number(params.get("year")) || null,
  };
  return (
    <div className="min-h-screen bg-ink text-white">
      <Navigation
        lang={lang}
        onLangChange={onLangChange}
        onCompare={onCompare}
        onSearch={onSearch}
      />
      <main>
        <AnalyzeExperience lang={lang} prefill={prefill} />
      </main>
      <Footer lang={lang} onLangChange={onLangChange} onCompare={onCompare} />
      <CompareBar lang={lang} onOpen={onCompare} />
    </div>
  );
}
