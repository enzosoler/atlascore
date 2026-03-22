import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Users } from 'lucide-react';
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

export default function ClinicianPatients() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['clinician-patients', user?.email],
    queryFn: () => base44.entities.ClinicianPatient.filter({ clinician_email: user?.email }),
    enabled: !!user?.email,
  });

  const removeM = useMutation({
    mutationFn: (id) => base44.entities.ClinicianPatient.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinician-patients'] }),
  });

  return (
    <RoleGate roles={['clinician', 'admin']}>
      <PageShell
        title="Patients"
        subtitle="Manage invited and active patients in a more restrained clinical workspace."
        maxWidth="max-w-4xl"
      >
        <WorkspaceHeader
          eyebrow="Clinician role"
          title="Patients"
          subtitle="Accepted patients open into detailed clinical records. Pending invites stay visible until confirmed."
          icon={Users}
          tone="success"
          badge={`${patients.length} linked`}
          actions={<WorkspaceInviteAction label="Invite patient" onClick={() => setShowInvite(true)} />}
        />

        {isLoading ? (
          <SectionCard title="Loading patients" subtitle="Fetching patient relationships.">
            <div className="py-12 text-center text-[13px] text-[hsl(var(--fg-2))]">Loading patients...</div>
          </SectionCard>
        ) : (
          <WorkspaceRosterSection
            eyebrow="Panel"
            title="All linked patients"
            subtitle="Use patient records to review abnormal markers, body composition, and protocol compliance."
            emptyIcon={Users}
            emptyTitle="No patients linked"
            emptyDescription="Invite your first patient to establish a clinical workspace."
            emptyAction={<WorkspaceInviteAction label="Invite patient" onClick={() => setShowInvite(true)} />}
          >
            {patients.map((patient) => (
              <WorkspacePersonRow
                key={patient.id}
                to={`/clinician/patient/${patient.patient_email}`}
                initial={(patient.patient_name || patient.patient_email)?.[0]?.toUpperCase() || 'P'}
                title={patient.patient_name || patient.patient_email}
                subtitle={patient.patient_email}
                meta={patient.status === 'active' ? 'Clinical access active' : 'Invitation pending'}
                badge={patient.status === 'active' ? 'Active' : 'Inactive'}
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
