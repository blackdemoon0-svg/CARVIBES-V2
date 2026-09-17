import { useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Image with a branded CarVibes fallback. If the real image fails to load
 * (network error / missing URL), we render a premium gradient panel with
 * the story title instead of a broken-image icon.
 *
 * Optional `srcSet`/`webpSrcSet`/`sizes`/`fetchPriority` turn the image
 * into a proper responsive <picture> — used by the story cover hero so the
 * LCP element matches, byte-for-byte, the URL the prerenderer preloads and
 * paints inside the boot splash (see scripts/prerender.mjs + lib/images).
 */
export default function StoryImage({
  src,
  alt,
  title,
  accent = "#e3262e",
  className,
  imgClassName,
  eager = false,
  srcSet,
  webpSrcSet,
  sizes,
  fetchPriority,
  portraitWebpSrcSet,
  portraitSrcSet,
  portraitMedia = "(orientation: portrait)",
}: {
  src: string;
  alt: string;
  title?: string;
  accent?: string;
  className?: string;
  imgClassName?: string;
  /** Set for full-screen hero images that must load immediately. */
  eager?: boolean;
  srcSet?: string;
  webpSrcSet?: string;
  sizes?: string;
  fetchPriority?: "high" | "auto";
  /** Tall crop for portrait viewports (see lib/images HERO_PORTRAIT_*). */
  portraitWebpSrcSet?: string;
  portraitSrcSet?: string;
  portraitMedia?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn("relative flex flex-col items-center justify-center overflow-hidden bg-charcoal", className)}
        style={{
          background: `radial-gradient(70% 70% at 50% 40%, ${accent}33 0%, #0d0d0d 70%)`,
        }}
      >
        <span className="font-display text-2xl font-extrabold tracking-[0.12em] text-white/90">
          CAR<span className="text-accent">VIBES</span>
        </span>
        {title && (
          <span className="mt-2 max-w-[80%] text-center text-[11px] font-medium tracking-[0.16em] text-mist">
            {title}
          </span>
        )}
      </div>
    );
  }

  const img = (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      {...(srcSet ? { srcSet, sizes } : {})}
      {...(fetchPriority ? { fetchPriority } : {})}
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", imgClassName)}
    />
  );

  return (
    <div className={cn("relative overflow-hidden bg-graphite", className)}>
      {srcSet || webpSrcSet ? (
        <picture>
          {portraitWebpSrcSet ? (
            <source media={portraitMedia} type="image/webp" srcSet={portraitWebpSrcSet} sizes={sizes} />
          ) : null}
          {portraitSrcSet ? (
            <source media={portraitMedia} srcSet={portraitSrcSet} sizes={sizes} />
          ) : null}
          {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
}
