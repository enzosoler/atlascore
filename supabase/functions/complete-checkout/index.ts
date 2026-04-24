/**
 * complete-checkout
 *
 * Called by the frontend after a successful Stripe Checkout redirect.
 * Retrieves the session directly from Stripe and writes the subscription
 * row to Supabase — acts as a reliable fallback when the stripe-webhook
 * signature is misconfigured.
 *
 * Requires: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional for QA: STRIPE_TEST_MODE, STRIPE_TEST_SECRET_KEY
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { writeSubscriptionByUserId } from '../_shared/subscription-write.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function isTruthy(value: string | undefined | null): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase());
}

function resolveStripeSecretKey() {
  const defaultSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const testMode = isTruthy(Deno.env.get('STRIPE_TEST_MODE')) || defaultSecretKey.startsWith('sk_test_');
  const stripeKey = testMode
    ? (Deno.env.get('STRIPE_TEST_SECRET_KEY') || defaultSecretKey)
    : defaultSecretKey;

  return { stripeKey, testMode };
}

// Mirror the same plan normalization used in stripe-webhook
function normalizePlanCode(plan: string | null | undefined): string | null {
  if (!plan) return null;
  const map: Record<string, string> = {
    athlete_pro: 'pro',
    athlete_performance: 'performance',
  };
  return map[plan] ?? plan;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── 1. Validate JWT (Supabase runtime handles this when verify_jwt=true) ──
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '').trim();

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const { stripeKey } = resolveStripeSecretKey();

  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 503, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Get authenticated user from JWT
  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let sessionId: string;
  try {
    const body = await req.json();
    sessionId = body.session_id;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── 3. Retrieve session from Stripe ───────────────────────────────────────
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    console.error('complete-checkout: Failed to retrieve session', msg);
    return new Response(JSON.stringify({ error: `Stripe error: ${msg}` }), {
      status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── 4. Security: session must belong to this user ─────────────────────────
  if (session.metadata?.user_id && session.metadata.user_id !== user.id) {
    console.error('complete-checkout: user_id mismatch', { session: session.metadata.user_id, jwt: user.id });
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── 5. Only process completed sessions ────────────────────────────────────
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return new Response(JSON.stringify({ error: 'Session not complete', status: session.status }), {
      status: 422, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── 6. Build subscription row ─────────────────────────────────────────────
  const sub = session.subscription as Stripe.Subscription | null;
  if (!sub) {
    return new Response(JSON.stringify({ error: 'No subscription in session' }), {
      status: 422, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const priceId = sub.items.data[0]?.price?.id ?? null;
  const rawPlan = session.metadata?.plan ?? null;
  const planCode = normalizePlanCode(rawPlan) ?? 'pro';

  const subscriptionRow = {
    user_id: user.id,
    stripe_customer_id: (sub.customer as string) ?? null,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    tier: planCode,
    status: sub.status === 'trialing' ? 'trialing' : 'active',
    current_period_starts_at: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_ends_at: new Date(sub.current_period_end * 1000).toISOString(),
    trial_starts_at: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
  };

  console.log('complete-checkout: upserting subscription', { user_id: user.id, plan: planCode, sub_id: sub.id });

  try {
    await writeSubscriptionByUserId(supabase, subscriptionRow);
  } catch (upsertErr) {
    const detail = upsertErr instanceof Error ? upsertErr.message : String(upsertErr);
    console.error('complete-checkout: subscription write failed', upsertErr);
    return new Response(JSON.stringify({ error: 'DB error', detail }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  console.log('complete-checkout: success', { user_id: user.id });
  return new Response(JSON.stringify({ success: true, plan: planCode }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
