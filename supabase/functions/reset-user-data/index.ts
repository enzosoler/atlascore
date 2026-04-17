/**
 * reset-user-data — Wipes all user-generated tracking data while preserving
 * account, auth, subscription, and basic biometrics.
 *
 * Deploy:
 *   supabase functions deploy reset-user-data --no-verify-jwt
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS (mirrors ai-coach-chat pattern) ────────────────────────────────────

function getAllowedOrigin(requestOrigin: string): string {
  const appUrls = Deno.env.get('APP_URLS') || '';
  const extraAllowed = appUrls.split(',').map((u) => u.trim()).filter(Boolean);

  if (requestOrigin?.endsWith('useatlascore.com')) return requestOrigin;

  const allowedList = [
    ...extraAllowed,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'capacitor://localhost',
    'atlascore://localhost',
  ];
  if (allowedList.includes(requestOrigin)) return requestOrigin;

  console.warn('[reset-user-data] CORS blocked origin:', requestOrigin);
  return 'https://useatlascore.com';
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(body: unknown, status: number, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Tables containing user-generated tracking data to wipe.
// Order matters: child tables (with FK references) before parent tables.
const WIPE_TABLES = [
  'protocol_logs',
  'protocols',
  'workout_logs',
  'workouts',
  'workout_plans',
  'food_logs',
  'daily_checkins',
  'measurements',
  'progress_photos',
  'coach_messages',
  'coach_memory',
  'product_events',
  'error_logs',
];

// Profile fields to preserve after reset (basic biometrics + subscription state).
const PROFILE_KEEP_KEYS = [
  'sex',
  'age',
  'date_of_birth',
  'height',
  'current_weight',
  'units_system',
  'pro_entitlement',
];

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, corsHeaders);
  }

  try {
    // ── 1. Authenticate ────────────────────────────────────────────────────

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing authorization header' }, 401, corsHeaders);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Anon client scoped to user JWT — used only for auth verification
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: 'Unauthorized', detail: authError?.message }, 401, corsHeaders);
    }
    const userId = user.id;
    console.log('[reset-user-data] user:', userId);

    // Service role client — bypasses RLS for bulk deletes
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. Delete from each wipe table ─────────────────────────────────────

    const tablesWiped: Record<string, number> = {};

    for (const table of WIPE_TABLES) {
      try {
        // Use select to get count, then delete
        const { data: rows } = await admin
          .from(table)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { count, error: countError } = await admin
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const rowCount = count ?? 0;

        const { error: deleteError } = await admin
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error(`[reset-user-data] delete ${table} failed:`, deleteError.message);
          tablesWiped[table] = -1; // signal failure
        } else {
          tablesWiped[table] = rowCount;
          console.log(`[reset-user-data] ${table}: ${rowCount} rows deleted`);
        }
      } catch (err) {
        console.error(`[reset-user-data] ${table} error:`, err);
        tablesWiped[table] = -1;
      }
    }

    // ── 3. Delete storage objects (progress photos) ────────────────────────

    let storageFilesDeleted = 0;
    try {
      const { data: files } = await admin.storage
        .from('progress-photos')
        .list(userId, { limit: 1000 });

      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        const { error: storageError } = await admin.storage
          .from('progress-photos')
          .remove(paths);

        if (storageError) {
          console.error('[reset-user-data] storage delete error:', storageError.message);
        } else {
          storageFilesDeleted = paths.length;
          console.log(`[reset-user-data] storage: ${storageFilesDeleted} files deleted`);
        }
      }
    } catch (err) {
      console.error('[reset-user-data] storage error:', err);
    }

    // ── 4. Reset profile_data — keep only biometrics ───────────────────────

    try {
      const { data: profile } = await admin
        .from('profiles')
        .select('profile_data')
        .eq('id', userId)
        .single();

      const currentData = profile?.profile_data ?? {};
      const preservedData: Record<string, unknown> = {};

      for (const key of PROFILE_KEEP_KEYS) {
        if (currentData[key] !== undefined && currentData[key] !== null) {
          preservedData[key] = currentData[key];
        }
      }

      const { error: profileError } = await admin
        .from('profiles')
        .update({
          profile_data: preservedData,
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) {
        console.error('[reset-user-data] profile reset error:', profileError.message);
      } else {
        console.log('[reset-user-data] profile_data reset, onboarding_completed = false');
      }
    } catch (err) {
      console.error('[reset-user-data] profile error:', err);
    }

    // ── 5. Log the reset event ─────────────────────────────────────────────

    try {
      await admin.from('user_data_resets').insert({
        user_id: userId,
        counts: { tables_wiped: tablesWiped, storage_files_deleted: storageFilesDeleted },
      });
    } catch (err) {
      console.error('[reset-user-data] audit log error:', err);
    }

    // ── 6. Return summary ──────────────────────────────────────────────────

    return json(
      { tables_wiped: tablesWiped, storage_files_deleted: storageFilesDeleted },
      200,
      corsHeaders,
    );
  } catch (err) {
    console.error('[reset-user-data] unhandled error:', err);
    return json({ error: 'Internal server error' }, 500, corsHeaders);
  }
});
