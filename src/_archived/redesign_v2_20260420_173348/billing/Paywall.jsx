/**
 * Paywall — in-app upgrade screen. Reached when:
 *  - User taps "Upgrade" anywhere inside the app.
 *  - User hits a gated feature (AI coach limit, meal plans, etc).
 *  - User arrives from `/auth/signup?plan=pro` after completing onboarding.
 *
 * Layout (mobile-first):
 *  - Sticky top bar with close button + tiny brandmark.
 *  - Hero: title + subtitle + billing toggle.
 *  - Tier picker (segmented control) — user taps Pro or Elite.
 *  - Large tier card with features expanded.
 *  - Sticky bottom CTA: "Start 7-day trial" (or "Switch to …" if already pro).
 *
 * Rules applied:
 *  - ZERO emojis.
 *  - TRUST RULE — no fabricated "X people upgraded today" badges. Only real
 *    social proof once we have real data.
 *  - safe-area aware top and bottom.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SafeScreen, LiquidButton, SpringReveal } from '../lib/glass';
import { SparkleIcon, TrophyIcon, BoltIcon } from '../lib/icons';
import { Logomark } from '../marketing/MarketingShell';
import { PLANS, findPlan, TIER_TINTS } from './plans';
import { purchasePackage, isRevenueCatAvailable } from '@/lib/revenueCat';

/**
 * RevenueCat package identifier for each billing cadence. These match the
 * "packages" in the `default` offering in the RevenueCat dashboard.
 */
const BILLING_TO_PACKAGE = {
  weekly:  '$rc_weekly',
  monthly: '$rc_monthly',
  yearly:  '$rc_annual',
};

const TIER_ICONS = { free: BoltIcon, pro: SparkleIcon, elite: TrophyIcon };

