import React from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Dumbbell,
  Loader2,
  Scale,
  Shield,
  Sparkles,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useRole } from '@/hooks/useRole';
import { base44 } from '@/api/base44Client';
import { ROUTES } from '@/lib/routes';
import { getGreeting } from '@/lib/atlas-theme';
import { SafePageBoundary } from '@/components/shared/StablePage';
import {
  TodayActionCard,
  TodayAdherenceCard,
  TodayCard,
  TodayInsightCard,
  TodayScreen,
  TodaySection,
  TodayStatCard,
} from '@/components/today/TodayMobileUI';

const NEXT_STEPS = [
  {
    to: ROUTES.nutrition,
    title: 'Abrir nutrição',
    description: 'Confirme as refeições, macros e a primeira escolha alimentar antes do dia ficar cheio.',
    icon: UtensilsCrossed,
    phase: 'Prioridade máxima',
  },
  {
    to: ROUTES.workouts,
    title: 'Revisar treino',
    description: 'Deixe a sessão principal pronta antes da sua janela de treino abrir.',
    icon: Dumbbell,
    phase: 'Próximo passo',
  },
  {
    to: ROUTES.atlasAI,
    title: 'Perguntar à Atlas AI',
    description: 'Use um prompt curto quando quiser uma decisão clara sem ruído extra.',
    icon: Brain,
    phase: 'Insight rápido',
  },
  {
    to: ROUTES.profile,
    title: 'Refinar perfil',
    description: 'Mantenha as preferências base alinhadas para o app ficar preciso.',
    icon: User,
    phase: 'Manter alinhado',
  },
];

