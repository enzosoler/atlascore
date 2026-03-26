/**
 * food-vision — Supabase Edge Function (v2 with cost protection)
 *
 * Analyzes food images using Google Gemini 2.0 Flash Vision API.
 * Returns detected foods with estimated macros and portions.
 *
 * PREMIUM FEATURE — requires active pro/premium subscription.
 *
 * Cost protection:
 *  - Tier-based access (premium only)
 *  - Per-user daily rate limits
 *  - Global daily + monthly spending caps
 *  - Emergency kill switch
 *  - Full audit trail
 *
 * Deploy:
 *   supabase functions deploy food-vision
 *
 * Required secrets:
 *   supabase secrets set GEMINI_API_KEY=xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Constants ───────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const MODEL_NAME = 'gemini-2.0-flash';

// Gemini 2.0 Flash pricing per 1M tokens (USD) — approximate
const PRICING = {
  input_per_million: 0.10,
  output_per_million: 0.40,
};

// Approximate token count for a typical image (varies by resolution)
const ESTIMATED_IMAGE_INPUT_TOKENS = 1000;

interface DetectedFood {
  name: string;
  estimatedAmount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * PRICING.input_per_million +
    (outputTokens / 1_000_000) * PRICING.output_per_million
  );
}

// ─── Gemini Vision Call ──────────────────────────────────────────────────────

async function analyzeFoodWithGemini(base64Image: string, mimeType: string): Promise<{ foods: DetectedFood[]; outputTokens: number }> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Analyze this food image and identify all visible food items.

For each food item, estimate:
1. Food name (in English and Portuguese if possible)
2. Estimated portion/amount (e.g., "1 medium bowl", "2 slices", "150g")
3. Calories (kcal)
4. Protein (g)
5. Carbs (g)
6. Fat (g)
7. Fiber (g)
8. Confidence score (0-1) based on how clearly identifiable the food is

Return ONLY a valid JSON array in this exact format:
[
  {
    "name": "food name",
    "estimatedAmount": "portion description",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "confidence": 0.95
  }
]

Be realistic with portion estimates. If unsure about an item, include it with lower confidence.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const outputTokens = data?.usageMetadata?.candidatesTokenCount ?? 500;

  if (!text) {
    throw new Error('No response from Gemini API');
  }

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse food detection results');
  }

  const foods: DetectedFood[] = JSON.parse(jsonMatch[0]).map((f: any) => ({
    ...f,
    calories: Math.round(f.calories || 0),
    protein: Math.round((f.protein || 0) * 10) / 10,
    carbs: Math.round((f.carbs || 0) * 10) / 10,
    fat: Math.round((f.fat || 0) * 10) / 10,
    fiber: Math.round((f.fiber || 0) * 10) / 10,
    confidence: Math.max(0, Math.min(1, f.confidence || 0.5)),
  }));

  return { foods, outputTokens };
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
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ── 2. Check subscription tier (PREMIUM FEATURE) ─────────────────────────

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'granted'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const tier = subscription?.tier || 'free';

  if (tier === 'free') {
    return json({
      error: 'Food photo analysis is a premium feature. Upgrade your plan to unlock it.',
      code: 'PREMIUM_REQUIRED',
    }, 403);
  }

  // ── 3. Parse request ─────────────────────────────────────────────────────

  let body: { image?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { image, mimeType = 'image/jpeg' } = body;

  if (!image || typeof image !== 'string') {
    return json({ error: 'image (base64) is required' }, 400);
  }

  // Limit image size (base64 ~= 4/3 * raw bytes, cap at ~5MB raw = ~6.7MB base64)
  if (image.length > 7_000_000) {
    return json({ error: 'Image too large. Maximum size is 5MB.' }, 400);
  }

  // ── 4. Check kill switch + global spending caps ──────────────────────────

  const { data: config } = await supabase
    .from('ai_spending_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (!config) {
    return json({ error: 'Service configuration error' }, 503);
  }

  if (config.kill_switch) {
    return json({
      error: 'AI food analysis is temporarily unavailable. Please try again later.',
      code: 'KILL_SWITCH',
    }, 503);
  }

  const { data: monthlySpend } = await supabase.rpc('get_ai_spend_current_month');
  if (typeof monthlySpend === 'number' && monthlySpend >= config.monthly_cap_usd) {
    return json({
      error: 'AI food analysis has reached its monthly limit. Please try again next month.',
      code: 'MONTHLY_CAP',
    }, 429);
  }

  const { data: dailySpend } = await supabase.rpc('get_ai_spend_today');
  if (typeof dailySpend === 'number' && dailySpend >= config.daily_cap_usd) {
    return json({
      error: 'AI food analysis has reached its daily limit. Please try again tomorrow.',
      code: 'DAILY_CAP',
    }, 429);
  }

  // ── 5. Check per-user rate limits ────────────────────────────────────────

  let maxPhotoCallsPerDay: number;
  switch (tier) {
    case 'performance':
    case 'premium':
      maxPhotoCallsPerDay = config.premium_photo_calls_per_day;
      break;
    case 'pro':
      maxPhotoCallsPerDay = config.pro_photo_calls_per_day;
      break;
    default:
      maxPhotoCallsPerDay = config.free_photo_calls_per_day; // 0 for free (already blocked above)
  }

  const today = new Date().toISOString().split('T')[0];

  let { data: quota } = await supabase
    .from('ai_usage_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!quota) {
    const { data: newQuota } = await supabase
      .from('ai_usage_quotas')
      .insert({ user_id: user.id, quota_date: today })
      .select()
      .single();
    quota = newQuota;
  } else if (quota.quota_date !== today) {
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

  if (quota && quota.photo_calls_today >= maxPhotoCallsPerDay) {
    return json({
      error: `You've reached your daily limit of ${maxPhotoCallsPerDay} photo analyses.`,
      code: 'USER_DAILY_LIMIT',
      limit: maxPhotoCallsPerDay,
      used: quota.photo_calls_today,
    }, 429);
  }

  // ── 6. Call Gemini Vision ────────────────────────────────────────────────

  try {
    const { foods, outputTokens } = await analyzeFoodWithGemini(image, mimeType);

    // Estimate cost
    const cost = estimateCost(ESTIMATED_IMAGE_INPUT_TOKENS, outputTokens);

    // Log the AI call
    await supabase.from('ai_usage_log').insert({
      user_id: user.id,
      feature: 'food_photo',
      model: MODEL_NAME,
      input_tokens: ESTIMATED_IMAGE_INPUT_TOKENS,
      output_tokens: outputTokens,
      estimated_cost: cost,
      cache_hit: false,
      input_preview: '[photo]',
      success: true,
    });

    // Increment user's daily + lifetime counters
    await supabase
      .from('ai_usage_quotas')
      .update({
        photo_calls_today: (quota?.photo_calls_today ?? 0) + 1,
        photo_calls_lifetime: (quota?.photo_calls_lifetime ?? 0) + 1,
      })
      .eq('user_id', user.id);

    return json({
      success: true,
      foods,
      usage: {
        calls_today: (quota?.photo_calls_today ?? 0) + 1,
        daily_limit: maxPhotoCallsPerDay,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[food-vision] error:', message);

    // Log the failed attempt
    await supabase.from('ai_usage_log').insert({
      user_id: user.id,
      feature: 'food_photo',
      model: MODEL_NAME,
      input_tokens: ESTIMATED_IMAGE_INPUT_TOKENS,
      output_tokens: 0,
      estimated_cost: 0,
      cache_hit: false,
      input_preview: '[photo]',
      success: false,
      error_message: message.substring(0, 500),
    });

    return json({ error: 'Analysis failed', detail: message }, 502);
  }
});
