import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { LANGS, t, type Lang } from "../lib/i18n";
import { Logo } from "./Logo";
import { SearchIcon, GlobeIcon, ChevronDown, ArrowRight } from "./icons";

interface NavProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare?: () => void;
  onSearch?: () => void;
}

const CENTER_LINKS = [
  { key: "nav_explore", href: "#explore" },
  { key: "nav_find", href: "#find-my-car" },
  { key: "nav_stories", href: "#stories" },
  { key: "nav_favorites", href: "#favorites" },
];

export default function Navigation({ lang, onLangChange, onCompare, onSearch }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setLangOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "glass border-b border-white/[0.06] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1480px] items-center justify-between px-5 transition-all duration-500 sm:px-8",
            scrolled ? "h-14" : "h-20"
          )}
        >
          {/* Left — logo */}
          <a
            href="#top"
            className="flex shrink-0 items-center"
            aria-label="CarVibes home"
          >
            <Logo
              compact={scrolled}
              className="transition-all duration-500"
            />
          </a>

          {/* Center — links */}
          <nav className="hidden items-center gap-10 lg:flex">
            {CENTER_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="nav-link text-[13px] font-medium tracking-[0.18em] text-mist transition-colors duration-300 hover:text-white"
              >
                {t(lang, link.key)}
              </a>
            ))}
          </nav>

          {/* Right — actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compare */}
            <button
              onClick={onCompare}
              aria-label="Compare"
              className="group flex h-9 items-center gap-2 rounded-none border border-transparent px-2.5 text-mist transition-colors hover:border-line hover:text-white sm:px-3"
            >
              <span aria-hidden="true">⚔</span>
              <span className="hidden text-[11px] font-medium tracking-[0.18em] xl:inline">
                {t(lang, "cp_compare")}
              </span>
            </button>

            {/* Search */}
            <button
              onClick={onSearch}
              aria-label={t(lang, "nav_search")}
              className="group flex h-9 items-center gap-2 rounded-none border border-transparent px-2.5 text-mist transition-colors hover:border-line hover:text-white sm:px-3"
            >
              <SearchIcon className="h-4.5 w-4.5" />
              <span className="hidden text-[11px] font-medium tracking-[0.18em] xl:inline">
                {t(lang, "nav_search")}
              </span>
            </button>

            {/* Language dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-label={t(lang, "nav_language")}
                aria-expanded={langOpen}
                className={cn(
                  "group flex h-9 items-center gap-2 border px-3 text-[11px] font-semibold tracking-[0.18em] transition-colors",
                  langOpen
                    ? "border-white/30 text-white"
                    : "border-line text-mist hover:border-white/25 hover:text-white"
                )}
              >
                <GlobeIcon className="h-4 w-4" />
                <span className="uppercase">{lang}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    langOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-44 origin-top-right overflow-hidden border border-line bg-charcoal shadow-2xl shadow-black/50 transition-all duration-200",
                  langOpen
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                )}
              >
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLangChange(l.code);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors",
                      l.code === lang
                        ? "bg-graphite text-white"
                        : "text-mist hover:bg-graphite/60 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base" aria-hidden="true">
                        {l.flag}
                      </span>
                      <span className="font-display text-[13px] font-semibold tracking-[0.08em]">
                        {l.label}
                      </span>
                    </span>
                    {l.code === lang && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 border border-line text-white lg:hidden"
            >
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-all duration-300",
                  mobileOpen && "translate-y-[3.5px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-px w-4 bg-current transition-all duration-300",
                  mobileOpen && "-translate-y-[3.5px] -rotate-45"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-ink/98 pt-24 backdrop-blur-xl transition-all duration-500 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-8">
          {CENTER_LINKS.map((link, i) => (
            <a
              key={link.key}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between border-b border-line py-6 font-display text-2xl font-semibold tracking-tight text-white transition-colors hover:text-accent-soft"
              style={{
                transitionDelay: `${i * 60}ms`,
                ...(mobileOpen
                  ? { opacity: 1, transform: "translateY(0)" }
                  : { opacity: 0, transform: "translateY(12px)" }),
                transition:
                  "opacity 0.4s ease, transform 0.4s ease, color 0.3s ease",
              }}
            >
              {t(lang, link.key)}
              <ArrowRight className="h-5 w-5 text-fog" />
            </a>
          ))}

          {/* Compare action (mobile) */}
          <button
            onClick={() => {
              setMobileOpen(false);
              onCompare?.();
            }}
            className="flex items-center justify-between border-b border-line py-6 font-display text-2xl font-semibold tracking-tight text-white transition-colors hover:text-accent-soft"
          >
            ⚔ {t(lang, "cp_compare")}
            <ArrowRight className="h-5 w-5 text-fog" />
          </button>
        </nav>

        {/* Mobile language selector */}
        <div className="mt-8 px-8">
          <p className="text-[11px] font-medium tracking-mega text-fog">
            {t(lang, "nav_language")}
          </p>
          <div className="mt-4 flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  onLangChange(l.code);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex-1 border py-3 text-center text-sm font-semibold tracking-[0.12em] transition-colors",
                  l.code === lang
                    ? "border-accent bg-accent/10 text-white"
                    : "border-line text-mist hover:border-white/25 hover:text-white"
                )}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
