// ============================================================
// CARVIBES / MARKETVIBES — who is signed in as administrator?
//
// The Creator Dashboard button must appear ONLY for the admin, and the
// decision has to come from the server — the session cookie is HttpOnly,
// so the browser cannot inspect it, and a CSS-hidden button would be
// worthless anyway (the route and every action are protected server-side
// regardless).
//
// This hook asks GET /admin/session once, caches the answer for the tab,
// and fails CLOSED: any error, timeout or unexpected payload is treated
// as "not an administrator".
//
// Cost is kept off the critical path: the request is scheduled during an
// idle slot after the page has painted, so it never competes with LCP.
// ============================================================

import { useEffect, useState } from "react";
import { adminSession } from "./api";

export interface AdminIdentity {
  /** True only when the API confirmed an allow-listed administrator. */
  isAdmin: boolean;
  email: string | null;
  ready: boolean;
}

const CACHE_KEY = "carvibes.marketplace.admin-check";
const CACHE_TTL = 60_000; // a minute: long enough to skip repeat checks while browsing

/** Broadcast so a sign-in / sign-out updates every mounted consumer at once. */
export const ADMIN_SESSION_EVENT = "cv:admin-session";

let memory: { isAdmin: boolean; email: string | null; at: number } | null = null;

function readCache(): { isAdmin: boolean; email: string | null } | null {
  if (memory && Date.now() - memory.at < CACHE_TTL) return memory;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { isAdmin: boolean; email: string | null; at: number };
    if (Date.now() - parsed.at > CACHE_TTL) return null;
    memory = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(isAdmin: boolean, email: string | null) {
  const value = { isAdmin, email, at: Date.now() };
  memory = value;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* private mode — the in-memory copy still works */
  }
}

/** Drop the cached answer (called after sign-in / sign-out). */
export function forgetAdminSession() {
  memory = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
  }
}

export function useAdminIdentity(): AdminIdentity {
  const [state, setState] = useState<AdminIdentity>(() => {
    const cached = readCache();
    return { isAdmin: cached?.isAdmin ?? false, email: cached?.email ?? null, ready: Boolean(cached) };
  });

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      void adminSession().then((result) => {
        if (cancelled) return;
        // Fail closed: anything but an explicit `authenticated: true`.
        const session = result.ok ? result.data : null;
        const isAdmin = Boolean(session?.authenticated);
        const email = isAdmin ? (session?.email ?? null) : null;
        writeCache(isAdmin, email);
        setState({ isAdmin, email, ready: true });
      });
    };

    // Subscribe FIRST, unconditionally. A cached answer skips the network
    // call but must never skip the subscription: this is what turns a
    // sign-in or sign-out performed on another route into an immediate
    // update of the header — without it the button would wait for a full
    // reload before appearing.
    const onSessionChange = () => {
      const fresh = readCache();
      if (fresh) setState({ isAdmin: fresh.isAdmin, email: fresh.email, ready: true });
      else check();
    };
    window.addEventListener(ADMIN_SESSION_EVENT, onSessionChange);

    // Defer to an idle slot: the header must not wait on a network call.
    let idle: number | undefined;
    const cached = readCache();
    if (cached) {
      setState({ isAdmin: cached.isAdmin, email: cached.email, ready: true });
    } else if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(check, { timeout: 2500 });
    } else {
      idle = window.setTimeout(check, 1200);
    }

    return () => {
      cancelled = true;
      if (idle !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
      window.removeEventListener(ADMIN_SESSION_EVENT, onSessionChange);
    };
  }, []);

  return state;
}
