// ============================================================
// CARVIBES — central lazy boundaries (code-splitting)
//
// Every heavy component that is NOT needed for the homepage first
// paint lives behind React.lazy: route pages, overlays and the quiz /
// used-cars data-driven experiences each become their own hashed
// chunk, downloaded on demand. Shared code (React, router, the car
// database, Navigation/Footer, homepage sections) stays in the entry
// + vendor chunks.
//
// Note: the car sheet and story reader no longer live here — they are
// part of their dedicated route pages (src/pages/CarDetailPage.tsx,
// src/pages/StoryDetailPage.tsx), which ARE the lazy boundary, so a
// direct landing downloads one chunk containing page + sheet.
//
// One definition per component, shared by src/App.tsx and
// src/pages/RoutePages.tsx, so there is exactly one chunk per module.
// Always render these inside <Suspense fallback={<PageLoader />}>.
// ============================================================

import { lazy } from "react";

/** Find-my-car matcher modal (+ /find-my-car route). */
export const LazyFindMyCar = lazy(() => import("./findmycar/FindMyCar"));

/** Compare battle modal (+ /compare route). */
export const LazyCompareModal = lazy(() => import("./compare/CompareModal"));

/** Global search overlay (+ /search route). */
export const LazyGlobalSearch = lazy(() => import("./GlobalSearch"));

/** Quiz experience (+ 436 KB question bank) — /car-quiz only. */
export const LazyQuizPage = lazy(() => import("./quiz/QuizPage"));

/** Used-cars guide (+ dataset) — /used-cars only. */
export const LazyUsedCarsPage = lazy(() => import("./usedcars/UsedCarsPage"));
