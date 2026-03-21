import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Brain, Moon, Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import {
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  MetricCard,
  PageShell,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  formatNumber,
  toArray,
} from '@/components/shared/StablePage';
import { listMeasurements } from '@/services/bodyProgressService';

const RANGE_DAYS = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
};

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarizeWeight(measurements, t) {
  if (measurements.length < 2) {
    return t('pages.insights.no_weight_data');
  }

  const newest = measurements[0]?.weight;
  const oldest = measurements[measurements.length - 1]?.weight;

  if (newest == null || oldest == null) {
    return t('pages.insights.weight_insufficient');
  }

  const delta = Number(newest) - Number(oldest);
  if (Math.abs(delta) < 0.2) {
    return t('pages.insights.weight_stable');
  }
  if (delta > 0) {
    return `Seu peso subiu cerca de ${delta.toFixed(1)} kg no período analisado.`;
  }
  return `Seu peso caiu cerca de ${Math.abs(delta).toFixed(1)} kg no período analisado.`;
}

function summarizeProtocols(protocols, t) {
  const active = protocols.filter((p) => p?.active && !p?.end_date);
  if (active.length === 0) {
    return t('pages.insights.no_active_protocols');
  }
  const names = active
    .slice(0, 3)
    .map((p) => p.name || 'Protocolo')
    .join(', ');
  const extra = active.length > 3 ? ` e mais ${active.length - 3}` : '';
  return `${active.length} protocolo${active.length > 1 ? 's' : ''} ativo${active.length > 1 ? 's' : ''}: ${names}${extra}.`;
}

export default function Insights() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('pages.insights.title')}
      subtitle={t('pages.insights.subtitle')}
      maxWidth="max-w-5xl"
      fallbackDescription="Insights page loaded. O conteúdo principal falhou, mas a rota continua acessível."
    >
      <InsightsContent />
    </SafePageBoundary>
  );
}

function InsightsContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [range, setRange] = useState('30d');
  const days = RANGE_DAYS[range] || 30;

  const cutoff = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }, [days]);

  const measurementsQuery = useQuery({
    queryKey: ['insights-measurements-stable', user?.id, days],
    queryFn: () => listMeasurements(user.id, 200),
    initialData: [],
    enabled: !!user?.id,
  });
  const checkinsQuery = useQuery({
    queryKey: ['insights-checkins-stable', user?.id, days],
    queryFn: async () => [],
    initialData: [],
    enabled: !!user?.id,
  });
  const workoutsQuery = useQuery({
    queryKey: ['insights-workouts-stable', user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(200);

      if (error) {
        throw error;
      }

      return (data || []).map((workout) => ({
        ...workout,
        date: workout.completed_at ? workout.completed_at.split('T')[0] : null,
      }));
    },
    initialData: [],
    enabled: !!user?.id,
  });
  const mealsQuery = useQuery({
    queryKey: ['insights-meals-stable', user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(500);

      if (error) {
        throw error;
      }

      return (data || []).map((item) => ({
        ...item,
        date: item.date ? item.date.split('T')[0] : null,
        total_calories: Number(item.calories || 0),
      }));
    },
    initialData: [],
    enabled: !!user?.id,
  });
  const protocolsQuery = useQuery({
    queryKey: ['insights-protocols-stable', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
  });

  const loading =
    measurementsQuery.isLoading ||
    checkinsQuery.isLoading ||
    workoutsQuery.isLoading ||
    mealsQuery.isLoading ||
    protocolsQuery.isLoading;

  const hasErrors =
    measurementsQuery.isError ||
    checkinsQuery.isError ||
    workoutsQuery.isError ||
    mealsQuery.isError ||
    protocolsQuery.isError;

  const measurements = toArray(measurementsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff,
  );
  const checkins = toArray(checkinsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff,
  );
  const workouts = toArray(workoutsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff,
  );
  const meals = toArray(mealsQuery.data).filter((item) => item?.date && item.date >= cutoff);
  const protocols = toArray(protocolsQuery.data);

  // Fix: was `item?.completed` (boolean field that doesn't exist).
  // The correct field is `status === 'completed'`, consistent with Today.jsx.
  const completedWorkouts = workouts.filter((item) => item?.status === 'completed');

  const caloriesPerDay = avg(
    Object.values(
      meals.reduce((accumulator, meal) => {
        const date = meal?.date || 'sem-data';
        accumulator[date] = Number(accumulator[date] || 0) + Number(meal?.total_calories || 0);
        return accumulator;
      }, {}),
    ),
  );

  const averageSleep = avg(
    checkins.map((item) => Number(item?.sleep_hours || 0)).filter(Boolean),
  );
  const averageEnergy = avg(
    checkins.map((item) => Number(item?.energy || 0)).filter(Boolean),
  );
  const activeProtocols = protocols.filter((item) => item?.active && !item?.end_date);

  const hasAnyData = Boolean(
    measurements.length || checkins.length || workouts.length || meals.length || protocols.length,
  );

  const consistencyText =
    completedWorkouts.length === 0
      ? workouts.length > 0
        ? t('pages.insights.training_not_completed')
        : t('pages.insights.training_no_records')
      : completedWorkouts.length >= Math.max(3, Math.floor(days / 10))
        ? `Sua consistência de treino no período está boa — ${completedWorkouts.length} sessões concluídas.`
        : `Seu volume de treino no período está baixo (${completedWorkouts.length} sessões). Vale reforçar a frequência.`;

  const nutritionText =
    caloriesPerDay > 0
      ? `Sua média de ingestão registrada ficou em torno de ${formatNumber(caloriesPerDay)} kcal por dia.`
      : t('pages.insights.nutrition_insufficient');

  const recoveryText =
    averageSleep > 0
      ? `Média de sono: ${averageSleep.toFixed(1)}h. Energia média: ${averageEnergy.toFixed(1)} / 5.`
      : t('pages.insights.recovery_insufficient');

  const protocolsText = summarizeProtocols(protocols, t);

  return (
    <PageShell
      title="Insights"
      subtitle="Uma leitura objetiva do seu histórico recente, sem gráficos complexos nem gates bloqueando a página."
      actions={
        <>
          {Object.keys(RANGE_DAYS).map((option) => (
            <FilterChip
              key={option}
              onClick={() => setRange(option)}
              active={range === option}
            >
              {option}
            </FilterChip>
          ))}
        </>
      }
      maxWidth="max-w-5xl"
    >
      {loading ? (
        <LoadingState
          title="Carregando insights"
          description="Estamos carregando as fontes de dados e mantendo a página aberta em modo seguro."
        />
      ) : null}

      {!loading && hasErrors ? (
        <ErrorState
          title="Insights em modo seguro"
          description="Parte dos dados não carregou completamente, mas a página continua aberta e legível."
        />
      ) : null}

      {/* Empty state — shown only when there is genuinely no data */}
      {!loading && !hasAnyData ? (
        <SectionCard
          title="Sem dados suficientes"
          subtitle="Registre atividades para ver os insights."
        >
          <EmptyState
            title="Nenhum dado para interpretar ainda"
            description="Registre check-ins, treinos, refeições, medidas ou protocolos para preencher os insights."
          />
        </SectionCard>
      ) : null}

      {/* Metrics and text sections — shown only when there is actual data */}
      {!loading && hasAnyData ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Treinos concluídos"
              value={formatNumber(completedWorkouts.length)}
              hint={`Período analisado: últimos ${days} dias`}
              icon={Activity}
            />
            <MetricCard
              label="Sono médio"
              value={averageSleep ? `${averageSleep.toFixed(1)} h` : '--'}
              hint="Calculado a partir dos check-ins registrados."
              icon={Moon}
            />
            <MetricCard
              label="Calorias médias"
              value={caloriesPerDay ? `${formatNumber(caloriesPerDay)} kcal` : '--'}
              hint="Média por dia com refeições registradas."
              icon={Brain}
            />
            <MetricCard
              label="Protocolos ativos"
              value={formatNumber(activeProtocols.length)}
              hint="Protocolos que seguem ativos hoje."
              icon={Shield}
            />
          </section>

          <SectionCard
            title="Leituras principais"
            subtitle="Resumo textual do que o histórico recente está mostrando."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Peso</p>
                <p className="mt-2">{summarizeWeight(measurements, t)}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Treino</p>
                <p className="mt-2">{consistencyText}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Nutrição</p>
                <p className="mt-2">{nutritionText}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Recuperação</p>
                <p className="mt-2">{recoveryText}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))] md:col-span-2">
                <p className="font-semibold text-[hsl(var(--fg))]">Protocolos</p>
                <p className="mt-2">{protocolsText}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Contagem de registros"
            subtitle="Visão simples do volume de dados disponíveis no período."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Check-ins
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(checkins.length)}
                </p>
              </div>
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Refeições
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(meals.length)}
                </p>
              </div>
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Medições
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(measurements.length)}
                </p>
              </div>
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Treinos
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(workouts.length)}
                </p>
              </div>
            </div>
          </SectionCard>

          {hasErrors ? (
            <StatusBanner tone="warning">
              Algumas leituras podem estar incompletas porque uma ou mais fontes falharam.
            </StatusBanner>
          ) : null}
        </>
      ) : null}
    </PageShell>
  );
}
