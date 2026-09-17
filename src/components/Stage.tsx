// ============================================================
// CARVIBES — <Stage>: a lazy section that mounts on its own turn
//
// Combines the two ideas that keep a cold load cheap:
//   * `React.lazy` + <Suspense>  → the section's code and data live in
//     their own chunk, downloaded after the first paint;
//   * src/lib/progressive.ts     → it also *mounts* on its own turn, one
//     section per idle callback, instead of the whole below-the-fold page
//     appearing in a single 4×-CPU long task.
//
// `order` must follow DOM order (0 = next to the hero, mounts immediately)
// so growth always happens below already-painted content — the sections
// never push each other around.
// ============================================================

import { Suspense, type ReactNode } from "react";
import { useStage } from "../lib/progressive";

export function Stage({ order, children }: { order: number; children: ReactNode }) {
  const open = useStage(order);
  if (!open) return null;
  return <Suspense fallback={null}>{children}</Suspense>;
}
