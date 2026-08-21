import { useCallback, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { Lang } from "./lib/i18n";
import { getStoredLang, storeLang } from "./lib/i18n";
import { useReveal } from "./lib/useReveal";
import { addToCompare } from "./lib/prefs";
import { cars } from "./lib/db";
import { storyById } from "./lib/stories";
import { usePageMeta } from "./lib/seo";
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
import NotFound from "./components/NotFound";
import type { Story } from "./lib/stories";
import type { Car } from "./lib/cars";
import {
  BrandsPage,
  ComparePage,
  ContactPage,
  ExplorePage,
  FavoritesPage,
  FindMyCarPage,
  NewsPage,
  PrivacyPage,
  SearchPage,
  TermsPage,
  type ShellProps,
} from "./pages/RoutePages";

function Homepage({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [finderOpen, setFinderOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // --- The URL is the single source of truth for detail overlays. ---
  // This keeps the V2 modal design intact while making every car and
  // story deep-linkable (and refresh-safe via the Vercel SPA rewrite).
  const path = location.pathname;
  const carMatch = path.match(/^\/car\/([^/]+)\/?$/);
  const storyMatch = path.match(/^\/story\/([^/]+)\/?$/);
  const carId = carMatch ? carMatch[1] : undefined;
  const storyId = storyMatch ? storyMatch[1] : undefined;

  const detailCar = carId ? cars.find((c) => c.id === carId) : undefined;
  const activeStory = storyId ? storyById(storyId) : undefined;

  const notFound =
    (carId !== undefined && detailCar === undefined) ||
    (storyId !== undefined && activeStory === undefined);

  // Reveal-on-scroll must re-run when we swap the 404 screen back to the
  // homepage (the `.reveal` elements are freshly mounted in that case).
  useReveal(notFound);

  // --- Navigation helpers ---
  const openCar = useCallback(
    (car: Car) => navigate(`/car/${car.id}`),
    [navigate]
  );
  const openStory = useCallback(
    (story: Story) => navigate(`/story/${story.id}`),
    [navigate]
  );
  const closeDetail = useCallback(() => {
    // Go back when there is in-app history; otherwise return home.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/", { replace: true });
  }, [navigate]);

  // Add a car to compare and open the battle modal.
  const handleCompareCar = useCallback((car: Car) => {
    addToCompare(car.id);
    setCompareOpen(true);
  }, []);

  // --- Per-route SEO metadata (title / canonical / Open Graph) ---
  usePageMeta({ car: detailCar, story: activeStory, notFound, path });

  if (notFound) {
    return <NotFound onHome={() => navigate("/", { replace: true })} />;
  }

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
        <StoriesSection lang={lang} onOpen={openStory} />
        <FindMyCarSection lang={lang} onStart={() => setFinderOpen(true)} />
        <CarUniverse lang={lang} onOpen={openCar} />
        <DailySection lang={lang} />
        <FavoritesSection
          lang={lang}
          onOpenCar={openCar}
          onOpenStory={openStory}
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
          onOpenCar={openCar}
          onOpenStory={openStory}
        />
      )}

      {finderOpen && (
        <FindMyCar
          lang={lang}
          onClose={() => setFinderOpen(false)}
          onOpenCar={openCar}
        />
      )}

      {activeStory && (
        <StoryDetail
          key={activeStory.id}
          story={activeStory}
          lang={lang}
          onClose={closeDetail}
          onOpenStory={openStory}
          onOpenCar={openCar}
          onCompareCar={handleCompareCar}
        />
      )}

      {detailCar && (
        <CarDetail
          key={detailCar.id}
          car={detailCar}
          lang={lang}
          onClose={closeDetail}
          onOpen={openCar}
        />
      )}
    </div>
  );
}

function RoutedApp({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [compareOpen, setCompareOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openCar = useCallback(
    (car: Car) => navigate(`/car/${car.id}`),
    [navigate]
  );
  const openStory = useCallback(
    (story: Story) => navigate(`/story/${story.id}`),
    [navigate]
  );
  const handleCompareCar = useCallback((car: Car) => {
    addToCompare(car.id);
    navigate("/compare");
  }, [navigate]);

  const shell: ShellProps = {
    lang,
    onLangChange,
    onCompare: () => setCompareOpen(true),
    onSearch: () => setSearchOpen(true),
    onOpenCar: openCar,
    onOpenStory: openStory,
    onCompareCar: handleCompareCar,
  };

  const isHomeFamily =
    location.pathname === "/" ||
    location.pathname.startsWith("/car/") ||
    location.pathname.startsWith("/story/");
  usePageMeta({
    notFound: false,
    path: location.pathname,
    skip: isHomeFamily,
  });

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Homepage lang={lang} onLangChange={onLangChange} />}
        />
        <Route
          path="/car/:id"
          element={<Homepage lang={lang} onLangChange={onLangChange} />}
        />
        <Route
          path="/story/:id"
          element={<Homepage lang={lang} onLangChange={onLangChange} />}
        />
        <Route path="/explore" element={<ExplorePage {...shell} />} />
        <Route path="/news" element={<NewsPage {...shell} />} />
        <Route path="/favorites" element={<FavoritesPage {...shell} />} />
        <Route
          path="/find-my-car"
          element={<FindMyCarPage lang={lang} onOpenCar={openCar} />}
        />
        <Route path="/compare" element={<ComparePage lang={lang} />} />
        <Route
          path="/search"
          element={
            <SearchPage
              lang={lang}
              onOpenCar={openCar}
              onOpenStory={openStory}
            />
          }
        />
        <Route path="/brands" element={<BrandsPage {...shell} />} />
        <Route path="/contact" element={<ContactPage {...shell} />} />
        <Route path="/privacy-policy" element={<PrivacyPage {...shell} />} />
        <Route path="/terms" element={<TermsPage {...shell} />} />
        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />
      </Routes>
      {compareOpen && location.pathname !== "/compare" && (
        <CompareModal lang={lang} onClose={() => setCompareOpen(false)} />
      )}
      {searchOpen && location.pathname !== "/search" && (
        <GlobalSearch
          lang={lang}
          onClose={() => setSearchOpen(false)}
          onOpenCar={openCar}
          onOpenStory={openStory}
        />
      )}
    </>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  usePageMeta({ notFound: true, path: location.pathname });
  return <NotFound onHome={() => navigate("/", { replace: true })} />;
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

  return (
    <BrowserRouter>
      {lang === null ? (
        <LanguageScreen onSelect={handleSelect} />
      ) : (
        <RoutedApp lang={lang} onLangChange={handleLangChange} />
      )}
    </BrowserRouter>
  );
}
