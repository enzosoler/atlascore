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
import { renderEmail } from '../_shared/templates.ts';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://useatlascore.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'atlas.core <noreply@useatlascore.com>';


function sanitizeLogValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  return value
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/\b(re_[A-Za-z0-9_-]+|sk_(?:live|test)_[A-Za-z0-9_-]+|sb_[A-Za-z0-9._-]+|eyJ[A-Za-z0-9._-]+)\b/g, '[redacted-token]');
}

function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  return req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    null;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { email?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { email, language = 'en' } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: rateLimitRows, error: rateLimitError } = await admin.rpc(
    'consume_password_reset_rate_limit',
    {
      p_email: normalizedEmail,
      p_ip: getClientIp(req),
    },
  );

  if (rateLimitError) {
    console.error('send-password-reset: rate limit check failed:', sanitizeLogValue(rateLimitError.message));
    return new Response(JSON.stringify({ error: 'Password reset temporarily unavailable' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rateLimit = Array.isArray(rateLimitRows) ? rateLimitRows[0] : rateLimitRows;
  if (rateLimit?.allowed === false) {
    const retryAfter = String(rateLimit.retry_after_seconds ?? 3600);
    return new Response(JSON.stringify({ error: 'Too many password reset requests. Try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': retryAfter },
    });
  }

  // 1. Look up the user to get their name and preferred language
  const { data: userData } = await admin.auth.admin.listUsers();
  const user = userData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

  const lang = language?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';

  const firstName = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(' ')[0]
    : normalizedEmail.split('@')[0];

  // 2. Generate the password recovery link
  let resetUrl: string;
  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: { redirectTo: `${APP_URL}/auth/callback?mode=reset` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('send-password-reset: generateLink error:', linkError?.message);
      // Don't reveal whether the user exists or not (security)
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    resetUrl = linkData.properties.action_link;
  } catch (e) {
    console.error('send-password-reset: generateLink exception:', e);
    // Silent success to prevent email enumeration
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!RESEND_API_KEY) {
    console.error('send-password-reset: RESEND_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'Email delivery not configured' }), {
      status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rendered = renderEmail('reset_password', lang, {
    first_name: firstName,
    reset_password_url: resetUrl,
    confirm_email_url: '',
    trial_end_date: '',
    trial_days_left: '',
    retry_date: '',
    access_end_date: '',
    report_date_range: '',
    weekly_report_url: APP_URL,
  });

  // 3. Send directly via Resend so password reset does not depend on cross-function auth.
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [normalizedEmail],
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('send-password-reset: resend failed:', {
        status: res.status,
        body: sanitizeLogValue(text),
        email: normalizedEmail,
      });
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    console.log('send-password-reset: resend accepted', {
      email: normalizedEmail,
      resendId: data?.id ?? null,
    });
  } catch (e) {
    console.error('send-password-reset: resend exception:', e);
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`send-password-reset: ✓ reset email sent to ${normalizedEmail}`);
  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
