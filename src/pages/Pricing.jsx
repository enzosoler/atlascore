import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PrimaryButton,
  SafePageBoundary,
  SectionCard,
  SecondaryButton,
} from '@/components/shared/StablePage';
import { ROUTES } from '@/lib/routes';

const ATHLETE_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    subtitle: 'Entrada simples para registrar e comecar.',
    icon: Sparkles,
    features: ['Today', 'Measurements', 'Nutrition', 'Workouts', 'Historico inicial'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 29',
    subtitle: 'Uso diario com IA, historico expandido e export.',
    icon: Zap,
    featured: true,
    features: [
      'Tudo do Free',
      'Atlas AI contextual',
      'Exames e fotos de progresso',
      'Export PDF / CSV',
      'Historico ampliado',
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    price: 'R$ 59',
    subtitle: 'Camada premium para rotina e leitura profunda.',
    icon: Star,
    features: [
      'Tudo do Pro',
      'Protocolos avancados',
      'Relatorios premium',
      'Historico ilimitado',
      'Leitura mais profunda de dados',
    ],
  },
];

const PROFESSIONAL_PLANS = [
  {
    id: 'coach',
    name: 'Coach',
    price: 'R$ 99',
    subtitle: 'Prescricao, acompanhamento e progresso de alunos.',
    icon: Users,
    features: [
      'Dashboard profissional',
      'Gestao de alunos',
      'Prescricao de treino',
      'Acompanhamento de aderencia',
    ],
  },
  {
    id: 'nutritionist',
    name: 'Nutritionist',
    price: 'R$ 79',
    subtitle: 'Fluxo nutricional focado em cliente e prescricao.',
    icon: Users,
    features: [
      'Dashboard nutricional',
      'Clientes e refeicoes',
      'Prescricao de dieta',
      'Resumo de medidas e progresso',
    ],
  },
  {
    id: 'clinician',
    name: 'Clinician',
    price: 'R$ 129',
    subtitle: 'Visao clinica consolidada com historico contextual.',
    icon: Stethoscope,
    features: [
      'Dashboard clinico',
      'Pacientes e exames',
      'Historico corporal e protocolos',
      'Export consolidado',
    ],
  },
];

function PlanCard({ plan }) {
  const Icon = plan.icon;

  return (
    <article
      className={`atlas-card relative flex h-full flex-col px-5 py-5 lg:px-6 lg:py-6 ${
        plan.featured ? 'border-[hsl(var(--brand)/0.32)] shadow-[var(--shadow-md)]' : ''
      }`}
    >
      {plan.featured ? (
        <span className="absolute right-5 top-5 rounded-full bg-[hsl(var(--brand)/0.1)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
          Mais usado
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <div className="min-w-0">
          <p className="text-[1rem] font-semibold tracking-[-0.026em] text-[hsl(var(--fg))]">
            {plan.name}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{plan.subtitle}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[2rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
          {plan.price}
          <span className="ml-1 text-[13px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
            /mes
          </span>
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.1} />
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{feature}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Pricing() {
  return (
    <SafePageBoundary
      title="Pricing"
      subtitle="Planos do Atlas Core para atletas e profissionais."
      maxWidth="max-w-6xl"
      fallbackDescription="A rota de Pricing continua acessivel mesmo se a interface principal falhar."
    >
      <div className="atlas-page-shell">
        <div className="mx-auto max-w-6xl space-y-8 px-5 py-6 lg:px-8 lg:py-10">
          <section className="atlas-page-header relative overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--brand)/0.08)] to-transparent" />

            <div className="relative space-y-6">
              <Link
                to={ROUTES.today}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
                Voltar para o app
              </Link>

              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="atlas-overline">Pricing</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Atlas Core plans
                  </span>
                </div>

                <h1 className="atlas-display-title">Escolha a camada certa para a sua operacao.</h1>
                <p className="max-w-2xl text-[15px] leading-7 text-[hsl(var(--fg-2))] lg:text-[16px]">
                  Os planos abaixo mantem a estrutura central do produto e escalam profundidade,
                  historico e capacidades profissionais conforme o uso.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={ROUTES.signup}>
                  <PrimaryButton type="button">Criar conta</PrimaryButton>
                </Link>
                <Link to={ROUTES.help}>
                  <SecondaryButton type="button">Ver ajuda</SecondaryButton>
                </Link>
              </div>
            </div>
          </section>

          <SectionCard
            title="Athlete plans"
            subtitle="Camadas para quem usa o produto no proprio dia a dia."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {ATHLETE_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Professional plans"
            subtitle="Planos pensados para acompanhamento, prescricao e leitura consolidada."
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {PROFESSIONAL_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </SafePageBoundary>
  );
}
