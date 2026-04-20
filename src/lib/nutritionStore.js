// Minimal nutritionStore shim to avoid importing legacy redesign/v2 sources in the build.
// This file provides the small API surface used by App.jsx and returns safe fallbacks.

export async function getEntriesForDate(userId, date) {
  // Return an empty array as default — real implementation lives in the mobile app.
  return [];
}

export function addEntry(userId, date, meal, entry) {
  // No-op stub for build compatibility.
  console.warn('[nutritionStore] addEntry called in shim - no-op');
}

export function addEntries(userId, date, entries) {
  console.warn('[nutritionStore] addEntries called in shim - no-op');
}

export function subscribe(userId, date, cb) {
  // Return an unsubscribe function.
  console.warn('[nutritionStore] subscribe called in shim - no-op');
  return () => {};
}
