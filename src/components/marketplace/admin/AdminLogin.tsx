// ============================================================
// CARVIBES / MARKETVIBES — admin sign-in
//
// Two doors, both server-verified:
//   1. Google Sign-In (Identity Services) — the recommended admin
//      identity. The ID token is verified server-side against Google's
//      JWKS, then the e-mail is checked against an explicit allowlist;
//      being "logged in" is never sufficient.
//   2. Passcode (development bootstrap / explicitly enabled).
//
// Nothing here decides anything: the API answers 401/403 and the UI
// simply reports it. The Google script is loaded only on this page, so
// it costs the public marketplace exactly zero bytes.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { t, type Lang } from "../../../lib/i18n";
import { adminLoginGoogle, adminLoginPasscode } from "../../../lib/marketplace/api";
import { trackMarketplace } from "../../../lib/marketplace/analytics";
import { ShieldIcon } from "../../icons";

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

export default function AdminLogin({
  lang,
  googleClientId,
  passcodeLogin,
  onSignedIn,
}: {
  lang: Lang;
  googleClientId: string | null;
  passcodeLogin: boolean;
  onSignedIn: () => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Google Identity Services — loaded on demand, never in the entry bundle.
  useEffect(() => {
    if (!googleClientId) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          setBusy(true);
          setError(null);
          void adminLoginGoogle(response.credential).then((result) => {
            setBusy(false);
            if (result.ok) {
              trackMarketplace("admin_login", { method: "google" });
              onSignedIn();
            } else {
              setError(result.error.error === "not_admin" ? "not_admin" : "google_failed");
            }
          });
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 280,
      });
    };

    if (window.google) render();
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => setError("google_unavailable");
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
    };
  }, [googleClientId, onSignedIn]);

  const submitPasscode = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    void adminLoginPasscode(email, passcode).then((result) => {
      setBusy(false);
      if (result.ok) {
        trackMarketplace("admin_login", { method: "passcode" });
        onSignedIn();
      } else {
        setError("invalid");
      }
    });
  };

  const fieldClass =
    "h-11 w-full border border-line bg-ink px-3 text-[13px] text-white placeholder:text-fog focus:border-white/40 focus:outline-none";

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-4 py-16">
      <div className="edge-light border border-line bg-charcoal p-7">
        <span className="flex h-11 w-11 items-center justify-center border border-accent/50 bg-accent/10 text-accent">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold text-white">{t(lang, "mk_admin_login_title")}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-mist">{t(lang, "mk_admin_login_desc")}</p>

        {googleClientId && (
          <div className="mt-6">
            <div ref={buttonRef} className="min-h-[44px]" />
            <p className="mt-2 text-[11px] text-fog">{t(lang, "mk_admin_google_hint")}</p>
          </div>
        )}

        {passcodeLogin && (
          <form onSubmit={submitPasscode} className={googleClientId ? "mt-6 border-t border-line pt-6" : "mt-6"}>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-fog">
                {t(lang, "mk_admin_email").toUpperCase()}
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
                className={fieldClass}
                placeholder="admin@carvibes.dev"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-[10px] font-semibold tracking-[0.2em] text-fog">
                {t(lang, "mk_admin_passcode").toUpperCase()}
              </span>
              <input
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                required
                autoComplete="current-password"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="cv-btn cv-btn-primary mt-5 h-12 w-full text-[11px] font-semibold tracking-[0.18em] disabled:opacity-60"
            >
              {busy ? t(lang, "mk_admin_signing_in") : t(lang, "mk_admin_sign_in")}
            </button>
          </form>
        )}

        {!googleClientId && !passcodeLogin && (
          <p className="mt-6 border border-accent/40 bg-accent/[0.06] px-4 py-3 text-[12px] text-white" role="alert">
            {t(lang, "mk_admin_not_configured")}
          </p>
        )}

        {error && (
          <p className="mt-4 border border-accent/50 bg-accent/[0.07] px-4 py-3 text-[12px] text-white" role="alert">
            ⚠ {t(lang, `mk_admin_error_${error}`)}
          </p>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-fog">{t(lang, "mk_admin_authorized_only")}</p>
      </div>
    </div>
  );
}
