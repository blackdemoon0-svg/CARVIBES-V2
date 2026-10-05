import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { t, type Lang } from "../../../lib/i18n";
import { useBodyScrollLock } from "../../../lib/useOverlay";
import { ANALYZE_LAUNCH, dismissAnnouncement } from "../../../lib/announcements";
import "../analyze.css";

interface Props {
  lang: Lang;
  open: boolean;
  onClose: () => void;
}

/**
 * Localized campaign visual. FR and ES get their own baked-in-text
 * artwork; every other language falls back to the EN visual, exactly
 * like the t() string fallback.
 */
export function launchVisualSrc(lang: string): string {
  if (lang === "fr") return "/images/analyze-launch-fr.jpg";
  if (lang === "es") return "/images/analyze-launch-es.jpg";
  return "/images/analyze-launch-en.jpg";
}

/**
 * Official launch modal for CarVibes Analyse. Centered premium dialog
 * over a subtle dark overlay; closing (✕, Escape, backdrop or CTA)
 * persists a dismissal via the reusable announcement system.
 *
 * The marketing headline lives INSIDE the visual (one artwork per
 * language); the modal keeps only the short HTML text + the real
 * clickable CTA button.
 */
export default function AnalyzeLaunchModal({ lang, open, onClose }: Props) {
  const navigate = useNavigate();
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const close = () => {
    dismissAnnouncement(ANALYZE_LAUNCH);
    onClose();
  };

  const go = () => {
    dismissAnnouncement(ANALYZE_LAUNCH);
    onClose();
    navigate("/analyze");
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="az-launch-title"
    >
      <button
        type="button"
        aria-label={t(lang, "az_launch_close")}
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm"
      />
      <div className="az-launch-pop relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-charcoal shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] sm:max-w-2xl sm:rounded-3xl">
        {/* Screen-reader title (the visible headline is baked in the artwork). */}
        <h2 id="az-launch-title" className="sr-only">
          {t(lang, "az_launch_title1")} {t(lang, "az_launch_title2")}
        </h2>
        {/* Campaign visual — headline baked in, natural aspect (never cropped). */}
        <div className="relative">
          <img
            src={launchVisualSrc(lang)}
            alt={t(lang, "az_launch_alt")}
            className="h-auto w-full"
            loading="eager"
          />
          <button
            type="button"
            onClick={close}
            aria-label={t(lang, "az_launch_close")}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink/70 text-lg text-white backdrop-blur-md transition-all hover:rotate-90 hover:border-white/40"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-6 pt-4 text-center sm:px-8 sm:pb-7">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-mist">
            {t(lang, "az_launch_text")}
          </p>
          <button
            type="button"
            onClick={go}
            className="az-btn-primary mt-5 w-full !py-4 !text-sm sm:!text-base"
          >
            ◈ {t(lang, "az_launch_cta")}
          </button>
        </div>
      </div>
    </div>
  );
}
