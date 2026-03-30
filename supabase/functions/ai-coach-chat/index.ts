/**
 * ai-coach-chat v2 — Stateful, identity-locked AI coach.
 *
 * Architecture:
 *  - Locked coach identity system prompt
 *  - Persistent memory: athlete profile, adherence summary, conversation summary
 *  - Message history from DB (last 8 turns)
 *  - Today's live metrics injected fresh on every call
 *  - Few-shot examples baked into system context
 *  - Memory updated after every exchange
 *
 * Deploy:
 *   supabase functions deploy ai-coach-chat --no-verify-jwt
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ─────────────────────────────────────────────────────────────────────

function getAllowedOrigin(requestOrigin: string): string {
  const appUrls = Deno.env.get('APP_URLS') || '';
  const extraAllowed = appUrls.split(',').map((u) => u.trim()).filter(Boolean);

  // Allow any subdomain of useatlascore.com (www, non-www, future subdomains)
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

  console.warn('[ai-coach-chat] CORS blocked origin:', requestOrigin);
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

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL = 'gpt-4.1-mini';

// ─── System prompt: rigid coach identity ──────────────────────────────────────

const SYSTEM_PROMPT = `You are the user's personal AI coach. You are not a general assistant.
You must behave like the same coach every time: direct, consistent, practical, calm, and accountable.

Primary role:
- Help the user execute today's plan.
- Keep advice aligned with the active nutrition and training plan.
- Reinforce consistency, adherence, and measurable progress.
- Act like a real coach who knows the athlete, not like a chatbot.

Coaching style:
- Be concise, decisive, and structured.
- Speak with authority but never with hype.
- Be supportive without sounding soft or generic.
- Prioritize consistency over perfection.
- Focus on the next correct action.
- Do not contradict previous coach decisions unless new context clearly requires it.
- If the athlete is off-plan, correct course clearly and without judgment.
- Do not ramble. Do not give broad educational essays unless asked.

Behavior rules:
- Always ground advice in the athlete's current plan, current day metrics, and recent adherence.
- If the athlete asks what to do now, give a concrete action.
- If the athlete is anxious or inconsistent, reduce complexity and give the minimum viable next step.
- Never invent plan details. Use only provided context.
- If data is missing, state the assumption briefly and continue with the best practical answer.
- Never answer like a generic AI assistant.
- Never say you were "trained on" the user.
- Never imply you remember things that were not provided in this request.

Response priorities:
1. Safety and realism
2. Consistency with active plan
3. Adherence and execution
4. Clear next step
5. Motivation only when useful

Default response structure:
- Brief assessment of current situation
- Clear recommendation
- Specific next step for today
- Optional short accountability line

Keep responses under 150 words unless the user explicitly asks for more detail.
You are a coach. Be stable. Be consistent. Be actionable.`;

// ─── Few-shot examples: baked-in coach voice ──────────────────────────────────

const FEW_SHOT = `EXAMPLES OF YOUR EXACT COACHING TONE (follow this style):

User: I already blew my calories today so whatever.
Coach: No. One messy meal is not a ruined day. Do not turn one mistake into a full slide. Keep dinner high-protein, normal-sized, and end the day with control. Your job now is damage containment, not punishment. What are you eating for dinner?

User: I don't feel motivated to train.
Coach: Motivation is irrelevant. The target is execution. Do the first 2 exercises only. Once you start, decide whether to continue. Win the habit, not the session.

User: I hit protein but went over calories.
Coach: Better than missing both. Do not compensate tomorrow by undereating. Reset immediately: normal breakfast, protein early, steps, back to target. One day over does not move the needle — two days does.

User: What should I do today?
Coach: Check the plan. Training day or rest day? If training: do the session, hit protein, log your food. If rest: walk, recover, hit nutrition targets. Everything else is secondary.

User: I'm struggling with cravings at night.
Coach: This is about structure, not willpower. Push your last protein meal later. Keep a go-to low-calorie option ready for late nights. Build the environment, not the resolve.`;

// ─── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Top-level catch: ensures ALL responses include CORS headers
  try {

  console.log('[ai-coach-chat] origin:', req.headers.get('origin'), '| method:', req.method);

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  console.log('[ai-coach-chat] stage: auth');

  // ── 1. Authenticate ───────────────────────────────────────────────────────

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Missing authorization header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Unauthorized', detail: authError?.message }, 401);
  const userId = user.id;
  console.log('[ai-coach-chat] stage: auth ok, userId:', userId);

  // Service role client — bypasses RLS for admin/global tables
  // (ai_spending_config, ai_usage_quotas, ai_usage_log, subscriptions)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  // ── 2. Kill switch + global spending caps ─────────────────────────────────

  console.log('[ai-coach-chat] stage: spending config');
  const { data: config } = await adminSupabase
    .from('ai_spending_config').select('*').eq('id', 1).single();

  if (!config) return json({ error: 'Service configuration error' }, 503);
  if (config.kill_switch) return json({ error: 'AI coach is temporarily unavailable.', code: 'KILL_SWITCH' }, 503);

  const { data: monthlySpend } = await adminSupabase.rpc('get_ai_spend_current_month');
  if (typeof monthlySpend === 'number' && monthlySpend >= config.monthly_cap_usd) {
    return json({ error: 'AI coach has reached its monthly limit.', code: 'MONTHLY_CAP' }, 429);
  }

  const { data: dailySpend } = await adminSupabase.rpc('get_ai_spend_today');
  if (typeof dailySpend === 'number' && dailySpend >= config.daily_cap_usd) {
    return json({ error: 'AI coach has reached its daily limit.', code: 'DAILY_CAP' }, 429);
  }

  // ── 3. Per-user rate limit ────────────────────────────────────────────────

  console.log('[ai-coach-chat] stage: rate limit');
  const today = new Date().toISOString().split('T')[0];

  const { data: subscription } = await adminSupabase
    .from('subscriptions').select('tier, status').eq('user_id', userId)
    .in('status', ['active', 'trialing', 'granted'])
    .order('created_at', { ascending: false }).limit(1).single();

  const tier = subscription?.tier || 'free';
  let maxChatCallsPerDay: number;
  switch (tier) {
    case 'performance': case 'premium': case 'coach':
    case 'nutritionist': case 'clinician': case 'internal':
      maxChatCallsPerDay = config.premium_chat_calls_per_day ?? 200; break;
    case 'pro':
      maxChatCallsPerDay = config.pro_chat_calls_per_day ?? 50; break;
    default:
      maxChatCallsPerDay = config.free_chat_calls_per_day ?? 5;
  }

  let { data: quota } = await adminSupabase.from('ai_usage_quotas').select('*').eq('user_id', userId).single();
  if (!quota) {
    const { data: newQuota } = await adminSupabase.from('ai_usage_quotas')
      .insert({ user_id: userId, quota_date: today }).select().single();
    quota = newQuota;
  } else if (quota.quota_date !== today) {
    const { data: resetQuota } = await adminSupabase.from('ai_usage_quotas')
      .update({ chat_calls_today: 0, text_calls_today: 0, photo_calls_today: 0, quota_date: today })
      .eq('user_id', userId).select().single();
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

  console.log('[ai-coach-chat] stage: parse request');
  let body: { message?: string; page_context?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const { message: userMessage, page_context = 'today' } = body;
  if (!userMessage?.trim()) return json({ error: 'message is required' }, 400);

  // ── 5. Load all context in parallel ──────────────────────────────────────

  console.log('[ai-coach-chat] stage: loading context');
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd   = `${today}T23:59:59.999Z`;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();
  const sevenDaysAgoDate = sevenDaysAgoISO.split('T')[0];

  const [
    profileRes,
    todayFoodRes,
    todayWorkoutRes,
    activePlanRes,
    recentFoodRes,
    recentWorkoutRes,
    memoryRes,
    historyRes,
  ] = await Promise.all([
    supabase.from('profiles')
      .select('full_name, profile_data')
      .eq('id', userId).single(),

    supabase.from('food_logs')
      .select('calories, protein')
      .eq('user_id', userId)
      .gte('date', todayStart).lte('date', todayEnd),

    supabase.from('workout_logs')
      .select('workout_name, status, completed_at')
      .eq('user_id', userId)
      .eq('date', today)
      .limit(3),

    adminSupabase.from('workout_plans')
      .select('id, name, days, frequency_per_week')
      .eq('user_id', userId).eq('active', true)
      .limit(1).maybeSingle(),

    supabase.from('food_logs')
      .select('calories, protein, date')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgoISO),

    supabase.from('workout_logs')
      .select('date, status')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgoDate)
      .lte('date', today)
      .eq('status', 'completed'),

    supabase.from('coach_memory')
      .select('*').eq('user_id', userId).maybeSingle(),

    supabase.from('coach_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  // ── 6. Derive context ─────────────────────────────────────────────────────

  console.log('[ai-coach-chat] stage: context loaded', {
    profileErr: profileRes.error?.message,
    activePlanData: activePlanRes.data ? `id=${activePlanRes.data.id} name="${activePlanRes.data.name}"` : null,
    activePlanErr: activePlanRes.error?.message,
    todayWorkoutErr: todayWorkoutRes.error?.message,
    todayFoodCount: (todayFoodRes.data ?? []).length,
  });

  const profile = profileRes.data as any ?? {};
  const profileData = profile?.profile_data ?? {};
  const targets = profileData?.targets ?? {};
  const caloriesTarget = Number(targets.calories) || Number(profile?.calories_target) || 0;
  const proteinTarget  = Number(targets.protein)  || Number(profile?.protein_target)  || 0;
  const trainingGoal   = profile?.training_goal || profileData?.goal || 'general fitness';

  const todayFood    = todayFoodRes.data ?? [];
  const todayKcal    = todayFood.reduce((s: number, r: any) => s + (r.calories ?? 0), 0);
  const todayProtein = todayFood.reduce((s: number, r: any) => s + (r.protein   ?? 0), 0);

  const todayWorkouts  = todayWorkoutRes.data ?? [];
  const workoutDone    = todayWorkouts.some((w: any) => w.status === 'completed');
  const workoutStarted = todayWorkouts.some((w: any) => w.status === 'in_progress');
  const workoutName    = todayWorkouts[0]?.workout_name ?? null;

  const activePlan = activePlanRes.data as any ?? null;

  // 7-day adherence
  const recentFood  = recentFoodRes.data ?? [];
  const calByDay: Record<string, number> = {};
  for (const log of recentFood) {
    const day = (log.date as string)?.split('T')[0];
    if (day) calByDay[day] = (calByDay[day] ?? 0) + (log.calories ?? 0);
  }
  const daysLogged  = Object.keys(calByDay).length;
  const daysOnTarget = caloriesTarget > 0
    ? Object.values(calByDay).filter((c) => c <= caloriesTarget * 1.05).length
    : 0;
  const recentWorkouts = recentWorkoutRes.data ?? [];

  // ── 7. Build structured context blocks ───────────────────────────────────

  const athleteProfile = {
    name:              profile?.full_name ?? 'Athlete',
    goal:              trainingGoal,
    calorie_target:    caloriesTarget,
    protein_target_g:  proteinTarget,
    active_plan:       activePlan
      ? { name: activePlan.name, days_per_week: activePlan.frequency_per_week }
      : null,
  };

  const todayMetrics = {
    date:                today,
    page:                page_context,
    calories_eaten:      Math.round(todayKcal),
    calories_target:     caloriesTarget,
    calories_remaining:  Math.max(0, caloriesTarget - Math.round(todayKcal)),
    protein_eaten_g:     Math.round(todayProtein),
    protein_target_g:    proteinTarget,
    workout_status:      workoutDone ? 'completed' : workoutStarted ? 'in_progress' : 'not_logged',
    workout_name:        workoutName,
  };

  const adherenceSummary = {
    last_7_days: {
      food_logged_days:           daysLogged,
      days_on_calorie_target:     daysOnTarget,
      training_sessions_done:     recentWorkouts.length,
    },
    trend: daysLogged < 3
      ? 'low_logging'
      : daysOnTarget >= 5
        ? 'on_track'
        : 'needs_attention',
  };

  const memory = memoryRes.data as any ?? null;
  const conversationSummary = memory?.conversation_summary ?? {};

  // Reverse to chronological order
  const history = (historyRes.data ?? []).reverse() as Array<{ role: string; content: string }>;

  // ── 8. Assemble prompt ────────────────────────────────────────────────────

  const promptMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: FEW_SHOT },
    { role: 'system', content: `ATHLETE PROFILE\n${JSON.stringify(athleteProfile, null, 2)}` },
    { role: 'system', content: `ADHERENCE SUMMARY (last 7 days)\n${JSON.stringify(adherenceSummary, null, 2)}` },
    ...(Object.keys(conversationSummary).length > 0
      ? [{ role: 'system', content: `COACH MEMORY (previous sessions)\n${JSON.stringify(conversationSummary, null, 2)}` }]
      : []),
    { role: 'system', content: `TODAY'S METRICS\n${JSON.stringify(todayMetrics, null, 2)}` },
    ...history,
    { role: 'user', content: userMessage.trim() },
  ];

  // ── 9. Call OpenAI ────────────────────────────────────────────────────────

  console.log('[ai-coach-chat] stage: calling openai, messages:', promptMessages.length);
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return json({ error: 'AI service not configured' }, 503);

  let inputTokens = 0;
  let outputTokens = 0;
  let assistantContent = '';

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 400,
        messages: promptMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[ai-coach-chat] OpenAI error ${res.status}:`, errText);
      return json({ error: 'AI service error. Please try again.' }, 502);
    }

    const data = await res.json();
    assistantContent = data.choices?.[0]?.message?.content ?? '';
    inputTokens  = data.usage?.prompt_tokens ?? 0;
    outputTokens = data.usage?.completion_tokens ?? 0;
  } catch (err) {
    console.error('[ai-coach-chat] fetch error:', err);
    return json({ error: 'AI service unavailable' }, 503);
  }

  // ── 10. Persist messages ──────────────────────────────────────────────────

  await supabase.from('coach_messages').insert([
    { user_id: userId, role: 'user',      content: userMessage.trim() },
    { user_id: userId, role: 'assistant', content: assistantContent   },
  ]);

  // ── 11. Update coach memory ───────────────────────────────────────────────

  const updatedSummary = buildUpdatedSummary(conversationSummary, userMessage.trim(), assistantContent);

  await supabase.from('coach_memory').upsert({
    user_id:              userId,
    athlete_profile:      athleteProfile,
    active_plan:          activePlan
      ? { name: activePlan.name, frequency_per_week: activePlan.frequency_per_week }
      : {},
    adherence_summary:    adherenceSummary,
    conversation_summary: updatedSummary,
    updated_at:           new Date().toISOString(),
  }, { onConflict: 'user_id' });

  // ── 12. Update quota + log usage ──────────────────────────────────────────

  await adminSupabase.from('ai_usage_quotas').update({
    chat_calls_today:    (quota?.chat_calls_today    ?? 0) + 1,
    chat_calls_lifetime: (quota?.chat_calls_lifetime ?? 0) + 1,
  }).eq('user_id', userId);

  adminSupabase.from('ai_usage_log').insert({
    user_id:        userId,
    feature:        'chat',
    model:          MODEL,
    input_tokens:   inputTokens,
    output_tokens:  outputTokens,
    estimated_cost: (inputTokens / 1_000_000) * 0.40 + (outputTokens / 1_000_000) * 1.60,
    cache_hit:      false,
    success:        true,
  }).then(() => {});

  // ── 13. Return ────────────────────────────────────────────────────────────

  console.log('[ai-coach-chat] stage: returning response');
  const lower = assistantContent.toLowerCase();
  const suggestions: string[] = [];
  if (lower.includes('log') && (lower.includes('food') || lower.includes('meal'))) suggestions.push('Log a meal');
  if (lower.includes('workout') || lower.includes('train') || lower.includes('session'))  suggestions.push('Start workout');
  if (lower.includes('protein'))  suggestions.push('Check protein');
  if (lower.includes('weight') && lower.includes('log')) suggestions.push('Log weight');

  return json({ message: assistantContent, actions: [], suggestions: suggestions.slice(0, 3) });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ai-coach-chat] unhandled error:', message, err);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});

// ─── Memory helper ────────────────────────────────────────────────────────────

function buildUpdatedSummary(
  existing: Record<string, unknown>,
  userMsg: string,
  assistantMsg: string,
): Record<string, unknown> {
  const prev = Array.isArray(existing.recent_exchanges) ? existing.recent_exchanges as string[] : [];
  const entry = `Q: ${userMsg.slice(0, 80)}${userMsg.length > 80 ? '…' : ''} | A: ${assistantMsg.slice(0, 120)}${assistantMsg.length > 120 ? '…' : ''}`;
  const recentExchanges = [entry, ...prev].slice(0, 6);

  // Extract any stated commitments from the assistant response
  const prevCommitments = Array.isArray(existing.current_commitments)
    ? existing.current_commitments as string[]
    : [];
  const commitmentMatch = assistantMsg.match(/(?:your (?:next step|task|job) is|do this now|commit to)[:\s]+([^.!?\n]+[.!?])/i);
  const newCommitments = commitmentMatch?.[1]
    ? [commitmentMatch[1].trim().slice(0, 100), ...prevCommitments].slice(0, 4)
    : prevCommitments;

  return {
    recent_exchanges:     recentExchanges,
    current_commitments:  newCommitments,
    last_updated:         new Date().toISOString(),
  };
}
