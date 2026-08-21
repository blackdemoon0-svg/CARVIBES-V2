import { Logo } from "./Logo";
import { ArrowRight } from "./icons";

export default function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      {/* Backdrop accent */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(227,38,46,0.45) 0%, rgba(227,38,46,0) 70%)",
        }}
      />

      <div className="relative z-10">
        <Logo />
      </div>

      <p className="relative z-10 mt-12 font-display text-8xl font-bold leading-none text-white">
        404
      </p>
      <p className="relative z-10 mt-5 text-[12px] font-medium tracking-mega text-mist">
        PAGE NOT FOUND
      </p>
      <p className="relative z-10 mt-5 max-w-sm text-sm leading-relaxed text-fog">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>

      <button
        onClick={onHome}
        className="relative z-10 group mt-10 inline-flex h-12 items-center gap-3 bg-accent px-8 text-[12px] font-semibold tracking-[0.18em] text-white transition-colors hover:bg-accent-soft"
      >
        BACK HOME
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}
