import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// ─── Price maps ────────────────────────────────────────────────────────────────
// Monthly — BRL (hardcoded, already live in Stripe)
const PRICE_MAP_BR_MONTHLY: Record<string, string> = {
  athlete_pro:         'price_1TBonPRieY0K8YEguhFtOLGB', // R$29/month
  athlete_performance: 'price_1TBonPRieY0K8YEgJb2sbJ2e', // R$59/month
  coach:               'price_1TBonPRieY0K8YEg6A2FWB50', // R$99/month
  nutritionist:        'price_1TBonPRieY0K8YEgZSEcQ7n0', // R$79/month
  clinician:           'price_1TBonPRieY0K8YEgR4CNK6VA', // R$129/month
};

// Monthly — USD (set env vars after creating in Stripe)
const PRICE_MAP_US_MONTHLY: Record<string, string> = {
  athlete_pro:         Deno.env.get('STRIPE_PRICE_US_ATHLETE_PRO')         || '',
  athlete_performance: Deno.env.get('STRIPE_PRICE_US_ATHLETE_PERFORMANCE') || '',
  coach:               Deno.env.get('STRIPE_PRICE_US_COACH')               || '',
  nutritionist:        Deno.env.get('STRIPE_PRICE_US_NUTRITIONIST')        || '',
  clinician:           Deno.env.get('STRIPE_PRICE_US_CLINICIAN')           || '',
};

// Yearly — BRL (set env vars after creating in Stripe: R$249/R$499/R$849/R$679/R$1099)
const PRICE_MAP_BR_YEARLY: Record<string, string> = {
  athlete_pro:         Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO')         || '',
  athlete_performance: Deno.env.get('STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE') || '',
  coach:               Deno.env.get('STRIPE_PRICE_BR_YEARLY_COACH')               || '',
  nutritionist:        Deno.env.get('STRIPE_PRICE_BR_YEARLY_NUTRITIONIST')        || '',
  clinician:           Deno.env.get('STRIPE_PRICE_BR_YEARLY_CLINICIAN')           || '',
};

// Yearly — USD (set env vars after creating in Stripe: $79/$159/$249/$199/$319)
const PRICE_MAP_US_YEARLY: Record<string, string> = {
  athlete_pro:         Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PRO')         || '',
  athlete_performance: Deno.env.get('STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE') || '',
  coach:               Deno.env.get('STRIPE_PRICE_US_YEARLY_COACH')               || '',
  nutritionist:        Deno.env.get('STRIPE_PRICE_US_YEARLY_NUTRITIONIST')        || '',
  clinician:           Deno.env.get('STRIPE_PRICE_US_YEARLY_CLINICIAN')           || '',
};

const VALID_PLANS = Object.keys(PRICE_MAP_BR_MONTHLY);

Deno.serve(async (req) => {
  try {
    const { plan, success_url, cancel_url, email, region, billing } = await req.json();

    if (!plan || !VALID_PLANS.includes(plan)) {
      console.error(`createCheckout: invalid plan received: "${plan}". Valid plans: ${VALID_PLANS.join(', ')}`);
      return Response.json({ error: `Invalid plan: "${plan}". Available plans: ${VALID_PLANS.join(', ')}` }, { status: 400 });
    }

    // Select price map: region (BR|US) × billing (monthly|yearly)
    const isYearly = billing === 'yearly';
    const isUS     = region === 'US';

    let priceId = '';
    if (isUS && isYearly)       priceId = PRICE_MAP_US_YEARLY[plan];
    else if (isUS && !isYearly) priceId = PRICE_MAP_US_MONTHLY[plan];
    else if (isYearly)          priceId = PRICE_MAP_BR_YEARLY[plan];
    else                        priceId = PRICE_MAP_BR_MONTHLY[plan];

    if (!priceId) {
      console.error(`createCheckout: price ID not configured for plan="${plan}" region="${region}" billing="${billing || 'monthly'}"`);
      return Response.json({ error: 'Price not configured for this option.' }, { status: 500 });
    }
    const origin = req.headers.get('origin') || 'https://useatlascore.com';

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${origin}/Today?subscribed=1`,
      cancel_url: cancel_url || `${origin}/Pricing`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          plan,
        },
      },
      allow_promotion_codes: true,
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`createCheckout: session=${session.id} plan=${plan} region=${region || 'BR'} billing=${billing || 'monthly'} email=${email || 'anon'}`);

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
