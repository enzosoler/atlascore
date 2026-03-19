/**
 * emailService.js
 *
 * Thin wrapper for transactional email via Supabase Edge Functions.
 * The Resend API key lives only in Supabase secrets — it never reaches the browser.
 *
 * All helpers are fire-and-forget: they log failures but never throw,
 * so email errors cannot break auth or any user-facing flow.
 */

import { supabase } from '@/lib/supabaseClient';

const APP_URL = import.meta.env.VITE_APP_URL || 'https://atlascore.app';

/**
 * Sends the Atlas welcome email to a newly registered user.
 * Always fire-and-forget — never awaited by callers.
 *
 * @param {object} params
 * @param {string} params.email       - Recipient email (required)
 * @param {string} [params.firstName] - First name for personalization
 */
export function sendWelcomeEmailAsync({ email, firstName = '' } = {}) {
  if (!email) {
    console.warn('[emailService] sendWelcomeEmailAsync: email is required, skipping');
    return;
  }

  supabase.functions
    .invoke('send-welcome-email', {
      body: {
        email,
        firstName: firstName || '',
        appUrl: APP_URL,
      },
    })
    .then(({ data, error }) => {
      if (error) {
        console.warn(`[emailService] Welcome email error for ${email}:`, error.message);
      } else {
        console.log(`[emailService] Welcome email sent to ${email} (id: ${data?.id})`);
      }
    })
    .catch((err) => {
      // Network-level failure — never propagates to the caller
      console.warn(`[emailService] Welcome email failed for ${email} (non-critical):`, err?.message || err);
    });
}
