import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useI18n } from '@/lib/i18nContext';
import { base44 } from '@/api/base44Client';
import RegionSelector from '@/components/pricing/RegionSelector';
import PublicSiteShell, {
  PublicSectionHeader,
} from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { getRegionPricing } from '@/lib/regionalPricing';
import { ROUTES } from '@/lib/routes';

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.52,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const ATHLETE_PLAN_META = [
  { id: 'free', key: 'free', icon: Activity },
  { id: 'athlete_pro', key: 'pro', icon: Zap, popular: true },
  { id: 'athlete_performance', key: 'performance', icon: Star },
];

const PROFESSIONAL_PLAN_META = [
  { id: 'coach', key: 'coach', icon: Users },
  { id: 'nutritionist', key: 'nutritionist', icon: Users },
  { id: 'clinician', key: 'clinician', icon: Stethoscope },
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

/** Returns integer savings % for yearly vs monthly, or null if unavailable. */
function calcYearlySavings(planId, pricing) {
  const monthly = pricing.prices?.[planId];
  const yearly  = pricing.prices_yearly?.[planId];
  if (!monthly || !yearly) return null;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

function PricingCard({
  plan,
  loading,
  currentPlanId,
  isAuthenticated,
  onSubscribe,
  labels,
}) {
  const Icon = plan.icon;
  const isFree = plan.id === 'free';
  const isCurrentPlan = currentPlanId === plan.id || (isFree && !currentPlanId);

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
          {labels.popular}
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
            {labels.savePrefix}{plan.savings}%
          </p>
        ) : plan.trial ? (
          <p className="mt-2 text-[12px] font-semibold text-[hsl(var(--ok))]">{plan.trial}</p>
        ) : null}
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
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
        onClick={() => onSubscribe(plan.id)}
        disabled={loading === plan.id || (isFree && isCurrentPlan)}
        variant={plan.popular && !isCurrentPlan ? 'default' : 'outline'}
        className={`mt-6 h-11 w-full ${
          isCurrentPlan ? 'border-[hsl(var(--ok)/0.34)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]' : ''
        }`}
      >
        {loading === plan.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrentPlan ? (
          labels.current
        ) : isFree ? (
          isAuthenticated ? labels.freeCurrent : labels.freeSignup
        ) : (
          plan.cta
        )}
      </Button>
    </article>
  );
}

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [region, setRegion] = useState('US');
  const [billing, setBilling] = useState('monthly');
  const { user, isAuthenticated } = useAuth();
  const { subscription } = useSubscription();
  const { t, locale } = useI18n();

  const pricing = getRegionPricing(region);

  const ui = useMemo(
    () => ({
      login: 'Login',
      signup: 'Create account',
      compareTitle: 'Plans designed for the same premium product',
      compareCopy:
        'Start free, then expand into richer insights and professional collaboration when you need it.',
      trustA: '7-day free trial',
      trustB: 'Change plans anytime',
      trustC: 'Secure Stripe checkout',
      popular: 'Most chosen',
      current: 'Current plan',
      freeCurrent: 'Free plan',
      freeSignup: 'Create free account',
      billingMonthly: 'Monthly',
      billingYearly: 'Yearly',
      savePrefix: 'Save ',
      athleteLabel: t('pricing_page.athlete'),
      professionalLabel: t('pricing_page.professional'),
      footerTitle: 'One visual system from first click to daily use',
      footerCopy:
        'Pricing should feel like part of atlas.core itself, not a detached marketing layer.',
    }),
    [t]
  );

  const currentPlanId = (() => {
    if (!isAuthenticated || !subscription) return null;
    const status = subscription.status;
    if (!['active', 'trialing'].includes(status)) return null;
    const code = subscription.plan_code;
    const map = {
      pro: 'athlete_pro',
      performance: 'athlete_performance',
      free: 'free',
      coach: 'coach',
      nutritionist: 'nutritionist',
      clinician: 'clinician',
    };
    return map[code] || 'free';
  })();

  const athletePlans = useMemo(() => {
    const translations = t('pricing_page.plans');
    return ATHLETE_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
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
  }, [locale, pricing, billing, t]);

  const professionalPlans = useMemo(() => {
    const translations = t('pricing_page.plans');
    return PROFESSIONAL_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
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
  }, [locale, pricing, billing, t]);

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      window.location.href = '/auth?mode=signup';
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem('pending_plan', planId);
      window.location.href = `/auth?mode=signup&next=/Pricing`;
      return;
    }

    setLoading(planId);
    try {
      // Use Stripe Checkout via Base44 Edge Function
      const res = await base44.functions.invoke('createCheckout', {
        plan: planId,
        success_url: `${window.location.origin}/Today?subscribed=1`,
        cancel_url: `${window.location.origin}/Pricing`,
        email: user?.email,
        region,
        billing,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.data?.error || 'Error starting checkout. Please try again.');
      }
    } catch (error) {
      toast.error('Could not connect to the payment server.');
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    const pendingPlan = sessionStorage.getItem('pending_plan');
    if (pendingPlan && isAuthenticated) {
      sessionStorage.removeItem('pending_plan');
      handleSubscribe(pendingPlan);
    }
  }, [isAuthenticated]);

  return (
    <PublicSiteShell
      navLinks={[
        { href: ROUTES.blog, label: 'Blog' },
        { href: '#plans', label: t('landing.nav.pricing') },
      ]}
      actions={(
        <>
          {isAuthenticated ? (
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to={ROUTES.today}>{t('pricing_page.backToApp')}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to={`${ROUTES.auth}?mode=login`}>{ui.login}</Link>
              </Button>
              <Button asChild>
                <Link to={`${ROUTES.auth}?mode=signup`}>{ui.signup}</Link>
              </Button>
            </>
          )}
        </>
      )}
    >
      <PublicMetadata
        title="Pricing — atlas.core"
        description="Compare atlas.core plans and choose the right public entry point for training, nutrition, progress, and connected performance tracking."
        canonicalPath={ROUTES.pricing}
      />

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-12 lg:px-8 lg:pb-12 lg:pt-16">
        <div className="atlas-page-header px-6 py-6 lg:px-8 lg:py-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="atlas-public-pill">
                  <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
                  {t('pricing_page.title')}
                </span>
                <div className="space-y-4">
                  <h1 className="atlas-display-title text-[clamp(2.6rem,2rem+1.8vw,4.4rem)]">
                    {t('pricing_page.heading')}
                  </h1>
                  <p className="atlas-public-copy max-w-2xl">{t('pricing_page.subtitle')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="atlas-public-pill">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--ok))]" strokeWidth={1.9} />
                  {ui.trustA}
                </span>
                <span className="atlas-public-pill">{ui.trustB}</span>
                <span className="atlas-public-pill">{ui.trustC}</span>
              </div>
            </div>

            <div className="space-y-3">
              <RegionSelector onRegionChange={setRegion} />

              {/* Billing interval toggle */}
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
                  {ui.billingMonthly}
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
                  {ui.billingYearly}
                  {billing !== 'yearly' && (
                    <span className="ml-1.5 rounded-full bg-[hsl(var(--ok)/0.12)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ok))]">
                      up to 31%
                    </span>
                  )}
                </button>
              </div>

              <div className="atlas-public-panel-muted p-4">
                <p className="atlas-metric-label">{ui.compareTitle}</p>
                <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  {ui.compareCopy}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <PublicSectionHeader
            eyebrow="Athlete"
            title={ui.athleteLabel}
            description={t('pricing_page.subtitle')}
            className="mb-10"
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {athletePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fade}
                custom={index}
              >
                <PricingCard
                  plan={{ ...plan, popular: plan.popular }}
                  loading={loading}
                  currentPlanId={currentPlanId}
                  isAuthenticated={isAuthenticated}
                  onSubscribe={handleSubscribe}
                  labels={{
                    popular: ui.popular,
                    current: ui.current,
                    freeCurrent: ui.freeCurrent,
                    freeSignup: ui.freeSignup,
                    savePrefix: ui.savePrefix,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <PublicSectionHeader
            eyebrow="Professional"
            title={ui.professionalLabel}
            description={t('pricing_page.professionalDesc')}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {professionalPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fade}
                custom={index}
              >
                <PricingCard
                  plan={plan}
                  loading={loading}
                  currentPlanId={currentPlanId}
                  isAuthenticated={isAuthenticated}
                  onSubscribe={handleSubscribe}
                  labels={{
                    popular: ui.popular,
                    current: ui.current,
                    freeCurrent: ui.freeCurrent,
                    freeSignup: ui.freeSignup,
                    savePrefix: ui.savePrefix,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-6 lg:px-8">
        <div className="atlas-public-panel-muted px-6 py-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="atlas-metric-label">{ui.footerTitle}</p>
              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                {ui.footerCopy}
              </p>
              <p className="mt-4 text-[12px] text-[hsl(var(--fg-3))]">{t('pricing_page.footer')}</p>
              <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">{t('pricing_page.footerPayment')}</p>
            </div>

            {!isAuthenticated ? (
              <Button asChild size="lg">
                <Link to={`${ROUTES.auth}?mode=signup`}>
                  {ui.signup}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline">
                <Link to={ROUTES.today}>{t('pricing_page.backToApp')}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
