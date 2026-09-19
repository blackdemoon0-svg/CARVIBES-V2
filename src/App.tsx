import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import type { Lang } from "./lib/i18n";
import { detectLang, ensureLocale, isLocaleLoaded, isRtl, storeLang } from "./lib/i18n";
import { useReveal } from "./lib/useReveal";
import { addToCompare } from "./lib/prefs";
import { isShellMetaRoute, usePageMeta } from "./lib/seo";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import FeaturesSection from "./components/FeaturesSection";
import HowToSection from "./components/HowToSection";
import OnboardingTour from "./components/OnboardingTour";
import FindMyCarSection from "./components/FindMyCarSection";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import { BootSignal, PageLoader } from "./components/Loader";
import CompareBar from "./components/compare/CompareBar";
import { Stage } from "./components/Stage";
import {
  LazyBudgetSection,
  LazyCarUniverse,
  LazyCompareModal,
  LazyDiscoverSection,
  LazyFavoritesSection,
  LazyFindMyCar,
  LazyGlobalSearch,
  LazyPopularCarsSection,
  LazyRankingsSection,
  LazyStoriesSection,
} from "./components/lazy";
import type { Story } from "./lib/stories";
import type { Car } from "./lib/cars";
import type { ShellProps } from "./pages/RoutePages";

// Detail routes — each dedicated page (car sheet / story reader) ships
// in its own chunk so the homepage entry stays lean; a direct landing
// on /car/:id or /story/:id downloads exactly one extra chunk instead
// of rendering the whole homepage behind an overlay.
const CarRoutePage = lazy(() => import("./pages/CarDetailPage"));
const StoryRoutePage = lazy(() => import("./pages/StoryDetailPage"));

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

// Marketplace (MarketVibes) — every route is its own chunk: a visitor who
// never opens the marketplace downloads none of it, and the seller funnel
// + admin dashboard (the heaviest parts) live in separate chunks again.
const MarketplacePage = lazy(() => import("./pages/marketplace/MarketplacePage"));
const MarketplaceListingPage = lazy(() => import("./pages/marketplace/MarketplaceListingPage"));
const SellPage = lazy(() => import("./pages/marketplace/SellPage"));
const AdminMarketplacePage = lazy(() => import("./pages/marketplace/AdminMarketplacePage"));

/** Facet routes share one chunk with the marketplace index. */
const MarketplaceFacetPage = lazy(() => import("./pages/marketplace/MarketplaceFacetPage"));

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

  useReveal();

  // --- Navigation helpers ---
  const openCar = useCallback(
    (car: Car) => navigate(`/car/${car.id}`),
    [navigate]
  );
  const openStory = useCallback(
    (story: Story) => navigate(`/story/${story.id}`),
    [navigate]
  );

  // Add a car to compare and open the battle modal.
  const handleCompareCar = useCallback((car: Car) => {
    addToCompare(car.id);
    setCompareOpen(true);
  }, []);

  // --- Homepage SEO metadata (title / canonical / Open Graph) ---
  usePageMeta({ notFound: false, path: location.pathname });

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
            the first screen flows straight into useful browse content.
            Every section below the full-viewport hero is code-split (see
            components/lazy.ts): the car/story datasets stream in AFTER the
            first paint instead of blocking it, one shared lazy chunk.
            Each keeps its own Suspense boundary so sections appear as
            their data arrives, progressively. */}
        {/* Staged mounting (see src/lib/progressive.ts): every section
            below the hero gets its own idle-callback "turn", so the first
            commit stays a small task — the hero photo keeps its CPU while
            it decodes — and the page assembles in seven short paints
            instead of one long one. Stage 0 (Discover) shares the hero
            viewport, so it mounts with the shell. */}
        <Stage order={0}>
          <LazyDiscoverSection lang={lang} />
        </Stage>
        <Stage order={1}>
          <LazyPopularCarsSection lang={lang} onOpen={openCar} />
        </Stage>
        <Stage order={2}>
          <LazyBudgetSection lang={lang} />
        </Stage>
        <Stage order={3}>
          <LazyRankingsSection lang={lang} onOpen={openCar} />
        </Stage>
        <FeaturesSection lang={lang} />
        <Stage order={4}>
          <LazyStoriesSection lang={lang} onOpen={openStory} compact />
        </Stage>
        <FindMyCarSection lang={lang} onStart={() => setFinderOpen(true)} />
        <Stage order={5}>
          <LazyCarUniverse lang={lang} onOpen={openCar} />
        </Stage>
        <Stage order={6}>
          <LazyFavoritesSection
            lang={lang}
            onOpenCar={openCar}
            onOpenStory={openStory}
            onCompareCar={handleCompareCar}
          />
        </Stage>
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

  // Head ownership: the shell writes ROUTE_META only for its own known
  // routes. The homepage, the dedicated car/story pages and the
  // catch-all 404 each call usePageMeta themselves — if the shell ran
  // here too, its indexable meta would race (and win) against the 404's
  // noindex + removed canonical on unknown URLs.
  usePageMeta({
    notFound: false,
    path: location.pathname,
    skip: !isShellMetaRoute(location.pathname),
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
          element={<CarRoutePage lang={lang} onLangChange={onLangChange} />}
        />
        <Route
          path="/story/:id"
          element={<StoryRoutePage lang={lang} onLangChange={onLangChange} />}
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
        {/* MarketVibes — public marketplace */}
        <Route path="/marketplace" element={<MarketplacePage lang={lang} />} />
        <Route
          path="/marketplace/brand/:brand"
          element={<MarketplaceFacetPage lang={lang} kind="brand" />}
        />
        <Route
          path="/marketplace/country/:country"
          element={<MarketplaceFacetPage lang={lang} kind="country" />}
        />
        <Route
          path="/marketplace/condition/:condition"
          element={<MarketplaceFacetPage lang={lang} kind="condition" />}
        />
        <Route path="/marketplace/sell" element={<SellPage lang={lang} />} />
        <Route path="/marketplace/car/:slug" element={<MarketplaceListingPage lang={lang} />} />
        {/* Private moderation dashboard (server-authorized) */}
        <Route path="/admin/marketplace" element={<AdminMarketplacePage lang={lang} />} />
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

  // Only the English dictionary ships inside the entry bundle; the
  // detected language is one tiny chunk away (src/lib/i18n → ensureLocale).
  // Until it is registered we keep showing the branded full-screen loader
  // instead of painting English text that would immediately swap — the boot
  // splash already covers this instant, so the visitor never sees a flash.
  const [localeReady, setLocaleReady] = useState<boolean>(() =>
    isLocaleLoaded(lang)
  );
  useEffect(() => {
    if (isLocaleLoaded(lang)) {
      setLocaleReady(true);
      return;
    }
    let live = true;
    void ensureLocale(lang).then(() => {
      if (live) setLocaleReady(true);
    });
    return () => {
      live = false;
    };
  }, [lang]);

  const handleLangChange = useCallback((l: Lang) => {
    storeLang(l);
    if (isLocaleLoaded(l)) {
      setLang(l);
      return;
    }
    // Swap the visible language only once its dictionary has arrived —
    // selecting a new language never renders half-translated UI.
    void ensureLocale(l).then(() => setLang(l));
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
      {localeReady ? (
        <RoutedApp lang={lang} onLangChange={handleLangChange} />
      ) : (
        <PageLoader />
      )}
    </BrowserRouter>
  );
}
