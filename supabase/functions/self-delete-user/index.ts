import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';


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
  'ai_recommendations',
  'ai_usage_quotas',
  'ai_usage_log',
  'onboarding_data',
  'user_profiles',
  'referrals',
  'lab_exams',
  'support_requests',
  'professional_links',
];

function makeJson(corsHeaders: Record<string, string>) {
  return function json(body: unknown, status: number) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };
}

async function cancelStripeSubscription(stripe: Stripe, subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.status !== 'canceled' && subscription.status !== 'incomplete_expired') {
    await stripe.subscriptions.cancel(subscriptionId);
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const json = makeJson(corsHeaders);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
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

  // H-5b: Delete RevenueCat subscriber BEFORE wiping Supabase data/auth so we
  // still have the user ID available. Best-effort — a RevenueCat failure must
  // never block account deletion.
  try {
    const rcSecretKey = Deno.env.get('REVENUECAT_SECRET_KEY') || '';
    if (rcSecretKey) {
      const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`;
      const rcRes = await fetch(rcUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${rcSecretKey}` },
      });
      if (!rcRes.ok && rcRes.status !== 404) {
        console.warn(`[self-delete-user] revenuecat subscriber delete returned ${rcRes.status}`);
      }
    } else {
      console.warn('[self-delete-user] REVENUECAT_SECRET_KEY not configured — skipping RC subscriber delete');
    }
  } catch (error) {
    console.warn('[self-delete-user] revenuecat subscriber delete failed:', error);
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

  // GDPR / privacy-policy obligation: scrub analytics person profile.
  // Best-effort only — if either PostHog or Sentry server credentials are
  // missing, log and continue so account deletion is never blocked by
  // analytics outages or partial setup.
  try {
    const phHost = Deno.env.get('POSTHOG_API_HOST') || 'https://us.i.posthog.com';
    const phProjectId = Deno.env.get('POSTHOG_PROJECT_ID') || '';
    const phPersonalKey = Deno.env.get('POSTHOG_PERSONAL_API_KEY') || '';
    if (phProjectId && phPersonalKey) {
      const url = `${phHost.replace(/\/$/, '')}/api/projects/${phProjectId}/persons/?distinct_id=${encodeURIComponent(user.id)}`;
      const lookup = await fetch(url, {
        headers: { Authorization: `Bearer ${phPersonalKey}` },
      });
      if (lookup.ok) {
        const body = await lookup.json();
        const personId = body?.results?.[0]?.id;
        if (personId) {
          const del = await fetch(
            `${phHost.replace(/\/$/, '')}/api/projects/${phProjectId}/persons/${personId}/?delete_events=true`,
            { method: 'DELETE', headers: { Authorization: `Bearer ${phPersonalKey}` } },
          );
          if (!del.ok) {
            console.warn(`[self-delete-user] posthog person delete returned ${del.status}`);
          }
        }
      } else {
        console.warn(`[self-delete-user] posthog person lookup returned ${lookup.status}`);
      }
    } else {
      console.warn('[self-delete-user] PostHog credentials not configured — skipping analytics person delete');
    }
  } catch (error) {
    console.warn('[self-delete-user] posthog scrub failed:', error);
  }

  // H-5c: Sentry user data scrub.
  // NOTE: Sentry does not expose a general programmatic "delete user" REST API
  // from backend code. The endpoint below targets the Sentry project users
  // resource which removes user identity data attached to error events, but it
  // is not guaranteed to scrub all PII from all Sentry products.
  // Manual fallback: if the endpoint below returns an error or is unconfigured,
  // an admin must manually delete the user via the Sentry dashboard at
  //   Settings > [Organization] > Users
  // or by contacting Sentry support. This manual step must be recorded in the
  // deletion audit log for GDPR compliance.
  try {
    const sentryAuthToken = Deno.env.get('SENTRY_AUTH_TOKEN') || '';
    const sentryOrg = Deno.env.get('SENTRY_ORG_SLUG') || '';
    const sentryProject = Deno.env.get('SENTRY_PROJECT_SLUG') || '';
    if (sentryAuthToken && sentryOrg && sentryProject) {
      // Hash the user id the same way Sentry stores it: the SDK sets
      // user.id directly, so we issue a tag-based event scrub by user id.
      const url = `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}/users/${encodeURIComponent(user.id)}/`;
      const del = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sentryAuthToken}` },
      });
      if (!del.ok && del.status !== 404) {
        console.warn(`[self-delete-user] sentry user scrub returned ${del.status}`);
      }
    } else {
      console.warn('[self-delete-user] Sentry credentials not configured — skipping analytics user scrub');
    }
  } catch (error) {
    console.warn('[self-delete-user] sentry scrub failed:', error);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('[self-delete-user] delete failed:', deleteError);
    return json({ error: deleteError.message || 'Could not delete account' }, 500);
  }

  return json({ success: true, deletedUserId: user.id }, 200);
});
