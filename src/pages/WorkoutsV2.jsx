import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Play, Plus, Loader2, ChevronDown, ChevronUp, CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { getActiveWorkoutPlans } from '@/services/workoutPlanService';
import { getRecentWorkouts, saveCompletedWorkout } from '@/services/workoutService';

// ... (helpers buildSessionFromPlan, planExToExecution remain the same)

function planExToExecution(ex) {
  const setCount = typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 3;
  const setsArr = Array.from({ length: setCount }, (_, i) => ({
    set_number: i + 1,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.target_weight ?? null,
  }));
  return {
    name: ex.name,
    primary_muscles: ex.muscle_group ? [ex.muscle_group] : [],
    technique: ex.technique || null,
    rest_seconds: ex.rest_seconds || 60,
    execution_notes: ex.notes || null,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.target_weight ?? null,
    media_gif_url: ex.media_gif_url || null,
    sets: setsArr,
  };
}

function buildSessionFromPlan(plan, dayIndex) {
  const day = plan.days[dayIndex];
  return {
    name: day.name || day.day || `Dia ${dayIndex + 1}`,
    date: new Date().toISOString().split('T')[0],
    plan_id: plan.id,
    plan_day_index: dayIndex,
    status: 'in_progress', // This is a transient status for the UI
    exercises: (day.exercises || []).map(planExToExecution),
  };
}


export default function WorkoutsV2() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('list'); // list, execution
  const [activeSession, setActiveSession] = useState(null);

  const { data: activePlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      const plans = await getActiveWorkoutPlans(user.id);
      return plans[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: recentSessions, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recent-workouts', user?.id],
    queryFn: () => getRecentWorkouts(user.id, 5),
    enabled: !!user?.id,
  });

  const saveWorkoutMut = useMutation({
    mutationFn: ({ userId, payload, originalWorkout }) => saveCompletedWorkout(userId, payload, originalWorkout),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recent-workouts'] });
      setMode('list');
      setActiveSession(null);
    },
    onError: () => {
      toast.error('Erro ao salvar o treino. Verifique sua conexão.');
    },
  });

  const handleStartFromPlan = (dayIndex) => {
    if (!activePlan) return;
    const sessionData = buildSessionFromPlan(activePlan, dayIndex);
    setActiveSession(sessionData);
    setMode('execution');
  };

  const handleStartEmpty = () => {
    setActiveSession({ name: 'Treino Livre', exercises: [] });
    setMode('execution');
  };

  const handleCompleteWorkout = (completedData) => {
    if (!user?.id || !activeSession) return;
    saveWorkoutMut.mutate({ userId: user.id, payload: completedData, originalWorkout: activeSession });
  };

  if (mode === 'execution') {
    return (
      <WorkoutExecutionScreen
        workout={activeSession}
        onComplete={handleCompleteWorkout}
        onBack={() => setMode('list')}
      />
    );
  }

  // ... (rest of the list rendering, PlanDayCard, RecentSessionCard, etc.)

}
