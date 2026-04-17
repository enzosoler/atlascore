import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, Loader2, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getMyClients } from '@/services/professionalLinksService';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import RoleGate from '@/components/rbac/RoleGate';
import { PageShell, SectionCard } from '@/components/shared/StablePage';
import {
  WorkspaceHeader,
  WorkspaceMetricGrid,
  WorkspaceMetricTile,
  WorkspaceRosterSection,
  WorkspacePersonRow,
} from '@/components/shared/ProfessionalUI';

export default function CoachDashboard() {
  const { user } = useAuth();
  const t = useT();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['coach-students', user?.id],
    queryFn: () => getMyClients(user.id, 'coach').then((all) => all.filter((s) => s.status === 'active')),
    enabled: !!user?.id,
  });

  const studentIds = students.map((student) => student.client_id).filter(Boolean);

  const { data: checkins = [] } = useQuery({
    queryKey: ['coach-checkins-recent', studentIds],
    queryFn: async () => {
      const { data } = await supabase.from('daily_checkins').select('*').in('user_id', studentIds).order('date', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: studentIds.length > 0,
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['coach-workouts-pending', studentIds],
    queryFn: async () => {
      const { data } = await supabase.from('workouts').select('*').in('user_id', studentIds).order('date', { ascending: false }).limit(100);
      return data || [];
    },
    enabled: studentIds.length > 0,
  });

  const avgAdherence = checkins.length
    ? Math.round(
        checkins.reduce((sum, checkin) => sum + (checkin.adherence_score || 0), 0) /
          checkins.length
      )
    : null;
  const pendingWorkouts = workouts.filter(
    (workout) => !workout.completed
  ).length;

  return (
    <RoleGate roles={['coach', 'admin']}>
      <PageShell title={t('coach.dashboard.pageTitle')} subtitle={t('coach.dashboard.pageSubtitle')} maxWidth="max-w-6xl">
        <WorkspaceHeader
          eyebrow={t('coach.dashboard.eyebrow')}
          title={t('coach.dashboard.title')}
          subtitle={t('coach.dashboard.subtitle')}
          icon={Users}
          tone="brand"
          badge={`${students.length} ${t('coach.dashboard.activeAthletesBadge')}`}
        />

        {isLoading ? (
          <SectionCard title={t('coach.dashboard.loadingTitle')} subtitle={t('coach.dashboard.loadingSubtitle')}>
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('coach.dashboard.loadingText')}
            </div>
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-3">
              <WorkspaceMetricTile
                label={t('coach.dashboard.metricActiveAthletes')}
                value={students.length}
                hint={t('coach.dashboard.metricActiveAthletesHint')}
                icon={Users}
              />
              <WorkspaceMetricTile
                label={t('coach.dashboard.metricAvgAdherence')}
                value={avgAdherence !== null ? `${avgAdherence}%` : '--'}
                hint={t('coach.dashboard.metricAvgAdherenceHint')}
                icon={TrendingUp}
                tone="success"
              />
              <WorkspaceMetricTile
                label={t('coach.dashboard.metricPendingWorkouts')}
                value={pendingWorkouts}
                hint={t('coach.dashboard.metricPendingWorkoutsHint')}
                icon={ClipboardList}
                tone="warning"
              />
            </WorkspaceMetricGrid>

            <WorkspaceRosterSection
              eyebrow={t('coach.dashboard.rosterEyebrow')}
              title={t('coach.dashboard.rosterTitle')}
              subtitle={t('coach.dashboard.rosterSubtitle')}
              action={
                <Link
                  to="/coach/students"
                  className="text-[13px] font-semibold text-[hsl(var(--brand))]"
                >
                  {t('coach.dashboard.viewAll')}
                </Link>
              }
              emptyIcon={Users}
              emptyTitle={t('coach.dashboard.emptyTitle')}
              emptyDescription={t('coach.dashboard.emptyDescription')}
            >
              {students.slice(0, 5).map((student) => (
                <WorkspacePersonRow
                  key={student.id}
                  to={`/coach/student/${student.client_id}`}
                  initial={(student.client_name || student.client_email)?.[0]?.toUpperCase() || 'A'}
                  title={student.client_name || student.client_email}
                  subtitle={student.client_email}
                  meta={student.status === 'active' ? t('coach.dashboard.activeCoachingLink') : student.status}
                  accentTone="brand"
                />
              ))}
            </WorkspaceRosterSection>
          </>
        )}
      </PageShell>
    </RoleGate>
  );
}
