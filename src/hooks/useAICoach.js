/**
 * useAICoach — central AI coaching hook.
 *
 * Fetches the full engine output and exposes per-surface sections:
 *   briefing, priorities, train, nutrition, protocols, progress, recommendations
 *
 * Every page reads from the same cached result.
 * followRec / dismissRec write rec_outcome rows for the learning loop.
 *
 * Cascade invalidation: call invalidateCoach() from any page after
 * the user performs an action (logs food, completes workout, etc.)
 * to force a fresh engine call on next Today page load.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-decision-engine`;
const STALE_TIME = 4 * 60 * 60 * 1000; // 4 hours
export const AI_COACH_KEY = 'ai-coach';

async function fetchCoachingOutput() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    
    // More specific error handling for common issues
    if (res.status === 503) {
      console.error('[AI Coach] Service unavailable (503):', err);
      throw new Error('AI coaching service is temporarily unavailable. Please try again in a few minutes.');
    }
    
    if (res.status === 429) {
      console.error('[AI Coach] Rate limit exceeded (429):', err);
      throw new Error('AI coaching rate limit exceeded. Please try again later.');
    }
    
    if (res.status === 401) {
      console.error('[AI Coach] Unauthorized (401):', err);
      throw new Error('Authentication failed. Please sign in again.');
    }
    
    console.error('[AI Coach] Engine error:', res.status, err);
    throw new Error(err.error ?? `AI service error ${res.status}`);
  }

  return res.json();
}

/**
 * @param {object} params
 * @param {string} params.userId — current user ID (skips fetch when falsy)
 */
export function useAICoach({ userId } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [AI_COACH_KEY, userId],
    queryFn: fetchCoachingOutput,
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    retry: 1,
    throwOnError: false,
  });

  // Write a rec_outcome row when user follows a recommendation
  const followMutation = useMutation({
    mutationFn: async (rec) => {
      const { error } = await supabase.from('ai_recommendations').insert({
        user_id: userId,
        type: 'rec_outcome',
        recommendation: rec,
        status: 'followed',
        acted_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, userId] });
    },
  });

  // Write a rec_outcome row when user dismisses a recommendation
  const dismissMutation = useMutation({
    mutationFn: async (rec) => {
      const { error } = await supabase.from('ai_recommendations').insert({
        user_id: userId,
        type: 'rec_outcome',
        recommendation: rec,
        status: 'dismissed',
        acted_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
  });

  // Cascade invalidation — call this when user performs an action that changes context
  const invalidateCoach = () => {
    queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, userId] });
  };

  const data = query.data ?? null;

  return {
    // ── Per-surface sections ─────────────────────────────────────────────────
    briefing:        data?.briefing ?? null,
    priorities:      data?.priorities ?? [],
    train:           data?.train ?? null,
    nutrition:       data?.nutrition ?? null,
    protocols:       data?.protocols ?? null,
    progress:        data?.progress ?? null,
    recommendations: data?.recommendations ?? [],
    meta:            data?.meta ?? null,

    // ── States ───────────────────────────────────────────────────────────────
    loading: query.isLoading,
    error: query.error,
    hasData: !!data,

    // ── Actions ──────────────────────────────────────────────────────────────
    followRec: (rec) => followMutation.mutate?.(rec),
    dismissRec: (rec) => dismissMutation.mutate?.(rec),
    invalidateCoach,
  };
}
