import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { getMyClients, removeLink } from '@/services/professionalLinksService';
import InviteModal from '@/components/shared/InviteModal';
import RoleGate from '@/components/rbac/RoleGate';
import { PageShell, SectionCard } from '@/components/shared/StablePage';
import {
  WorkspaceHeader,
  WorkspaceInviteAction,
  WorkspacePersonRow,
  WorkspaceRosterSection,
} from '@/components/shared/ProfessionalUI';

export default function CoachStudents() {
  const { user } = useAuth();
  const t = useT();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['coach-students', user?.id],
    queryFn: () => getMyClients(user.id, 'coach'),
    enabled: !!user?.id,
  });

  const removeM = useMutation({
    mutationFn: (id) => removeLink(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach-students'] }),
  });

  return (
    <RoleGate roles={['coach', 'admin']}>
      <PageShell title={t('coach.students.pageTitle')} subtitle={t('coach.students.pageSubtitle')} maxWidth="max-w-4xl">
        <WorkspaceHeader
          eyebrow={t('coach.students.eyebrow')}
          title={t('coach.students.title')}
          subtitle={t('coach.students.subtitle')}
          icon={Users}
          tone="brand"
          badge={`${students.length} ${t('coach.students.linkedBadge')}`}
          actions={<WorkspaceInviteAction label={t('coach.students.inviteStudent')} onClick={() => setShowInvite(true)} />}
        />

        {isLoading ? (
          <SectionCard title={t('coach.students.loadingTitle')} subtitle={t('coach.students.loadingSubtitle')}>
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('coach.students.loadingText')}
            </div>
          </SectionCard>
        ) : (
          <WorkspaceRosterSection
            eyebrow={t('coach.students.rosterEyebrow')}
            title={t('coach.students.rosterTitle')}
            subtitle={t('coach.students.rosterSubtitle')}
            emptyIcon={Users}
            emptyTitle={t('coach.students.emptyTitle')}
            emptyDescription={t('coach.students.emptyDescription')}
            emptyAction={<WorkspaceInviteAction label={t('coach.students.inviteStudent')} onClick={() => setShowInvite(true)} />}
          >
            {students.map((student) => (
              <WorkspacePersonRow
                key={student.id}
                to={student.status === 'active' ? `/coach/student/${student.client_id}` : undefined}
                initial={(student.client_name || student.client_email)?.[0]?.toUpperCase() || 'A'}
                title={student.client_name || student.client_email}
                subtitle={student.client_email}
                meta={
                  student.status === 'active'
                    ? t('coach.students.metaAccepted')
                    : t('coach.students.metaPending')
                }
                badge={student.status === 'active' ? t('coach.common.active') : t('coach.common.pending')}
                badgeTone={student.status === 'active' ? 'success' : 'warning'}
                accentTone="brand"
                actions={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      removeM.mutate(student.id);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--fg-3))] transition-colors hover:border-[hsl(var(--err)/0.2)] hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                  </button>
                }
              />
            ))}
          </WorkspaceRosterSection>
        )}

        <InviteModal open={showInvite} onOpenChange={setShowInvite} role="coach" />
      </PageShell>
    </RoleGate>
  );
}
