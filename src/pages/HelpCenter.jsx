import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Dumbbell, Sparkles, Target } from 'lucide-react';
import GuideCard from '@/components/content/GuideCard';
import PublicSiteShell, {
  PublicLanguageSwitcher,
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const START_GUIDES = [
  {
    title: 'Primeiros Passos',
    excerpt: 'Criar conta, completar onboarding e entender como o Atlas Core organiza sua rotina desde o primeiro dia.',
    readingTime: 5,
    icon: BookOpen,
    href: '/guides/getting-started',
    category: 'Onboarding',
  },
];

const TRACKING_GUIDES = [
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
];

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
          <span className="atlas-public-pill">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
            Help Center
          </span>
          <h1 className="atlas-display-title mt-5 max-w-4xl text-[clamp(2.6rem,2rem+1.6vw,4rem)]">
            Guias diretos para entrar, registrar e acompanhar com clareza.
          </h1>
          <p className="atlas-public-copy mt-4 max-w-2xl">
            Conteúdo objetivo para abrir a conta, registrar treino e entender aderência sem precisar adivinhar o próximo passo.
          </p>
        </div>
      </section>

      <section id="guides" className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <div className="space-y-10">
            <div className="space-y-6">
              <PublicSectionHeader
                eyebrow="Comece Aqui"
                title="Abra sua conta e entenda a base do produto."
                description="O essencial para sair do zero e chegar ao primeiro uso com contexto."
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {START_GUIDES.map((guide) => (
                  <GuideCard key={guide.title} {...guide} />
                ))}
              </div>
            </div>

            <div className="space-y-6 border-t border-[hsl(var(--border)/0.76)] pt-8">
              <PublicSectionHeader
                eyebrow="Tracking"
                title="Registre execução e leia aderência com clareza."
                description="Esses guias cobrem o núcleo do uso diário para treino e análise."
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {TRACKING_GUIDES.map((guide) => (
                  <GuideCard key={guide.title} {...guide} />
                ))}
              </div>
            </div>
          </div>
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
            Se quiser ver os planos ou abrir sua conta agora, você entra direto no produto e continua daqui com contexto.
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
