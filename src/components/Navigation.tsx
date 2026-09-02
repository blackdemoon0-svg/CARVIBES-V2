import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "../utils/cn";
import { LANGS, t, type Lang } from "../lib/i18n";
import { useBodyScrollLock } from "../lib/useOverlay";
import { Logo } from "./Logo";
import { SearchIcon, GlobeIcon, ChevronDown, ArrowRight } from "./icons";

interface NavProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare?: () => void;
  onSearch?: () => void;
}

// ---------------------------------------------------------------------------
// Navigation model
//
// Desktop keeps 4 primary destinations visible; everything secondary lives in
// a "More" dropdown. Mobile groups the same destinations into DISCOVER / TOOLS.
// A destination carrying a `section` id points at a homepage section (hash
// route such as /#rankings) and therefore needs explicit scroll handling.
// ---------------------------------------------------------------------------

interface Destination {
  key: string;
  to: string;
  section?: string;
}

const PRIMARY_LINKS: Destination[] = [
  { key: "nav_explore", to: "/explore" },
  { key: "nav_brands", to: "/brands" },
  { key: "nav_guides", to: "/news" },
  { key: "nav_rankings", to: "/#rankings", section: "rankings" },
];

const SECONDARY_LINKS: Destination[] = [
  { key: "nav_find", to: "/find-my-car" },
  { key: "nav_favorites", to: "/favorites" },
  { key: "nav_contact", to: "/contact" },
];

const MOBILE_GROUPS: { titleKey: string; links: Destination[] }[] = [
  {
    titleKey: "nav_group_discover",
    links: [{ key: "nav_home", to: "/#top", section: "top" }, ...PRIMARY_LINKS],
  },
  {
    titleKey: "nav_group_tools",
    links: SECONDARY_LINKS,
  },
];

