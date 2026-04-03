import { supabase } from '@/lib/supabaseClient';

/**
 * Fire-and-forget product event tracking.
 * Logs activation-funnel events to the `product_events` table in Supabase.
 *
 * @param {string}  userId   – auth.users UUID
 * @param {string}  event    – event name (e.g. 'onboarding_completed')
 * @param {object}  metadata – optional JSON payload
 */
export async function trackProductEvent(userId, event, metadata = {}) {
  if (!userId) return;
  try {
    await supabase.from('product_events').insert({
      user_id: userId,
      event,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    // Non-blocking — never surface tracking errors to the user.
    console.warn('[ProductEvents]', e);
  }
}
