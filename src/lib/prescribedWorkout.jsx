const SESSION_KEYS = ['sessions', 'workout_days', 'days', 'day_plans', 'weekly_plan'];
const EXERCISE_KEYS = ['exercises', 'items', 'movements'];

function toArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function pickExerciseList(container) {
  for (const key of EXERCISE_KEYS) {
    const value = container?.[key];
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
  }

  return [];
}

function hasNestedExercises(item) {
  return EXERCISE_KEYS.some((key) => Array.isArray(item?.[key]));
}

function normalizeExercise(exercise) {
  const firstSet = Array.isArray(exercise?.sets) ? exercise.sets[0] : null;
  const sets =
    Array.isArray(exercise?.sets)
      ? exercise.sets.length
      : Number(exercise?.sets ?? exercise?.series ?? 0) || 0;
  const reps =
    exercise?.reps ??
    exercise?.rep_count ??
    firstSet?.reps ??
    firstSet?.target_reps ??
    '';

  return {
    ...exercise,
    name: exercise?.name ?? exercise?.exercise_name ?? exercise?.title ?? 'Exercise',
    sets,
    reps,
  };
}

export function summarizePrescribedWorkout(prescribedWorkout) {
  const sessions = getPrescribedWorkoutSessions(prescribedWorkout);
  const exercises = flattenPrescribedWorkoutExercises(prescribedWorkout);
  const muscleGroups = Array.from(
    new Set(
      exercises
        .flatMap((exercise) => exercise.primary_muscles || exercise.muscle_groups || [])
        .filter(Boolean)
    )
  );
  const totalSets = exercises.reduce((sum, exercise) => sum + Number(exercise.sets || 0), 0);

  return {
    sessionCount: sessions.length,
    exerciseCount: exercises.length,
    totalSets,
    muscleGroups,
    firstExercise: exercises[0]?.name || null,
  };
}

export function getPrescribedWorkoutSessions(prescribedWorkout) {
  if (!prescribedWorkout || typeof prescribedWorkout !== 'object') {
    return [];
  }

  for (const key of SESSION_KEYS) {
    const sessions = toArray(prescribedWorkout[key]);
    if (sessions.length > 0) {
      return sessions;
    }
  }

  const exercises = pickExerciseList(prescribedWorkout);
  if (exercises.length === 0) {
    return [];
  }

  if (exercises.some(hasNestedExercises)) {
    return exercises;
  }

  return [
    {
      ...prescribedWorkout,
      exercises,
    },
  ];
}

export function flattenPrescribedWorkoutExercises(prescribedWorkout) {
  const sessions = getPrescribedWorkoutSessions(prescribedWorkout);

  if (sessions.length === 0) {
    return pickExerciseList(prescribedWorkout).map(normalizeExercise);
  }

  return sessions.flatMap((session) => pickExerciseList(session).map(normalizeExercise));
}

export default {
  flattenPrescribedWorkoutExercises,
  getPrescribedWorkoutSessions,
  summarizePrescribedWorkout,
};
