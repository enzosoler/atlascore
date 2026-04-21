import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const WIPE_TABLES = [
  'protocol_logs',
  'protocols',
  'workout_sets',
  'workout_sessions',
  'workout_logs',
  'workouts',
  'workout_plans',
  'food_logs',
  'daily_checkins',
  'measurements',
  'progress_photos',
  'coach_messages',
  'coach_memory',
  'product_events',
  'error_logs',
  'subscriptions',
  'subscription_events',
  'user_data_resets',
];

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function cancelStripeSubscription(stripe: Stripe, subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.status !== 'canceled' && subscription.status !== 'incomplete_expired') {
    await stripe.subscriptions.cancel(subscriptionId);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

  const userScoped = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user }, error: authError } = await userScoped.auth.getUser();
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('id, status, stripe_subscription_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeStatuses = ['active', 'trialing', 'granted', 'past_due'];
  if (subscription?.status && activeStatuses.includes(subscription.status)) {
    if (subscription.stripe_subscription_id) {
      if (!stripeSecretKey) {
        return json({
          error: 'Active Stripe subscription found but Stripe is not configured for safe cancellation.',
        }, 503);
      }
      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
      await cancelStripeSubscription(stripe, subscription.stripe_subscription_id);
    } else {
      return json({
        error: 'Cancel your App Store or Play Store subscription before deleting this account.',
        code: 'cancel_store_subscription_first',
      }, 409);
    }
  }

  try {
    const { data: files } = await admin.storage.from('progress-photos').list(user.id, { limit: 1000 });
    if (files?.length) {
      const paths = files.map((file) => `${user.id}/${file.name}`);
      await admin.storage.from('progress-photos').remove(paths);
    }
  } catch (error) {
    console.warn('[self-delete-user] progress-photos cleanup failed:', error);
  }

  try {
    const { data: files } = await admin.storage.from('lab-exams').list(user.id, { limit: 1000 });
    if (files?.length) {
      const paths = files.map((file) => `${user.id}/${file.name}`);
      await admin.storage.from('lab-exams').remove(paths);
    }
  } catch (error) {
    console.warn('[self-delete-user] lab-exams cleanup failed:', error);
  }

  for (const table of WIPE_TABLES) {
    try {
      await admin.from(table).delete().eq('user_id', user.id);
    } catch (error) {
      console.warn(`[self-delete-user] table cleanup failed for ${table}:`, error);
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('[self-delete-user] delete failed:', deleteError);
    return json({ error: deleteError.message || 'Could not delete account' }, 500);
  }

  return json({ success: true, deletedUserId: user.id }, 200);
});
