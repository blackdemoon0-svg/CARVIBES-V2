// ============================================================
// CARVIBES — progressive section mounting
//
// The homepage below the hero is seven lazy sections. Lazy already keeps
// their code out of the entry bundle, but on a cold load React still
// mounts ALL of them the moment their chunks land — one 4×-CPU-throttled
// burst of style + layout + paint for ~1,200 DOM nodes, which Lighthouse
// books as main-thread work (and, before the boot splash, as CLS).
//
// This module opens one "stage" per idle callback, in DOM order, so each
// section is mounted, measured and painted as its own small task:
//
//   stage 0 is open from the start (the section right under the hero is
//            likely at least partly visible and must not wait),
//   further stages open on requestIdleCallback (timeout 800 ms so a busy
//            main thread can never starve them for long),
//   a hidden tab (or a crawler that never idles) opens every stage at once
//            — the complete document must always reach the DOM, SEO and
//            in-page find included.
// ============================================================

import { useEffect, useState } from "react";

let stage = 0;
let armed = false;
const waiters = new Set<() => void>();
const GESTURES = ["scroll", "wheel", "touchstart", "keydown"] as const;

function advance() {
  stage += 1;
  for (const w of Array.from(waiters)) w();
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

function arm() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const w = window as IdleWindow;
  // Background tabs / headless crawlers: no reason to drip-feed.
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    stage = Number.MAX_SAFE_INTEGER;
    for (const fn of Array.from(waiters)) fn();
    return;
  }
  const idle = (cb: () => void) =>
    w.requestIdleCallback
      ? w.requestIdleCallback(cb, { timeout: 800 })
      : window.setTimeout(cb, 50);
  // Someone who scrolls or taps is looking for content NOW — stop
  // drip-feeding. (Shifts caused within ~500 ms of an input are also
  // outside Lighthouse's CLS window, so this is free there too.)
  const flush = () => {
    stage = Number.MAX_SAFE_INTEGER;
    for (const fn of Array.from(waiters)) fn();
    for (const ev of GESTURES) window.removeEventListener(ev, flush);
  };
  for (const ev of GESTURES) window.addEventListener(ev, flush, { passive: true });
  const step = () => {
    idle(() => {
      advance();
      window.setTimeout(step, 0);
    });
  };
  step();
}

/** True once stage `target` has been opened (0 = immediately). */
export function useStage(target: number): boolean {
  const [open, setOpen] = useState(() => stage >= target);
  useEffect(() => {
    if (open) return;
    arm();
    const check = () => {
      if (stage >= target) setOpen(true);
    };
    waiters.add(check);
    check();
    return () => {
      waiters.delete(check);
    };
  }, [open, target]);
  // A tab that is hidden (background render, crawler that never idles)
  // must never be left with half a document: open everything at once.
  useEffect(() => {
    if (open || typeof document === "undefined") return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        stage = Number.MAX_SAFE_INTEGER;
        setOpen(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [open]);
  return open;
}
