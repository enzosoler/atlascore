/**
 * Auth Webhook - Send Email Hook for Supabase Auth
 * 
 * Uses standardwebhooks to verify signature from Supabase Auth
 * verify_jwt = false (set in config.toml) - Supabase uses webhook secret, not JWT
 * 
 * Flow: Supabase Auth -> this function -> sends welcome/trial emails
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendWelcome, sendTrialStarted } from '../_shared/email-service.ts';
import { logWebhook } from '../_shared/logger.ts';

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://atlascore.app';

// Get hook secret and remove v1,whsec_ prefix if present
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
const HOOK_SECRET = rawHookSecret.replace(/^v1,whsec_/, '');

// Types for Supabase Auth webhook payload
interface AuthWebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
    confirmation_sent_at?: string;
  };
  email_data?: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
    old_email?: string;
    old_phone?: string;
    provider?: string;
    factor_type?: string;
  };
}

// Extract first name from metadata
function getFirstName(metadata: Record<string, unknown> | undefined, email: string): string {
  const fullName = (metadata?.full_name || metadata?.name || '') as string;
  if (fullName) {
    return fullName.split(' ')[0];
  }
  return email.split('@')[0];
}

// Main handler
serve(async (req) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  logWebhook('request_start', { requestId, url: req.url });

  // Verify webhook signature using standardwebhooks
  if (!HOOK_SECRET) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured');
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Get raw payload for verification
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  const wh = new Webhook(HOOK_SECRET);

  let data: AuthWebhookPayload;
  try {
    data = wh.verify(payload, headers) as AuthWebhookPayload;
    logWebhook('signature_verified', { requestId, userId: data.user?.id });
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    logWebhook('signature_failed', { requestId, error: err?.message || String(err) });
    return new Response(
      JSON.stringify({ error: 'Invalid webhook signature' }),
      { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Validate required fields
  if (!data.user?.id || !data.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Missing user id or email' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const userId = data.user.id;
  const email = data.user.email;
  const metadata = data.user.user_metadata;
  const firstName = getFirstName(metadata, email);

  logWebhook('payload_valid', { requestId, userId, email: email.substring(0, 3) + '...' });

  // Initialize Supabase admin client
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const results = {
    profileCreated: false,
    subscriptionCreated: false,
    welcomeSent: false,
    trialSent: false,
    errors: [] as string[],
  };

  try {
    // 1. Create or update profile (includes email for admin panel visibility)
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      role: 'user',
      full_name: (metadata?.full_name || null) as string | null,
      email: email || null,
      language: 'en',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      results.errors.push(`Profile: ${profileError.message}`);
    } else {
      results.profileCreated = true;
      logWebhook('profile_created', { requestId, userId });
    }

    // 2. Create trial subscription
    const trialStartsAt = new Date();
    const trialEndsAt = new Date(trialStartsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error: subError } = await admin.from('subscriptions').insert({
      user_id: userId,
      tier: 'free',
      status: 'trialing',
      trial_starts_at: trialStartsAt.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
    });

    if (subError && subError.code !== '23505') {
      console.error('Subscription creation failed:', subError);
      results.errors.push(`Subscription: ${subError.message}`);
    } else {
      results.subscriptionCreated = true;
      logWebhook('subscription_created', { requestId, userId, trialEndsAt });
    }

    // 3. Send welcome email
    const welcomeResult = await sendWelcome(email, firstName, userId, 'en');
    if (welcomeResult.success) {
      results.welcomeSent = true;
      logWebhook('welcome_sent', { requestId, userId, resendId: welcomeResult.id });
    } else {
      results.errors.push(`Welcome email: ${welcomeResult.error}`);
      logWebhook('welcome_failed', { requestId, userId, error: welcomeResult.error });
    }

    // 4. Send trial started email
    const trialResult = await sendTrialStarted(email, firstName, 7, userId, 'en');
    if (trialResult.success) {
      results.trialSent = true;
      logWebhook('trial_sent', { requestId, userId, resendId: trialResult.id });
    } else {
      results.errors.push(`Trial email: ${trialResult.error}`);
      logWebhook('trial_failed', { requestId, userId, error: trialResult.error });
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.errors.push(`Unexpected: ${errorMsg}`);
    console.error('Webhook processing error:', error);
  }

  const duration = Date.now() - startTime;

  logWebhook('request_complete', {
    requestId,
    duration,
    ...results,
  });

  // Always return 200 to Supabase Auth
  return new Response(
    JSON.stringify({
      success: true,
      requestId,
      duration,
      results,
    }),
    { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
  );
});

