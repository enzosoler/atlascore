import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Brain, Moon, Scale } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageShell,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
  formatNumber,
  toArray,
} from '@/components/shared/StablePage';

const RANGE_DAYS = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
};

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarizeWeight(measurements) {
  if (measurements.length < 2) {
    return 'Ainda nao ha registros suficientes para identificar tendencia de peso.';
  }

  const newest = measurements[0]?.weight;
  const oldest = measurements[measurements.length - 1]?.weight;

  if (newest == null || oldest == null) {
    return 'Os registros atuais ainda nao permitem ler a tendencia de peso.';
  }

  const delta = Number(newest) - Number(oldest);
  if (Math.abs(delta) < 0.2) {
    return 'Seu peso esta relativamente estavel dentro do periodo selecionado.';
  }
  if (delta > 0) {
    return `Seu peso subiu cerca de ${delta.toFixed(1)} kg no periodo analisado.`;
  }
  return `Seu peso caiu cerca de ${Math.abs(delta).toFixed(1)} kg no periodo analisado.`;
}

export default function Insights() {
  return (
    <SafePageBoundary
      title="Insights"
      subtitle="Modo seguro da pagina de insights."
      maxWidth="max-w-5xl"
      fallbackDescription="Insights page loaded. O conteudo principal falhou, mas a rota continua acessivel."
    >
      <InsightsContent />
    </SafePageBoundary>
  );
}

function InsightsContent() {
  const [range, setRange] = useState('30d');
  const days = RANGE_DAYS[range] || 30;

  const cutoff = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }, [days]);

  const measurementsQuery = useQuery({
    queryKey: ['insights-measurements-stable', days],
    queryFn: () => base44.entities.Measurement.list('-date', 200),
    initialData: [],
  });
  const checkinsQuery = useQuery({
    queryKey: ['insights-checkins-stable', days],
    queryFn: () => base44.entities.DailyCheckin.list('-date', 200),
    initialData: [],
  });
  const workoutsQuery = useQuery({
    queryKey: ['insights-workouts-stable', days],
    queryFn: () => base44.entities.Workout.list('-date', 200),
    initialData: [],
  });
  const mealsQuery = useQuery({
    queryKey: ['insights-meals-stable', days],
    queryFn: () => base44.entities.Meal.list('-date', 500),
    initialData: [],
  });
  const protocolsQuery = useQuery({
    queryKey: ['insights-protocols-stable'],
    queryFn: () => base44.entities.Protocol.list('-start_date', 100),
    initialData: [],
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
    (item) => item?.date && item.date >= cutoff
  );
  const checkins = toArray(checkinsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff
  );
  const workouts = toArray(workoutsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff
  );
  const meals = toArray(mealsQuery.data).filter((item) => item?.date && item.date >= cutoff);
  const protocols = toArray(protocolsQuery.data);

  const completedWorkouts = workouts.filter((item) => item?.completed);
  const caloriesPerDay = avg(
    Object.values(
      meals.reduce((accumulator, meal) => {
        const date = meal?.date || 'sem-data';
        accumulator[date] = Number(accumulator[date] || 0) + Number(meal?.total_calories || 0);
        return accumulator;
      }, {})
    )
  );

  const averageSleep = avg(
    checkins.map((item) => Number(item?.sleep_hours || 0)).filter(Boolean)
  );
  const averageEnergy = avg(
    checkins.map((item) => Number(item?.energy || 0)).filter(Boolean)
  );
  const activeProtocols = protocols.filter((item) => item?.active && !item?.end_date);
  const hasAnyData = Boolean(
    measurements.length || checkins.length || workouts.length || meals.length || protocols.length
  );

  const consistencyText =
    completedWorkouts.length >= Math.max(3, Math.floor(days / 10))
      ? 'Sua consistencia de treino no periodo esta boa.'
      : 'Seu volume de treino no periodo esta baixo. Vale reforcar a frequencia.';

  const nutritionText =
    caloriesPerDay > 0
      ? `Sua media de ingestao registrada ficou em torno de ${formatNumber(caloriesPerDay)} kcal por dia.`
      : 'Ainda nao ha refeicoes suficientes registradas para gerar leitura de nutricao.';

  const recoveryText =
    averageSleep > 0
      ? `Media de sono: ${averageSleep.toFixed(1)}h. Energia media: ${averageEnergy.toFixed(1)} / 5.`
      : 'Ainda nao ha check-ins suficientes para resumir recuperacao.';

  return (
    <PageShell
      title="Insights"
      subtitle="Uma leitura objetiva do seu historico recente, sem graficos complexos nem gates bloqueando a pagina."
      actions={
        <>
          {Object.keys(RANGE_DAYS).map((option) => (
            <SecondaryButton
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={
                range === option ? 'border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-900' : ''
              }
            >
              {option}
            </SecondaryButton>
          ))}
        </>
      }
      maxWidth="max-w-5xl"
    >
      {loading ? (
        <LoadingState
          title="Insights page loaded"
          description="Estamos carregando as fontes de dados e mantendo a pagina aberta em modo seguro."
        />
      ) : null}

      {!loading && hasErrors ? (
        <ErrorState
          title="Insights em modo seguro"
          description="Parte dos dados nao carregou completamente, mas a pagina continua aberta e legivel."
        />
      ) : null}

      {!loading && !hasAnyData ? (
        <SectionCard title="Insights page loaded" subtitle="Ainda sem base suficiente.">
          <EmptyState
            title="Nenhum dado suficiente para interpretar"
            description="Registre check-ins, treinos, refeicoes, medidas ou protocolos para preencher os insights."
          />
        </SectionCard>
      ) : null}

      {!loading ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Treinos concluidos"
              value={formatNumber(completedWorkouts.length)}
              hint={`Periodo analisado: ultimos ${days} dias`}
              icon={Activity}
            />
            <MetricCard
              label="Sono medio"
              value={averageSleep ? `${averageSleep.toFixed(1)} h` : '--'}
              hint="Calculado a partir dos check-ins registrados."
              icon={Moon}
            />
            <MetricCard
              label="Calorias medias"
              value={caloriesPerDay ? `${formatNumber(caloriesPerDay)} kcal` : '--'}
              hint="Media por dia com refeicoes registradas."
              icon={Brain}
            />
            <MetricCard
              label="Protocolos ativos"
              value={formatNumber(activeProtocols.length)}
              hint="Protocolos que seguem ativos hoje."
              icon={Scale}
            />
          </section>

          <SectionCard
            title="Leituras principais"
            subtitle="Resumo textual do que o historico recente esta mostrando."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <p className="font-semibold text-zinc-950">Peso</p>
                <p className="mt-2">{summarizeWeight(measurements)}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <p className="font-semibold text-zinc-950">Treino</p>
                <p className="mt-2">{consistencyText}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <p className="font-semibold text-zinc-950">Nutricao</p>
                <p className="mt-2">{nutritionText}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <p className="font-semibold text-zinc-950">Recuperacao</p>
                <p className="mt-2">{recoveryText}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Contagem de registros"
            subtitle="Visao simples do volume de dados disponiveis no periodo."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Check-ins
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-950">
                  {formatNumber(checkins.length)}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Refeicoes
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-950">
                  {formatNumber(meals.length)}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Medicoes
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-950">
                  {formatNumber(measurements.length)}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Treinos
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-950">
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
