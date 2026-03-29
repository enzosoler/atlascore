/**
 * ai-coach-chat — Supabase Edge Function
 *
 * Simple conversational AI coach endpoint.
 * Proxies to OpenAI with user context for chat responses.
 *
 * Deploy:
 *   supabase functions deploy ai-coach-chat
 *
 * Required secrets:
 *   supabase secrets set OPENAI_API_KEY=xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ─────────────────────────────────────────────────────────────────────

function getAllowedOrigin(requestOrigin: string): string {
  const appUrl = Deno.env.get('APP_URL') || 'https://useatlascore.com';
  const appUrls = Deno.env.get('APP_URLS') || '';

  const allowedList = [
    appUrl,
    ...appUrls.split(',').map(u => u.trim()).filter(Boolean),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
  ];

  return allowedList.includes(requestOrigin) ? requestOrigin : appUrl;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = 'gpt-4.1-mini';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  page_context?: string;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

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

  // ── 2. Kill switch + global spending caps ─────────────────────────────────

  const { data: config } = await supabase
    .from('ai_spending_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (!config) {
    console.error('[ai-coach-chat] ai_spending_config not found');
    return json({ error: 'Service configuration error' }, 503);
  }

  if (config.kill_switch) {
    return json({
      error: 'AI coach is temporarily unavailable. Please try again later.',
      code: 'KILL_SWITCH',
    }, 503);
  }

  const { data: monthlySpend } = await supabase.rpc('get_ai_spend_current_month');
  if (typeof monthlySpend === 'number' && monthlySpend >= config.monthly_cap_usd) {
    console.error(`[ai-coach-chat] Monthly cap reached: $${monthlySpend}`);
    return json({
      error: 'AI coach has reached its monthly limit. Please try again next month.',
      code: 'MONTHLY_CAP',
    }, 429);
  }

  const { data: dailySpend } = await supabase.rpc('get_ai_spend_today');
  if (typeof dailySpend === 'number' && dailySpend >= config.daily_cap_usd) {
    console.error(`[ai-coach-chat] Daily cap reached: $${dailySpend}`);
    return json({
      error: 'AI coach has reached its daily limit. Please try again tomorrow.',
      code: 'DAILY_CAP',
    }, 429);
  }

  // ── 3. Per-user chat rate limit ───────────────────────────────────────────

  const today = new Date().toISOString().split('T')[0];

  // Get user tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'granted'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const tier = subscription?.tier || 'free';

  let maxChatCallsPerDay: number;
  switch (tier) {
    case 'performance':
    case 'premium':
    case 'coach':
    case 'nutritionist':
    case 'clinician':
    case 'internal':
      maxChatCallsPerDay = config.premium_chat_calls_per_day ?? 200;
      break;
    case 'pro':
      maxChatCallsPerDay = config.pro_chat_calls_per_day ?? 50;
      break;
    default:
      maxChatCallsPerDay = config.free_chat_calls_per_day ?? 5;
  }

  // Get or create quota record, resetting daily counter if it's a new day
  let { data: quota } = await supabase
    .from('ai_usage_quotas')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!quota) {
    const { data: newQuota } = await supabase
      .from('ai_usage_quotas')
      .insert({ user_id: userId, quota_date: today })
      .select()
      .single();
    quota = newQuota;
  } else if (quota.quota_date !== today) {
    const { data: resetQuota } = await supabase
      .from('ai_usage_quotas')
      .update({ chat_calls_today: 0, text_calls_today: 0, photo_calls_today: 0, quota_date: today })
      .eq('user_id', userId)
      .select()
      .single();
    quota = resetQuota;
  }

  if (quota && quota.chat_calls_today >= maxChatCallsPerDay) {
    const upgradeHint = tier === 'free' ? ' Upgrade to Pro or Premium for more daily messages.' : '';
    return json({
      error: `You've reached your daily limit of ${maxChatCallsPerDay} AI coach messages.${upgradeHint}`,
      code: 'USER_DAILY_LIMIT',
      limit: maxChatCallsPerDay,
      used: quota.chat_calls_today,
    }, 429);
  }

  // ── 4. Parse request ──────────────────────────────────────────────────────

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { messages, page_context = 'today' } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array is required' }, 400);
  }

  // ── 5. Load user context ──────────────────────────────────────────────────

  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const [profileRes, todayNutritionRes, todayWorkoutRes, activePlanRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, calories_target, protein_target, training_goal')
      .eq('id', userId)
      .single(),

    supabase
      .from('food_logs')
      .select('calories, protein')
      .eq('user_id', userId)
      .gte('date', todayStart)
      .lte('date', todayEnd),

    supabase
      .from('workout_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('date', todayStart)
      .lte('date', todayEnd)
      .limit(1),

    supabase
      .from('workout_plans')
      .select('id, name')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(1),
  ]);

  const profile = profileRes.data ?? {};
  const todayFood = todayNutritionRes.data ?? [];
  const todayKcal = todayFood.reduce((s: number, r: any) => s + (r.calories ?? 0), 0);
  const todayProtein = todayFood.reduce((s: number, r: any) => s + (r.protein ?? 0), 0);
  const workoutDone = (todayWorkoutRes.data ?? []).length > 0;
  const activePlan = activePlanRes.data?.[0];

  // ── 6. Call OpenAI ─────────────────────────────────────────────────────────

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return json({ error: 'AI service not configured' }, 503);
  }

  const systemPrompt = `You are Atlas Coach, a concise fitness AI coach.

User context:
- Name: ${profile.full_name ?? 'User'}
- Goal: ${profile.training_goal ?? 'general fitness'}
- Calorie target: ${profile.calories_target ?? 2000} kcal/day
- Protein target: ${profile.protein_target ?? 150}g/day
- Today: ${todayKcal} kcal eaten, ${todayProtein}g protein
- Workout today: ${workoutDone ? 'completed' : 'not logged'}
- Active plan: ${activePlan?.name ?? 'none'}

Page context: ${page_context}

Respond in a helpful, direct tone. Keep responses under 3 sentences. You can suggest actions like logging food, starting a workout, or updating targets.`;

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
        temperature: 0.4,
        max_tokens: 512,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ai-coach-chat] OpenAI error ${response.status}:`, errText);
      return json({ error: 'AI service error. Please try again.' }, 502);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    inputTokens = data.usage?.prompt_tokens ?? 0;
    outputTokens = data.usage?.completion_tokens ?? 0;

    // Parse action suggestions from response (simple heuristic)
    const suggestions: string[] = [];
    if (content.toLowerCase().includes('log food') || content.toLowerCase().includes('track food')) {
      suggestions.push('Log a meal');
    }
    if (content.toLowerCase().includes('workout') || content.toLowerCase().includes('train')) {
      suggestions.push('Start workout');
    }
    if (content.toLowerCase().includes('calorie target') || content.toLowerCase().includes('protein target')) {
      suggestions.push('Update targets');
    }
    if (content.toLowerCase().includes('weight')) {
      suggestions.push('Log weight');
    }

    // ── 7. Update quota + log usage ───────────────────────────────────────────

    await supabase
      .from('ai_usage_quotas')
      .update({
        chat_calls_today: (quota?.chat_calls_today ?? 0) + 1,
        chat_calls_lifetime: (quota?.chat_calls_lifetime ?? 0) + 1,
      })
      .eq('user_id', userId);

    supabase.from('ai_usage_log').insert({
      user_id: userId,
      feature: 'coach_chat',
      model: MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: (inputTokens / 1_000_000) * 0.40 + (outputTokens / 1_000_000) * 1.60,
      cache_hit: false,
      success: true,
    }).then(() => {});

    return json({
      message: content,
      actions: [],
      suggestions: suggestions.slice(0, 3),
    });
  } catch (err) {
    console.error('[ai-coach-chat] Fetch error:', err);
    return json({ error: 'AI service unavailable' }, 503);
  }
});
