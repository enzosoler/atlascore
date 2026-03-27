import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import AdherenceComparison from '@/components/shared/AdherenceComparison';
import {
  flattenPrescribedWorkoutExercises,
  getPrescribedWorkoutSessions,
} from '@/lib/prescribedWorkout';

/**
 * CoachStudentAdherence — Shows athlete's workout adherence vs prescribed
 */
export default function CoachStudentAdherence({ studentEmail, weeks = 4 }) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data: workouts = [] } = useQuery({
    queryKey: ['student-workouts', studentEmail, startDateStr],
    queryFn: async () => [],
  });

  const { data: prescribed = [] } = useQuery({
    queryKey: ['prescribed-workouts', studentEmail],
    queryFn: async () => [],
  });

  // Count completed workouts (status = 'completed')
  const completedCount = workouts.filter(w => w.status === 'completed').length;

  // Calculate expected from prescribed
  const expectedCount = prescribed.length > 0
    ? prescribed.reduce((sum, p) => {
        const inferredFromFrequency = p.frequency?.includes('2')
          ? 2
          : p.frequency?.includes('3')
          ? 3
          : null;
        return sum + (inferredFromFrequency || getPrescribedWorkoutSessions(p).length || 1);
      }, 0)
    : 0;

  // Calculate total volume (sets × reps)
  const actualVolume = workouts.reduce((sum, w) => {
    const wVol = w.exercises?.reduce((s, ex) => s + ((ex.sets || 0) * (ex.reps || 0)), 0) || 0;
    return sum + wVol;
  }, 0);

  const prescribedVolume = prescribed.reduce((sum, p) => {
    const pVol = flattenPrescribedWorkoutExercises(p).reduce(
      (s, ex) => s + (Number(ex.sets || 0) * (parseInt(ex.reps, 10) || 0)),
      0
    );
    return sum + pVol;
  }, 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="t-subtitle flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4" /> Workout adherence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdherenceComparison
          label="Completed sessions"
          actual={completedCount}
          prescribed={expectedCount}
          unit="sessions"
        />
        {prescribedVolume > 0 && (
          <AdherenceComparison
            label="Volume total (sets × reps)"
            actual={actualVolume}
            prescribed={prescribedVolume}
            unit="reps"
          />
        )}
      </div>

      {prescribed.length === 0 && (
        <div className="p-4 rounded-xl bg-[hsl(var(--shell))] border border-[hsl(var(--border-h))] text-center">
          <p className="t-small text-[hsl(var(--fg-2))]">No prescribed workout yet</p>
        </div>
      )}
    </div>
  );
}
