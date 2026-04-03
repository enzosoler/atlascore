/**
 * Atlas Core — LLM Client
 *
 * Uses Supabase Edge Function `invoke-llm` which proxies to OpenAI.
 * Uses manual fetch() with explicit Authorization header (same pattern
 * as useAICoach) because supabase.functions.invoke() does not reliably
 * send the user's JWT to edge functions.
 */
import { supabase } from '@/lib/supabaseClient';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoke-llm`;

/**
 * Invoke the LLM with a prompt.
 *
 * @param {string} prompt - The prompt to send
 * @param {{ schema?: object, maxTokens?: number, throwOnError?: boolean }} [opts]
 * @returns {Promise<string|object|null>} The response, or null on failure
 */
export async function invokeLLM(prompt, opts = {}, _retried = false) {
  try {
    // Get the current session token explicitly
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error('[llm] no active session — cannot call invoke-llm');
      if (opts.throwOnError) throw new Error('Not authenticated');
      return null;
    }

    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        prompt,
        max_tokens: opts.maxTokens || 512,
        response_json_schema: opts.schema || null,
      }),
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body?.error || detail;
      } catch { /* ignore parse errors */ }

      console.error('[llm] edge function error:', detail);

      // If 401, try refreshing the session once and retry
      if (!_retried && res.status === 401) {
        console.log('[llm] refreshing session and retrying...');
        const { error: refreshErr } = await supabase.auth.refreshSession();
        if (!refreshErr) {
          return invokeLLM(prompt, opts, true);
        }
      }

      if (opts.throwOnError) throw new Error(detail);
      return null;
    }

    const data = await res.json();

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
