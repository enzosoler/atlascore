import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
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
import { useT } from '@/lib/i18nContext';

export default function ClinicianPatients() {
  const { user } = useAuth();
  const t = useT();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['clinician-patients', user?.id],
    queryFn: () => getMyClients(user.id, 'clinician'),
    enabled: !!user?.id,
  });

  const removeM = useMutation({
    mutationFn: (id) => removeLink(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinician-patients'] }),
  });

  return (
    <RoleGate roles={['clinician', 'admin']}>
      <PageShell
        title={t('clinician.patientsPageTitle')}
        subtitle={t('clinician.patientsPageSubtitle')}
        maxWidth="max-w-4xl"
      >
        <WorkspaceHeader
          eyebrow={t('clinician.roleEyebrow')}
          title={t('clinician.patientsPageTitle')}
          subtitle={t('clinician.patientsHeaderSubtitle')}
          icon={Users}
          tone="success"
          badge={`${patients.length} ${t('clinician.linked')}`}
          actions={<WorkspaceInviteAction label={t('clinician.invitePatient')} onClick={() => setShowInvite(true)} />}
        />

        {isLoading ? (
          <SectionCard title={t('clinician.loadingPatientsTitle')} subtitle={t('clinician.loadingPatientsSubtitle')}>
            <div className="py-12 text-center text-[13px] text-[hsl(var(--fg-2))]">{t('clinician.loadingPatients')}</div>
          </SectionCard>
        ) : (
          <WorkspaceRosterSection
            eyebrow={t('clinician.panelEyebrow')}
            title={t('clinician.allLinkedPatients')}
            subtitle={t('clinician.allLinkedPatientsSubtitle')}
            emptyIcon={Users}
            emptyTitle={t('clinician.noPatientsLinked')}
            emptyDescription={t('clinician.noPatientsLinkedInviteDesc')}
            emptyAction={<WorkspaceInviteAction label={t('clinician.invitePatient')} onClick={() => setShowInvite(true)} />}
          >
            {patients.map((patient) => (
              <WorkspacePersonRow
                key={patient.id}
                to={`/clinician/patient/${patient.client_id}`}
                initial={(patient.client_name || patient.client_email)?.[0]?.toUpperCase() || 'P'}
                title={patient.client_name || patient.client_email}
                subtitle={patient.client_email}
                meta={patient.status === 'active' ? t('clinician.clinicalAccessActive') : t('clinician.invitationPending')}
                badge={patient.status === 'active' ? t('clinician.badgeActive') : t('clinician.badgeInactive')}
                badgeTone={patient.status === 'active' ? 'success' : 'neutral'}
                accentTone="success"
                actions={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      removeM.mutate(patient.id);
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

        <InviteModal open={showInvite} onOpenChange={setShowInvite} role="clinician" />
      </PageShell>
    </RoleGate>
  );
}
