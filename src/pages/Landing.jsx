import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  CheckCircle,
  ChevronRight,
  Dumbbell,
  FlaskConical,
  Package,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';
import PublicSiteShell, {
  PublicLanguageSwitcher,
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const handleSignUp = () => {
  window.location.href = `${ROUTES.auth}?mode=signup`;
};

const handleLogin = () => {
  window.location.href = `${ROUTES.auth}?mode=login`;
};

const handlePlanClick = (planId) => {
  if (planId === 'free' || !planId) {
    window.location.href = `${ROUTES.auth}?mode=signup`;
    return;
  }

  if (window.self !== window.top) {
    alert('O checkout só funciona no app publicado. Acesse a URL pública para assinar.');
    return;
  }

  sessionStorage.setItem('pending_plan', planId);
  window.location.href = `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.pricing)}`;
};

function TodayPreview({ t }) {
  return (
    <div className="atlas-public-panel relative overflow-hidden px-5 py-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--brand)/0.08)] to-transparent" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="atlas-overline">Today Preview</p>
            <p className="mt-3 text-[1.15rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
              {t('landing.mock.greeting')}
            </p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">{t('landing.mock.date')}</p>
          </div>

          <div className="atlas-public-panel-muted px-3 py-2">
            <p className="atlas-metric-label">Adherence</p>
            <p className="mt-2 text-[1.1rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              78%
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="atlas-public-panel-muted p-4">
            <p className="atlas-metric-label">{t('landing.mock.nutrition')}</p>
            <p className="mt-3 text-[1.9rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
              1.620
            </p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">/ 2.200 kcal</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
              <div className="h-full w-[74%] rounded-full bg-[hsl(var(--brand))]" />
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[hsl(var(--fg-2))]">
              <span>P 138g</span>
              <span>C 220g</span>
              <span>G 48g</span>
            </div>
          </div>

          <div className="atlas-public-panel-muted p-4">
            <p className="atlas-metric-label">{t('landing.mock.training')}</p>
            <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {t('landing.mock.trainingTitle')}
            </p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
              {t('landing.mock.trainingSubtitle')}
            </p>
            <span className="atlas-public-pill mt-4 border-[hsl(39_62%_80%)] bg-[hsl(42_82%_95%)] text-[hsl(30_54%_26%)]">
              {t('landing.mock.pending')}
            </span>
          </div>
        </div>

        <div className="atlas-public-panel-muted p-4">
          <p className="atlas-metric-label">{t('landing.mock.actionNeeded')}</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3 rounded-[20px] border border-[hsl(var(--err)/0.18)] bg-[hsl(var(--err)/0.05)] px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-[hsl(var(--card))] text-[hsl(var(--err))]">
                <AlertCircle className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                  {t('landing.mock.workoutTitle')}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {t('landing.mock.workoutMeta')}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
            </div>

            <div className="flex items-center gap-3 rounded-[20px] border border-[hsl(var(--warn)/0.22)] bg-[hsl(var(--warn)/0.08)] px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-[hsl(var(--card))] text-[hsl(var(--warn))]">
                <Package className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                  {t('landing.mock.stockTitle')}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {t('landing.mock.stockMeta')}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-[hsl(var(--brand-ai)/0.16)] bg-[hsl(var(--brand-ai)/0.06)] px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[hsl(var(--card))] text-[hsl(var(--brand-ai))] shadow-[var(--shadow-xs)]">
              <Brain className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="atlas-metric-label text-[hsl(var(--brand-ai))]">{t('landing.mock.aiLabel')}</p>
              <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                {t('landing.mock.aiInsight')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="atlas-public-panel-muted flex items-start gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{item.label}</p>
        <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{item.where}</p>
      </div>
    </div>
  );
}

function GainCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="atlas-card h-full px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>
      <p className="mt-5 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">
        {item.title}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.desc}</p>
    </article>
  );
}

function AudienceCard({ audience }) {
  const Icon = audience.icon;

  return (
    <article className="atlas-card flex h-full flex-col px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>

      <p className="mt-5 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">
        {audience.title}
      </p>
      <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{audience.desc}</p>

      <div className="mt-5 space-y-2">
        {audience.items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand))]" strokeWidth={2.4} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <Button asChild variant="ghost" className="mt-6 justify-start px-0 text-[13px] text-[hsl(var(--fg))]">
        <Link to={`/use-case/${audience.key}`}>
          Ver cenário
          <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
        </Link>
      </Button>
    </article>
  );
}

