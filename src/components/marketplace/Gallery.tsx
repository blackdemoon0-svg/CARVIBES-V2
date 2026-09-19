// ============================================================
// CARVIBES / MARKETVIBES — listing gallery
//
// Lightweight gallery: one main image + a thumbnail rail. The main image
// is the page's LCP element on a listing page, so it is the only eager
// image in the whole app; every other photo is lazy and only rendered
// when it is actually selected (the rail shows thumbnails).
//
// Keyboard: ← / → move between photos, Home / End jump. The thumbnails
// are real buttons with aria-pressed state, and the main frame announces
// its position for screen readers.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import type { ListingMedia } from "../../lib/marketplace/types";
import ListingImage from "./ListingImage";

export default function Gallery({
  media,
  title,
  lang,
}: {
  media: ListingMedia[];
  title: string;
  lang: Lang;
}) {
  const [index, setIndex] = useState(0);
  const count = media.length;
  const safeIndex = Math.min(index, Math.max(0, count - 1));

  const move = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((current) => (current + delta + count) % count);
    },
    [count]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const current = media[safeIndex];
  if (!current) {
    return <div className="aspect-[16/10] w-full bg-graphite" aria-hidden="true" />;
  }

  return (
    <figure className="m-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-graphite">
        <ListingImage
          key={current.url}
          src={current.url}
          alt={current.alt || title}
          cropW={1280}
          cropH={800}
          priority={safeIndex === 0}
          sizes="(min-width: 1024px) 900px, 100vw"
          className="absolute inset-0"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={t(lang, "mk_gallery_prev")}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-ink/70 text-white backdrop-blur transition-colors hover:bg-accent"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={t(lang, "mk_gallery_next")}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/20 bg-ink/70 text-white backdrop-blur transition-colors hover:bg-accent"
            >
              <span aria-hidden="true">→</span>
            </button>
            <p className="absolute bottom-3 right-3 border border-white/15 bg-ink/70 px-2.5 py-1 text-[11px] tabular-nums text-white backdrop-blur">
              {safeIndex + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {media.map((photo, photoIndex) => (
            <button
              key={photo.url}
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-label={t(lang, "mk_gallery_go_to", { index: photoIndex + 1 })}
              aria-pressed={photoIndex === safeIndex}
              className={cn(
                "relative aspect-[4/3] overflow-hidden border transition-all duration-300",
                photoIndex === safeIndex ? "border-accent" : "border-line opacity-70 hover:opacity-100"
              )}
            >
              <ListingImage src={photo.url} alt={photo.alt || `${title} — ${photoIndex + 1}`} cropW={200} cropH={150} sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
