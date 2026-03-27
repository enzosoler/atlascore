import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ClipboardList, Loader2, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getMyClients } from '@/services/professionalLinksService';
import { useAuth } from '@/lib/AuthContext';
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

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['coach-students', user?.id],
    queryFn: () => getMyClients(user.id, 'coach').then((all) => all.filter((s) => s.status === 'active')),
    enabled: !!user?.id,
  });

  const studentEmails = students.map((student) => student.client_email);

  const { data: checkins = [] } = useQuery({
    queryKey: ['coach-checkins-recent', studentEmails],
    queryFn: () => base44.entities.DailyCheckin.list('-date', 50),
    enabled: studentEmails.length > 0,
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ['coach-workouts-pending', studentEmails],
    queryFn: () => base44.entities.Workout.list('-date', 100),
    enabled: studentEmails.length > 0,
  });

  const recentCheckins = checkins.filter((checkin) => studentEmails.includes(checkin.created_by));
  const avgAdherence = recentCheckins.length
    ? Math.round(
        recentCheckins.reduce((sum, checkin) => sum + (checkin.adherence_score || 0), 0) /
          recentCheckins.length
      )
    : null;
  const pendingWorkouts = workouts.filter(
    (workout) => !workout.completed && studentEmails.includes(workout.created_by)
  ).length;

  return (
    <RoleGate roles={['coach', 'admin']}>
      <PageShell title="Coach" subtitle="Operational view of adherence, active athletes, and follow-up priorities." maxWidth="max-w-6xl">
        <WorkspaceHeader
          eyebrow="Coach role"
          title="Coach dashboard"
          subtitle="Start with the athletes who need attention, then move into adherence and pending execution."
          icon={Users}
          tone="brand"
          badge={`${students.length} active athletes`}
        />

        {isLoading ? (
          <SectionCard title="Loading" subtitle="Pulling active athlete context.">
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading coach workspace...
            </div>
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-3">
              <WorkspaceMetricTile
                label="Active athletes"
                value={students.length}
                hint="Linked and accepted student accounts"
                icon={Users}
              />
              <WorkspaceMetricTile
                label="Average adherence"
                value={avgAdherence !== null ? `${avgAdherence}%` : '--'}
                hint="Recent daily check-in adherence"
                icon={TrendingUp}
                tone="success"
              />
              <WorkspaceMetricTile
                label="Pending workouts"
                value={pendingWorkouts}
                hint="Incomplete logged sessions across your athletes"
                icon={ClipboardList}
                tone="warning"
              />
            </WorkspaceMetricGrid>

            <WorkspaceRosterSection
              eyebrow="Athletes"
              title="Recent student activity"
              subtitle="Quick access to the athletes you are currently coaching."
              action={
                <Link
                  to="/coach/students"
                  className="text-[13px] font-semibold text-[hsl(var(--brand))]"
                >
                  View all
                </Link>
              }
              emptyIcon={Users}
              emptyTitle="No students linked yet"
              emptyDescription="Invite your first athlete to unlock adherence, programming, and follow-up."
            >
              {students.slice(0, 5).map((student) => (
                <WorkspacePersonRow
                  key={student.id}
                  to={`/coach/student/${student.client_id}`}
                  initial={(student.client_name || student.client_email)?.[0]?.toUpperCase() || 'A'}
                  title={student.client_name || student.client_email}
                  subtitle={student.client_email}
                  meta={student.status === 'active' ? 'Active coaching link' : student.status}
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
