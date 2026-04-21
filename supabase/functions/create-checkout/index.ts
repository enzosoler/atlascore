// supabase/functions/create-checkout/index.ts
// Stripe Checkout Flow - Rebuilt with proper JWT validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// ── TIPOS ─────────────────────────────────────────────────────────
interface CheckoutRequest {
  plan: string;
  user_id: string;
  email: string;
  region?: string;
  billing?: 'monthly' | 'yearly';
  success_url?: string;
  cancel_url?: string;
}

interface CheckoutResponse {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

// ── CORS ──────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── MAPA DE PREÇOS ────────────────────────────────────────────────
const PRICE_MAP: Record<string, Record<string, string>> = {
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
};

// ── UTILS ─────────────────────────────────────────────────────────
function log(stage: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? JSON.stringify(data) : '';
  console.log(`[${timestamp}] [create-checkout] [${stage}] ${message} ${dataStr}`);
}

function errorResponse(error: string, status: number): Response {
  log('ERROR', `Returning ${status}`, { error });
  return new Response(
    JSON.stringify({ success: false, error } as CheckoutResponse),
    { 
      status, 
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
    }
  );
}

function successResponse(data: Omit<CheckoutResponse, 'success' | 'error'>): Response {
  log('SUCCESS', 'Checkout session created', data);
  return new Response(
    JSON.stringify({ success: true, ...data } as CheckoutResponse),
    { 
      status: 200, 
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
    }
  );
}

// ── MAIN HANDLER ──────────────────────────────────────────────────
serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  log('START', `Request ${requestId}`, { method: req.method });

  // ── 1. CORS PREFLIGHT ─────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // ── 2. VALIDAR JWT E OBTER USUÁRIO ────────────────────────────
  log('AUTH', 'Extracting JWT from Authorization header');
  
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    log('AUTH', 'No Authorization header present');
    return errorResponse('Missing Authorization header', 401);
  }

  if (!authHeader.startsWith('Bearer ')) {
    log('AUTH', 'Invalid Authorization format', { header: authHeader.substring(0, 30) });
    return errorResponse('Invalid Authorization format. Expected: Bearer <token>', 401);
  }

  const jwt = authHeader.replace('Bearer ', '').trim();
  
  if (!jwt || jwt.length < 50) {
    log('AUTH', 'JWT too short or empty', { length: jwt?.length });
    return errorResponse('Invalid or empty JWT token', 401);
  }

  log('AUTH', 'JWT extracted', { length: jwt.length, prefix: jwt.substring(0, 20) });

  // ── 3. VALIDAR JWT COM SUPABASE ───────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    log('CONFIG', 'Missing Supabase env vars');
    return errorResponse('Server configuration error: Missing Supabase env vars', 500);
  }

  // Criar cliente com service role para bypass RLS
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  // Validar JWT e obter usuário
  let userId: string;
  let userEmail: string;
  
  try {
    log('AUTH', 'Validating JWT with Supabase...');
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (authError) {
      log('AUTH', 'JWT validation error from getUser', { error: authError?.message, code: authError?.status });
      return errorResponse('Invalid or expired session. Please log in again.', 401);
    } else if (!user) {
      log('AUTH', 'JWT validation returned no user');
      return errorResponse('Invalid or expired session. Please log in again.', 401);
    } else {
      userId = user.id;
      userEmail = user.email || '';
      log('AUTH', 'JWT validated successfully', { userId, email: userEmail });
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    log('AUTH', 'Exception during JWT validation', { error: errorMsg });
    return errorResponse('Authentication validation failed', 500);
  }

  // ── 4. PARSE BODY ─────────────────────────────────────────────
  let body: CheckoutRequest;
  
  try {
    body = await req.json();
    log('BODY', 'Parsed request body', { 
      plan: body.plan, 
      region: body.region, 
      billing: body.billing,
      userIdFromBody: body.user_id 
    });
  } catch (e: unknown) {
    log('BODY', 'Failed to parse JSON body');
    return errorResponse('Invalid JSON body', 400);
  }

  // ── 5. VALIDAR CAMPOS ─────────────────────────────────────────
  if (!body.plan) {
    return errorResponse('Missing required field: plan', 400);
  }

  // Validar que user_id do body corresponde ao JWT (segurança)
  if (body.user_id && body.user_id !== userId) {
    log('SECURITY', 'User ID mismatch', { 
      fromBody: body.user_id, 
      fromJWT: userId 
    });
    return errorResponse('User ID mismatch. Cannot subscribe for another user.', 403);
  }

  // ── 6. VERIFICAR CONFIG STRIPE ────────────────────────────────
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeSecretKey) {
    log('CONFIG', 'Missing STRIPE_SECRET_KEY');
    return errorResponse('Server configuration error: Stripe not configured', 500);
  }

  const stripe = new Stripe(stripeSecretKey, { 
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  // ── 7. RESOLVER PRICE ID ────────────────────────────────────────
  const region = (body.region || 'US').toLowerCase() === 'us' ? 'us' : 'br';
  const billing = body.billing === 'yearly' ? 'yearly' : 'monthly';
  const priceKey = `${region}_${billing}`;
  const priceId = PRICE_MAP[priceKey]?.[body.plan];

  log('PRICE', 'Resolved price', { 
    region, 
    billing, 
    priceKey, 
    plan: body.plan,
    priceId: priceId ? `${priceId.substring(0, 15)}...` : 'NOT FOUND'
  });

  if (!priceId) {
    return errorResponse(
      `Price not configured for plan: ${body.plan}, region: ${region}, billing: ${billing}`,
      500
    );
  }

  // ── 8. CRIAR OU RECUPERAR CUSTOMER ────────────────────────────
  let customerId: string;
  
  try {
    log('STRIPE', 'Looking up existing customer...');
    
    // Buscar customer existente na DB
    const { data: existingSub, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      log('DB', 'Error querying subscriptions', { error: subError.message });
    }

    customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Buscar no Stripe por email
      const customers = await stripe.customers.list({ 
        email: userEmail, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        log('STRIPE', 'Found existing customer in Stripe', { customerId });
      } else {
        // Criar novo customer
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { 
            user_id: userId, 
            app: 'atlas-core',
            source: 'checkout_flow'
          },
        });
        customerId = customer.id;
        log('STRIPE', 'Created new customer', { customerId });
      }
    } else {
      log('STRIPE', 'Found existing customer in DB', { customerId });
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    log('STRIPE', 'Error with customer lookup/creation', { error: errorMsg });
    return errorResponse(`Stripe customer error: ${errorMsg}`, 500);
  }

  // ── 9. CRIAR CHECKOUT SESSION ─────────────────────────────────
  let checkoutSession: Stripe.Checkout.Session;
  
  try {
    log('STRIPE', 'Creating checkout session...');
    
    const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
    const origin = req.headers.get('origin') || appUrl;

    checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: body.success_url || `${origin}/webapp/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancel_url || `${origin}/webapp/billing/paywall`,
      metadata: {
        user_id: userId,
        plan: body.plan,
        email: userEmail,
        request_id: requestId,
      },
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId,
          plan: body.plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    log('STRIPE', 'Checkout session created', { 
      sessionId: checkoutSession.id,
      url: checkoutSession.url?.substring(0, 50) + '...'
    });
    
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    log('STRIPE', 'Error creating checkout session', { error: errorMsg });
    return errorResponse(`Stripe checkout error: ${errorMsg}`, 500);
  }

  // ── 10. RETORNAR SUCESSO ──────────────────────────────────────
  return successResponse({
    url: checkoutSession.url!,
    sessionId: checkoutSession.id,
  });
});
