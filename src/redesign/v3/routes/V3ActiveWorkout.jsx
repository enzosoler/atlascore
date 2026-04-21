import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen.jsx';
import { saveCompletedWorkout } from '@/services/workoutService';
import { fetchRecentWorkoutHistory, computePersonalRecords } from '@/services/workoutHistoryService';
import { loadSession } from '@/lib/workoutSession';
import { DEMO_EXERCISES } from '@/redesign/v3/lib/exerciseCatalog.js';
import { listRoutines, markRoutineUsed, saveWorkoutSession } from '@/lib/workoutsService';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function findExerciseIdByName(name) {
  const key = normalizeText(name);
  if (!key) return null;
  const match = DEMO_EXERCISES.find((exercise) => {
    if (normalizeText(exercise.name) === key) return true;
    return Array.isArray(exercise.aliases) && exercise.aliases.some((alias) => normalizeText(alias) === key);
  });
  return match?.id || null;
}

function coercePositiveInt(...values) {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return Math.round(num);
  }
  return null;
}

function coerceTargetReps(item) {
  const direct = item?.target_reps || item?.reps || item?.rep_range;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();
  if (typeof direct === 'number' && direct > 0) return String(Math.round(direct));
  const sets = Array.isArray(item?.sets) ? item.sets : [];
  const first = sets.find(Boolean);
  const nested = first?.target_reps || first?.reps;
  if (typeof nested === 'string' && nested.trim()) return nested.trim();
  if (typeof nested === 'number' && nested > 0) return String(Math.round(nested));
  return '8-12';
}

function buildSetTemplates(item, targetSets, targetReps, targetWeight) {
  const sourceSets = Array.isArray(item?.sets) ? item.sets : [];
  if (sourceSets.length > 0) {
    return sourceSets.map((set, index) => ({
      set_number: index + 1,
      target_reps: set?.target_reps || set?.reps || targetReps,
      target_weight: set?.target_weight ?? set?.weight ?? targetWeight ?? null,
    }));
  }
  return Array.from({ length: targetSets }, (_, index) => ({
    set_number: index + 1,
    target_reps: targetReps,
    target_weight: targetWeight ?? null,
  }));
}

function mapPlanExercise(item, t) {
  const name = item?.exercise_name || item?.name || item?.manual_exercise_name || t('workoutExecution.fallbackExercise');
  const exerciseId = item?.exerciseId || item?.exercise_id || item?.exercise_master_id || item?.id || findExerciseIdByName(name);
  const catalog = exerciseId ? DEMO_EXERCISES.find((entry) => entry.id === exerciseId) : null;
  const targetSets = coercePositiveInt(item?.target_sets, item?.sets?.length, item?.set_count) || 3;
  const targetReps = coerceTargetReps(item);
  const targetWeight = item?.target_weight ?? item?.weight ?? null;

  return {
    name,
    exercise_master_id: exerciseId || null,
    primary_muscles: catalog?.muscles || [],
    rest_seconds: coercePositiveInt(item?.rest_seconds, item?.restSec, item?.rest) || 60,
    target_sets: targetSets,
    target_reps: targetReps,
    target_weight: targetWeight,
    sets: buildSetTemplates(item, targetSets, targetReps, targetWeight),
  };
}

function mapWorkoutSourceToExecution(source, t) {
  const exercises = Array.isArray(source?.exercises) ? source.exercises.map((item) => mapPlanExercise(item, t)) : [];
  return {
    name: source?.sessionName || source?.name || t('workoutExecution.freeSession'),
    plan_id: source?.planId || null,
    routineId: source?.routineId || null,
    plan_day_index: source?.planDayIndex ?? null,
    exercises,
  };
}

function pickRoutineDay(days) {
  if (!Array.isArray(days) || days.length === 0) return { day: null, index: 0 };
  const dayIndex = new Date().getDay() % days.length;
  return { day: days[dayIndex] || days[0], index: dayIndex };
}

