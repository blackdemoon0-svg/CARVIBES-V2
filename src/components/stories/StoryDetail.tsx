import { useEffect, useMemo, useRef, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import { stories, type Story } from "../../lib/stories";
import { cars } from "../../lib/db";
import type { Car } from "../../lib/cars";
import { formatStat } from "../../lib/carUtils";
import {
  toggleSavedStory,
  isStorySaved,
  getStoryProgress,
  saveStoryProgress,
  subscribePrefs,
} from "../../lib/prefs";
import { ArrowRight } from "../icons";
import StoryImage from "./StoryImage";

function relatedStories(story: Story, limit = 3): Story[] {
  return stories
    .filter((s) => s.id !== story.id)
    .map((s) => {
      const shared = s.categories.filter((c) => story.categories.includes(c)).length;
      const sameBrand = s.brand === story.brand ? 1 : 0;
      return { s, score: shared + sameBrand };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export default function StoryDetail({
  story,
  lang,
  onClose,
  onOpenStory,
  onOpenCar,
  onCompareCar,
}: {
  story: Story;
  lang: Lang;
  onClose: () => void;
  onOpenStory: (s: Story) => void;
  onOpenCar: (c: Car) => void;
  onCompareCar?: (c: Car) => void;
}) {
  const [started, setStarted] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [saved, setSaved] = useState(isStorySaved(story.id));
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  const linkedCar = useMemo(
    () => (story.carId ? cars.find((c) => c.id === story.carId) : undefined),
    [story.carId]
  );
  const related = useMemo(() => relatedStories(story), [story]);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      audioRef.current?.ctx.close();
    };
  }, [onClose]);

  useEffect(() => subscribePrefs(() => setSaved(isStorySaved(story.id))), [story.id]);

  const totalChapters = story.chapters.length;
  const progress = getStoryProgress(story.id);
  const isComplete = progress >= 95;

  // Scroll progress tracking
  useEffect(() => {
    if (!started) return;
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      saveStoryProgress(story.id, pct);

      // detect current chapter
      let current = 0;
      chapterRefs.current.forEach((node, i) => {
        if (node && node.getBoundingClientRect().top < window.innerHeight * 0.4) {
          current = i;
        }
      });
      setChapter(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [started, story.id]);

  // Ambient sound (original generated audio, OFF by default — never autoplays)
  const audioRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const toggleSound = () => {
    if (soundOn) {
      audioRef.current?.ctx.close();
      audioRef.current = null;
      setSoundOn(false);
    } else {
      try {
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        gain.gain.value = 0.04; // very subtle
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 55; // low ambient drone
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.value = 82.5;
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc2.start();
        audioRef.current = { ctx, gain };
        setSoundOn(true);
      } catch {
        setSoundOn(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto bg-ink">
      <div ref={contentRef} className="relative">
        {/* Ambient accent glow */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-[60vh] opacity-20"
          style={{
            background: `radial-gradient(60% 60% at 50% 10%, ${story.accent || "#e3262e"}33 0%, transparent 70%)`,
          }}
        />

        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/85 px-5 py-4 backdrop-blur-xl sm:px-8">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 text-[12px] font-medium tracking-[0.18em] text-mist transition-colors hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            {t(lang, "st_eyebrow")}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSound}
              className={`flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] transition-colors ${
                soundOn ? "text-accent-soft" : "text-mist hover:text-white"
              }`}
            >
              {soundOn ? "🔊" : "🔇"} {soundOn ? t(lang, "st_sound_on") : t(lang, "st_sound_off")}
            </button>
            <button
              onClick={() => {
                toggleSavedStory(story.id);
              }}
              className={`flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] transition-colors ${
                saved ? "text-accent-soft" : "text-mist hover:text-white"
              }`}
            >
              <span>{saved ? "♥" : "♡"}</span>
              {saved ? t(lang, "st_saved") : t(lang, "st_save")}
            </button>
          </div>
        </div>

        {/* ---- HERO ---- */}
        <div className="relative flex min-h-[90svh] flex-col justify-end overflow-hidden">
          <StoryImage
            src={story.image}
            alt={story.title}
            title={story.title}
            accent={story.accent}
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-14 sm:px-8">
            <p className="hero-in text-xs font-medium tracking-[0.2em] text-mist">
              {story.car.toUpperCase()} · {story.year} · {story.readTime} {t(lang, "st_min_read")}
            </p>
            <h1 className="hero-in mt-3 font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl">
              {story.title}
            </h1>
            <p className="hero-in mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg" style={{ animationDelay: "150ms" }}>
              {story.description}
            </p>

            {!started && (
              <button
                onClick={() => {
                  setStarted(true);
                  setTimeout(() => window.scrollTo({ top: window.innerHeight * 0.4, behavior: "smooth" }), 50);
                }}
                className="hero-in group mt-8 inline-flex h-14 items-center gap-3 bg-accent px-9 text-[12px] font-semibold tracking-[0.2em] text-white transition-colors hover:bg-accent-soft"
                style={{ animationDelay: "280ms" }}
              >
                {progress > 0 && !isComplete ? t(lang, "st_continue") : t(lang, "st_start")}
                {progress > 0 && !isComplete && (
                  <span className="text-[11px] opacity-80">{progress}%</span>
                )}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ---- CHAPTER PROGRESS (sticky) ---- */}
        {started && (
          <div className="sticky top-[57px] z-20 border-b border-line bg-ink/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-3 sm:px-8">
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-mist">
                {String(chapter + 1).padStart(2, "0")} / {String(totalChapters).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 bg-line">
                <div
                  className="h-full bg-accent transition-all duration-200"
                  style={{ width: `${((chapter + 1) / totalChapters) * 100}%` }}
                />
              </div>
              <span className="text-[10px] tracking-[0.16em] text-fog">
                {getStoryProgress(story.id)}%
              </span>
            </div>
          </div>
        )}

        {/* ---- CHAPTERS ---- */}
        {started && (
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
            {story.chapters.map((ch, i) => (
              <section
                key={i}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
                className={`mb-24 transition-opacity duration-500 ${i <= chapter ? "opacity-100" : "opacity-60"}`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-display text-sm font-semibold tracking-[0.2em] text-accent">
                    {t(lang, "st_chapter")} {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {ch.title}
                </h2>
                {ch.quote && (
                  <blockquote className="mt-6 border-l-2 border-accent pl-5 text-lg font-light italic leading-relaxed text-mist">
                    “{ch.quote}”
                  </blockquote>
                )}
                <div className="mt-6 space-y-5">
                  {ch.paragraphs.map((p, j) => (
                    <p key={j} className="text-[15px] leading-[1.85] text-mist">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {/* ---- Cinematic transition ---- */}
            <div className="relative my-16 flex flex-col items-center justify-center py-20 text-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="h-px w-full bg-line" />
              </div>
              <p className="relative bg-ink px-6 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {t(lang, "st_transition_1")}
              </p>
              <p className="relative mt-3 bg-ink px-6 text-sm tracking-mega text-accent">
                {t(lang, "st_transition_2")}
              </p>
            </div>

            {/* ---- THE MACHINE (specs) ---- */}
            <section className="mb-24 border border-line bg-charcoal p-6 sm:p-10">
              <p className="mb-2 text-[11px] font-semibold tracking-mega text-accent">
                {t(lang, "st_machine")}
              </p>
              <h2 className="mb-8 font-display text-3xl font-bold text-white">
                {linkedCar ? `${linkedCar.brand} ${linkedCar.model}` : story.car}
              </h2>

              {linkedCar ? (
                <>
                  <div className="mb-8 aspect-[16/9]">
                    <StoryImage
                      src={linkedCar.image}
                      alt={linkedCar.model}
                      title={linkedCar.model}
                      accent={story.accent}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
                    {[
                      { k: "st_hp", v: `${formatStat(linkedCar.hp)} hp` },
                      { k: "st_torque", v: linkedCar.torque ? `${formatStat(linkedCar.torque)} Nm` : "N/A" },
                      { k: "st_engine", v: linkedCar.engine },
                      { k: "st_zerohundred", v: linkedCar.zeroToHundred ? `${linkedCar.zeroToHundred}s` : "N/A" },
                      { k: "st_topspeed", v: linkedCar.topSpeed ? `${formatStat(linkedCar.topSpeed)} km/h` : "N/A" },
                      { k: "st_weight", v: linkedCar.weight ? `${formatStat(linkedCar.weight)} kg` : "N/A" },
                    ].map((s) => (
                      <div key={s.k} className="bg-charcoal px-4 py-4">
                        <p className="text-[9px] font-medium tracking-[0.16em] text-fog">{t(lang, s.k)}</p>
                        <p className="mt-1 truncate font-display text-base font-semibold text-white">{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => onOpenCar(linkedCar)}
                      className="group inline-flex h-13 items-center gap-3 border border-white/25 px-7 text-[12px] font-semibold tracking-[0.18em] text-white transition-colors hover:border-accent hover:bg-accent"
                    >
                      {t(lang, "st_explore_car")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    {onCompareCar && (
                      <button
                        onClick={() => onCompareCar(linkedCar)}
                        className="inline-flex h-13 items-center gap-2 border border-white/25 px-7 text-[12px] font-semibold tracking-[0.18em] text-mist transition-colors hover:border-accent hover:text-white"
                      >
                        ⚔ {t(lang, "cp_compare")}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-mist">{story.description}</p>
              )}
            </section>

            {/* ---- Gallery ---- */}
            {story.gallery && story.gallery.length > 1 && (
              <section className="mb-24">
                <h3 className="mb-6 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                  <span className="h-px w-6 bg-accent" />
                  {t(lang, "st_machine")} · {t(lang, "st_specs")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {story.gallery.slice(1).map((g, i) => (
                    <StoryImage
                      key={i}
                      src={g}
                      alt={`${story.car} image ${i + 2}`}
                      title={story.car}
                      accent={story.accent}
                      className={`aspect-[4/3] ${i === 0 ? "col-span-2 aspect-[16/9]" : ""}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ---- Timeline ---- */}
            <section className="mb-24">
              <h3 className="mb-2 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "st_timeline")}
              </h3>
              <div className="mt-10 relative border-l border-line pl-8">
                {story.timeline.map((ev, i) => (
                  <div key={i} className="card-in relative mb-10" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="absolute -left-[38px] top-1 h-3 w-3 border border-accent bg-ink" />
                    <p className="font-display text-2xl font-bold text-white">{ev.year}</p>
                    <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-accent">{ev.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-mist">{ev.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ---- Related stories ---- */}
        {started && related.length > 0 && (
          <div className="border-t border-line bg-ink-2 py-16">
            <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-16">
              <h3 className="mb-8 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
                <span className="h-px w-6 bg-accent" />
                {t(lang, "st_related")}
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {related.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => onOpenStory(s)}
                    className="reveal group relative block aspect-[16/11] overflow-hidden border border-line text-left"
                    data-delay={i * 100}
                  >
                    <StoryImage
                      src={s.image}
                      alt={s.title}
                      title={s.title}
                      accent={s.accent}
                      className="absolute inset-0 h-full w-full"
                      imgClassName="transition-transform duration-[1100ms] group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-[10px] tracking-[0.16em] text-fog">{s.car}</p>
                      <p className="mt-1 font-display text-base font-semibold text-white">{s.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
