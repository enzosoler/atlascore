import { Capacitor } from '@capacitor/core';

export const NATIVE_AUTH_CALLBACK_URL = 'atlascore://auth/callback';

export function getAuthRedirectUrl({ mode } = {}) {
  if (Capacitor.isNativePlatform()) {
    return mode ? `${NATIVE_AUTH_CALLBACK_URL}?mode=${encodeURIComponent(mode)}` : NATIVE_AUTH_CALLBACK_URL;
  }

  if (typeof window === 'undefined') return undefined;
  const callback = new URL('/auth/callback', window.location.origin);
  if (mode) callback.searchParams.set('mode', mode);
  return callback.toString();
}
