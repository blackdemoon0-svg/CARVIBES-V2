import { useEffect } from "react";

// ============================================================
// CARVIBES — shared full-screen overlay behaviour.
//
// Every dialog/overlay in the app (car detail, story reader, compare
// battle, global search, find-my-car wizard, mobile menu) needs the
// same two things: lock the page behind it, and close on Escape.
// Centralising it keeps the behaviour identical everywhere and makes
// sure no listener or scroll lock can survive an unmount.
// ============================================================

/**
 * Locks `<body>` scrolling while `active` is true.
 * The lock is always released on cleanup, so closing an overlay can
 * never leave the page stuck.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);
}

/** Calls `onClose` when the user presses Escape. */
export function useEscapeToClose(onClose?: () => void, active = true) {
  useEffect(() => {
    if (!onClose || !active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, active]);
}

/** Scroll lock + Escape-to-close for a full-screen overlay. */
export function useOverlay(onClose?: () => void, active = true) {
  useBodyScrollLock(active);
  useEscapeToClose(onClose, active);
}
