/**
 * useAICoach — fetches today's coaching output from the ai-decision-engine.
 *
 * Flow:
 *   1. Call ai-decision-engine edge function (POST with user's JWT)
 *   2. Engine returns cached daily_context or generates fresh output
 *   3. Expose followRec / dismissRec helpers that write rec_outcome rows
 *
 * React Query caches the result for 4 hours (matching the engine TTL).
 * Falls back to null on error — caller provides rules-based fallback.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-decision-engine`;
const STALE_TIME = 4 * 60 * 60 * 1000; // 4 hours — matches engine TTL

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
    throw new Error(err.error ?? `Engine error ${res.status}`);
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
    queryKey: ['ai-coach', userId],
    queryFn: fetchCoachingOutput,
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    retry: 1,
    // Don't throw — caller handles null gracefully
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
      // Invalidate so the engine learns from this on next fresh fetch
      queryClient.invalidateQueries({ queryKey: ['ai-coach', userId] });
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

  const data = query.data ?? null;

  return {
    // Structured output from engine (null when loading or error)
    briefing: data?.briefing ?? null,
    alerts: data?.alerts ?? [],
    recommendations: data?.recommendations ?? [],
    meta: data?.meta ?? null,

    // States
    loading: query.isLoading,
    error: query.error,

    // Actions — pass the full rec object so it's stored in rec_outcome
    followRec: (rec) => followMutation.mutate(rec),
    dismissRec: (rec) => dismissMutation.mutate(rec),
  };
}
