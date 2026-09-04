// ============================================================
// CARVIBES — FIRST-TIME USER ONBOARDING STATE
//
// A lightweight, non-blocking guided tour shown only to first-time
// visitors. Completion is persisted in localStorage so returning users
// never see it again — unless they restart it from "How to use CarVibes".
// ============================================================

export const ONBOARDING_KEY = "carvibes.onboardingDone";
/** Set when the tour is requested from a non-homepage page (footer). */
const ONBOARDING_PENDING_KEY = "carvibes.onboardingPending";

/** Event fired on `window` to start the tour (from nav / guide section). */
export const ONBOARDING_EVENT = "carvibes:start-onboarding";

export function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingSeen() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {
    // Storage may be unavailable (private mode) — the tour simply won't persist.
  }
}

/** Start the tour immediately (used on the homepage). */
export function startOnboarding() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(ONBOARDING_EVENT));
}

/**
 * Request the tour while navigating to the homepage (footer/nav on other
 * pages): set a pending flag — the homepage starts the tour on mount, then
 * clears it.
 */
export function requestOnboardingAfterNav() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_PENDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function takePendingOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = localStorage.getItem(ONBOARDING_PENDING_KEY) === "1";
    if (pending) localStorage.removeItem(ONBOARDING_PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}
