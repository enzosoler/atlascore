/**
 * send-test-emails — fires one test email per template to a target address
 *
 * Deploy:  supabase functions deploy send-test-emails
 * Invoke:  curl -X POST <url> -H "Authorization: Bearer <service_role_key>" \
 *            -H "Content-Type: application/json" -d '{"to":"admin@useatlascore.com"}'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { renderEmail, templates } from '../_shared/templates.ts';

const APP = Deno.env.get('APP_URL') || 'https://www.useatlascore.com';

// Sample variables for templates that require them
const SAMPLE_VARS: Record<string, Record<string, string>> = {
  confirm_email: { confirm_email_url: `${APP}/auth?confirm=preview_token` },
  reset_password: { reset_password_url: `${APP}/auth/update-password?token=preview` },
  trial_started: { trial_end_date: 'April 3, 2026' },
  trial_ending: { trial_end_date: 'April 3, 2026' },
  payment_success: { receipt_id: 'RCP-001-PREVIEW' },
  payment_failed: { retry_date: 'April 2, 2026' },
  subscription_canceled: { access_end_date: 'April 30, 2026' },
  weekly_report: {
    report_date_range: 'Mar 17–23',
    weekly_report_url: `${APP}/insights`,
  },
  invite_beta: {
    first_name: 'Enzo',
    invite_url: `${APP}/invite?token=preview_token`,
    invite_expiry_date: 'April 3, 2026',
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    });
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'atlas.core <noreply@useatlascore.com>';

  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 });
  }

  let to = 'admin@useatlascore.com';
  try { const b = await req.json(); if (b.to) to = b.to; } catch { /* use default */ }

  const results: { type: string; ok: boolean; id?: string; error?: string }[] = [];

  for (const key of Object.keys(templates)) {
    const vars = SAMPLE_VARS[key] ?? {};
    const { subject, html } = renderEmail(key, vars);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: [to], subject: `[TEST] ${subject}`, html }),
    });
    const data = await res.json();
    results.push({ type: key, ok: res.ok, id: data.id, error: data.message });
    await new Promise(r => setTimeout(r, 250));
  }

  const sent = results.filter(r => r.ok).length;
  console.log(`send-test-emails: ${sent}/${results.length} sent to ${to}`);

  return new Response(JSON.stringify({ to, sent, total: results.length, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
