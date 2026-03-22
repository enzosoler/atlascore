/**
 * Atlas Core — LLM Client
 * Replaces base44.integrations.Core.InvokeLLM across the app.
 *
 * Uses Supabase Edge Function `invoke-llm` which proxies to Claude/Anthropic.
 * Falls back gracefully (returns null) when the function is unreachable so
 * the UI can degrade without crashing.
 */
import { supabase } from '@/lib/supabaseClient';

/**
 * Invoke the LLM with a prompt.
 *
 * @param {string} prompt - The prompt to send
 * @param {{ schema?: object, maxTokens?: number }} [opts]
 * @returns {Promise<string|null>} The text response, or null on failure
 */
export async function invokeLLM(prompt, opts = {}) {
  try {
    const { data, error } = await supabase.functions.invoke('invoke-llm', {
      body: {
        prompt,
        max_tokens: opts.maxTokens || 512,
        response_json_schema: opts.schema || null,
      },
    });

    if (error) {
      console.warn('[llm] edge function error:', error.message);
      return null;
    }

    // Edge function returns { text: "..." } or { data: "..." }
    return data?.text ?? data?.data ?? data ?? null;
  } catch (err) {
    console.warn('[llm] invokeLLM failed:', err.message);
    return null;
  }
}

/**
 * Invoke the LLM and parse JSON from the response.
 *
 * @param {string} prompt
 * @param {object} schema - JSON schema for the response
 * @returns {Promise<object|null>}
 */
export async function invokeLLMJson(prompt, schema) {
  const raw = await invokeLLM(prompt, { schema, maxTokens: 1024 });
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    // Extract JSON if wrapped in markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    return JSON.parse(match ? match[1] : raw);
  } catch {
    console.warn('[llm] failed to parse JSON response');
    return null;
  }
}
