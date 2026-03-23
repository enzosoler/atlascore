import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Plan code mapping: Stripe price ID -> plan_code for Subscription entity
const PLAN_CODE_MAP = {
  'price_1TBonPRieY0K8YEguhFtOLGB': 'pro',           // Pro
  'price_1TBonPRieY0K8YEgJb2sbJ2e': 'performance',   // Performance
  'price_1TBonPRieY0K8YEg6A2FWB50': 'coach',         // Coach
  'price_1TBonPRieY0K8YEgZSEcQ7n0': 'nutritionist',  // Nutritionist
  'price_1TBonPRieY0K8YEgR4CNK6VA': 'clinician',     // Clinician
};

// USD price IDs (from env vars)
const PLAN_CODE_MAP_US = {
  [Deno.env.get('STRIPE_PRICE_US_ATHLETE_PRO')]: 'pro',
  [Deno.env.get('STRIPE_PRICE_US_ATHLETE_PERFORMANCE')]: 'performance',
  [Deno.env.get('STRIPE_PRICE_US_COACH')]: 'coach',
  [Deno.env.get('STRIPE_PRICE_US_NUTRITIONIST')]: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_US_CLINICIAN')]: 'clinician',
};

// Yearly BRL price IDs (from env vars)
const PLAN_CODE_MAP_BR_YEARLY = {
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO')]: 'pro',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE')]: 'performance',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_COACH')]: 'coach',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_NUTRITIONIST')]: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_BR_YEARLY_CLINICIAN')]: 'clinician',
};

// Yearly USD price IDs (from env vars)
const PLAN_CODE_MAP_US_YEARLY = {
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PRO')]: 'pro',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE')]: 'performance',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_COACH')]: 'coach',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_NUTRITIONIST')]: 'nutritionist',
  [Deno.env.get('STRIPE_PRICE_US_YEARLY_CLINICIAN')]: 'clinician',
};

// Merge all price ID mappings
const ALL_PLAN_CODE_MAP = {
  ...PLAN_CODE_MAP,
  ...PLAN_CODE_MAP_US,
  ...PLAN_CODE_MAP_BR_YEARLY,
  ...PLAN_CODE_MAP_US_YEARLY,
};

function getPlanCodeFromPriceId(priceId: string): string | null {
  return ALL_PLAN_CODE_MAP[priceId] || null;
}

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { email, return_url } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const origin = req.headers.get('origin') || 'https://useatlascore.com';

    // Find existing subscription to get stripe_customer_id
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: email,
    });

    let customerId: string | null = null;

    if (subscriptions && subscriptions.length > 0) {
      // Find subscription with stripe_customer_id
      const subWithCustomer = subscriptions.find(s => s.stripe_customer_id);
      if (subWithCustomer) {
        customerId = subWithCustomer.stripe_customer_id;
      }
    }

    // If no customer ID found, try to find or create customer in Stripe
    if (!customerId) {
      // Search for existing customer by email
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: email,
          metadata: {
            base44_app_id: Deno.env.get('BASE44_APP_ID') || '',
          },
        });
        customerId = customer.id;
      }

      // Update subscription record with customer ID if exists
      if (subscriptions && subscriptions.length > 0 && subscriptions[0].id) {
        await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
          stripe_customer_id: customerId,
        });
      }
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || `${origin}/Settings`,
    });

    console.log(`createCustomerPortal: Created portal session for ${email}, customer=${customerId}`);

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('createCustomerPortal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
