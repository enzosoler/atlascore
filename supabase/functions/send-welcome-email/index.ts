/**
 * send-welcome-email — Supabase Edge Function
 *
 * Sends a premium welcome email via Resend after a user signs up.
 * RESEND_API_KEY is stored as a Supabase secret — it never reaches the browser.
 *
 * Deploy:  supabase functions deploy send-welcome-email
 * Secret:  supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
 *
 * Invoked from the frontend via:
 *   supabase.functions.invoke('send-welcome-email', { body: { email, firstName } })
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_APP_URL = 'https://atlascore.app';

// ─── CORS ────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Email Templates ─────────────────────────────────────────────────────────

function buildHtml({ firstName, appUrl }: { firstName: string; appUrl: string }): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Welcome,';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Welcome to Atlas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F5F5F7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0; padding: 0; width: 100%;
    }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; display: block; max-width: 100%; }
    a { text-decoration: none; }

    .wrapper    { background-color: #F5F5F7; padding: 48px 16px; }
    .container  { background-color: #FFFFFF; border-radius: 20px; max-width: 560px; margin: 0 auto; overflow: hidden; }
    .header     { padding: 40px 48px 0; }
    .brand      { display: inline-flex; align-items: center; gap: 8px; }
    .brand-icon { width: 28px; height: 28px; background-color: #0A0A0A; border-radius: 8px; display: inline-block; }
    .brand-name { font-size: 15px; font-weight: 600; color: #0A0A0A; letter-spacing: -0.02em; }

    .body       { padding: 40px 48px; }
    .greeting   { font-size: 12px; font-weight: 500; color: #6E6E73; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px; }
    .headline   { font-size: 28px; font-weight: 600; color: #0A0A0A; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 20px; }
    .divider    { width: 32px; height: 2px; background-color: #0A0A0A; border-radius: 2px; margin-bottom: 24px; }
    .copy       { font-size: 15px; color: #3A3A3C; line-height: 1.65; margin-bottom: 32px; }

    .list       { margin: 0 0 36px 0; padding: 0; list-style: none; }
    .list li    { font-size: 14px; color: #3A3A3C; padding: 11px 0; border-bottom: 1px solid #F2F2F7; display: flex; align-items: center; gap: 10px; }
    .list li:last-child { border-bottom: none; }
    .dot        { width: 5px; height: 5px; background-color: #0A0A0A; border-radius: 50%; flex-shrink: 0; display: inline-block; }

    .cta        { display: inline-block; background-color: #0A0A0A; color: #FFFFFF !important; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; padding: 14px 28px; border-radius: 12px; }

    .footer     { padding: 24px 48px 40px; border-top: 1px solid #F2F2F7; }
    .tagline    { font-size: 12px; font-weight: 500; color: #8E8E93; margin-bottom: 8px; }
    .meta       { font-size: 11px; color: #AEAEB2; line-height: 1.5; }
    .meta a     { color: #6E6E73; text-decoration: underline; }

    @media only screen and (max-width: 600px) {
      .wrapper   { padding: 24px 12px; }
      .header, .body, .footer { padding-left: 28px; padding-right: 28px; }
      .headline  { font-size: 22px; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="container">

    <div class="header">
      <div class="brand">
        <div class="brand-icon"></div>
        <span class="brand-name">Atlas</span>
      </div>
    </div>

    <div class="body">
      <p class="greeting">${greeting}</p>
      <h1 class="headline">Your transformation,<br />finally organized.</h1>
      <div class="divider"></div>
      <p class="copy">
        Atlas brings your training, nutrition, progress, and protocols into
        one clear system — so you can stop guessing and start seeing what
        is actually working.
      </p>
      <ul class="list">
        <li><span class="dot"></span>Workouts and adherence, tracked in one place</li>
        <li><span class="dot"></span>Nutrition logged and connected to your goals</li>
        <li><span class="dot"></span>Lab exams and measurements over time</li>
        <li><span class="dot"></span>AI insights across your entire context</li>
      </ul>
      <a href="${appUrl}" class="cta" target="_blank" rel="noopener noreferrer">Open Atlas →</a>
    </div>

    <div class="footer">
      <p class="tagline">Built for clarity, consistency, and real progress.</p>
      <p class="meta">
        You received this because you created an Atlas account.
        Questions? <a href="mailto:support@atlascore.app">support@atlascore.app</a>
      </p>
    </div>

  </div>
</div>
</body>
</html>`;
}

function buildText({ firstName, appUrl }: { firstName: string; appUrl: string }): string {
  const greeting = firstName ? `Hi ${firstName},` : 'Welcome,';
  return `${greeting}

Your transformation, finally organized.

Atlas brings your training, nutrition, progress, and protocols into one clear system — so you can stop guessing and start seeing what is actually working.

What you have access to:
• Workouts and adherence, tracked in one place
• Nutrition logged and connected to your goals
• Lab exams and measurements over time
• AI insights across your entire context

Open Atlas: ${appUrl}

---
Built for clarity, consistency, and real progress.
Questions? support@atlascore.app`.trim();
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── Parse input ──────────────────────────────────────────────────────────
    let body: { email?: string; firstName?: string; appUrl?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { email, firstName, appUrl: clientAppUrl } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // ── API key ──────────────────────────────────────────────────────────────
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('send-welcome-email: RESEND_API_KEY secret is not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Set RESEND_API_KEY via supabase secrets set.' }),
        { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── Build vars ───────────────────────────────────────────────────────────
    const resolvedFirstName = typeof firstName === 'string' ? firstName.trim() : '';
    const resolvedAppUrl =
      typeof clientAppUrl === 'string' && clientAppUrl.startsWith('http')
        ? clientAppUrl
        : DEFAULT_APP_URL;
    const fromAddress = Deno.env.get('FROM_EMAIL') ?? 'Atlas <welcome@atlascore.app>';

    // ── Send via Resend ──────────────────────────────────────────────────────
    const resendRes = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email.trim().toLowerCase()],
        subject: 'Welcome to Atlas',
        html: buildHtml({ firstName: resolvedFirstName, appUrl: resolvedAppUrl }),
        text: buildText({ firstName: resolvedFirstName, appUrl: resolvedAppUrl }),
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error(`send-welcome-email: Resend error ${resendRes.status}:`, errText);
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await resendRes.json();
    console.log(`send-welcome-email: ✓ sent to ${email}, id=${data.id}`);

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('send-welcome-email: Unexpected error:', message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
