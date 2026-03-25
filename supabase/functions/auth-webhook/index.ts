/**
 * Auth Webhook - Server-to-server endpoint for Supabase Auth events
 * 
 * Flow: Supabase Auth (user.created) -> this function -> sends emails
 * 
 * Authentication: X-Webhook-Secret header (NOT Authorization Bearer)
 * Reason: Supabase Auth webhook does not send Authorization Bearer
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendWelcome, sendTrialStarted } from '../_shared/email-service.ts';
import { logWebhook } from '../_shared/logger.ts';

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://atlascore.app';

// Types
interface WebhookPayload {
  type: string;
  record?: {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    confirmation_sent_at?: string;
  };
}

// Validate webhook secret from custom header
function validateWebhookSecret(req: Request): boolean {
  // Supabase Auth doesn't send Authorization Bearer
  // Instead, we use a custom header X-Webhook-Secret
  const secretHeader = req.headers.get('X-Webhook-Secret') || '';
  
  logWebhook('validate_secret', {
    hasHeader: !!secretHeader,
    hasEnvSecret: !!WEBHOOK_SECRET,
    headerLength: secretHeader.length,
    secretLength: WEBHOOK_SECRET.length,
  });
  
  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET not configured');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (secretHeader.length !== WEBHOOK_SECRET.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < secretHeader.length; i++) {
    result |= secretHeader.charCodeAt(i) ^ WEBHOOK_SECRET.charCodeAt(i);
  }
  
  return result === 0;
}

// Validate payload shape
function validatePayload(body: unknown): { valid: boolean; error?: string; data?: WebhookPayload } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid payload: not an object' };
  }
  
  const payload = body as WebhookPayload;
  
  if (!payload.type) {
    return { valid: false, error: 'Invalid payload: missing type' };
  }
  
  // We only handle user.created (signup) for now
  const validTypes = ['user.created', 'signup'];
  if (!validTypes.includes(payload.type)) {
    return { valid: false, error: `Unsupported event type: ${payload.type}` };
  }
  
  if (!payload.record?.id || !payload.record?.email) {
    return { valid: false, error: 'Invalid payload: missing user id or email' };
  }
  
  return { valid: true, data: payload };
}

// Extract first name from metadata
function getFirstName(metadata: Record<string, unknown> | undefined, email: string): string {
  const fullName = (metadata?.full_name || metadata?.name || '') as string;
  if (fullName) {
    return fullName.split(' ')[0];
  }
  // Fallback: use part before @ in email
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
  
  // Validate webhook secret
  if (!validateWebhookSecret(req)) {
    logWebhook('auth_failed', { requestId });
    return new Response(
      JSON.stringify({ error: 'Invalid webhook secret' }),
      { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  // Validate payload
  const validation = validatePayload(body);
  if (!validation.valid || !validation.data) {
    logWebhook('validation_failed', { requestId, error: validation.error });
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
  
  const payload = validation.data;
  const userId = payload.record!.id!;
  const email = payload.record!.email!;
  const metadata = payload.record!.user_metadata;
  const firstName = getFirstName(metadata, email);
  
  logWebhook('payload_valid', { requestId, userId, email: email.substring(0, 3) + '...', type: payload.type });
  
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
    // 1. Create or update profile
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      role: 'user',
      full_name: (metadata?.full_name || null) as string | null,
      language: 'en', // Default, can be updated later
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
    
    if (subError && subError.code !== '23505') { // Ignore duplicate
      console.error('Subscription creation failed:', subError);
      results.errors.push(`Subscription: ${subError.message}`);
    } else {
      results.subscriptionCreated = true;
      logWebhook('subscription_created', { requestId, userId, trialEndsAt });
    }
    
    // 3. Send welcome email (fire-and-forget, don't block on failure)
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
  
  // Always return 200 to Supabase Auth, even if emails fail
  // We don't want to block user signup because of email issues
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
