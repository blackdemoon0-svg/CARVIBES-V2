// ============================================================
// CARVIBES — central lazy boundaries (code-splitting)
//
// Every component that is NOT needed for the first painted viewport of a
// route lives behind React.lazy. The bundler gives each one its own
// hashed chunk (with the shared car/story datasets landing in a single
// lazy-loaded data chunk), so a cold visitor downloads:
//
//   entry (shell: nav, hero, footer, tour, EN strings)   ~ always
//   + exactly the chunks the current route needs          ~ on demand
//
// instead of the whole CarVibes database + all 10 languages before first
// paint. Below-the-fold homepage sections keep their real content in the
// PRERENDERED HTML (SEO is untouched — crawlers never wait for JS); lazy
// only re-times the *client* download of the interactive version.
//
// Note: the car sheet and story reader no longer live here — they are
// part of their dedicated route pages (src/pages/CarDetailPage.tsx,
// src/pages/StoryDetailPage.tsx), which ARE the lazy boundary, so a
// direct landing downloads one chunk containing page + sheet.
//
// One definition per component, shared by src/App.tsx and
// src/pages/RoutePages.tsx, so there is exactly one chunk per module.
// Always render these inside <Suspense fallback={…}>.
// ============================================================

import { lazy } from "react";

/** Find-my-car matcher modal (+ /find-my-car route). */
export const LazyFindMyCar = lazy(() => import("./findmycar/FindMyCar"));

/** Compare battle modal (+ /compare route). */
export const LazyCompareModal = lazy(() => import("./compare/CompareModal"));

/** Global search overlay (+ /search route). */
export const LazyGlobalSearch = lazy(() => import("./GlobalSearch"));

/** Quiz experience (+ question bank) — /car-quiz only. */
export const LazyQuizPage = lazy(() => import("./quiz/QuizPage"));

/** Used-cars guide (+ dataset) — /used-cars only. */
export const LazyUsedCarsPage = lazy(() => import("./usedcars/UsedCarsPage"));

// ------------------------------------------------------------
// Homepage sections below the hero. They sit under a full-viewport
// section, so nothing above them moves when they stream in (no CLS),
// and their scroll data (cars / stories DB) leaves the entry bundle.
// ------------------------------------------------------------

/** Quick categories + popular brands (right under the hero). */
export const LazyDiscoverSection = lazy(() => import("./DiscoverSection"));

/** Popular cars grid. */
export const LazyPopularCarsSection = lazy(() => import("./PopularCarsSection"));

/** Budget pickers. */
export const LazyBudgetSection = lazy(() => import("./BudgetSection"));

/** Editorial rankings list. */
export const LazyRankingsSection = lazy(() => import("./RankingsSection"));

/** Featured stories strip (also used by /news via RoutePages). */
export const LazyStoriesSection = lazy(() => import("./stories/StoriesSection"));

/** Full searchable universe (also the /explore body). */
export const LazyCarUniverse = lazy(() => import("./universe/CarUniverse"));

/** Personal favorites rail (localStorage-driven). */
export const LazyFavoritesSection = lazy(() => import("./favorites/FavoritesSection"));
