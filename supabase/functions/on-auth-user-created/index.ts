/**
 * on-auth-user-created — deprecated compatibility shim
 *
 * Launch note:
 * - `auth-webhook` is the canonical auth-email + trial-provisioning path.
 * - This function remains deployed only so an older Supabase/Auth webhook
 *   configuration does not hard-fail signups during rollout.
 * - It performs idempotent profile/subscription provisioning only.
 * - It deliberately does NOT send emails anymore, which avoids duplicate
 *   welcome/confirm/trial messages when both hooks are active.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, buildPreflightResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

function detectLanguage(_meta: Record<string, unknown>): 'en' {
  return 'en';
}

function getRecord(body: Record<string, unknown>) {
  return (body.record ?? (body.data as Record<string, unknown>)?.user ?? {}) as Record<string, unknown>;
}

function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get('Authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
  const xWebhookSecret = req.headers.get('x-webhook-secret') || '';
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || SERVICE_ROLE_KEY;
  return Boolean(webhookSecret) && (bearerToken === webhookSecret || xWebhookSecret === webhookSecret);
}

Deno.serve(async (req) => {
  const CORS = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const eventType = body.type as string | undefined;
  const record = getRecord(body);
  const userId = record.id as string | undefined;
  const email = record.email as string | undefined;

  if (!eventType || !userId || !email) {
    return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const meta = (record.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = (meta.full_name || meta.name || '') as string;
  const language = detectLanguage(meta);
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    role: 'user',
    full_name: fullName || null,
    email: email || null,
    language,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileError) {
    console.error('on-auth-user-created compat: profile upsert error:', profileError);
  }

  const trialStartsAt = new Date();
  const trialEndsAt = new Date(trialStartsAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { error: subscriptionError } = await admin.from('subscriptions').insert({
    user_id: userId,
    tier: 'free',
    status: 'trialing',
    trial_starts_at: trialStartsAt.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
  });

  if (subscriptionError && subscriptionError.code !== '23505') {
    console.warn('on-auth-user-created compat: subscription insert warning:', subscriptionError);
  }

  console.warn('on-auth-user-created compat path executed; auth-webhook should own auth emails going forward', {
    eventType,
    userId,
  });

  return new Response(JSON.stringify({
    success: true,
    mode: 'compatibility_shim',
    userId,
    email,
    emailsSent: [],
  }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