function scrollToSection(section: string) {
  document
    .getElementById(section)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const linkClasses =
  "nav-link text-[13px] font-medium tracking-[0.18em] transition-colors duration-300 hover:text-white";

export default function Navigation({
  lang,
  onLangChange,
  onCompare,
  onSearch,
}: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      setLangOpen(false);
      setMoreOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Lock the page behind the mobile menu while it is open.
  useBodyScrollLock(mobileOpen);

  // Scroll to the homepage section named by the URL hash (e.g. /#rankings).
  // React Router does not scroll to hash anchors by itself, so this runs after
  // every navigation — it works both on the homepage and when arriving there
  // from another route (the homepage DOM is mounted by effect time).
  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const section = location.hash.slice(1);
    const frame = requestAnimationFrame(() => scrollToSection(section));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  // Same-page section clicks: update-free re-scroll, and close any open menu.
  // Cross-route clicks are left to the hash effect above, which fires once the
  // homepage has rendered.
  const handleSectionClick = (section?: string) => {
    setMoreOpen(false);
    setMobileOpen(false);
    if (!section || location.pathname !== "/") return;
    // Defer so the mobile menu can unlock body scrolling first.
    window.setTimeout(() => scrollToSection(section), 60);
  };

  const renderSectionAwareLink = (
    link: Destination,
    className: string,
    children: React.ReactNode
  ) =>
    link.section ? (
      <Link
        key={link.key}
        to={link.to}
        onClick={() => handleSectionClick(link.section)}
        className={className}
      >
        {children}
      </Link>
    ) : (
      <NavLink
        key={link.key}
        to={link.to}
        onClick={() => handleSectionClick()}
        className={({ isActive }) =>
          cn(className, isActive ? "text-white" : undefined)
        }
      >
        {children}
      </NavLink>
    );

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
            "mx-auto flex max-w-[1480px] items-center justify-between px-4 transition-all duration-500 sm:px-8",
            scrolled ? "h-14" : "h-20"
          )}
        >
          {/* Left — logo (Home) */}
          <Link
            to="/#top"
            onClick={() => handleSectionClick("top")}
            className="flex shrink-0 items-center"
            aria-label="CarVibes home"
          >
            <Logo
              compact={scrolled}
              className="transition-all duration-500"
            />
          </Link>

          {/* Center — primary destinations + "More" menu */}
          <nav className="hidden items-center gap-8 lg:flex">
            {PRIMARY_LINKS.map((link) =>
              renderSectionAwareLink(link, cn(linkClasses, "text-mist"), t(lang, link.key))
            )}

            {/* Secondary destinations */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                aria-label={t(lang, "nav_more")}
                aria-expanded={moreOpen}
                className={cn(
                  "group flex h-9 items-center gap-2 border px-3 text-[11px] font-semibold tracking-[0.18em] transition-colors",
                  moreOpen
                    ? "border-white/30 text-white"
                    : "border-line text-mist hover:border-white/25 hover:text-white"
                )}
              >
                {t(lang, "nav_more")}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    moreOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute right-0 top-full mt-2 w-52 origin-top-right overflow-hidden border border-line bg-charcoal shadow-2xl shadow-black/50 transition-all duration-200",
                  moreOpen
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                )}
              >
                {SECONDARY_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    to={link.to}
                    onClick={() => setMoreOpen(false)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-[11px] font-semibold tracking-[0.18em] text-mist transition-colors hover:bg-graphite/60 hover:text-white"
                  >
                    {t(lang, link.key)}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    onCompare?.();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[11px] font-semibold tracking-[0.18em] text-mist transition-colors hover:bg-graphite/60 hover:text-white"
                >
                  <span aria-hidden="true">⚔</span>
                  {t(lang, "cp_compare")}
                </button>
              </div>
            </div>
          </nav>

          {/* Right — actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search — primary CTA */}
            <button
              onClick={onSearch}
              aria-label={t(lang, "nav_search")}
              className="group flex h-10 items-center gap-2 bg-accent px-2.5 text-white transition-all duration-300 hover:bg-accent-soft hover:shadow-[0_0_24px_-6px_rgba(227,38,46,0.6)] sm:px-4"
            >
              <SearchIcon className="h-4.5 w-4.5" />
              <span className="hidden text-[11px] font-semibold tracking-[0.18em] md:inline">
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
                  "group flex h-10 items-center gap-2 border px-2.5 text-[11px] font-semibold tracking-[0.18em] transition-colors sm:px-3",
                  langOpen
                    ? "border-white/30 text-white"
                    : "border-line text-mist hover:border-white/25 hover:text-white"
                )}
              >
                <GlobeIcon className="h-4 w-4" />
                <span className="hidden uppercase min-[380px]:inline">{lang}</span>
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
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-line text-white lg:hidden"
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
          "fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink/98 pt-20 backdrop-blur-xl transition-all duration-500 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="px-5 pt-6 sm:px-8">
          {MOBILE_GROUPS.map((group, gi) => (
            <div key={group.titleKey} className={gi > 0 ? "mt-7" : undefined}>
              <p className="pb-2 text-[11px] font-medium tracking-mega text-fog">
                {t(lang, group.titleKey)}
              </p>
              <nav className="flex flex-col">
                {group.links.map((link, i) => (
                  <Link
                    key={link.key}
                    to={link.to}
                    onClick={() => handleSectionClick(link.section)}
                    className="flex items-center justify-between border-b border-line py-4 font-display text-xl font-semibold tracking-tight text-white transition-colors hover:text-accent-soft"
                    style={{
                      transitionDelay: `${(gi * 5 + i) * 40}ms`,
                      ...(mobileOpen
                        ? { opacity: 1, transform: "translateY(0)" }
                        : { opacity: 0, transform: "translateY(12px)" }),
                      transition:
                        "opacity 0.4s ease, transform 0.4s ease, color 0.3s ease",
                    }}
                  >
                    {t(lang, link.key)}
                    <ArrowRight className="h-5 w-5 text-fog" />
                  </Link>
                ))}
                {group.titleKey === "nav_group_tools" && (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onCompare?.();
                    }}
                    className="flex items-center justify-between border-b border-line py-4 text-left font-display text-xl font-semibold tracking-tight text-white transition-colors hover:text-accent-soft"
                    style={{
                      transitionDelay: `${(gi * 5 + group.links.length) * 40}ms`,
                      ...(mobileOpen
                        ? { opacity: 1, transform: "translateY(0)" }
                        : { opacity: 0, transform: "translateY(12px)" }),
                      transition:
                        "opacity 0.4s ease, transform 0.4s ease, color 0.3s ease",
                    }}
                  >
                    ⚔ {t(lang, "cp_compare")}
                    <ArrowRight className="h-5 w-5 text-fog" />
                  </button>
                )}
              </nav>
            </div>
          ))}
        </div>

        {/* Mobile language selector */}
        <div className="mt-8 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8">
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
