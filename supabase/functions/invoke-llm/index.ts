/**
 * Atlas Core — invoke-llm Edge Function
 * Proxies LLM requests to Anthropic Claude API.
 *
 * Expected body: { prompt: string, max_tokens?: number, response_json_schema?: object }
 * Returns: { text: string } on success, { error: string } on failure
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { prompt, max_tokens = 512, response_json_schema } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[invoke-llm] Anthropic error:', err);
      return new Response(JSON.stringify({ error: 'LLM request failed' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? '';

    // If JSON schema requested, parse and return parsed object
    if (response_json_schema) {
      try {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const parsed = JSON.parse(match ? match[1] : text);
        return new Response(JSON.stringify({ text, data: parsed }), {
          headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      } catch {
        // Return raw text if JSON parse fails
      }
    }

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
