import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, TrendingUp, Users, Utensils } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getMyClients } from '@/services/professionalLinksService';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
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
  const t = useT();

  const { data: links = [], isLoading: loadingLinks } = useQuery({
    queryKey: ['nutritionist-clients', user?.id],
    queryFn: () => getMyClients(user.id, 'nutritionist'),
    enabled: !!user?.id,
  });

  const { data: diets = [], isLoading: loadingDiets } = useQuery({
    queryKey: ['prescribed-diets'],
    queryFn: async () => [],
  });

  const { data: meals = [] } = useQuery({
    queryKey: ['all-meals'],
    queryFn: async () => [],
  });

  const { data: measurements = [] } = useQuery({
    queryKey: ['all-measurements'],
    queryFn: async () => {
      const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100);
      return data || [];
    },
  });

  const activeClients = links.filter((link) => link.status === 'active').length;
  const activeDiets = diets.filter((diet) => diet.active).length;
  const adherenceRate = links.length > 0 ? Math.round((activeClients / links.length) * 100) : 0;

  return (
    <RoleGate page="NutritionistDashboard">
      <PageShell
        title={t('nutritionist.dashboard.pageTitle')}
        subtitle={t('nutritionist.dashboard.pageSubtitle')}
        maxWidth="max-w-6xl"
      >
        <WorkspaceHeader
          eyebrow={t('nutritionist.dashboard.eyebrow')}
          title={t('nutritionist.dashboard.title')}
          subtitle={t('nutritionist.dashboard.subtitle')}
          icon={Utensils}
          tone="brand"
          badge={`${activeClients} ${t('nutritionist.dashboard.activeClientsBadge')}`}
        />

        {loadingLinks || loadingDiets ? (
          <SectionCard title={t('nutritionist.dashboard.loadingTitle')} subtitle={t('nutritionist.dashboard.loadingSubtitle')}>
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('nutritionist.dashboard.loadingText')}
            </div>
          </SectionCard>
        ) : (
          <>
            <WorkspaceMetricGrid className="xl:grid-cols-3">
              <WorkspaceMetricTile
                label={t('nutritionist.dashboard.metricActiveClients')}
                value={activeClients}
                hint={`${links.length} ${t('nutritionist.dashboard.metricActiveClientsHint')}`}
                icon={Users}
              />
              <WorkspaceMetricTile
                label={t('nutritionist.dashboard.metricActiveDiets')}
                value={activeDiets}
                hint={t('nutritionist.dashboard.metricActiveDietsHint')}
                icon={BarChart3}
                tone="success"
              />
              <WorkspaceMetricTile
                label={t('nutritionist.dashboard.metricAcceptanceRate')}
                value={`${adherenceRate}%`}
                hint={t('nutritionist.dashboard.metricAcceptanceRateHint')}
                icon={TrendingUp}
                tone="warning"
              />
            </WorkspaceMetricGrid>

            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard
                title={t('nutritionist.dashboard.attentionTitle')}
                subtitle={t('nutritionist.dashboard.attentionSubtitle')}
              >
                <NutritionistAlertsPanel links={links} meals={meals} />
              </SectionCard>

              <SectionCard
                title={t('nutritionist.dashboard.adherenceTitle')}
                subtitle={t('nutritionist.dashboard.adherenceSubtitle')}
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
