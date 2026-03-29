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

// ─── CORS ─────────────────────────────────────────────────────────────────────

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

  console.warn('[ai-decision-engine] CORS blocked origin:', requestOrigin);
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

// ─── Constants ───────────────────────────────────────────────────────────────

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
      description: 'Daily coaching headline — one clear message.',
      properties: {
        title: { type: 'string', description: 'Short headline (max 8 words)' },
        body: { type: 'string', description: 'One sentence coaching insight (max 20 words)' },
        reason: { type: 'string', description: 'Why this is the focus today (max 15 words)' },
        focus: { type: 'string', enum: ['nutrition', 'training', 'recovery', 'consistency', 'measurement'] },
        tone: { type: 'string', enum: ['confident', 'encouraging', 'warning', 'neutral'] },
      },
      required: ['title', 'body', 'reason', 'focus', 'tone'],
    },
    priorities: {
      type: 'array',
      description: 'Top 1-3 actions the user should do next, in priority order.',
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['nutrition', 'workout', 'recovery', 'protocol', 'body', 'lab'] },
          title: { type: 'string', description: 'What to do (max 8 words)' },
          reason: { type: 'string', description: 'Why this matters (max 15 words)' },
          action: { type: 'string', description: 'Client action key (e.g. open_quick_meal, start_workout, log_dose, log_weight)' },
        },
        required: ['type', 'title', 'reason', 'action'],
      },
    },
    train: {
      type: 'object',
      description: 'Training surface guidance.',
      properties: {
        status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'rest_day'] },
        message: { type: 'string', description: 'One-liner for training page (max 15 words)' },
        adjustment: { type: 'string', description: 'Optional intensity/volume adjustment suggestion (max 20 words). Empty string if none.' },
      },
      required: ['status', 'message', 'adjustment'],
    },
    nutrition: {
      type: 'object',
      description: 'Nutrition surface guidance.',
      properties: {
        status: { type: 'string', enum: ['on_track', 'behind_calories', 'behind_protein', 'over_calories', 'not_started'] },
        nextMeal: { type: 'string', description: 'Suggested next meal (max 20 words). Empty string if not applicable.' },
        macroFocus: { type: 'string', description: 'Which macro to prioritize (max 10 words). Empty string if balanced.' },
      },
      required: ['status', 'nextMeal', 'macroFocus'],
    },
    protocols: {
      type: 'object',
      description: 'Protocol/supplement surface guidance.',
      properties: {
        status: { type: 'string', enum: ['all_done', 'pending', 'missed', 'no_protocols'] },
        message: { type: 'string', description: 'Protocol coaching message (max 15 words)' },
        adherenceNote: { type: 'string', description: 'Pattern-based adherence insight (max 20 words). Empty string if none.' },
      },
      required: ['status', 'message', 'adherenceNote'],
    },
    progress: {
      type: 'object',
      description: 'Progress/trends interpretation.',
      properties: {
        headline: { type: 'string', description: 'Trend summary (max 15 words)' },
        interpretation: { type: 'string', description: 'What the data means (max 25 words)' },
        action: { type: 'string', description: 'What to do about it (max 15 words)' },
      },
      required: ['headline', 'interpretation', 'action'],
    },
    recommendations: {
      type: 'array',
      description: 'Max 3 tracked recommendations. Usually 1-2.',
      maxItems: MAX_RECOMMENDATIONS,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['nutrition', 'workout', 'recovery', 'habit', 'protocol', 'lab', 'body'] },
          title: { type: 'string', description: 'Recommendation headline (max 8 words)' },
          reason: { type: 'string', description: 'Why this recommendation (max 15 words)' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          action: { type: 'string', description: 'Client action key' },
          actionPath: { type: 'string', description: 'App path string' },
          actionLabel: { type: 'string', description: 'Button label (max 3 words)' },
        },
        required: ['id', 'type', 'title', 'reason', 'confidence'],
      },
    },
  },
  required: ['briefing', 'priorities', 'train', 'nutrition', 'protocols', 'progress', 'recommendations'],
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

## Protocols / Supplements
- Active compounds: ${ctx.today.active_compounds?.length > 0 ? ctx.today.active_compounds.join(', ') : 'none'}
- Doses due today: ${ctx.today.protocols_due ?? 0}
- Doses completed today: ${ctx.today.protocols_completed ?? 0}

