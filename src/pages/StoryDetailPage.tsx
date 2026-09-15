import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Lang } from "../lib/i18n";
import { storyById } from "../lib/stories";
import { usePageMeta } from "../lib/seo";
import StoryDetail from "../components/stories/StoryDetail";
import Footer from "../components/Footer";
import NotFound from "../components/NotFound";

/**
 * /story/:id — dedicated story page.
 *
 * Same fix as /car/:id: before, the route rendered the full homepage
 * with the story reader as a fixed overlay on top (two H1s, the whole
 * homepage DOM behind the reader, prerender/hydrated mismatch). Now the
 * route renders the reader itself — same component, same design
 * (`asPage` mode), same top bar — with nothing behind it:
 *   - exactly one H1 (the story title)
 *   - no homepage sections, no hidden duplicate content
 *   - the hydrated DOM matches the prerendered HTML
 *   - every internal link is a real crawlable <a>
 *
 * Unknown ids fall through to the real 404 experience with 404 meta
 * (noindex, no canonical) — see usePageMeta + NotFound.
 */
export default function StoryDetailPage({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const story = useMemo(() => (id ? storyById(id) : undefined), [id]);
  const notFound = story === undefined;

  // Per-route head — same strings the prerendered HTML carries.
  usePageMeta({ story, notFound, path: id ? `/story/${id}` : "/story" });

  // CLOSE: back when there is in-app history, otherwise home via replace.
  const closeDetail = useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate("/", { replace: true });
  }, [navigate]);

  if (notFound) {
    return <NotFound lang={lang} onHome={() => navigate("/", { replace: true })} />;
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <main>
        <StoryDetail story={story} lang={lang} asPage onClose={closeDetail} />
      </main>
      <Footer lang={lang} onLangChange={onLangChange} />
    </div>
  );
}
