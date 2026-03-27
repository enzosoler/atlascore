import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, TrendingUp, Users, Utensils } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getMyClients } from '@/services/professionalLinksService';
import { useAuth } from '@/lib/AuthContext';
import RoleGate from '@/components/rbac/RoleGate';
import NutritionistAlertsPanel from '@/components/nutritionist/NutritionistAlertsPanel';
import ClientListWithAdherence from '@/components/nutritionist/ClientListWithAdherence';
import { PageShell, SectionCard } from '@/components/shared/StablePage';
import {
  WorkspaceHeader,
  WorkspaceMetricGrid,
  WorkspaceMetricTile,
} from '@/components/shared/ProfessionalUI';

export default function NutritionistDashboard() {
  const { user } = useAuth();

  const { data: links = [], isLoading: loadingLinks } = useQuery({
    queryKey: ['nutritionist-clients', user?.id],
    queryFn: () => getMyClients(user.id, 'nutritionist'),
    enabled: !!user?.id,
  });

  const { data: diets = [], isLoading: loadingDiets } = useQuery({
    queryKey: ['prescribed-diets'],
    queryFn: () => base44.entities.PrescribedDiet.filter({ nutritionist_email: user?.email }),
  });

  const { data: meals = [] } = useQuery({
    queryKey: ['all-meals'],
    queryFn: () => base44.entities.Meal.list('-date', 500),
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['all-measurements'],
    queryFn: () => base44.entities.Measurement.list('-date', 100),
  });

  const activeClients = links.filter((link) => link.status === 'active').length;
  const activeDiets = diets.filter((diet) => diet.active).length;
  const adherenceRate = links.length > 0 ? Math.round((activeClients / links.length) * 100) : 0;

  return (
    <RoleGate page="NutritionistDashboard">
      <PageShell
        title="Nutritionist"
        subtitle="Professional oversight for adherence, body change, and active diet plans."
        maxWidth="max-w-6xl"
      >
        <WorkspaceHeader
          eyebrow="Nutritionist role"
          title="Nutrition dashboard"
          subtitle="Keep macro adherence, client changes, and active prescriptions easy to scan."
          icon={Utensils}
          tone="brand"
          badge={`${activeClients} active clients`}
        />

        {loadingLinks || loadingDiets ? (
          <SectionCard title="Loading workspace" subtitle="Bringing client and plan data into view.">
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading nutrition workspace...
            </div>
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-3">
              <WorkspaceMetricTile
                label="Active clients"
                value={activeClients}
                hint={`${links.length} total linked clients`}
                icon={Users}
              />
              <WorkspaceMetricTile
                label="Active diets"
                value={activeDiets}
                hint="Prescriptions currently marked active"
                icon={BarChart3}
                tone="success"
              />
              <WorkspaceMetricTile
                label="Acceptance rate"
                value={`${adherenceRate}%`}
                hint="Accepted links relative to all invitations"
                icon={TrendingUp}
                tone="warning"
              />
            </WorkspaceMetricGrid>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title="Attention needed"
                subtitle="Clients or plans that likely need follow-up."
              >
                <NutritionistAlertsPanel links={links} meals={meals} />
              </SectionCard>

              <SectionCard
                title="Client adherence"
                subtitle="A quick scan of who is logging and progressing."
              >
                <ClientListWithAdherence links={links} meals={meals} measurements={measurements} />
              </SectionCard>
            </div>
          </>
        )}
      </PageShell>
    </RoleGate>
  );
}
