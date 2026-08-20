import { LANGS, t, type Lang } from "../lib/i18n";
import { Logo } from "./Logo";
import { YouTubeIcon, InstagramIcon } from "./icons";

interface FooterProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onCompare?: () => void;
}

const LINK_GROUPS = [
  {
    title: "DISCOVER",
    links: [
      { label: "Explore", href: "#explore" },
      { label: "Find My Car", href: "#find-my-car" },
      { label: "Stories", href: "#stories" },
      { label: "Favorites", href: "#favorites" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "#top" },
      { label: "Contact", href: "#top" },
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
            <a href="#top" aria-label="CarVibes home">
              <Logo />
            </a>
            <p className="mt-4 text-[11px] font-medium tracking-mega text-fog">
              DISCOVER. FEEL. DRIVE.
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">
              A premium automotive discovery platform. Extraordinary cars,
              legendary stories, and the machines that define culture.
            </p>
            {/* Social */}
            <div className="mt-8 flex gap-3">
              {[
                {
                  icon: YouTubeIcon,
                  label: "YouTube",
                  href: "https://www.youtube.com/@CarVibes-m6i",
                },
                {
                  icon: InstagramIcon,
                  label: "Instagram",
                  href: "https://www.instagram.com/carvibesinsta/?hl=en",
                },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`CarVibes on ${label}`}
                  className="group flex h-10 w-10 items-center justify-center border border-line text-mist transition-all duration-300 hover:border-white/40 hover:bg-charcoal hover:text-white"
                >
                  <Icon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-semibold tracking-[0.2em] text-fog">
                {group.title.toUpperCase()}
              </h4>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-mist transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                {group.title === "DISCOVER" && onCompare && (
                  <li>
                    <button
                      onClick={onCompare}
                      className="text-sm text-mist transition-colors duration-300 hover:text-white"
                    >
                      Compare
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}

          {/* Language */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.2em] text-fog">
              {t(lang, "nav_language").toUpperCase()}
            </h4>
            <div className="mt-5 inline-flex border border-line">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLangChange(l.code)}
                  aria-label={l.label}
                  className={`px-3.5 py-2.5 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${
                    l.code === lang
                      ? "bg-accent text-white"
                      : "text-mist hover:bg-charcoal hover:text-white"
                  }`}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-xs text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CarVibes. All rights reserved.</p>
          <p>DISCOVER. FEEL. DRIVE.</p>
        </div>
      </div>
    </footer>
  );
}