export default function Paywall({
  defaultPlan = 'pro',
  onClose,
  onStartTrial,
}) {
  // Default to yearly — higher LTV, smaller perceived cost ($6.58/mo equiv).
  const [billing, setBilling] = useState('yearly'); // 'weekly' | 'monthly' | 'yearly'
  const [selectedId, setSelectedId] = useState(defaultPlan);
  // Only paid tiers are selectable on the paywall — Free is the default outside.
  const selectablePlans = useMemo(() => PLANS.filter((p) => p.id !== 'free'), []);
  const plan = useMemo(() => findPlan(selectedId) || selectablePlans[0], [selectedId, selectablePlans]);
  const tint = TIER_TINTS[plan.tint] || TIER_TINTS.neutral;
  const price =
    billing === 'yearly'  ? plan.priceYearly  :
    billing === 'weekly'  ? plan.priceWeekly  :
                            plan.priceMonthly;
  const unit  =
    billing === 'yearly'  ? '/year' :
    billing === 'weekly'  ? '/week' :
                            '/mo';
  const Icon = TIER_ICONS[plan.id] || SparkleIcon;

  return (
    <SafeScreen paddingX={0}>
      {/* Top bar */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          paddingTop: 'calc(env(safe-area-inset-top) + 10px)',
          paddingInline: 16, paddingBottom: 10,
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.90) 0%, rgba(5,7,10,0.70) 70%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 36, height: 36, borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'hsl(var(--rd-fg-primary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Logomark size={28} />
          <span style={{
            fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em',
            lineHeight: 1,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          }}>
            <span style={{ color: 'hsl(var(--rd-accent))' }}>atlas</span>
            <span style={{ color: 'hsl(var(--rd-fg-primary))' }}>.core</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{
        paddingInline: 20,
        paddingTop: 16,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)',
        maxWidth: 560,
        margin: '0 auto',
      }}>
        <SpringReveal>
          <div style={{
            fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'hsl(var(--rd-accent))',
            marginBottom: 10,
          }}>
            Upgrade
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1,
            margin: '0 0 10px', color: 'hsl(var(--rd-fg-primary))',
          }}>
            Unlock your full stack.
          </h1>
          <p style={{
            fontSize: 14, color: 'hsl(var(--rd-fg-secondary))',
            lineHeight: 1.55, margin: '0 0 22px',
          }}>
            Go beyond logging. AI coach, adaptive meal plans, lab insights, and advanced analytics — all included.
          </p>
        </SpringReveal>

        {/* Billing toggle */}
        <SpringReveal delay={40}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <BillingToggle value={billing} onChange={setBilling} />
          </div>
        </SpringReveal>

        {/* Tier segmented control */}
        <SpringReveal delay={80}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${selectablePlans.length}, 1fr)`,
              gap: 6,
              padding: 4,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              marginBottom: 18,
            }}
          >
            {selectablePlans.map((p) => {
              const active = selectedId === p.id;
              const pTint = TIER_TINTS[p.tint];
              const PIcon = TIER_ICONS[p.id] || SparkleIcon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    background: active ? pTint.bg : 'transparent',
                    border: active ? `1px solid ${pTint.bd}` : '1px solid transparent',
                    color: active ? pTint.c : 'hsl(var(--rd-fg-muted))',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontSize: 12.5, fontWeight: 700, letterSpacing: '-0.005em',
                  }}
                >
                  <PIcon size={16} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </SpringReveal>

        {/* Plan card */}
        <SpringReveal delay={120}>
          <div
            style={{
              position: 'relative',
              padding: 22,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${tint.bd}`,
              overflow: 'hidden',
              backdropFilter: 'blur(14px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(80% 60% at 50% 0%, ${tint.bg.replace('0.08', '0.18')} 0%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  aria-hidden
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: tint.bg, border: `1px solid ${tint.bd}`, color: tint.c,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
                    {plan.tagline}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                <div style={{
                  fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em',
                  color: 'hsl(var(--rd-fg-primary))', lineHeight: 1,
                }}>
                  ${price}
                </div>
                <div style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
                  {unit}
                </div>
                {/* Savings vs the weekly anchor — only show on monthly/yearly. */}
                {billing !== 'weekly' && price > 0 && plan.priceWeekly ? (
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '4px 8px', borderRadius: 7,
                    background: 'rgba(0,255,255,0.10)', border: '1px solid rgba(0,255,255,0.26)',
                    color: 'hsl(var(--rd-accent))',
                    textTransform: 'uppercase',
                  }}>
                    {billing === 'yearly' ? '−62% vs weekly' : '−42% vs weekly'}
                  </div>
                ) : null}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.filter((f) => f.included).map((f, i) => (
                  <FeatureRow key={i} feature={f} />
                ))}
              </div>
            </div>
          </div>
        </SpringReveal>

        {/* Fine print */}
        <div style={{
          marginTop: 14, fontSize: 11, color: 'hsl(var(--rd-fg-muted))',
          lineHeight: 1.55, textAlign: 'center',
        }}>
          7-day free trial. Cancel anytime.
          By subscribing you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          paddingInline: 16,
          paddingTop: 10,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
          backgroundImage: 'linear-gradient(0deg, rgba(5,7,10,0.95) 0%, rgba(5,7,10,0.78) 60%, rgba(5,7,10,0) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
          zIndex: 30,
        }}
      >
        <LiquidButton
          intent="primary"
          onClick={() => onStartTrial?.({ plan, billing })}
          style={{ width: '100%' }}
        >
          Start 7-day free trial
        </LiquidButton>
        <div style={{
          marginTop: 8, fontSize: 11.5, color: 'hsl(var(--rd-fg-muted))',
          textAlign: 'center',
        }}>
          Then ${price} {unit}. No charge today.
        </div>
      </div>
    </SafeScreen>
  );
}
export { Paywall };

/* ─── Billing toggle ────────────────────────────────────────────────────── */

function BillingToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 4,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        gap: 4,
      }}
    >
      <ToggleBtn active={value === 'weekly'}  onClick={() => onChange('weekly')}>
        Weekly
      </ToggleBtn>
      <ToggleBtn active={value === 'monthly'} onClick={() => onChange('monthly')}>
        Monthly
        <SaveBadge>-42%</SaveBadge>
      </ToggleBtn>
      <ToggleBtn active={value === 'yearly'}  onClick={() => onChange('yearly')}>
        Yearly
        <SaveBadge strong>-62%</SaveBadge>
      </ToggleBtn>
    </div>
  );
}

function SaveBadge({ children, strong = false }) {
  return (
    <span style={{
      marginLeft: 6,
      fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
      padding: '2px 5px', borderRadius: 5,
      background: strong ? 'rgba(0,255,255,0.20)' : 'rgba(0,255,255,0.12)',
      border: strong ? '1px solid rgba(0,255,255,0.40)' : '1px solid rgba(0,255,255,0.26)',
      color: 'hsl(var(--rd-accent))',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

function ToggleBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: 9,
        fontSize: 12.5, fontWeight: 700, letterSpacing: '-0.005em',
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
        color: active ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        display: 'inline-flex', alignItems: 'center',
      }}
    >
      {children}
    </button>
  );
}

/* ─── Feature row (included only) ───────────────────────────────────────── */

function FeatureRow({ feature: f }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span
        aria-hidden
        style={{
          width: 16, height: 16, borderRadius: 9999,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 2,
          background: 'rgba(0,255,255,0.12)',
          border: '1px solid rgba(0,255,255,0.30)',
          color: 'hsl(var(--rd-accent))',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          flex: '1 1 auto',
          fontSize: 13,
          color: f.strong ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-secondary))',
          lineHeight: 1.45,
          fontWeight: f.strong ? 700 : 500,
        }}>
          {f.text}
        </span>
        {f.note ? (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: 'hsl(var(--rd-fg-muted))',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}>
            {f.note}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Inline Link helper (uses react-router) ────────────────────────────── */

import { Link as RLink } from 'react-router-dom';
function Link({ to, children }) {
  return (
    <RLink
      to={to}
      target="_blank"
      style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none' }}
    >
      {children}
    </RLink>
  );
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function PaywallRoute() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planParam = params.get('plan') || 'pro';
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleStartTrial = async ({ plan, billing }) => {
    if (isPurchasing) return;

    // Graceful fallback when env vars aren't set or we're on web where the
    // Capacitor RC SDK can't run. Keep the old toast so dev flow doesn't
    // crash — the human knows to finish the dashboard wiring.
    if (!isRevenueCatAvailable()) {
      toast.message('Billing setup pending', {
        description: `RevenueCat isn't configured on this device yet. Plan: ${plan.name}, ${billing}.`,
      });
      return;
    }

    const packageId = BILLING_TO_PACKAGE[billing];
    if (!packageId) {
      toast.error('Unknown billing cadence', { description: String(billing) });
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await purchasePackage(packageId);

      if (result.userCancelled) {
        // Silent — user actively dismissed the sheet.
        return;
      }

      if (result.success) {
        toast.success('You are in.', {
          description: `${plan.name} active. Welcome to the full stack.`,
        });
        navigate('/app/today');
        return;
      }

      if (result.error === 'billing_unavailable') {
        toast.message('Billing setup pending', {
          description: 'RevenueCat is not available on this device.',
        });
        return;
      }

      if (result.error === 'no_offering' || result.error?.startsWith('package_not_found')) {
        toast.error('Plan unavailable', {
          description: 'This plan is not currently offered in your region. Try again later.',
        });
        return;
      }

      toast.error('Purchase failed', {
        description: 'Your card was not charged. Please try again.',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Paywall
      defaultPlan={planParam}
      onClose={() => navigate(-1)}
      onStartTrial={handleStartTrial}
    />
  );
}
