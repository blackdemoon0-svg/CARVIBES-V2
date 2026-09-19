// ============================================================
// CARVIBES / MARKETVIBES — /marketplace/sell
//
// The seller funnel. Deliberately noindex (a submission form has no
// search value and must never compete with real listings), and it is
// excluded from the sitemap in scripts/generate-sitemap.mjs.
// ============================================================

import { t, type Lang } from "../../lib/i18n";
import { useMarketplaceMeta } from "../../lib/marketplace/useMeta";
import SellWizard from "../../components/marketplace/sell/SellWizard";

export default function SellPage({ lang }: { lang: Lang }) {
  useMarketplaceMeta({
    title: t(lang, "mk_sell_meta_title"),
    description: t(lang, "mk_sell_meta_desc"),
    canonicalPath: "/marketplace/sell",
    indexable: false,
  });

  return (
    <div className="quiz-arena min-h-screen">
      <SellWizard lang={lang} />
    </div>
  );
}
