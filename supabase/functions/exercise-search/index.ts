/**
 * exercise-search — Supabase Edge Function
 *
 * Proxies ExerciseDB (RapidAPI) requests server-side so the API key
 * is never bundled into the client JS.
 *
 * Deploy:  supabase functions deploy exercise-search
 * Secret:  supabase secrets set EXERCISEDB_API_KEY=your_rapidapi_key
 *
 * Supports:
 *   POST { path: '/exercises/name/curl', params: { limit: 30 } }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EXERCISEDB_BASE = 'https://exercisedb.p.rapidapi.com';

// Allowlist of valid path prefixes to prevent SSRF
const ALLOWED_PATHS = [
  '/exercises',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // ── Require authentication ─────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // ── Parse request ──────────────────────────────────────────────────────────
  let body: { path?: string; params?: Record<string, string | number> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { path, params = {} } = body;

  if (!path || typeof path !== 'string') {
    return new Response(JSON.stringify({ error: 'path is required' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Guard against SSRF
  if (!ALLOWED_PATHS.some(prefix => path.startsWith(prefix))) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('EXERCISEDB_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ExerciseDB API key not configured.' }), {
      status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(`${EXERCISEDB_BASE}${path}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const upstreamRes = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!upstreamRes.ok) {
      console.error(`[exercise-search] ExerciseDB ${upstreamRes.status} on ${path}`);
      return new Response(JSON.stringify({ error: 'Upstream error', status: upstreamRes.status }), {
        status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await upstreamRes.json();
    return new Response(JSON.stringify(data), {
      status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[exercise-search] Error:', message);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
