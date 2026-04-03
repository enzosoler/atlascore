/**
 * Atlas Core — LLM Client
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
      console.error('[llm] edge function error:', error.message, error);
      // Surface the error so callers can show useful messages
      const errMsg = error.message || 'Edge function error';
      if (opts.throwOnError) throw new Error(errMsg);
      return null;
    }

    // Edge function may return an error payload
    if (data?.error) {
      console.error('[llm] service error:', data.error, data.code);
      if (opts.throwOnError) throw new Error(data.error);
      return null;
    }

    // Edge function returns { text: "...", data: <parsed> }
    // Prefer parsed data object when available, fall back to raw text
    if (data?.data && typeof data.data === 'object') return data.data;
    return data?.text ?? data?.data ?? data ?? null;
  } catch (err) {
    console.error('[llm] invokeLLM failed:', err.message);
    if (opts.throwOnError) throw err;
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
export async function invokeLLMJson(prompt, schema, opts = {}) {
  const raw = await invokeLLM(prompt, { schema, maxTokens: 4096, throwOnError: true });
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    // Extract JSON if wrapped in markdown code block
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    return JSON.parse(match ? match[1] : raw);
  } catch {
    console.warn('[llm] failed to parse JSON response:', typeof raw === 'string' ? raw.slice(0, 200) : raw);
    return null;
  }
}
