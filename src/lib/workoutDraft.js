/**
 * Workout draft persistence — saves completed workout payload to localStorage
 * before attempting the API call. If the save fails, the draft survives and
 * can be retried on next app open or via a retry button.
 *
 * Separate from workoutSession.js which tracks the in-progress execution state.
 * This module tracks the *completed* payload that failed to sync to the server.
 */

const KEY = 'atlas_workout_draft';

export function saveDraft({ payload, workout }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ payload, workout, savedAt: new Date().toISOString() }));
  } catch {}
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function hasDraft() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