function SystemCard({ item }) {
  return (
    <article className="atlas-public-panel-muted p-4">
      <div className="flex items-start gap-2">
        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2.2} />
        <p className="text-[12px] text-[hsl(var(--fg-3))] line-through">{item.before}</p>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand))]" strokeWidth={2.4} />
        <p className="text-[13px] font-medium leading-6 text-[hsl(var(--fg))]">{item.after}</p>
      </div>
    </article>
  );
}

function PricingPreviewCard({ plan, popular, onSelect, periodLabel }) {
  return (
    <article
      className={`relative flex h-full flex-col rounded-[28px] border px-5 py-5 lg:px-6 lg:py-6 ${
        popular
          ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]'
          : 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.84)] shadow-[var(--shadow-xs)]'
      }`}
    >
      {popular ? (
        <span className="atlas-public-pill absolute right-5 top-5 border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          Most chosen
        </span>
      ) : null}

      <div className="max-w-[80%]">
        <p className="atlas-metric-label">{plan.name}</p>
        <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{plan.pitch}</p>
      </div>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-[2.2rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
          {plan.price}
        </span>
        {!plan.isFree ? (
          <span className="pb-1 text-[13px] text-[hsl(var(--fg-2))]">{periodLabel}</span>
        ) : null}
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.1} />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => onSelect(plan.id)}
        variant={popular ? 'default' : 'outline'}
        className="mt-6 h-11"
      >
        {plan.cta}
      </Button>
    </article>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="atlas-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left lg:px-6"
      >
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {item.q}
        </span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-[hsl(var(--fg-3))] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          strokeWidth={1.9}
        />
      </button>
      {open ? (
        <div className="border-t border-[hsl(var(--border)/0.82)] px-5 py-4 lg:px-6">
          <p className="text-[14px] leading-7 text-[hsl(var(--fg-2))]">{item.a}</p>
        </div>
      ) : null}
    </div>
  );
}

