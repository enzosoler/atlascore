/**
 * Error monitoring — self-hosted via Supabase error_logs table.
 * Same public API as a Sentry wrapper so callers don't need to change.
 *
 * Supports an optional VITE_SENTRY_DSN for when/if Sentry is added later;
 * until then all captures go to the error_logs table.
 */
import { supabase } from '@/lib/supabaseClient';

let _userId = null;
let _userEmail = null;

export function initSentry() {
  // No-op for now. Boot-time init not required for Supabase logging.
  // If VITE_SENTRY_DSN is ever set, wire @sentry/react here.
}

export function setSentryUser(user) {
  _userId = user?.id ?? null;
  _userEmail = user?.email ?? null;
}

export async function captureException(error, context) {
  // Always log to console so devtools still work
  console.error(error, context);

  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack   = error instanceof Error ? error.stack  : null;

    await supabase.from('error_logs').insert({
      user_id: _userId || null,
      message,
      stack,
      context: context ? JSON.parse(JSON.stringify(context)) : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
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
