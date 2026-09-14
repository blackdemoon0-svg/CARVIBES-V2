import { useEffect } from "react";
import { signalAppReady } from "../lib/boot";
import { LogoMark } from "./Logo";

/**
 * Mounted once, outside every Suspense boundary: its effect fires on the
 * very first React commit and swaps the static boot splash for the app
 * (or for the PageLoader fallback below while a lazy chunk downloads).
 */
export function BootSignal() {
  useEffect(() => {
    signalAppReady();
  }, []);
  return null;
}

/**
 * Full-screen branded fallback for every lazy boundary (route pages and
 * heavy overlays). Mirrors the static #boot-splash in index.html so the
 * handover from static HTML to React is visually seamless.
 */
export function PageLoader({ label }: { label?: string }) {
  // Safety net: if this fallback ever commits without BootSignal (future
  // refactor, deep link racing the shell), still retire the splash.
  useEffect(() => {
    signalAppReady();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading CarVibes"}
    >
      <div className="flex flex-col items-center gap-5">
        <LogoMark className="cv-boot-glow h-12 w-12 text-white" />
        <p className="font-display text-lg font-extrabold tracking-[0.08em] text-white select-none">
          CAR<span className="text-[#e3262e]">VIBES</span>
        </p>
        <span className="block h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
          <span className="cv-boot-bar block h-full w-16 rounded-full bg-[#e3262e]" />
        </span>
      </div>
    </div>
  );
}
