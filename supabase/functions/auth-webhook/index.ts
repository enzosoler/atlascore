/**
 * Auth Webhook - Send Email Hook for Supabase Auth
 *
 * Intercepts auth emails and renders them through the shared transactional
 * email system instead of vendor-default output.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderBrandedEmail, renderEmail } from '../_shared/templates.ts';
import { getCorsHeaders, buildPreflightResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://useatlascore.com';
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
const HOOK_SECRET = rawHookSecret.replace(/^v1,whsec_/, '');

type Locale = 'pt-BR' | 'en';

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

function resolveLocale(metadata: Record<string, unknown> | undefined): Locale {
  const raw = String(metadata?.language ?? metadata?.locale ?? 'en').toLowerCase();
  return raw.startsWith('pt') ? 'pt-BR' : 'en';
}

function getFirstName(metadata: Record<string, unknown> | undefined, email: string): string {
  const fullName = (metadata?.full_name || metadata?.name || '') as string;
  if (fullName) return fullName.split(' ')[0];
  return email.split('@')[0];
}

function normalizeSupabaseAuthBaseUrl(rawUrl: string): string {
  const fallback = SUPABASE_URL || 'https://xrtqwdpczgdomqebmfkk.supabase.co';
  const candidate = rawUrl || fallback;
  try {
    const parsed = new URL(candidate);
    if (parsed.pathname.includes('/auth/v1')) {
      console.warn('[auth-webhook] site_url included /auth/v1; normalizing to origin', {
        receivedPath: parsed.pathname,
      });
    }
    return parsed.origin;
  } catch {
    const parsedFallback = new URL(fallback);
    return parsedFallback.origin;
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'atlas.core <noreply@useatlascore.com>';
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not set');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to.trim().toLowerCase()],
        subject,
        html,
      }),
    });

    if (!res.ok) console.error('Resend error:', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

function buildConfirmationUrl(siteUrl: string, tokenHash: string, redirectTo: string): string {
  const authBaseUrl = normalizeSupabaseAuthBaseUrl(siteUrl);
  return `${authBaseUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=email&redirect_to=${encodeURIComponent(redirectTo || APP_URL)}`;
}

function buildResetUrl(siteUrl: string, tokenHash: string, redirectTo: string): string {
  const authBaseUrl = normalizeSupabaseAuthBaseUrl(siteUrl);
  return `${authBaseUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=recovery&redirect_to=${encodeURIComponent(redirectTo || `${APP_URL}/auth/reset`)}`;
}

function buildMagicLinkUrl(siteUrl: string, tokenHash: string, redirectTo: string): string {
  const authBaseUrl = normalizeSupabaseAuthBaseUrl(siteUrl);
  return `${authBaseUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo || APP_URL)}`;
}

function renderAuthEmail(
  type: 'confirm_email' | 'reset_password',
  locale: Locale,
  variables: Record<string, string>,
) {
  return renderEmail(type, locale, variables);
}

function renderMagicLinkEmail(locale: Locale, magicUrl: string) {
  return renderBrandedEmail({
    locale,
    subject: locale === 'pt-BR' ? 'atlas.core — link de acesso' : 'atlas.core — sign in link',
    preheader:
      locale === 'pt-BR'
        ? 'Use este link para entrar.'
        : 'Use this link to sign in.',
    headline:
      locale === 'pt-BR'
        ? 'Entrar no atlas.core'
        : 'Sign in to atlas.core',
    body:
      locale === 'pt-BR'
        ? [
            'Use o botão abaixo para entrar sem senha.',
            'Esse link expira em breve.',
          ]
        : [
            'Use the button below to sign in without a password.',
            'This link expires soon.',
          ],
    ctaLabel: locale === 'pt-BR' ? 'Entrar' : 'Sign in',
    ctaUrl: magicUrl,
    note:
      locale === 'pt-BR'
        ? 'Se você não solicitou esse link, ignore este e-mail.'
        : 'If you did not request this link, ignore this email.',
  });
}

function renderEmailChangeEmail(locale: Locale, verifyUrl: string) {
  return renderBrandedEmail({
    locale,
    subject:
      locale === 'pt-BR'
        ? 'atlas.core — confirme a troca de e-mail'
        : 'atlas.core — confirm email change',
    preheader:
      locale === 'pt-BR'
        ? 'Confirme seu novo e-mail.'
        : 'Confirm your new email address.',
    headline:
      locale === 'pt-BR'
        ? 'Confirme seu novo e-mail'
        : 'Confirm your new email',
    body:
      locale === 'pt-BR'
        ? [
            'Recebemos um pedido para trocar o e-mail da sua conta.',
            'Confirme abaixo para concluir a alteração.',
          ]
        : [
            'We received a request to change the email address on your account.',
            'Confirm below to complete that change.',
          ],
    ctaLabel:
      locale === 'pt-BR'
        ? 'Confirmar e-mail'
        : 'Confirm email',
    ctaUrl: verifyUrl,
    note:
      locale === 'pt-BR'
        ? 'Se você não pediu essa troca, ignore este e-mail e nada será alterado.'
        : 'If you did not request this change, ignore this email and nothing will be updated.',
  });
}

serve(async (req) => {
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

  if (!HOOK_SECRET) {
    console.error('SEND_EMAIL_HOOK_SECRET not configured');
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
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
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!data.user?.id || !data.user?.email) {
    return new Response(JSON.stringify({ error: 'Missing user id or email' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { id: userId, email, user_metadata: metadata } = data.user;
  const locale = resolveLocale(metadata);
  const firstName = getFirstName(metadata, email);
  const emailData = data.email_data;
  const actionType = emailData?.email_action_type || 'signup';
  const siteUrl = normalizeSupabaseAuthBaseUrl(emailData?.site_url || SUPABASE_URL);
  const redirectTo = emailData?.redirect_to || APP_URL;
  const tokenHash = emailData?.token_hash || '';
  const commonVariables = {
    first_name: firstName,
    email_address: email,
  };

  const results: Record<string, boolean | string[]> = { emailSent: false, errors: [] };

  if (actionType === 'signup') {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      role: 'user',
      full_name: (metadata?.full_name || null) as string | null,
      email: email || null,
      language: locale,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (profileError) (results.errors as string[]).push(`Profile: ${profileError.message}`);

    const trialEnds = new Date(Date.now() + 7 * 86400000);
    const { error: subError } = await admin.from('subscriptions').insert({
      user_id: userId,
      tier: 'free',
      status: 'trialing',
      trial_starts_at: new Date().toISOString(),
      trial_ends_at: trialEnds.toISOString(),
    });
    if (subError && subError.code !== '23505') (results.errors as string[]).push(`Sub: ${subError.message}`);

    const confirmUrl = buildConfirmationUrl(siteUrl, tokenHash, redirectTo);
    const rendered = renderAuthEmail('confirm_email', locale, {
      ...commonVariables,
      confirm_email_url: confirmUrl,
    });

    results.emailSent = await sendEmail(email, rendered.subject, rendered.html);
  } else if (actionType === 'recovery' || actionType === 'reset_password') {
    const resetUrl = buildResetUrl(siteUrl, tokenHash, redirectTo);
    const rendered = renderAuthEmail('reset_password', locale, {
      ...commonVariables,
      reset_password_url: resetUrl,
    });

    results.emailSent = await sendEmail(email, rendered.subject, rendered.html);
  } else if (actionType === 'magic_link' || actionType === 'magiclink') {
    const magicUrl = buildMagicLinkUrl(siteUrl, tokenHash, redirectTo);
    const rendered = renderAuthEmail('magic_login', locale, {
      ...commonVariables,
      magic_login_url: magicUrl,
    });
    results.emailSent = await sendEmail(email, rendered.subject, rendered.html);
  } else if (actionType === 'email_change' || actionType === 'email_change_new') {
    const verifyUrl = `${siteUrl}/auth/v1/verify?token=${encodeURIComponent(tokenHash)}&type=email_change&redirect_to=${encodeURIComponent(redirectTo)}`;
    const rendered = renderEmailChangeEmail(locale, verifyUrl);
    results.emailSent = await sendEmail(email, rendered.subject, rendered.html);
  } else {
    console.warn(`[auth-webhook] Unknown email_action_type: ${actionType}`);
    results.emailSent = false;
  }

  console.log('auth-webhook:', { userId, actionType, ...results });

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
