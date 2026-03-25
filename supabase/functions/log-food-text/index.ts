/**
 * log-food-text — Supabase Edge Function
 *
 * AI-powered natural language food logging with:
 *  - Semantic cache lookup (shared across all users)
 *  - Tier-based rate limiting (free / pro / premium)
 *  - Global daily + monthly spending caps
 *  - Emergency kill switch
 *  - Full audit trail
 *
 * Model: gpt-4.1-nano (cheapest capable model)
 *
 * Deploy:
 *   supabase functions deploy log-food-text
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

const MODEL = 'gpt-4.1-nano';

// Pricing per 1M tokens (USD) — update if OpenAI changes pricing
const PRICING = {
  input_per_million: 0.10,
  output_per_million: 0.40,
};

const SYSTEM_PROMPT = `You are a nutrition estimation assistant. The user will describe a meal or food item in any language. Your job is to:

1. Identify all food items in the description.
2. Estimate realistic portion sizes based on context clues.
3. Return the TOTAL macronutrient breakdown for the entire described meal.

Rules:
- If the user mentions a preparation method (e.g., "com manteiga no preparo"), factor that into the macros.
- If no portion is specified, assume a typical single adult serving.
- Be conservative with estimates — it's better to slightly underestimate than wildly overestimate.
- Always respond in the SAME LANGUAGE as the user's input.

Respond ONLY with valid JSON in this exact format:
{
  "food_name": "short name for the meal in the user's language",
  "serving_description": "estimated portion description in the user's language",
  "calories": 0,
  "protein": 0.0,
  "carbs": 0.0,
  "fat": 0.0,
  "fiber": 0.0,
  "confidence": 0.0,
  "items": [
    {
      "name": "individual item name",
      "estimated_grams": 0,
      "calories": 0,
      "protein": 0.0,
      "carbs": 0.0,
      "fat": 0.0
    }
  ]
}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Normalize a food query for cache lookup.
 * - Lowercase
 * - Collapse whitespace
 * - Remove common filler words (Portuguese + English)
 * - Trim
 */
function normalizeQuery(raw: string): string {
  const fillers = [
    // Portuguese fillers
    'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
    'no', 'na', 'nos', 'nas', 'com', 'sem', 'para', 'por',
    'pouco', 'um pouco', 'bastante', 'muito', 'muita',
    'preparo', 'preparação',
    // English fillers
    'a', 'an', 'the', 'of', 'with', 'some', 'little', 'bit',
    'in', 'on', 'for', 'and',
  ];

  let normalized = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Keep letters + numbers, replace rest with space
    .replace(/\s+/g, ' ')
    .trim();

  // Remove filler words (only whole words)
  for (const filler of fillers) {
    normalized = normalized.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '');
  }

  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Estimate cost in USD from token counts.
 */
function estimateCost(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * PRICING.input_per_million +
    (outputTokens / 1_000_000) * PRICING.output_per_million
  );
}

