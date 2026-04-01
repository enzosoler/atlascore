/**
 * share-workout — Supabase Edge Function
 *
 * Handles sharing and retrieving shared workout plans/days.
 *
 * POST /share-workout  — Create a share (requires auth)
 *   Body: { type: 'plan' | 'day', plan_id: string, day_index?: number }
 *   Returns: { token, url }
 *
 * GET /share-workout?token=xxx — Retrieve a shared workout (public, no auth)
 *   Returns: { share data }
 *
 * POST /share-workout/import — Import a shared workout (requires auth)
 *   Body: { token: string }
 *   Returns: { plan_id }
 *
 * Deploy: supabase functions deploy share-workout
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

const APP_URL = Deno.env.get('APP_URL') || 'https://useatlascore.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // ── GET: Retrieve shared workout (public, no auth) ─────────────────────────
  if (req.method === 'GET') {
    const token = url.searchParams.get('token');
    if (!token) return json({ error: 'token is required' }, 400);

    const { data, error } = await supabaseAdmin
      .from('shared_workouts')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      return json({ error: 'Share not found or expired' }, 404);
    }

    return json(data);
  }

  // ── POST: Create share or import ───────────────────────────────────────────
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Parse the action from the URL path
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const isImport = pathSegments[pathSegments.length - 1] === 'import';

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // Both create and import require authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );

  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // ── Import shared workout ──────────────────────────────────────────────────
  if (isImport) {
    const token = body.token as string;
    if (!token) return json({ error: 'token is required' }, 400);

    const { data: share, error: fetchErr } = await supabaseAdmin
      .from('shared_workouts')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchErr || !share) {
      return json({ error: 'Share not found or expired' }, 404);
    }

    // Create a new workout plan for the importing user
    const planData = share.workout_data;
    const { data: newPlan, error: insertErr } = await supabaseAdmin
      .from('workout_plans')
      .insert({
        user_id: user.id,
        name: planData.name || 'Imported workout',
        objective: planData.objective || null,
        frequency: planData.frequency || null,
        days: planData.days || [],
        active: true,
        created_by_type: 'user',
        version: 1,
        start_date: new Date().toISOString().split('T')[0],
        notes: `Imported from shared workout${share.sharer_name ? ` by ${share.sharer_name}` : ''}`,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[share-workout] Import insert error:', insertErr);
      return json({ error: 'Could not import workout' }, 500);
    }

    return json({ plan_id: newPlan.id });
  }

  // ── Create share ───────────────────────────────────────────────────────────
  const { type, plan_id, day_index } = body as {
    type: 'plan' | 'day';
    plan_id: string;
    day_index?: number;
  };

  if (!type || !plan_id) {
    return json({ error: 'type and plan_id are required' }, 400);
  }

  if (type !== 'plan' && type !== 'day') {
    return json({ error: 'type must be "plan" or "day"' }, 400);
  }

  if (type === 'day' && (day_index === undefined || day_index === null)) {
    return json({ error: 'day_index is required when type is "day"' }, 400);
  }

  // Fetch the plan
  const { data: plan, error: planErr } = await supabaseAdmin
    .from('workout_plans')
    .select('*')
    .eq('id', plan_id)
    .eq('user_id', user.id)
    .single();

  if (planErr || !plan) {
    return json({ error: 'Workout plan not found' }, 404);
  }

  // Fetch sharer's display name
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Build workout data snapshot
  let workoutData: Record<string, unknown>;
  let shareName: string;

  if (type === 'plan') {
    workoutData = {
      name: plan.name,
      objective: plan.objective,
      frequency: plan.frequency,
      days: plan.days || [],
      notes: plan.notes,
    };
    shareName = plan.name || 'Workout Plan';
  } else {
    const days = Array.isArray(plan.days) ? plan.days : [];
    const day = days[day_index!];
    if (!day) {
      return json({ error: 'Day not found in plan' }, 404);
    }
    workoutData = {
      name: day.name || `Day ${(day_index! + 1)}`,
      objective: plan.objective,
      frequency: null,
      days: [day],
      notes: null,
    };
    shareName = day.name || `Day ${(day_index! + 1)}`;
  }

  // Generate a unique token
  const token = crypto.randomUUID().replace(/-/g, '');

  const { data: shareRow, error: shareErr } = await supabaseAdmin
    .from('shared_workouts')
    .insert({
      token,
      share_type: type,
      sharer_id: user.id,
      sharer_name: profile?.full_name || null,
      plan_name: shareName,
      workout_data: workoutData,
    })
    .select()
    .single();

  if (shareErr) {
    console.error('[share-workout] Insert error:', shareErr);
    return json({ error: 'Could not create share' }, 500);
  }

  const shareUrl = `${APP_URL}/shared/workout/${token}`;

  return json({ token, url: shareUrl });
});
