// ============================================================
// CARVIBES — user preferences (favorites + compare) stored locally.
// localStorage-backed so they persist across visits without auth.
// ============================================================
const FAVORITES_KEY = "carvibes.favorites";
const COMPARE_KEY = "carvibes.compare";
const SAVED_STORIES_KEY = "carvibes.savedStories";
const STORY_PROGRESS_KEY = "carvibes.storyProgress";
const RECENT_KEY = "carvibes.recent";

export const MAX_COMPARE = 3;

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as string[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function getFavoriteIds(): string[] {
  return read(FAVORITES_KEY);
}

export function toggleFavorite(id: string): boolean {
  const ids = read(FAVORITES_KEY);
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  write(FAVORITES_KEY, next);
  notifyPrefs();
  return !exists; // returns true if now favorited
}

export function isFavorite(id: string): boolean {
  return read(FAVORITES_KEY).includes(id);
}

export function getCompareIds(): string[] {
  return read(COMPARE_KEY);
}

/**
 * Add a car to compare. Returns:
 *  - "added"     → added successfully
 *  - "removed"   → it was already there, so removed (toggle)
 *  - "full"      → already at MAX_COMPARE and this car isn't in it
 *  - "exists"    → already present (no change)
 */
export function addToCompare(id: string): "added" | "removed" | "full" | "exists" {
  const ids = read(COMPARE_KEY);
  if (ids.includes(id)) return "exists";
  if (ids.length >= MAX_COMPARE) return "full";
  write(COMPARE_KEY, [...ids, id]);
  notifyPrefs();
  return "added";
}

export function removeFromCompare(id: string) {
  write(COMPARE_KEY, read(COMPARE_KEY).filter((x) => x !== id));
  notifyPrefs();
}

export function clearCompare() {
  write(COMPARE_KEY, []);
  notifyPrefs();
}

export function toggleCompare(id: string): boolean {
  const ids = read(COMPARE_KEY);
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  write(COMPARE_KEY, next);
  notifyPrefs();
  return !exists;
}

export function isCompared(id: string): boolean {
  return read(COMPARE_KEY).includes(id);
}

// --- Recently viewed (max 10) ---
export function getRecentIds(): string[] {
  return read(RECENT_KEY);
}

export function addRecent(id: string) {
  const ids = read(RECENT_KEY).filter((x) => x !== id);
  ids.unshift(id);
  write(RECENT_KEY, ids.slice(0, 10));
}

export function clearRecent() {
  write(RECENT_KEY, []);
  notifyPrefs();
}

// --- Saved stories + reading progress ---
export function getSavedStoryIds(): string[] {
  return read(SAVED_STORIES_KEY);
}

export function toggleSavedStory(id: string): boolean {
  const ids = read(SAVED_STORIES_KEY);
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  write(SAVED_STORIES_KEY, next);
  notifyPrefs();
  return !exists;
}

export function isStorySaved(id: string): boolean {
  return read(SAVED_STORIES_KEY).includes(id);
}

export function saveStoryProgress(id: string, pct: number) {
  if (typeof window === "undefined") return;
  try {
    const data = JSON.parse(localStorage.getItem(STORY_PROGRESS_KEY) || "{}");
    data[id] = Math.max(0, Math.min(100, Math.round(pct)));
    localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function getStoryProgress(id: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const data = JSON.parse(localStorage.getItem(STORY_PROGRESS_KEY) || "{}");
    return typeof data[id] === "number" ? data[id] : 0;
  } catch {
    return 0;
  }
}

// Favorites / compare change notifications (lightweight pub-sub for UI sync)
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribePrefs(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyPrefs() {
  listeners.forEach((fn) => fn());
}
