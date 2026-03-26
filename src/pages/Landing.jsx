import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle,
  Layers,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useTranslation } from '@/hooks/useTranslation';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import RegionSelector from '@/components/pricing/RegionSelector';
import { getRegionPricing } from '@/lib/regionalPricing';
import { COPY, HOME_MOCK_COPY } from '@/config/landingCopy';

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

/* ─────────────────────────────────────────
   AUTH ACTIONS
───────────────────────────────────────── */
const handleSignUp = () => { window.location.href = `${ROUTES.auth}?mode=signup`; };
const handleLogin  = () => { window.location.href = `${ROUTES.auth}?mode=login`; };
const handlePlan   = (id) => {
  if (!id || id === 'free') { handleSignUp(); return; }
  if (window.self !== window.top) { alert('Checkout only works in the published app.'); return; }
  sessionStorage.setItem('pending_plan', id);
  window.location.href = `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.pricing)}`;
};

/* ─────────────────────────────────────────
   PLAN META (for full pricing section)
───────────────────────────────────────── */
const ATHLETE_PLAN_META = [
  { id: 'free',                key: 'free',        icon: Activity },
  { id: 'athlete_pro',         key: 'pro',         icon: Zap, popular: true },
  { id: 'athlete_performance', key: 'performance', icon: Star },
];

const PROFESSIONAL_PLAN_META = [
  { id: 'coach',        key: 'coach',        icon: Users },
  { id: 'nutritionist', key: 'nutritionist', icon: Users },
  { id: 'clinician',    key: 'clinician',    icon: Stethoscope },
];

function formatPlanPrice(planId, translatedPrice, pricing, locale, billing = 'monthly') {
  if (planId === 'free') return translatedPrice;
  const prices = billing === 'yearly' ? pricing.prices_yearly : pricing.prices;
  const amount = prices?.[planId];
  if (typeof amount !== 'number') return translatedPrice;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: pricing.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calcYearlySavings(planId, pricing) {
  const monthly = pricing.prices?.[planId];
  const yearly  = pricing.prices_yearly?.[planId];
  if (!monthly || !yearly) return null;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

function FeaturePoint({ t, d }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]">
        <Check className="h-3 w-3" strokeWidth={2.6} />
      </div>
      <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
        <strong className="font-semibold text-[hsl(var(--fg))]">{t}</strong>{d}
      </p>
    </div>
  );
}

function MockCard({ children }) {
  return (
    <div className="rounded-[14px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.6)] p-3.5">
      {children}
    </div>
  );
}

function BarRow({ label, pct, val, accent = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-16 shrink-0 text-[11px] text-[hsl(var(--fg-3))]">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: accent ? 'hsl(0 67% 52%)' : 'hsl(var(--brand))' }}
        />
      </div>
      <span className="w-9 text-right text-[11px] text-[hsl(var(--fg-2))]">{val}</span>
    </div>
  );
}

function WorkoutMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <MockCard>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{copy.exerciseName}</p>
        <p className="mt-1 text-[2rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{copy.weight}</p>
        <p className="mt-0.5 text-[11px] text-[hsl(var(--brand))]">{copy.progress}</p>
      </MockCard>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {copy.tags.map((tag) => (
          <span key={tag} className="atlas-public-pill border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.06)] text-[hsl(var(--brand))]">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function NutritionMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <MockCard>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{copy.metricLabel}</p>
        <p className="mt-1 text-[2rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">{copy.metricValue}</p>
        <p className="mt-0.5 text-[11px] text-[hsl(var(--fg-2))]">{copy.metricMeta}</p>
      </MockCard>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} />
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{copy.summaryLabel}</p>
        <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">{copy.summaryText}</p>
      </MockCard>
    </div>
  );
}

function ProgressMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="grid grid-cols-2 gap-2">
        {copy.cards.map((card) => (
          <MockCard key={card.label}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">{card.label}</p>
            <p className="mt-1 text-[1.8rem] font-bold tracking-[-0.05em] text-[hsl(var(--fg))]">{card.value}</p>
            <p className="mt-0.5 text-[11px] text-[hsl(var(--brand))]">{card.trend}</p>
          </MockCard>
        ))}
      </div>
      <div className="space-y-2">
        {copy.bars.map((bar) => (
          <BarRow key={bar.label} label={bar.label} pct={bar.pct} val={bar.val} accent={bar.accent} />
        ))}
      </div>
    </div>
  );
}

function PhotosMock({ copy }) {
  const before = { date: '01 Jan', url: '/demo-progress-photos/progress_casual_1.jpg', label: 'Before' };
  const after  = { date: '19 Mar', url: '/demo-progress-photos/progress_photo_2_during.jpg', label: 'After' };
  return (
    <div className="atlas-public-panel space-y-4 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="grid grid-cols-2 gap-3">
        {[before, after].map(({ date, url, label }) => (
          <div key={date} className="relative overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.7)]" style={{ aspectRatio: '3/4' }}>
            <img src={url} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-white/60">{label}</span>
              <span className="block text-[13px] font-semibold text-white">{date}</span>
            </div>
          </div>
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] font-semibold text-[hsl(var(--brand))]">{copy.summaryTitle}</p>
        <p className="mt-1 text-[13px] text-[hsl(var(--fg))]">{copy.summaryText}</p>
      </MockCard>
    </div>
  );
}

function SupplementsMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="space-y-2">
        {copy.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-[12px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{item.icon}</span>
              <div>
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.name}</p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.dose}</p>
              </div>
            </div>
            <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${item.done ? 'border border-[hsl(var(--tint)/0.22)] bg-[hsl(var(--tint)/0.08)] text-[hsl(var(--brand))]' : 'border border-[hsl(var(--border))] bg-transparent'}`}>
              {item.done ? <Check className="h-3 w-3" strokeWidth={2.6} /> : null}
            </div>
          </div>
        ))}
      </div>
      <MockCard>
        <p className="text-[11px] text-[hsl(var(--fg-3))]">{copy.summaryLabel}</p>
        <p className="mt-0.5 text-[1.2rem] font-bold tracking-[-0.04em] text-[hsl(var(--brand))]">{copy.summaryValue} <span className="text-[11px] font-normal text-[hsl(var(--fg-3))]">{copy.summarySuffix}</span></p>
      </MockCard>
    </div>
  );
}

function TimelineMock({ copy }) {
  return (
    <div className="atlas-public-panel space-y-3 px-5 py-5">
      <p className="atlas-overline">{copy.overline}</p>
      <div className="space-y-0">
        {copy.items.map((item, i) => (
          <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < copy.items.length - 1 && (
              <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[hsl(var(--border)/0.7)]" />
            )}
            <div className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${item.active ? 'border-[hsl(var(--brand))] bg-[hsl(var(--card))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--fill))]'}`} />
            <div>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.date}</p>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{item.label}</p>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURE_BLOCKS = [
  { key: 'workouts', mockKey: 'workout', Mock: WorkoutMock, reverse: false },
  { key: 'nutrition', mockKey: 'nutrition', Mock: NutritionMock, reverse: true },
  { key: 'progress', mockKey: 'progress', Mock: ProgressMock, reverse: false },
  { key: 'photos', mockKey: 'photos', Mock: PhotosMock, reverse: true },
  { key: 'supplements', mockKey: 'supplements', Mock: SupplementsMock, reverse: false },
  { key: 'timeline', mockKey: 'timeline', Mock: TimelineMock, reverse: true },
];

