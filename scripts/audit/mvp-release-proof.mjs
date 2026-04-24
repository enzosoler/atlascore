import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.env.E2E_USER_EMAIL || 'e2e-user@example.com';
const password = process.env.E2E_USER_PASSWORD || 'AtlasAuth#2026';
const auditId = `mvp_audit_${Date.now()}`;
const today = new Date().toISOString().slice(0, 10);

if (!url || !anonKey || !serviceKey) {
  throw new Error('Missing Supabase URL, anon/publishable key, or service role key.');
}

const userClient = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

function pass(evidence = {}) {
  return { status: 'PASS', ...evidence };
}

function boundary(evidence = {}) {
  return { status: 'BOUNDARY', ...evidence };
}

function degraded(evidence = {}) {
  return { status: 'DEGRADED_SAFE', ...evidence };
}

function fail(error) {
  return { status: 'FAIL', error: error?.message || String(error) };
}

async function ensureSecondUser() {
  const otherEmail = `atlas-isolation-${Date.now()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email: otherEmail,
    password: 'AtlasIsolation#2026',
    email_confirm: true,
  });
  if (error) throw error;

  const userId = data.user.id;
  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email: otherEmail,
    full_name: 'Isolation User',
    role: 'athlete',
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    throw profileError;
  }

  return { userId, otherEmail };
}

async function cleanupSecondUser(userId) {
  await admin.from('subscriptions').delete().eq('user_id', userId);
  await admin.from('profiles').delete().eq('id', userId);
  await admin.auth.admin.deleteUser(userId);
}

async function run() {
  const results = {};
  const { data: authData, error: authError } = await userClient.auth.signInWithPassword({ email, password });
  if (authError) throw authError;

  const user = authData.user;
  const session = authData.session;

  results.auth = pass({ userId: user.id, email, session: Boolean(session?.access_token) });

  let secondUser = null;
  try {
    secondUser = await ensureSecondUser();
    const [profileRead, subscriptionRead] = await Promise.all([
      userClient.from('profiles').select('id,email').eq('id', secondUser.userId),
      userClient.from('subscriptions').select('id,user_id').eq('user_id', secondUser.userId),
    ]);
    const visibleProfiles = profileRead.data?.length ?? 0;
    const visibleSubscriptions = subscriptionRead.data?.length ?? 0;

    results.accountIsolation =
      visibleProfiles === 0 && visibleSubscriptions === 0
        ? pass({
            otherProfileRowsVisibleToUserA: visibleProfiles,
            otherSubscriptionRowsVisibleToUserA: visibleSubscriptions,
          })
        : fail(
            new Error(
              `RLS leak detected: saw ${visibleProfiles} foreign profile row(s) and ${visibleSubscriptions} foreign subscription row(s).`
            )
          );
  } catch (error) {
    results.accountIsolation = fail(error);
  } finally {
    if (secondUser?.userId) await cleanupSecondUser(secondUser.userId);
  }

  try {
    const { data, error } = await userClient.from('food_logs').insert({
      user_id: user.id,
      date: `${today}T12:00:00+00:00`,
      meal_type: 'audit',
      food_name: `Audit oats ${auditId}`,
      calories: 321,
      protein: 22,
      carbs: 41,
      fat: 8,
      quantity: 1,
      serving_unit: 'bowl',
      serving_size: 1,
    }).select('id,food_name,calories').single();
    if (error) throw error;
    const read = await userClient.from('food_logs').select('id').eq('id', data.id).single();
    if (read.error) throw read.error;
    await userClient.from('food_logs').delete().eq('id', data.id);
    results.nutritionWriteRead = pass({ id: data.id, calories: data.calories });
  } catch (error) {
    results.nutritionWriteRead = fail(error);
  }

  try {
    const { data, error } = await userClient.from('measurements').insert({
      user_id: user.id,
      date: today,
      weight: 82.4,
      notes: auditId,
      source: 'manual',
    }).select('id,weight').single();
    if (error) throw error;
    const read = await userClient.from('measurements').select('id').eq('id', data.id).single();
    if (read.error) throw read.error;
    await userClient.from('measurements').delete().eq('id', data.id);
    results.bodyMeasurementWriteRead = pass({ id: data.id, weight: data.weight });
  } catch (error) {
    results.bodyMeasurementWriteRead = fail(error);
  }

  try {
    const started = new Date().toISOString();
    const { data: sessionRow, error: sessionError } = await userClient.from('workout_sessions').insert({
      user_id: user.id,
      started_at: started,
      ended_at: started,
      duration_sec: 900,
      total_volume_kg: 600,
      note: auditId,
    }).select('id,total_volume_kg').single();
    if (sessionError) throw sessionError;

    const { data: setRow, error: setError } = await userClient.from('workout_sets').insert({
      session_id: sessionRow.id,
      exercise_id: 'audit-bench-press',
      set_index: 1,
      weight_kg: 60,
      reps: 10,
      is_warmup: false,
    }).select('id,reps').single();
    if (setError) throw setError;

    const read = await userClient.from('workout_sets').select('id').eq('session_id', sessionRow.id);
    if (read.error) throw read.error;
    await userClient.from('workout_sessions').delete().eq('id', sessionRow.id);
    results.workoutWriteRead = pass({ sessionId: sessionRow.id, setId: setRow.id, setCount: read.data.length });
  } catch (error) {
    results.workoutWriteRead = fail(error);
  }

  try {
    const res = await fetch(`${url}/functions/v1/ai-coach-chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'What should I do today?', page_context: 'release_audit', locale: 'en' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      results.aiCoach = boundary({ statusCode: res.status, response: data });
    } else if (data?.message) {
      results.aiCoach = data?.degraded
        ? degraded({
            messagePreview: String(data.message).slice(0, 90),
            suggestionCount: data.suggestions?.length ?? 0,
            code: data.code || null,
          })
        : pass({ messagePreview: String(data.message).slice(0, 90), suggestionCount: data.suggestions?.length ?? 0 });
    } else {
      results.aiCoach = boundary({ response: data });
    }
  } catch (error) {
    results.aiCoach = boundary({ error: error.message });
  }

  try {
    const res = await fetch(`${url}/functions/v1/log-food-text`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: 'two eggs and toast', language: 'en' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      results.aiFoodText =
        res.status === 429 && data?.safeFallback
          ? degraded({ statusCode: res.status, response: data, fallbackMode: data?.fallback?.mode || null })
          : boundary({ statusCode: res.status, response: data });
    } else {
      results.aiFoodText = data?.success
        ? pass({ source: data.source || 'model', calories: data.calories, protein: data.protein })
        : boundary({ response: data });
    }
  } catch (error) {
    results.aiFoodText = boundary({ error: error.message });
  }

  try {
    const res = await fetch(`${url}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        language: 'en',
        firstName: 'E2E',
      }),
    });
    const data = await res.json().catch(() => ({}));
    results.welcomeEmail = res.ok
      ? pass({ providerId: data.id || null, queued: Boolean(data.id), mode: data.mode || 'self_authenticated_wrapper' })
      : boundary({ statusCode: res.status, response: data });
  } catch (error) {
    results.welcomeEmail = boundary({ error: error.message });
  }

  try {
    const res = await fetch(`${url}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        title: 'atlas.core audit',
        body: 'Release notification boundary check',
        data: { route: '/app/today', auditId },
      }),
    });
    const data = await res.json().catch(() => ({}));
    results.pushNotification =
      !res.ok
        ? boundary({ statusCode: res.status, response: data })
        : Number(data?.sent ?? 0) > 0
          ? pass({ statusCode: res.status, response: data })
          : data?.safeFallback && data?.code === 'NO_TOKENS'
            ? degraded({ statusCode: res.status, response: data })
            : boundary({ statusCode: res.status, response: data });
  } catch (error) {
    results.pushNotification = boundary({ error: error.message });
  }

  console.log(JSON.stringify({ auditId, results }, null, 2));
}

run().catch((error) => {
  console.error(JSON.stringify({ status: 'FAIL', error: error.message }, null, 2));
  process.exit(1);
});
