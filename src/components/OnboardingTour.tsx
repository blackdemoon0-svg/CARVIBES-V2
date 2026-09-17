import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { t, type Lang } from "../lib/i18n";
import {
  hasSeenOnboarding,
  markOnboardingSeen,
  takePendingOnboarding,
  ONBOARDING_EVENT,
} from "../lib/onboarding";
import { ArrowRight, CloseIcon } from "./icons";

// ---------------------------------------------------------------------------
// First-time visitor tour.
//
// Deliberately lightweight: no library, no blocking popup. A dimmed spotlight
// follows the element being explained and a small tooltip card floats next to
// it. The whole tour can be skipped/closed at any time, and completion is
// persisted in localStorage. It is only mounted on the homepage.
// ---------------------------------------------------------------------------

interface TourStep {
  /** Selector for the element to highlight. */
  target: string;
  titleKey: string;
  bodyKey: string;
}

const STEPS: TourStep[] = [
  {
    target: "[data-onboarding='search']",
    titleKey: "tour_s1_title",
    bodyKey: "tour_s1_body",
  },
  {
    target: "[data-onboarding='search']",
    titleKey: "tour_s2_title",
    bodyKey: "tour_s2_body",
  },
  {
    target: "[data-onboarding='categories']",
    titleKey: "tour_s3_title",
    bodyKey: "tour_s3_body",
  },
  {
    // Prefer the feature card; fall back to the floating compare bar.
    target: "[data-onboarding='compare'], [data-onboarding='compare-bar']",
    titleKey: "tour_s4_title",
    bodyKey: "tour_s4_body",
  },
  {
    // Prefer the feature card; fall back to the favorites homepage section.
    target: "[data-onboarding='favorites'], [data-onboarding='favorites-section']",
    titleKey: "tour_s5_title",
    bodyKey: "tour_s5_body",
  },
];

const TOOLTIP_WIDTH = 330;
const VIEW_PAD = 12;
const GAP = 14;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Pure positioning maths — shared by the first (pre-paint) measure and the
// later refinements. `tipH` is either the estimated card height (before the
// tooltip exists) or its measured one. Returns viewport-absolute CSS pixels
// for a fixed, top-left-anchored element that is then MOVED WITH
// transform:translate() only — top/left never change after the first paint,
// which is exactly what keeps the tour out of CLS (transform-only updates
// are never layout shifts, and there is no "paint at (12,0) then jump"
// frame any more).
function positionFor(r: Rect, tipW: number, tipH: number) {
  const vw = typeof window === "undefined" ? 390 : window.innerWidth;
  const vh = typeof window === "undefined" ? 700 : window.innerHeight;
  const width = Math.min(tipW, vw - VIEW_PAD * 2);
  const bottom = r.top + r.height;
  const above = bottom + GAP + tipH > vh - VIEW_PAD;
  let left = r.left + r.width / 2 - width / 2;
  left = Math.max(VIEW_PAD, Math.min(left, vw - width - VIEW_PAD));
  let top = above ? r.top - GAP - tipH : bottom + GAP;
  // Keep the tooltip clear of the fixed navbar and on-screen.
  top = Math.max(72, Math.min(top, vh - tipH - VIEW_PAD));
  return { x: Math.round(left), y: Math.round(top), width, above };
}

const TIP_ESTIMATE_H = 190;

