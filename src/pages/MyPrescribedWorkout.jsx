import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Dumbbell, Calendar } from 'lucide-react';
import AdherenceComparison from '@/components/shared/AdherenceComparison';
import { AppContainer, Card, PageHeader } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, SecondaryButton, StatusBanner } from '@/components/shared/StablePage';
import { ROUTES } from '@/lib/routes';
import {
  flattenPrescribedWorkoutExercises,
  getPrescribedWorkoutSessions,
  summarizePrescribedWorkout,
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
  const summary = prescribed.length > 0 ? summarizePrescribedWorkout(prescribed[0]) : null;

  return (
    <AppContainer maxWidth="max-w-4xl">
      <PageHeader
        eyebrow="Plan vs execution"
        title="Prescribed workout"
        subtitle="This view is the reference template. Completed workouts live separately as history."
      />

      <div className="space-y-4">
        <StatusBanner tone="neutral">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[hsl(var(--fg))]">Built for continuity</p>
            <p className="text-sm leading-6 text-[hsl(var(--fg-2))]">
              Use this view to compare the prescribed structure against what was actually logged.
            </p>
          </div>
        </StatusBanner>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

        {summary && (
          <Card className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-blue gap-1">
                <Dumbbell className="h-3 w-3" />
                {summary.sessionCount} sessions
              </span>
              <span className="badge badge-neutral gap-1">
                <Activity className="h-3 w-3" />
                {summary.exerciseCount} exercises
              </span>
              {summary.totalSets > 0 && (
                <span className="badge badge-neutral gap-1">
                  <Calendar className="h-3 w-3" />
                  {summary.totalSets} sets
                </span>
              )}
            </div>
            {summary.firstExercise && (
              <p className="t-body text-[hsl(var(--fg-2))]">
                First exercise in the prescription: <span className="font-semibold text-[hsl(var(--fg))]">{summary.firstExercise}</span>
              </p>
            )}
          </Card>
        )}

        {prescribed.length === 0 && (
          <Card className="p-4">
            <EmptyState
              icon={Dumbbell}
              title="No prescribed workout synced"
              description="When a coach-assigned routine is available, it will appear here with its own history comparison."
              action={(
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SecondaryButton className="gap-2" onClick={() => window.history.back()}>
                    Back
                  </SecondaryButton>
                  <PrimaryButton className="gap-2" onClick={() => window.location.assign(ROUTES.routines)}>
                    View routines
                  </PrimaryButton>
                </div>
              )}
            />
          </Card>
        )}
      </div>
    </AppContainer>
  );
}
