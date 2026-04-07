/**
 * Error monitoring — dual-mode: Sentry (when DSN is set) + Supabase error_logs.
 *
 * When VITE_SENTRY_DSN is configured, errors go to Sentry AND Supabase.
 * When it's absent, errors only go to the Supabase error_logs table.
 *
 * Same public API so callers never need to change.
 */
import * as Sentry from '@sentry/react';
import { supabase } from '@/lib/supabaseClient';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
let _sentryEnabled = false;
let _userId = null;
let _userEmail = null;

export function initSentry() {
  if (!SENTRY_DSN || !import.meta.env.PROD) return;

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE || 'production',
      // Keep sample rates conservative to stay within free tier
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.5,
      beforeSend(event) {
        // Strip PII from breadcrumbs if needed
        return event;
      },
    });
    _sentryEnabled = true;
  } catch (e) {
    console.warn('[sentry] init failed', e);
  }
}

export function setSentryUser(user) {
  _userId = user?.id ?? null;
  _userEmail = user?.email ?? null;

  if (_sentryEnabled) {
    Sentry.setUser(user ? { id: user.id, email: user.email } : null);
  }
}

export async function captureException(error, context) {
  // Always log to console so devtools still work
  console.error(error, context);

  // Sentry
  if (_sentryEnabled) {
    Sentry.captureException(error, { extra: context });
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