export default function OnboardingTour({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tip, setTip] = useState<{
    x: number;
    y: number;
    width: number;
    above: boolean;
  } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // Synchronously read the target box (single forced layout, only while the
  // tour is running — never during boot/LCP).
  const targetRect = (target: string): Rect | null => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  };

  const place = useCallback(
    (target: string, refineHeight = false) => {
      const r = targetRect(target);
      if (!r) {
        setRect(null);
        return;
      }
      setRect(r);
      const tipH = refineHeight
        ? tipRef.current?.offsetHeight ?? TIP_ESTIMATE_H
        : TIP_ESTIMATE_H;
      setTip(positionFor(r, TOOLTIP_WIDTH, tipH));
    },
    []
  );

  const goToStep = useCallback(
    (next: number) => {
      if (next >= STEPS.length) {
        finish();
        return;
      }
      setStep(next);
      const target = STEPS[next].target;
      // Position from the CURRENT scroll offset, in the same state batch as
      // setStep — the tooltip never paints at a stale spot.
      place(target, true);
      const el = document.querySelector<HTMLElement>(target);
      // Bring the target into a comfortable position, then refine once the
      // smooth scroll has settled (transform-only movement; and a user
      // gesture happened <500 ms ago, so it is CLS-exempt anyway).
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => place(target, true), 480);
    },
    [place]
  );

  const finish = useCallback(() => {
    setActive(false);
    markOnboardingSeen();
  }, []);

  const skip = useCallback(() => {
    setActive(false);
    markOnboardingSeen();
  }, []);

  const start = useCallback(() => {
    setStep(0);
    // Measure BEFORE making the tour visible: the first painted frame of the
    // tooltip is already at its final position (a paint-then-jump here was
    // the source of the homepage's 0.22 CLS — a fixed overlay moving in
    // top/left counts as a layout shift).
    place(STEPS[0].target);
    setActive(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => place(STEPS[0].target, true), 500);
  }, [place]);

  // Auto-start for first-time visitors (only on the homepage where this is
  // mounted); also listen for the manual "start tour" event from nav/guide.
  // The auto-open is armed on `load` + 1.4 s — never during boot: measuring
  // and animating the tour while the entry chunks parse/execute used to add
  // forced reflows to the busiest window of the page.
  useEffect(() => {
    const onManual = () => start();
    window.addEventListener(ONBOARDING_EVENT, onManual);
    let delay = 0;
    const arm = () => {
      delay = window.setTimeout(() => {
        if (takePendingOnboarding() || !hasSeenOnboarding()) start();
      }, 1400);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      window.removeEventListener(ONBOARDING_EVENT, onManual);
      window.removeEventListener("load", arm);
      if (delay) window.clearTimeout(delay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the spotlight/tooltip glued to the target on scroll & resize.
  // Reads happen in one rAF; only transforms are written, so re-gluing is
  // compositor-cheap and invisible to CLS.
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const onReflow = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => place(STEPS[step].target));
    };
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow);
    };
  }, [active, step, place]);

  // Close on Escape.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") goToStep(step + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step, skip, goToStep]);

  if (!active) return null;

  const current = STEPS[step];
  const pad = 6;
  const spot = rect
    ? {
        x: Math.max(0, rect.left - pad),
        y: Math.max(0, rect.top - pad),
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;
  // Fallback anchor when the tour is started before its target exists:
  // keep the card on-screen instead of painting at (0,0) and jumping.
  const tipPos = tip ?? { x: VIEW_PAD, y: 120, width: TOOLTIP_WIDTH, above: false };

  return (
    <div
      className="fixed inset-0 z-[65]"
      role="dialog"
      aria-modal="false"
      aria-label={t(lang, current.titleKey)}
      // Clicking anywhere outside the tooltip advances — the dim itself
      // communicates "tap to continue".
      onClick={() => goToStep(step + 1)}
    >
      {/* Dimming layer with a spotlight cutout around the target.
          Clicks anywhere on the dim advance the tour — no dead zones.
          MOVES VIA transform ONLY (top/left stay at 0): repositioning the
          spotlight during the tour can therefore never register as a
          layout shift. */}
      {spot && (
        <div
          className="absolute left-0 top-0 cursor-pointer duration-300 ease-out [transition-property:transform,width,height] will-change-transform"
          style={{
            transform: `translate3d(${spot.x}px, ${spot.y}px, 0)`,
            width: spot.width,
            height: spot.height,
            borderRadius: 14,
            boxShadow: "0 0 0 9999px rgba(4,5,8,0.74)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            goToStep(step + 1);
          }}
          aria-hidden="true"
        >
          {/* Accent ring around the highlighted element */}
          <div
            className="absolute inset-0 animate-pulse rounded-[14px] border-2 border-accent"
            style={{ boxShadow: "0 0 28px -4px rgba(227,38,46,0.55)" }}
          />
        </div>
      )}

      {/* Tooltip card — fixed at the origin and moved with transform only.
          It is painted at its final coordinates from frame 1 (the tour is
          measured before activation), so it contributes exactly zero to
          CLS. */}
      <div
        ref={tipRef}
        className="edge-light fixed left-0 top-0 w-[min(20.6rem,calc(100vw-1.5rem))] border border-line bg-charcoal/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl duration-300 ease-out [transition-property:transform] will-change-transform"
        style={{ transform: `translate3d(${tipPos.x}px, ${tipPos.y}px, 0)` }}
        // Clicks inside the card must not bubble to the dim layer.
        onClick={(e) => e.stopPropagation()}
      >
        {/* Little pointer toward the spotlight */}
        <span
          className={cn(
            "absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-line bg-charcoal",
            tipPos.above ? "-bottom-[5px] border-b border-r" : "-top-[5px] border-l border-t"
          )}
        />

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-snug text-white">
            {t(lang, current.titleKey)}
          </h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              skip();
            }}
            aria-label={t(lang, "detail_close")}
            className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center text-fog transition-colors hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-mist">
          {t(lang, current.bodyKey)}
        </p>

        {/* Progress dots */}
        <div className="mt-4 flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === step ? "w-6 bg-accent" : "w-2 bg-white/15"
              )}
            />
          ))}
          <span className="ml-auto text-[10px] font-semibold tracking-[0.16em] text-fog">
            {t(lang, "tour_step")} {step + 1} {t(lang, "tour_of")} {STEPS.length}
          </span>
        </div>

        {/* Controls */}
        <div
          className="mt-4 flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={skip}
              className="text-[11px] font-semibold tracking-[0.16em] text-fog transition-colors hover:text-white"
            >
              {t(lang, "tour_skip")}
            </button>
            {step > 0 && (
              <button
                type="button"
                onClick={() => goToStep(step - 1)}
                className="text-[11px] font-semibold tracking-[0.16em] text-mist transition-colors hover:text-white"
              >
                {t(lang, "tour_back")}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => goToStep(step + 1)}
            className="cv-btn cv-btn-sm cv-btn-primary group inline-flex h-10 items-center gap-2 px-5 text-[11px] font-semibold tracking-[0.16em] hover:bg-accent-soft"
          >
            {step === STEPS.length - 1
              ? t(lang, "tour_done")
              : t(lang, "tour_next")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
