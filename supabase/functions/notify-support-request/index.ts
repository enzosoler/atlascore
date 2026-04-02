/**
 * notify-support-request
 *
 * Called by a Supabase database webhook on INSERT into support_requests.
 * Sends a notification email to the team via Resend.
 *
 * Deploy:
 *   npx supabase functions deploy notify-support-request --no-verify-jwt
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TYPE_LABELS: Record<string, string> = {
  bug: '🐛 Bug Report',
  feature: '💡 Feature Request',
  help: '❓ Help Request',
  contact: '✉️ Contact',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const payload = await req.json();

    // Supabase webhook sends { type: 'INSERT', table, record, ... }
    const record = payload.record ?? payload;

    const type = record.type ?? 'contact';
    const message = record.message ?? '(no message)';
    const email = record.user_email ?? 'anonymous';
    const userId = record.user_id ?? 'unknown';
    const createdAt = record.created_at ?? new Date().toISOString();

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const notifyEmail = Deno.env.get('SUPPORT_NOTIFY_EMAIL') || 'enzo@useatlascore.com';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';

    if (!resendKey) {
      console.error('[notify-support-request] RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 503,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const typeLabel = TYPE_LABELS[type] || type;
    const subject = `[atlas.core] ${typeLabel} from ${email}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px;">
        <h2 style="margin:0 0 16px 0; font-size: 18px;">${typeLabel}</h2>
        <table style="font-size: 14px; border-collapse: collapse; width: 100%;">
          <tr><td style="padding:6px 12px 6px 0; color:#666; white-space:nowrap;">From</td><td style="padding:6px 0;">${email}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666; white-space:nowrap;">User ID</td><td style="padding:6px 0; font-family:monospace; font-size:12px;">${userId}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666; white-space:nowrap;">Time</td><td style="padding:6px 0;">${new Date(createdAt).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })}</td></tr>
        </table>
        <div style="margin-top:16px; padding:16px; background:#f5f5f5; border-radius:8px; font-size:14px; line-height:1.6; white-space:pre-wrap;">${escapeHtml(message)}</div>
        <p style="margin-top:16px; font-size:12px; color:#999;">
          Reply directly to ${email} or check the
          <a href="https://supabase.com/dashboard/project/xrtqwdpczgdomqebmfkk/editor">support_requests table</a>.
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        reply_to: email !== 'anonymous' ? email : undefined,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[notify-support-request] Resend error:', res.status, errText);
      return new Response(JSON.stringify({ error: `Email send failed (${res.status})` }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    console.log('[notify-support-request] Email sent:', data.id);

    return new Response(JSON.stringify({ success: true, emailId: data.id }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify-support-request] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
