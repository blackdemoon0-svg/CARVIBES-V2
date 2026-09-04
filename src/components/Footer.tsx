import { Link } from "react-router-dom";
import { LANGS, t, type Lang } from "../lib/i18n";
import { startOnboarding, requestOnboardingAfterNav } from "../lib/onboarding";
import { Logo } from "./Logo";
import { YouTubeIcon, InstagramIcon } from "./icons";

interface FooterProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare?: () => void;
}

const LINK_GROUPS: {
  titleKey: string;
  links: { labelKey: string; to: string; external?: boolean; help?: boolean }[];
}[] = [
  {
    titleKey: "nav_group_discover",
    links: [
      { labelKey: "footer_explore", to: "/explore" },
      { labelKey: "nav_find", to: "/find-my-car" },
      { labelKey: "nav_stories", to: "/news" },
      { labelKey: "nav_favorites", to: "/favorites" },
      { labelKey: "footer_how_to", to: "/#how-to", help: true },
    ],
  },
  {
    titleKey: "footer_group_company",
    links: [
      { labelKey: "footer_about", to: "/#top" },
      { labelKey: "nav_contact", to: "/contact" },
    ],
  },
];

export default function Footer({ lang, onLangChange, onCompare }: FooterProps) {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto max-w-[1480px] px-5 py-16 sm:px-8 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/#top" aria-label={t(lang, "aria_home")}>
              <Logo />
            </Link>
            <p className="mt-4 text-[11px] font-medium tracking-mega text-fog">
              {t(lang, "footer_tagline")}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">
              {t(lang, "footer_desc")}
            </p>
            {/* Social */}
            <div className="mt-8 flex gap-3">
              {[
                {
                  icon: YouTubeIcon,
                  label: "YouTube",
                  ariaKey: "aria_youtube",
                  href: "https://www.youtube.com/@CarVibes-m6i",
                },
                {
                  icon: InstagramIcon,
                  label: "Instagram",
                  ariaKey: "aria_instagram",
                  href: "https://www.instagram.com/carvibesinsta/?hl=en",
                },
              ].map(({ icon: Icon, label, ariaKey, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(lang, ariaKey)}
                  className="group flex h-10 w-10 items-center justify-center border border-line text-mist transition-all duration-300 hover:border-white/40 hover:bg-charcoal hover:text-white"
                >
                  <Icon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {LINK_GROUPS.map((group) => (
            <div key={group.titleKey}>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] text-fog">
                {t(lang, group.titleKey).toUpperCase()}
              </h4>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    {link.help ? (
                      <Link
                        to={link.to}
                        onClick={() => {
                          // Same page (homepage): start immediately.
                          // Other pages: start as soon as the homepage mounts.
                          if (
                            typeof window !== "undefined" &&
                            window.location.pathname === "/"
                          ) {
                            startOnboarding();
                          } else {
                            requestOnboardingAfterNav();
                          }
                        }}
                        className="text-sm text-mist transition-colors duration-300 hover:text-white"
                      >
                        {t(lang, link.labelKey)}
                      </Link>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-mist transition-colors duration-300 hover:text-white"
                      >
                        {t(lang, link.labelKey)}
                      </Link>
                    )}
                  </li>
                ))}
                {group.titleKey === "nav_group_discover" && onCompare && (
                  <li>
                    <button
                      onClick={onCompare}
                      className="text-sm text-mist transition-colors duration-300 hover:text-white"
                    >
                      {t(lang, "footer_compare")}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}

          {/* Language */}
          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-fog">
              <span aria-hidden="true">🌐</span>
              {t(lang, "nav_language").toUpperCase()}
            </h4>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLangChange(l.code)}
                  aria-label={l.label}
                  className={`flex items-center gap-2 border px-3 py-2.5 text-left text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    l.code === lang
                      ? "border-accent bg-accent/10 text-white"
                      : "border-line text-mist hover:border-white/25 hover:bg-charcoal hover:text-white"
                  }`}
                >
                  <span aria-hidden="true">{l.flag}</span>
                  <span className="truncate">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-xs text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>{t(lang, "footer_rights")}</p>
          <p>{t(lang, "footer_tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
