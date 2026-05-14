/**
 * Error monitoring — dual-mode: Sentry (when DSN is set) + Supabase error_logs.
 *
 * When VITE_SENTRY_DSN is configured, errors go to Sentry AND Supabase.
 * When it's absent, errors only go to the Supabase error_logs table.
 *
 * Same public API so callers never need to change.
 */
import { supabase } from '@/lib/supabaseClient';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
let _sentryEnabled = false;
let _sentry = null;
let _sentryLoadPromise = null;
let _userId = null;

async function loadSentry() {
  if (_sentry) return _sentry;
  if (!_sentryLoadPromise) {
    _sentryLoadPromise = import('@sentry/react').then((module) => {
      _sentry = module;
      return module;
    });
  }
  return _sentryLoadPromise;
}

export async function initSentry() {
  if (!SENTRY_DSN || !import.meta.env.PROD) return;

  try {
    const Sentry = await loadSentry();
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE || 'production',
      tracesSampleRate: 0.2,
      // Replay disabled — too heavy for mobile WebView
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      beforeSend(event) {
        if (event.user) {
          delete event.user.email;
        }
        return event;
      },
    });
    _sentryEnabled = true;
    if (_userId) {
      Sentry.setUser({ id: _userId });
    }
  } catch (e) {
    console.warn('[sentry] init failed', e);
  }
}

export function setSentryUser(user) {
  _userId = user?.id ?? null;

  if (_sentryEnabled) {
    _sentry?.setUser(user ? { id: user.id } : null);
  }
}

export async function captureException(error, context) {
  // Always log to console so devtools still work
  console.error(error, context);

  // Sentry
  if (_sentryEnabled) {
    _sentry?.captureException(error, { extra: context });
  }

  // Supabase fallback
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack   = error instanceof Error ? error.stack  : null;

    await supabase.from('error_logs').insert({
      user_id: _userId || null,
      message,
      stack,
      context: context ? JSON.parse(JSON.stringify(context)) : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      component: context?.component || null,
      route: typeof window !== 'undefined' ? window.location.pathname : null,
    });
  } catch {
    // Never let error logging itself crash the app
  }
}

export function trackEvent(name, data) {
  // Lightweight breadcrumb — writes to error_logs with a special prefix
  // so conversions are visible alongside errors.
  try {
    supabase.from('error_logs').insert({
      user_id: _userId || null,
      message: `[event] ${name}`,
      context: data ? JSON.parse(JSON.stringify(data)) : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
    });
  } catch {
    // silent
  }
}
