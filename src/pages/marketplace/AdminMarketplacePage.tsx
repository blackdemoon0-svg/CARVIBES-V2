// ============================================================
// CARVIBES / MARKETVIBES — /admin/marketplace
//
// Private moderation route. Two layers protect it and only the second
// one matters:
//   1. this page asks the API who the visitor is (and renders the
//      dashboard or the sign-in card accordingly),
//   2. EVERY admin API call re-verifies the signed session cookie AND
//      the e-mail allowlist server-side, so typing the URL (or forging a
//      cookie) gets a 401 and no data whatsoever.
//
// Always noindex, never linked from public navigation.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { adminSession } from "../../lib/marketplace/api";
import { forgetAdminSession } from "../../lib/marketplace/useAdminIdentity";
import { useMarketplaceMeta } from "../../lib/marketplace/useMeta";
import AdminDashboard from "../../components/marketplace/admin/AdminDashboard";
import AdminLogin from "../../components/marketplace/admin/AdminLogin";

interface SessionState {
  status: "checking" | "anonymous" | "authenticated";
  email: string | null;
  googleClientId: string | null;
  passcodeLogin: boolean;
}

export default function AdminMarketplacePage({ lang }: { lang: Lang }) {
  const [session, setSession] = useState<SessionState>({
    status: "checking",
    email: null,
    googleClientId: null,
    passcodeLogin: false,
  });

  useMarketplaceMeta({
    title: t(lang, "mk_admin_meta_title"),
    description: t(lang, "mk_admin_meta_desc"),
    canonicalPath: "/admin/marketplace",
    // Not in the sitemap, not canonicalised to a public URL, not indexed.
    indexable: false,
  });

  const check = useCallback(() => {
    setSession((current) => ({ ...current, status: "checking" }));
    void adminSession().then((result) => {
      if (!result.ok) {
        setSession((current) => ({ ...current, status: "anonymous" }));
        return;
      }
      setSession({
        status: result.data.authenticated ? "authenticated" : "anonymous",
        email: result.data.email,
        googleClientId: result.data.config.googleClientId,
        passcodeLogin: result.data.config.passcodeLogin,
      });
    });
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  /**
   * Signing in or out changes the answer to "is this visitor the
   * administrator?", so the cached identity is dropped before the state is
   * re-read: the "Creator Dashboard" entry in the navigation appears (or
   * disappears) on the spot instead of after the cache window.
   */
  const refreshIdentity = useCallback(() => {
    forgetAdminSession();
    check();
  }, [check]);

  if (session.status === "checking") {
    return (
      <div className="flex min-h-[70svh] items-center justify-center px-4 py-24" role="status" aria-live="polite">
        <p className="font-display text-sm tracking-[0.24em] text-fog">{t(lang, "mk_admin_checking")}</p>
      </div>
    );
  }

  if (session.status === "anonymous") {
    return (
      <AdminLogin
        lang={lang}
        googleClientId={session.googleClientId}
        passcodeLogin={session.passcodeLogin}
        onSignedIn={refreshIdentity}
      />
    );
  }

  return <AdminDashboard lang={lang} email={session.email} onSignedOut={refreshIdentity} />;
}
