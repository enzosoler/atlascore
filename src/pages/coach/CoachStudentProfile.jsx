import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  Camera,
  ClipboardList,
  Dumbbell,
  Loader2,
  Scale,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import RoleGate from '@/components/rbac/RoleGate';
import {
  EmptyState,
  PageShell,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
} from '@/components/shared/StablePage';
import {
  WorkspaceMetricGrid,
  WorkspaceMetricTile,
} from '@/components/shared/ProfessionalUI';
import CoachStudentAdherence from '@/components/coach/CoachStudentAdherence';
import { flattenPrescribedWorkoutExercises } from '@/lib/prescribedWorkout';

function formatDate(date) {
  if (!date) return 'No date';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDate(date) {
  if (!date) return 'No date';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border)/0.72)] py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-[13px] text-[hsl(var(--fg-2))]">{label}</span>
      <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">{value || '--'}</span>
    </div>
  );
}

export default function CoachStudentProfile() {
  const { id: studentEmail } = useParams();
  const { user } = useAuth();

  const { data: coachLinks = [], isLoading: loadingLink } = useQuery({
    queryKey: ['coach-students', user?.email],
    queryFn: () => base44.entities.CoachStudent.filter({ coach_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const studentLink = useMemo(
    () => coachLinks.find((item) => item.student_email === studentEmail) || null,
    [coachLinks, studentEmail]
  );

  const { data: workouts = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['coach-student-workouts', studentEmail],
    queryFn: () => base44.entities.Workout.list('-date', 50).then((items) => items.filter((item) => item.created_by === studentEmail)),
    enabled: !!studentEmail,
  });

  const { data: checkins = [], isLoading: loadingCheckins } = useQuery({
    queryKey: ['coach-student-checkins', studentEmail],
    queryFn: () => base44.entities.DailyCheckin.list('-date', 30).then((items) => items.filter((item) => item.created_by === studentEmail)),
    enabled: !!studentEmail,
  });

  const { data: measurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['coach-student-measurements', studentEmail],
    queryFn: () => base44.entities.Measurement.list('-date', 30).then((items) => items.filter((item) => item.created_by === studentEmail)),
    enabled: !!studentEmail,
  });

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ['coach-student-photos', studentEmail],
    queryFn: () => base44.entities.ProgressPhoto.list('-date', 30).then((items) => items.filter((item) => item.created_by === studentEmail)),
    enabled: !!studentEmail,
  });

  const { data: prescribedWorkouts = [], isLoading: loadingPrescribed } = useQuery({
    queryKey: ['coach-prescribed-workouts', studentEmail],
    queryFn: () =>
      base44.entities.PrescribedWorkout
        .filter({ athlete_email: studentEmail }, '-created_date', 20)
        .then((items) => items.filter((item) => item.athlete_email === studentEmail)),
    enabled: !!studentEmail,
  });

  const latestMeasurement = measurements[0] || null;
  const latestCheckin = checkins[0] || null;
  const latestPhoto = photos[0] || null;
  const activePlans = prescribedWorkouts.filter((plan) => plan.active !== false);
  const recentCompletedWorkouts = workouts.filter((workout) => workout.status === 'completed').slice(0, 5);
  const loading =
    loadingLink ||
    loadingWorkouts ||
    loadingCheckins ||
    loadingMeasurements ||
    loadingPhotos ||
    loadingPrescribed;

  return (
    <RoleGate roles={['coach', 'admin']}>
      <PageShell
        eyebrow="Coach role"
        title={studentLink?.student_name || studentEmail || 'Athlete'}
        subtitle="Review adherence, recent body checkpoints, and active prescribed work from one calm profile surface."
        maxWidth="max-w-6xl"
        actions={
          <div className="flex flex-wrap gap-2">
            <SecondaryButton type="button" asChild={false} onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </SecondaryButton>
            <Link to={`/coach/prescribe-workout/${studentEmail}`}>
              <PrimaryButton type="button">
                <ClipboardList className="h-4 w-4" strokeWidth={2} />
                Prescribe workout
              </PrimaryButton>
            </Link>
          </div>
        }
      >
        {loading ? (
          <SectionCard title="Loading athlete profile" subtitle="Collecting adherence, recent checkpoints, and plan data.">
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading athlete profile...
            </div>
          </SectionCard>
        ) : !studentLink ? (
          <SectionCard title="Athlete not available" subtitle="This athlete is not linked to your coach account.">
            <EmptyState
              title="No linked athlete found"
              description="Open the students list and use an accepted athlete link to access this profile."
              action={
                <Link to="/coach/students">
                  <PrimaryButton type="button">Go to students</PrimaryButton>
                </Link>
              }
              icon={Activity}
            />
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-4">
              <WorkspaceMetricTile
                label="Completed sessions"
                value={workouts.filter((item) => item.status === 'completed').length}
                hint="Recent logged workouts"
                icon={Dumbbell}
                tone="brand"
              />
              <WorkspaceMetricTile
                label="Active plans"
                value={activePlans.length}
                hint="Coach-prescribed workouts currently live"
                icon={ClipboardList}
                tone="warning"
              />
              <WorkspaceMetricTile
                label="Latest weight"
                value={latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '--'}
                hint={latestMeasurement?.date ? formatDate(latestMeasurement.date) : 'No measurement yet'}
                icon={Scale}
                tone="success"
              />
              <WorkspaceMetricTile
                label="Progress photos"
                value={photos.length}
                hint={latestPhoto?.date ? `Last added ${formatShortDate(latestPhoto.date)}` : 'No photos uploaded'}
                icon={Camera}
                tone="neutral"
              />
            </WorkspaceMetricGrid>

            <SectionCard
              title="Current status"
              subtitle="A compact snapshot of the latest body checkpoint and check-in context."
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] px-5 py-5">
                  <p className="atlas-overline">Latest checkpoint</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-[20px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                      {latestMeasurement?.date ? formatDate(latestMeasurement.date) : 'No body data yet'}
                    </p>
                    <p className="text-[13px] text-[hsl(var(--fg-2))]">
                      Use this alongside adherence trends before changing workload.
                    </p>
                  </div>
                  <div className="mt-5">
                    <SummaryRow label="Weight" value={latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '--'} />
                    <SummaryRow label="Body fat" value={latestMeasurement?.body_fat ? `${latestMeasurement.body_fat}%` : '--'} />
                    <SummaryRow label="Waist" value={latestMeasurement?.waist ? `${latestMeasurement.waist} cm` : '--'} />
                    <SummaryRow label="Check-in mood" value={latestCheckin?.mood ? `${latestCheckin.mood}/5` : '--'} />
                    <SummaryRow label="Check-in energy" value={latestCheckin?.energy ? `${latestCheckin.energy}/5` : '--'} />
                  </div>
                </div>

                <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] px-5 py-5">
                  <p className="atlas-overline">Coach actions</p>
                  <div className="mt-4 space-y-3">
                    <Link to={`/coach/prescribe-workout/${studentEmail}`} className="block">
                      <PrimaryButton type="button" className="w-full justify-center">
                        <ClipboardList className="h-4 w-4" strokeWidth={2} />
                        Create or replace plan
                      </PrimaryButton>
                    </Link>
                    <Link to="/coach/students" className="block">
                      <SecondaryButton type="button" className="w-full justify-center">
                        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                        Back to roster
                      </SecondaryButton>
                    </Link>
                  </div>
                  <div className="mt-5 rounded-[16px] border border-[hsl(var(--border)/0.78)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                    <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">Access level</p>
                    <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      {studentLink.status === 'accepted'
                        ? 'Accepted link. You can review athlete progress and prescribe training.'
                        : 'Pending link. Profile data may remain limited until the invite is accepted.'}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Adherence"
              subtitle="Compare completed training against the current prescription before adjusting volume."
            >
              <CoachStudentAdherence studentEmail={studentEmail} />
            </SectionCard>

            <SectionCard
              title="Active prescribed workouts"
              subtitle="Current plans assigned to this athlete."
              actions={
                <Link to={`/coach/prescribe-workout/${studentEmail}`}>
                  <PrimaryButton type="button">
                    <ClipboardList className="h-4 w-4" strokeWidth={2} />
                    New prescription
                  </PrimaryButton>
                </Link>
              }
            >
              {activePlans.length ? (
                <div className="space-y-3">
                  {activePlans.map((plan) => {
                    const exerciseCount = flattenPrescribedWorkoutExercises(plan).length;
                    return (
                      <div
                        key={plan.id}
                        className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-5 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                              {plan.name || 'Untitled plan'}
                            </p>
                            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                              {plan.objective || plan.notes || 'Structured coach prescription for upcoming sessions.'}
                            </p>
                          </div>
                          <span className="inline-flex rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.14)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
                            {plan.frequency || 'Custom frequency'}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <SummaryRow label="Exercises" value={exerciseCount ? `${exerciseCount}` : '--'} />
                          <SummaryRow label="Start date" value={plan.start_date ? formatDate(plan.start_date) : '--'} />
                          <SummaryRow label="Status" value={plan.active !== false ? 'Active' : 'Paused'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No active plan yet"
                  description="Create the first workout prescription to give this athlete a clear execution target."
                  action={
                    <Link to={`/coach/prescribe-workout/${studentEmail}`}>
                      <PrimaryButton type="button">Prescribe workout</PrimaryButton>
                    </Link>
                  }
                  icon={ClipboardList}
                />
              )}
            </SectionCard>

            <SectionCard title="Recent workouts" subtitle="Last completed or logged training sessions for fast review.">
              {recentCompletedWorkouts.length ? (
                <div className="space-y-3">
                  {recentCompletedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
                          {workout.name || 'Workout session'}
                        </p>
                        <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
                          {workout.date ? formatDate(workout.date) : 'No recorded date'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[12px] text-[hsl(var(--fg-2))]">
                        <span>{workout.duration_minutes ? `${workout.duration_minutes} min` : 'Duration --'}</span>
                        <span>{workout.volume_load ? `${workout.volume_load} kg` : 'Volume --'}</span>
                        <span>{workout.perceived_effort ? `RPE ${workout.perceived_effort}` : 'RPE --'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No logged workouts yet"
                  description="Completed sessions will appear here once the athlete starts executing the plan."
                  icon={Dumbbell}
                />
              )}
            </SectionCard>
          </>
        )}
      </PageShell>
    </RoleGate>
  );
}
