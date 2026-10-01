import type { Lang } from "../lib/i18n";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CompareBar from "../components/compare/CompareBar";
import AdvisorExperience from "../features/advisor/AdvisorExperience";

export interface AdvisorPageProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare: () => void;
  onSearch: () => void;
}

/** Dedicated lazy route: keeps Advisor UI and the car catalogue off the home entry chunk. */
export default function AdvisorPage({ lang, onLangChange, onCompare, onSearch }: AdvisorPageProps) {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Navigation
        lang={lang}
        onLangChange={onLangChange}
        onCompare={onCompare}
        onSearch={onSearch}
      />
      <main>
        <AdvisorExperience lang={lang} />
      </main>
      <Footer lang={lang} onLangChange={onLangChange} onCompare={onCompare} />
      <CompareBar lang={lang} onOpen={onCompare} />
    </div>
  );
}
