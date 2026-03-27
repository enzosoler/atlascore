/**
 * send-password-reset — Atlas Core Password Reset Email
 *
 * Generates a Supabase password reset link and sends it via Resend
 * (bypassing Supabase's default recovery email completely).
 *
 * Called from the frontend instead of supabase.auth.resetPasswordForEmail().
 *
 * Deploy:  supabase functions deploy send-password-reset
 *
 * No additional secrets beyond RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, APP_URL.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_URL = Deno.env.get('APP_URL') || 'https://useatlascore.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: { email?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { email, language = 'en' } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1. Look up the user to get their name and preferred language
  const { data: userData } = await admin.auth.admin.listUsers();
  const user = userData?.users?.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

  const lang = 'en';

  const firstName = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(' ')[0]
    : email.split('@')[0];

  // 2. Generate the password recovery link
  let resetUrl: string;
  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: { redirectTo: `${APP_URL}/auth/callback?mode=reset` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('send-password-reset: generateLink error:', linkError?.message);
      // Don't reveal whether the user exists or not (security)
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    resetUrl = linkData.properties.action_link;
  } catch (e) {
    console.error('send-password-reset: generateLink exception:', e);
    // Silent success to prevent email enumeration
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // 3. Send the email via send-email function
  try {
    const res = await fetch(SEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        type: 'reset_password',
        to: email.trim().toLowerCase(),
        language: lang,
        userId: user?.id,
        payload: { firstName, resetUrl, appUrl: APP_URL },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('send-password-reset: send-email failed:', res.status, text);
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  } catch (e) {
    console.error('send-password-reset: send-email exception:', e);
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  console.log(`send-password-reset: ✓ reset email sent to ${email}`);
  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
