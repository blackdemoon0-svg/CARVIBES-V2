import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { t, type Lang } from "../../lib/i18n";
import { cars } from "../../lib/db";
import type { Car } from "../../lib/cars";
import { stories, type Story } from "../../lib/stories";
import {
  getFavoriteIds,
  getSavedStoryIds,
  getRecentIds,
  toggleFavorite,
  toggleSavedStory,
  clearRecent,
  subscribePrefs,
} from "../../lib/prefs";
import { formatPrice, formatStat } from "../../lib/carUtils";
import { ArrowRight } from "../icons";

export default function FavoritesSection({
  lang,
  onOpenCar,
  onOpenStory,
  onCompareCar,
}: {
  lang: Lang;
  onOpenCar: (c: Car) => void;
  onOpenStory: (s: Story) => void;
  onCompareCar: (c: Car) => void;
}) {
  const [tab, setTab] = useState<"cars" | "stories">("cars");
  const [, force] = useState(0);

  useEffect(() => subscribePrefs(() => force((x) => x + 1)), []);

  const favCars = useMemo(
    () => getFavoriteIds().map((id) => cars.find((c) => c.id === id)).filter(Boolean) as Car[],
    []
  );
  const favStories = useMemo(
    () => getSavedStoryIds().map((id) => stories.find((s) => s.id === id)).filter(Boolean) as Story[],
    []
  );
  const recentCars = useMemo(
    () => getRecentIds().map((id) => cars.find((c) => c.id === id)).filter(Boolean) as Car[],
    []
  );

  return (
    <section id="favorites" className="border-t border-line bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <p className="reveal mb-4 flex items-center gap-3 text-[11px] font-medium tracking-mega text-fog">
            <span className="h-px w-8 bg-accent" />
            {t(lang, "fav_title").toUpperCase()}
          </p>
          <h2 className="reveal font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {t(lang, "fav_title")}
          </h2>
          <p className="reveal mt-4 text-sm text-mist" data-delay="120">
            {t(lang, "fav_sub")}
          </p>
        </div>

        {/* Tabs */}
        <div className="reveal mb-8 flex border border-line">
          <button
            onClick={() => setTab("cars")}
            className={`px-6 py-3 text-[11px] font-semibold tracking-[0.16em] transition-colors ${
              tab === "cars" ? "bg-accent text-white" : "text-mist hover:text-white"
            }`}
          >
            {t(lang, "fav_cars_tab")} ({favCars.length})
          </button>
          <button
            onClick={() => setTab("stories")}
            className={`px-6 py-3 text-[11px] font-semibold tracking-[0.16em] transition-colors ${
              tab === "stories" ? "bg-accent text-white" : "text-mist hover:text-white"
            }`}
          >
            {t(lang, "fav_stories_tab")} ({favStories.length})
          </button>
        </div>

        {/* Cars tab */}
        {tab === "cars" && (
          <>
            {favCars.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {favCars.map((c, i) => (
                  <div key={c.id} className="card-in group flex flex-col border border-line bg-charcoal" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className="relative aspect-[16/11] overflow-hidden bg-graphite">
                      <img
                        src={c.image}
                        alt={c.model}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.07]"
                       decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-base font-semibold text-white">
                        {c.brand} <span className="font-normal text-mist">{c.model}</span>
                      </h3>
                      <p className="mt-1 text-xs text-fog">
                        {formatPrice(c.price, lang)} · {formatStat(c.hp)} hp
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <button
                          onClick={() => onOpenCar(c)}
                          className="col-span-2 flex h-10 items-center justify-center border border-white/25 px-3 text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:border-accent hover:bg-accent sm:col-span-1 sm:flex-1"
                        >
                          {t(lang, "fmc_explore")}
                        </button>
                        <button
                          onClick={() => onCompareCar(c)}
                          className="flex h-10 items-center gap-1 border border-white/25 px-3 text-[10px] font-semibold tracking-[0.12em] text-mist transition-colors hover:border-white/50 hover:text-white"
                        >
                          ⚔ {t(lang, "cp_compare")}
                        </button>
                        <button
                          onClick={() => toggleFavorite(c.id)}
                          className="flex h-10 items-center gap-1 border border-accent/40 bg-accent/10 px-3 text-[10px] font-semibold tracking-[0.12em] text-accent-soft transition-colors hover:bg-accent/20"
                        >
                          ✕ {t(lang, "fav_remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t(lang, "fav_empty")} cta={t(lang, "fav_explore")} to="/explore" />
            )}
          </>
        )}

        {/* Stories tab */}
        {tab === "stories" && (
          <>
            {favStories.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {favStories.map((s, i) => (
                  <div key={s.id} className="card-in group relative flex flex-col border border-line bg-charcoal" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
                      <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.07]"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-base font-semibold text-white">{s.title}</h3>
                      <p className="mt-1 text-xs text-fog">{s.car} · {s.year}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => onOpenStory(s)}
                          className="flex h-10 min-w-0 flex-1 items-center justify-center border border-white/25 px-3 text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:border-accent hover:bg-accent"
                        >
                          {t(lang, "st_read_story")}
                        </button>
                        <button
                          onClick={() => toggleSavedStory(s.id)}
                          className="flex h-10 items-center gap-1 border border-accent/40 bg-accent/10 px-3 text-[10px] font-semibold tracking-[0.12em] text-accent-soft transition-colors hover:bg-accent/20"
                        >
                          ✕ {t(lang, "fav_remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t(lang, "fav_empty_stories")} cta={t(lang, "st_explore")} to="/news" />
            )}
          </>
        )}

        {/* Recently viewed */}
        <div className="mt-24">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
              <span className="h-px w-6 bg-accent" />
              {t(lang, "fav_last_viewed").toUpperCase()}
            </h3>
            {recentCars.length > 0 && (
              <button
                onClick={clearRecent}
                className="text-[11px] font-semibold tracking-[0.14em] text-fog transition-colors hover:text-accent-soft"
              >
                {t(lang, "fav_clear_history")}
              </button>
            )}
          </div>
          {recentCars.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex w-max gap-4">
                {recentCars.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onOpenCar(c)}
                    className="group flex w-40 flex-col border border-line bg-charcoal text-left transition-colors hover:border-white/25"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-graphite">
                      <img src={c.image} alt={c.model} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"  decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=200&h=140"; }} />
                    </div>
                    <div className="p-3">
                      <p className="truncate font-display text-sm font-semibold text-white">{c.brand} {c.model}</p>
                      <p className="text-[11px] text-fog">{c.year}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-fog">{t(lang, "fav_empty_recent")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ message, cta, to }: { message: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-line py-20 text-center">
      <p className="max-w-sm text-sm text-mist">{message}</p>
      <Link
        to={to}
        className="group mt-6 inline-flex h-12 items-center gap-3 border border-accent bg-accent px-7 text-[11px] font-semibold tracking-[0.18em] text-white transition-colors hover:bg-accent-soft"
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
