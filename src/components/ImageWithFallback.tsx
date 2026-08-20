import { useState } from "react";
import { cn } from "../utils/cn";

/**
 * Image with a branded CarVibes fallback. When the source fails to load,
 * renders a premium gradient panel (with the vehicle/story name) instead
 * of a broken-image icon.
 */
export default function ImageWithFallback({
  src,
  alt,
  title,
  accent = "#e3262e",
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  title?: string;
  accent?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center overflow-hidden bg-charcoal",
          className
        )}
        style={{
          background: `radial-gradient(70% 70% at 50% 40%, ${accent}2e 0%, #0d0d0d 75%)`,
        }}
        aria-label={title || alt}
        role="img"
      >
        <span className="font-display text-lg font-extrabold tracking-[0.12em] text-white/80">
          CAR<span className="text-accent">VIBES</span>
        </span>
        {title && (
          <span className="mt-1.5 max-w-[85%] truncate text-center text-[10px] font-medium tracking-[0.14em] text-mist">
            {title}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className, imgClassName)}
    />
  );
}
