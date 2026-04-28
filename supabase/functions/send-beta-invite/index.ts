/**
 * send-beta-invite — Create a beta invite record and send the invite email
 *
 * Auth: Service-role JWT (admin only — called from the admin panel)
 *
 * Body: { email: string, firstName?: string, notes?: string, locale?: 'pt-BR' | 'en' }
 *
 * Uses the invite_beta template from _shared/templates.ts for localized emails.
 *
 * Deploy:
 *   supabase functions deploy send-beta-invite
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderEmail } from '../_shared/templates.ts';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';


type Locale = 'pt-BR' | 'en';

async function sendInviteEmail(
  to: string,
  firstName: string,
  inviteUrl: string,
  locale: Locale = 'en',
  expiryDate?: string,
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('FROM_EMAIL') || 'atlas.core <noreply@useatlascore.com>';

  if (!resendApiKey) {
    console.warn('send-beta-invite: RESEND_API_KEY not set, skipping email');
    return;
  }

  const { subject, html } = renderEmail('invite_beta', locale, {
    first_name: firstName || (locale === 'pt-BR' ? 'convidado' : 'there'),
    invite_url: inviteUrl,
    invite_expiry_date: expiryDate || '7 days',
  });

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
    if (!res.ok) {
      console.error('send-beta-invite: Resend error', res.status, await res.text());
    }
  } catch (e) {
    console.error('send-beta-invite: email send failed:', e);
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify the caller is an admin via their JWT
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { email: string; firstName?: string; notes?: string; locale?: Locale };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { email, firstName = '', notes = '', locale = 'en' } = body;
  const resolvedLocale: Locale = locale === 'pt-BR' ? 'pt-BR' : 'en';

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Valid email is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const inviteUrl = `${appUrl}/invite?token=${invite.token}`;

  // Format expiry date for the email template
  const expiryDate = invite.expires_at
    ? new Date(invite.expires_at).toLocaleDateString(resolvedLocale === 'pt-BR' ? 'pt-BR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '7 days';

  await sendInviteEmail(invite.email, firstName, inviteUrl, resolvedLocale, expiryDate);

  console.log(`send-beta-invite: Invite created id=${invite.id} email=${invite.email} locale=${resolvedLocale}`);

  return new Response(JSON.stringify({
    id: invite.id,
    email: invite.email,
    token: invite.token,
    inviteUrl,
    expiresAt: invite.expires_at,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
