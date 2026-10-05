// ============================================================
// CARVIBES ANALYSE — local history store
//
// Client-side persistence (localStorage) for past analyses.
// Shape mirrors the future /garage/analyses backend model:
// swapping these functions for API calls later changes no UI.
// Photo binaries are never persisted — only counts/categories.
// ============================================================

import type { AnalysisRequest, StoredAnalysis } from "./types";

const KEY = "carvibes.analyze.history.v1";
const MAX_ENTRIES = 20;

function readAll(): StoredAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: StoredAnalysis[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Quota or privacy mode — history is best-effort.
  }
}

/** Persist an analysis (photos stripped to references). */
export function saveAnalysis(entry: StoredAnalysis) {
  const stripped: StoredAnalysis = {
    ...entry,
    request: {
      ...entry.request,
      photos: entry.request.photos.map((p) => ({ ...p, url: undefined })),
    },
  };
  const all = readAll().filter((e) => e.id !== stripped.id);
  all.unshift(stripped);
  writeAll(all);
}

export function listAnalyses(): StoredAnalysis[] {
  return readAll();
}

export function getAnalysis(id: string): StoredAnalysis | null {
  return readAll().find((e) => e.id === id) ?? null;
}

export function deleteAnalysis(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}

/** Draft form persistence so a refresh never loses the wizard. */
const DRAFT_KEY = "carvibes.analyze.draft.v1";

export interface AnalyzeDraft {
  request: AnalysisRequest;
  step: number;
  updatedAt: number;
}

export function saveDraft(draft: AnalyzeDraft) {
  if (typeof window === "undefined") return;
  try {
    const stripped: AnalyzeDraft = {
      ...draft,
      request: {
        ...draft.request,
        photos: draft.request.photos.map((p) => ({ ...p, url: undefined })),
      },
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(stripped));
  } catch {
    // Best-effort.
  }
}

export function readDraft(): AnalyzeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnalyzeDraft;
    if (!parsed?.request) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Best-effort.
  }
}
