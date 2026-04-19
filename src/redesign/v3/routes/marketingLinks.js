// iOS only — atlas.core is not on Google Play.
export const APP_STORE_URL = 'https://apps.apple.com/app/atlas-core/id0000000000';

export function detectPlatform() {
  if (typeof window === 'undefined') return 'web';
  const ua = window.navigator?.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  return 'web';
}

export function resolveDownloadUrl() {
  return APP_STORE_URL;
}

export function buildAuthCallbackUrl(next) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(`${origin}/auth/callback`);
  if (next) url.searchParams.set('next', next);
  return url.toString();
}
