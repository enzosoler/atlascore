import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Loader2 } from 'lucide-react';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenueCat';
import { useOnboarding } from '../OnboardingContext';
import { usePaywallAnalytics } from '@/hooks/usePaywallAnalytics';

/* ------------------------------------------------------------------ */
/*  Fallback prices (shown on web or when store fetch fails)          */
/* ------------------------------------------------------------------ */

const FALLBACK_PRICES = {
  weekly: { label: '$6.99/week', raw: 6.99 },
  monthly: { label: '$12.99/month', raw: 12.99 },
  annual: { label: '$79.99/year', raw: 79.99 },
};

const BILLING_META = {
  weekly: { period: 'week', identifier: '$rc_weekly' },
  monthly: { period: 'month', identifier: '$rc_monthly' },
  annual: { period: 'year', identifier: '$rc_annual' },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function computeSavings(annualPrice, weeklyPrice) {
  if (!weeklyPrice || weeklyPrice <= 0) return null;
  const weeklyAnnual = weeklyPrice * 52;
  const pct = Math.round((1 - annualPrice / weeklyAnnual) * 100);
  return pct > 0 ? pct : null;
}

/* ------------------------------------------------------------------ */
/*  PaywallScreen                                                     */
/* ------------------------------------------------------------------ */

export default function PaywallScreen() {
  const { goNext, setAnswer } = useOnboarding();
  const {
    trackPaywallViewed,
    trackTierSelected,
    trackTrialStarted,
  } = usePaywallAnalytics();
  const isNative = Capacitor.isNativePlatform();

  const [selected, setSelected] = useState('annual');
  const [packages, setPackages] = useState(null); // RevenueCat package objects keyed by billing
  const [prices, setPrices] = useState(FALLBACK_PRICES);
  const [loading, setLoading] = useState(isNative);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const lastTrackedPlanRef = useRef(null);

  useEffect(() => {
    trackPaywallViewed({ surface: 'onboarding_v2', platform: isNative ? 'native' : 'web' });
  }, [isNative, trackPaywallViewed]);

  /* ---------- Fetch offerings on native ---------- */
  useEffect(() => {
    if (!isNative) return;

    let cancelled = false;

    async function fetchOfferings() {
      try {
        const offering = await getOfferings({ currentOnly: true });

        if (cancelled) return;

        if (offering && offering.availablePackages) {
          const pkgMap = {};
          const priceMap = { ...FALLBACK_PRICES };

          for (const pkg of offering.availablePackages) {
            const id = pkg.identifier; // e.g. '$rc_weekly'
            if (id === '$rc_weekly') {
              pkgMap.weekly = pkg;
              priceMap.weekly = {
                label: `${pkg.product.priceString}/${BILLING_META.weekly.period}`,
                raw: pkg.product.price,
              };
            } else if (id === '$rc_monthly') {
              pkgMap.monthly = pkg;
              priceMap.monthly = {
                label: `${pkg.product.priceString}/${BILLING_META.monthly.period}`,
                raw: pkg.product.price,
              };
            } else if (id === '$rc_annual') {
              pkgMap.annual = pkg;
              priceMap.annual = {
                label: `${pkg.product.priceString}/${BILLING_META.annual.period}`,
                raw: pkg.product.price,
              };
            }
          }

          setPackages(pkgMap);
          setPrices(priceMap);
        }
      } catch (err) {
        console.error('[Paywall] Failed to load offerings:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOfferings();
    return () => { cancelled = true; };
  }, [isNative]);

  /* ---------- Persist selection into onboarding context ---------- */
  useEffect(() => {
    const packageId = packages?.[selected]?.identifier ?? BILLING_META[selected].identifier;
    setAnswer('selected_plan', packageId);
    setAnswer('selected_billing', selected);
    if (lastTrackedPlanRef.current === packageId) return;
    lastTrackedPlanRef.current = packageId;
    trackTierSelected({
      package_id: packageId,
      selected_billing: selected,
      surface: 'onboarding_v2',
      platform: isNative ? 'native' : 'web',
    });
  }, [selected, packages]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Dynamic savings badge ---------- */
  const annualSavingsPct = useMemo(
    () => computeSavings(prices.annual.raw, prices.weekly.raw),
    [prices],
  );

  /* ---------- Plan cards ---------- */
  const plans = [
    {
      key: 'weekly',
      title: 'Weekly',
      price: prices.weekly.label,
      badge: 'MOST POPULAR',
    },
    {
      key: 'monthly',
      title: 'Monthly',
      price: prices.monthly.label,
      badge: null,
    },
    {
      key: 'annual',
      title: 'Annual',
      price: prices.annual.label,
      badge: annualSavingsPct ? `SAVE ${annualSavingsPct}%` : null,
    },
  ];

  /* ---------- Handlers ---------- */
  async function handleContinue() {
    if (isNative) {
      if (!packages?.[selected]) {
        setError('We could not load the plan from the store. Please try again.');
        return;
      }

      setPurchasing(true);
      setError(null);
      try {
        const result = await purchasePackage(packages[selected]);
        if (result.success) {
          trackTrialStarted({
            package_id: packages[selected].identifier,
            selected_billing: selected,
            surface: 'onboarding_v2',
            platform: 'native',
          });
          goNext();
          return;
        }
        if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
        console.error('[Paywall] Purchase failed:', err);
      } finally {
        setPurchasing(false);
      }
      return;
    }

    // Web: just advance — Stripe checkout happens after account creation
    goNext();
  }

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    try {
      const result = await restorePurchases();
      if (result.isActive) {
        goNext();
        return;
      }
      setError('No active subscription found.');
    } catch {
      setError('Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  }

  /* ---------- Loading state ---------- */
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[380px] rounded-[28px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
          <div className="mb-4 h-4 w-32 rounded-full bg-[hsl(var(--fill)/0.9)]" />
          <div className="mb-3 h-8 w-3/4 rounded-full bg-[hsl(var(--fill)/0.9)]" />
          <div className="space-y-3">
            <div className="h-16 rounded-[16px] bg-[hsl(var(--fill)/0.6)]" />
            <div className="h-16 rounded-[16px] bg-[hsl(var(--fill)/0.6)]" />
            <div className="h-16 rounded-[16px] bg-[hsl(var(--fill)/0.6)]" />
          </div>
          <div className="mt-5 flex items-center gap-2 text-[13px] text-[hsl(var(--fg-3))]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your plans...
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Render state ---------- */
  const selectedPrice = prices[selected];
  const selectedPeriod = BILLING_META[selected].period;
  const selectedPriceLabel = selectedPrice.label.split('/')[0];
  const disclosure = isNative
    ? `3 days free, then ${selectedPriceLabel}/${selectedPeriod}. Subscription auto-renews unless canceled 24h before the current period ends.`
    : 'Billing happens after account creation, when you confirm the plan on the web checkout screen.';
  const ctaLabel = isNative
    ? (purchasing ? 'Processing...' : 'Start 3-day free trial')
    : 'Continue to account setup';
  const billingPlans = [
    {
      key: 'annual',
      title: 'Annual',
      price: prices.annual.label,
      badge: annualSavingsPct ? `SAVE ${annualSavingsPct}%` : 'BEST VALUE',
      note: 'Lowest effective monthly price',
    },
    {
      key: 'monthly',
      title: 'Monthly',
      price: prices.monthly.label,
      badge: null,
      note: 'Flexible month-to-month',
    },
    {
      key: 'weekly',
      title: 'Weekly',
      price: prices.weekly.label,
      badge: null,
      note: 'Most flexible, highest cost',
    },
  ];
  const benefits = [
    { title: 'Personalized targets', detail: 'Calories, macros, and training cues built from your baseline.' },
    { title: 'Weekly adjustments', detail: 'Your plan updates as your inputs and progress change.' },
    { title: 'Progress context', detail: 'Check-ins, milestones, and historical data stay in one place.' },
  ];

  /* ---------- Render ---------- */
  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <motion.div
        className="mx-auto flex w-full max-w-[420px] flex-1 flex-col"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="rounded-[28px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.76)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
              Choose your plan
            </p>
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.04em] text-[hsl(var(--fg))]">
              Unlock your full potential.
            </h1>
            <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
              Start a {isNative ? '3-day free trial' : 'plan selection'} and keep the version that fits your pace.
            </p>
          </div>

          <div className="mt-5 space-y-3 rounded-[22px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--bg)/0.35)] p-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[hsl(var(--brand))]" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{benefit.title}</p>
                  <p className="text-[12px] leading-relaxed text-[hsl(var(--fg-2))]">{benefit.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {billingPlans.map((plan) => {
              const isSelected = selected === plan.key;

              return (
                <button
                  key={plan.key}
                  type="button"
                  onClick={() => setSelected(plan.key)}
                  className={`relative rounded-[18px] border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                      : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--bg)/0.35)]'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-[hsl(var(--brand))] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                          isSelected
                            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]'
                            : 'border-[hsl(var(--border))]'
                        }`}
                      >
                        {isSelected && (
                          <div className="mt-[3px] ml-[3px] h-[10px] w-[10px] rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">
                          {plan.title}
                        </p>
                        <p className="text-[12px] text-[hsl(var(--fg-3))]">{plan.note}</p>
                      </div>
                    </div>
                    <p className="text-[16px] font-bold text-[hsl(var(--fg))]">{plan.price}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[hsl(var(--fg-3))]">
            {disclosure}
          </p>

          {error && (
            <p className="mt-3 text-center text-[12px] text-red-500">{error}</p>
          )}

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={handleContinue}
              disabled={purchasing}
              className="w-full rounded-[16px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_50px_hsl(var(--brand)/0.22)] transition-opacity active:opacity-80 disabled:opacity-60"
            >
              {ctaLabel}
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-[hsl(var(--fg-3))]">
              <span>{isNative ? 'Cancel in one tap' : 'Bill later after sign-up'}</span>
              <span className="text-[hsl(var(--border))]">&middot;</span>
              <span>{isNative ? '$0 today' : 'Choose your plan before checkout'}</span>
            </div>

            {isNative ? (
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring}
                className="block w-full text-center text-[12px] text-[hsl(var(--fg-3))] underline transition-colors active:text-[hsl(var(--fg-2))] disabled:opacity-60"
              >
                {restoring ? 'Restoring...' : 'Restore Purchases'}
              </button>
            ) : (
              <p className="text-center text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
                Restore Purchases is available in the mobile app.
              </p>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] text-[hsl(var(--fg-3))]">
              <a href="https://atlascore.app/terms" className="underline">Terms of Use</a>
              <a href="https://atlascore.app/privacy" className="underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