const getContent = (t) => ({
  chaos: [
    { icon: Dumbbell, label: t('landing.problem.items.workout'), where: t('landing.problem.items.workoutWhere') },
    { icon: UtensilsCrossed, label: t('landing.problem.items.diet'), where: t('landing.problem.items.dietWhere') },
    { icon: FlaskConical, label: t('landing.problem.items.labs'), where: t('landing.problem.items.labsWhere') },
    { icon: BarChart3, label: t('landing.problem.items.measurements'), where: t('landing.problem.items.measurementsWhere') },
    { icon: Package, label: t('landing.problem.items.protocols'), where: t('landing.problem.items.protocolsWhere') },
    { icon: Brain, label: t('landing.problem.items.history'), where: t('landing.problem.items.historyWhere') },
  ],
  gains: [
    { icon: CheckCircle, key: 'dashboard' },
    { icon: BarChart3, key: 'data' },
    { icon: Zap, key: 'score' },
    { icon: TrendingUp, key: 'trends' },
    { icon: Brain, key: 'ai' },
    { icon: Users, key: 'team' },
  ].map((gain) => ({
    icon: gain.icon,
    title: t(`landing.solution.gains.${gain.key}.title`),
    desc: t(`landing.solution.gains.${gain.key}.desc`),
  })),
  audiences: [
    { key: 'athlete', icon: User },
    { key: 'coach', icon: Users },
    { key: 'nutritionist', icon: Users },
    { key: 'clinician', icon: Stethoscope },
  ].map((item) => ({
    key: item.key,
    icon: item.icon,
    title: t(`landing.forWho.${item.key}.title`),
    desc: t(`landing.forWho.${item.key}.desc`),
    items: t(`landing.forWho.${item.key}.features`),
  })),
  system: t('landing.system.items'),
  faq: t('landing.faq.items'),
});

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const { t } = useTranslation();

  const content = getContent(t);
  const plans = t('landing.pricing.plans');

  return (
    <PublicSiteShell
      navLinks={[
        { href: '#solution', label: t('landing.nav.howItWorks') },
        { href: '#pricing', label: t('landing.nav.pricing') },
        { href: '#faq', label: t('landing.nav.faq') },
      ]}
      actions={(
        <>
          <PublicLanguageSwitcher />
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={handleLogin}>
            {t('landing.nav.login')}
          </Button>
          <Button onClick={handleSignUp}>{t('landing.nav.signup')}</Button>
        </>
      )}
    >
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid gap-8 lg:grid-cols-[minmax(0,1.04fr)_460px] lg:items-center"
        >
          <div className="space-y-8">
            <motion.div variants={fade} className="space-y-5">
              <span className="atlas-public-pill">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
                {t('landing.hero.badge')}
              </span>

              <div className="space-y-5">
                <h1 className="atlas-display-title max-w-[11ch] whitespace-pre-line text-[clamp(3.1rem,2rem+3vw,5.3rem)]">
                  {t('landing.hero.title')}
                </h1>
                <p className="atlas-public-copy max-w-xl text-[1rem] lg:text-[1.05rem]">
                  {t('landing.hero.subtitle')}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fade} className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleSignUp}>
                {t('landing.hero.cta')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#pricing">{t('landing.nav.pricing')}</a>
              </Button>
            </motion.div>

            <motion.div variants={fade} className="flex flex-wrap gap-3">
              {[t('landing.hero.benefit1'), t('landing.hero.benefit2'), t('landing.hero.benefit3')].map((benefit) => (
                <span key={benefit} className="atlas-public-pill">
                  <Check className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2.6} />
                  {benefit}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fade} className="grid gap-3 sm:grid-cols-3">
              <div className="atlas-public-panel-muted p-4">
                <p className="atlas-metric-label">One timeline</p>
                <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  Training, nutrition, labs and protocols in one quiet view.
                </p>
              </div>
              <div className="atlas-public-panel-muted p-4">
                <p className="atlas-metric-label">Real adherence</p>
                <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  The gap between plan and execution becomes visible every day.
                </p>
              </div>
              <div className="atlas-public-panel-muted p-4">
                <p className="atlas-metric-label">Shared context</p>
                <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  You and your professionals can work from the same system.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div variants={fade}>
            <TodayPreview t={t} />
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
            <PublicSectionHeader
              eyebrow={t('landing.problem.label')}
              title={t('landing.problem.title')}
              description={t('landing.problem.subtitle')}
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {content.chaos.map((item, index) => (
                <motion.div
                  key={`${item.label}-${index}`}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={fade}
                  custom={index}
                >
                  <ProblemCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <div className="space-y-5">
            <PublicSectionHeader
              eyebrow={t('landing.solution.label')}
              title={t('landing.solution.title')}
              description={t('landing.solution.subtitle')}
            />
            <Button asChild variant="outline">
              <Link to={ROUTES.help}>Explore guides</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {content.gains.map((item, index) => (
              <motion.div
                key={`${item.title}-${index}`}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fade}
                custom={index}
              >
                <GainCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <PublicSectionHeader
            eyebrow={t('landing.forWho.label')}
            title={t('landing.forWho.title')}
            description={t('landing.forWho.subtitle')}
            align="center"
            className="mb-10"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.audiences.map((audience, index) => (
              <motion.div
                key={audience.key}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fade}
                custom={index}
              >
                <AudienceCard audience={audience} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <PublicSectionHeader
          eyebrow="System"
          title={t('landing.system.title')}
          description="A mesma clareza do produto logado, só que aplicada desde o primeiro contato."
          align="center"
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {content.system.map((item, index) => (
            <motion.div
              key={`${item.before}-${index}`}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fade}
              custom={index}
            >
              <SystemCard item={item} />
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <PublicSectionHeader
            eyebrow={t('landing.pricing.label')}
            title={t('landing.pricing.title')}
            description={t('landing.pricing.subtitle')}
            align="center"
            className="mb-10"
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingPreviewCard
                key={plan.id}
                plan={plan}
                popular={plan.popular}
                onSelect={handlePlanClick}
                periodLabel={t('landing.pricing.period')}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to={ROUTES.pricing}>Ver comparação completa</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-20">
        <PublicSectionHeader
          eyebrow={t('landing.faq.label')}
          title={t('landing.faq.title')}
          align="center"
          className="mb-10"
        />

        <div className="space-y-3">
          {content.faq.map((item, index) => (
            <FaqItem
              key={`${item.q}-${index}`}
              item={item}
              open={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <div className="atlas-page-header px-6 py-8 text-center lg:px-8 lg:py-10">
          <p className="atlas-overline justify-center">Start Calm</p>
          <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(2.4rem,1.9rem+1.8vw,4rem)]">
            {t('landing.cta.title')}
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-2xl">
            {t('landing.cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={handleSignUp}>
              {t('landing.hero.cta')}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>{t('landing.nav.pricing')}</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-[hsl(var(--fg-3))]">{t('landing.cta.noCard')}</p>
        </div>
      </section>
    </PublicSiteShell>
  );
}
