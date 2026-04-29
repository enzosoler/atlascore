/**
 * admin-grant-entitlement — Grant or revoke a promotional entitlement via RevenueCat
 *
 * Auth: Admin-only (verified via JWT + profiles.role check)
 *
 * Body (grant):
 *   { userId: string, action: "grant", duration: "weekly"|"monthly"|"two_month"|"three_month"|"six_month"|"yearly"|"lifetime" }
 *
 * Body (revoke):
 *   { userId: string, action: "revoke" }
 *
 * Flow:
 *   1. Verify caller is admin
 *   2. Call RevenueCat REST API to grant/revoke promotional entitlement
 *   3. RevenueCat fires webhook → revenuecat-webhook syncs to subscriptions table
 *   4. Log action to admin_audit_logs
 *
 * Secrets required:
 *   REVENUECAT_SECRET_KEY   — RevenueCat v1 secret API key (sk_...)
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
 *
 * Deploy:
 *   supabase functions deploy admin-grant-entitlement
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';

const RC_API_BASE = 'https://api.revenuecat.com/v1';
const ENTITLEMENT_ID = 'pro';

const VALID_DURATIONS = new Set([
  'daily',
  'three_day',
  'weekly',
  'monthly',
  'two_month',
  'three_month',
  'six_month',
  'yearly',
  'lifetime',
]);

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

  // ── Auth ────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !caller) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();

  if (!callerProfile || (callerProfile.role !== 'admin' && callerProfile.role !== 'superadmin')) {
    return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: { userId: string; action: string; duration?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { userId, action, duration } = body;

  if (!userId || typeof userId !== 'string') {
    return new Response(JSON.stringify({ error: 'userId is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (action !== 'grant' && action !== 'revoke') {
    return new Response(JSON.stringify({ error: 'action must be "grant" or "revoke"' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── RevenueCat API key ──────────────────────────────────────────────────
  const rcSecretKey = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!rcSecretKey) {
    console.error('admin-grant-entitlement: REVENUECAT_SECRET_KEY not configured');
    return new Response(JSON.stringify({ error: 'RevenueCat API key not configured' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Verify target user exists ───────────────────────────────────────────
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (!targetProfile) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Call RevenueCat ─────────────────────────────────────────────────────
  const rcHeaders = {
    'Authorization': `Bearer ${rcSecretKey}`,
    'Content-Type': 'application/json',
  };

  // RevenueCat uses the Supabase user ID as app_user_id (set during SDK init)
  const appUserId = userId;

  try {
    if (action === 'grant') {
      const grantDuration = duration || 'monthly';
      if (!VALID_DURATIONS.has(grantDuration)) {
        return new Response(JSON.stringify({ error: `Invalid duration: ${grantDuration}. Valid: ${[...VALID_DURATIONS].join(', ')}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const rcResponse = await fetch(
        `${RC_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/entitlements/${encodeURIComponent(ENTITLEMENT_ID)}/promotional`,
        {
          method: 'POST',
          headers: rcHeaders,
          body: JSON.stringify({ duration: grantDuration }),
        },
      );

      if (!rcResponse.ok) {
        const errorBody = await rcResponse.text();
        console.error(`admin-grant-entitlement: RevenueCat grant failed (${rcResponse.status}):`, errorBody);
        return new Response(JSON.stringify({ error: `RevenueCat API error: ${rcResponse.status}`, detail: errorBody }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const rcData = await rcResponse.json();
      console.log(`admin-grant-entitlement: Granted ${grantDuration} to user=${userId} by admin=${caller.id}`);

      // Audit log
      await supabaseAdmin.from('admin_audit_logs').insert({
        actor_id: caller.id,
        target_user_id: userId,
        action_type: 'entitlement.grant',
        action_detail: {
          duration: grantDuration,
          entitlement: ENTITLEMENT_ID,
          email: targetProfile.email,
          source: 'revenuecat_promotional',
        },
      }).catch((e: Error) => console.warn('admin-grant-entitlement: Audit log failed:', e));

      return new Response(JSON.stringify({
        success: true,
        action: 'grant',
        userId,
        duration: grantDuration,
        entitlement: ENTITLEMENT_ID,
        subscriber: rcData.subscriber ? {
          entitlements: rcData.subscriber.entitlements,
        } : null,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // action === 'revoke'
      const rcResponse = await fetch(
        `${RC_API_BASE}/subscribers/${encodeURIComponent(appUserId)}/entitlements/${encodeURIComponent(ENTITLEMENT_ID)}/revoke_promotionals`,
        {
          method: 'POST',
          headers: rcHeaders,
        },
      );

      if (!rcResponse.ok) {
        const errorBody = await rcResponse.text();
        console.error(`admin-grant-entitlement: RevenueCat revoke failed (${rcResponse.status}):`, errorBody);
        return new Response(JSON.stringify({ error: `RevenueCat API error: ${rcResponse.status}`, detail: errorBody }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const rcData = await rcResponse.json();
      console.log(`admin-grant-entitlement: Revoked promotional from user=${userId} by admin=${caller.id}`);

      // Audit log
      await supabaseAdmin.from('admin_audit_logs').insert({
        actor_id: caller.id,
        target_user_id: userId,
        action_type: 'entitlement.revoke',
        action_detail: {
          entitlement: ENTITLEMENT_ID,
          email: targetProfile.email,
          source: 'revenuecat_promotional',
        },
      }).catch((e: Error) => console.warn('admin-grant-entitlement: Audit log failed:', e));

      return new Response(JSON.stringify({
        success: true,
        action: 'revoke',
        userId,
        entitlement: ENTITLEMENT_ID,
        subscriber: rcData.subscriber ? {
          entitlements: rcData.subscriber.entitlements,
        } : null,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('admin-grant-entitlement: Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
