import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { getGreeting } from '@/lib/atlas-theme';
import { SafePageBoundary, SectionCard, StatusBanner } from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NEXT_STEPS = [
  {
    to: ROUTES.nutrition,
    title: 'Open nutrition',
    description: 'Confirme refeicoes, metas e o que precisa ser registrado primeiro.',
    icon: UtensilsCrossed,
    phase: 'Now',
  },
  {
    to: ROUTES.workouts,
    title: 'Review workout',
    description: 'Deixe a sessao principal pronta antes da janela de treino.',
    icon: Dumbbell,
    phase: 'Next',
  },
  {
    to: ROUTES.atlasAI,
    title: 'Check Atlas AI',
    description: 'Use um prompt rapido para validar a melhor proxima decisao.',
    icon: Brain,
    phase: 'Then',
  },
  {
    to: ROUTES.profile,
    title: 'Refine profile',
    description: 'Mantenha preferencias e dados-base alinhados para o resto do produto.',
    icon: User,
    phase: 'Keep aligned',
  },
];

const SNAPSHOT_CARDS = [
  {
    label: 'Session',
    value: 'Active',
    description: 'Autenticacao local estavel e shell pronto para navegar sem backend.',
    icon: ShieldCheck,
  },
  {
    label: 'Nutrition',
    value: 'Ready',
    description: 'A jornada de refeicoes e metas esta pronta para ser validada hoje.',
    icon: UtensilsCrossed,
  },
  {
    label: 'Workout',
    value: 'Ready',
    description: 'A area de treino ja pode ser usada sem depender de dados remotos.',
    icon: Dumbbell,
  },
  {
    label: 'Atlas AI',
    value: 'Standby',
    description: 'A camada de insight fica disponivel quando voce quiser orientar o dia.',
    icon: Brain,
  },
];

const ADHERENCE_SIGNALS = [
  {
    label: 'Nutrition',
    value: 82,
    detail: 'Estrutura de refeicoes pronta para ser executada com clareza.',
  },
  {
    label: 'Training',
    value: 76,
    detail: 'Treino principal mapeado e facil de abrir na hora certa.',
  },
  {
    label: 'Recovery',
    value: 88,
    detail: 'Ritmo do dia e check-ins preparados para manter consistencia.',
  },
];

function getPreferredName(displayName) {
  if (!displayName) return 'Athlete';
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function HeroMicroStat({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.78)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 break-words text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function NextStepItem({ item, active = false }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        'group flex items-start gap-3 rounded-[24px] border px-4 py-4 transition-all duration-200',
        active
          ? 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]'
          : 'border-transparent bg-transparent hover:border-[hsl(var(--border)/0.82)] hover:bg-[hsl(var(--card)/0.72)]'
      )}
    >
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
            {item.phase}
          </p>
          <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))] transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.8} />
        </div>
        <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {item.title}
        </p>
        <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.description}</p>
      </div>
    </Link>
  );
}

function SnapshotCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="atlas-card flex h-full flex-col justify-between px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="atlas-metric-label">{item.label}</p>
          <p className="text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
            {item.value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
      </div>
      <p className="mt-5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.description}</p>
    </article>
  );
}

function AdherenceRow({ label, value, detail }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
            {label}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
        </div>
        <span className="text-[13px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
        <div
          className="h-full rounded-full bg-[hsl(var(--fg))]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function Today() {
  return (
    <SafePageBoundary
      title="Today"
      subtitle="Mock local do dashboard enquanto os dados remotos ainda sao migrados."
      maxWidth="max-w-6xl"
      fallbackDescription="O dashboard local abriu em modo seguro."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}

function TodayContent() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email || 'Athlete';
  const preferredName = getPreferredName(displayName);
  const greeting = getGreeting();
  const adherenceAverage = Math.round(
    ADHERENCE_SIGNALS.reduce((total, item) => total + item.value, 0) / ADHERENCE_SIGNALS.length
  );

  return (
    <div className="atlas-page-shell">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-6 lg:px-8 lg:py-10">
        <section className="atlas-page-header relative overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--brand)/0.08)] to-transparent" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="atlas-overline">Today</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Local preview
                  </span>
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="atlas-display-title">{greeting}, {preferredName}.</h1>
                  <p className="max-w-2xl text-[15px] leading-7 text-[hsl(var(--fg-2))] lg:text-[16px]">
                    A quiet command view for today&apos;s nutrition, training and decision-making.
                    Everything important stays visible, with the next move always clear.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link to={ROUTES.nutrition}>
                    Open nutrition
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to={ROUTES.workouts}>Review workout</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to={ROUTES.atlasAI}>Atlas AI</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMicroStat
                  label="Athlete"
                  value={displayName}
                  detail={user?.email || 'Sessao local sem backend remoto.'}
                />
                <HeroMicroStat
                  label="Mode"
                  value="Safe local"
                  detail="Core navigation and next actions stay available while remote data is being migrated."
                />
                <HeroMicroStat
                  label="Focus"
                  value="Nutrition first"
                  detail="Start with meals and targets, then move into the workout flow."
                />
              </div>
            </div>

            <aside className="rounded-[30px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.6)] p-5 shadow-[var(--shadow-xs)] lg:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="atlas-overline">What&apos;s next</p>
                  <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                    Move the day forward without noise.
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] text-[hsl(var(--fg-2))]">
                  <Target className="h-4 w-4" strokeWidth={1.9} />
                </div>
              </div>

              <div className="space-y-2">
                {NEXT_STEPS.map((item, index) => (
                  <NextStepItem key={item.to} item={item} active={index === 0} />
                ))}
              </div>
            </aside>
          </div>
        </section>

        <StatusBanner tone="warning">
          Primeiro ponto de falha encontrado: a rota <strong>/Today</strong> ainda fazia chamadas a
          <strong> base44.entities.Protocol.*</strong>. Nesta etapa, ela foi trocada por um mock local
          sem backend.
        </StatusBanner>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SNAPSHOT_CARDS.map((item) => (
            <SnapshotCard key={item.label} item={item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <SectionCard
            title="Adherence"
            subtitle="A calm read on how the day is lining up across nutrition, training and recovery."
          >
            <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.5)] px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="atlas-metric-label">Daily signal</p>
                <p className="mt-3 text-[2.25rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
                  {adherenceAverage}%
                </p>
                <p className="mt-2 max-w-lg text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                  The mock Today flow already feels aligned: next actions are clear, navigation is tight
                  and the day reads like one coherent workspace.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                Preview signal
              </span>
            </div>

            <div className="space-y-5">
              {ADHERENCE_SIGNALS.map((item) => (
                <AdherenceRow key={item.label} {...item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            className="relative overflow-hidden"
            title="Atlas AI"
            subtitle="Insight should guide the day softly, not compete with the core workflow."
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--brand)/0.07)] to-transparent" />

            <div className="relative space-y-6">
              <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))]">
                    <Brain className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="atlas-metric-label">Soft insight</p>
                    <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                      Start with nutrition, then open the workout.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                  Keeping food decisions visible before training makes the whole workspace feel calmer.
                  It also creates a cleaner story for adherence and for any later Atlas AI prompt.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Lock the first meal or calorie target early.',
                  'Keep the main workout visible before the training window.',
                  'Use Atlas AI for one decision at a time, not for noise.',
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4"
                  >
                    <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[hsl(var(--fg))]" />
                    <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{point}</p>
                  </div>
                ))}
              </div>

              <Button asChild variant="outline" size="lg">
                <Link to={ROUTES.atlasAI}>Open Atlas AI</Link>
              </Button>
            </div>
          </SectionCard>
        </section>
      </div>
    </div>
  );
}
