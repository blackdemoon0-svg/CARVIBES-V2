import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Car } from "../lib/cars";
import type { Lang } from "../lib/i18n";
import { cars } from "../lib/db";
import { usePageMeta } from "../lib/seo";
import CarDetail from "../components/universe/CarDetail";
import Footer from "../components/Footer";
import NotFound from "../components/NotFound";

/**
 * /car/:id — dedicated vehicle page.
 *
 * Before this existed, the route rendered the FULL homepage and placed
 * the car sheet as a fixed overlay on top of it: two H1s, the entire
 * homepage DOM behind the sheet, and a prerendered-HTML/hydrated-DOM
 * mismatch (the prerendered file contains only the car article).
 *
 * Now the route renders the sheet itself — same component, same design
 * (`asPage` mode), same CLOSE button — with nothing behind it:
 *   - exactly one H1 (the vehicle name)
 *   - no homepage sections, no hidden duplicate content
 *   - the hydrated DOM matches the prerendered HTML
 *
 * A Footer follows the sheet so the page keeps crawlable exit links
 * (Explore / Brands / Stories / …).
 *
 * Unknown ids fall through to the real 404 experience with 404 meta
 * (noindex, no canonical) — see usePageMeta + NotFound.
 */
export default function CarDetailPage({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const car = useMemo(() => (id ? cars.find((c) => c.id === id) : undefined), [id]);
  const notFound = car === undefined;

  // Per-route head (title / description / canonical / JSON-LD) — the same
  // builders the prerendered HTML uses, so both passes agree. For an
  // unknown id this produces the 404 meta instead.
  usePageMeta({ car, notFound, path: id ? `/car/${id}` : "/car" });

  // CLOSE: go back when there is in-app history (homepage → car); when
  // the visitor landed directly on the sheet (idx = 0, e.g. from Google)
  // return home via replace, so the sheet URL does not pollute history.
  const closeDetail = useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/", { replace: true });
  }, [navigate]);

  const openCar = useCallback((next: Car) => navigate(`/car/${next.id}`), [navigate]);

  if (notFound) {
    return <NotFound lang={lang} onHome={() => navigate("/", { replace: true })} />;
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <main>
        <CarDetail car={car} lang={lang} asPage onClose={closeDetail} onOpen={openCar} />
      </main>
      <Footer lang={lang} onLangChange={onLangChange} />
    </div>
  );
}
