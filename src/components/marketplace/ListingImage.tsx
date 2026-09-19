// ============================================================
// CARVIBES / MARKETVIBES — listing image
//
// One component for every marketplace photo:
//   * the wrapper owns a fixed aspect-ratio, so a slow photo can never
//     shift the layout (CLS stays 0),
//   * `loading="lazy"` + `decoding="async"` everywhere except the main
//     image of a detail page, which passes `priority`,
//   * Pexels-hosted photos (the seeded demo data) are re-cropped to the
//     size they are actually painted at, exactly like the rest of
//     CarVibes — seller uploads are already optimised in the browser.
// ============================================================

import { useState } from "react";
import { cn } from "../../utils/cn";
import { pexelsResize } from "../../lib/images";

export interface ListingImageProps {
  src: string;
  alt: string;
  /** Crop requested from the CDN for Pexels URLs (width/height in px). */
  cropW?: number;
  cropH?: number;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export default function ListingImage({
  src,
  alt,
  cropW = 800,
  cropH = 560,
  className,
  imgClassName,
  sizes = "(min-width: 1280px) 420px, (min-width: 768px) 33vw, 100vw",
  priority = false,
}: ListingImageProps) {
  const [failed, setFailed] = useState(false);
  const optimized = src.includes("images.pexels.com") ? pexelsResize(src, cropW, cropH) : src;

  if (failed || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-graphite", className)} role="img" aria-label={alt}>
        <span className="font-display text-[11px] font-bold tracking-[0.24em] text-fog">
          MARKET<span className="text-accent">VIBES</span>
        </span>
      </div>
    );
  }

  return (
    <img
      src={optimized}
      alt={alt}
      width={cropW}
      height={cropH}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className, imgClassName)}
    />
  );
}
