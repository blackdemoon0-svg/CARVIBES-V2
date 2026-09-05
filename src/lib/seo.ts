// ============================================================
// CARVIBES — per-route SEO metadata manager.
// Updates <title>, <meta> and <link rel="canonical"> at runtime
// so every route (/car/:id, /story/:id, /) exposes its own
// canonical URL, description and Open Graph tags.
//
// The single source of truth for URLs is the canonical domain:
// https://carvibes.dev — no new URLs are invented. SITE_URL below is
// also read at build time by scripts/generate-sitemap.mjs, so the
// sitemap, robots.txt and runtime canonicals can never disagree.
// ============================================================
import { useEffect } from "react";
import type { Car } from "./cars";
import type { Story } from "./stories";

export const SITE_URL = "https://carvibes.dev";
export const SITE_NAME = "CarVibes";

export const DEFAULT_TITLE = "CarVibes — Discover. Feel. Drive.";
export const DEFAULT_DESCRIPTION =
  "Discover cars, automotive stories and powerful tools to find, compare and explore your perfect car.";
export const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/261985/pexels-photo-261985.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=630";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setRobots(content: string | null) {
  const el = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (content === null) {
    if (el) el.remove();
    return;
  }
  if (el) {
    el.setAttribute("content", content);
  } else {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    meta.setAttribute("content", content);
    document.head.appendChild(meta);
  }
}

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/explore": {
    title: "Explore cars — CarVibes",
    description: "Browse and filter the CarVibes universe of cars.",
  },
  "/news": {
    title: "Stories — CarVibes",
    description: "Automotive stories, legends and hidden machines.",
  },
  "/favorites": {
    title: "Favorites — CarVibes",
    description: "Your saved cars and stories on CarVibes.",
  },
  "/find-my-car": {
    title: "Find My Car — CarVibes",
    description: "Answer a few questions and match with your perfect car.",
  },
  "/compare": {
    title: "Compare cars — CarVibes",
    description: "Head-to-head car comparison and battle.",
  },
  "/search": {
    title: "Search — CarVibes",
    description: "Search cars and stories on CarVibes.",
  },
  "/brands": {
    title: "Brands — CarVibes",
    description: "Explore every brand in the CarVibes database.",
  },
  "/contact": {
    title: "Contact — CarVibes",
    description: "Get in touch with CarVibes.",
  },
  "/privacy-policy": {
    title: "Privacy Policy — CarVibes",
    description: "How CarVibes handles your data.",
  },
  "/terms": {
    title: "Terms of Use — CarVibes",
    description: "Terms of use for CarVibes.",
  },
};

export interface PageMeta {
  car?: Car;
  story?: Story;
  notFound: boolean;
  path: string;
  skip?: boolean;
}

export function usePageMeta({ car, story, notFound, path, skip }: PageMeta) {
  useEffect(() => {
    if (skip) return;
    let title = DEFAULT_TITLE;
    let description = DEFAULT_DESCRIPTION;
    let image = DEFAULT_IMAGE;
    let type = "website";
    let url = `${SITE_URL}${path === "/" ? "/" : path}`;

    if (notFound) {
      title = "Page not found — CarVibes";
      description = "The page you are looking for does not exist.";
      url = `${SITE_URL}/`;
      setRobots("noindex, nofollow");
    } else {
      setRobots(null);
    }

    const routeMeta = ROUTE_META[path.replace(/\/$/, "") || "/"];
    if (routeMeta && !car && !story && !notFound) {
      title = routeMeta.title;
      description = routeMeta.description;
    }

    if (car) {
      title = `${car.brand} ${car.model} (${car.year}) — CarVibes`;
      description =
        car.overview ||
        car.tagline ||
        `${car.brand} ${car.model} (${car.year}): ${car.engine}, ${car.hp} hp.`;
      image = car.image;
    } else if (story) {
      title = `${story.title} — CarVibes`;
      description = story.description;
      image = story.image;
      type = "article";
    }

    document.title = title;
    upsertMeta("name", "description", description);
    setCanonical(url);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:type", type);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car?.id, story?.id, notFound, path]);
}
