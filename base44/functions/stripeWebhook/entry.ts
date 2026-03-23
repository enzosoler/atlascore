import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// BRL Monthly price IDs
const PLAN_CODE_MAP_BR_MONTHLY: Record<string, string> = {
  'price_1TBonPRieY0K8YEguhFtOLGB': 'pro',
  'price_1TBonPRieY0K8YEgJb2sbJ2e': 'performance',
  'price_1TBonPRieY0K8YEg6A2FWB50': 'coach',
  'price_1TBonPRieY0K8YEgZSEcQ7n0': 'nutritionist',
  'price_1TBonPRieY0K8YEgR4CNK6VA': 'clinician',
};

// USD Monthly price IDs (from env vars)
const PLAN_CODE_MAP_US_MONTHLY: Record<string, string> = {
  [Deno.env.get('STRIPE_PRICE_US_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_US_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_US_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_US_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_US_CLINICIAN') || '']: 'clinician',
};

// BRL Yearly price IDs (from env vars)
const PLAN_CODE_MAP_BR_YEARLY: Record<string, string> = {
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_CLINICIAN') || '']: 'clinician',
};

// USD Yearly price IDs (from env vars)
const PLAN_CODE_MAP_US_YEARLY: Record<string, string> = {
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE') || '']: 'performance',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_COACH') || '']: 'coach',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_NUTRITIONIST') || '']: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_CLINICIAN') || '']: 'clinician',
};

// Merge all price ID mappings
const ALL_PLAN_CODE_MAP: Record<string, string> = {
  ...PLAN_CODE_MAP_BR_MONTHLY,
  ...PLAN_CODE_MAP_US_MONTHLY,
  ...PLAN_CODE_MAP_BR_YEARLY,
  ...PLAN_CODE_MAP_US_YEARLY,
};

