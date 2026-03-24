/**
 * on-auth-user-created — Atlas Core Auth Webhook
 *
 * Triggered by Supabase Auth webhooks when a new user signs up.
 * Responsibilities:
 *   1. Create profile row with role + language preference
 *   2. Create 7-day trial subscription
 *   3. Generate branded email confirmation link (bypassing Supabase default emails)
 *   4. Send welcome + confirmation + trial_started emails via Resend
 *
 * Configure in Supabase Dashboard:
 *   Authentication → Hooks → "Send Email" hook → point to this function
 *
 * Secrets required (beyond default Supabase secrets):
 *   APP_URL — e.g. https://atlascore.app
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') || 'https://atlascore.app';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Check if service role key is configured
if (!SERVICE_ROLE_KEY) {
  console.error('on-auth-user-created: SUPABASE_SERVICE_ROLE_KEY not set');
}

const SEND_EMAIL_URL = SERVICE_ROLE_KEY ? `${SUPABASE_URL}/functions/v1/send-email` : '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function detectLanguage(_meta: Record<string, unknown>): 'en' {
  return 'en';
}

function firstNameFrom(fullName: string | undefined, email: string): string {
  if (fullName) {
    const first = fullName.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return email.split('@')[0] || '';
}

async function invokeEmailFunction(payload: Record<string, unknown>): Promise<void> {
  if (!SEND_EMAIL_URL) {
    console.warn('on-auth-user-created: send-email URL not configured, skipping email');
    return;
  }
  
  try {
    const res = await fetch(SEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`on-auth-user-created: send-email [${payload.type}] failed ${res.status}:`, text);
    } else {
      const data = await res.json();
      console.log(`on-auth-user-created: ✓ email [${payload.type}] sent (id=${data.id})`);
    }
  } catch (e) {
    console.warn(`on-auth-user-created: send-email [${payload.type}] exception:`, e);
  }
}

Deno.serve(async (req) => {
  try {
    return await handleRequest(req);
  } catch (error) {
    console.error('on-auth-user-created: unhandled error:', error);
    // Always return 200 to prevent Supabase Auth from blocking signups
    return new Response(JSON.stringify({ 
      success: true, 
      warning: 'Internal error occurred but signup was not blocked',
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Validate webhook authorization - Supabase Auth sends the secret as Bearer token
  const authHeader = req.headers.get('Authorization') || '';
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || SERVICE_ROLE_KEY;
  
  console.log('DEBUG: authHeader starts with Bearer:', authHeader.startsWith('Bearer '));
  console.log('DEBUG: WEBHOOK_SECRET set:', !!Deno.env.get('WEBHOOK_SECRET'));
  console.log('DEBUG: SERVICE_ROLE_KEY set:', !!SERVICE_ROLE_KEY);
  
  const token = authHeader.replace('Bearer ', '');
  console.log('DEBUG: token length:', token.length);
  console.log('DEBUG: secret length:', webhookSecret.length);
  console.log('DEBUG: token matches secret:', token === webhookSecret);
  
  if (!authHeader.startsWith('Bearer ') || token !== webhookSecret) {
    return new Response(JSON.stringify({ error: 'Hook requires authorization token' }), {
      status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const record = (body.record ?? (body.data as Record<string, unknown>)?.user ?? {}) as Record<string, unknown>;
  const userId = record.id as string | undefined;
  const email = record.email as string | undefined;

  if (!userId || !email) {
    return new Response(JSON.stringify({ error: 'No user data provided' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const meta = (record.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = (meta.full_name || meta.name || '') as string;
  const firstName = firstNameFrom(fullName, email);
  const language = detectLanguage(meta);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1. Upsert profile with language
  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    role: 'user',
    full_name: fullName || null,
    language,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileError) {
    console.error('on-auth-user-created: profile upsert error:', profileError);
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
    console.warn('on-auth-user-created: subscription insert warning:', subError);
  }

  // 3. Generate email confirmation link (so Supabase does NOT send its plain email)
  let confirmUrl: string | undefined;
  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: `${APP_URL}/auth/callback` },
    });

    if (linkError) {
      console.warn('on-auth-user-created: generateLink warning:', linkError.message);
    } else {
      confirmUrl = linkData?.properties?.action_link;
    }
  } catch (e) {
    console.warn('on-auth-user-created: generateLink exception:', e);
  }

  // 4. Send emails (fire-and-forget)
  const base = { to: email, language, userId, payload: { firstName, appUrl: APP_URL } };

  await invokeEmailFunction({ ...base, type: 'welcome' });

  if (confirmUrl) {
    await invokeEmailFunction({
      ...base,
      type: 'confirm_email',
      payload: { firstName, confirmUrl, appUrl: APP_URL },
    });
  }

  await invokeEmailFunction({
    ...base,
    type: 'trial_started',
    payload: { firstName, trialDaysLeft: 7, appUrl: APP_URL },
  });

  return new Response(JSON.stringify({
    success: true,
    userId,
    language,
    trialEndsAt: trialEndsAt.toISOString(),
    emailsSent: ['welcome', ...(confirmUrl ? ['confirm_email'] : []), 'trial_started'],
  }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
