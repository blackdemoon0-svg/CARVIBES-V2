import { useCallback, useState } from "react";
import type { Lang } from "./lib/i18n";
import { getStoredLang, storeLang } from "./lib/i18n";
import { useReveal } from "./lib/useReveal";
import { addToCompare } from "./lib/prefs";
import LanguageScreen from "./components/LanguageScreen";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import DiscoverSection from "./components/DiscoverSection";
import StoriesSection from "./components/stories/StoriesSection";
import StoryDetail from "./components/stories/StoryDetail";
import FindMyCarSection from "./components/FindMyCarSection";
import CarUniverse from "./components/universe/CarUniverse";
import CarDetail from "./components/universe/CarDetail";
import DailySection from "./components/DailySection";
import FavoritesSection from "./components/favorites/FavoritesSection";
import CompareBar from "./components/compare/CompareBar";
import CompareModal from "./components/compare/CompareModal";
import GlobalSearch from "./components/GlobalSearch";
import Footer from "./components/Footer";
import FindMyCar from "./components/findmycar/FindMyCar";
import type { Story } from "./lib/stories";
import type { Car } from "./lib/cars";

function Homepage({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  useReveal();
  const [finderOpen, setFinderOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [detailCar, setDetailCar] = useState<Car | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Add a car to compare and open the battle modal.
  const handleCompareCar = useCallback((car: Car) => {
    addToCompare(car.id);
    setCompareOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navigation
        lang={lang}
        onLangChange={onLangChange}
        onCompare={() => setCompareOpen(true)}
        onSearch={() => setSearchOpen(true)}
      />
      <main>
        <Hero lang={lang} onFind={() => setFinderOpen(true)} />
        <DiscoverSection lang={lang} />
        <StoriesSection lang={lang} onOpen={setActiveStory} />
        <FindMyCarSection lang={lang} onStart={() => setFinderOpen(true)} />
        <CarUniverse lang={lang} />
        <DailySection lang={lang} />
        <FavoritesSection
          lang={lang}
          onOpenCar={setDetailCar}
          onOpenStory={setActiveStory}
          onCompareCar={handleCompareCar}
        />
      </main>
      <Footer
        lang={lang}
        onLangChange={onLangChange}
        onCompare={() => setCompareOpen(true)}
      />

      {/* Floating compare bar + battle modal */}
      <CompareBar lang={lang} onOpen={() => setCompareOpen(true)} />
      {compareOpen && (
        <CompareModal lang={lang} onClose={() => setCompareOpen(false)} />
      )}

      {/* Global search */}
      {searchOpen && (
        <GlobalSearch
          lang={lang}
          onClose={() => setSearchOpen(false)}
          onOpenCar={setDetailCar}
          onOpenStory={setActiveStory}
        />
      )}

      {finderOpen && (
        <FindMyCar lang={lang} onClose={() => setFinderOpen(false)} />
      )}

      {activeStory && (
        <StoryDetail
          key={activeStory.id}
          story={activeStory}
          lang={lang}
          onClose={() => setActiveStory(null)}
          onOpenStory={setActiveStory}
          onOpenCar={setDetailCar}
          onCompareCar={handleCompareCar}
        />
      )}

      {detailCar && (
        <CarDetail
          key={detailCar.id}
          car={detailCar}
          lang={lang}
          onClose={() => setDetailCar(null)}
          onOpen={setDetailCar}
        />
      )}
    </div>
  );
}

export default function App() {
  // Initialize synchronously to avoid a language-screen flash on returning visits.
  const [lang, setLang] = useState<Lang | null>(() => getStoredLang());

  const handleSelect = useCallback((l: Lang) => {
    storeLang(l);
    setLang(l);
  }, []);

  const handleLangChange = useCallback((l: Lang) => {
    storeLang(l);
    setLang(l);
  }, []);

  // First visit — show language selection.
  if (lang === null) {
    return <LanguageScreen onSelect={handleSelect} />;
  }

  return <Homepage lang={lang} onLangChange={handleLangChange} />;
}
