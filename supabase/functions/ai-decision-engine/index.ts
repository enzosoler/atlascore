/**
 * ai-decision-engine — Supabase Edge Function
 *
 * Central AI coaching layer. Called by the Today page to generate:
 *   - briefing: personalized daily context card
 *   - alerts: time-sensitive nudges (missed meal, skipped workout, etc.)
 *   - recommendations: high-confidence action suggestions
 *
 * Architecture:
 *   1. Check ai_recommendations for non-expired daily_context → return cached
 *   2. Load compact user context from all behavior tables
 *   3. Call OpenAI with structured output schema
 *   4. Store result as daily_context row (TTL = 4h)
 *   5. Upsert user_ai_state with updated adherence + rec history
 *   6. Return structured JSON
 *
 * Model: gpt-4.1-mini (capable + cheap for coaching output)
 *
 * Deploy:
 *   supabase functions deploy ai-decision-engine
 *
 * Required secrets:
 *   supabase secrets set OPENAI_API_KEY=xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Constants ───────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'gpt-4.1-mini';
const ENGINE_VERSION = '1.0';
const TTL_SECONDS = 4 * 60 * 60; // 4 hours

const CONFIDENCE_THRESHOLD = 0.6;
const MAX_RECOMMENDATIONS = 3;
const MAX_ALERTS = 3;

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  full_name: string | null;
  age: number | null;
  sex: string | null;
  current_weight: number | null;
  height_cm: number | null;
  training_goal: string | null;
  activity_level: string | null;
  food_preferences: string | null;
  protein_target: number | null;
  calories_target: number | null;
}

interface TodayNutrition {
  total_kcal: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
  last_logged_at: string | null;
}

interface RecentWorkout {
  logged_at: string;
  workout_name: string | null;
  duration_min: number | null;
}

interface LatestMeasurement {
  recorded_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
}

interface RecOutcome {
  rec_type: string;
  status: string;
  created_at: string;
}

interface UserAIState {
  profile_summary: string | null;
  adherence_patterns: { nutrition: number; workouts: number; measurements: number };
  feedback_signals: { followed: number; dismissed: number; ignored: number };
  last_recommendation_ids: string[];
}

interface EngineContext {
  profile: UserProfile;
  today: {
    date: string;
    day_of_week: string;
    nutrition: TodayNutrition;
    has_active_workout_plan: boolean;
    workout_logged_today: boolean;
  };
  week: {
    workout_count: number;
    avg_kcal: number;
    avg_protein: number;
  };
  measurements: LatestMeasurement[];
  ai_state: UserAIState;
  recent_dismissed: string[];  // rec types dismissed in last 7 days
}

// ─── JSON Output Schema ───────────────────────────────────────────────────────

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    briefing: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short headline (max 8 words)' },
        body: { type: 'string', description: 'One sentence coaching insight (max 20 words)' },
        reason: { type: 'string', description: 'Why this is the focus today (max 15 words)' },
        focus: {
          type: 'string',
          enum: ['nutrition', 'training', 'recovery', 'consistency', 'measurement'],
        },
      },
      required: ['title', 'body', 'reason', 'focus'],
    },
    alerts: {
      type: 'array',
      maxItems: MAX_ALERTS,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: ['nutrition_gap', 'workout_missed', 'streak_at_risk', 'check_in_due', 'protein_low'],
          },
          title: { type: 'string', description: 'Alert headline (max 6 words)' },
          message: { type: 'string', description: 'Alert body (max 15 words)' },
          action: { type: 'string', description: 'Action key for client routing' },
          path: { type: 'string', description: 'App path string, e.g. /nutrition' },
          cta: { type: 'string', description: 'Button label (max 3 words)' },
        },
        required: ['id', 'type', 'title', 'message'],
      },
    },
    recommendations: {
      type: 'array',
      maxItems: MAX_RECOMMENDATIONS,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: ['nutrition', 'workout', 'recovery', 'habit'],
          },
          title: { type: 'string', description: 'Recommendation headline (max 8 words)' },
          reason: { type: 'string', description: 'Why this recommendation (max 15 words)' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          action: { type: 'string', description: 'Action key for client routing' },
          actionPath: { type: 'string', description: 'App path string' },
          actionLabel: { type: 'string', description: 'Button label (max 3 words)' },
        },
        required: ['id', 'type', 'title', 'reason', 'confidence'],
      },
    },
  },
  required: ['briefing', 'alerts', 'recommendations'],
};

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: EngineContext): string {
  const { profile, today, week, measurements, ai_state, recent_dismissed } = ctx;

  const latestWeight = measurements[0]?.weight_kg ?? profile.current_weight;
  const weightDelta = measurements.length >= 2
    ? ((measurements[0]?.weight_kg ?? 0) - (measurements[1]?.weight_kg ?? 0)).toFixed(1)
    : null;

  const calorieTarget = profile.calories_target ?? 2000;
  const proteinTarget = profile.protein_target ?? 150;
  const calorieRemaining = calorieTarget - today.nutrition.total_kcal;
  const proteinRemaining = proteinTarget - today.nutrition.total_protein;

  const adherence = ai_state.adherence_patterns;
  const feedback = ai_state.feedback_signals;
  const totalFeedback = feedback.followed + feedback.dismissed + feedback.ignored;
  const responsiveness = totalFeedback > 0
    ? `${Math.round((feedback.followed / totalFeedback) * 100)}% follow-through on past suggestions`
    : 'no prior recommendation history';

  const avoidTypes = recent_dismissed.length > 0
    ? `Avoid repeating these recently dismissed recommendation types: ${recent_dismissed.join(', ')}.`
    : '';

  const avoidLastRecs = ai_state.last_recommendation_ids.length > 0
    ? `Last 5 recommendation types shown: ${ai_state.last_recommendation_ids.join(', ')}. Vary the type distribution.`
    : '';

  return `You are Atlas Coach, an AI coaching assistant embedded in a fitness tracking app.

Your job is to generate a personalized daily coaching output for the user. Be concise, direct, and data-driven. Never use filler phrases like "Great job!" or "Keep it up!". Only say things grounded in the user's actual data.

## User Profile
- Name: ${profile.full_name ?? 'User'}
- Goal: ${profile.training_goal ?? 'general fitness'}
- Current weight: ${latestWeight ? `${latestWeight}kg` : 'unknown'}${weightDelta ? ` (${Number(weightDelta) > 0 ? '+' : ''}${weightDelta}kg vs prior)` : ''}
- Calorie target: ${calorieTarget} kcal/day
- Protein target: ${proteinTarget}g/day
- Activity level: ${profile.activity_level ?? 'unknown'}

## Today (${today.date}, ${today.day_of_week})
- Calories logged: ${today.nutrition.total_kcal} kcal (${calorieRemaining > 0 ? calorieRemaining + ' remaining' : Math.abs(calorieRemaining) + ' over target'})
- Protein logged: ${today.nutrition.total_protein}g (${proteinRemaining > 0 ? proteinRemaining + 'g remaining' : Math.abs(proteinRemaining) + 'g over target'})
- Meals logged: ${today.nutrition.meal_count}
- Last food log: ${today.nutrition.last_logged_at ? new Date(today.nutrition.last_logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'none today'}
- Workout logged today: ${today.workout_logged_today ? 'yes' : 'no'}
- Active workout plan: ${today.has_active_workout_plan ? 'yes' : 'no'}

## This Week
- Workouts completed: ${week.workout_count}
- Average daily kcal: ${Math.round(week.avg_kcal)}
- Average daily protein: ${Math.round(week.avg_protein)}g

## 7-Day Adherence (0 = none, 1 = perfect)
- Nutrition logging: ${adherence.nutrition.toFixed(2)}
- Workout logging: ${adherence.workouts.toFixed(2)}
- Measurements: ${adherence.measurements.toFixed(2)}

## User Responsiveness
- ${responsiveness}

## Instruction Constraints
${avoidTypes}
${avoidLastRecs}
- Only emit alerts that are genuinely time-sensitive today.
- Only emit recommendations with confidence ≥ ${CONFIDENCE_THRESHOLD}.
- Maximum ${MAX_RECOMMENDATIONS} recommendations. Fewer is better if confidence is low.
- Keep all text extremely brief. This is a mobile UI — brevity is critical.
- IDs must be short unique slugs (e.g., "rec_protein_dinner", "alert_no_lunch").

Respond ONLY with the JSON object matching the provided schema. No markdown, no explanation.`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function getDayOfWeek(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateStr).getDay()];
}

function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Authenticate ───────────────────────────────────────────────────────

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return json({ error: 'Unauthorized', detail: authError?.message }, 401);
  }

  const userId = user.id;
  const today = todayDateString();

  // ── 2. Check cache — return if fresh daily_context exists ─────────────────

  const { data: cached } = await supabase
    .from('ai_recommendations')
    .select('recommendation, created_at, expires_at')
    .eq('user_id', userId)
    .eq('type', 'daily_context')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (cached) {
    console.log(`[ai-decision-engine] Cache hit for user ${userId}`);
    return json({
      ...cached.recommendation,
      meta: {
        source: 'cache',
        generated_at: cached.created_at,
        expires_at: cached.expires_at,
        engine_version: ENGINE_VERSION,
        ttl_seconds: TTL_SECONDS,
      },
    });
  }

  // ── 3. Load user context ──────────────────────────────────────────────────

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const [
    profileRes,
    todayNutritionRes,
    todayWorkoutRes,
    weekWorkoutsRes,
    weekNutritionRes,
    measurementsRes,
    activePlanRes,
    aiStateRes,
    recentOutcomesRes,
  ] = await Promise.all([
    // Profile
    supabase
      .from('profiles')
      .select('full_name, age, sex, current_weight, height_cm, training_goal, activity_level, food_preferences, protein_target, calories_target')
      .eq('id', userId)
      .single(),

    // Today's food logs (aggregated)
    supabase
      .from('food_logs')
      .select('calories, protein, carbs, fat, date')
      .eq('user_id', userId)
      .gte('date', todayStart)
      .lte('date', todayEnd),

    // Workout logged today
    supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('date', todayStart)
      .lte('date', todayEnd)
      .limit(1),

    // Workouts this week
    supabase
      .from('workout_logs')
      .select('date, workout_name, duration_min')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: false }),

    // Nutrition this week (for averages)
    supabase
      .from('food_logs')
      .select('calories, protein, date')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo),

    // Last 5 measurements
    supabase
      .from('measurements')
      .select('date, weight, body_fat')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5),

    // Active workout plan
    supabase
      .from('workout_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(1),

    // user_ai_state
    supabase
      .from('user_ai_state')
      .select('profile_summary, adherence_patterns, feedback_signals, last_recommendation_ids')
      .eq('user_id', userId)
      .single(),

    // Recent rec outcomes (last 7 days) for learning loop
    supabase
      .from('ai_recommendations')
      .select('recommendation, status, created_at')
      .eq('user_id', userId)
      .eq('type', 'rec_outcome')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // ── 4. Build compact context object ──────────────────────────────────────

  const profile: UserProfile = profileRes.data ?? {
    full_name: null, age: null, sex: null, current_weight: null,
    height_cm: null, training_goal: null, activity_level: null,
    food_preferences: null, protein_target: null, calories_target: null,
  };

  // Aggregate today's nutrition
  const todayFoodLogs = todayNutritionRes.data ?? [];
  const todayNutrition: TodayNutrition = {
    total_kcal: todayFoodLogs.reduce((s: number, r: any) => s + (r.calories ?? 0), 0),
    total_protein: todayFoodLogs.reduce((s: number, r: any) => s + (r.protein ?? 0), 0),
    total_carbs: todayFoodLogs.reduce((s: number, r: any) => s + (r.carbs ?? 0), 0),
    total_fat: todayFoodLogs.reduce((s: number, r: any) => s + (r.fat ?? 0), 0),
    meal_count: todayFoodLogs.length,
    last_logged_at: todayFoodLogs.length > 0
      ? todayFoodLogs.sort((a: any, b: any) => (b.date ?? '').localeCompare(a.date ?? ''))[0].date
      : null,
  };

  // Week averages
  const weekFoodLogs = weekNutritionRes.data ?? [];
  const uniqueDaysWithFood = new Set(weekFoodLogs.map((r: any) => r.date?.split('T')[0])).size;
  const week = {
    workout_count: (weekWorkoutsRes.data ?? []).length,
    avg_kcal: uniqueDaysWithFood > 0
      ? weekFoodLogs.reduce((s: number, r: any) => s + (r.calories ?? 0), 0) / uniqueDaysWithFood
      : 0,
    avg_protein: uniqueDaysWithFood > 0
      ? weekFoodLogs.reduce((s: number, r: any) => s + (r.protein ?? 0), 0) / uniqueDaysWithFood
      : 0,
  };

  // Measurements
  const measurements: LatestMeasurement[] = (measurementsRes.data ?? []).map((m: any) => ({
    recorded_at: m.date,
    weight_kg: m.weight,
    body_fat_pct: m.body_fat,
  }));

  // Compute adherence (7-day window)
  const daysWithFood = new Set(weekFoodLogs.map((r: any) => r.date?.split('T')[0])).size;
  const daysWithWorkout = new Set((weekWorkoutsRes.data ?? []).map((r: any) => r.date?.split('T')[0])).size;
  const daysWithMeasurement = measurements.filter((m) => {
    const d = new Date(m.recorded_at);
    return d >= new Date(sevenDaysAgo);
  }).length;

  const computedAdherence = {
    nutrition: Math.min(1, daysWithFood / 7),
    workouts: Math.min(1, daysWithWorkout / 7),
    measurements: Math.min(1, daysWithMeasurement / 7),
  };

  // AI state (fallback to defaults if missing)
  const rawAiState = aiStateRes.data;
  const aiState: UserAIState = {
    profile_summary: rawAiState?.profile_summary ?? null,
    adherence_patterns: rawAiState?.adherence_patterns ?? computedAdherence,
    feedback_signals: rawAiState?.feedback_signals ?? { followed: 0, dismissed: 0, ignored: 0 },
    last_recommendation_ids: rawAiState?.last_recommendation_ids ?? [],
  };

  // Dismissed rec types in last 7 days
  const recentOutcomes: RecOutcome[] = (recentOutcomesRes.data ?? []).map((r: any) => ({
    rec_type: r.recommendation?.type ?? 'unknown',
    status: r.status,
    created_at: r.created_at,
  }));
  const recentDismissed = [...new Set(
    recentOutcomes.filter((o) => o.status === 'dismissed').map((o) => o.rec_type)
  )];

  const ctx: EngineContext = {
    profile,
    today: {
      date: today,
      day_of_week: getDayOfWeek(today),
      nutrition: todayNutrition,
      has_active_workout_plan: (activePlanRes.data ?? []).length > 0,
      workout_logged_today: (todayWorkoutRes.data ?? []).length > 0,
    },
    week,
    measurements,
    ai_state: aiState,
    recent_dismissed: recentDismissed,
  };

  // Context snapshot (stored with row, never sent to model)
  const contextSnapshot = {
    today_kcal: todayNutrition.total_kcal,
    today_protein: todayNutrition.total_protein,
    meal_count: todayNutrition.meal_count,
    workout_logged_today: ctx.today.workout_logged_today,
    week_workouts: week.workout_count,
    adherence: computedAdherence,
    measurements_count: measurements.length,
    dismissed_types: recentDismissed,
  };

  // ── 5. Call OpenAI ────────────────────────────────────────────────────────

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return json({ error: 'AI service not configured' }, 503);
  }

  let engineOutput: any;
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: buildSystemPrompt(ctx) },
          { role: 'user', content: 'Generate my coaching output for today.' },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'coaching_output',
            strict: true,
            schema: OUTPUT_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ai-decision-engine] OpenAI error ${response.status}:`, errText);
      return json({ error: 'AI service error. Please try again.', code: 'AI_ERROR' }, 502);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    inputTokens = data.usage?.prompt_tokens ?? 0;
    outputTokens = data.usage?.completion_tokens ?? 0;

    try {
      engineOutput = JSON.parse(content);
    } catch {
      console.error('[ai-decision-engine] Failed to parse AI response:', content);
      return json({ error: 'AI returned invalid format', code: 'PARSE_ERROR' }, 502);
    }
  } catch (err) {
    console.error('[ai-decision-engine] Fetch error:', err);
    return json({ error: 'AI service unavailable' }, 503);
  }

  // ── 6. Filter low-confidence recommendations ──────────────────────────────

  if (engineOutput.recommendations) {
    engineOutput.recommendations = engineOutput.recommendations.filter(
      (r: any) => (r.confidence ?? 0) >= CONFIDENCE_THRESHOLD
    );
  }

  // ── 7. Store as daily_context row ─────────────────────────────────────────

  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();

  await supabase.from('ai_recommendations').insert({
    user_id: userId,
    type: 'daily_context',
    recommendation: engineOutput,
    context_snapshot: contextSnapshot,
    status: 'pending',
    engine_version: ENGINE_VERSION,
    expires_at: expiresAt,
  });

  // ── 8. Upsert user_ai_state ───────────────────────────────────────────────

  // Update adherence with exponential moving average (alpha = 0.3)
  const alpha = 0.3;
  const prevAdherence = aiState.adherence_patterns;
  const updatedAdherence = {
    nutrition: parseFloat((alpha * computedAdherence.nutrition + (1 - alpha) * prevAdherence.nutrition).toFixed(3)),
    workouts: parseFloat((alpha * computedAdherence.workouts + (1 - alpha) * prevAdherence.workouts).toFixed(3)),
    measurements: parseFloat((alpha * computedAdherence.measurements + (1 - alpha) * prevAdherence.measurements).toFixed(3)),
  };

  // Track last 5 rec types
  const newRecTypes = (engineOutput.recommendations ?? []).map((r: any) => r.type);
  const updatedLastRecs = [...newRecTypes, ...aiState.last_recommendation_ids].slice(0, 5);

  await supabase.from('user_ai_state').upsert({
    user_id: userId,
    adherence_patterns: updatedAdherence,
    feedback_signals: aiState.feedback_signals,
    last_recommendation_ids: updatedLastRecs,
    last_updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  // ── 9. Log usage ──────────────────────────────────────────────────────────

  supabase.from('ai_usage_log').insert({
    user_id: userId,
    feature: 'coaching_engine',
    model: MODEL,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost: (inputTokens / 1_000_000) * 0.15 + (outputTokens / 1_000_000) * 0.60,
    cache_hit: false,
    success: true,
  }).then(() => {});

  // ── 10. Return ────────────────────────────────────────────────────────────

  return json({
    ...engineOutput,
    meta: {
      source: 'engine',
      generated_at: new Date().toISOString(),
      expires_at: expiresAt,
      engine_version: ENGINE_VERSION,
      ttl_seconds: TTL_SECONDS,
    },
  });
});
