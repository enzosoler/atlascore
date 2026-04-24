/**
 * useDailyStateV2 — single source of truth for Today + Train + AI.
 *
 * Rules:
 *  - Every query uses try/catch → never throws → never crashes the page
 *  - All derived values handle null/undefined safely
 *  - invalidateAfterAction() cascades to both daily data + AI coach cache
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { AI_COACH_KEY } from '@/hooks/useAICoach';
import { getDailyCheckin } from '@/services/checkinService';

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Returns the local UTC offset as ±HH:MM (e.g. "+03:00" or "-05:00") */
const tzOffset = () => {
  const off = new Date().getTimezoneOffset(); // minutes, positive = behind UTC
  const sign = off <= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
};

export const DAILY_KEYS = {
  session:     (uid) => ['v2-session', uid],
  meals:       (uid) => ['v2-meals', uid],
  weight:      (uid) => ['v2-weight', uid],
  checkin:     (uid, date) => ['v2-checkin', uid, date],
  protocols:   (uid) => ['v2-protocols', uid],
  protocolLogs:(uid) => ['v2-protocol-logs', uid],
  profile:     (uid) => ['v2-profile', uid],
  plan:        (uid) => ['v2-plan', uid],
  recentWork:  (uid) => ['v2-recent-workouts', uid],
  weekWork:    (uid) => ['v2-week-workouts', uid],
};

// Safe query helper — never throws
async function sq(fn) {
  try { return await fn(); } catch { return null; }
}

