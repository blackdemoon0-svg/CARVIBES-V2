// ============================================================
// CARVIBES / MARKETVIBES — Creator Dashboard entry (marketplace surface)
//
// The marketplace runs without the site header, so the administrator needs
// a way in from here too. This chip is that way in.
//
// It is a CONVENIENCE, never a security boundary:
//   * it renders only when GET /admin/session confirms an allow-listed
//     administrator (`useAdminIdentity` fails closed on any doubt, so the
//     element is absent from the DOM for visitors and normal sellers);
//   * a normal signed-in user who types /admin/marketplace still gets the
//     sign-in gate, and every admin API call re-verifies the cookie AND the
//     e-mail allowlist server-side.
// ============================================================

import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { useAdminIdentity } from "../../lib/marketplace/useAdminIdentity";
import { ShieldIcon } from "../icons";

export default function AdminEntry({ lang, className = "" }: { lang: Lang; className?: string }) {
  const { isAdmin } = useAdminIdentity();
  if (!isAdmin) return null;

  return (
    <Link
      to="/admin/marketplace"
      data-admin-entry="marketplace"
      className={`group inline-flex items-center gap-2 border border-amber-400/30 bg-amber-400/[0.07] px-3 py-2 text-[10px] font-semibold tracking-[0.18em] text-amber-200/90 transition-colors duration-300 hover:border-amber-300/60 hover:bg-amber-400/15 hover:text-amber-100 ${className}`}
    >
      <ShieldIcon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{t(lang, "nav_creator_dashboard")}</span>
      <span className="sm:hidden">{t(lang, "nav_creator_dashboard_short")}</span>
    </Link>
  );
}
