/**
 * send-push — Supabase Edge Function
 *
 * Sends push notifications to a user's registered devices via APNs (iOS).
 * Called internally by other edge functions or via service_role key.
 *
 * Body:
 *   { user_id: string, title: string, body: string, data?: object }
 *   OR
 *   { user_ids: string[], title: string, body: string, data?: object }
 *
 * Required secrets:
 *   supabase secrets set APNS_KEY_ID=xxx
 *   supabase secrets set APNS_TEAM_ID=xxx
 *   supabase secrets set APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 *   supabase secrets set APNS_BUNDLE_ID=com.atlascore.app
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v5.2.0/index.ts';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';


// APNs endpoints
const APNS_HOST_PROD = 'https://api.push.apple.com';
const APNS_HOST_DEV = 'https://api.sandbox.push.apple.com';

// Cache the JWT for ~50 minutes (APNs tokens are valid for 60 min)
let cachedJWT: string | null = null;
let cachedJWTExpiry = 0;

async function getAPNsJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedJWT && now < cachedJWTExpiry) return cachedJWT;

  const keyId = Deno.env.get('APNS_KEY_ID');
  const teamId = Deno.env.get('APNS_TEAM_ID');
  const privateKeyPEM = Deno.env.get('APNS_PRIVATE_KEY');

  if (!keyId || !teamId || !privateKeyPEM) {
    throw new Error('APNs credentials not configured');
  }

  const key = await importPKCS8(privateKeyPEM, 'ES256');

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .sign(key);

  cachedJWT = jwt;
  cachedJWTExpiry = now + 3000; // refresh after 50 min

  return jwt;
}

async function sendToAPNs(
  token: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {},
  bundleId: string,
  useSandbox: boolean,
): Promise<{ success: boolean; status: number; reason?: string }> {
  const jwt = await getAPNsJWT();
  const host = useSandbox ? APNS_HOST_DEV : APNS_HOST_PROD;

  const payload = {
    aps: {
      alert: { title, body },
      sound: 'default',
      badge: 1,
    },
    ...data,
  };

  const res = await fetch(`${host}/3/device/${token}`, {
    method: 'POST',
    headers: {
      'authorization': `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'apns-expiration': '0',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 200) {
    return { success: true, status: 200 };
  }

  const errorBody = await res.json().catch(() => ({}));
  const reason = errorBody?.reason || `HTTP ${res.status}`;

  // Token is invalid — clean it up
  if (res.status === 410 || reason === 'Unregistered' || reason === 'BadDeviceToken') {
    return { success: false, status: res.status, reason: 'invalid_token' };
  }

  return { success: false, status: res.status, reason };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  // Only allow service_role calls (internal/cron use only)
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!serviceRoleKey || token !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized — service_role required' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    serviceRoleKey,
  );

  let body: {
    user_id?: string;
    user_ids?: string[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { title, body: messageBody, data = {} } = body;
  const userIds = body.user_ids || (body.user_id ? [body.user_id] : []);

  if (!userIds.length || !title || !messageBody) {
    return new Response(JSON.stringify({ error: 'user_id(s), title, and body are required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const bundleId = Deno.env.get('APNS_BUNDLE_ID') || 'com.atlascore.app';
  const useSandbox = (Deno.env.get('APNS_ENVIRONMENT') || 'development') === 'development';

  // Fetch tokens for all target users
  const { data: tokens, error: dbError } = await supabase
    .from('push_tokens')
    .select('id, user_id, token, platform')
    .in('user_id', userIds)
    .eq('platform', 'ios');

  if (dbError || !tokens?.length) {
    return new Response(JSON.stringify({
      sent: 0,
      failed: 0,
      cleaned: 0,
      code: 'NO_TOKENS',
      safeFallback: true,
      message: 'Push skipped because the user has no registered iOS device token.',
      errors: dbError?.message || 'No tokens found',
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let failed = 0;
  const staleTokenIds: string[] = [];

  for (const row of tokens) {
    try {
      const result = await sendToAPNs(row.token, title, messageBody, data, bundleId, useSandbox);
      if (result.success) {
        sent++;
      } else if (result.reason === 'invalid_token') {
        staleTokenIds.push(row.id);
        failed++;
      } else {
        console.error(`[send-push] APNs error for ${row.user_id}: ${result.reason}`);
        failed++;
      }
    } catch (err) {
      console.error(`[send-push] Exception sending to ${row.user_id}:`, err);
      failed++;
    }
  }

  // Clean up stale tokens
  if (staleTokenIds.length > 0) {
    await supabase.from('push_tokens').delete().in('id', staleTokenIds);
    console.log(`[send-push] Cleaned ${staleTokenIds.length} stale token(s)`);
  }

  return new Response(JSON.stringify({ sent, failed, cleaned: staleTokenIds.length }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