function getPlanCodeFromPriceId(priceId: string): string | null {
  return ALL_PLAN_CODE_MAP[priceId] || null;
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

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get signature from headers
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      console.error('stripeWebhook: Missing stripe-signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('stripeWebhook: Signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`stripeWebhook: Received event type=${event.type} id=${event.id}`);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`stripeWebhook: Processing checkout.session.completed session_id=${session.id}`);

      const base44 = createClientFromRequest(req);

      // Extract plan code from line items
      const items = await stripe.checkout.sessions.listLineItems(session.id);
      const item = items.data[0];
      
      if (!item || !item.price) {
        console.error(`stripeWebhook: No line item found in session ${session.id}`);
        return Response.json({ error: 'No line item' }, { status: 400 });
      }

      const priceId = item.price.id;
      const planCode = getPlanCodeFromPriceId(priceId);
      
      if (!planCode) {
        console.error(`stripeWebhook: Unknown price ID ${priceId}`);
        return Response.json({ error: 'Unknown price' }, { status: 400 });
      }

      // Get customer email from multiple possible sources
      const customerEmail = session.customer_email || session.customer_details?.email;
      if (!customerEmail) {
        console.error(`stripeWebhook: No customer email in session ${session.id}`);
        return Response.json({ error: 'No customer email' }, { status: 400 });
      }

      // Find existing subscription
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        user_email: customerEmail,
      });

      // Get subscription and customer details with full sync
      let stripeCustomerId = session.customer;
      let stripeSubscriptionId = session.subscription;

      if (stripeSubscriptionId) {
        try {
          const subscriptionData = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          stripeCustomerId = subscriptionData.customer;
          
          const currentPeriodStart = new Date(subscriptionData.current_period_start * 1000).toISOString();
          const currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000).toISOString();
          const trialEnd = subscriptionData.trial_end 
            ? new Date(subscriptionData.trial_end * 1000).toISOString().split('T')[0]
            : null;
          
          const subscriptionStatus = subscriptionData.status === 'trialing' ? 'trialing' : 'active';
          const subscriptionRecord: any = {
            plan_code: planCode,
            status: subscriptionStatus,
            source: 'stripe',
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_price_id: priceId,
            current_period_starts_at: currentPeriodStart,
            current_period_ends_at: currentPeriodEnd,
            trial_ends_at: trialEnd,
            cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
          };

          if (!subscriptionData.trial_end) {
            subscriptionRecord.started_at = new Date().toISOString().split('T')[0];
          }

          if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, subscriptionRecord);
            console.log(`stripeWebhook: Updated subscription for ${customerEmail}`);
          } else {
            subscriptionRecord.user_email = customerEmail;
            await base44.asServiceRole.entities.Subscription.create(subscriptionRecord);
            console.log(`stripeWebhook: Created subscription for ${customerEmail}`);
          }
        } catch (subErr: any) {
          console.error(`stripeWebhook: Error retrieving subscription ${stripeSubscriptionId}:`, subErr.message);
          // Fallback: create basic record
          const basicRecord: any = {
            plan_code: planCode,
            status: 'active',
            source: 'stripe',
            started_at: new Date().toISOString().split('T')[0],
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_price_id: priceId,
          };

          if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, basicRecord);
          } else {
            basicRecord.user_email = customerEmail;
            await base44.asServiceRole.entities.Subscription.create(basicRecord);
          }
        }
      }
    }

    // Handle customer.subscription.updated (upgrade, downgrade, cancel schedule)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      console.log(`stripeWebhook: Processing customer.subscription.updated sub_id=${subscription.id} status=${subscription.status}`);

      const base44 = createClientFromRequest(req);

      const ourStatus = STATUS_MAP[subscription.status] || subscription.status;

      try {
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id,
        });

        if (existing && existing.length > 0) {
          const updateData: any = {
            status: ourStatus,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
          };

          // Update period dates
          if (subscription.current_period_start) {
            updateData.current_period_starts_at = new Date(subscription.current_period_start * 1000).toISOString();
          }
          if (subscription.current_period_end) {
            updateData.current_period_ends_at = new Date(subscription.current_period_end * 1000).toISOString();
          }

          // Check if plan changed (upgrade/downgrade)
          const currentItem = subscription.items?.data?.[0];
          if (currentItem?.price?.id) {
            const newPlanCode = getPlanCodeFromPriceId(currentItem.price.id);
            if (newPlanCode && newPlanCode !== existing[0].plan_code) {
              updateData.plan_code = newPlanCode;
              updateData.stripe_price_id = currentItem.price.id;
              console.log(`stripeWebhook: Plan changed from ${existing[0].plan_code} to ${newPlanCode}`);
            }
          }

          await base44.asServiceRole.entities.Subscription.update(existing[0].id, updateData);
          console.log(`stripeWebhook: Updated subscription status to ${ourStatus}`);
        }
      } catch (dbErr: any) {
        console.error(`stripeWebhook: Database error updating ${subscription.id}:`, dbErr.message);
      }
    }

    // Handle customer.subscription.deleted (subscription ended/canceled)
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log(`stripeWebhook: Processing customer.subscription.deleted sub_id=${subscription.id}`);

      const base44 = createClientFromRequest(req);

      try {
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripe_subscription_id: subscription.id,
        });

        if (existing && existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: 'canceled',
            cancel_at_period_end: false,
          });
          console.log(`stripeWebhook: Subscription marked as canceled`);
        }
      } catch (dbErr: any) {
        console.error(`stripeWebhook: Database error deleting ${subscription.id}:`, dbErr.message);
      }
    }

    // Handle invoice.payment_failed
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.log(`stripeWebhook: Processing invoice.payment_failed invoice_id=${invoice.id}`);

      if (invoice.subscription) {
        const base44 = createClientFromRequest(req);
        try {
          const existing = await base44.asServiceRole.entities.Subscription.filter({
            stripe_subscription_id: invoice.subscription,
          });

          if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
              status: 'past_due',
            });
            console.log(`stripeWebhook: Updated subscription status to past_due`);
          }
        } catch (dbErr: any) {
          console.error(`stripeWebhook: Database error for invoice ${invoice.id}:`, dbErr.message);
        }
      }
    }

    // Handle invoice.paid (successful renewal)
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      console.log(`stripeWebhook: Processing invoice.paid invoice_id=${invoice.id}`);

      if (invoice.subscription) {
        const base44 = createClientFromRequest(req);
        try {
          const existing = await base44.asServiceRole.entities.Subscription.filter({
            stripe_subscription_id: invoice.subscription,
          });

          if (existing && existing.length > 0) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
              status: 'active',
              current_period_starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            });
            console.log(`stripeWebhook: Subscription renewed, status set to active`);
          }
        } catch (dbErr: any) {
          console.error(`stripeWebhook: Database error for invoice ${invoice.id}:`, dbErr.message);
        }
      }
    }

    // Handle customer.subscription.trial_will_end (3 days before trial ends)
    if (event.type === 'customer.subscription.trial_will_end') {
      const subscription = event.data.object;
      console.log(`stripeWebhook: Processing customer.subscription.trial_will_end sub_id=${subscription.id}`);
      // App already has trial expiring email logic via checkEntitlement
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('stripeWebhook: Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});