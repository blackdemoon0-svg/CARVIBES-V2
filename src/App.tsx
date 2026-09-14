import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { Lang } from "./lib/i18n";
import { detectLang, isRtl, storeLang } from "./lib/i18n";
import { useReveal } from "./lib/useReveal";
import { addToCompare } from "./lib/prefs";
import { cars } from "./lib/db";
import { storyById } from "./lib/stories";
import { usePageMeta } from "./lib/seo";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import DiscoverSection from "./components/DiscoverSection";
import BudgetSection from "./components/BudgetSection";
import FeaturesSection from "./components/FeaturesSection";
import HowToSection from "./components/HowToSection";
import OnboardingTour from "./components/OnboardingTour";
import PopularCarsSection from "./components/PopularCarsSection";
import RankingsSection from "./components/RankingsSection";
import StoriesSection from "./components/stories/StoriesSection";
import FindMyCarSection from "./components/FindMyCarSection";
import CarUniverse from "./components/universe/CarUniverse";
import FavoritesSection from "./components/favorites/FavoritesSection";
import CompareBar from "./components/compare/CompareBar";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import { BootSignal, PageLoader } from "./components/Loader";
import {
  LazyCarDetail,
  LazyCompareModal,
  LazyFindMyCar,
  LazyGlobalSearch,
  LazyStoryDetail,
} from "./components/lazy";
import type { Story } from "./lib/stories";
import type { Car } from "./lib/cars";
import type { ShellProps } from "./pages/RoutePages";

// Secondary routes — one shared async chunk (plus one chunk per heavy
// leaf inside RoutePages), downloaded on demand. Everything above stays
// in the entry chunk so the homepage paints instantly.
const ExplorePage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.ExplorePage })),
);
const UsedCarsRoutePage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.UsedCarsRoutePage })),
);
const NewsPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.NewsPage })),
);
const FavoritesPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.FavoritesPage })),
);
const FindMyCarPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.FindMyCarPage })),
);
const ComparePage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.ComparePage })),
);
const SearchPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.SearchPage })),
);
const CarQuizPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.CarQuizPage })),
);
const BrandsPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.BrandsPage })),
);
const ContactPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.ContactPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("./pages/RoutePages").then((m) => ({ default: m.TermsPage })),
);

export function Homepage({
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
    return <NotFound lang={lang} onHome={() => navigate("/", { replace: true })} />;
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
        <Hero
          lang={lang}
          onFind={() => setFinderOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onBrands={() => navigate("/brands")}
        />
        {/* Quick categories + popular brands live right after the hero, so
            the first screen flows straight into useful browse content. */}
        <DiscoverSection lang={lang} />
        <PopularCarsSection lang={lang} onOpen={openCar} />
        <BudgetSection lang={lang} />
        <RankingsSection lang={lang} onOpen={openCar} />
        <FeaturesSection lang={lang} />
        <StoriesSection lang={lang} onOpen={openStory} compact />
        <FindMyCarSection lang={lang} onStart={() => setFinderOpen(true)} />
        <CarUniverse lang={lang} onOpen={openCar} />
        <FavoritesSection
          lang={lang}
          onOpenCar={openCar}
          onOpenStory={openStory}
          onCompareCar={handleCompareCar}
        />
        <HowToSection lang={lang} />
      </main>
      <Footer
        lang={lang}
        onLangChange={onLangChange}
        onCompare={() => setCompareOpen(true)}
      />

      {/* Floating compare bar + battle modal (lazy: own chunk) */}
      <CompareBar lang={lang} onOpen={() => setCompareOpen(true)} />
      {compareOpen && (
        <Suspense fallback={<PageLoader />}>
          <LazyCompareModal lang={lang} onClose={() => setCompareOpen(false)} />
        </Suspense>
      )}

      {/* Global search (lazy: own chunk) */}
      {searchOpen && (
        <Suspense fallback={<PageLoader />}>
          <LazyGlobalSearch
            lang={lang}
            onClose={() => setSearchOpen(false)}
            onOpenCar={openCar}
            onOpenStory={openStory}
          />
        </Suspense>
      )}

      {finderOpen && (
        <Suspense fallback={<PageLoader />}>
          <LazyFindMyCar
            lang={lang}
            onClose={() => setFinderOpen(false)}
            onOpenCar={openCar}
          />
        </Suspense>
      )}

      {activeStory && (
        <Suspense fallback={<PageLoader />}>
          <LazyStoryDetail
            key={activeStory.id}
            story={activeStory}
            lang={lang}
            onClose={closeDetail}
            onOpenStory={openStory}
            onOpenCar={openCar}
            onCompareCar={handleCompareCar}
          />
        </Suspense>
      )}

      {detailCar && (
        <Suspense fallback={<PageLoader />}>
          <LazyCarDetail
            key={detailCar.id}
            car={detailCar}
            lang={lang}
            onClose={closeDetail}
            onOpen={openCar}
          />
        </Suspense>
      )}

      {/* First-time visitor guided tour (homepage only) */}
      <OnboardingTour lang={lang} />
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
      {/* Secondary routes stream in on demand (see lazy() above). */}
      <Suspense fallback={<PageLoader />}>
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
        <Route path="/used-cars" element={<UsedCarsRoutePage {...shell} />} />
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
        <Route path="/car-quiz" element={<CarQuizPage {...shell} />} />
        <Route path="/brands" element={<BrandsPage {...shell} />} />
        <Route path="/contact" element={<ContactPage {...shell} />} />
        <Route path="/privacy-policy" element={<PrivacyPage {...shell} />} />
        <Route path="/terms" element={<TermsPage {...shell} />} />
        <Route
          path="*"
          element={
            <NotFoundPage lang={lang} />
          }
        />
      </Routes>
      </Suspense>
      {compareOpen && location.pathname !== "/compare" && (
        <Suspense fallback={<PageLoader />}>
          <LazyCompareModal lang={lang} onClose={() => setCompareOpen(false)} />
        </Suspense>
      )}
      {searchOpen && location.pathname !== "/search" && (
        <Suspense fallback={<PageLoader />}>
          <LazyGlobalSearch
            lang={lang}
            onClose={() => setSearchOpen(false)}
            onOpenCar={openCar}
            onOpenStory={openStory}
          />
        </Suspense>
      )}
    </>
  );
}

function NotFoundPage({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  const location = useLocation();
  usePageMeta({ notFound: true, path: location.pathname });
  return <NotFound lang={lang} onHome={() => navigate("/", { replace: true })} />;
}

export default function App() {
  // Visitors land directly on the homepage — there is no blocking language
  // screen. The language resolves instantly from the stored preference, the
  // browser language, or English as the fallback.
  const [lang, setLang] = useState<Lang>(() => detectLang());

  const handleLangChange = useCallback((l: Lang) => {
    storeLang(l);
    setLang(l);
  }, []);

  // Keep the document's text direction in sync (Arabic = RTL) and expose the
  // active language to assistive tech / search engines.
  useEffect(() => {
    const html = document.documentElement;
    const rtl = isRtl(lang);
    html.dir = rtl ? "rtl" : "ltr";
    html.lang = lang;
  }, [lang]);

  return (
    <BrowserRouter>
      {/* Outside every Suspense boundary: retires the static boot splash
          on the very first commit, even while a lazy chunk downloads. */}
      <BootSignal />
      <RoutedApp lang={lang} onLangChange={handleLangChange} />
    </BrowserRouter>
  );
}
