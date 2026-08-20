import { useEffect, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import {
  isFavorite,
  toggleFavorite,
  isCompared,
  addToCompare,
  subscribePrefs,
} from "../../lib/prefs";

/** Heart save toggle — persists to localStorage and stays in sync. */
export function SaveButton({
  carId,
  lang,
  className = "",
}: {
  carId: string;
  lang: Lang;
  className?: string;
}) {
  const [saved, setSaved] = useState(isFavorite(carId));

  useEffect(() => subscribePrefs(() => setSaved(isFavorite(carId))), [carId]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(carId);
      }}
      aria-label={saved ? t(lang, "cp_saved") : t(lang, "cp_save")}
      className={`group/save flex h-11 items-center gap-2 border px-4 text-[11px] font-semibold tracking-[0.14em] transition-all duration-300 ${
        saved
          ? "border-accent bg-accent/10 text-white"
          : "border-white/25 text-mist hover:border-white/50 hover:text-white"
      } ${className}`}
    >
      <span className={`transition-transform duration-300 ${saved ? "scale-110" : "group-hover/save:scale-110"}`}>
        {saved ? "❤️" : "♡"}
      </span>
      <span className="hidden sm:inline">{saved ? t(lang, "cp_saved") : t(lang, "cp_save")}</span>
    </button>
  );
}

/** Compare toggle — adds/removes and respects the 3-car cap. */
export function CompareButton({
  carId,
  lang,
  onMax,
  className = "",
}: {
  carId: string;
  lang: Lang;
  onMax?: () => void;
  className?: string;
}) {
  const [inList, setInList] = useState(isCompared(carId));

  useEffect(() => subscribePrefs(() => setInList(isCompared(carId))), [carId]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        const res = addToCompare(carId);
        if (res === "full") onMax?.();
      }}
      aria-label={t(lang, "cp_compare")}
      className={`group/cmp flex h-11 items-center gap-2 border px-4 text-[11px] font-semibold tracking-[0.14em] transition-all duration-300 ${
        inList
          ? "border-accent bg-accent/10 text-white"
          : "border-white/25 text-mist hover:border-white/50 hover:text-white"
      } ${className}`}
    >
      <span className={`transition-transform duration-300 ${inList ? "scale-110" : "group-hover/cmp:scale-110"}`}>
        ⚔
      </span>
      <span>{inList ? "✓" : ""} {t(lang, "cp_compare")}</span>
    </button>
  );
}
