/**
 * Haptic feedback utility — wraps @capacitor/haptics.
 * Silent no-op on web (non-native) environments.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

async function safe(fn) {
  if (!isNative) return;
  try { await fn(); } catch { /* swallow — device may not support haptics */ }
}

/** Light tap — buttons, toggles, chips */
export function tapLight() {
  safe(() => Haptics.impact({ style: ImpactStyle.Light }));
}

/** Medium tap — save, set logged, form submit */
export function tapMedium() {
  safe(() => Haptics.impact({ style: ImpactStyle.Medium }));
}

/** Heavy tap — check-in submit, streak milestone, destructive */
export function tapHeavy() {
  safe(() => Haptics.impact({ style: ImpactStyle.Heavy }));
}

/** Slider integer tick */
export function tick() {
  safe(() => Haptics.impact({ style: ImpactStyle.Light }));
}

/** Success notification — check-in, streak hit */
export function notifySuccess() {
  safe(() => Haptics.notification({ type: NotificationType.Success }));
}

/** Error notification — validation fail */
export function notifyError() {
  safe(() => Haptics.notification({ type: NotificationType.Error }));
}

/** Combined heavy + success — for big moments (check-in submit, streak milestone) */
export function celebrateHeavy() {
  safe(async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await Haptics.notification({ type: NotificationType.Success });
  });
}