// ─── Main Handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Authenticate ──────────────────────────────────────────────────────

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  // Service-role client — used for all DB operations (bypasses RLS).
  // Also used to verify the user's JWT token via auth.getUser().
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('[log-food-text] Auth failed:', authError?.message);
    return json({ error: 'Unauthorized', detail: authError?.message }, 401);
  }

  // ── 2. Parse request ─────────────────────────────────────────────────────

  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const rawQuery = String(body.query || '').trim();
  if (rawQuery.length < 3) {
    return json({ error: 'Query too short (minimum 3 characters)' }, 400);
  }
  if (rawQuery.length > 500) {
    return json({ error: 'Query too long (maximum 500 characters)' }, 400);
  }

  const normalizedQuery = normalizeQuery(rawQuery);

  // ── 3. Cache lookup ──────────────────────────────────────────────────────

  const { data: cacheHit } = await supabase
    .from('food_nutrition_cache')
    .select('*')
    .eq('normalized_query', normalizedQuery)
    .single();

  if (cacheHit) {
    // Increment hit count asynchronously (fire-and-forget)
    supabase.rpc('increment_cache_hit', { p_cache_id: cacheHit.id }).then(() => {});

    // Log as cache hit (no cost)
    supabase.from('ai_usage_log').insert({
      user_id: user.id,
      feature: 'food_text',
      model: MODEL,
      input_tokens: 0,
      output_tokens: 0,
      estimated_cost: 0,
      cache_hit: true,
      input_preview: rawQuery.substring(0, 500),
      success: true,
    }).then(() => {});

    return json({
      success: true,
      source: 'cache',
      food_name: cacheHit.original_query,
      serving_description: cacheHit.serving_description,
      calories: cacheHit.calories,
      protein: cacheHit.protein,
      carbs: cacheHit.carbs,
      fat: cacheHit.fat,
      fiber: cacheHit.fiber,
      confidence: cacheHit.confidence,
    });
  }

  // ── 4. Check kill switch + global spending caps ──────────────────────────

  const { data: config } = await supabase
    .from('ai_spending_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (!config) {
    console.error('[log-food-text] ai_spending_config not found');
    return json({ error: 'Service configuration error' }, 503);
  }

  // Kill switch
  if (config.kill_switch) {
    return json({
      error: 'AI nutrition analysis is temporarily unavailable. Please try again later.',
      code: 'KILL_SWITCH',
    }, 503);
  }

  // Monthly cap
  const { data: monthlySpend } = await supabase.rpc('get_ai_spend_current_month');
  if (typeof monthlySpend === 'number' && monthlySpend >= config.monthly_cap_usd) {
    console.error(`[log-food-text] Monthly cap reached: $${monthlySpend} >= $${config.monthly_cap_usd}`);
    return json({
      error: 'AI nutrition analysis has reached its monthly limit. Please try again next month or use the food search feature.',
      code: 'MONTHLY_CAP',
    }, 429);
  }

  // Daily cap
  const { data: dailySpend } = await supabase.rpc('get_ai_spend_today');
  if (typeof dailySpend === 'number' && dailySpend >= config.daily_cap_usd) {
    console.error(`[log-food-text] Daily cap reached: $${dailySpend} >= $${config.daily_cap_usd}`);
    return json({
      error: 'AI nutrition analysis has reached its daily limit. Please try again tomorrow or use the food search feature.',
      code: 'DAILY_CAP',
    }, 429);
  }

  // ── 5. Check user tier + per-user rate limits ────────────────────────────

  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'granted'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const tier = subscription?.tier || 'free';

  // Determine the user's daily text call limit based on tier
  let maxTextCallsPerDay: number;
  switch (tier) {
    case 'premium':
      maxTextCallsPerDay = config.premium_text_calls_per_day;
      break;
    case 'pro':
      maxTextCallsPerDay = config.pro_text_calls_per_day;
      break;
    default:
      maxTextCallsPerDay = config.free_text_calls_per_day;
  }

  // Get or create user's quota record
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let { data: quota } = await supabase
    .from('ai_usage_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!quota) {
    // First time user — create quota record
    const { data: newQuota } = await supabase
      .from('ai_usage_quotas')
      .insert({ user_id: user.id, quota_date: today })
      .select()
      .single();
    quota = newQuota;
  } else if (quota.quota_date !== today) {
    // New day — reset daily counters
    const { data: resetQuota } = await supabase
      .from('ai_usage_quotas')
      .update({
        text_calls_today: 0,
        photo_calls_today: 0,
        quota_date: today,
      })
      .eq('user_id', user.id)
      .select()
      .single();
    quota = resetQuota;
  }

  if (quota && quota.text_calls_today >= maxTextCallsPerDay) {
    const upgradeHint = tier === 'free'
      ? ' Upgrade to Pro or Premium for more daily analyses.'
      : '';
    return json({
      error: `You've reached your daily limit of ${maxTextCallsPerDay} AI food analyses.${upgradeHint}`,
      code: 'USER_DAILY_LIMIT',
      limit: maxTextCallsPerDay,
      used: quota.text_calls_today,
    }, 429);
  }

  // ── 6. Call AI ───────────────────────────────────────────────────────────

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return json({ error: 'AI service not configured' }, 503);
  }

  let aiResult: any;
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
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: rawQuery },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[log-food-text] OpenAI error: ${response.status}`, errText);

      // Log the failed attempt
      await supabase.from('ai_usage_log').insert({
        user_id: user.id,
        feature: 'food_text',
        model: MODEL,
        input_tokens: 0,
        output_tokens: 0,
        estimated_cost: 0,
        cache_hit: false,
        input_preview: rawQuery.substring(0, 500),
        success: false,
        error_message: `OpenAI ${response.status}`,
      });

      return json({ error: 'AI analysis failed. Please try again.' }, 502);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    inputTokens = data.usage?.prompt_tokens ?? 0;
    outputTokens = data.usage?.completion_tokens ?? 0;

    try {
      aiResult = JSON.parse(content);
    } catch {
      console.error('[log-food-text] Failed to parse AI response:', content);
      return json({ error: 'AI returned invalid data. Please try again.' }, 502);
    }
  } catch (err) {
    console.error('[log-food-text] Fetch error:', err);
    return json({ error: 'AI service unavailable. Please try again.' }, 503);
  }

  // ── 7. Calculate cost & log usage ────────────────────────────────────────

  const cost = estimateCost(inputTokens, outputTokens);

  // Log the AI call
  await supabase.from('ai_usage_log').insert({
    user_id: user.id,
    feature: 'food_text',
    model: MODEL,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost: cost,
    cache_hit: false,
    input_preview: rawQuery.substring(0, 500),
    success: true,
  });

  // Increment user's daily + lifetime counters
  await supabase
    .from('ai_usage_quotas')
    .update({
      text_calls_today: (quota?.text_calls_today ?? 0) + 1,
      text_calls_lifetime: (quota?.text_calls_lifetime ?? 0) + 1,
    })
    .eq('user_id', user.id);

  // ── 8. Store in cache ────────────────────────────────────────────────────

  const cacheEntry = {
    normalized_query: normalizedQuery,
    original_query: rawQuery,
    calories: Math.round(aiResult.calories ?? 0),
    protein: Math.round((aiResult.protein ?? 0) * 10) / 10,
    carbs: Math.round((aiResult.carbs ?? 0) * 10) / 10,
    fat: Math.round((aiResult.fat ?? 0) * 10) / 10,
    fiber: Math.round((aiResult.fiber ?? 0) * 10) / 10,
    serving_description: aiResult.serving_description || null,
    model_used: MODEL,
    confidence: Math.max(0, Math.min(1, aiResult.confidence ?? 0.8)),
  };

  // Upsert to handle race conditions (two users querying the same food simultaneously)
  await supabase
    .from('food_nutrition_cache')
    .upsert(cacheEntry, { onConflict: 'normalized_query' });

  // ── 9. Return result ─────────────────────────────────────────────────────

  return json({
    success: true,
    source: 'ai',
    food_name: aiResult.food_name || rawQuery,
    serving_description: aiResult.serving_description,
    calories: cacheEntry.calories,
    protein: cacheEntry.protein,
    carbs: cacheEntry.carbs,
    fat: cacheEntry.fat,
    fiber: cacheEntry.fiber,
    confidence: cacheEntry.confidence,
    items: aiResult.items || [],
    usage: {
      calls_today: (quota?.text_calls_today ?? 0) + 1,
      daily_limit: maxTextCallsPerDay,
    },
  });
});
