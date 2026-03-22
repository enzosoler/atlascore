import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Target,
  Zap,
  ArrowRight,
  Scale,
  Dumbbell,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import {
  ErrorState,
  EmptyState,
  FilterChip,
  LoadingState,
  MetricCard,
  PageShell,
  SafePageBoundary,
  SectionCard,
  formatNumber,
  toArray,
} from '@/components/shared/StablePage';
import { listMeasurements } from '@/services/bodyProgressService';

// ─── Constants ──────────────────────────────────────────────────────────────

const BLOCK_SIZES = [
  { key: '4w', weeks: 4, label: '4 semanas', minPlan: 'free' },
  { key: '8w', weeks: 8, label: '8 semanas', minPlan: 'pro' },
  { key: '12w', weeks: 12, label: '12 semanas', minPlan: 'performance' },
];

const PLAN_LEVELS = {
  free: 0,
  pro: 1,
  performance: 2,
  coach: 3,
  nutritionist: 3,
  clinician: 3,
  admin: 999,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function formatDateRange(start, end) {
  const opts = { month: 'short', day: 'numeric' };
  const locale = navigator.language || 'pt-BR';
  return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, opts)}`;
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AdherenceBar({ value }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const color =
    pct >= 70
      ? 'hsl(var(--ok))'
      : pct >= 40
        ? 'hsl(var(--warn))'
        : 'hsl(0 72% 51%)';
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-[hsl(var(--border))]">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function InsightRow({ tone, text }) {
  const bgMap = {
    ok: 'hsl(var(--ok)/0.08)',
    warn: 'hsl(var(--warn)/0.08)',
    neutral: 'hsl(var(--border)/0.4)',
  };
  const colorMap = {
    ok: 'hsl(var(--ok))',
    warn: 'hsl(var(--warn))',
    neutral: 'hsl(var(--fg-2))',
  };
  return (
    <div
      className="flex gap-3 rounded-xl p-4 text-sm leading-6"
      style={{ background: bgMap[tone] || bgMap.neutral }}
    >
      <Zap
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: colorMap[tone] || colorMap.neutral }}
      />
      <p className="text-[hsl(var(--fg-2))]">{text}</p>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function BlockReview() {
  return (
    <SafePageBoundary
      title="Block Review"
      subtitle="Leitura consolidada de um bloco de tempo."
      maxWidth="max-w-5xl"
      fallbackDescription="A página Block Review abriu em modo seguro. O conteúdo principal falhou, mas a rota continua acessível."
    >
      <BlockReviewContent />
    </SafePageBoundary>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function BlockReviewContent() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const planCode = subscription?.plan_code || 'free';
  const planLevel = PLAN_LEVELS[planCode] || 0;

  const [blockKey, setBlockKey] = useState('4w');
  const [blockOffset, setBlockOffset] = useState(0); // 0 = current block, 1 = previous, etc.

  const blockSize = BLOCK_SIZES.find((b) => b.key === blockKey) || BLOCK_SIZES[0];
  const blockDays = blockSize.weeks * 7;

  // Date range for the selected block window
  const { startDate, endDate, startStr, endStr } = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() - blockOffset * blockDays);
    const start = new Date(end);
    start.setDate(start.getDate() - blockDays + 1);
    return {
      startDate: start,
      endDate: end,
      startStr: toDateStr(start),
      endStr: toDateStr(end),
    };
  }, [blockDays, blockOffset]);

  // ── Data fetching ────────────────────────────────────────────────────────

  const measurementsQuery = useQuery({
    queryKey: ['block-review-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 500),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const workoutsQuery = useQuery({
    queryKey: ['block-review-workouts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, status, completed_at, volume_load, duration_minutes')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((w) => ({
        ...w,
        date: w.completed_at ? w.completed_at.split('T')[0] : null,
      }));
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const mealsQuery = useQuery({
    queryKey: ['block-review-meals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, date, total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []).map((m) => ({
        ...m,
        date: m.date ? m.date.split('T')[0] : null,
      }));
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const protocolsQuery = useQuery({
    queryKey: ['block-review-protocols', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('id, substance_name, category, active, start_date, end_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading =
    measurementsQuery.isLoading ||
    workoutsQuery.isLoading ||
    mealsQuery.isLoading ||
    protocolsQuery.isLoading;

  const hasError =
    measurementsQuery.isError ||
    workoutsQuery.isError ||
    mealsQuery.isError ||
    protocolsQuery.isError;

  // ── Filter data to the current block window ──────────────────────────────

  const blockMeasurements = useMemo(
    () =>
      toArray(measurementsQuery.data)
        .filter((m) => m?.date && m.date >= startStr && m.date <= endStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [measurementsQuery.data, startStr, endStr],
  );

  const blockWorkouts = useMemo(
    () =>
      toArray(workoutsQuery.data).filter((w) => w?.date && w.date >= startStr && w.date <= endStr),
    [workoutsQuery.data, startStr, endStr],
  );

  const blockMeals = useMemo(
    () =>
      toArray(mealsQuery.data).filter((m) => m?.date && m.date >= startStr && m.date <= endStr),
    [mealsQuery.data, startStr, endStr],
  );

  const blockProtocols = useMemo(
    () =>
      toArray(protocolsQuery.data).filter((p) => {
        if (!p?.start_date) return false;
        return p.start_date <= endStr && (!p.end_date || p.end_date >= startStr);
      }),
    [protocolsQuery.data, startStr, endStr],
  );

  // ── Derived metrics ──────────────────────────────────────────────────────

  const weightDelta = useMemo(() => {
    if (blockMeasurements.length < 2) return null;
    const first = Number(blockMeasurements[0]?.weight);
    const last = Number(blockMeasurements[blockMeasurements.length - 1]?.weight);
    if (!first || !last) return null;
    return last - first;
  }, [blockMeasurements]);

  const bodyFatDelta = useMemo(() => {
    const withBF = blockMeasurements.filter((m) => m?.body_fat != null && m.body_fat !== '');
    if (withBF.length < 2) return null;
    return Number(withBF[withBF.length - 1].body_fat) - Number(withBF[0].body_fat);
  }, [blockMeasurements]);

  const completedWorkouts = useMemo(
    () => blockWorkouts.filter((w) => w?.status === 'completed'),
    [blockWorkouts],
  );
  const workoutsPerWeek = completedWorkouts.length / blockSize.weeks;

  // % of block days with at least one meal logged
  const nutritionAdherence = useMemo(() => {
    const daysWithMeals = new Set(blockMeals.map((m) => m.date)).size;
    return (daysWithMeals / blockDays) * 100;
  }, [blockMeals, blockDays]);

  const avgDailyCalories = useMemo(() => {
    const byDay = blockMeals.reduce((acc, m) => {
      acc[m.date] = (acc[m.date] || 0) + Number(m.total_calories || 0);
      return acc;
    }, {});
    const vals = Object.values(byDay);
    return vals.length ? avg(vals) : 0;
  }, [blockMeals]);

  const avgDailyProtein = useMemo(() => {
    const byDay = blockMeals.reduce((acc, m) => {
      acc[m.date] = (acc[m.date] || 0) + Number(m.total_protein || 0);
      return acc;
    }, {});
    const vals = Object.values(byDay);
    return vals.length ? avg(vals) : 0;
  }, [blockMeals]);

  // Workout adherence score: normalised to 3 sessions/week target, capped at 100%
  const workoutAdherenceScore = Math.min(100, (workoutsPerWeek / 3) * 100);
  // Overall: average of nutrition log adherence + workout frequency score
  const overallAdherence = (nutritionAdherence + workoutAdherenceScore) / 2;

  // ── Opinionated insights (rule-based) ───────────────────────────────────

  const insights = useMemo(() => {
    const list = [];

    // Weight trend
    if (weightDelta !== null) {
      if (Math.abs(weightDelta) < 0.3) {
        list.push({
          tone: 'neutral',
          text: 'Peso estável neste bloco. Se a meta é perda, vale revisar o déficit calórico ou aumentar a precisão nos registros.',
        });
      } else if (weightDelta < 0) {
        list.push({
          tone: 'ok',
          text: `Perda de ${Math.abs(weightDelta).toFixed(1)} kg neste bloco — tendência positiva para quem busca redução de peso.`,
        });
      } else {
        list.push({
          tone: 'neutral',
          text: `Ganho de ${weightDelta.toFixed(1)} kg neste bloco. Verifique se está alinhado com o objetivo (ganho muscular planejado ou fora do plano).`,
        });
      }
    }

    // Nutrition adherence
    if (blockMeals.length > 0) {
      if (nutritionAdherence < 50) {
        list.push({
          tone: 'warn',
          text: `Refeições registradas em apenas ${nutritionAdherence.toFixed(0)}% dos dias. Sem log consistente, fica difícil identificar o que está travando o progresso.`,
        });
      } else if (nutritionAdherence < 70) {
        list.push({
          tone: 'warn',
          text: `Adesão ao log alimentar abaixo de 70% (${nutritionAdherence.toFixed(0)}%). Aumentar a consistência nos registros melhora a qualidade da análise.`,
        });
      } else {
        list.push({
          tone: 'ok',
          text: `Boa consistência nos registros alimentares — ${nutritionAdherence.toFixed(0)}% dos dias do bloco logados.`,
        });
      }
    }

    // Workout frequency
    if (blockWorkouts.length > 0 || completedWorkouts.length > 0) {
      if (workoutsPerWeek < 1.5) {
        list.push({
          tone: 'warn',
          text: `Frequência de treino baixa: ${workoutsPerWeek.toFixed(1)} sessões/semana. Para a maioria dos objetivos, 3+ sessões/semana geram adaptações mais consistentes.`,
        });
      } else if (workoutsPerWeek >= 3) {
        list.push({
          tone: 'ok',
          text: `Frequência de treino consistente: ${workoutsPerWeek.toFixed(1)} sessões/semana — bom volume para adaptação progressiva.`,
        });
      }
    }

    // Protocol note
    if (blockProtocols.length > 0 && weightDelta !== null) {
      list.push({
        tone: 'neutral',
        text: `${blockProtocols.length} protocolo${blockProtocols.length !== 1 ? 's' : ''} ativo${blockProtocols.length !== 1 ? 's' : ''} durante o bloco. Considere correlacionar com as tendências de peso e composição.`,
      });
    }

    return list.slice(0, 3);
  }, [
    weightDelta,
    nutritionAdherence,
    workoutsPerWeek,
    blockMeals.length,
    blockWorkouts.length,
    completedWorkouts.length,
    blockProtocols.length,
  ]);

  // ── "Do this next" — surface the highest-impact action ──────────────────

  const doThisNext = useMemo(() => {
    if (nutritionAdherence < 60 && blockMeals.length > 0) {
      return {
        action: 'Aumentar consistência no log alimentar',
        reason:
          'Sem dados de nutrição suficientes, é impossível diagnosticar o que está travando o progresso. Foque em registrar ao menos 5 em 7 dias.',
        route: ROUTES.nutrition,
        label: 'Ir para Nutrição',
      };
    }
    if (workoutsPerWeek < 2 && (blockWorkouts.length > 0 || blockMeals.length > 0)) {
      return {
        action: 'Reforçar frequência de treino',
        reason:
          'O volume de treino neste bloco ficou abaixo do ideal para adaptação. Adicione 1–2 sessões semanais no próximo bloco.',
        route: ROUTES.workouts,
        label: 'Ir para Treinos',
      };
    }
    if (blockMeasurements.length < 2) {
      return {
        action: 'Registrar medições com mais frequência',
        reason:
          'Sem checkpoints de composição corporal, fica impossível rastrear mudanças reais ao longo do bloco.',
        route: ROUTES.measurements,
        label: 'Registrar medição',
      };
    }
    if (weightDelta !== null && Math.abs(weightDelta) < 0.3 && nutritionAdherence > 70) {
      return {
        action: 'Revisar meta calórica',
        reason:
          'Peso estável com boa adesão alimentar registrada. Se a meta é mudança de composição, vale ajustar o déficit ou superávit.',
        route: ROUTES.myDiet,
        label: 'Ver plano alimentar',
      };
    }
    return {
      action: 'Manter consistência no próximo bloco',
      reason:
        'Os dados deste bloco estão em boa ordem. Continue com a mesma frequência para construir um histórico comparativo sólido.',
      route: ROUTES.today,
      label: 'Ir para Today',
    };
  }, [
    nutritionAdherence,
    workoutsPerWeek,
    blockMeasurements.length,
    weightDelta,
    blockMeals.length,
    blockWorkouts.length,
  ]);

  const hasAnyData =
    blockMeasurements.length > 0 || blockWorkouts.length > 0 || blockMeals.length > 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageShell
      title="Block Review"
      subtitle="Leitura consolidada de um bloco de tempo — o que funcionou, o que não funcionou, o que fazer a seguir."
      actions={
        <>
          {BLOCK_SIZES.map((bs) => {
            const locked = PLAN_LEVELS[bs.minPlan] > planLevel;
            return (
              <FilterChip
                key={bs.key}
                onClick={() => {
                  if (locked) return;
                  setBlockKey(bs.key);
                  setBlockOffset(0);
                }}
                active={blockKey === bs.key}
                className={locked ? 'opacity-40 cursor-not-allowed' : ''}
                title={locked ? `Disponível no plano ${bs.minPlan}` : undefined}
              >
                {bs.label}
                {locked ? ' 🔒' : ''}
              </FilterChip>
            );
          })}
        </>
      }
      maxWidth="max-w-5xl"
    >
      {/* Block navigator */}
      <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--shell))] px-5 py-3">
        <button
          onClick={() => setBlockOffset((o) => o + 1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Bloco anterior
        </button>

        <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">
          {formatDateRange(startDate, endDate)}
        </span>

        <button
          onClick={() => setBlockOffset((o) => Math.max(0, o - 1))}
          disabled={blockOffset === 0}
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Bloco seguinte
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Free plan notice */}
      {planCode === 'free' && (
        <div className="atlas-banner px-4 py-3 text-sm leading-6">
          <p className="font-semibold text-[hsl(var(--fg))]">Free plan block limit</p>
          <p className="mt-1">
            Free accounts can review only 4-week blocks.{' '}
            <Link to={ROUTES.pricing} className="font-semibold text-[hsl(var(--brand))] hover:opacity-80">
              Upgrade to Pro
            </Link>{' '}
            to unlock 8-week and 12-week reviews.
          </p>
        </div>
      )}

      {isLoading && (
        <LoadingState
          title="Carregando bloco"
          description="Agregando dados do período selecionado."
        />
      )}

      {!isLoading && hasError && (
        <ErrorState
          title="Erro ao carregar bloco"
          description="Alguns dados podem estar incompletos. Tente atualizar a página."
        />
      )}

      {!isLoading && !hasAnyData && (
        <SectionCard title="Insufficient data for this block" subtitle="Block review needs repeated checkpoints and routine logs to say something credible.">
          <EmptyState
            icon={BarChart3}
            title="No data in this block"
            description="Log measurements, meals, or workouts inside the selected period to generate a useful block review."
            action={
              <Button asChild size="default">
                <Link to={ROUTES.today}>Go to Today</Link>
              </Button>
            }
          />
        </SectionCard>
      )}

      {!isLoading && hasAnyData && (
        <>
          {/* ── Top-line metrics ── */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Variação de peso"
              value={
                weightDelta !== null
                  ? `${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`
                  : '--'
              }
              hint={
                blockMeasurements.length < 2
                  ? 'Precisa de 2+ medições no bloco'
                  : `${blockMeasurements.length} checkpoints registrados`
              }
              icon={Scale}
            />
            <MetricCard
              label="Variação de gordura"
              value={
                bodyFatDelta !== null
                  ? `${bodyFatDelta >= 0 ? '+' : ''}${bodyFatDelta.toFixed(1)}%`
                  : '--'
              }
              hint={
                bodyFatDelta !== null
                  ? 'Baseado nas medições com % gordura'
                  : 'Sem dados de % gordura no bloco'
              }
              icon={TrendingDown}
            />
            <MetricCard
              label="Treinos concluídos"
              value={formatNumber(completedWorkouts.length)}
              hint={`${workoutsPerWeek.toFixed(1)} sessões/semana`}
              icon={Dumbbell}
            />
            <MetricCard
              label="Consistência geral"
              value={`${overallAdherence.toFixed(0)}%`}
              hint="Média: adesão alimentar + frequência de treino"
              icon={Target}
            />
          </section>

          {/* ── Adherence breakdown ── */}
          <SectionCard
            title="Adesão por área"
            subtitle="Como foi o engajamento em cada pilar do bloco."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {/* Nutrition */}
              <div className="atlas-card-muted p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Nutrição
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">
                  {nutritionAdherence.toFixed(0)}%
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {new Set(blockMeals.map((m) => m.date)).size} de {blockDays} dias com log
                </p>
                <AdherenceBar value={nutritionAdherence} />
                {avgDailyCalories > 0 && (
                  <p className="text-[12px] text-[hsl(var(--fg-2))] pt-1 leading-5">
                    Média: {formatNumber(avgDailyCalories)} kcal/dia
                    {avgDailyProtein > 0 && ` · ${avgDailyProtein.toFixed(0)}g prot.`}
                  </p>
                )}
              </div>

              {/* Workouts */}
              <div className="atlas-card-muted p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Treinos
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">
                  {completedWorkouts.length}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {workoutsPerWeek.toFixed(1)} sessões/semana
                </p>
                <AdherenceBar value={workoutAdherenceScore} />
                <p className="text-[12px] text-[hsl(var(--fg-2))] pt-1 leading-5">
                  Score em relação à meta de 3× /semana
                </p>
              </div>

              {/* Protocols */}
              <div className="atlas-card-muted p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Protocolos
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">
                  {blockProtocols.length}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {blockProtocols.length === 0
                    ? 'Nenhum protocolo ativo neste bloco'
                    : `protocolo${blockProtocols.length !== 1 ? 's' : ''} ativo${blockProtocols.length !== 1 ? 's' : ''}`}
                </p>
                {blockProtocols.length > 0 && (
                  <p className="text-[12px] text-[hsl(var(--fg-2))] pt-2 leading-5">
                    {blockProtocols
                      .slice(0, 3)
                      .map((p) => p.substance_name || 'Protocolo')
                      .join(', ')}
                    {blockProtocols.length > 3 && ` e mais ${blockProtocols.length - 3}`}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Opinionated insights ── */}
          {insights.length > 0 && (
            <SectionCard
              title="Leituras do bloco"
              subtitle="Análise objetiva baseada nos dados registrados no período."
            >
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <InsightRow key={i} tone={insight.tone} text={insight.text} />
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Do this next ── */}
          <div className="rounded-[20px] border border-[hsl(var(--brand)/0.25)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.08)_0%,hsl(var(--card)/0.92)_100%)] p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand)/0.12)]">
                <ArrowRight className="h-4 w-4 text-[hsl(var(--brand))]" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand))]">
                  Próximo passo
                </p>
                <p className="text-[16px] font-semibold text-[hsl(var(--fg))] leading-snug">
                  {doThisNext.action}
                </p>
                <p className="text-[13px] text-[hsl(var(--fg-2))] leading-5">
                  {doThisNext.reason}
                </p>
              </div>
            </div>
            <div className="pl-10">
              <Button asChild size="sm" variant="outline">
                <Link to={doThisNext.route}>
                  {doThisNext.label} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
