import { Link } from "react-router-dom";
import { t, type Lang } from "../../../lib/i18n";

interface Props {
  lang: Lang;
  variant: "car" | "used" | "marketplace";
  /** Prefill target, e.g. /analyze?brand=BMW&model=330i&year=2021 */
  to?: string;
}

/**
 * Contextual shortcut to CarVibes Analyse, placed on car sheets,
 * the Used Cars guide and the marketplace. One component, three
 * editorial variants — all strings via i18n.
 */
const KEY_INFIX: Record<Props["variant"], string> = {
  car: "car",
  used: "used",
  marketplace: "market",
};

export default function AnalyzePromoBanner({ lang, variant, to = "/analyze" }: Props) {
  const k = KEY_INFIX[variant];
  return (
    <aside
      aria-label={t(lang, "az_title")}
      className="az-glass az-rise relative overflow-hidden rounded-2xl p-5 sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-accent-soft">
            <span aria-hidden>✨</span>
            {t(lang, "az_launch_badge")}
          </p>
          <p className="font-display text-lg font-bold leading-snug text-white sm:text-xl">
            {t(lang, `az_cta_${k}_title`)}
          </p>
          <p className="mt-1 text-sm text-mist">{t(lang, `az_cta_${k}_sub`)}</p>
        </div>
        <Link
          to={to}
          className="az-btn-primary shrink-0 !px-6 !py-3 !text-xs sm:w-auto"
        >
          ◈ {t(lang, `az_cta_${k}_btn`)}
        </Link>
      </div>
    </aside>
  );
}
