/**
 * create-customer-portal - Stripe Customer Portal Session
 *
 * Deploy:
 *   supabase functions deploy create-customer-portal
 *
 * Secrets required:
 *   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
 *   supabase secrets set APP_URL=https://useatlascore.com
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';


function isTruthy(value: string | undefined | null): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase());
}

function resolveStripeSecretKey() {
  const defaultSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  const configuredTestMode = isTruthy(Deno.env.get('STRIPE_TEST_MODE'));
  const testMode = configuredTestMode || defaultSecretKey.startsWith('sk_test_');
  if (configuredTestMode && !Deno.env.get('STRIPE_TEST_SECRET_KEY')) {
    throw new Error('STRIPE_TEST_MODE is enabled but STRIPE_TEST_SECRET_KEY is missing.');
  }
  return testMode
    ? (Deno.env.get('STRIPE_TEST_SECRET_KEY') || defaultSecretKey)
    : defaultSecretKey;
}

interface PortalRequest {
  user_id: string;
  email: string;
  return_url?: string;
}

function buildAllowedOrigins(appUrl: string): string[] {
  const configured = (Deno.env.get('ALLOWED_REDIRECT_ORIGINS') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const defaults = [
    appUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:4174',
    'http://127.0.0.1:4174',
    'http://localhost:4175',
    'http://127.0.0.1:4175',
  ];

  return Array.from(new Set(
    [...configured, ...defaults]
      .map((value) => {
        try {
          return new URL(value).origin;
        } catch {
          return null;
        }
      })
      .filter((value): value is string => Boolean(value))
  ));
}

function resolveAllowedAppOrigin(appUrl: string, candidateUrl?: string): string {
  const allowedOrigins = buildAllowedOrigins(appUrl);

  if (!candidateUrl) {
    return new URL(appUrl).origin;
  }

  try {
    const candidateOrigin = new URL(candidateUrl).origin;
    if (allowedOrigins.includes(candidateOrigin)) {
      return candidateOrigin;
    }
  } catch {
    // Fall back to the canonical app URL when the client sends an invalid URL.
  }

  return new URL(appUrl).origin;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate JWT and extract authenticated user
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const jwt = authHeader.slice(7);
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !authUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let stripeSecretKey = '';
  try {
    stripeSecretKey = resolveStripeSecretKey();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe configuration error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

  let body: PortalRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { return_url } = body;
  // Always use the authenticated user's identity — ignore any user_id/email in body
  const user_id = authUser.id;
  const email = authUser.email || '';

  if (!email) {
    return new Response(JSON.stringify({ error: 'Authenticated user has no email' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const redirectOrigin = resolveAllowedAppOrigin(appUrl, return_url);

  try {
    // supabaseAdmin was already created above for JWT validation — reuse it

    // Find existing Stripe customer
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Search for existing customer in Stripe by email
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        
        // Save customer ID to subscription record for future use
        await supabaseAdmin
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user_id);
      } else {
        // Create new customer if none exists
        const customer = await stripe.customers.create({
          email,
          metadata: { user_id, app: 'atlas-core' },
        });
        customerId = customer.id;
        
        // Save customer ID
        await supabaseAdmin
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', user_id);
      }
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${redirectOrigin}/webapp/billing`,
    });

    console.log(`create-customer-portal: session=${session.id} user=${user_id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-customer-portal error:', error);
    const message = error instanceof Error ? error.message : 'Portal creation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
