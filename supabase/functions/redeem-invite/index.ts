/**
 * redeem-invite — Validate and redeem a beta invite token
 *
 * Auth: User JWT (the user who just signed up/in)
 *
 * Body: { token: string }
 *
 * On success:
 *   - Marks invite as accepted
 *   - Sets profile.role = invite.role (default: beta_tester)
 *   - Upserts subscription with status='granted', tier=invite.tier (default: internal)
 *
 * Deploy:
 *   supabase functions deploy redeem-invite
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let token: string;
  try {
    const body = await req.json();
    token = body.token;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!token || typeof token !== 'string') {
    return new Response(JSON.stringify({ error: 'token is required' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Fetch the invite
  const { data: invite, error: fetchError } = await supabaseAdmin
    .from('beta_invites')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (fetchError || !invite) {
    return new Response(JSON.stringify({ error: 'Invite not found' }), {
      status: 404,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Validate invite state
  if (invite.status !== 'pending') {
    const messages: Record<string, string> = {
      accepted: 'This invite has already been used.',
      expired: 'This invite has expired.',
      revoked: 'This invite has been revoked.',
    };
    return new Response(JSON.stringify({ error: messages[invite.status] || 'Invite is not valid' }), {
      status: 409,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (new Date(invite.expires_at) < new Date()) {
    // Mark as expired
    await supabaseAdmin
      .from('beta_invites')
      .update({ status: 'expired' })
      .eq('id', invite.id);

    return new Response(JSON.stringify({ error: 'This invite link has expired.' }), {
      status: 409,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Verify the email matches (case-insensitive)
  const userEmail = (user.email || '').toLowerCase().trim();
  const inviteEmail = (invite.email || '').toLowerCase().trim();
  if (userEmail !== inviteEmail) {
    return new Response(JSON.stringify({ error: 'This invite was sent to a different email address.' }), {
      status: 403,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const role = invite.role || 'beta_tester';
  const tier = invite.tier || 'internal';

  // 1. Update profile role
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', user.id);

  if (profileError) {
    console.error('redeem-invite: Failed to update profile role:', profileError);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // 2. Upsert subscription (grant full access)
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingSub?.id) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'granted', tier })
      .eq('id', existingSub.id);
  } else {
    await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: user.id, status: 'granted', tier });
  }

  // 3. Mark invite as accepted
  await supabaseAdmin
    .from('beta_invites')
    .update({
      status: 'accepted',
      redeemed_by: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id);

  console.log(`redeem-invite: Invite accepted id=${invite.id} user=${user.id} role=${role} tier=${tier}`);

  return new Response(JSON.stringify({ success: true, role, tier }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