export default function V3ActiveWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useT();
  const { activePlan, plan, invalidateAfterAction } = useDailyStateV2();
  const [routines, setRoutines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const persistedSession = useMemo(() => loadSession(), []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setLoading(false);
      return () => {};
    }

    (async () => {
      setLoading(true);
      try {
        const [routineRows, workoutHistory] = await Promise.all([
          listRoutines(),
          fetchRecentWorkoutHistory(user.id).catch(() => []),
        ]);
        if (cancelled) return;
        setRoutines(Array.isArray(routineRows) ? routineRows : []);
        setHistory(Array.isArray(workoutHistory) ? workoutHistory : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const workout = useMemo(() => {
    if (persistedSession?.workout) return persistedSession.workout;

    if (activePlan && Array.isArray(plan?.todayExercises) && plan.todayExercises.length > 0) {
      return mapWorkoutSourceToExecution({
        sessionName: [activePlan.name, plan.todayDayLabel].filter(Boolean).join(' · ') || activePlan.name || t('workoutExecution.todayWorkout'),
        planId: activePlan.id,
        planDayIndex: plan.todayDayIndex ?? 0,
        exercises: plan.todayExercises,
      }, t);
    }

    const routine = Array.isArray(routines) ? routines[0] : null;
    if (routine) {
      const days = Array.isArray(routine.days) ? routine.days : [];
      const { day, index } = pickRoutineDay(days);
      return mapWorkoutSourceToExecution({
        sessionName: [routine.name, day?.name].filter(Boolean).join(' · ') || routine.name || t('workoutExecution.savedRoutine'),
        routineId: routine.id,
        planDayIndex: index,
        exercises: Array.isArray(day?.exercises) ? day.exercises : [],
      }, t);
    }

    return {
      name: t('workoutExecution.freeSession'),
      plan_id: null,
      routineId: null,
      plan_day_index: null,
      exercises: [],
    };
  }, [persistedSession, activePlan, plan, routines, t]);

  useEffect(() => {
    if (persistedSession?.workout || !workout?.routineId) return;
    markRoutineUsed(workout.routineId).catch(() => {});
  }, [persistedSession?.workout, workout?.routineId]);

  const personalRecords = useMemo(() => computePersonalRecords(history), [history]);

  if (loading) return null;

  return (
    <WorkoutExecutionScreen
      workout={workout}
      initialSession={persistedSession}
      workoutHistory={history}
      personalRecords={personalRecords}
      onCancel={() => navigate('/app/train')}
      onComplete={async (payload) => {
        if (!user?.id) {
          toast.error(t('workoutExecution.mustBeSignedIn'));
          return;
        }

        try {
          await saveCompletedWorkout(user.id, payload, workout);

          const endedAt = new Date();
          const startedAt = persistedSession?.startedAt
            ? new Date(persistedSession.startedAt)
            : new Date(endedAt.getTime() - Math.max(1, Number(payload.duration_minutes) || 1) * 60_000);

          const flatSets = (payload.exercises_completed || []).flatMap((exercise) => {
            const exerciseId = exercise.exercise_master_id || findExerciseIdByName(exercise.name);
            if (!exerciseId) return [];
            return (exercise.sets_completed || [])
              .filter((set) => set?.reps_actual || set?.load_actual)
              .map((set, setIndex) => ({
                exerciseId,
                setIndex: setIndex + 1,
                weightKg: set.load_actual ?? null,
                reps: set.reps_actual ?? null,
                rir: set.rir_actual ?? null,
                isWarmup: false,
              }));
          });

          if (flatSets.length > 0) {
            try {
              await saveWorkoutSession({
                routineId: workout.routineId || null,
                startedAt,
                endedAt,
                sets: flatSets,
              });
            } catch (sidecarError) {
              console.warn('[V3ActiveWorkout] workout session mirror failed', sidecarError?.message || sidecarError);
            }
          }

          invalidateAfterAction('workout');
          navigate('/app/workouts/history', { replace: true });
        } catch (error) {
          console.error('[V3ActiveWorkout] save failed', error);
          toast.error(error?.message || t('workoutExecution.saveFailed'));
        }
      }}
    />
  );
}
