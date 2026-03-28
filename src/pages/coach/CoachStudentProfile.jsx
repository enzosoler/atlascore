import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/lib/i18nContext';
import {
  Activity,
  ArrowLeft,
  Camera,
  ClipboardList,
  Dumbbell,
  Loader2,
  Scale,
} from 'lucide-react';
import { getMyClients } from '@/services/professionalLinksService';
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
  const { id: studentId } = useParams();
  const { user } = useAuth();
  const t = useT();

  const { data: coachLinks = [], isLoading: loadingLink } = useQuery({
    queryKey: ['coach-students', user?.id],
    queryFn: () => getMyClients(user.id, 'coach'),
    enabled: !!user?.id,
  });

  const studentLink = useMemo(
    () => coachLinks.find((item) => item.client_id === studentId) || null,
    [coachLinks, studentId]
  );

  const studentEmail = studentLink?.client_email;

  const { data: workouts = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['coach-student-workouts', studentId],
    queryFn: async () => [],
    enabled: !!studentEmail,
  });

  const { data: checkins = [], isLoading: loadingCheckins } = useQuery({
    queryKey: ['coach-student-checkins', studentId],
    queryFn: async () => [],
    enabled: !!studentEmail,
  });

  const { data: measurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['coach-student-measurements', studentId],
    queryFn: async () => [],
    enabled: !!studentEmail,
  });

  const { data: photos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ['coach-student-photos', studentId],
    queryFn: async () => [],
    enabled: !!studentEmail,
  });

  const { data: prescribedWorkouts = [], isLoading: loadingPrescribed } = useQuery({
    queryKey: ['coach-prescribed-workouts', studentId],
    queryFn: async () => [],
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
        eyebrow={t('coach.profile.eyebrow')}
        title={studentLink?.client_name || studentLink?.client_email || t('coach.profile.defaultTitle')}
        subtitle={t('coach.profile.pageSubtitle')}
        maxWidth="max-w-6xl"
        actions={
          <div className="flex flex-wrap gap-2">
            <SecondaryButton type="button" asChild={false} onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {t('coach.profile.back')}
            </SecondaryButton>
            <Link to={`/coach/prescribe-workout/${studentId}`}>
              <PrimaryButton type="button">
                <ClipboardList className="h-4 w-4" strokeWidth={2} />
                {t('coach.profile.prescribeWorkout')}
              </PrimaryButton>
            </Link>
          </div>
        }
      >
        {loading ? (
          <SectionCard title={t('coach.profile.loadingTitle')} subtitle={t('coach.profile.loadingSubtitle')}>
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('coach.profile.loadingText')}
            </div>
          </SectionCard>
        ) : !studentLink ? (
          <SectionCard title={t('coach.profile.notAvailableTitle')} subtitle={t('coach.profile.notAvailableSubtitle')}>
            <EmptyState
              title={t('coach.profile.notFoundTitle')}
              description={t('coach.profile.notFoundDescription')}
              action={
                <Link to="/coach/students">
                  <PrimaryButton type="button">{t('coach.profile.goToStudents')}</PrimaryButton>
                </Link>
              }
              icon={Activity}
            />
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-4">
              <WorkspaceMetricTile
                label={t('coach.profile.metricCompletedSessions')}
                value={workouts.filter((item) => item.status === 'completed').length}
                hint={t('coach.profile.metricCompletedSessionsHint')}
                icon={Dumbbell}
                tone="brand"
              />
              <WorkspaceMetricTile
                label={t('coach.profile.metricActivePlans')}
                value={activePlans.length}
                hint={t('coach.profile.metricActivePlansHint')}
                icon={ClipboardList}
                tone="warning"
              />
              <WorkspaceMetricTile
                label={t('coach.profile.metricLatestWeight')}
                value={latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '--'}
                hint={latestMeasurement?.date ? formatDate(latestMeasurement.date) : t('coach.profile.noMeasurementYet')}
                icon={Scale}
                tone="success"
              />
              <WorkspaceMetricTile
                label={t('coach.profile.metricProgressPhotos')}
                value={photos.length}
                hint={latestPhoto?.date ? `${t('coach.profile.lastAdded')} ${formatShortDate(latestPhoto.date)}` : t('coach.profile.noPhotosUploaded')}
                icon={Camera}
                tone="neutral"
              />
            </WorkspaceMetricGrid>

            <SectionCard
              title={t('coach.profile.currentStatusTitle')}
              subtitle={t('coach.profile.currentStatusSubtitle')}
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] px-5 py-5">
                  <p className="atlas-overline">{t('coach.profile.latestCheckpoint')}</p>
                  <div className="mt-4 space-y-1">
                    <p className="text-[20px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                      {latestMeasurement?.date ? formatDate(latestMeasurement.date) : t('coach.profile.noBodyDataYet')}
                    </p>
                    <p className="text-[13px] text-[hsl(var(--fg-2))]">
                      {t('coach.profile.checkpointHint')}
                    </p>
                  </div>
                  <div className="mt-5">
                    <SummaryRow label={t('coach.profile.labelWeight')} value={latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '--'} />
                    <SummaryRow label={t('coach.profile.labelBodyFat')} value={latestMeasurement?.body_fat ? `${latestMeasurement.body_fat}%` : '--'} />
                    <SummaryRow label={t('coach.profile.labelWaist')} value={latestMeasurement?.waist ? `${latestMeasurement.waist} cm` : '--'} />
                    <SummaryRow label={t('coach.profile.labelCheckinMood')} value={latestCheckin?.mood ? `${latestCheckin.mood}/5` : '--'} />
                    <SummaryRow label={t('coach.profile.labelCheckinEnergy')} value={latestCheckin?.energy ? `${latestCheckin.energy}/5` : '--'} />
                  </div>
                </div>

                <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] px-5 py-5">
                  <p className="atlas-overline">{t('coach.profile.coachActions')}</p>
                  <div className="mt-4 space-y-3">
                    <Link to={`/coach/prescribe-workout/${studentId}`} className="block">
                      <PrimaryButton type="button" className="w-full justify-center">
                        <ClipboardList className="h-4 w-4" strokeWidth={2} />
                        {t('coach.profile.createOrReplacePlan')}
                      </PrimaryButton>
                    </Link>
                    <Link to="/coach/students" className="block">
                      <SecondaryButton type="button" className="w-full justify-center">
                        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                        {t('coach.profile.backToRoster')}
                      </SecondaryButton>
                    </Link>
                  </div>
                  <div className="mt-5 rounded-[16px] border border-[hsl(var(--border)/0.78)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                    <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{t('coach.profile.accessLevel')}</p>
                    <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      {studentLink.status === 'active'
                        ? t('coach.profile.accessLevelActive')
                        : t('coach.profile.accessLevelPending')}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={t('coach.profile.adherenceTitle')}
              subtitle={t('coach.profile.adherenceSubtitle')}
            >
              <CoachStudentAdherence studentEmail={studentLink?.client_email} />
            </SectionCard>

            <SectionCard
              title={t('coach.profile.activePrescribedTitle')}
              subtitle={t('coach.profile.activePrescribedSubtitle')}
              actions={
                <Link to={`/coach/prescribe-workout/${studentId}`}>
                  <PrimaryButton type="button">
                    <ClipboardList className="h-4 w-4" strokeWidth={2} />
                    {t('coach.profile.newPrescription')}
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
                              {plan.name || t('coach.profile.untitledPlan')}
                            </p>
                            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                              {plan.objective || plan.notes || t('coach.profile.planDefaultDescription')}
                            </p>
                          </div>
                          <span className="inline-flex rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.14)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
                            {plan.frequency || t('coach.profile.customFrequency')}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <SummaryRow label={t('coach.profile.labelExercises')} value={exerciseCount ? `${exerciseCount}` : '--'} />
                          <SummaryRow label={t('coach.profile.labelStartDate')} value={plan.start_date ? formatDate(plan.start_date) : '--'} />
                          <SummaryRow label={t('coach.profile.labelStatus')} value={plan.active !== false ? t('coach.common.active') : t('coach.common.paused')} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={t('coach.profile.noActivePlanTitle')}
                  description={t('coach.profile.noActivePlanDescription')}
                  action={
                    <Link to={`/coach/prescribe-workout/${studentId}`}>
                      <PrimaryButton type="button">{t('coach.profile.prescribeWorkout')}</PrimaryButton>
                    </Link>
                  }
                  icon={ClipboardList}
                />
              )}
            </SectionCard>

            <SectionCard title={t('coach.profile.recentWorkoutsTitle')} subtitle={t('coach.profile.recentWorkoutsSubtitle')}>
              {recentCompletedWorkouts.length ? (
                <div className="space-y-3">
                  {recentCompletedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
                          {workout.name || t('coach.profile.workoutSession')}
                        </p>
                        <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
                          {workout.date ? formatDate(workout.date) : t('coach.profile.noRecordedDate')}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[12px] text-[hsl(var(--fg-2))]">
                        <span>{workout.duration_minutes ? `${workout.duration_minutes} min` : t('coach.profile.durationBlank')}</span>
                        <span>{workout.volume_load ? `${workout.volume_load} kg` : t('coach.profile.volumeBlank')}</span>
                        <span>{workout.perceived_effort ? `RPE ${workout.perceived_effort}` : t('coach.profile.rpeBlank')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t('coach.profile.noWorkoutsTitle')}
                  description={t('coach.profile.noWorkoutsDescription')}
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
