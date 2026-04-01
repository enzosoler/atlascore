/**
 * Haptic feedback utility — wraps @capacitor/haptics.
 * Lazy-loads the native module so it never breaks web/browser builds.
 * Silent no-op on non-native environments.
 */

import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

let _haptics = null;

async function getHaptics() {
  if (!isNative) return null;
  if (!_haptics) {
    try {
      const mod = await import('@capacitor/haptics');
      _haptics = mod.Haptics;
    } catch {
      _haptics = null;
    }
  }
  return _haptics;
}

async function safe(fn) {
  if (!isNative) return;
  try {
    const H = await getHaptics();
    if (H) await fn(H);
  } catch { /* swallow */ }
}

/** Light tap — buttons, toggles, chips */
export function tapLight() {
  safe((H) => H.impact({ style: 'LIGHT' }));
}

/** Medium tap — save, set logged, form submit */
export function tapMedium() {
  safe((H) => H.impact({ style: 'MEDIUM' }));
}

/** Heavy tap — check-in submit, streak milestone, destructive */
export function tapHeavy() {
  safe((H) => H.impact({ style: 'HEAVY' }));
}

/** Slider integer tick */
export function tick() {
  safe((H) => H.impact({ style: 'LIGHT' }));
}

/** Success notification — check-in, streak hit */
export function notifySuccess() {
  safe((H) => H.notification({ type: 'SUCCESS' }));
}

/** Error notification — validation fail */
export function notifyError() {
  safe((H) => H.notification({ type: 'ERROR' }));
}

/** Combined heavy + success — for big moments (check-in submit, streak milestone) */
export function celebrateHeavy() {
  safe(async (H) => {
    await H.impact({ style: 'HEAVY' });
    await H.notification({ type: 'SUCCESS' });
  });
}