export function useDailyStateV2() {
  const { user } = useAuth();
  const uid = user?.id;
  const today = todayISO();
  const tz = tzOffset();
  const qc = useQueryClient();

  // ── Queries (all non-throwing) ────────────────────────────────────────────

  const { data: rawSession, isLoading: l1 } = useQuery({
    queryKey: DAILY_KEYS.session(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('workouts').select('*').eq('user_id', uid).gte('completed_at', `${today}T00:00:00${tz}`).lte('completed_at', `${today}T23:59:59${tz}`).order('completed_at', { ascending: false }).limit(1).maybeSingle();
      return data;
    }),
    enabled: !!uid, staleTime: 30_000,
  });

  const { data: rawMeals = [], isLoading: l2 } = useQuery({
    queryKey: DAILY_KEYS.meals(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('food_logs').select('*').eq('user_id', uid).gte('date', `${today}T00:00:00${tz}`).lte('date', `${today}T23:59:59${tz}`);
      return data || [];
    }),
    enabled: !!uid, staleTime: 30_000,
  });

  const { data: rawWeight } = useQuery({
    queryKey: DAILY_KEYS.weight(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('measurements').select('*').eq('user_id', uid).gte('date', today).order('date', { ascending: false }).limit(1).maybeSingle();
      return data;
    }),
    enabled: !!uid, staleTime: 60_000,
  });

  const { data: rawCheckin, isLoading: l3 } = useQuery({
    queryKey: DAILY_KEYS.checkin(uid, today),
    queryFn: () => sq(async () => getDailyCheckin(uid, today)),
    enabled: !!uid,
    staleTime: 30_000,
  });

  const { data: rawProtocols = [] } = useQuery({
    queryKey: DAILY_KEYS.protocols(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('protocols').select('id, substance_name, name, frequency, active').eq('user_id', uid).eq('active', true).limit(20);
      return data || [];
    }),
    enabled: !!uid, staleTime: 120_000,
  });

  const { data: rawProtocolLogs = [] } = useQuery({
    queryKey: DAILY_KEYS.protocolLogs(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('protocol_logs').select('protocol_id, taken_at').eq('user_id', uid).gte('taken_at', `${today}T00:00:00${tz}`).lte('taken_at', `${today}T23:59:59${tz}`).limit(50);
      return data || [];
    }),
    enabled: !!uid, staleTime: 30_000,
  });

  const { data: rawProfile, isLoading: l4 } = useQuery({
    queryKey: DAILY_KEYS.profile(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('profiles').select('profile_data, full_name').eq('id', uid).single();
      return data;
    }),
    enabled: !!uid, staleTime: 300_000,
  });

  const { data: rawPlan } = useQuery({
    queryKey: DAILY_KEYS.plan(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('workout_plans').select('*').eq('user_id', uid).eq('active', true).maybeSingle();
      return data;
    }),
    enabled: !!uid, staleTime: 120_000,
  });

  const { data: rawRecentSessions = [] } = useQuery({
    queryKey: DAILY_KEYS.recentWork(uid),
    queryFn: () => sq(async () => {
      const { data } = await supabase.from('workouts').select('*').eq('user_id', uid).eq('status', 'completed').order('completed_at', { ascending: false }).limit(5);
      return data || [];
    }),
    enabled: !!uid, staleTime: 60_000,
  });

  const { data: rawWeekWork = [] } = useQuery({
    queryKey: DAILY_KEYS.weekWork(uid),
    queryFn: () => sq(async () => {
      const monday = new Date();
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      const mondayKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
      const { data } = await supabase.from('workouts').select('completed_at, status').eq('user_id', uid).eq('status', 'completed').gte('completed_at', `${mondayKey}T00:00:00${tz}`);
      return data || [];
    }),
    enabled: !!uid, staleTime: 60_000,
  });

  // ── Derived sections ──────────────────────────────────────────────────────

  const profileData = rawProfile?.profile_data ?? {};
  const preferences = profileData?.preferences && typeof profileData.preferences === 'object'
    ? profileData.preferences
    : {};
  const targets = profileData?.targets ?? {
    calories: profileData.calories_target,
    protein: profileData.protein_target,
    carbs: profileData.carbs_target,
    fat: profileData.fat_target,
  };

  const workout = useMemo(() => ({
    planned: !!rawSession,
    completed: rawSession?.status === 'completed',
    sessionName: rawSession?.workout_name || rawSession?.name || null,
    completedAt: rawSession?.completed_at || null,
    durationMinutes: rawSession?.duration_minutes || null,
  }), [rawSession]);

  const nutrition = useMemo(() => {
    const meals = Array.isArray(rawMeals) ? rawMeals : [];
    return {
      caloriesTarget: Number(targets.calories) || 0,
      caloriesConsumed: meals.reduce((s, m) => s + (Number(m.calories) || Number(m.total_calories) || 0), 0),
      proteinTarget: Number(targets.protein) || 0,
      proteinConsumed: meals.reduce((s, m) => s + (Number(m.protein) || Number(m.protein_g) || Number(m.total_protein) || 0), 0),
      carbsTarget: Number(targets.carbs) || 0,
      carbsConsumed: meals.reduce((s, m) => s + (Number(m.carbs) || Number(m.carbs_g) || Number(m.total_carbs) || 0), 0),
      fatTarget: Number(targets.fat) || 0,
      fatConsumed: meals.reduce((s, m) => s + (Number(m.fat) || Number(m.fat_g) || Number(m.total_fat) || 0), 0),
      mealsLogged: meals.length,
    };
  }, [rawMeals, targets]);

  const protocols = useMemo(() => {
    const protos = Array.isArray(rawProtocols) ? rawProtocols : [];
    const logs = Array.isArray(rawProtocolLogs) ? rawProtocolLogs : [];
    const loggedIds = new Set(logs.map((l) => l.protocol_id));
    return {
      dueToday: protos.length,
      completedToday: protos.filter((p) => loggedIds.has(p.id)).length,
      pending: protos.length - protos.filter((p) => loggedIds.has(p.id)).length,
      activeCompounds: protos.map((p) => p.substance_name || p.name).filter(Boolean),
    };
  }, [rawProtocols, rawProtocolLogs]);

  const plan = useMemo(() => {
    if (!rawPlan) return { id: null, name: null, frequency: null, todayExercises: [], todayDayLabel: null, totalDays: 0 };
    const days = Array.isArray(rawPlan.days) ? rawPlan.days : Array.isArray(rawPlan.exercises) ? [{ name: rawPlan.name, exercises: rawPlan.exercises }] : [];
    const dow = new Date().getDay();
    const dayIndex = days.length > 0 ? dow % days.length : 0;
    const todayDay = days[dayIndex];
    return {
      id: rawPlan.id,
      name: rawPlan.name || null,
      frequency: rawPlan.frequency_per_week || null,
      todayExercises: Array.isArray(todayDay?.exercises) ? todayDay.exercises : [],
      todayDayLabel: todayDay?.name || null,
      todayDayIndex: dayIndex,
      totalDays: days.length,
    };
  }, [rawPlan]);

  // ── Convenience ───────────────────────────────────────────────────────────

  const workoutDone = workout.completed;
  const nutritionLogged = nutrition.mealsLogged > 0;
  const weightLogged = rawWeight != null;
  const checkinDone = !!rawCheckin;

  // Workout streak — consecutive days with a completed workout
  const workoutStreak = useMemo(() => {
    const sessions = Array.isArray(rawRecentSessions) ? rawRecentSessions : [];
    if (!sessions.length) return 0;
    const dates = new Set(sessions.map((s) => {
      const d = new Date(s.completed_at || s.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }));
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dates.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [rawRecentSessions]);

  // ── Cascade invalidation ──────────────────────────────────────────────────

  const invalidateAfterAction = useCallback((scope = 'all') => {
    const invalidate = (key) => qc.invalidateQueries({ queryKey: key });
    if (scope === 'meal' || scope === 'all') invalidate(DAILY_KEYS.meals(uid));
    if (scope === 'workout' || scope === 'all') {
      invalidate(DAILY_KEYS.session(uid));
      invalidate(DAILY_KEYS.weekWork(uid));
      invalidate(DAILY_KEYS.recentWork(uid));
    }
    if (scope === 'weight' || scope === 'all') invalidate(DAILY_KEYS.weight(uid));
    if (scope === 'checkin' || scope === 'all') invalidate(DAILY_KEYS.checkin(uid, today));
    if (scope === 'protocol' || scope === 'all') invalidate(DAILY_KEYS.protocolLogs(uid));
    if (scope === 'plan' || scope === 'all') invalidate(DAILY_KEYS.plan(uid));
    // Always invalidate AI coach
    qc.invalidateQueries({ queryKey: [AI_COACH_KEY, uid] });
  }, [uid, qc, today]);

  const nutritionMode = profileData?.nutrition_mode || 'macros_only';
  const dailyCheckinRequired = preferences.dailyCheckinRequired !== false;

  return {
    // Structured sections
    workout,
    nutrition,
    protocols,
    plan,
    profile: profileData,
    preferences,
    nutritionMode,
    dailyCheckinRequired,
    preferredName: rawProfile?.full_name || user?.email?.split('@')[0] || 'Athlete',

    // Raw data
    todaySession: rawSession ?? null,
    todayMeals: Array.isArray(rawMeals) ? rawMeals : [],
    todayWeight: rawWeight ?? null,
    activePlan: rawPlan ?? null,
    recentSessions: Array.isArray(rawRecentSessions) ? rawRecentSessions : [],
    weekWorkoutCount: Array.isArray(rawWeekWork) ? rawWeekWork.length : 0,
    workoutStreak,

    // Booleans
    workoutDone,
    nutritionLogged,
    weightLogged,
    checkinDone,

    // Check-in
    checkin: rawCheckin ?? null,
    checkinMood: rawCheckin?.mood ?? null,
    checkinEnergy: rawCheckin?.energy ?? null,
    checkinSleepHours: rawCheckin?.sleep_hours ?? null,
    checkinHydrationLiters: rawCheckin?.hydration_liters ?? null,

    // State
    isLoading: l1 || l2 || l3 || l4,
    profileLoading: l4,

    // Actions
    invalidateAfterAction,
  };
}
