// ============================================================
// CARVIBES — scroll-reveal activation (`.reveal` → `.is-visible`)
//
// An IntersectionObserver toggles the entrance animation on every element
// that enters the viewport. The observer is LIVE: a MutationObserver keeps
// watching <body>, so content that mounts LATER (lazy homepage sections,
// the compare modal, paginated grids — anything behind a code-split
// boundary) is still animated. Without this, a `.reveal` element rendered
// after the initial effect run would stay invisible forever, because the
// entrance CSS starts at opacity 0.
//
// Mutation batches are coalesced into a single rAF pass and element lookups
// skip anything already observed/visible, so the cost per DOM change is a
// cheap querySelectorAll — never a forced sync layout at boot.
// ============================================================

import { useEffect } from "react";

export function useReveal(watch?: unknown) {
  useEffect(() => {
    const observed = new WeakSet<Element>();
    const attachAll = (io?: IntersectionObserver) => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(".reveal")
      ).filter((el) => !el.classList.contains("is-visible") && !observed.has(el));
      if (!els.length) return;
      if (!io) {
        els.forEach((el) => el.classList.add("is-visible"));
        return;
      }
      els.forEach((el) => {
        observed.add(el);
        io.observe(el);
      });
    };

    if (!("IntersectionObserver" in window)) {
      attachAll(undefined);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ? Number(el.dataset.delay) : 0;
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    let scheduled = 0;
    const schedule = () => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => {
        scheduled = 0;
        attachAll(observer);
      });
    };
    attachAll(observer);

    const mo =
      "MutationObserver" in window
        ? new MutationObserver(schedule)
        : null;
    mo?.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (scheduled) cancelAnimationFrame(scheduled);
      mo?.disconnect();
      observer.disconnect();
    };
  }, [watch]);
}
