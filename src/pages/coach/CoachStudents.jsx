import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
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
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['coach-students', user?.email],
    queryFn: () => base44.entities.CoachStudent.filter({ coach_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  const removeM = useMutation({
    mutationFn: (id) => base44.entities.CoachStudent.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach-students'] }),
  });

  return (
    <RoleGate roles={['coach', 'admin']}>
      <PageShell title="Students" subtitle="Manage active coaching relationships and pending invites." maxWidth="max-w-4xl">
        <WorkspaceHeader
          eyebrow="Coach role"
          title="Students"
          subtitle="Invite athletes, monitor acceptance, and jump into individual profiles."
          icon={Users}
          tone="brand"
          badge={`${students.length} linked`}
          actions={<WorkspaceInviteAction label="Invite student" onClick={() => setShowInvite(true)} />}
        />

        {isLoading ? (
          <SectionCard title="Loading students" subtitle="Fetching your active and pending links.">
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading student roster...
            </div>
          </SectionCard>
        ) : (
          <WorkspaceRosterSection
            eyebrow="Roster"
            title="All linked students"
            subtitle="Accepted athletes are ready for profile review. Pending invites stay visible until confirmed."
            emptyIcon={Users}
            emptyTitle="No students yet"
            emptyDescription="Invite your first athlete to start prescribing and reviewing adherence."
            emptyAction={<WorkspaceInviteAction label="Invite student" onClick={() => setShowInvite(true)} />}
          >
            {students.map((student) => (
              <WorkspacePersonRow
                key={student.id}
                to={student.status === 'accepted' ? `/coach/student/${student.student_email}` : undefined}
                initial={(student.student_name || student.student_email)?.[0]?.toUpperCase() || 'A'}
                title={student.student_name || student.student_email}
                subtitle={student.student_email}
                meta={
                  student.status === 'accepted'
                    ? 'Accepted and ready for programming'
                    : 'Invite sent, awaiting acceptance'
                }
                badge={student.status === 'accepted' ? 'Active' : 'Pending'}
                badgeTone={student.status === 'accepted' ? 'success' : 'warning'}
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