/* ─────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────── */
function PricingCard({ plan, popularLabel }) {
  const Icon = plan.icon;
  const isFree = plan.id === 'free';

  return (
    <article
      className={`relative flex h-full flex-col rounded-[30px] border px-5 py-5 lg:px-6 lg:py-6 ${
        plan.popular
          ? 'border-[hsl(var(--brand)/0.32)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]'
          : 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.86)] shadow-[var(--shadow-xs)]'
      }`}
    >
      {plan.popular ? (
        <span className="atlas-public-pill absolute right-5 top-5 border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          {popularLabel}
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 pt-1">
          <p className="atlas-metric-label">{plan.name}</p>
          <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {plan.pitch}
          </p>
          {plan.note ? (
            <p className="mt-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{plan.note}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span className="text-[2.35rem] font-semibold tracking-[-0.065em] text-[hsl(var(--fg))]">
            {plan.price}
          </span>
          {!isFree ? (
            <span className="pb-1 text-[13px] text-[hsl(var(--fg-2))]">{plan.period}</span>
          ) : null}
        </div>
        {plan.savings ? (
          <p className="mt-2 text-[12px] font-semibold text-[hsl(var(--ok))]">
            Save {plan.savings}%
          </p>
        ) : plan.trial ? (
          <p className="mt-2 text-[12px] font-semibold text-[hsl(var(--ok))]">{plan.trial}</p>
        ) : null}
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        {plan.features?.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.4} />
            <span>{feature}</span>
          </div>
        ))}
        {plan.missing?.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-3))]">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2.1} />
            <span className="line-through">{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={() => handlePlan(plan.id)}
        variant={plan.popular ? 'default' : 'outline'}
        className="mt-6 h-11 w-full"
      >
        {plan.cta}
      </Button>
    </article>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function Landing() {
  const { t, language: locale, getTranslation } = useTranslation();
  const c = COPY[locale === 'pt-BR' ? 'pt-BR' : 'en-US'];
  const homeMocks = HOME_MOCK_COPY[locale] || HOME_MOCK_COPY['en-US'];

  const [billing, setBilling] = useState('monthly');
  const [region, setRegion] = useState('US');
  const pricing = getRegionPricing(region);

  const athletePlans = useMemo(() => {
    const translations = getTranslation('pricing_page.plans');
    if (!translations) return [];
    return ATHLETE_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
      if (!translated) {
        return {
          ...meta,
          name: meta.key,
          pitch: '',
          features: [],
          missing: [],
          cta: 'Subscribe',
          trial: null,
          period: '/month',
          savings: null,
          price: '$0',
        };
      }
      const savings = billing === 'yearly' ? calcYearlySavings(meta.id, pricing) : null;
      return {
        ...meta,
        name: translated.name,
        pitch: translated.pitch,
        features: translated.features,
        missing: translated.missing || [],
        cta: translated.cta,
        trial: billing === 'monthly' ? translated.trial : null,
        period: billing === 'yearly' ? '/year' : translated.period,
        savings,
        price: formatPlanPrice(meta.id, translated.price, pricing, locale, billing),
      };
    });
  }, [locale, pricing, billing, getTranslation]);

  const professionalPlans = useMemo(() => {
    const translations = getTranslation('pricing_page.plans');
    if (!translations) return [];
    return PROFESSIONAL_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
      if (!translated) {
        return {
          ...meta,
          name: meta.key,
          pitch: '',
          note: '',
          features: [],
          cta: 'Subscribe',
          trial: null,
          period: '/month',
          savings: null,
          price: '$0',
        };
      }
      const savings = billing === 'yearly' ? calcYearlySavings(meta.id, pricing) : null;
      return {
        ...meta,
        name: translated.name,
        pitch: translated.pitch,
        note: translated.note,
        features: translated.features,
        cta: translated.cta,
        trial: billing === 'monthly' ? translated.trial : null,
        period: billing === 'yearly' ? '/year' : translated.period,
        savings,
        price: formatPlanPrice(meta.id, translated.price, pricing, locale, billing),
      };
    });
  }, [locale, pricing, billing, getTranslation]);

  return (
    <PublicSiteShell
      navLinks={[
        { href: '#solution', label: c.nav.howItWorks },
        { href: '#features', label: c.nav.features },
        { href: ROUTES.blog, label: c.nav.blog },
        { href: '#pricing', label: c.nav.pricing },
      ]}
      actions={(
        <>
          <Button size="sm" onClick={handleLogin}>{c.nav.login}</Button>
        </>
      )}
    >
      <PublicMetadata
        title="atlas.core"
        description="atlas.core is the public performance operating system for workouts, nutrition, measurements, supplements, and connected progress."
        canonicalPath={ROUTES.home}
      />

      {/* ══ HERO ══════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <motion.div
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          className="space-y-10"
        >
          {/* Badge */}
          <motion.div variants={fade} custom={0} className="flex items-center gap-2.5">
            <span className="atlas-public-pill border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.06)] text-[hsl(var(--brand))]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--brand))]" />
              {c.hero.badge}
            </span>
          </motion.div>

          {/* Headline + sub + CTAs */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div className="space-y-8">
              <motion.div variants={fade} custom={1} className="space-y-2">
                <h1 className="atlas-display-title text-[clamp(2.8rem,2rem+2.8vw,5rem)] leading-[1.08]">
                  {c.hero.h1a}
                </h1>
                <h1 className="atlas-display-title text-[clamp(2.8rem,2rem+2.8vw,5rem)] leading-[1.08]">
                  {c.hero.h1b}
                </h1>
              </motion.div>

              <motion.p variants={fade} custom={2} className="atlas-public-copy max-w-lg text-[1.05rem]">
                {c.hero.sub}
              </motion.p>

              <motion.div variants={fade} custom={3} className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handleSignUp} className="gap-2">
                  {c.hero.cta1}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#features">{c.hero.cta2}</a>
                </Button>
              </motion.div>

              <motion.div variants={fade} custom={4} className="grid grid-cols-3 gap-3">
                {[
                  [c.hero.s1t, c.hero.s1d],
                  [c.hero.s2t, c.hero.s2d],
                  [c.hero.s3t, c.hero.s3d],
                ].map(([strong, sub]) => (
                  <div key={strong} className="atlas-public-panel-muted p-4">
                    <p className="text-[15px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{strong}</p>
                    <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{sub}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div variants={fade} custom={2}>
              <WorkoutMock copy={homeMocks.workout} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══ PROBLEM ══════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-8 max-w-2xl">
            <p className="atlas-overline">{c.problem.label}</p>
            <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
              {c.problem.h2}
            </h2>
            <p className="atlas-public-copy mt-3">{c.problem.sub}</p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {c.problem.items.map((item, i) => (
              <motion.div key={item.t} {...fadeIn(i * 0.06)}>
                <div className="atlas-public-panel-muted flex items-start gap-3 p-4">
                  <span className="text-xl">{item.e}</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{item.t}</p>
                    <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{item.d}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn(0.2)} className="mt-8 max-w-2xl border-l-[3px] border-[hsl(var(--brand))] pl-5">
            <p className="text-[1.05rem] font-semibold leading-7 text-[hsl(var(--fg))]">{c.problem.quote}</p>
            <p className="mt-3 text-[14px] text-[hsl(var(--fg-2))]">{c.problem.quoteDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* ══ SOLUTION ══════════════════════════════ */}
      <section id="solution" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10 text-center">
          <p className="atlas-overline justify-center">{c.solution.label}</p>
          <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">
            {c.solution.h2a}<br />
            <span className="text-[hsl(var(--brand))]">{c.solution.h2b}</span>
          </h2>
          <p className="atlas-public-copy mx-auto mt-4 max-w-xl">{c.solution.sub}</p>
        </motion.div>

        <div className="grid gap-px overflow-hidden rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--border)/0.7)] md:grid-cols-3">
          {[
            { t: c.solution.p1t, d: c.solution.p1d, icon: Layers },
            { t: c.solution.p2t, d: c.solution.p2d, icon: TrendingUp },
            { t: c.solution.p3t, d: c.solution.p3d, icon: Zap },
          ].map(({ t, d, icon: Icon }, i) => (
            <motion.div key={t} {...fadeIn(i * 0.08)}>
              <div className="h-full bg-[hsl(var(--card))] px-6 py-7 transition-colors hover:bg-[hsl(var(--fill)/0.5)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[18px] border border-[hsl(var(--tint)/0.18)] bg-[hsl(var(--tint)/0.07)] text-[hsl(var(--brand))]">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <p className="text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{t}</p>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════ */}
      <div id="features">
        {FEATURE_BLOCKS.map(({ key, mockKey, Mock, reverse }) => {
          const f = c.features[key];
          return (
            <section
              key={key}
              className="border-t border-[hsl(var(--border)/0.6)] mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20"
            >
              <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:direction-rtl' : ''}`}>
                {/* Text side */}
                <motion.div
                  {...fadeIn(0)}
                  className={`space-y-6 ${reverse ? 'lg:order-2' : ''}`}
                >
                  <p className="atlas-overline">{f.label}</p>
                  <h2 className="atlas-display-title whitespace-pre-line text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
                    {f.h2}
                  </h2>
                  <p className="atlas-public-copy">{f.desc}</p>
                  <div className="space-y-3.5">
                    {f.pts.map((pt) => <FeaturePoint key={pt.t} t={pt.t} d={pt.d} />)}
                  </div>
                </motion.div>

                {/* Visual side */}
                <motion.div
                  {...fadeIn(0.15)}
                  className={reverse ? 'lg:order-1' : ''}
                >
                  <Mock copy={homeMocks[mockKey]} />
                </motion.div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ══ DIFFERENTIATION ═══════════════════════ */}
      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-8 lg:px-8 lg:py-10">
          <motion.div {...fadeIn(0)} className="mb-10 text-center">
            <p className="atlas-overline justify-center">{c.diff.label}</p>
            <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">{c.diff.h2}</h2>
            <p className="atlas-public-copy mx-auto mt-3 max-w-xl">{c.diff.sub}</p>
          </motion.div>

          {/* Comparison table */}
          <motion.div {...fadeIn(0.1)} className="mb-10 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-[13px]">
              <thead>
                <tr>
                  {c.diff.cols.map((col, i) => (
                    <th
                      key={col}
                      className={`border-b border-[hsl(var(--border)/0.7)] px-4 py-3 text-left font-semibold tracking-wider text-[11px] uppercase ${
                        i === 4 ? 'text-[hsl(var(--brand))] bg-[hsl(var(--tint)/0.04)]' : 'text-[hsl(var(--fg-3))]'
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.diff.rows.map((row) => (
                  <tr
                    key={row[0]}
                    className="border-b border-[hsl(var(--border)/0.5)] transition-colors hover:bg-[hsl(var(--fill)/0.4)]"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-4 py-3.5 ${
                          ci === 0 ? 'text-[hsl(var(--fg-2))]' :
                          ci === 4 ? 'font-semibold text-[hsl(var(--brand))] bg-[hsl(var(--tint)/0.03)]' :
                          cell === '—' ? 'text-[hsl(var(--fg-3))] opacity-40' : 'text-[hsl(var(--fg-2))]'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Differentiator cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {c.diff.cards.map((card, i) => (
              <motion.div key={card.t} {...fadeIn(i * 0.07)}>
                <div className="atlas-card h-full px-5 py-5">
                  <span className="text-xl">{card.e}</span>
                  <p className="mt-4 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{card.t}</p>
                  <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{card.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════ */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        {/* Header */}
        <motion.div {...fadeIn(0)} className="mb-8">
          <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <div>
                <p className="atlas-overline">{c.pricing.label}</p>
                <h2 className="atlas-display-title mt-4 text-[clamp(1.9rem,1.3rem+1.2vw,2.8rem)]">{c.pricing.h2}</h2>
                <p className="atlas-public-copy mt-3 max-w-md">{c.pricing.sub}</p>
              </div>

              {/* Billing toggle + region */}
              <div className="space-y-3">
                <RegionSelector onRegionChange={setRegion} />
                <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] p-1">
                  <button
                    type="button"
                    onClick={() => setBilling('monthly')}
                    className={`flex-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                      billing === 'monthly'
                        ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                        : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
                    }`}
                  >
                    {locale === 'pt-BR' ? 'Mensal' : 'Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBilling('yearly')}
                    className={`flex-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                      billing === 'yearly'
                        ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                        : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
                    }`}
                  >
                    {locale === 'pt-BR' ? 'Anual' : 'Yearly'}
                    {billing !== 'yearly' && (
                      <span className="ml-1.5 rounded-full bg-[hsl(var(--ok)/0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ok))]">
                        {locale === 'pt-BR' ? 'até 31%' : 'up to 31%'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Athlete plans */}
        <motion.div {...fadeIn(0.08)} className="atlas-public-panel mb-6 px-6 py-6 lg:px-8 lg:py-8">
          <p className="atlas-overline mb-6">{locale === 'pt-BR' ? 'Atleta' : 'Athlete'}</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {athletePlans.map((plan, index) => (
              <motion.div key={plan.id} {...fadeIn(index * 0.06)}>
                <PricingCard plan={plan} popularLabel={locale === 'pt-BR' ? 'Mais escolhido' : 'Most chosen'} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Professional plans */}
        <motion.div {...fadeIn(0.12)} className="mb-6">
          <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
            <div className="pt-2">
              <p className="atlas-overline">{locale === 'pt-BR' ? 'Profissional' : 'Professional'}</p>
              <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                {locale === 'pt-BR' ? 'Planos para treinadores, nutricionistas e clínicos.' : 'Plans for coaches, nutritionists, and clinicians.'}
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {professionalPlans.map((plan, index) => (
                <motion.div key={plan.id} {...fadeIn(index * 0.06)}>
                  <PricingCard plan={plan} popularLabel={locale === 'pt-BR' ? 'Mais escolhido' : 'Most chosen'} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Founder box */}
        <motion.div {...fadeIn(0.15)}>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[hsl(var(--tint)/0.16)] bg-[hsl(var(--tint)/0.03)] px-6 py-5">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{c.pricing.founder.h3}</p>
              <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">{c.pricing.founder.desc}</p>
            </div>
            <Button onClick={handleSignUp} variant="default" size="sm">{c.pricing.founder.cta}</Button>
          </div>
        </motion.div>
      </section>

      {/* ══ PROFESSIONALS ══════════════════════════ */}
      <section className="mx-auto max-w-6xl border-t border-[hsl(var(--border)/0.6)] px-5 py-14 lg:px-8 lg:py-16">
        <motion.div {...fadeIn(0)} className="mb-8 text-center">
          <p className="atlas-overline justify-center">{c.pros.label}</p>
          <h2 className="atlas-display-title mt-4 whitespace-pre-line text-[clamp(1.7rem,1.1rem+1.1vw,2.5rem)]">
            {c.pros.h2}
          </h2>
          <p className="atlas-public-copy mx-auto mt-3 max-w-xl">{c.pros.sub}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {c.pros.cards.map((card, i) => (
            <motion.div key={card.t} {...fadeIn(i * 0.08)}>
              <div className="atlas-card h-full px-6 py-6">
                <span className="text-2xl">{card.e}</span>
                <p className="mt-4 text-[15px] font-semibold tracking-[-0.022em] text-[hsl(var(--fg))]">{card.t}</p>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{card.d}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeIn(0.15)} className="mt-6 text-center text-[13px] text-[hsl(var(--fg-3))]">
          {c.pros.note}
        </motion.p>
      </section>

      {/* ══ CLOSING CTA ═══════════════════════════ */}
      <section className="mx-auto max-w-4xl px-5 pb-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="atlas-page-header atlas-cta-glow px-6 py-10 text-center lg:px-10 lg:py-14">
          <h2 className="atlas-display-title whitespace-pre-line text-[clamp(2.2rem,1.6rem+1.6vw,3.8rem)] leading-[1.1]">
            {c.closing.h2a}
            <br />
            <span className="text-[hsl(var(--brand))]">{c.closing.h2b}</span>
          </h2>
          <p className="atlas-public-copy mx-auto mt-5 max-w-xl text-[1.05rem]">{c.closing.sub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={handleSignUp} className="gap-2">
              {c.closing.cta1}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={ROUTES.pricing}>{c.closing.cta2}</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-[hsl(var(--fg-3))]">{c.closing.fine}</p>
        </motion.div>
      </section>

    </PublicSiteShell>
  );
}
