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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getAllowedOrigin(): string {
  const requestOrigin = '';
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

const MODEL = 'gpt-4.1-mini';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  page_context?: string;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

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
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return json({ error: 'Unauthorized', detail: authError?.message }, 401);
  }

  const userId = user.id;

  // ── 2. Parse request ──────────────────────────────────────────────────────

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

  // ── 3. Load user context ──────────────────────────────────────────────────

  const today = new Date().toISOString().split('T')[0];
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const [
    profileRes,
    todayNutritionRes,
    todayWorkoutRes,
    activePlanRes,
  ] = await Promise.all([
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
  const todayKcal = todayFood.reduce((s, r) => s + (r.calories ?? 0), 0);
  const todayProtein = todayFood.reduce((s, r) => s + (r.protein ?? 0), 0);
  const workoutDone = (todayWorkoutRes.data ?? []).length > 0;
  const activePlan = activePlanRes.data?.[0];

  // ── 4. Call OpenAI ─────────────────────────────────────────────────────────

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
          ...messages.slice(-10), // Keep last 10 messages for context
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

    // Parse any suggested actions from the response (simple heuristic)
    const actions = [];
    const suggestions = [];

    // Check for common action keywords
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

    return json({
      message: content,
      actions,
      suggestions: suggestions.slice(0, 3),
    });
  } catch (err) {
    console.error('[ai-coach-chat] Fetch error:', err);
    return json({ error: 'AI service unavailable' }, 503);
  }
});
