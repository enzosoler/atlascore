import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { AI_COACH_KEY } from '@/hooks/useAICoach';

/**
 * useDailyState — single unified truth for today's state.
 *
 * Covers: workout, nutrition, body, protocols, profile targets.
 * Every page reads from this. Cache keys are shared, so invalidation
 * from any page (logging food, completing workout, etc.) propagates everywhere.
 *
 * This is Layer 2 of the AI architecture — the engine reads this same shape.
 */

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Returns the local UTC offset as ±HH:MM (e.g. "+03:00" or "-05:00") */
const tzOffset = () => {
  const off = new Date().getTimezoneOffset();
  const sign = off <= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
};

export const DAILY_QUERY_KEYS = {
  todaySession:   (uid) => ['daily-today-session', uid],
  todayMeals:     (uid) => ['daily-today-meals', uid],
  todayWeight:    (uid) => ['daily-today-weight', uid],
  todayProtocols: (uid) => ['daily-today-protocols', uid],
  todayLogs:      (uid) => ['daily-today-protocol-logs', uid],
  profile:        (uid) => ['daily-profile', uid],
  weekWorkouts:   (uid) => ['daily-week-workouts', uid],
  lastWeight:     (uid) => ['daily-last-weight', uid],
};

export function useDailyState() {
  const { user } = useAuth();
  const uid = user?.id;
  const today = todayISO();
  const tz = tzOffset();
  const queryClient = useQueryClient();

  // ── Workout (non-throwing) ──────────────────────────────────────────────────
  const { data: todaySession, isLoading: sessionLoading } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todaySession(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase.from('workouts').select('*').eq('user_id', uid).gte('completed_at', `${today}T00:00:00${tz}`).lte('completed_at', `${today}T23:59:59${tz}`).order('completed_at', { ascending: false }).limit(1).maybeSingle();
        return data ?? null;
      } catch { return null; }
    },
    enabled: !!uid,
    staleTime: 30_000,
  });

  // ── Nutrition (non-throwing) ──────────────────────────────────────────────
  const { data: todayMeals = [], isLoading: mealsLoading } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todayMeals(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase.from('food_logs').select('*').eq('user_id', uid).gte('date', `${today}T00:00:00${tz}`).lte('date', `${today}T23:59:59${tz}`);
        return data || [];
      } catch { return []; }
    },
    enabled: !!uid,
    staleTime: 30_000,
  });

  // ── Body — today's weight (non-throwing) ──────────────────────────────────
  const { data: todayWeight } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todayWeight(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase.from('measurements').select('*').eq('user_id', uid).gte('date', today).order('date', { ascending: false }).limit(1).maybeSingle();
        return data ?? null;
      } catch { return null; }
    },
    enabled: !!uid,
    staleTime: 60_000,
  });

  // ── Body — last weight (for delta, non-throwing) ────────────────────────────
  const { data: lastWeight } = useQuery({
    queryKey: DAILY_QUERY_KEYS.lastWeight(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('measurements')
          .select('*')
          .eq('user_id', uid)
          .order('date', { ascending: false })
          .limit(2);
        return data || [];
      } catch { return []; }
    },
    enabled: !!uid,
    staleTime: 120_000,
  });

  // ── Protocols — active protocols + today's logs (non-throwing, graceful fallback) ──
  const { data: activeProtocols = [] } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todayProtocols(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('protocols')
          .select('id, compound, name, frequency_per_week, active')
          .eq('active', true)
          .limit(20);
        return data || [];
      } catch { return []; }
    },
    enabled: !!uid,
    staleTime: 120_000,
  });

  const { data: todayProtocolLogs = [] } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todayLogs(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('protocol_logs')
          .select('protocol_id, taken_at')
          .gte('taken_at', `${today}T00:00:00${tz}`)
          .lte('taken_at', `${today}T23:59:59${tz}`)
          .limit(50);
        return data || [];
      } catch { return []; }
    },
    enabled: !!uid,
    staleTime: 30_000,
  });

  // ── Profile targets (non-throwing) ──────────────────────────────────────────
  const { data: profileData } = useQuery({
    queryKey: DAILY_QUERY_KEYS.profile(uid),
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('profile_data')
          .eq('id', uid)
          .single();
        return data?.profile_data ?? {};
      } catch { return {}; }
    },
    enabled: !!uid,
    staleTime: 300_000,
  });

  // ── Week workouts (non-throwing) ────────────────────────────────────────────
  const { data: weekWorkouts = [] } = useQuery({
    queryKey: DAILY_QUERY_KEYS.weekWorkouts(uid),
    queryFn: async () => {
      try {
        const monday = new Date();
        monday.setDate(monday.getDate() - monday.getDay() + 1);
        const mondayKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        const { data } = await supabase.from('workouts').select('completed_at, status').eq('user_id', uid).eq('status', 'completed').gte('completed_at', `${mondayKey}T00:00:00`);
        return data || [];
      } catch { return []; }
    },
    enabled: !!uid,
    staleTime: 60_000,
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const workout = useMemo(() => ({
    planned: !!todaySession,
    completed: todaySession?.status === 'completed',
    sessionName: todaySession?.workout_name || todaySession?.name || null,
    completedAt: todaySession?.completed_at || null,
  }), [todaySession]);

  const nutrition = useMemo(() => {
    const kcal = todayMeals.reduce((s, m) => s + (m.calories || m.total_calories || 0), 0);
    const protein = todayMeals.reduce((s, m) => s + (m.protein_g || m.total_protein || m.protein || 0), 0);
    const carbs = todayMeals.reduce((s, m) => s + (m.carbs_g || m.total_carbs || m.carbs || 0), 0);
    const fat = todayMeals.reduce((s, m) => s + (m.fat_g || m.total_fat || m.fat || 0), 0);
    const targets = profileData?.targets || {};
    return {
      caloriesTarget: targets.calories || 0,
      caloriesConsumed: kcal,
      proteinTarget: targets.protein || 0,
      proteinConsumed: protein,
      carbsConsumed: carbs,
      fatConsumed: fat,
      mealsLogged: todayMeals.length,
    };
  }, [todayMeals, profileData]);

  const body = useMemo(() => {
    const todayW = todayWeight ? (getMeasurementFieldValue(todayWeight, 'weight') ?? todayWeight.weight) : null;
    const lastW = lastWeight?.[0] ? (getMeasurementFieldValue(lastWeight[0], 'weight') ?? lastWeight[0].weight) : null;
    const prevW = lastWeight?.[1] ? (getMeasurementFieldValue(lastWeight[1], 'weight') ?? lastWeight[1].weight) : null;
    return {
      weightToday: todayW ? Number(todayW) : null,
      lastWeight: lastW ? Number(lastW) : null,
      previousWeight: prevW ? Number(prevW) : null,
      weightDelta: lastW && prevW ? Number(lastW) - Number(prevW) : null,
    };
  }, [todayWeight, lastWeight]);

  const protocols = useMemo(() => {
    const loggedIds = new Set(todayProtocolLogs.map((l) => l.protocol_id));
    const dueToday = activeProtocols.length; // simplified: all active protocols are due daily
    const completedToday = activeProtocols.filter((p) => loggedIds.has(p.id)).length;
    return {
      dueToday,
      completedToday,
      pending: dueToday - completedToday,
      activeCompounds: activeProtocols.map((p) => p.compound || p.name).filter(Boolean),
    };
  }, [activeProtocols, todayProtocolLogs]);

  // ── Convenience booleans ───────────────────────────────────────────────────
  const workoutDone = workout.completed;
  const nutritionLogged = nutrition.mealsLogged > 0;
  const weightLogged = body.weightToday != null;

  /**
   * Cascade invalidation — call after any user action that changes daily state.
   * Invalidates daily data queries + AI coach cache so the engine refreshes.
   * @param {'meal'|'workout'|'weight'|'protocol'|'all'} scope
   */
  const invalidateAfterAction = useCallback((scope = 'all') => {
    if (scope === 'meal' || scope === 'all') {
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todayMeals(uid) });
    }
    if (scope === 'workout' || scope === 'all') {
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todaySession(uid) });
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.weekWorkouts(uid) });
    }
    if (scope === 'weight' || scope === 'all') {
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todayWeight(uid) });
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.lastWeight(uid) });
    }
    if (scope === 'protocol' || scope === 'all') {
      queryClient.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todayLogs(uid) });
    }
    // Always invalidate AI coach cache so engine regenerates with fresh data
    queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, uid] });
  }, [uid, queryClient]);

  return {
    // Structured state (for AI engine and typed consumers)
    workout,
    nutrition,
    body,
    protocols,
    profile: profileData ?? {},
    weekWorkoutCount: weekWorkouts.length,

    // Raw data (for components that need rows)
    todaySession,
    todayMeals,
    todayWeight,
    activeProtocols,
    todayProtocolLogs,

    // Convenience booleans
    workoutDone,
    nutritionLogged,
    weightLogged,

    // Convenience aggregates (backward compat)
    totalKcal: nutrition.caloriesConsumed,
    totalProtein: nutrition.proteinConsumed,

    // Loading
    isLoading: sessionLoading || mealsLoading,

    // Cascade invalidation — call after user actions
    invalidateAfterAction,
  };
}
