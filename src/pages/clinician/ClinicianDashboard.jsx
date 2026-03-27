import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FlaskConical, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
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

export default function ClinicianDashboard() {
  const { user } = useAuth();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['clinician-patients', user?.id],
    queryFn: () => getMyClients(user.id, 'clinician').then((all) => all.filter((p) => p.status === 'active')),
    enabled: !!user?.id,
  });

  
  const patientExams = [];
  const patientProtocols = [];

  return (
    <RoleGate roles={['clinician', 'admin']}>
      <PageShell
        title="Clinician"
        subtitle="Authority-driven overview of patient status, lab context, and protocol compliance."
        maxWidth="max-w-6xl"
      >
        <WorkspaceHeader
          eyebrow="Clinician role"
          title="Clinical dashboard"
          subtitle="Keep patient status, abnormal markers, and active protocols legible and restrained."
          icon={FlaskConical}
          tone="success"
          badge={`${patients.length} active patients`}
        />

        {isLoading ? (
          <SectionCard title="Loading workspace" subtitle="Collecting patient, lab, and protocol records.">
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading clinician workspace...
            </div>
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-3">
              <WorkspaceMetricTile
                label="Active patients"
                value={patients.length}
                hint="Linked patients currently in your panel"
                icon={Users}
                tone="success"
              />
              <WorkspaceMetricTile
                label="Lab records"
                value={patientExams.length}
                hint="Recent exams tied to your patient list"
                icon={FlaskConical}
                tone="brand"
              />
              <WorkspaceMetricTile
                label="Active protocols"
                value={patientProtocols.length}
                hint="Current tracked protocol records"
                icon={ClipboardList}
                tone="warning"
              />
            </WorkspaceMetricGrid>

            <WorkspaceRosterSection
              eyebrow="Patients"
              title="Recent patient links"
              subtitle="Jump directly into a patient profile to review measurements, photos, labs, and protocols."
              action={
                <Link
                  to="/clinician/patients"
                  className="text-[13px] font-semibold text-[hsl(var(--brand))]"
                >
                  View all
                </Link>
              }
              emptyIcon={Users}
              emptyTitle="No patients linked"
              emptyDescription="Invite patients to start reviewing labs, body composition, and protocol compliance."
            >
              {patients.slice(0, 5).map((patient) => (
                <WorkspacePersonRow
                  key={patient.id}
                  to={`/clinician/patient/${patient.client_id}`}
                  initial={(patient.client_name || patient.client_email)?.[0]?.toUpperCase() || 'P'}
                  title={patient.client_name || patient.client_email}
                  subtitle={patient.client_email}
                  meta="Clinical record available"
                  badge="Active"
                  badgeTone="success"
                  accentTone="success"
                />
              ))}
            </WorkspaceRosterSection>
          </>
        )}
      </PageShell>
    </RoleGate>
  );
}
