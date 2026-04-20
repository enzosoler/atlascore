/**
 * nutritionStore — lightweight per-user, per-date store for food entries.
 *
 * Purpose: until the Supabase `food_entries` table + sync are wired up, users
 * should still see their entries persist across reloads. This writes to
 * localStorage keyed by user id + ISO date.
 *
 * Shape of the persisted object:
 *   entries: {
 *     "yyyy-mm-dd": {
 *       breakfast: [ {id, name, portion, unit, calories, protein, carbs, fat}, ... ],
 *       lunch:     [ ... ],
 *       dinner:    [ ... ],
 *       snacks:    [ ... ],
 *     }
 *   }
 *
 * ⚠️  When the Supabase nutrition service lands, swap `readAll/writeAll` to
 * call that service. Keep the same public API so callers don't change.
 */

const STORAGE_PREFIX = 'atlas.nutrition.entries.v1';

function key(userId) {
  return `${STORAGE_PREFIX}:${userId || 'anon'}`;
}

function readAll(userId) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(userId, data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(data));
    // Fire a custom event so listening components can refresh without a prop pipe.
    window.dispatchEvent(new CustomEvent('atlas:nutrition-changed', { detail: { userId } }));
  } catch {
    // localStorage quota exceeded — best-effort, swallow.
  }
}

function isoDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const EMPTY_DAY = { breakfast: [], lunch: [], dinner: [], snacks: [] };

/**
 * Get entries for a specific date as the `{ breakfast, lunch, dinner, snacks }`
 * object the NutritionToday screen expects. Always safe to call.
 */
export function getEntriesForDate(userId, date) {
  const all = readAll(userId);
  const day = all[isoDate(date)];
  return day ? { ...EMPTY_DAY, ...day } : { ...EMPTY_DAY };
}

/**
 * Append a single entry to a specific meal on a specific date.
 * Returns the id of the new entry.
 */
export function addEntry(userId, date, mealId, entry) {
  const all = readAll(userId);
  const d = isoDate(date);
  const day = { ...EMPTY_DAY, ...(all[d] || {}) };
  const withId = {
    ...entry,
    id: entry.id || `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  day[mealId] = [...(day[mealId] || []), withId];
  all[d] = day;
  writeAll(userId, all);
  return withId.id;
}

/** Append many entries at once (used by PhotoScanConfirm + AI parse flows). */
export function addEntries(userId, date, mealId, entries) {
  const all = readAll(userId);
  const d = isoDate(date);
  const day = { ...EMPTY_DAY, ...(all[d] || {}) };
  const withIds = entries.map((e) => ({
    ...e,
    id: e.id || `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  }));
  day[mealId] = [...(day[mealId] || []), ...withIds];
  all[d] = day;
  writeAll(userId, all);
  return withIds.map((e) => e.id);
}

/** Remove a specific entry by id. */
export function removeEntry(userId, date, mealId, entryId) {
  const all = readAll(userId);
  const d = isoDate(date);
  const day = all[d];
  if (!day || !day[mealId]) return;
  day[mealId] = day[mealId].filter((e) => e.id !== entryId);
  all[d] = day;
  writeAll(userId, all);
}

/** Subscribe to changes — components can re-render when any entry changes. */
export function subscribe(listener) {
  if (typeof window === 'undefined') return () => {};
  const handler = (evt) => listener(evt.detail);
  window.addEventListener('atlas:nutrition-changed', handler);
  window.addEventListener('storage', handler); // cross-tab
  return () => {
    window.removeEventListener('atlas:nutrition-changed', handler);
    window.removeEventListener('storage', handler);
  };
}

/* ─── Entry lookup helpers (MealDetail) ─────────────────────────────────── */

const MEAL_IDS = ['breakfast', 'lunch', 'dinner', 'snacks'];

/**
 * Find a single entry across all meals on all days. Returns
 * `{ entry, date, mealId }` or null. Used by MealDetail which only has
 * the entry id in the URL.
 */
export function findEntryById(userId, entryId) {
  if (!entryId) return null;
  const all = readAll(userId);
  for (const d of Object.keys(all)) {
    const day = all[d] || {};
    for (const mealId of MEAL_IDS) {
      const arr = day[mealId] || [];
      const entry = arr.find((e) => e.id === entryId);
      if (entry) return { entry, date: d, mealId };
    }
  }
  return null;
}