## Your Job
You are the brain behind ALL screens in this app. Generate output for:
1. **briefing** — one clear daily message for the Today screen
2. **priorities** — top 1-3 actions the user should do next (sorted by urgency)
3. **train** — guidance for the training page (status + optional adjustment)
4. **nutrition** — guidance for the nutrition page (next meal suggestion + macro focus)
5. **protocols** — guidance for the protocols page (status + adherence insight)
6. **progress** — trend interpretation for the progress page
7. **recommendations** — max 3 tracked suggestions with confidence scores

## Constraints
${avoidTypes}
${avoidLastRecs}
- Priorities: what the user should do RIGHT NOW, in 1-3 steps. Action keys must be one of: open_quick_meal, start_workout, log_dose, log_weight, open_water_sheet, open_nutrition, open_progress, rest.
- Recommendations: confidence ≥ ${CONFIDENCE_THRESHOLD}. Usually 1-2, max ${MAX_RECOMMENDATIONS}. Fewer is better.
- Eliminate contradictions: if workout is done, do NOT suggest starting one. If nutrition is on track, do NOT push meals.
- All text is for a mobile UI. Brevity is critical.
- IDs must be short unique slugs (e.g., "rec_protein_dinner", "pri_log_dose").
- Empty strings for optional fields that don't apply (adjustment, nextMeal, macroFocus, adherenceNote, etc.)

Respond ONLY with the JSON object matching the provided schema.`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeJson(corsHeaders: Record<string, string>) {
  return function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };
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
  const corsHeaders = getCorsHeaders(req);
  const json = makeJson(corsHeaders);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
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
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return json({ error: 'Unauthorized', detail: authError?.message }, 401);
  }

  const userId = user.id;
  const today = todayDateString();

  // ── 2. Kill switch + global spending caps ─────────────────────────────────

  const { data: config } = await supabase
    .from('ai_spending_config')
    .select('kill_switch, monthly_cap_usd, daily_cap_usd')
    .eq('id', 1)
    .single();

  if (!config) {
    console.error('[ai-decision-engine] ai_spending_config not found');
    return json({ error: 'Service configuration error' }, 503);
  }

  if (config.kill_switch) {
    return json({
      error: 'AI coaching is temporarily unavailable. Please try again later.',
      code: 'KILL_SWITCH',
    }, 503);
  }

  const { data: monthlySpend } = await supabase.rpc('get_ai_spend_current_month');
  if (typeof monthlySpend === 'number' && monthlySpend >= config.monthly_cap_usd) {
    console.error(`[ai-decision-engine] Monthly cap reached: $${monthlySpend}`);
    return json({
      error: 'AI coaching has reached its monthly limit.',
      code: 'MONTHLY_CAP',
    }, 429);
  }

  const { data: dailySpend } = await supabase.rpc('get_ai_spend_today');
  if (typeof dailySpend === 'number' && dailySpend >= config.daily_cap_usd) {
    console.error(`[ai-decision-engine] Daily cap reached: $${dailySpend}`);
    return json({
      error: 'AI coaching has reached its daily limit.',
      code: 'DAILY_CAP',
    }, 429);
  }

  // ── 3. Check cache — return if fresh daily_context exists ─────────────────

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

  // ── 4. Load user context ──────────────────────────────────────────────────

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
    activeProtocolsRes,
    todayProtocolLogsRes,
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

    // Active protocols
    supabase
      .from('protocols')
      .select('id, compound, name, frequency_per_week, active, start_date')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(20),

    // Today's protocol logs
    supabase
      .from('protocol_logs')
      .select('protocol_id, taken_at')
      .eq('user_id', userId)
      .gte('taken_at', todayStart)
      .lte('taken_at', todayEnd)
      .limit(50),
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

  // Protocol data
  const activeProtocols = activeProtocolsRes.data ?? [];
  const todayProtocolLogs = todayProtocolLogsRes.data ?? [];
  const protocolLoggedIds = new Set(todayProtocolLogs.map((l: any) => l.protocol_id));
  const protocolsDueToday = activeProtocols.length;
  const protocolsCompletedToday = activeProtocols.filter((p: any) => protocolLoggedIds.has(p.id)).length;

  const ctx: EngineContext = {
    profile,
    today: {
      date: today,
      day_of_week: getDayOfWeek(today),
      nutrition: todayNutrition,
      has_active_workout_plan: (activePlanRes.data ?? []).length > 0,
      workout_logged_today: (todayWorkoutRes.data ?? []).length > 0,
      protocols_due: protocolsDueToday,
      protocols_completed: protocolsCompletedToday,
      active_compounds: activeProtocols.map((p: any) => p.compound || p.name).filter(Boolean).slice(0, 5),
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
