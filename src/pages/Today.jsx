import React from 'react';
import { Brain, Dumbbell, Sparkles, User, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRole } from '@/hooks/useRole';
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

const SNAPSHOT_CARDS = [
  {
    to: ROUTES.nutrition,
    label: 'Nutrição',
    value: 'Pronto',
    description: 'Refeições e metas alinhadas para um começo limpo.',
    meta: 'Plano diário',
    icon: UtensilsCrossed,
    tone: 'blue',
  },
  {
    to: ROUTES.workouts,
    label: 'Treino',
    value: 'Pendente',
    description: 'Sua sessão principal está preparada e aguardando execução.',
    meta: 'Sessão de hoje',
    icon: Dumbbell,
    tone: 'orange',
  },
];

const ADHERENCE_SIGNALS = [
  {
    label: 'Nutrição',
    value: 82,
  },
  {
    label: 'Treino',
    value: 76,
  },
  {
    label: 'Recuperação',
    value: 88,
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

export default function Today() {
  return (
    <SafePageBoundary
      title="Hoje"
      subtitle="Visão geral diária."
      maxWidth="max-w-[480px]"
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
  const adherenceAverage = Math.round(
    ADHERENCE_SIGNALS.reduce((total, item) => total + item.value, 0) / ADHERENCE_SIGNALS.length
  );

  return (
    <TodayScreen>
      <header className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            {getDateLabel()}
          </p>
          <h1 className="mt-2 text-[34px] font-bold tracking-[-0.07em] text-[#111827]">Hoje</h1>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#0A84FF] shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
      </header>

      <TodayCard className="relative overflow-hidden border-[#93C5FD] bg-[linear-gradient(135deg,#0A84FF_0%,#38A3FF_55%,#79D6FF_100%)] text-white shadow-[0_14px_32px_rgba(10,132,255,0.24)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[#BAE6FD]/35 blur-2xl" />

        <div className="relative">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-white/92">
              Pré-visualização local
            </span>
            {isAdmin && (
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-white">
                Modo admin ativo
              </span>
            )}
          </div>

          <p className="mt-5 text-[30px] font-bold tracking-[-0.07em] text-white">
            {greeting}, {preferredName}
          </p>
          <p className="mt-2 max-w-[24rem] text-[15px] leading-6 text-white/84">
            Seu centro de nutrição, treino e próxima decisão do dia.
          </p>
          <p className="mt-5 text-[13px] font-medium text-white/80">{displayName}</p>
        </div>
      </TodayCard>

      <TodaySection
        eyebrow="Próximos passos"
        title="Ações prioritárias"
        description="Avance pelo dia na ordem certa, com uma ação clara por card."
      >
        <div className="space-y-3">
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

      <TodaySection eyebrow="Resumo" title="Hoje em um olhar">
        <div className="grid grid-cols-2 gap-3">
          {SNAPSHOT_CARDS.map((item) => (
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
      </TodaySection>

      <TodaySection eyebrow="Aderência" title="Consistência diária">
        <TodayAdherenceCard
          score={adherenceAverage}
          summary="Nutrição liderando o dia, treino na fila, e recuperação já dando base estável."
          items={ADHERENCE_SIGNALS}
        />
      </TodaySection>

      <TodaySection eyebrow="Atlas AI" title="Orientação discreta">
        <TodayInsightCard
          to={ROUTES.atlasAI}
          icon={Brain}
          title="Comece pela nutrição, depois abra o treino."
          description="Manter a primeira decisão alimentar visível geralmente deixa o resto do dia mais leve e fácil de executar."
        />
      </TodaySection>
    </TodayScreen>
  );
}
