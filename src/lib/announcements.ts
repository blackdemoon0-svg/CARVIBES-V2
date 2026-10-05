// ============================================================
// CARVIBES — reusable feature-announcement system
//
// One hook + two helpers drive every launch modal on the site:
// each announcement has a stable id, a version (bump to re-show),
// and a quiet period after dismissal. Local state only.
// ============================================================

import { useEffect, useState } from "react";

export interface AnnouncementConfig {
  /** Stable id, e.g. "analyze-launch". */
  id: string;
  /** Bump to show again to users who dismissed a previous version. */
  version: number;
  /** Days to stay quiet after dismissal. */
  quietDays: number;
}

const keyOf = (a: AnnouncementConfig) => `carvibes.announce.${a.id}.v${a.version}`;

function readStamp(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** True when the announcement may be shown right now. */
export function shouldShowAnnouncement(
  config: AnnouncementConfig,
  now: number = Date.now()
): boolean {
  const dismissedAt = readStamp(keyOf(config));
  if (dismissedAt == null) return true;
  const quietMs = config.quietDays * 24 * 60 * 60 * 1000;
  return now - dismissedAt >= quietMs;
}

/** Persist a dismissal (close button or CTA click). */
export function dismissAnnouncement(
  config: AnnouncementConfig,
  now: number = Date.now()
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(keyOf(config), String(now));
  } catch {
    // Private mode — the modal simply shows again next visit.
  }
}

/** For tests / debugging: forget a dismissal. */
export function resetAnnouncement(config: AnnouncementConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(keyOf(config));
  } catch {
    // Best-effort.
  }
}

// ------------------------------------------------------------
// Registered announcements — one line per campaign.
// ------------------------------------------------------------

export const ANALYZE_LAUNCH: AnnouncementConfig = {
  id: "analyze-launch",
  version: 1,
  quietDays: 60,
};

/**
 * Homepage controller for the Analyse launch modal: opens once,
 * shortly after first paint, unless dismissed (quiet period) or the
 * visitor is already on /analyze. Returns [open, setOpen].
 */
export function useAnalyzeLaunch(pathname: string): [boolean, (v: boolean) => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/analyze") return;
    if (!shouldShowAnnouncement(ANALYZE_LAUNCH)) return;
    const id = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return [open, setOpen];
}
