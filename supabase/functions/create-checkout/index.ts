/**
 * create-checkout - Stripe Checkout Session for Subscriptions
 *
 * Deploy:
 *   supabase functions deploy create-checkout
 *
 * Secrets required:
 *   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
 *   supabase secrets set APP_URL=https://useatlascore.com
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Price IDs configuration
const PRICE_MAP: Record<string, Record<string, string>> = {
  br_monthly: {
    athlete_pro: Deno.env.get('STRIPE_PRICE_BR_MONTHLY_ATHLETE_PRO') || '',
    athlete_performance: Deno.env.get('STRIPE_PRICE_BR_MONTHLY_ATHLETE_PERFORMANCE') || '',
    coach: Deno.env.get('STRIPE_PRICE_BR_MONTHLY_COACH') || '',
    nutritionist: Deno.env.get('STRIPE_PRICE_BR_MONTHLY_NUTRITIONIST') || '',
    clinician: Deno.env.get('STRIPE_PRICE_BR_MONTHLY_CLINICIAN') || '',
  },
  br_yearly: {
    athlete_pro: Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO') || '',
    athlete_performance: Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE') || '',
    coach: Deno.env.get('STRIPE_PRICE_BR_YEARLY_COACH') || '',
    nutritionist: Deno.env.get('STRIPE_PRICE_BR_YEARLY_NUTRITIONIST') || '',
    clinician: Deno.env.get('STRIPE_PRICE_BR_YEARLY_CLINICIAN') || '',
  },
  us_monthly: {
    athlete_pro: Deno.env.get('STRIPE_PRICE_US_MONTHLY_ATHLETE_PRO') || '',
    athlete_performance: Deno.env.get('STRIPE_PRICE_US_MONTHLY_ATHLETE_PERFORMANCE') || '',
    coach: Deno.env.get('STRIPE_PRICE_US_MONTHLY_COACH') || '',
    nutritionist: Deno.env.get('STRIPE_PRICE_US_MONTHLY_NUTRITIONIST') || '',
    clinician: Deno.env.get('STRIPE_PRICE_US_MONTHLY_CLINICIAN') || '',
  },
  us_yearly: {
    athlete_pro: Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PRO') || '',
    athlete_performance: Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE') || '',
    coach: Deno.env.get('STRIPE_PRICE_US_YEARLY_COACH') || '',
    nutritionist: Deno.env.get('STRIPE_PRICE_US_YEARLY_NUTRITIONIST') || '',
    clinician: Deno.env.get('STRIPE_PRICE_US_YEARLY_CLINICIAN') || '',
  },
};

interface CheckoutRequest {
  plan: string;
  user_id: string;
  email: string;
  region?: 'BR' | 'US';
  billing?: 'monthly' | 'yearly';
  success_url?: string;
  cancel_url?: string;
}

serve(async (req) => {
  // DEBUG: Log all headers and request info
  console.log('[create-checkout] === REQUEST DEBUG ===');
  console.log('[create-checkout] Method:', req.method);
  console.log('[create-checkout] Headers:');
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'authorization') {
      console.log(`  ${key}: Bearer ${value.substring(0, 20)}... (${value.length} chars)`);
    } else {
      console.log(`  ${key}: ${value.substring(0, 50)}`);
    }
  });
  console.log('[create-checkout] =====================');
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
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 503,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { plan, user_id, email, region = 'BR', billing = 'monthly', success_url, cancel_url } = body;

  if (!plan || !user_id || !email) {
    return new Response(JSON.stringify({ error: 'Missing required fields: plan, user_id, email' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const regionKey = region.toLowerCase() === 'us' ? 'us' : 'br';
  const billingKey = billing === 'yearly' ? 'yearly' : 'monthly';
  const priceKey = `${regionKey}_${billingKey}`;
  const priceId = PRICE_MAP[priceKey]?.[plan];

  console.log(`[create-checkout] plan=${plan} region=${region} billing=${billing} priceKey=${priceKey} priceId=${priceId || 'NOT FOUND'}`);

  if (!priceId) {
    console.error(`[create-checkout] Price not configured for priceKey=${priceKey} plan=${plan}`);
    return new Response(JSON.stringify({ error: `Price not configured for plan: ${plan}, region: ${region}, billing: ${billing}` }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const origin = req.headers.get('origin') || appUrl;

  try {
    // Create or retrieve Stripe customer
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Check for existing Stripe customer
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Search for existing customer in Stripe by email
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email,
          metadata: { user_id, app: 'atlas-core' },
        });
        customerId = customer.id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${origin}/Today?subscribed=1`,
      cancel_url: cancel_url || `${origin}/Pricing`,
      metadata: {
        user_id,
        plan,
        email,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id,
          plan,
          email,
        },
      },
      allow_promotion_codes: true,
    });

    console.log(`create-checkout: session=${session.id} user=${user_id} plan=${plan}`);

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-checkout error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
