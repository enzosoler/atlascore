/**
 * stripe-webhook - Handle Stripe webhook events for subscription sync
 *
 * Deploy:
 *   supabase functions deploy stripe-webhook --no-verify-jwt
 *
 * Secrets required:
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 *   RESEND_API_KEY, FROM_EMAIL, APP_URL
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   + all STRIPE_PRICE_* env vars
 *
 * NOTE: Email helpers are inlined here (not imported from _shared/) to avoid
 * the Supabase Edge Runtime BOOT_ERROR caused by the logger+templates module
 * chain exceeding the runtime's module budget when combined with stripe@12.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'stripe-signature, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Map Stripe price IDs to plan codes.
// Env var names must match create-checkout/index.ts (ATHLETE_PRO, ATHLETE_PERFORMANCE).
const PRICE_TO_PLAN: Record<string, string> = {
  [Deno.env.get('STRIPE_PRICE_BR_MONTHLY_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_BR_MONTHLY_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_BR_MONTHLY_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_BR_MONTHLY_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_BR_MONTHLY_CLINICIAN') || '']: 'clinician',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_CLINICIAN') || '']: 'clinician',
  [Deno.env.get('STRIPE_PRICE_US_MONTHLY_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_US_MONTHLY_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_US_MONTHLY_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_US_MONTHLY_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_US_MONTHLY_CLINICIAN') || '']: 'clinician',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_CLINICIAN') || '']: 'clinician',
};

// Normalize plan names from checkout metadata to internal tier codes.
// create-checkout uses 'athlete_pro'/'athlete_performance'; the DB uses 'pro'/'performance'.
function normalizePlanCode(plan: string | null | undefined): string | null {
  if (!plan) return null;
  const map: Record<string, string> = {
    athlete_pro: 'pro',
    athlete_performance: 'performance',
  };
  return map[plan] ?? plan;
}

// Map Stripe status to our status
const STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  canceled: 'canceled',
  incomplete: 'past_due',
  incomplete_expired: 'expired',
  unpaid: 'past_due',
  paused: 'inactive',
};

function getPlanFromPriceId(priceId: string): string | null {
  return PRICE_TO_PLAN[priceId] || null;
}

async function getUserProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ email: string; firstName: string } | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, first_name')
    .eq('id', userId)
    .single();

  if (!profile?.email) return null;
  return { email: profile.email, firstName: profile.first_name || '' };
}

// ── Inline email helpers ─────────────────────────────────────────────────────
// These are inlined rather than imported from _shared/ to avoid BOOT_ERROR.
// The logger+templates module chain combined with stripe@12 exceeds the Edge
// Runtime module budget and crashes the function at startup.

async function sendSimpleEmail(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';
  if (!resendApiKey) {
    console.warn('stripe-webhook: RESEND_API_KEY not set, skipping email');
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to.trim().toLowerCase()], subject, html }),
    });
    if (!res.ok) {
      console.error('stripe-webhook: Resend error', res.status, await res.text());
    }
  } catch (e) {
    console.error('stripe-webhook: email send failed:', e);
  }
}

async function sendPaymentSuccessEmail(
  to: string, firstName: string, planName: string, amount: string, billingUrl: string
): Promise<void> {
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  await sendSimpleEmail(
    to,
    `Payment confirmed — ${planName} plan`,
    `<p>Hi ${firstName},</p><p>Your payment of <strong>${amount}</strong> for the <strong>${planName}</strong> plan was successful.</p><p><a href="${billingUrl}">View billing details</a></p><p>– Atlas Core</p><p><small><a href="${appUrl}">useatlascore.com</a></small></p>`
  );
}

async function sendPaymentFailedEmail(
  to: string, firstName: string, billingUrl: string
): Promise<void> {
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  await sendSimpleEmail(
    to,
    'Action required: payment failed',
    `<p>Hi ${firstName},</p><p>We were unable to process your latest payment. Please update your billing information to keep your subscription active.</p><p><a href="${billingUrl}">Update payment method</a></p><p>– Atlas Core</p><p><small><a href="${appUrl}">useatlascore.com</a></small></p>`
  );
}

async function sendSubscriptionCanceledEmail(
  to: string, firstName: string, periodEnd: string
): Promise<void> {
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  await sendSimpleEmail(
    to,
    'Your subscription has been canceled',
    `<p>Hi ${firstName},</p><p>Your Atlas Core subscription has been canceled. You'll continue to have access until <strong>${periodEnd}</strong>.</p><p><a href="${appUrl}/settings/billing">Reactivate subscription</a></p><p>– Atlas Core</p>`
  );
}

// ── Main handler ─────────────────────────────────────────────────────────────

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

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecretKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 503,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('stripe-webhook: Signature verification failed:', message);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  console.log(`stripe-webhook: Received event type=${event.type} id=${event.id}`);

  // ── Idempotency check: skip already processed events ───────────────────────
  const { data: existingEvent } = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .limit(1)
    .maybeSingle();

  if (existingEvent) {
    console.log(`stripe-webhook: Event ${event.id} already processed, skipping`);
    return new Response(JSON.stringify({ received: true, idempotency: 'skipped' }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Store event ID with duplicate-safe insert (handles race conditions)
  const { error: insertError } = await supabaseAdmin
    .from('stripe_webhook_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  // If insert failed due to unique constraint, another worker processed this event
  if (insertError) {
    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
      console.log(`stripe-webhook: Event ${event.id} already processed by another worker, skipping`);
      return new Response(JSON.stringify({ received: true, idempotency: 'skipped' }), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    // Log other errors but continue processing (idempotency is best-effort)
    console.error('stripe-webhook: Failed to log event idempotency:', insertError);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`stripe-webhook: Processing checkout.session.completed session_id=${session.id}`);

        const userId = session.metadata?.user_id;
        const email = session.metadata?.email;
        const plan = session.metadata?.plan;

        if (!userId || !email) {
          console.error('stripe-webhook: Missing metadata in checkout session');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const priceId = subscription.items.data[0]?.price.id;
        // Use price-to-plan mapping first; fall back to normalized metadata plan name.
        const planCode = getPlanFromPriceId(priceId) || normalizePlanCode(plan);

        const subscriptionData = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          tier: planCode || 'pro',
          status: subscription.status === 'trialing' ? 'trialing' : 'active',
          current_period_starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_starts_at: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        };

        // Upsert subscription
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' });

        if (error) {
          console.error('stripe-webhook: Failed to upsert subscription:', error);
        } else {
          console.log(`stripe-webhook: Subscription created/updated for user=${userId}`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        console.log(`stripe-webhook: Processing ${event.type} sub_id=${subscriptionId}`);

        // Find subscription by stripe_subscription_id
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!existingSub?.user_id) {
          console.warn(`stripe-webhook: No subscription found for stripe_subscription_id=${subscriptionId}`);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const newPlan = priceId ? getPlanFromPriceId(priceId) : null;

        const updateData: Record<string, unknown> = {
          status: STATUS_MAP[subscription.status] || subscription.status,
          current_period_starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        };

        if (newPlan) {
          updateData.tier = newPlan;
          updateData.stripe_price_id = priceId;
        }

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update(updateData)
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('stripe-webhook: Failed to update subscription:', error);
        } else {
          console.log(`stripe-webhook: Subscription updated for user=${existingSub.user_id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        console.log(`stripe-webhook: Processing customer.subscription.deleted sub_id=${subscriptionId}`);

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!existingSub?.user_id) {
          console.warn(`stripe-webhook: No subscription found for deletion: ${subscriptionId}`);
          break;
        }

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('user_id', existingSub.user_id);

        if (error) {
          console.error('stripe-webhook: Failed to mark subscription as canceled:', error);
        } else {
          console.log(`stripe-webhook: Subscription marked as canceled for user=${existingSub.user_id}`);

          const profile = await getUserProfile(supabaseAdmin, existingSub.user_id);
          if (profile) {
            const periodEnd = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : 'the end of your billing period';
            await sendSubscriptionCanceledEmail(profile.email, profile.firstName, periodEnd);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log(`stripe-webhook: Processing invoice.paid invoice_id=${invoice.id}`);

        if (!invoice.subscription) break;

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', invoice.subscription)
          .single();

        if (!existingSub?.user_id) break;

        // Get updated subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('user_id', existingSub.user_id);

        if (error) {
          console.error('stripe-webhook: Failed to update subscription after payment:', error);
        } else {
          console.log(`stripe-webhook: Subscription renewed for user=${existingSub.user_id}`);

          // Send payment success email (skip for first invoice — welcome/trial_started covers that)
          if (invoice.billing_reason !== 'subscription_create') {
            const profile = await getUserProfile(supabaseAdmin, existingSub.user_id);
            if (profile) {
              const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
              const planCode = getPlanFromPriceId(invoice.lines?.data[0]?.price?.id || '') || 'Pro';
              const planName = planCode.charAt(0).toUpperCase() + planCode.slice(1);
              const amountFormatted = invoice.amount_paid
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency?.toUpperCase() || 'USD' }).format(invoice.amount_paid / 100)
                : '';
              await sendPaymentSuccessEmail(
                profile.email,
                profile.firstName,
                planName,
                amountFormatted,
                `${appUrl}/settings/billing`
              );
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`stripe-webhook: Processing invoice.payment_failed invoice_id=${invoice.id}`);

        if (!invoice.subscription) break;

        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', invoice.subscription)
          .single();

        if (!existingSub?.user_id) break;

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('user_id', existingSub.user_id);

        if (error) {
          console.error('stripe-webhook: Failed to update subscription status to past_due:', error);
        } else {
          console.log(`stripe-webhook: Subscription marked as past_due for user=${existingSub.user_id}`);

          const profile = await getUserProfile(supabaseAdmin, existingSub.user_id);
          if (profile) {
            const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
            await sendPaymentFailedEmail(
              profile.email,
              profile.firstName,
              `${appUrl}/settings/billing`
            );
          }
        }
        break;
      }

      default:
        console.log(`stripe-webhook: Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('stripe-webhook: Error processing event:', error);
    // Return 200 so Stripe doesn't retry for processing errors
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
