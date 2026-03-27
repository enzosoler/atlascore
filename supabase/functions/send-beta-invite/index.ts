/**
 * send-beta-invite — Create a beta invite record and send the invite email
 *
 * Auth: Service-role JWT (admin only — called from the admin panel)
 *
 * Body: { email: string, firstName?: string, notes?: string }
 *
 * NOTE: Email sending is inlined (not imported from _shared/) to avoid
 * the Supabase Edge Runtime BOOT_ERROR caused by the logger+templates
 * module chain when combined with supabase-js.
 *
 * Deploy:
 *   supabase functions deploy send-beta-invite
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sendInviteEmail(
  to: string,
  firstName: string,
  inviteUrl: string,
  notes?: string
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'Atlas Core <noreply@useatlascore.com>';
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';

  if (!resendApiKey) {
    console.warn('send-beta-invite: RESEND_API_KEY not set, skipping email');
    return;
  }

  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const noteHtml = notes ? `<p style="font-style:italic;color:#888;">"${notes}"</p>` : '';

  const html = `
    <p>${greeting}</p>
    <p>You've been invited to join <strong>Atlas Core</strong> as a beta user.</p>
    ${noteHtml}
    <p>Click the link below to accept your invitation and create your account:</p>
    <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Accept invitation</a></p>
    <p>Or copy this link: <a href="${inviteUrl}">${inviteUrl}</a></p>
    <p>This invite expires in 7 days.</p>
    <p>– Atlas Core</p>
    <p><small><a href="${appUrl}">${appUrl}</a></small></p>
  `;

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
        subject: "You're invited to Atlas Core beta",
        html,
      }),
    });
    if (!res.ok) {
      console.error('send-beta-invite: Resend error', res.status, await res.text());
    }
  } catch (e) {
    console.error('send-beta-invite: email send failed:', e);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Verify the caller is an admin via their JWT
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !caller) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Verify the caller is an admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body: { email: string; firstName?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { email, firstName = '', notes = '' } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email is required' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Check for existing pending invite
  const { data: existing } = await supabaseAdmin
    .from('beta_invites')
    .select('id, status')
    .eq('email', email.toLowerCase().trim())
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ error: 'A pending invite already exists for this email' }), {
      status: 409,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Create invite record
  const { data: invite, error: insertError } = await supabaseAdmin
    .from('beta_invites')
    .insert({
      email: email.toLowerCase().trim(),
      invited_by: caller.id,
      notes: notes || null,
    })
    .select()
    .single();

  if (insertError || !invite) {
    console.error('send-beta-invite: Failed to create invite:', insertError);
    return new Response(JSON.stringify({ error: 'Failed to create invite' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const inviteUrl = `${appUrl}/invite?token=${invite.token}`;

  await sendInviteEmail(invite.email, firstName, inviteUrl, notes || undefined);

  console.log(`send-beta-invite: Invite created id=${invite.id} email=${invite.email}`);

  return new Response(JSON.stringify({
    id: invite.id,
    email: invite.email,
    token: invite.token,
    inviteUrl,
    expiresAt: invite.expires_at,
  }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
