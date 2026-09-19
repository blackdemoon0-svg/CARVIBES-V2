// ============================================================
// CARVIBES / MARKETVIBES — launch announcement
//
// The marketplace has just gone live, so the first visitors see a slim
// announcement strip above the results: what it is, what to do, and a
// direct link to the seller funnel.
//
// Two rules shaped the design:
//   * it must read as "just launched", not "empty and abandoned" — so it
//     sells the feature, never apologises for missing inventory;
//   * it must stop mattering once there is real supply — so it retires
//     itself automatically past LAUNCH_INVENTORY (and can be dismissed by
//     hand, remembered per browser).
//
// Nothing here is an image or a third-party embed: one cheap, translated
// strip that costs no layout shift (fixed height, no late-loaded media).
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { CloseIcon, RocketIcon } from "../icons";

const DISMISS_KEY = "carvibes.marketplace.launch-dismissed";

/**
 * Listings beyond which the announcement retires itself: by then the
 * marketplace speaks for itself and the strip would only push cars down
 * the page.
 */
export const LAUNCH_INVENTORY = 12;

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function remember(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* private mode — the strip simply comes back next visit */
  }
}

export default function LaunchBanner({
  lang,
  listingCount,
}: {
  lang: Lang;
  /** How many listings are currently on the marketplace (0 at launch). */
  listingCount: number;
}) {
  const [hidden, setHidden] = useState(false);

  if (hidden || listingCount > LAUNCH_INVENTORY || wasDismissed()) return null;

  return (
    <aside
      data-launch-banner=""
      className="edge-light relative overflow-hidden border border-line bg-charcoal"
      aria-label={t(lang, "mk_launch_eyebrow")}
    >
      {/* Hairline accent + a soft sweep: enough motion to feel "new",
          slow and subtle enough to stay out of the way. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-accent/40 bg-accent/10 text-accent-soft"
          >
            <RocketIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.28em] text-accent-soft">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              {t(lang, "mk_launch_eyebrow").toUpperCase()}
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-white sm:text-lg">
              {t(lang, "mk_launch_title")}
            </p>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-mist">{t(lang, "mk_launch_desc")}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:pl-6">
          <Link
            to="/marketplace/sell"
            data-launch-cta=""
            className="cv-btn cv-btn-sm cv-btn-primary inline-flex h-11 items-center px-5 text-[11px] font-semibold tracking-[0.18em]"
          >
            {t(lang, "mk_sell_cta")}
          </Link>
          <button
            type="button"
            onClick={() => {
              remember();
              setHidden(true);
            }}
            aria-label={t(lang, "mk_launch_dismiss")}
            title={t(lang, "mk_launch_dismiss")}
            className="flex h-9 w-9 items-center justify-center border border-line text-fog transition-colors hover:border-white/25 hover:text-white"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
