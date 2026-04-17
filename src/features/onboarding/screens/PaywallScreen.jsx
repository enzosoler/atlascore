import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenueCat';
import { useOnboarding } from '../OnboardingContext';

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
  const isNative = Capacitor.isNativePlatform();

  const [selected, setSelected] = useState('weekly');
  const [packages, setPackages] = useState(null); // RevenueCat package objects keyed by billing
  const [prices, setPrices] = useState(FALLBACK_PRICES);
  const [loading, setLoading] = useState(isNative);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);

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
    if (isNative && packages?.[selected]) {
      setPurchasing(true);
      setError(null);
      try {
        const result = await purchasePackage(packages[selected]);
        if (result.success) {
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
    } else {
      // Web: just advance — Stripe checkout happens after account creation
      goNext();
    }
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
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[14px] text-[hsl(var(--fg-2))]">Loading plans...</p>
      </div>
    );
  }

  /* ---------- Disclosure text ---------- */
  const selectedPrice = prices[selected];
  const selectedPeriod = BILLING_META[selected].period;
  const disclosure = `3 days free, then ${selectedPrice.label.split('/')[0]}/${selectedPeriod}. Subscription auto-renews unless canceled 24h before the current period ends.`;

  /* ---------- Render ---------- */
  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <motion.div
        className="flex flex-1 flex-col"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Headline */}
        <h1 className="mb-1 text-center text-[26px] font-bold leading-tight text-[hsl(var(--fg))]">
          Unlock your full potential.
        </h1>
        <p className="mb-6 text-center text-[14px] text-[hsl(var(--fg-2))]">
          Start your 3-day free trial. Cancel anytime.
        </p>

        {/* Plan cards */}
        <div className="flex flex-col gap-3">
          {plans.map((plan) => {
            const isSelected = selected === plan.key;

            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelected(plan.key)}
                className={`relative rounded-[16px] border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                    : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)]'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-[hsl(var(--brand))] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div
                      className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
                        isSelected
                          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]'
                          : 'border-[hsl(var(--border))]'
                      }`}
                    >
                      {isSelected && (
                        <div className="mt-[3px] ml-[3px] h-[10px] w-[10px] rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-[16px] font-semibold text-[hsl(var(--fg))]">
                      {plan.title}
                    </p>
                  </div>
                  <p className="text-[16px] font-bold text-[hsl(var(--fg))]">
                    {plan.price}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Apple-compliant disclosure */}
        <p className="mt-4 text-center text-[11px] leading-relaxed text-[hsl(var(--fg-3))]">
          {disclosure}
        </p>

        {/* Error message */}
        {error && (
          <p className="mt-3 text-center text-[12px] text-red-500">{error}</p>
        )}

        {/* Spacer to push CTA down */}
        <div className="flex-1" />

        {/* CTA + footer */}
        <div className="pb-2 pt-6">
          <button
            type="button"
            onClick={handleContinue}
            disabled={purchasing}
            className="w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {purchasing ? 'Processing...' : 'Start 3-day free trial'}
          </button>

          {/* Trust row */}
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-[hsl(var(--fg-3))]">
            <span>Cancel in one tap</span>
            <span className="text-[hsl(var(--border))]">&middot;</span>
            <span>$0 today</span>
            <span className="text-[hsl(var(--border))]">&middot;</span>
            <span>Your data is private</span>
          </div>

          {/* Restore purchases */}
          <button
            type="button"
            onClick={handleRestore}
            disabled={restoring}
            className="mt-4 block w-full text-center text-[12px] text-[hsl(var(--fg-3))] underline transition-colors active:text-[hsl(var(--fg-2))] disabled:opacity-60"
          >
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </button>

          {/* Terms / Privacy links */}
          <div className="mt-3 mb-2 flex items-center justify-center gap-4 text-[11px] text-[hsl(var(--fg-3))]">
            <a href="https://atlascore.app/terms" className="underline">Terms of Use</a>
            <a href="https://atlascore.app/privacy" className="underline">Privacy Policy</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
