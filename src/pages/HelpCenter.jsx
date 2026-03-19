import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Dumbbell, Sparkles, Target, UtensilsCrossed } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GuideCard from '@/components/content/GuideCard';
import PublicSiteShell, {
  PublicLanguageSwitcher,
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const GUIDES = {
  'getting-started': [
    {
      title: 'Primeiros Passos',
      excerpt: 'Criar conta, completar onboarding e entender como o Atlas Core organiza sua rotina desde o primeiro dia.',
      readingTime: 5,
      icon: BookOpen,
      href: '/guides/getting-started',
      category: 'Onboarding',
    },
    {
      title: 'Tour do Dashboard',
      excerpt: 'Um walkthrough completo da shell principal do produto e das áreas prioritárias do dia.',
      readingTime: 6,
      icon: Brain,
      category: 'Onboarding',
      disabled: true,
    },
  ],
  tracking: [
    {
      title: 'Logging de Treinos',
      excerpt: 'Como registrar exercícios, séries, reps, peso e progressão com precisão.',
      readingTime: 8,
      icon: Dumbbell,
      href: '/guides/workout-logging',
      category: 'Treino',
    },
    {
      title: 'Plano vs Execução',
      excerpt: 'Entenda aderência com clareza: o que foi prescrito, o que foi feito e onde ajustar.',
      readingTime: 7,
      icon: Target,
      href: '/guides/plan-vs-execution',
      category: 'Análise',
    },
    {
      title: 'Rastreamento Nutricional',
      excerpt: 'Registro de refeições, macros, contexto diário e aderência alimentar.',
      readingTime: 9,
      icon: UtensilsCrossed,
      category: 'Nutrição',
      disabled: true,
    },
  ],
  features: [
    {
      title: 'Atlas AI',
      excerpt: 'Como usar a IA contextual do produto para interpretar rotina, tendências e próximos passos.',
      readingTime: 10,
      icon: Brain,
      category: 'IA',
      disabled: true,
    },
    {
      title: 'Medições e Progresso',
      excerpt: 'Peso, composição e evolução corporal no mesmo histórico do resto do sistema.',
      readingTime: 6,
      icon: Target,
      category: 'Tracking',
      disabled: true,
    },
  ],
};

const FAQ_ITEMS = [
  {
    q: 'Quanto custa o Atlas Core?',
    a: 'Existe um plano gratuito para começar e camadas pagas para IA, relatórios e contexto profissional. A comparação completa fica na página de pricing.',
  },
  {
    q: 'O produto funciona no celular?',
    a: 'Sim. As experiências principais foram pensadas para desktop e mobile sem perder a mesma linguagem visual nem a mesma clareza de navegação.',
  },
  {
    q: 'Posso compartilhar com coach ou nutricionista?',
    a: 'Sim. O Atlas Core foi desenhado para manter o mesmo histórico acessível a atleta e profissionais, sem depender de prints soltos.',
  },
  {
    q: 'Consigo exportar meus dados?',
    a: 'Sim. Os planos pagos expandem exportações e relatórios, mantendo a lógica de um sistema único para acompanhar a evolução.',
  },
];

export default function HelpCenter() {
  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.blog, label: 'Blog' },
        { href: '#guides', label: 'Guias' },
        { href: '#faq', label: 'FAQ' },
      ]}
      actions={(
        <>
          <PublicLanguageSwitcher />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to={ROUTES.pricing}>Planos</Link>
          </Button>
          <Button asChild>
            <Link to={`${ROUTES.auth}?mode=signup`}>Criar conta</Link>
          </Button>
        </>
      )}
    >
      <PublicMetadata
        title="Help Center — Atlas Core"
        description="Public guides and FAQs for learning Atlas Core, from onboarding to training and adherence workflows."
        canonicalPath={ROUTES.help}
      />

      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12 lg:px-8 lg:pt-16">
        <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <span className="atlas-public-pill">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
                Help Center
              </span>
              <h1 className="atlas-display-title mt-5 text-[clamp(2.6rem,2rem+1.6vw,4rem)]">
                Guides para usar o Atlas Core com clareza.
              </h1>
              <p className="atlas-public-copy mt-4 max-w-2xl">
                Conteúdo objetivo para onboarding, tracking e leitura de aderência, sempre dentro da mesma lógica do produto.
              </p>
            </div>

            <div className="atlas-public-panel-muted p-4">
              <p className="atlas-metric-label">Fluxo</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                Leia um guide, abra o produto e continue do mesmo ponto sem mudar de linguagem visual.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="guides" className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <Tabs defaultValue="getting-started" className="space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <PublicSectionHeader
                eyebrow="Guias"
                title="Comece rápido, depois aprofunde."
                description="Agrupamos os materiais por momento da jornada para manter a descoberta simples."
              />

              <TabsList className="grid w-full max-w-[420px] grid-cols-3 rounded-[22px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.66)] p-1 shadow-[var(--shadow-xs)]">
                <TabsTrigger value="getting-started" className="rounded-[18px] text-[12px] font-medium">
                  Início
                </TabsTrigger>
                <TabsTrigger value="tracking" className="rounded-[18px] text-[12px] font-medium">
                  Tracking
                </TabsTrigger>
                <TabsTrigger value="features" className="rounded-[18px] text-[12px] font-medium">
                  Recursos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="getting-started" className="grid gap-4 lg:grid-cols-2">
              {GUIDES['getting-started'].map((guide) => (
                <GuideCard key={guide.title} {...guide} />
              ))}
            </TabsContent>

            <TabsContent value="tracking" className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {GUIDES.tracking.map((guide) => (
                <GuideCard key={guide.title} {...guide} />
              ))}
            </TabsContent>

            <TabsContent value="features" className="grid gap-4 lg:grid-cols-2">
              {GUIDES.features.map((guide) => (
                <GuideCard key={guide.title} {...guide} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <PublicSectionHeader
          eyebrow="FAQ"
          title="Perguntas rápidas antes de entrar."
          description="Respostas diretas para as dúvidas mais comuns da jornada pública."
          align="center"
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="atlas-card p-5 lg:p-6">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{item.q}</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
          <p className="atlas-overline justify-center">Próximo passo</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(2.2rem,1.9rem+1.4vw,3.3rem)]">
            Explore o produto com contexto.
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            Se quiser ver os planos ou abrir sua conta agora, você continua dentro da mesma linguagem do Atlas Core.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to={`${ROUTES.auth}?mode=signup`}>Criar conta</Link>
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
