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
import { useT } from '@/lib/i18nContext';

export default function ClinicianDashboard() {
  const { user } = useAuth();
  const t = useT();

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
        title={t('clinician.pageTitle')}
        subtitle={t('clinician.pageSubtitle')}
        maxWidth="max-w-6xl"
      >
        <WorkspaceHeader
          eyebrow={t('clinician.roleEyebrow')}
          title={t('clinician.dashboardTitle')}
          subtitle={t('clinician.dashboardSubtitle')}
          icon={FlaskConical}
          tone="success"
          badge={`${patients.length} ${t('clinician.activePatients')}`}
        />

        {isLoading ? (
          <SectionCard title={t('clinician.loadingWorkspaceTitle')} subtitle={t('clinician.loadingWorkspaceSubtitle')}>
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('clinician.loadingWorkspace')}
            </div>
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-3">
              <WorkspaceMetricTile
                label={t('clinician.activePatients')}
                value={patients.length}
                hint={t('clinician.activePatientsHint')}
                icon={Users}
                tone="success"
              />
              <WorkspaceMetricTile
                label={t('clinician.labRecords')}
                value={patientExams.length}
                hint={t('clinician.labRecordsHint')}
                icon={FlaskConical}
                tone="brand"
              />
              <WorkspaceMetricTile
                label={t('clinician.activeProtocols')}
                value={patientProtocols.length}
                hint={t('clinician.activeProtocolsHint')}
                icon={ClipboardList}
                tone="warning"
              />
            </WorkspaceMetricGrid>

            <WorkspaceRosterSection
              eyebrow={t('clinician.patientsEyebrow')}
              title={t('clinician.recentLinksTitle')}
              subtitle={t('clinician.recentLinksSubtitle')}
              action={
                <Link
                  to="/clinician/patients"
                  className="text-[13px] font-semibold text-[hsl(var(--brand))]"
                >
                  {t('clinician.viewAll')}
                </Link>
              }
              emptyIcon={Users}
              emptyTitle={t('clinician.noPatientsLinked')}
              emptyDescription={t('clinician.noPatientsLinkedDesc')}
            >
              {patients.slice(0, 5).map((patient) => (
                <WorkspacePersonRow
                  key={patient.id}
                  to={`/clinician/patient/${patient.client_id}`}
                  initial={(patient.client_name || patient.client_email)?.[0]?.toUpperCase() || 'P'}
                  title={patient.client_name || patient.client_email}
                  subtitle={patient.client_email}
                  meta={t('clinician.clinicalRecordAvailable')}
                  badge={t('clinician.badgeActive')}
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
