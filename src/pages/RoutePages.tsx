import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { t, type Lang } from "../lib/i18n";
import { cars, allBrands } from "../lib/db";
import type { Car } from "../lib/cars";
import type { Story } from "../lib/stories";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import CarUniverse from "../components/universe/CarUniverse";
import StoriesSection from "../components/stories/StoriesSection";
import FavoritesSection from "../components/favorites/FavoritesSection";
import FindMyCar from "../components/findmycar/FindMyCar";
import CompareModal from "../components/compare/CompareModal";
import GlobalSearch from "../components/GlobalSearch";
import CompareBar from "../components/compare/CompareBar";

export interface ShellProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onCompare: () => void;
  onSearch: () => void;
  onOpenCar: (car: Car) => void;
  onOpenStory: (story: Story) => void;
  onCompareCar: (car: Car) => void;
}

function Chrome({
  lang,
  onLangChange,
  onCompare,
  onSearch,
  children,
}: ShellProps & { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Navigation
        lang={lang}
        onLangChange={onLangChange}
        onCompare={onCompare}
        onSearch={onSearch}
      />
      <main>{children}</main>
      <Footer lang={lang} onLangChange={onLangChange} onCompare={onCompare} />
      <CompareBar lang={lang} onOpen={onCompare} />
    </div>
  );
}

export function ExplorePage(props: ShellProps) {
  return (
    <Chrome {...props}>
      <CarUniverse lang={props.lang} onOpen={props.onOpenCar} />
    </Chrome>
  );
}

export function NewsPage(props: ShellProps) {
  return (
    <Chrome {...props}>
      <StoriesSection lang={props.lang} onOpen={props.onOpenStory} />
    </Chrome>
  );
}

export function FavoritesPage(props: ShellProps) {
  return (
    <Chrome {...props}>
      <FavoritesSection
        lang={props.lang}
        onOpenCar={props.onOpenCar}
        onOpenStory={props.onOpenStory}
        onCompareCar={props.onCompareCar}
      />
    </Chrome>
  );
}

export function FindMyCarPage({
  lang,
  onOpenCar,
}: {
  lang: Lang;
  onOpenCar: (car: Car) => void;
}) {
  const navigate = useNavigate();
  return (
    <FindMyCar lang={lang} onClose={() => navigate("/")} onOpenCar={onOpenCar} />
  );
}

export function ComparePage({ lang }: { lang: Lang }) {
  const navigate = useNavigate();
  return <CompareModal lang={lang} onClose={() => navigate("/")} />;
}

export function SearchPage({
  lang,
  onOpenCar,
  onOpenStory,
}: {
  lang: Lang;
  onOpenCar: (car: Car) => void;
  onOpenStory: (story: Story) => void;
}) {
  const navigate = useNavigate();
  return (
    <GlobalSearch
      lang={lang}
      onClose={() => navigate("/")}
      onOpenCar={onOpenCar}
      onOpenStory={onOpenStory}
    />
  );
}

function LegalLayout({
  props,
  title,
  children,
}: {
  props: ShellProps;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Chrome {...props}>
      <section className="border-t border-line bg-ink py-24 sm:py-32">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
          <p className="mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
            <span className="h-px w-8 bg-accent" />
            CARVIBES
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <div className="mt-10 max-w-3xl space-y-4 text-sm leading-relaxed text-mist">
            {children}
          </div>
        </div>
      </section>
    </Chrome>
  );
}

export function BrandsPage(props: ShellProps) {
  // Single pass over the database: brand → vehicle count + first vehicle.
  // (Previously this was `cars.filter(...)` + `cars.find(...)` inside the
  // map callback, i.e. two full scans per brand on every render.)
  const brandIndex = useMemo(() => {
    const index = new Map<string, { count: number; first: Car }>();
    for (const car of cars) {
      const entry = index.get(car.brand);
      if (entry) entry.count += 1;
      else index.set(car.brand, { count: 1, first: car });
    }
    return index;
  }, []);

  return (
    <Chrome {...props}>
      <section className="border-t border-line bg-ink py-24 sm:py-32">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
          <p className="mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
            <span className="h-px w-8 bg-accent" />
            {t(props.lang, "universe_eyebrow")}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Brands
          </h1>
          <p className="mt-4 max-w-md text-sm text-mist">
            {allBrands.length} brands · {cars.length}+ {t(props.lang, "universe_count")}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {allBrands.map((brand) => {
              const entry = brandIndex.get(brand);
              if (!entry) return null;
              return (
                <button
                  key={brand}
                  onClick={() => props.onOpenCar(entry.first)}
                  className="min-w-0 border border-line bg-charcoal px-4 py-5 text-left transition-colors hover:border-white/25"
                >
                  <p className="break-words font-display text-lg font-semibold text-white">{brand}</p>
                  <p className="mt-1 text-xs text-fog">{entry.count}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </Chrome>
  );
}

export function ContactPage(props: ShellProps) {
  return (
    <LegalLayout props={props} title="Contact">
      <p>
        CarVibes is a premium automotive discovery platform. For questions about
        the site, partnerships or content, reach us through our social channels.
      </p>
      <p>
        YouTube:{" "}
        <a
          href="https://www.youtube.com/@CarVibes-m6i"
          className="text-white underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @CarVibes-m6i
        </a>
      </p>
      <p>
        Instagram:{" "}
        <a
          href="https://www.instagram.com/carvibesinsta/?hl=en"
          className="text-white underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @carvibesinsta
        </a>
      </p>
    </LegalLayout>
  );
}

export function PrivacyPage(props: ShellProps) {
  return (
    <LegalLayout props={props} title="Privacy Policy">
      <p>
        CarVibes stores language preference, favorites, compare selections and
        recently viewed cars locally in your browser. This data never leaves
        your device.
      </p>
      <p>
        We use Vercel Analytics to understand aggregate traffic. No advertising
        cookies are set by CarVibes.
      </p>
      <p>Last updated: 2026.</p>
    </LegalLayout>
  );
}

export function TermsPage(props: ShellProps) {
  return (
    <LegalLayout props={props} title="Terms of Use">
      <p>
        CarVibes is provided for informational and entertainment purposes.
        Vehicle specifications are compiled from public sources and may differ
        from manufacturer data.
      </p>
      <p>
        You may browse, save favorites locally and compare cars for personal
        use. All trademarks belong to their respective owners.
      </p>
      <p>© 2026 CarVibes. All rights reserved.</p>
    </LegalLayout>
  );
}
