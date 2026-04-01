/**
 * notificationService
 *
 * Single source of truth for all notification behaviour in atlas.core.
 *
 * Responsibilities
 *   • Request push + local notification permissions
 *   • Register device for remote push; capture and expose the APNs/FCM token
 *   • Save push token to Supabase (push_tokens table)
 *   • Set up foreground-received listener → in-app toast
 *   • Set up tap/action listener → navigation callback
 *   • Schedule / cancel local notifications
 *   • Clean up all listeners on logout
 *
 * This module is platform-safe: all Capacitor calls are guarded by IS_NATIVE.
 * On web it is a no-op so the app compiles and runs without changes.
 *
 * Usage
 *   // once, after auth resolves (in usePushNotifications hook):
 *   await notificationService.init({ userId, onTap, onForegroundPush });
 *
 *   // on logout:
 *   notificationService.destroy();
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/lib/supabaseClient';

const IS_NATIVE = Capacitor.isNativePlatform();
const PLATFORM = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

// ─── Internal state ───────────────────────────────────────────────────────────

let _listeners = [];       // active Capacitor listener handles
let _pushToken = null;     // most recently captured token
let _initialised = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(...args) {
  // Visible in Xcode / Safari Web Inspector during device testing.
  // Prefix makes it easy to grep in the console.
  console.log('[NotificationService]', ...args);
}

function warn(...args) {
  console.warn('[NotificationService]', ...args);
}

async function addListener(event, handler) {
  const handle = await PushNotifications.addListener(event, handler);
  _listeners.push(handle);
  return handle;
}

async function addLocalListener(event, handler) {
  const handle = await LocalNotifications.addListener(event, handler);
  _listeners.push(handle);
  return handle;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const notificationService = {
  /** Currently captured push token (null until registration succeeds). */
  get pushToken() {
    return _pushToken;
  },

  /**
   * Request push + local notification permissions.
   * Returns 'granted' | 'denied' | 'prompt' (prompt = not yet asked / web).
   */
  async requestPermissions() {
    if (!IS_NATIVE) return 'prompt';

    try {
      const [pushResult, localResult] = await Promise.all([
        PushNotifications.requestPermissions(),
        LocalNotifications.requestPermissions(),
      ]);
      log('push permission:', pushResult.receive);
      log('local permission:', localResult.display);
      return pushResult.receive; // 'granted' | 'denied' | 'prompt'
    } catch (err) {
      warn('requestPermissions failed:', err?.message);
      return 'denied';
    }
  },

  /**
   * Check current push permission status without showing the system dialog.
   * Returns 'granted' | 'denied' | 'prompt'.
   */
  async checkPermissions() {
    if (!IS_NATIVE) return 'prompt';
    try {
      const { receive } = await PushNotifications.checkPermissions();
      return receive;
    } catch (err) {
      warn('checkPermissions failed:', err?.message);
      return 'prompt';
    }
  },

  /**
   * Initialise the service.
   * Must be called once after auth resolves and permission is granted.
   *
   * @param {object} opts
   * @param {string}   opts.userId          - Supabase user id
   * @param {function} opts.onForegroundPush - callback({ title, body, data }) for foreground messages
   * @param {function} opts.onTap           - callback({ route, data }) for notification taps
   */
  async init({ userId, onForegroundPush, onTap } = {}) {
    if (!IS_NATIVE) {
      log('web platform — skipping native init');
      return;
    }

    if (_initialised) {
      log('already initialised — skipping duplicate init');
      return;
    }

    log('initialising for user:', userId);

    // ── Registration success → capture token + save to DB ──────────────────
    await addListener('registration', async ({ value: token }) => {
      _pushToken = token;
      log('registered. token:', token);
      if (userId) {
        await notificationService.savePushToken(userId, token);
      }
    });

    // ── Registration failure ────────────────────────────────────────────────
    await addListener('registrationError', ({ error }) => {
      warn('registration failed:', error?.message ?? error);
    });

    // ── Foreground push received ────────────────────────────────────────────
    await addListener('pushNotificationReceived', (notification) => {
      log('foreground push received:', notification.title);
      if (typeof onForegroundPush === 'function') {
        onForegroundPush({
          title: notification.title ?? '',
          body: notification.body ?? '',
          data: notification.data ?? {},
        });
      }
    });

    // ── Notification tapped (from any app state) ────────────────────────────
    await addListener('pushNotificationActionPerformed', (action) => {
      const notification = action.notification;
      log('push tapped:', notification.title, '| data:', notification.data);
      if (typeof onTap === 'function') {
        onTap({
          route: notification.data?.route ?? null,
          data: notification.data ?? {},
        });
      }
    });

    // ── Local notification tapped ───────────────────────────────────────────
    await addLocalListener('localNotificationActionPerformed', (action) => {
      const notification = action.notification;
      log('local notification tapped:', notification.title);
      if (typeof onTap === 'function') {
        onTap({
          route: notification.extra?.route ?? null,
          data: notification.extra ?? {},
        });
      }
    });

    // ── Register with APNs / FCM ────────────────────────────────────────────
    // This triggers 'registration' or 'registrationError' above.
    // Skip on Android if google-services.json / Firebase is not configured —
    // the native plugin crashes with "Default FirebaseApp is not initialized".
    if (PLATFORM === 'android') {
      log('Android detected — skipping PushNotifications.register() (no Firebase config)');
    } else {
      try {
        await PushNotifications.register();
        log('register() called — waiting for token event');
      } catch (err) {
        warn('PushNotifications.register() threw:', err?.message);
      }
    }

    _initialised = true;
  },

  /**
   * Save (or update) the push token in the `push_tokens` table.
   * Safe to call multiple times — upserts by user_id + token.
   *
   * @param {string} userId
   * @param {string} token
   */
  async savePushToken(userId, token) {
    if (!userId || !token) return;
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            platform: PLATFORM,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,token' }
        );
      if (error) {
        warn('savePushToken DB error:', error.message);
      } else {
        log('token saved for user:', userId);
      }
    } catch (err) {
      warn('savePushToken threw:', err?.message);
    }
  },

  /**
   * Remove the current device token from the backend.
   * Call on logout so the user stops receiving pushes on this device.
   *
   * @param {string} userId
   */
  async removePushToken(userId) {
    if (!userId || !_pushToken) return;
    try {
      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', _pushToken);
      if (error) {
        warn('removePushToken DB error:', error.message);
      } else {
        log('token removed for user:', userId);
      }
    } catch (err) {
      warn('removePushToken threw:', err?.message);
    }
  },

  /**
   * Schedule a local notification.
   *
   * @param {object} opts
   * @param {number}       opts.id         - unique integer id (for later cancellation)
   * @param {string}       opts.title      - notification title (already translated by caller)
   * @param {string}       opts.body       - notification body  (already translated by caller)
   * @param {Date}         opts.scheduleAt - exact time to fire
   * @param {object}       [opts.extra]    - arbitrary data passed to onTap callback
   * @param {string}       [opts.sound]    - custom sound name (without extension) or omit for default
   */
  async scheduleLocal({ id, title, body, scheduleAt, extra = {}, sound }) {
    if (!IS_NATIVE) return;
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at: scheduleAt, allowWhileIdle: true },
            extra,
            ...(sound ? { sound } : {}),
          },
        ],
      });
      log('local notification scheduled:', id, title, 'at', scheduleAt.toISOString());
    } catch (err) {
      warn('scheduleLocal failed:', err?.message);
    }
  },

  /**
   * Cancel a pending local notification by its integer id.
   *
   * @param {number} id
   */
  async cancelLocal(id) {
    if (!IS_NATIVE) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      log('local notification cancelled:', id);
    } catch (err) {
      warn('cancelLocal failed:', err?.message);
    }
  },

  /**
   * Get all pending local notifications.
   * Useful for checking whether a timer notification is already scheduled.
   */
  async getPendingLocal() {
    if (!IS_NATIVE) return [];
    try {
      const { notifications } = await LocalNotifications.getPending();
      return notifications;
    } catch {
      return [];
    }
  },

  /**
   * Remove all Capacitor listeners and reset internal state.
   * Call on logout.
   */
  destroy() {
    _listeners.forEach((l) => {
      try { l.remove(); } catch { /* ignore */ }
    });
    _listeners = [];
    _pushToken = null;
    _initialised = false;
    log('destroyed — all listeners removed');
  },
};
