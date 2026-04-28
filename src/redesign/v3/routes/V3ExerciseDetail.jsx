import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import { findExerciseById } from '../lib/exerciseCatalog.js';
import { getPersonalBest, getSetsForExercise } from '@/lib/workoutsService';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S27_Exercise_Detail from '../screens/S27_Exercise_Detail.jsx';

function buildClassification(exercise) {
  const equipment = String(exercise?.equipment || 'Lift').toUpperCase();
  const type = (exercise?.muscles || []).length > 1 ? 'COMPOUND' : 'ACCESSORY';
  return `${equipment} · ${type}`;
}

function buildPattern(exercise) {
  const muscles = Array.isArray(exercise?.muscles) ? exercise.muscles.slice(0, 2) : [];
  return muscles.length ? `${muscles.join(' · ').toUpperCase()} PATTERN` : 'TRAINING PATTERN';
}

function buildCues(exercise) {
  const name = String(exercise?.name || '').toLowerCase();
  if (name.includes('squat')) {
    return [
      { n: '01', t: 'Brace before descent', d: 'Create pressure before you unlock the knees.' },
      { n: '02', t: 'Stay over mid-foot', d: 'Keep pressure centered instead of drifting to the toes.' },
      { n: '03', t: 'Drive up together', d: 'Chest and hips should rise at the same speed.' },
      { n: '04', t: 'Finish tall', d: 'Stand through the rep, then breathe again at the top.' },
    ];
  }
  if (name.includes('press')) {
    return [
      { n: '01', t: 'Set the upper back', d: 'Create a stable base before the first rep starts.' },
      { n: '02', t: 'Control the lowering', d: 'Earn the bottom position instead of dropping into it.' },
      { n: '03', t: 'Press through the line', d: 'Keep the bar path efficient instead of drifting wide.' },
      { n: '04', t: 'Lock out clean', d: 'Finish the rep without losing shoulder position.' },
    ];
  }
  return [
    { n: '01', t: 'Set the start position', d: 'Make the first inch of the rep look identical every time.' },
    { n: '02', t: 'Keep tension', d: 'Do not leak force between the eccentric and concentric.' },
    { n: '03', t: 'Own the range', d: 'Use the range you can repeat without cheating the pattern.' },
    { n: '04', t: 'Finish deliberately', d: 'End each rep in control instead of rushing to the next one.' },
  ];
}

function buildMuscleEngagement() {
  // Muscle engagement percentages were previously fabricated from array index.
  // Return null so the screen hides the section until real data is available.
  return null;
}

function buildHistoryLine(sets) {
  if (!Array.isArray(sets) || sets.length === 0) return undefined;
  const points = sets
    .filter((set) => !set.is_warmup)
    .sort((a, b) => new Date(a.started_at || a.performed_at || 0) - new Date(b.started_at || b.performed_at || 0))
    .slice(-14)
    .map((set, index) => ({ k: index, v: Number(set.weight_kg) || 0 }));
  return points.length ? points : undefined;
}

export default function V3ExerciseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const t = useT();
  const exercise = useMemo(() => findExerciseById(id), [id]);
  const [sets, setSets] = useState([]);
  const [best, setBest] = useState(null);
  const savedExercisesKey = 'atlas.exercise_saves.v1';

  useEffect(() => {
    let cancelled = false;
    if (!id) return undefined;
    (async () => {
      try {
        const [historyRows, personalBest] = await Promise.all([
          getSetsForExercise(id, { limit: 120 }),
          getPersonalBest(id),
        ]);
        if (cancelled) return;
        setSets(Array.isArray(historyRows) ? historyRows : []);
        setBest(personalBest || null);
      } catch {
        if (!cancelled) {
          setSets([]);
          setBest(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <V3StandaloneLayout>
      <S27_Exercise_Detail
        dark={theme === 'dark'}
        title={exercise?.name || 'Exercise'}
        classification={buildClassification(exercise)}
        musclePattern={buildPattern(exercise)}
        bestWeight={best?.weight ? Math.round(best.weight) : 0}
        bestReps={best?.reps || 0}
        bestDate={best?.achievedAt}
        history={buildHistoryLine(sets)}
        historyDelta={sets.length ? `${sets.length} logged sets` : 'No logged sets yet'}
        cues={buildCues(exercise)}
        muscleEngagement={buildMuscleEngagement(exercise)}
        onBack={() => navigate(-1)}
        onSave={() => {
          try {
            const saved = JSON.parse(localStorage.getItem(savedExercisesKey) || '[]');
            const next = Array.from(new Set([...saved, id]));
            localStorage.setItem(savedExercisesKey, JSON.stringify(next));
          } catch { /* storage unavailable */ }
          toast.success(t('exercises.detail.savedToast'));
        }}
        onFavorite={({ favorite }) => {
          try {
            const saved = JSON.parse(localStorage.getItem(savedExercisesKey) || '[]');
            const next = favorite
              ? Array.from(new Set([...saved, id]))
              : saved.filter((exerciseId) => exerciseId !== id);
            localStorage.setItem(savedExercisesKey, JSON.stringify(next));
          } catch { /* storage unavailable */ }
          toast.success(favorite ? t('exercises.detail.favoritedToast') : t('exercises.detail.unfavoritedToast'));
        }}
        onOpenHistory={() => navigate('/app/workouts/history', { state: { exerciseId: id } })}
        onLogSet={() => navigate('/app/workouts/active')}
      />
    </V3StandaloneLayout>
  );
}
