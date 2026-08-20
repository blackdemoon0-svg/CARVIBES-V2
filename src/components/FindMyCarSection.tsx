import { t, type Lang } from "../lib/i18n";
import { ArrowRight } from "./icons";

export default function FindMyCarSection({
  lang,
  onStart,
}: {
  lang: Lang;
  onStart: () => void;
}) {
  return (
    <section
      id="find-my-car"
      className="relative overflow-hidden border-y border-line bg-charcoal py-28 sm:py-36"
    >
      {/* Subtle radial + speed lines backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(70% 90% at 50% 100%, rgba(227,38,46,0.10) 0%, rgba(9,9,9,0) 60%)",
          }}
        />
        {/* Speed lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-[-10%] top-1/2 h-px bg-white/[0.03]"
            style={{
              width: "120%",
              transform: `translateY(${(i - 3) * 60}px) rotate(-8deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="reveal mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-mega text-fog">
          <span className="h-px w-8 bg-accent" />
          {t(lang, "findmine_eyebrow")}
          <span className="h-px w-8 bg-accent" />
        </p>
        <h2 className="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
          {t(lang, "findmine_title")}
        </h2>
        <p
          className="reveal mx-auto mt-6 max-w-lg text-base leading-relaxed text-mist sm:text-lg"
          data-delay="120"
        >
          {t(lang, "findmine_sub")}
        </p>

        <div className="reveal mt-12" data-delay="220">
          <button
            onClick={onStart}
            className="group inline-flex h-16 items-center gap-3 bg-accent px-12 text-[13px] font-semibold tracking-[0.2em] text-white transition-all duration-300 hover:bg-accent-soft hover:shadow-[0_0_60px_-10px_rgba(227,38,46,0.7)]"
          >
            {t(lang, "findmine_cta")}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