/**
 * Update a single entry by id. `patch` is merged into the existing entry.
 * Does nothing if the id doesn't exist.
 */
export function updateEntryById(userId, entryId, patch) {
  const all = readAll(userId);
  for (const d of Object.keys(all)) {
    const day = all[d] || {};
    for (const mealId of MEAL_IDS) {
      const arr = day[mealId] || [];
      const idx = arr.findIndex((e) => e.id === entryId);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...patch };
        day[mealId] = arr;
        all[d] = day;
        writeAll(userId, all);
        return true;
      }
    }
  }
  return false;
}

/** Remove a single entry by id (regardless of meal/date). */
export function removeEntryById(userId, entryId) {
  const all = readAll(userId);
  for (const d of Object.keys(all)) {
    const day = all[d] || {};
    for (const mealId of MEAL_IDS) {
      const arr = day[mealId] || [];
      const idx = arr.findIndex((e) => e.id === entryId);
      if (idx >= 0) {
        day[mealId] = arr.filter((e) => e.id !== entryId);
        all[d] = day;
        writeAll(userId, all);
        return true;
      }
    }
  }
  return false;
}

/* ─── Water tracking (WaterLog) ─────────────────────────────────────────── */

const WATER_PREFIX = 'atlas.nutrition.water.v1';

function waterKey(userId) {
  return `${WATER_PREFIX}:${userId || 'anon'}`;
}

function readWaterAll(userId) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(waterKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeWaterAll(userId, data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(waterKey(userId), JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('atlas:nutrition-changed', { detail: { userId, kind: 'water' } }));
  } catch {
    /* quota exceeded — swallow */
  }
}

/** Get water entries for a specific date. Shape: [{id, ml, createdAt}] */
export function getWaterForDate(userId, date) {
  const all = readWaterAll(userId);
  const day = all[isoDate(date)];
  return Array.isArray(day?.entries) ? day.entries : [];
}

/** Append an amount (ml) to today's water log. */
export function addWater(userId, date, ml) {
  if (!ml || ml <= 0) return null;
  const all = readWaterAll(userId);
  const d = isoDate(date);
  const day = all[d] || { entries: [] };
  const entry = {
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ml: Math.round(ml),
    createdAt: Date.now(),
  };
  day.entries = [...(day.entries || []), entry];
  all[d] = day;
  writeWaterAll(userId, all);
  return entry.id;
}

/** Remove the most recent water entry for a date. Returns true if removed. */
export function removeLastWater(userId, date) {
  const all = readWaterAll(userId);
  const d = isoDate(date);
  const day = all[d];
  if (!day || !day.entries || day.entries.length === 0) return false;
  day.entries = day.entries.slice(0, -1);
  all[d] = day;
  writeWaterAll(userId, all);
  return true;
}

const WATER_TARGET_KEY = 'atlas.nutrition.water.target.v1';

/** Read the per-user daily water target in ml. Defaults to 2000ml. */
export function getWaterTarget(userId) {
  if (typeof window === 'undefined') return 2000;
  try {
    const raw = window.localStorage.getItem(`${WATER_TARGET_KEY}:${userId || 'anon'}`);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 2000;
  } catch {
    return 2000;
  }
}

/** Write the per-user daily water target in ml. */
export function setWaterTarget(userId, ml) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${WATER_TARGET_KEY}:${userId || 'anon'}`, String(Math.max(0, Math.round(ml))));
    window.dispatchEvent(new CustomEvent('atlas:nutrition-changed', { detail: { userId, kind: 'water-target' } }));
  } catch {
    /* swallow */
  }
}

/* ─── Macro targets (MacroTargets) ──────────────────────────────────────── */

const MACRO_TARGETS_KEY = 'atlas.nutrition.macros.v1';

/**
 * Read the per-user macro targets. Returns null if never set — callers should
 * show an honest empty state rather than fabricate defaults.
 */
export function getMacroTargets(userId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${MACRO_TARGETS_KEY}:${userId || 'anon'}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** Persist the user's macro targets. Shape: {calories, protein, carbs, fat, split:{p,c,f}} */
export function setMacroTargets(userId, targets) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${MACRO_TARGETS_KEY}:${userId || 'anon'}`, JSON.stringify(targets));
    window.dispatchEvent(new CustomEvent('atlas:nutrition-changed', { detail: { userId, kind: 'macros' } }));
  } catch {
    /* swallow */
  }
}
