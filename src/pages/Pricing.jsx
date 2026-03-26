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
import { supabase } from '@/lib/supabaseClient';
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
  const isPro = plan.id === 'athlete_pro';
  const isPerformance = plan.id === 'athlete_performance';

  return (
    <article
      className={`relative flex h-full flex-col rounded-[30px] border px-5 py-5 lg:px-6 lg:py-6 transition-all ${
        isPro
          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--card))] shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02] z-10'
          : isPerformance
            ? 'border-[hsl(var(--brand)/0.24)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]'
            : 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card)/0.86)] shadow-[var(--shadow-xs)]'
      }`}
    >
      {isPro ? (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand))] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          {labels.popular}
        </span>
      ) : plan.aiBadge ? (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] px-3 py-1 text-[11px] font-medium text-[hsl(var(--brand))]">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          {labels.aiBadge}
        </span>
      ) : null}

      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border shadow-[var(--shadow-xs)] ${
          isPro 
            ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]' 
            : 'border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))]'
        }`}>
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>

        <div className="min-w-0 pt-1">
          <p className="atlas-metric-label">{plan.name}</p>
          <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {plan.pitch}
          </p>
          {plan.tagline ? (
            <p className="mt-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{plan.tagline}</p>
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
          <div key={feature} className="flex items-start gap-2 text-[13px] leading-5 text-[hsl(var(--fg))]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--ok))]" strokeWidth={2.4} />
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
        variant={isPro && !isCurrentPlan ? 'default' : 'outline'}
        className={`mt-6 h-11 w-full ${
          isCurrentPlan ? 'border-[hsl(var(--ok)/0.34)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]' : ''
        } ${isPro && !isCurrentPlan ? 'bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]' : ''}`}
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
  const { t, locale, getTranslation } = useI18n();

  const pricing = getRegionPricing(region);

  const ui = useMemo(
    () => ({
      login: 'Login',
      signup: 'Create account',
      compareTitle: 'What changes when you upgrade',
      compareCopy:
        'See exactly what you get at each level. Upgrade anytime — downgrade anytime.',
      trustA: '7-day free trial',
      trustB: 'Cancel anytime',
      trustC: 'No credit card required',
      popular: 'Most popular',
      aiBadge: 'AI-powered',
      current: 'Current plan',
      freeCurrent: 'Free plan',
      freeSignup: 'Create free account',
      billingMonthly: 'Monthly',
      billingYearly: 'Yearly',
      savePrefix: 'Save ',
      athleteLabel: t('pricing_page.athlete'),
      professionalLabel: t('pricing_page.professional'),
      footerTitle: 'Ready to see real progress?',
      footerCopy:
        'Join thousands who upgraded from basic tracking to data-driven performance.',
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
    const translations = getTranslation('pricing_page.plans');
    if (!translations) return [];
    return ATHLETE_PLAN_META.map((meta) => {
      const translated = translations[meta.key];
      if (!translated) {
        console.warn(`[Pricing] Missing translation for plan: ${meta.key}`);
        return {
          ...meta,
          name: meta.key,
          pitch: '',
          tagline: '',
          aiBadge: false,
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
        tagline: translated.tagline || '',
        aiBadge: translated.aiBadge || false,
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
        console.warn(`[Pricing] Missing translation for plan: ${meta.key}`);
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

  const handleSubscribe = async (planId) => {
    console.log('[Checkout] ========================================');
    console.log('[Checkout] Starting checkout flow for plan:', planId);
    
    // ── 1. Validações iniciais ─────────────────────────────────────
    if (planId === 'free') {
      window.location.href = '/auth?mode=signup';
      return;
    }

    if (!isAuthenticated || !user?.id) {
      sessionStorage.setItem('pending_plan', planId);
      window.location.href = `/auth?mode=signup&next=/Pricing`;
      return;
    }

    setLoading(planId);
    
    try {
      // ── 2. Obter sessão e token ──────────────────────────────────
      console.log('[Checkout] Getting Supabase session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Checkout] Session error:', sessionError);
        toast.error('Erro de autenticação. Faça login novamente.');
        return;
      }
      
      const session = sessionData?.session;
      const accessToken = session?.access_token;
      
      console.log('[Checkout] Session obtained:', {
        hasSession: !!session,
        hasToken: !!accessToken,
        userId: session?.user?.id,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      });

      if (!accessToken) {
        console.error('[Checkout] No access token available');
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      // ── 3. Preparar payload ──────────────────────────────────────
      const payload = {
        plan: planId,
        user_id: user.id,
        email: user.email,
        region: region || 'US',
        billing: billing || 'monthly',
        success_url: `${window.location.origin}/Today?subscribed=1`,
        cancel_url: `${window.location.origin}/Pricing`,
      };
      
      console.log('[Checkout] Payload:', payload);

      // ── 4. Chamar Edge Function com fetch explícito ────────────────
      console.log('[Checkout] Calling Edge Function...');
      
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[Checkout] Response status:', response.status);

      // ── 5. Tratar resposta ───────────────────────────────────────
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Checkout] HTTP error:', response.status, errorText);
        
        if (response.status === 401) {
          toast.error('Sessão inválida. Faça login novamente.');
        } else if (response.status === 403) {
          toast.error('Acesso negado. Verifique suas permissões.');
        } else {
          toast.error(`Erro ${response.status}: ${errorText || 'Falha no checkout'}`);
        }
        return;
      }

      const data = await response.json();
      console.log('[Checkout] Response data:', data);

      if (data?.success && data?.url) {
        console.log('[Checkout] Redirecting to Stripe...');
        window.location.href = data.url;
      } else if (data?.error) {
        console.error('[Checkout] Function returned error:', data.error);
        toast.error(data.error);
      } else {
        console.error('[Checkout] Unexpected response:', data);
        toast.error('Resposta inesperada do servidor');
      }
      
    } catch (error) {
      console.error('[Checkout] Exception:', error);
      toast.error('Falha na conexão. Tente novamente.');
    } finally {
      setLoading(null);
      console.log('[Checkout] ========================================');
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
          {/* Comparison Snapshot */}
          <div className="mb-10 overflow-hidden rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)]">
            <div className="border-b border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] px-5 py-4 lg:px-6">
              <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{ui.compareTitle}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--border)/0.3)]">
                    <th className="px-5 py-3 text-[12px] font-medium text-[hsl(var(--fg-3))] lg:px-6">Feature</th>
                    <th className="px-5 py-3 text-center text-[12px] font-medium text-[hsl(var(--fg-3))] lg:px-6">Free</th>
                    <th className="px-5 py-3 text-center text-[12px] font-semibold text-[hsl(var(--brand))] lg:px-6">Pro</th>
                    <th className="px-5 py-3 text-center text-[12px] font-medium text-[hsl(var(--fg-3))] lg:px-6">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  <tr className="border-b border-[hsl(var(--border)/0.2)]">
                    <td className="px-5 py-3 text-[hsl(var(--fg-2))] lg:px-6">Workout & nutrition tracking</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border)/0.2)]">
                    <td className="px-5 py-3 text-[hsl(var(--fg-2))] lg:px-6">AI insights & feedback</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--fg-3))] lg:px-6">—</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border)/0.2)]">
                    <td className="px-5 py-3 text-[hsl(var(--fg-2))] lg:px-6">Training & meal plans</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--fg-3))] lg:px-6">—</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                  </tr>
                  <tr className="border-b border-[hsl(var(--border)/0.2)]">
                    <td className="px-5 py-3 text-[hsl(var(--fg-2))] lg:px-6">Advanced analytics & reports</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--fg-3))] lg:px-6">—</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--fg-3))] lg:px-6">—</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">✓</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 text-[hsl(var(--fg-2))] lg:px-6">History</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--fg-2))] lg:px-6">30 days</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">Unlimited</td>
                    <td className="px-5 py-3 text-center text-[hsl(var(--ok))] lg:px-6">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <PublicSectionHeader
            eyebrow="Athlete"
            title={ui.athleteLabel}
            description={t('pricing_page.subtitle')}
            className="mb-10"
          />

          <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
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
                    aiBadge: ui.aiBadge,
                    current: ui.current,
                    freeCurrent: ui.freeCurrent,
                    freeSignup: ui.freeSignup,
                    savePrefix: ui.savePrefix,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Professional CTA - Simplified */}
          <div className="mt-12 rounded-2xl border border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.2)] px-6 py-6 text-center">
            <p className="text-[14px] font-medium text-[hsl(var(--fg))]">
              {ui.professionalLabel}?
            </p>
            <p className="mt-2 text-[13px] text-[hsl(var(--fg-2))]">
              {t('pricing_page.professionalDesc')}
            </p>
            <Button asChild variant="ghost" className="mt-3 h-9 text-[13px]">
              <Link to={ROUTES.professionals || '/contact'}>
                Contact us for professional access
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>      <section className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="atlas-public-panel px-6 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {t('pricing_page.footer')}
            </p>
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">
              {t('pricing_page.footerPayment')}
            </p>
            
            <div className="mt-8">
              {!isAuthenticated ? (
                <Button asChild size="lg">
                  <Link to={`${ROUTES.auth}?mode=signup`}>
                    {ui.signup}
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <Link to={ROUTES.today}>{t('pricing_page.backToApp')}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
