import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";
import { t, type Lang } from "../../lib/i18n";
import { getCompareIds, subscribePrefs } from "../../lib/prefs";

export default function CompareBar({
  lang,
  onOpen,
}: {
  lang: Lang;
  onOpen: () => void;
}) {
  const [count, setCount] = useState(getCompareIds().length);

  useEffect(() => subscribePrefs(() => setCount(getCompareIds().length)), []);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
      <button
        onClick={onOpen}
        className={cn(
          "glass group flex items-center gap-3 border-white/15 px-5 py-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] transition-all duration-300 hover:border-accent/60 hover:shadow-[0_16px_50px_-12px_rgba(227,38,46,0.45)]"
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center bg-accent font-display text-sm font-bold text-white">
          {count}
        </span>
        <span className="text-[11px] font-semibold tracking-[0.18em] text-white">
          {t(lang, "cp_compare")} ({count})
        </span>
        <span className="text-[10px] tracking-[0.14em] text-mist transition-colors group-hover:text-accent-soft">
          {t(lang, "cp_battle")} →
        </span>
      </button>
    </div>
  );
}
