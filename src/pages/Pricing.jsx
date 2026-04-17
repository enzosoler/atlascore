import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  Star,
  X,
  Zap,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useI18n } from '@/lib/i18nContext';
import { supabase } from '@/lib/supabaseClient';
import { getCreatorStatus } from '@/lib/affiliate/applyCreatorCode';
import CreatorCodeModal from '@/components/affiliate/CreatorCodeModal';
import RegionSelector from '@/components/pricing/RegionSelector';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import PublicMetadata from '@/components/public/PublicMetadata';
import { Button } from '@/components/ui/button';
import { getRegionPricing, getYearlySavingsPercent } from '@/lib/regionalPricing';
import { ROUTES } from '@/lib/routes';
import { trackProductEvent } from '@/lib/productEvents';
import { trackCheckoutStarted, track } from '@/lib/analytics';

/* ─── Constants ───────────────────────────────────────────────────────────── */

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const ATHLETE_PLAN_META = [
  { id: 'free', key: 'free', icon: Activity },
  { id: 'athlete_pro', key: 'pro', icon: Zap, popular: true },
  { id: 'athlete_performance', key: 'performance', icon: Star },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

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
  const yearly = pricing.prices_yearly?.[planId];
  if (!monthly || !yearly) return null;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

/* ─── Plan card ───────────────────────────────────────────────────────────── */

function PlanCard({ plan, loading, currentPlanId, isAuthenticated, isNative, onSubscribe, labels }) {
  const Icon = plan.icon;
  const isFree = plan.id === 'free';
  const isCurrentPlan = currentPlanId === plan.id || (isFree && !currentPlanId);
  const isPro = plan.id === 'athlete_pro';

  return (
    <article
      className={`relative flex h-full flex-col rounded-[20px] p-6 transition-all ${
        isPro
          ? 'bg-[hsl(var(--card))] shadow-[var(--shadow-md)] ring-1 ring-[hsl(var(--brand)/0.2)]'
          : 'bg-[hsl(var(--fill)/0.4)] shadow-[var(--shadow-xs)]'
      }`}
    >
      {isPro && (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand))] px-2.5 py-0.5 text-[11px] font-semibold text-white">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          {labels.popular}
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${
          isPro
            ? 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
            : 'bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]'
        }`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
        </div>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{plan.name}</p>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{plan.pitch}</p>

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-[2rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
          {plan.price}
        </span>
        {!isFree && (
          <span className="text-[13px] text-[hsl(var(--fg-3))]">{plan.period}</span>
        )}
      </div>
      {plan.savings ? (
        <p className="mt-1.5 text-[12px] font-semibold text-[hsl(var(--ok))]">
          Save {plan.savings}%
        </p>
      ) : plan.trial ? (
        <p className="mt-1.5 text-[12px] font-semibold text-[hsl(var(--ok))]">{plan.trial}</p>
      ) : null}

      {/* Features */}
      <div className="mt-5 flex-1 space-y-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2 text-[13px] leading-5 text-[hsl(var(--fg))]">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.5} />
            <span>{f}</span>
          </div>
        ))}
        {plan.missing?.map((f) => (
          <div key={f} className="flex items-start gap-2 text-[12px] leading-5 text-[hsl(var(--fg-3))]">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-30" strokeWidth={2} />
            <span className="line-through decoration-[hsl(var(--fg-3)/0.3)]">{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={() => onSubscribe(plan.id)}
        disabled={loading === plan.id || (isFree && isCurrentPlan)}
        variant={isPro && !isCurrentPlan ? 'default' : 'outline'}
        className={`mt-6 h-11 w-full rounded-xl ${
          isCurrentPlan ? 'border-0 bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]' : ''
        } ${isPro && !isCurrentPlan ? 'bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)] border-0 shadow-[0_4px_14px_hsl(var(--brand)/0.2)]' : ''}`}
      >
        {loading === plan.id ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrentPlan ? (
          labels.current
        ) : isFree ? (
          isAuthenticated ? labels.freeCurrent : labels.freeSignup
        ) : isNative ? (
          labels.nativeCta
        ) : (
          plan.cta
        )}
      </Button>
    </article>
  );
}

/* ─── FAQ accordion ───────────────────────────────────────────────────────── */

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[hsl(var(--border)/0.6)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <p className="text-[14px] font-medium text-[hsl(var(--fg))]">{question}</p>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[hsl(var(--fg-3))] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="pb-4 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{answer}</p>
      )}
    </div>
  );
}

/* ─── Pricing page ────────────────────────────────────────────────────────── */

export default function Pricing() {
  const [loading, setLoading] = useState(null);
  const [region, setRegion] = useState('US');
  const [billing, setBilling] = useState('monthly');
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [creatorStatus, setCreatorStatus] = useState({ code: null, locked: false });
  const { user, isAuthenticated } = useAuth();
  const { subscription, isNative, showPaywall } = useSubscription();
  const { t, locale, getTranslation } = useI18n();

  const pricing = getRegionPricing(region);

  const maxYearlySavings = useMemo(() => {
    return ATHLETE_PLAN_META
      .filter((p) => p.id !== 'free')
      .map((p) => getYearlySavingsPercent(region, p.id))
      .filter((v) => typeof v === 'number')
      .reduce((max, v) => Math.max(max, v), 0);
  }, [region]);

  const currentPlanId = (() => {
    if (!isAuthenticated || !subscription) return null;
    if (!['active', 'trialing', 'granted', 'past_due'].includes(subscription.status)) return null;
    const map = { pro: 'athlete_pro', performance: 'athlete_performance', free: 'free', coach: 'coach', nutritionist: 'nutritionist', clinician: 'clinician' };
    return map[subscription.plan_code] || 'free';
  })();

  const athletePlans = useMemo(() => {
    const translations = getTranslation('pricing_page.plans');
    if (!translations) return [];
    return ATHLETE_PLAN_META.map((meta) => {
      const tr = translations[meta.key];
      if (!tr) return { ...meta, name: meta.key, pitch: '', features: [], missing: [], cta: 'Subscribe', trial: null, period: '/mo', savings: null, price: '$0' };
      const savings = billing === 'yearly' ? calcYearlySavings(meta.id, pricing) : null;
      return {
        ...meta,
        name: tr.name,
        pitch: tr.pitch,
        tagline: tr.tagline || '',
        aiBadge: tr.aiBadge || false,
        features: tr.features,
        missing: tr.missing || [],
        cta: tr.cta,
        trial: billing === 'monthly' ? tr.trial : null,
        period: billing === 'yearly' ? '/year' : tr.period,
        savings,
        price: formatPlanPrice(meta.id, tr.price, pricing, locale, billing),
      };
    });
  }, [locale, pricing, billing, getTranslation]);

  const faqItems = [
    { question: 'When do I get charged?', answer: 'Eligible paid plans start with a trial, then charge automatically on the selected billing cadence unless cancelled first.' },
    { question: 'Where do I manage billing?', answer: isNative ? 'Native subscriptions are managed through your device settings.' : 'Web subscriptions are managed through the Stripe billing portal.' },
    { question: 'Does pricing vary by region?', answer: 'Yes. Prices adjust to the selected billing region so checkout matches the displayed amount.' },
    { question: 'Can I switch plans?', answer: 'Upgrade or downgrade anytime. Changes take effect at the next billing cycle.' },
    { question: 'What happens after checkout?', answer: 'Atlas returns you to the app, confirms the session, and activates your plan instantly.' },
  ];

  const handleSubscribe = async (planId) => {
    if (planId === 'free') {
      window.location.href = `${ROUTES.auth}?mode=signup`;
      return;
    }
    if (!isAuthenticated || !user?.id) {
      sessionStorage.setItem('pending_plan', planId);
      window.location.href = `${ROUTES.auth}?mode=signup&next=${encodeURIComponent(ROUTES.pricing)}`;
      return;
    }

    setLoading(planId);
    try {
      if (isNative) {
        const purchased = await showPaywall();
        if (purchased) {
          toast.success('Purchase completed');
          window.location.href = ROUTES.today;
        }
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) { toast.error(t('pricing_page.errors.authError')); return; }
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) { toast.error(t('pricing_page.errors.sessionExpired')); return; }

      const payload = {
        plan: planId,
        user_id: user.id,
        email: user.email,
        region: region || 'US',
        billing: billing || 'monthly',
        success_url: `${window.location.origin}${ROUTES.today}?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}${ROUTES.pricing}`,
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) toast.error(t('pricing_page.errors.invalidSession'));
        else if (response.status === 403) toast.error(t('pricing_page.errors.accessDenied'));
        else toast.error(`${t('pricing_page.errors.error')} ${response.status}: ${errorText || t('pricing_page.errors.checkoutFailed')}`);
        return;
      }

      const data = await response.json();
      if (data?.success && data?.url) {
        trackCheckoutStarted({ plan: planId, region, billing });
        window.location.href = data.url;
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error(t('pricing_page.errors.unexpectedResponse'));
      }
    } catch {
      toast.error(t('pricing_page.errors.connectionFailed'));
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    trackProductEvent(user?.id, 'pricing_page_viewed', { authenticated: isAuthenticated });
    track('pricing_page_viewed', { authenticated: isAuthenticated });
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getCreatorStatus(user.id).then(setCreatorStatus).catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const pendingPlan = sessionStorage.getItem('pending_plan');
    if (pendingPlan && isAuthenticated) {
      sessionStorage.removeItem('pending_plan');
      handleSubscribe(pendingPlan);
    }
  }, [isAuthenticated]);

  const labels = {
    popular: 'Popular',
    current: 'Current plan',
    freeCurrent: 'Free plan',
    freeSignup: 'Get started free',
    nativeCta: 'Open in app',
    savePrefix: 'Save ',
  };

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
                <Link to={`${ROUTES.auth}?mode=login`}>Login</Link>
              </Button>
              <Button asChild>
                <Link to={`${ROUTES.auth}?mode=signup`}>Sign up</Link>
              </Button>
            </>
          )}
        </>
      )}
    >
      <PublicMetadata
        title="Pricing — atlas.core"
        description="Compare atlas.core plans. Free, Pro, and Performance tiers for training, nutrition, and connected performance tracking."
        canonicalPath={ROUTES.pricing}
      />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pt-16 pb-6 text-center lg:pt-24 lg:pb-10">
        <h1 className="atlas-display-title text-[clamp(2.2rem,1.6rem+1.5vw,3.6rem)]">
          {t('pricing_page.heading')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[hsl(var(--fg-2))]">
          {t('pricing_page.subtitle')}
        </p>

        {/* Billing toggle + region */}
        <div className="mx-auto mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--fill)/0.56)] p-1">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                  : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all ${
                billing === 'yearly'
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
                  : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
              }`}
            >
              Annual
              {billing !== 'yearly' && maxYearlySavings > 0 && (
                <span className="ml-1.5 rounded-full bg-[hsl(var(--ok)/0.1)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--ok))]">
                  -{maxYearlySavings}%
                </span>
              )}
            </button>
          </div>
          <RegionSelector onRegionChange={setRegion} />
        </div>
      </section>

      {/* ── Plan cards ──────────────────────────────────────────────────── */}
      <section id="plans" className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          {athletePlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fade}
              custom={index}
            >
              <PlanCard
                plan={plan}
                loading={loading}
                currentPlanId={currentPlanId}
                isAuthenticated={isAuthenticated}
                isNative={isNative}
                onSubscribe={handleSubscribe}
                labels={labels}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature comparison ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 py-8 lg:px-8">
        <h2 className="text-center text-[18px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          Compare plans
        </h2>
        <div className="mt-6 overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.3)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[hsl(var(--border)/0.6)]">
                  <th className="px-5 py-3 text-[12px] font-medium text-[hsl(var(--fg-3))]">{t('pricing_page.featureLabel') || 'Feature'}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-medium text-[hsl(var(--fg-3))]">{t('pricing_page.plans.free.name') || 'Free'}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold text-[hsl(var(--brand))]">{t('pricing_page.plans.pro.name') || 'Pro'}</th>
                  <th className="px-4 py-3 text-center text-[12px] font-medium text-[hsl(var(--fg-3))]">{t('pricing_page.plans.performance.name') || 'Performance'}</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {[
                  { label: t('pricing_page.compare.tracking') || 'Workout & nutrition tracking', free: true, pro: true, perf: true },
                  { label: t('pricing_page.compare.ai') || 'AI insights & feedback', free: false, pro: true, perf: true },
                  { label: t('pricing_page.compare.plans') || 'Training & meal plans', free: false, pro: true, perf: true },
                  { label: t('pricing_page.compare.analytics') || 'Advanced analytics & reports', free: false, pro: false, perf: true },
                  { label: t('pricing_page.compare.history') || 'History', free: '30d', pro: 'Unlimited', perf: 'Unlimited' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[hsl(var(--card)/0.3)]' : ''}>
                    <td className="px-5 py-2.5 text-[hsl(var(--fg-2))]">{row.label}</td>
                    {['free', 'pro', 'perf'].map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="px-4 py-2.5 text-center">
                          {val === true ? (
                            <Check className="mx-auto h-3.5 w-3.5 text-[hsl(var(--ok))]" strokeWidth={2.5} />
                          ) : val === false ? (
                            <span className="text-[hsl(var(--fg-3))]">--</span>
                          ) : (
                            <span className={val === 'Unlimited' ? 'font-medium text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-2))]'}>{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Creator code (authenticated only) ───────────────────────────── */}
      {isAuthenticated && (
        <section className="mx-auto max-w-4xl px-5 pb-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--fill)/0.22)] px-5 py-4">
            <div>
              <p className="text-[14px] font-medium text-[hsl(var(--fg))]">Have a creator code?</p>
              <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">Apply before checkout for partner attribution.</p>
            </div>
            {creatorStatus.code ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--ok)/0.08)] px-3 py-1.5 text-[12px] font-semibold text-[hsl(var(--ok))]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                {creatorStatus.code}
              </span>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => setCreatorModalOpen(true)} className="gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Apply code
              </Button>
            )}
          </div>
        </section>
      )}
      <CreatorCodeModal
        open={creatorModalOpen}
        onOpenChange={setCreatorModalOpen}
        onApplied={(result) => setCreatorStatus({ code: result.code, locked: false })}
      />

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-2xl px-5 py-10 lg:px-8 lg:py-14">
        <h2 className="text-center text-[18px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          Frequently asked questions
        </h2>
        <div className="mt-6">
          {faqItems.map((item) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pb-12 text-center lg:pb-16">
        <p className="text-[14px] font-medium text-[hsl(var(--fg))]">{t('pricing_page.footer')}</p>
        <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">{t('pricing_page.footerPayment')}</p>

        <div className="mt-5">
          {!isAuthenticated ? (
            <Button asChild size="lg" className="rounded-xl shadow-[0_4px_14px_hsl(var(--brand)/0.18)]">
              <Link to={`${ROUTES.auth}?mode=signup`}>
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to={ROUTES.today}>{t('pricing_page.backToApp')}</Link>
            </Button>
          )}
        </div>
      </section>
    </PublicSiteShell>
  );
}
