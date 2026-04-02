/**
 * Shared helper to send push notifications from any edge function.
 * Calls the send-push function internally via Supabase's function invocation.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function sendPush(
  userId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { error } = await supabase.functions.invoke('send-push', {
    body: { user_id: userId, title, body, data },
  });

  if (error) {
    console.warn('[push] Failed to send push:', error.message);
  }
}
