import { Logo } from "./Logo";
import { ArrowRight } from "./icons";
import { t, type Lang } from "../lib/i18n";

export default function NotFound({
  onHome,
  lang = "en",
}: {
  onHome: () => void;
  lang?: Lang;
}) {
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

      {/* The big "404" is decorative; the page's single H1 is the real
          "Page not found" title below — one H1, same as the prerendered
          404 shell, no hidden heading anywhere else. */}
      <p
        aria-hidden="true"
        className="relative z-10 mt-12 font-display text-8xl font-bold leading-none text-white"
      >
        404
      </p>
      <h1 className="relative z-10 mt-5 text-[12px] font-medium tracking-mega text-mist">
        {t(lang, "notfound_title")}
      </h1>
      <p className="relative z-10 mt-5 max-w-sm text-sm leading-relaxed text-fog">
        {t(lang, "notfound_desc")}
      </p>

      <button
        onClick={onHome}
        className="cv-btn cv-btn-primary relative z-10 group mt-10 inline-flex h-12 items-center gap-3 px-8 text-[12px] font-semibold tracking-[0.18em]"
      >
        {t(lang, "notfound_back")}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}
