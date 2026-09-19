// ============================================================
// CARVIBES / MARKETVIBES — marketplace analytics
//
// Reuses the analytics stack CarVibes already ships (@vercel/analytics)
// instead of adding a new dependency or a third-party script. Events are
// queued in memory and the tracker module is imported lazily AFTER the
// page has loaded and gone idle, so measurement can never sit on the
// critical path (same policy as the deferred <Analytics/> mount in
// src/main.tsx).
//
// Deliberately tiny: an event name + a few scalar props. No cookies, no
// fingerprinting, no personal data (contact values are never sent).
// ============================================================

export type MarketplaceEvent =
  | "marketplace_view"
  | "marketplace_search"
  | "marketplace_filter"
  | "marketplace_sort"
  | "listing_view"
  | "listing_contact_click"
  | "sell_started"
  | "sell_photo_uploaded"
  | "sell_submitted"
  | "sell_failed"
  | "admin_login"
  | "admin_review"
  | "admin_bulk_review";

type Props = Record<string, string | number | boolean>;

const queue: { event: MarketplaceEvent; props: Props }[] = [];
let flushing = false;

function schedule() {
  if (flushing) return;
  flushing = true;
  const run = () => {
    void import("@vercel/analytics")
      .then((mod) => {
        while (queue.length) {
          const item = queue.shift();
          if (!item) break;
          try {
            mod.track(item.event, item.props);
          } catch {
            /* tracker refused the event — never break the UI for analytics */
          }
        }
      })
      .catch(() => {
        queue.length = 0;
      })
      .finally(() => {
        flushing = false;
      });
  };
  if (typeof window === "undefined") return;
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (idle) idle(run);
  else window.setTimeout(run, 1200);
}

export function trackMarketplace(event: MarketplaceEvent, props: Props = {}): void {
  if (queue.length > 40) queue.shift();
  queue.push({ event, props });
  schedule();
}

/** URL-safe facet value for analytics props (no free-text leakage). */
export function analyticsFilterProp(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, 48);
}
