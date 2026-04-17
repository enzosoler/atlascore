import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { presentPaywall } from '@/lib/revenueCat';
import { useOnboarding } from '../OnboardingContext';

/**
 * PaywallScreen — native or web paywall.
 *
 * Native (iOS/Android): presents the RevenueCat native paywall.
 * Web: shows a custom plan selection card with annual/monthly options.
 *
 * Selected plan and billing cycle are stored in onboarding answers
 * so the account creation step can reference them later.
 */

/* ------------------------------------------------------------------ */
/*  Plan data                                                         */
/* ------------------------------------------------------------------ */

const PLANS = {
  performance_annual: {
    id: 'performance_annual',
    name: 'Performance',
    price: '$159/year',
    perMonth: '$13/mo billed annually',
    savings: 'Save $69',
    badge: 'Most popular',
    billing: 'annual',
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro',
    price: '$79/year',
    perMonth: '$6.58/mo billed annually',
    savings: null,
    badge: null,
    billing: 'annual',
  },
};

const MONTHLY_OPTIONS = [
  { id: 'performance_monthly', label: 'Performance $19/mo', billing: 'monthly' },
  { id: 'pro_monthly', label: 'Pro $9/mo', billing: 'monthly' },
];

/* ------------------------------------------------------------------ */
/*  Native paywall                                                    */
/* ------------------------------------------------------------------ */

function NativePaywall({ goNext }) {
  const [presenting, setPresenting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function show() {
      setPresenting(true);
      try {
        await presentPaywall();
      } catch {
        // user cancelled or error — non-fatal
      }
      if (!cancelled) {
        setPresenting(false);
        goNext();
      }
    }

    show();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (presenting) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-[14px] text-[hsl(var(--fg-2))]">Loading plans...</p>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Web paywall                                                       */
/* ------------------------------------------------------------------ */

function WebPaywall({ goNext, setAnswer }) {
  const [selected, setSelected] = useState('performance_annual');

  const handleSelect = (planId, billing) => {
    setSelected(planId);
    setAnswer('selected_plan', planId);
    setAnswer('selected_billing', billing);
  };

  // Default selection on mount
  useEffect(() => {
    setAnswer('selected_plan', 'performance_annual');
    setAnswer('selected_billing', 'annual');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          Pick the plan that fits your goal.
        </h1>
        <p className="mb-6 text-center text-[14px] text-[hsl(var(--fg-2))]">
          Free for 7 days. Cancel anytime.
        </p>

        {/* Annual plan cards */}
        <div className="flex flex-col gap-3">
          {Object.values(PLANS).map((plan) => {
            const isSelected = selected === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleSelect(plan.id, plan.billing)}
                className={`relative rounded-[16px] border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.06)]'
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
                  <div>
                    <p className="text-[16px] font-semibold text-[hsl(var(--fg))]">
                      {plan.name}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">
                      {plan.perMonth}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-[hsl(var(--fg))]">
                      {plan.price}
                    </p>
                    {plan.savings && (
                      <p className="text-[12px] font-semibold text-[hsl(var(--brand))]">
                        {plan.savings}
                      </p>
                    )}
                  </div>
                </div>

                {/* Radio indicator */}
                <div
                  className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border))]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-[3px] rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Monthly options */}
        <div className="mt-4 flex items-center justify-center gap-4">
          {MONTHLY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id, opt.billing)}
              className={`text-[12px] font-medium transition-colors ${
                selected === opt.id
                  ? 'text-[hsl(var(--brand))] underline'
                  : 'text-[hsl(var(--fg-3))]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Spacer to push CTA down */}
        <div className="flex-1" />

        {/* Hero CTA */}
        <div className="pb-2 pt-6">
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
          >
            Start 7-day free trial
          </button>

          {/* Trust row */}
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-[hsl(var(--fg-3))]">
            <span>Cancel in one tap</span>
            <span className="text-[hsl(var(--border))]">&middot;</span>
            <span>$0 today</span>
            <span className="text-[hsl(var(--border))]">&middot;</span>
            <span>Your data is private</span>
          </div>

          {/* Restore link */}
          <button
            type="button"
            className="mt-4 block w-full text-center text-[12px] text-[hsl(var(--fg-3))] underline transition-colors active:text-[hsl(var(--fg-2))]"
          >
            Restore purchase
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PaywallScreen                                                     */
/* ------------------------------------------------------------------ */

export default function PaywallScreen() {
  const { goNext, setAnswer } = useOnboarding();
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    return <NativePaywall goNext={goNext} />;
  }

  return <WebPaywall goNext={goNext} setAnswer={setAnswer} />;
}
