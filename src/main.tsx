import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/**
 * Vercel Web Analytics — mounted AFTER the boot completes, never before.
 *
 * The analytics module otherwise joins the entry graph: extra bytes to
 * download, parse and execute inside the most expensive window of the
 * page load (boot → LCP → TBT), while contributing nothing to what the
 * visitor sees. Deferred to `load` + a short beat, it still records the
 * first pageview (the tracker fires on its own mount) and every route
 * change after that — zero data loss for a faster first frame.
 */
function DeferredAnalytics() {
  const [Tracker, setTracker] = useState<(() => null) | null>(null);
  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const schedule = () => {
      timer = window.setTimeout(() => {
        import("@vercel/analytics/react")
          .then((m) => {
            if (alive) setTracker(() => m.Analytics as () => null);
          })
          .catch(() => {
            /* blocked/offline: no analytics this session */
          });
      }, 2000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      alive = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);
  return Tracker ? <Tracker /> : null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <DeferredAnalytics />
  </StrictMode>
);
