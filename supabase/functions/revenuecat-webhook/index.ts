/**
 * revenuecat-webhook — Handle RevenueCat webhook events
 *
 * Responsibilities:
 *   1. Upsert the `subscriptions` row for the user (grants / revokes entitlement).
 *   2. Create or reverse affiliate commissions for influencer referrals.
 *   3. Store the raw event in `subscription_events` for audit + idempotency.
 *
 * Entitlement source of truth:
 *   The web uses Stripe (stripe-webhook + complete-checkout).
 *   Mobile (iOS/Android) uses RevenueCat → this webhook.
 *   Both write to the same `subscriptions` table, keyed on user_id.
 *
 * Deploy:
 *   supabase functions deploy revenuecat-webhook --no-verify-jwt
 *
 * Secrets required:
 *   REVENUECAT_WEBHOOK_SECRET
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * RevenueCat dashboard:
 *   Configure webhook URL as:
 *     https://<project>.supabase.co/functions/v1/revenuecat-webhook
 *   Set Authorization header to the REVENUECAT_WEBHOOK_SECRET value.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// All active RevenueCat products grant the 'pro' tier today. The RevenueCat
// SDK layer (src/lib/revenueCat.js) uses a single entitlement `atlas.core Pro`
// and maps every active entitlement to tier='pro'. If you ever split mobile
// products into Pro vs Performance tiers, update this function accordingly.
const DEFAULT_TIER = 'pro';

// Event types that GRANT or EXTEND access.
const GRANTING_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
]);

// Event types that REVOKE access immediately.
const REVOKING_EVENTS = new Set([
  'EXPIRATION',
  'SUBSCRIPTION_PAUSED',
  'REFUND',
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── Verify webhook secret ────────────────────────────────────────────────
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('revenuecat-webhook: REVENUECAT_WEBHOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 503,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : authHeader;

  if (bearerToken !== webhookSecret) {
    console.error('revenuecat-webhook: Invalid authorization');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event || !event.id || !event.type) {
    console.error('revenuecat-webhook: Missing event data in payload');
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const eventId = event.id as string;
  const eventType = event.type as string;
  const appUserId = event.app_user_id as string;
  const productId = event.product_id as string | undefined;
  const store = event.store as string | undefined;
  const transactionId = event.transaction_id as string | undefined;
  const originalTransactionId = event.original_transaction_id as string | undefined;
  const priceInPurchasedCurrency = event.price_in_purchased_currency as number | undefined;
  const currency = event.currency as string | undefined;
  const eventTimestampMs = event.event_timestamp_ms as number | undefined;
  const purchasedAtMs = event.purchased_at_ms as number | undefined;
  const expirationAtMs = event.expiration_at_ms as number | undefined;
  const periodType = (event.period_type as string | undefined)?.toUpperCase() ?? null;
  const environment = event.environment as string | undefined;

  console.log(`revenuecat-webhook: Received type=${eventType} id=${eventId} user=${appUserId} env=${environment}`);

  // ── Init Supabase admin client ───────────────────────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  // ── Deduplication ────────────────────────────────────────────────────────
  const { data: existingEvent } = await supabaseAdmin
    .from('subscription_events')
    .select('id')
    .eq('revenuecat_event_id', eventId)
    .limit(1)
    .maybeSingle();

  if (existingEvent) {
    console.log(`revenuecat-webhook: Event ${eventId} already processed, skipping`);
    return new Response(JSON.stringify({ received: true, idempotency: 'skipped' }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── Insert raw event ─────────────────────────────────────────────────────
  const { error: insertError } = await supabaseAdmin
    .from('subscription_events')
    .insert({
      revenuecat_event_id: eventId,
      user_id: appUserId,
      event_type: eventType,
      product_id: productId || null,
      store: store || null,
      transaction_id: transactionId || null,
      original_transaction_id: originalTransactionId || null,
      price: priceInPurchasedCurrency ?? null,
      currency: currency || null,
      event_timestamp: eventTimestampMs
        ? new Date(eventTimestampMs).toISOString()
        : null,
      raw_payload: body,
    });

  if (insertError) {
    // Duplicate key means another worker got it — still return 200
    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
      console.log(`revenuecat-webhook: Event ${eventId} already processed by another worker, skipping`);
      return new Response(JSON.stringify({ received: true, idempotency: 'skipped' }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    console.error('revenuecat-webhook: Failed to insert event:', insertError);
    // Return 500 so RevenueCat retries — we haven't actually processed it.
    return new Response(JSON.stringify({ error: 'Failed to record event' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── Process event ────────────────────────────────────────────────────────
  try {
    // 1. Entitlement sync — grant or revoke access in `subscriptions`.
    if (GRANTING_EVENTS.has(eventType)) {
      await grantSubscription(supabaseAdmin, appUserId, {
        productId,
        store,
        periodType,
        purchasedAtMs,
        expirationAtMs,
      });
    } else if (eventType === 'CANCELLATION') {
      // CANCELLATION in RevenueCat means the user turned off auto-renew.
      // They KEEP access until expiration. Flag cancel_at_period_end but
      // don't change status — commissions stay intact (reversal only on REFUND).
      await markCancelAtPeriodEnd(supabaseAdmin, appUserId);
    } else if (eventType === 'BILLING_ISSUE') {
      await setSubscriptionStatus(supabaseAdmin, appUserId, 'past_due');
    } else if (REVOKING_EVENTS.has(eventType)) {
      await revokeSubscription(supabaseAdmin, appUserId, eventType);
    }

    // 2. Commission accounting — unchanged business logic, but decoupled.
    if (eventType === 'INITIAL_PURCHASE') {
      await handleInitialPurchaseCommission(supabaseAdmin, appUserId, {
        eventId,
        productId,
        store,
        transactionId,
        price: priceInPurchasedCurrency,
        currency,
      });
    } else if (eventType === 'REFUND') {
      // Refunds are the only events that reverse commissions. CANCELLATION
      // does not — the user may still be mid-period and the sale was genuine.
      await reverseCommissions(supabaseAdmin, appUserId, eventType);
    }
  } catch (error) {
    console.error('revenuecat-webhook: Error processing event:', error);
    // Return 500 so RevenueCat retries. Idempotency is protected by the
    // subscription_events unique constraint above.
    return new Response(JSON.stringify({ error: 'Processing failed' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

// ── Subscription grant / revoke ───────────────────────────────────────────

interface GrantDetails {
  productId?: string;
  store?: string;
  periodType: string | null;
  purchasedAtMs?: number;
  expirationAtMs?: number;
}

async function grantSubscription(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  details: GrantDetails,
): Promise<void> {
  if (!userId) {
    console.warn('revenuecat-webhook: grantSubscription called without user_id');
    return;
  }

  const isTrial = details.periodType === 'TRIAL' || details.periodType === 'INTRO';
  const now = new Date();
  const periodStart = details.purchasedAtMs ? new Date(details.purchasedAtMs) : now;
  // Non-renewing purchases (lifetime / one-shot) may have no expiration_at_ms.
  const periodEnd = details.expirationAtMs ? new Date(details.expirationAtMs) : null;

  const row = {
    user_id: userId,
    tier: DEFAULT_TIER,
    status: isTrial ? 'trialing' : 'active',
    current_period_starts_at: periodStart.toISOString(),
    current_period_ends_at: periodEnd ? periodEnd.toISOString() : null,
    trial_starts_at: isTrial ? periodStart.toISOString() : null,
    trial_ends_at: isTrial && periodEnd ? periodEnd.toISOString() : null,
    cancel_at_period_end: false,
    // Keep stripe fields null — this subscription came from RevenueCat.
    // The product_id can still be useful for debugging; store it in
    // stripe_price_id as a pragmatic workaround (no RC-specific column
    // exists yet). Rename to `external_price_id` in a future migration.
    stripe_price_id: details.productId ?? null,
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    console.error('revenuecat-webhook: Failed to grant subscription:', error);
    throw error;
  }
  console.log(`revenuecat-webhook: Subscription granted/renewed user=${userId} tier=${DEFAULT_TIER} trial=${isTrial}`);
}

async function markCancelAtPeriodEnd(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<void> {
  if (!userId) return;
  const { error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('user_id', userId);

  if (error) {
    console.error('revenuecat-webhook: Failed to mark cancel_at_period_end:', error);
    throw error;
  }
  console.log(`revenuecat-webhook: Marked cancel_at_period_end=true user=${userId}`);
}

async function setSubscriptionStatus(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  status: string,
): Promise<void> {
  if (!userId) return;
  const { error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('user_id', userId);

  if (error) {
    console.error(`revenuecat-webhook: Failed to set status=${status}:`, error);
    throw error;
  }
  console.log(`revenuecat-webhook: Status=${status} user=${userId}`);
}

async function revokeSubscription(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  reason: string,
): Promise<void> {
  if (!userId) return;

  // EXPIRATION → canceled; SUBSCRIPTION_PAUSED → inactive; REFUND → canceled.
  const statusMap: Record<string, string> = {
    EXPIRATION: 'canceled',
    SUBSCRIPTION_PAUSED: 'inactive',
    REFUND: 'canceled',
  };
  const status = statusMap[reason] ?? 'canceled';

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);

  if (error) {
    console.error(`revenuecat-webhook: Failed to revoke (${reason}):`, error);
    throw error;
  }
  console.log(`revenuecat-webhook: Subscription revoked user=${userId} reason=${reason} status=${status}`);
}

// ── Affiliate commissions (unchanged business logic) ──────────────────────

interface PurchaseDetails {
  eventId: string;
  productId?: string;
  store?: string;
  transactionId?: string;
  price?: number;
  currency?: string;
}

async function handleInitialPurchaseCommission(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  details: PurchaseDetails,
): Promise<void> {
  // Fetch user profile to check for attached influencer
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, influencer_id, creator_code, creator_locked')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.warn(`revenuecat-webhook: No profile found for user=${userId}`);
    return;
  }

  if (!profile.influencer_id) {
    console.log(`revenuecat-webhook: User ${userId} has no influencer, skipping commission`);
    return;
  }

  // Fetch influencer commission settings
  const { data: influencer, error: influencerError } = await supabase
    .from('influencers')
    .select('id, commission_percent, commission_model')
    .eq('id', profile.influencer_id)
    .single();

  if (influencerError || !influencer) {
    console.warn(`revenuecat-webhook: Influencer ${profile.influencer_id} not found`);
    return;
  }

  console.log(
    `revenuecat-webhook: Influencer found id=${influencer.id} ` +
    `model=${influencer.commission_model} percent=${influencer.commission_percent}`,
  );

  // Only create commission for first_payment_only model on initial purchase
  if (influencer.commission_model === 'first_payment_only') {
    const commissionAmount =
      details.price != null && influencer.commission_percent != null
        ? Math.round(details.price * (influencer.commission_percent / 100) * 100) / 100
        : null;

    const { error: commissionError } = await supabase
      .from('commissions')
      .insert({
        influencer_id: influencer.id,
        user_id: userId,
        event_id: details.eventId,
        product_id: details.productId || null,
        store: details.store || null,
        transaction_id: details.transactionId || null,
        gross_amount: details.price ?? null,
        currency: details.currency || null,
        commission_percent: influencer.commission_percent,
        commission_amount: commissionAmount,
        status: 'pending',
      });

    if (commissionError) {
      console.error('revenuecat-webhook: Failed to insert commission:', commissionError);
    } else {
      console.log(`revenuecat-webhook: Commission created for influencer=${influencer.id} user=${userId}`);
    }
  }

  // Lock the creator so the user can't change their code after purchase
  if (!profile.creator_locked) {
    const { error: lockError } = await supabase
      .from('profiles')
      .update({ creator_locked: true })
      .eq('id', userId);

    if (lockError) {
      console.error('revenuecat-webhook: Failed to lock creator:', lockError);
    } else {
      console.log(`revenuecat-webhook: Creator locked for user=${userId}`);
    }
  }
}

async function reverseCommissions(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  reason: string,
): Promise<void> {
  // Find pending commissions for this user to reverse.
  // Only called on REFUND — CANCELLATION does not reverse because the user
  // may still be mid-period and the sale was genuine until refunded.
  const { data: commissions, error: fetchError } = await supabase
    .from('commissions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (fetchError) {
    console.error('revenuecat-webhook: Failed to fetch commissions for reversal:', fetchError);
    return;
  }

  if (!commissions || commissions.length === 0) {
    console.log(`revenuecat-webhook: No pending commissions to reverse for user=${userId}`);
    return;
  }

  const ids = commissions.map((c) => c.id);
  const { error: updateError } = await supabase
    .from('commissions')
    .update({
      status: 'reversed',
      reversed_at: new Date().toISOString(),
    })
    .in('id', ids);

  if (updateError) {
    console.error('revenuecat-webhook: Failed to reverse commissions:', updateError);
  } else {
    console.log(
      `revenuecat-webhook: Reversed ${ids.length} commission(s) for user=${userId} ` +
      `reason=${reason}`,
    );
  }
}
