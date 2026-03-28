const KEY = 'atlas_workout_session';

export function saveSession(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function hasSession() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
