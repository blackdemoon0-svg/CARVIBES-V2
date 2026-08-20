import { useState } from "react";
import { cn } from "../../utils/cn";

/**
 * Image with a branded CarVibes fallback. If the real image fails to load
 * (network error / missing URL), we render a premium gradient panel with
 * the story title instead of a broken-image icon.
 */
export default function StoryImage({
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

  return (
    <div className={cn("relative overflow-hidden bg-graphite", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