function getPreferredName(displayName) {
  if (!displayName) return 'Atleta';
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function getDateLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

// ── Simple rules-based insight generator ──────────────────────────────────────
// Priority order: missing data warnings → positive streaks → protocol info → default
function buildInsight({
  recentSessions,
  todayMeals,
  recentMeasurements,
  activeProtocolsList,
  activeDietPlan,
  activeWorkoutPlan,
  todayStr,
}) {
  const last7 = recentSessions.filter((s) => {
    if (!s.date) return false;
    const diff = (new Date(todayStr) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  const completedLast7 = last7.filter((s) => s.status === 'completed').length;

  // 1. No workouts this week despite having an active plan
  if (activeWorkoutPlan && completedLast7 === 0) {
    return {
      title: 'Nenhum treino registrado esta semana.',
      description:
        'Você tem um plano ativo. Abra Treinos para registrar sua próxima sessão.',
    };
  }

  // 2. No meals logged today despite having an active diet plan
  if (activeDietPlan && todayMeals.length === 0) {
    return {
      title: 'Nenhuma refeição registrada hoje.',
      description:
        'Abra Nutrição para registrar suas refeições e acompanhar os macros do dia.',
    };
  }

  // 3. No measurements ever (new user prompt)
  if (recentMeasurements.length === 0) {
    return {
      title: 'Sem medidas registradas ainda.',
      description:
        'Registre o peso e medidas em Progresso para acompanhar sua evolução ao longo do tempo.',
    };
  }

  // 4. No measurements in the last 30 days (lapsed tracking)
  const thirtyAgoStr = (() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  })();
  const hasRecentMeasure = recentMeasurements.some((m) => m.date && m.date >= thirtyAgoStr);
  if (!hasRecentMeasure) {
    return {
      title: 'Nenhuma medida nos últimos 30 dias.',
      description:
        'Registrar o peso regularmente ajuda a identificar tendências e ajustar o plano.',
    };
  }

  // 5. Great workout consistency this week
  if (completedLast7 >= 4) {
    return {
      title: `${completedLast7} treinos concluídos nos últimos 7 dias.`,
      description:
        'Consistência excelente. Continue neste ritmo para maximizar os resultados.',
    };
  }
  if (completedLast7 >= 2) {
    return {
      title: `${completedLast7} treinos concluídos esta semana.`,
      description: 'Boa consistência. Cada sessão completa conta para o resultado final.',
    };
  }

  // 6. Active protocol info
  if (activeProtocolsList.length > 0) {
    const p = activeProtocolsList[0];
    const since = p.start_date
      ? new Date(`${p.start_date}T12:00:00`).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
        })
      : null;
    const count = activeProtocolsList.length;
    return {
      title: `${count} protocolo${count > 1 ? 's' : ''} ativo${count > 1 ? 's' : ''}.`,
      description: since
        ? `${p.name || 'Protocolo'} ativo desde ${since}. Acompanhe o estoque em Protocolos.`
        : 'Acompanhe seus suplementos e protocolos na aba Protocolos.',
    };
  }

  // Default
  return {
    title: 'Comece pela nutrição, depois abra o treino.',
    description:
      'Manter a primeira decisão alimentar visível geralmente deixa o resto do dia mais leve e fácil de executar.',
  };
}

export default function Today() {
  return (
    <SafePageBoundary
      title="Hoje"
      subtitle="Visão geral diária."
      maxWidth="max-w-5xl"
      fallbackDescription="A tela Hoje abriu em modo seguro."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}

function TodayContent() {
  const { user } = useAuth();
  const { role, loading: isRoleLoading } = useRole(user);
  const displayName = user?.full_name || user?.email || 'Atleta';
  const preferredName = getPreferredName(displayName);
  const greeting = getGreeting();
  const isAdmin = !isRoleLoading && role === 'admin';

  const todayStr = new Date().toISOString().split('T')[0];

  // ── Data queries ───────────────────────────────────────────────────────────

  const { data: activeDietPlans = [], isLoading: loadingDiet } = useQuery({
    queryKey: ['today-diet-plan'],
    queryFn: () => base44.entities.DietPlan.filter({ active: true }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeWorkoutPlans = [], isLoading: loadingWorkout } = useQuery({
    queryKey: ['today-workout-plan'],
    queryFn: () => base44.entities.WorkoutPlan.filter({ active: true }),
    staleTime: 5 * 60 * 1000,
  });

  // Fix: fetch 20 sessions sorted by date (not created_date) for accurate 7-day window
  const { data: recentSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['today-sessions'],
    queryFn: () => base44.entities.Workout.list('-date', 20),
    staleTime: 2 * 60 * 1000,
  });

  // Today's meals — for real nutrition adherence (not just plan existence)
  const { data: recentMeals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['today-meals-recent'],
    queryFn: () => base44.entities.Meal.list('-date', 30),
    staleTime: 2 * 60 * 1000,
  });

  // Recent measurements — for the progress snapshot card
  const { data: recentMeasurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['today-measurements-recent'],
    queryFn: () => base44.entities.Measurement.list('-date', 10),
    staleTime: 10 * 60 * 1000,
  });

  // Active protocols — for the protocols snapshot card and insight
  const { data: allProtocols = [], isLoading: loadingProtocols } = useQuery({
    queryKey: ['today-protocols'],
    queryFn: () => base44.entities.Protocol.list('-start_date', 50),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    loadingDiet ||
    loadingWorkout ||
    loadingSessions ||
    loadingMeals ||
    loadingMeasurements ||
    loadingProtocols;

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeDietPlan = activeDietPlans[0] || null;
  const activeWorkoutPlan = activeWorkoutPlans[0] || null;
  const todayMeals = recentMeals.filter((m) => m.date === todayStr);
  const activeProtocolsList = allProtocols.filter((p) => p.active && !p.end_date);
  const latestMeasurement = recentMeasurements[0] || null;
  const todaySession = recentSessions.find((s) => s.date === todayStr);

  // ── Snapshot card values ─────────────────────────────────────────────────

  const nutritionValue = activeDietPlan
    ? `${activeDietPlan.total_calories ?? activeDietPlan.target_calories ?? '—'} kcal`
    : 'Sem plano';
  const nutritionMeta = activeDietPlan
    ? activeDietPlan.name || 'Plano ativo'
    : 'Configure em Nutrição';

  const workoutValue = todaySession
    ? todaySession.status === 'completed'
      ? 'Concluído'
      : 'Em andamento'
    : activeWorkoutPlan
      ? 'Pendente'
      : 'Sem plano';
  const workoutMeta = activeWorkoutPlan
    ? activeWorkoutPlan.name || 'Plano ativo'
    : 'Configure em Treinos';

  const progressValue = latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '—';
  const progressMeta = latestMeasurement
    ? new Date(`${latestMeasurement.date}T12:00:00`).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
      })
    : 'Adicionar medida';

  const protocolsValue = String(activeProtocolsList.length);
  const protocolsMeta =
    activeProtocolsList.length > 0
      ? `${activeProtocolsList.length} ativo${activeProtocolsList.length > 1 ? 's' : ''}`
      : 'Nenhum ativo';

  const snapshotCards = [
    {
      to: ROUTES.nutrition,
      label: 'Nutrição',
      value: isLoading ? '—' : nutritionValue,
      description: activeDietPlan
        ? 'Meta calórica do plano ativo.'
        : 'Nenhum plano alimentar ativo.',
      meta: isLoading ? '...' : nutritionMeta,
      icon: UtensilsCrossed,
      tone: 'blue',
    },
    {
      to: ROUTES.workouts,
      label: 'Treino',
      value: isLoading ? '—' : workoutValue,
      description: activeWorkoutPlan
        ? 'Plano de treino ativo.'
        : 'Nenhum plano de treino ativo.',
      meta: isLoading ? '...' : workoutMeta,
      icon: Dumbbell,
      tone: 'orange',
    },
    {
      to: ROUTES.measurements,
      label: 'Progresso',
      value: isLoading ? '—' : progressValue,
      description: latestMeasurement
        ? 'Última medida registrada.'
        : 'Nenhuma medida registrada.',
      meta: isLoading ? '...' : progressMeta,
      icon: Scale,
      tone: 'green',
    },
    {
      to: ROUTES.protocols,
      label: 'Protocolos',
      value: isLoading ? '—' : protocolsValue,
      description:
        activeProtocolsList.length > 0
          ? 'Protocolos ativos agora.'
          : 'Nenhum protocolo ativo.',
      meta: isLoading ? '...' : protocolsMeta,
      icon: Shield,
      tone: 'teal',
    },
  ];

  // ── Adherence — driven by real data ────────────────────────────────────────

  const last7 = recentSessions.filter((s) => {
    if (!s.date) return false;
    const diff = (new Date(todayStr) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  const completedLast7 = last7.filter((s) => s.status === 'completed').length;
  const workoutFreq = activeWorkoutPlan?.frequency || activeWorkoutPlan?.days?.length || 4;
  const workoutAdherence = activeWorkoutPlan
    ? Math.min(100, Math.round((completedLast7 / Math.max(1, workoutFreq)) * 100))
    : 0;

  // Nutrition adherence: based on meals actually logged today (not just plan existence)
  const mealsLoggedToday = todayMeals.length;
  const nutritionAdherence =
    mealsLoggedToday >= 3 ? 100 : mealsLoggedToday === 2 ? 66 : mealsLoggedToday === 1 ? 33 : 0;

  const adherenceSignals = [
    { label: 'Nutrição', value: nutritionAdherence },
    { label: 'Treino', value: workoutAdherence },
  ];
  const adherenceAverage = Math.round(
    adherenceSignals.reduce((t, i) => t + i.value, 0) / adherenceSignals.length,
  );

  // ── Dynamic data-driven insight ────────────────────────────────────────────

  const insight = isLoading
    ? { title: 'Carregando...', description: 'Aguarde enquanto os dados são carregados.' }
    : buildInsight({
        recentSessions,
        todayMeals,
        recentMeasurements,
        activeProtocolsList,
        activeDietPlan,
        activeWorkoutPlan,
        todayStr,
      });

  // ── Recent activity (last 5 workout sessions) ─────────────────────────────

  const recentActivity = recentSessions.slice(0, 5);

  return (
    <TodayScreen>
      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="atlas-overline">{getDateLabel()}</p>
          <h1 className="mt-3 text-[34px] font-bold tracking-[-0.07em] text-[hsl(var(--fg))]">
            Hoje
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.9)_0%,hsl(var(--card))_100%)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
      </header>

      {/* ── Greeting card ── */}
      <TodayCard className="relative overflow-hidden border-[hsl(var(--brand)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.14),transparent_28%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.18),transparent_34%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_45%,hsl(var(--fill)/0.96)_100%)] shadow-[var(--shadow-md)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.16)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[hsl(var(--accent-secondary)/0.16)] blur-2xl" />

        <div className="relative">
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)] px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
                Modo admin ativo
              </span>
            </div>
          )}
          <p className="mt-5 text-[30px] font-bold tracking-[-0.07em] text-[hsl(var(--fg))]">
            {greeting}, {preferredName}
          </p>
          <p className="mt-2 max-w-[30rem] text-[15px] leading-6 text-[hsl(var(--fg-2))]">
            Seu centro de nutrição, treino e próxima decisão do dia.
          </p>
        </div>
      </TodayCard>

      {/* ── Snapshot cards — 4 pillars ── */}
      <TodaySection eyebrow="Resumo" title="Hoje em um olhar">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-[13px] text-[hsl(var(--fg-2))]">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando dados…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {snapshotCards.map((item) => (
              <TodayStatCard
                key={item.label}
                to={item.to}
                label={item.label}
                value={item.value}
                description={item.description}
                meta={item.meta}
                icon={item.icon}
                tone={item.tone}
              />
            ))}
          </div>
        )}
      </TodaySection>

      {/* ── Adherence + Insight side by side ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodaySection eyebrow="Aderência" title="Consistência recente">
          <TodayAdherenceCard
            score={isLoading ? 0 : adherenceAverage}
            summary={
              isLoading
                ? 'Calculando...'
                : adherenceAverage >= 70
                  ? 'Boa consistência nas últimas semanas.'
                  : adherenceAverage > 0
                    ? 'Há espaço para melhorar a consistência.'
                    : 'Configure seus planos para calcular a aderência.'
            }
            items={isLoading ? [] : adherenceSignals}
          />
        </TodaySection>

        <TodaySection eyebrow="Insight do dia" title="Leitura rápida">
          <TodayInsightCard
            to={ROUTES.insights}
            eyebrow="Insight do dia"
            icon={Brain}
            title={insight.title}
            description={insight.description}
            cta="Ver todos os insights"
          />
        </TodaySection>
      </div>

      {/* ── Recent activity — last 5 workout sessions ── */}
      {!isLoading && recentActivity.length > 0 && (
        <TodaySection eyebrow="Atividade" title="Sessões recentes">
          <TodayCard>
            <div className="space-y-3">
              {recentActivity.map((session) => {
                const isCompleted = session.status === 'completed';
                const sessionDate = session.date
                  ? new Date(`${session.date}T12:00:00`).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                  : '—';

                return (
                  <div
                    key={session.id || `${session.date}-${session.name}`}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border',
                        isCompleted
                          ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
                          : 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Clock className="h-4 w-4" strokeWidth={2} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[hsl(var(--fg))]">
                        {session.name || session.workout_type || 'Treino'}
                      </p>
                      <p className="text-[12px] text-[hsl(var(--fg-3))]">{sessionDate}</p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        isCompleted
                          ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                          : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]',
                      )}
                    >
                      {isCompleted ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                );
              })}
            </div>
          </TodayCard>
        </TodaySection>
      )}

      {/* ── Next steps — action cards ── */}
      <TodaySection
        eyebrow="Próximos passos"
        title="Ações prioritárias"
        description="Avance pelo dia na ordem certa, com uma ação clara por card."
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {NEXT_STEPS.map((item, index) => (
            <TodayActionCard
              key={item.to}
              to={item.to}
              title={item.title}
              description={item.description}
              icon={item.icon}
              priority={item.phase}
              highlighted={index === 0}
            />
          ))}
        </div>
      </TodaySection>
    </TodayScreen>
  );
}
