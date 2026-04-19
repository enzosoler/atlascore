import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/lib/ThemeContext';
import { listRoutines } from '@/lib/workoutsService';
import { findExerciseById as findCatalogExercise } from '../lib/exerciseCatalog.js';
import S25_Program_Detail from '../screens/S25_Program_Detail.jsx';

function buildRoutineMeta(routine) {
  if (!routine) return 'Saved routine';
  const days = Array.isArray(routine.days) ? routine.days : [];
  const exerciseIds = new Set();
  days.forEach((day) => {
    (day.exercises || []).forEach((item) => {
      if (item.exerciseId) exerciseIds.add(item.exerciseId);
    });
  });
  return `${Math.max(1, days.length)} D/WK · ${exerciseIds.size || 0} lifts`;
}

function buildRoutineDescription(routine) {
  if (!routine) return 'Saved training split. Start it, edit it, or use it as the basis for your next block.';
  const days = Array.isArray(routine.days) ? routine.days : [];
  const muscles = new Set();
  days.forEach((day) => {
    (day.exercises || []).forEach((item) => {
      const exercise = item.exerciseId ? findCatalogExercise(item.exerciseId) : null;
      (exercise?.muscles || []).forEach((muscle) => muscles.add(muscle));
    });
  });
  const focus = Array.from(muscles).slice(0, 3).join(', ');
  return focus
    ? `Saved split touching ${focus}. Use it as-is or keep refining it before your next session.`
    : 'Saved training split. Start it, edit it, or use it as the basis for your next block.';
}

export default function V3RoutineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data: routines = [] } = useQuery({
    queryKey: ['v3-routine-detail', id],
    queryFn: () => listRoutines(),
  });

  const routine = useMemo(
    () => (Array.isArray(routines) ? routines.find((row) => String(row.id) === String(id)) || null : null),
    [id, routines],
  );

  const matchLabel = routine?.source_preset_id ? 'Preset-derived routine' : 'Saved routine';

  return (
    <S25_Program_Detail
      dark={theme === 'dark'}
      programCode={routine ? `ROUTINE ${String(routine.id).slice(0, 6).toUpperCase()}` : 'ROUTINE'}
      matchLabel={matchLabel}
      title={routine?.name || 'Saved routine'}
      accentWord=""
      meta={buildRoutineMeta(routine)}
      description={buildRoutineDescription(routine)}
      onBack={() => navigate('/app/workouts')}
      onSave={undefined}
      onPreviewWeek={() => navigate('/app/routines')}
      onStartProgram={() => navigate('/app/workouts/active')}
    />
  );
}
