// ============================================================
// CARVIBES — boot splash handshake (index.html <-> React)
//
// index.html paints a static #boot-splash overlay from the very first
// paint and hides the prerendered #root content behind the `cv-boot`
// class (JS only — crawlers reading the raw HTML still see the full
// prerendered content). As soon as React commits its first render —
// even a Suspense fallback while a lazy chunk downloads — the app
// calls signalAppReady() to remove the splash and reveal the app.
//
// A 12 s inline-script timeout in index.html force-reveals the page if
// the module bundle never boots (blocked CDN, …), so visitors always
// end up on readable content instead of an eternal loader.
// ============================================================

export const BOOT_SPLASH_ID = "boot-splash";
export const BOOT_CLASS = "cv-boot";

/** Remove the static splash and reveal the React app. Idempotent. */
export function signalAppReady(): void {
  if (typeof document === "undefined") return;
  document.getElementById(BOOT_SPLASH_ID)?.remove();
  document.documentElement.classList.remove(BOOT_CLASS);
  const w = window as unknown as Record<string, unknown>;
  w.__carvibesReady = true;
  const timer = w.__carvibesBootTimer as
    | ReturnType<typeof setTimeout>
    | undefined;
  if (timer !== undefined) {
    clearTimeout(timer);
    w.__carvibesBootTimer = undefined;
  }
}
