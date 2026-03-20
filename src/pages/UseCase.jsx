import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import PublicSiteShell, {
  PublicLanguageSwitcher,
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const USE_CASES = {
  athlete: {
    eyebrow: 'Atleta',
    title: 'Para atletas e entusiastas que querem histórico real.',
    heroSubtitle: 'Treino, nutrição, progresso e contexto de decisão em um único sistema.',
    features: [
      {
        icon: Target,
        title: 'Tracking detalhado',
        description: 'Registre treino, dieta e evolução sem espalhar dados por ferramentas diferentes.',
      },
      {
        icon: TrendingUp,
        title: 'Leitura de tendência',
        description: 'Veja como peso, força, aderência e rotina realmente evoluem ao longo do tempo.',
      },
      {
        icon: BarChart3,
        title: 'Contexto para ajustar',
        description: 'Entenda o que está funcionando e onde a execução foge do plano.',
      },
    ],
    benefits: [
      'Fotos, medidas e histórico no mesmo lugar',
      'Atlas AI com contexto do seu uso real',
      'Plano vs execução visível no dia a dia',
      'Exportações para guardar ou compartilhar',
    ],
    cta: 'Criar conta de atleta',
  },
  coach: {
    eyebrow: 'Coach',
    title: 'Para coaches que precisam acompanhar aderência sem depender de prints.',
    heroSubtitle: 'Prescreva, acompanhe e interprete a execução dos alunos a partir do mesmo histórico.',
    features: [
      {
        icon: Users,
        title: 'Visão de alunos',
        description: 'Centralize progresso, aderência e contexto de cada atleta em uma mesma base.',
      },
      {
        icon: Target,
        title: 'Prescrição clara',
        description: 'Transforme o plano em rotina executável, com comparação direta entre prescrito e realizado.',
      },
      {
        icon: BarChart3,
        title: 'Leitura prática',
        description: 'Identifique quem está travando, onde a execução cai e o que precisa de ajuste.',
      },
    ],
    benefits: [
      'Dashboard profissional com múltiplos alunos',
      'Acompanhamento de aderência em tempo real',
      'Treino, dieta e check-ins no mesmo fluxo',
      'Resumo exportável para acompanhamento',
    ],
    cta: 'Começar como coach',
  },
  nutritionist: {
    eyebrow: 'Nutricionista',
    title: 'Para nutricionistas que querem contexto além do plano alimentar.',
    heroSubtitle: 'Dieta prescrita, refeições reais, medidas e evolução conectadas na mesma narrativa.',
    features: [
      {
        icon: UtensilsCrossed,
        title: 'Plano e ingestão lado a lado',
        description: 'Compare o planejado com o consumido e entenda aderência de forma concreta.',
      },
      {
        icon: BarChart3,
        title: 'Histórico confiável',
        description: 'Veja refeições, progresso, sinais de consistência e lacunas com menos ruído.',
      },
      {
        icon: TrendingUp,
        title: 'Ajuste com evidência',
        description: 'Refine o plano com base na execução real e na evolução do cliente.',
      },
    ],
    benefits: [
      'Clientes e prescrições no mesmo ambiente',
      'Leitura de medidas e progresso corporal',
      'Relatórios nutricionais com mais contexto',
      'Geração de dieta com apoio de IA quando necessário',
    ],
    cta: 'Começar como nutricionista',
  },
  clinician: {
    eyebrow: 'Clínico',
    title: 'Para clínicos que precisam de uma visão integrada do paciente.',
    heroSubtitle: 'Exames, protocolos, medidas e rotina registrados de forma contínua e compartilhável.',
    features: [
      {
        icon: BarChart3,
        title: 'Histórico consolidado',
        description: 'Acompanhe dados laboratoriais, biometria e sinais de rotina sem fragmentação.',
      },
      {
        icon: Target,
        title: 'Protocolos com contexto',
        description: 'Ligue decisões clínicas ao comportamento real do paciente ao longo do tempo.',
      },
      {
        icon: Users,
        title: 'Acompanhamento contínuo',
        description: 'Tenha uma base comum para monitorar adesão, evolução e próximos ajustes.',
      },
    ],
    benefits: [
      'Visão clínica com histórico contínuo',
      'Protocolos e logs em um só lugar',
      'Medidas e evolução corporal conectadas',
      'Relatórios consolidados para acompanhamento',
    ],
    cta: 'Começar como clínico',
  },
};

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="atlas-card h-full px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>
      <p className="mt-5 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">
        {feature.title}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{feature.description}</p>
    </article>
  );
}

export default function UseCase() {
  const { role } = useParams();
  const navigate = useNavigate();
  const caseData = USE_CASES[role];

  if (!caseData) {
    return (
      <PublicSiteShell
        compactNav
        actions={<PublicLanguageSwitcher />}
      >
        <section className="mx-auto max-w-4xl px-5 pb-6 pt-16 lg:px-8">
          <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
            <p className="atlas-overline justify-center">Use Case</p>
            <h1 className="atlas-display-title mt-4">Use case não encontrado.</h1>
            <p className="atlas-public-copy mx-auto mt-4 max-w-xl">
              Esse cenário ainda não existe nesta versão pública do <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild>
                <Link to={ROUTES.home}>Voltar para home</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicSiteShell>
    );
  }

  return (
    <PublicSiteShell
      compactNav
      actions={(
        <>
          <PublicLanguageSwitcher />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to={ROUTES.help}>Help</Link>
          </Button>
          <Button asChild>
            <Link to={`${ROUTES.auth}?mode=signup`}>Criar conta</Link>
          </Button>
        </>
      )}
    >
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12 lg:px-8 lg:pt-16">
        <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="atlas-overline transition-colors hover:text-[hsl(var(--fg-2))]"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Voltar
          </button>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="atlas-overline">{caseData.eyebrow}</p>
              <h1 className="atlas-display-title mt-4 text-[clamp(2.5rem,2rem+1.6vw,4.15rem)]">
                {caseData.title}
              </h1>
              <p className="atlas-public-copy mt-4 max-w-2xl">{caseData.heroSubtitle}</p>
            </div>

            <div className="atlas-public-panel-muted p-4">
              <p className="atlas-metric-label">Por que <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                O valor não está só em registrar. Está em transformar tudo em uma linha do tempo confiável.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <PublicSectionHeader
            eyebrow="Capacidades"
            title="O que muda nesse cenário."
            description="Cada perfil usa o mesmo produto, mas com leituras e ações ajustadas ao seu papel."
            className="mb-10"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {caseData.features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <PublicSectionHeader
            eyebrow="Benefícios"
            title="Benefícios práticos."
            description="Resultados de produto quando os dados deixam de ficar espalhados."
          />

          <div className="atlas-public-panel-muted p-5 lg:p-6">
            <div className="space-y-3">
              {caseData.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
                    <Zap className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
          <p className="atlas-overline justify-center">Começar</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(2.2rem,1.9rem+1.3vw,3.3rem)]">
            {caseData.cta}
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            Entre no <span className="text-[hsl(var(--accent-primary))]">atlas</span>.core e continue a partir do mesmo sistema visual, sem mudar de contexto entre público e produto.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={`${ROUTES.auth}?mode=signup`}>
                {caseData.cta}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>Ver pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
