/**
 * Auth Webhook - Send Email Hook for Supabase Auth
 *
 * Intercepts ALL auth emails (signup, confirm, reset, magic link) and
 * sends branded versions via Resend instead of Supabase's default mailer.
 *
 * Configure in Supabase Dashboard → Auth → Hooks → Send Email:
 *   URL: https://<project>.supabase.co/functions/v1/auth-webhook
 *   Secret: your SEND_EMAIL_HOOK_SECRET
 *
 * verify_jwt = false (Supabase uses webhook signature, not JWT)
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

// ─── Brand ──────────────────────────────────────────────────────────────────

const BRAND = {
  name: 'atlas.core',
  color: '#00FFFF',
  bg: '#05070A',
  text: 'rgba(255,255,255,0.92)',
  muted: 'rgba(255,255,255,0.55)',
};

function brandedEmail(headline: string, bodyLines: string[], ctaLabel: string, ctaUrl: string, note: string): string {
  const bodyHtml = bodyLines.map(l => `<p style="margin:0 0 12px;color:${BRAND.text};font-size:15px;line-height:1.6;">${l}</p>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};"><tr><td align="center" style="padding:40px 20px;">
<table width="100%" style="max-width:520px;">
  <tr><td style="padding-bottom:32px;">
    <span style="font-size:14px;font-weight:700;letter-spacing:0.08em;color:${BRAND.color};text-transform:uppercase;">${BRAND.name}</span>
  </td></tr>
  <tr><td>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${BRAND.text};">${headline}</h1>
    ${bodyHtml}
    <a href="${ctaUrl}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:${BRAND.color};color:${BRAND.bg};font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.02em;">${ctaLabel}</a>
    <p style="margin:32px 0 0;font-size:12px;color:${BRAND.muted};line-height:1.5;">${note}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

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
    token_new?: string;
    token_hash_new?: string;
  };
}

function getFirstName(metadata: Record<string, unknown> | undefined, email: string): string {
  const fullName = (metadata?.full_name || metadata?.name || '') as string;
  if (fullName) return fullName.split(' ')[0];
  return email.split('@')[0];
}

// ─── Email sender ───────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'atlas.core <noreply@useatlascore.com>';
  if (!resendApiKey) { console.error('RESEND_API_KEY not set'); return false; }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to.trim().toLowerCase()], subject, html }),
    });
    if (!res.ok) console.error('Resend error:', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

// ─── Email types ────────────────────────────────────────────────────────────

function buildConfirmationUrl(siteUrl: string, tokenHash: string, redirectTo: string): string {
  return `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=signup&redirect_to=${encodeURIComponent(redirectTo || APP_URL)}`;
}

function buildResetUrl(siteUrl: string, tokenHash: string, redirectTo: string): string {
  return `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=recovery&redirect_to=${encodeURIComponent(redirectTo || `${APP_URL}/update-password`)}`;
}

function buildMagicLinkUrl(siteUrl: string, tokenHash: string, redirectTo: string): string {
  return `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo || APP_URL)}`;
}

// ─── Handler ────────────────────────────────────────────────────────────────

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
  const emailData = data.email_data;
  const actionType = emailData?.email_action_type || 'signup';
  const siteUrl = emailData?.site_url || SUPABASE_URL;
  const redirectTo = emailData?.redirect_to || APP_URL;
  const tokenHash = emailData?.token_hash || '';

  const results: Record<string, boolean | string[]> = { emailSent: false, errors: [] };

  // ── Route by email action type ──────────────────────────────────────────

  if (actionType === 'signup') {
    // New user signup — create profile, subscription, send welcome

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Create profile
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      role: 'user',
      full_name: (metadata?.full_name || null) as string | null,
      email: email || null,
      language: 'en',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (profileError) (results.errors as string[]).push(`Profile: ${profileError.message}`);

    // Create trial subscription
    const trialEnds = new Date(Date.now() + 7 * 86400000);
    const { error: subError } = await admin.from('subscriptions').insert({
      user_id: userId,
      tier: 'free',
      status: 'trialing',
      trial_starts_at: new Date().toISOString(),
      trial_ends_at: trialEnds.toISOString(),
    });
    if (subError && subError.code !== '23505') (results.errors as string[]).push(`Sub: ${subError.message}`);

    // Send branded confirmation email
    const confirmUrl = buildConfirmationUrl(siteUrl, tokenHash, redirectTo);
    results.emailSent = await sendEmail(email,
      `atlas.core — confirm your account`,
      brandedEmail(
        'Confirm your email',
        [`Your account is ready, ${firstName}.`, 'Confirm your email to activate your workspace and start tracking.'],
        'Confirm email',
        confirmUrl,
        'If you did not create this account, ignore this email.'
      )
    );

  } else if (actionType === 'recovery' || actionType === 'reset_password') {
    const resetUrl = buildResetUrl(siteUrl, tokenHash, redirectTo);
    results.emailSent = await sendEmail(email,
      'atlas.core — reset your password',
      brandedEmail(
        'Reset your password',
        ['Use the link below to set a new password.', 'Do it now. This link expires soon.'],
        'Reset password',
        resetUrl,
        'If you did not request this, ignore this email.'
      )
    );

  } else if (actionType === 'magic_link') {
    const magicUrl = buildMagicLinkUrl(siteUrl, tokenHash, redirectTo);
    results.emailSent = await sendEmail(email,
      'atlas.core — sign in link',
      brandedEmail(
        'Sign in to atlas.core',
        ['Use the link below to sign in. No password needed.'],
        'Sign in',
        magicUrl,
        'This link expires in 10 minutes. If you did not request this, ignore it.'
      )
    );

  } else if (actionType === 'email_change' || actionType === 'email_change_new') {
    const verifyUrl = `${siteUrl}/auth/v1/verify?token=${tokenHash}&type=email_change&redirect_to=${encodeURIComponent(redirectTo)}`;
    results.emailSent = await sendEmail(email,
      'atlas.core — confirm email change',
      brandedEmail(
        'Confirm your new email',
        ['You requested to change your email address.', 'Click below to confirm this change.'],
        'Confirm email change',
        verifyUrl,
        'If you did not request this change, ignore this email and your email will not be changed.'
      )
    );

  } else {
    // Unknown action type — log and return success to not block auth flow
    console.warn(`[auth-webhook] Unknown email_action_type: ${actionType}`);
    results.emailSent = false;
  }

  console.log('auth-webhook:', { userId, actionType, ...results });

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
