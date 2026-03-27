/**
 * Auth Webhook - Send Email Hook for Supabase Auth
 *
 * Uses standardwebhooks to verify signature from Supabase Auth
 * verify_jwt = false (set in config.toml) - Supabase uses webhook secret, not JWT
 *
 * Flow: Supabase Auth -> this function -> creates profile/subscription + sends welcome email
 *
 * NOTE: Email sending is inlined (not imported from _shared/) to avoid
 * the Supabase Edge Runtime BOOT_ERROR caused by the logger+templates
 * module chain.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://useatlascore.com';
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
const HOOK_SECRET = rawHookSecret.replace(/^v1,whsec_/, '');

interface AuthWebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data?: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

function getFirstName(metadata: Record<string, unknown> | undefined, email: string): string {
  const fullName = (metadata?.full_name || metadata?.name || '') as string;
  if (fullName) return fullName.split(' ')[0];
  return email.split('@')[0];
}

async function sendSimpleEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';
  if (!resendApiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to.trim().toLowerCase()], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
  return sendSimpleEmail(
    to,
    `Welcome to Atlas Core, ${firstName}!`,
    `<p>Hi ${firstName},</p><p>Welcome to <strong>Atlas Core</strong>! Your account is ready.</p><p>Start tracking your nutrition, workouts, and progress today.</p><p><a href="${APP_URL}" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Open Atlas Core</a></p><p>– The Atlas Core team</p>`
  );
}

async function sendTrialStartedEmail(to: string, firstName: string, trialDays: number): Promise<boolean> {
  return sendSimpleEmail(
    to,
    'Your 7-day free trial has started',
    `<p>Hi ${firstName},</p><p>Your <strong>${trialDays}-day free trial</strong> of Atlas Core has started. You have full access to all features.</p><p>After your trial, choose a plan to continue.</p><p><a href="${APP_URL}/subscription" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View plans</a></p><p>– The Atlas Core team</p>`
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!HOOK_SECRET) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  const wh = new Webhook(HOOK_SECRET);

  let data: AuthWebhookPayload;
  try {
    data = wh.verify(payload, headers) as AuthWebhookPayload;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!data.user?.id || !data.user?.email) {
    return new Response(JSON.stringify({ error: 'Missing user id or email' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { id: userId, email, user_metadata: metadata } = data.user;
  const firstName = getFirstName(metadata, email);

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
      email: email || null,
      language: 'en',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      results.errors.push(`Profile: ${profileError.message}`);
    } else {
      results.profileCreated = true;
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
    }

    // 3. Send welcome email
    results.welcomeSent = await sendWelcomeEmail(email, firstName);
    if (!results.welcomeSent) results.errors.push('Welcome email failed');

    // 4. Send trial started email
    results.trialSent = await sendTrialStartedEmail(email, firstName, 7);
    if (!results.trialSent) results.errors.push('Trial email failed');

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    results.errors.push(`Unexpected: ${msg}`);
    console.error('Webhook processing error:', error);
  }

  console.log('auth-webhook: complete', { userId, ...results });

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
