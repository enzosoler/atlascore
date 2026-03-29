/**
 * Atlas Core — invoke-llm Edge Function
 * Proxies LLM requests to OpenAI API.
 *
 * Expected body: { prompt: string, max_tokens?: number, response_json_schema?: object }
 * Returns: { text: string, data: object|string } on success, { error: string } on failure
 *
 * Required secrets:
 *   supabase secrets set OPENAI_API_KEY=xxx
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MODEL = 'gpt-4.1-nano';

// Rate limiting: max 20 calls per hour per user
const MAX_CALLS_PER_HOUR = 20;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  // Require authenticated user — prevents unauthenticated cost abuse
  const authHeader = req.headers.get('Authorization') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Validate user JWT
  const supabase = createClient(supabaseUrl, anonKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // ── Rate limiting check ───────────────────────────────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentCalls, error: countError } = await supabaseAdmin
    .from('ai_usage_log')
    .select('id')
    .eq('user_id', user.id)
    .eq('feature', 'invoke_llm')
    .gte('created_at', hourAgo);

  if (!countError && recentCalls && recentCalls.length >= MAX_CALLS_PER_HOUR) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded. Maximum 20 calls per hour.',
      code: 'RATE_LIMITED'
    }), {
      status: 429,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, max_tokens = 1024, response_json_schema } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 503,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = response_json_schema
      ? 'You are a helpful assistant. Always respond with valid JSON matching the provided schema.'
      : 'You are Atlas, a helpful fitness and health AI assistant. Be concise and practical.';

    const userPrompt = response_json_schema
      ? `${prompt}\n\nRespond ONLY with valid JSON matching this schema:\n${JSON.stringify(response_json_schema, null, 2)}`
      : prompt;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        ...(response_json_schema ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[invoke-llm] OpenAI error:', response.status, err);
      return new Response(JSON.stringify({ error: 'LLM request failed' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content ?? '';

    // If JSON schema requested, parse and return parsed object
    if (response_json_schema) {
      try {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const parsed = JSON.parse(match ? match[1] : text);
        return new Response(JSON.stringify({ text, data: parsed }), {
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      } catch {
        console.error('[invoke-llm] Failed to parse JSON from response:', text.substring(0, 500));
        // Return raw text if JSON parse fails
      }
    }

    // Log usage for rate limiting
    supabaseAdmin.from('ai_usage_log').insert({
      user_id: user.id,
      feature: 'invoke_llm',
      model: MODEL,
      input_tokens: result.usage?.prompt_tokens ?? 0,
      output_tokens: result.usage?.completion_tokens ?? 0,
      estimated_cost: 0,
      cache_hit: false,
      success: true,
    }).then(() => {}).catch((e) => console.error('[invoke-llm] Failed to log usage:', e));

    return new Response(JSON.stringify({ text, data: text }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[invoke-llm] unexpected error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
