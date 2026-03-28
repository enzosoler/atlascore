import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

/**
 * useDailyState — single source of truth for today's workout + nutrition state.
 *
 * Used by: Today page, WorkoutsV2, AI coach, QuickActions, ReadinessRow.
 * All consumers share the same React Query cache keys, so invalidation
 * from any page propagates everywhere instantly.
 */

const todayISO = () => new Date().toISOString().split('T')[0];

export const DAILY_QUERY_KEYS = {
  todaySession: (userId) => ['daily-today-session', userId],
  todayMeals:   (userId) => ['daily-today-meals', userId],
  todayWeight:  (userId) => ['daily-today-weight', userId],
};

export function useDailyState() {
  const { user } = useAuth();
  const uid = user?.id;

  const { data: todaySession, isLoading: sessionLoading } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todaySession(uid),
    queryFn: async () => {
      const today = todayISO();
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', uid)
        .eq('date', today)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
    staleTime: 30_000,
  });

  const { data: todayMeals = [], isLoading: mealsLoading } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todayMeals(uid),
    queryFn: async () => {
      const today = todayISO();
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', uid)
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!uid,
    staleTime: 30_000,
  });

  const { data: todayWeight, isLoading: weightLoading } = useQuery({
    queryKey: DAILY_QUERY_KEYS.todayWeight(uid),
    queryFn: async () => {
      const today = todayISO();
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', uid)
        .gte('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!uid,
    staleTime: 60_000,
  });

  const workoutDone = todaySession?.status === 'completed';
  const nutritionLogged = todayMeals.length > 0;
  const weightLogged = !!todayWeight;
  const totalKcal = todayMeals.reduce((s, m) => s + (m.calories || m.total_calories || 0), 0);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein_g || m.total_protein || 0), 0);

  return {
    // Raw data
    todaySession,
    todayMeals,
    todayWeight,

    // Derived booleans
    workoutDone,
    nutritionLogged,
    weightLogged,

    // Aggregates
    totalKcal,
    totalProtein,

    // Loading
    isLoading: sessionLoading || mealsLoading || weightLoading,
  };
}
