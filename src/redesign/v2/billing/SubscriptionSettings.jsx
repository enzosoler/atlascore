/**
 * SubscriptionSettings — /app/billing. Hub for the user's current plan.
 *
 * Shows:
 *  - Current plan card with status (trial / active / canceled / past_due)
 *  - Renewal date, next charge amount, price per period
 *  - Actions: Change plan · Manage payment method · View invoices · Cancel
 *
 * TRUST RULE — until RevenueCat is wired we show an honest "loading from
 * provider" state, never fake a subscription. If the user is on Free we
 * show an upgrade CTA that routes to the Paywall.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription, restorePurchases, isRevenueCatAvailable } from '@/lib/revenueCat';
import { SafeScreen, SpringReveal, LiquidButton, Glass } from '../lib/glass';
import { SparkleIcon, TrophyIcon, BoltIcon, ChartIcon } from '../lib/icons';
import { findPlan, TIER_TINTS } from './plans';

const TIER_ICONS = { free: BoltIcon, pro: SparkleIcon, elite: TrophyIcon };

export default function SubscriptionSettings({
  subscription = null,     // { planId, status, renewsAt, priceMonthly, billingPeriod }
  onBack,
  onUpgrade,
  onChangePlan,
  onManagePayment,
  onViewInvoices,
  onCancel,
}) {
  const { user } = useAuth();
  const currentPlanId = subscription?.planId || user?.user_metadata?.tier?.toLowerCase() || 'free';
  const plan = findPlan(currentPlanId) || findPlan('free');
  const tint = TIER_TINTS[plan.tint] || TIER_TINTS.neutral;
  const Icon = TIER_ICONS[plan.id] || BoltIcon;

  const status = subscription?.status || (plan.id === 'free' ? 'free' : null);
  const isFree = plan.id === 'free';

  return (
    <SafeScreen hasTopBar hasBottomNav>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <SpringReveal>
          <BackBar onBack={onBack} />
          <div style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
          }}>
            Billing
          </div>
          <h1 style={{
            margin: '6px 0 0', fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Subscription
          </h1>
          <p style={{
            margin: '6px 0 0', fontSize: 13,
            color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.55,
          }}>
            Manage your plan, payment method, and invoices.
          </p>
        </SpringReveal>

        {/* Plan card */}
        <SpringReveal delay={60}>
          <div
            style={{
              marginTop: 20,
              padding: 20,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${tint.bd}`,
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(14px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(80% 60% at 100% 0%, ${tint.bg.replace('0.08', '0.22')} 0%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                aria-hidden
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: tint.bg, border: `1px solid ${tint.bd}`, color: tint.c,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
                  {statusLabel(status)}
                </div>
              </div>
            </div>

            {/* Details grid — only when there's a real subscription */}
            {subscription ? (
              <div style={{ position: 'relative', marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <DetailRow label="Next charge" value={formatCurrency(subscription.priceMonthly)} />
                <DetailRow label="Renews" value={formatDate(subscription.renewsAt)} />
                <DetailRow label="Period" value={subscription.billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} />
                <DetailRow label="Status" value={statusLabel(status, { compact: true })} />
              </div>
            ) : (
              <div style={{ position: 'relative', marginTop: 14, fontSize: 12.5, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.55 }}>
                {isFree
                  ? 'You are on the Free plan. Upgrade anytime to unlock the AI coach, meal plans, and advanced analytics.'
                  : 'Loading plan details from RevenueCat…'}
              </div>
            )}
          </div>
        </SpringReveal>

        {/* Actions */}
        <SpringReveal delay={100}>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isFree ? (
              <LiquidButton intent="primary" onClick={onUpgrade}>
                Upgrade
              </LiquidButton>
            ) : (
              <>
                <ActionRow
                  icon={<ChartIcon size={16} />}
                  label="Change plan"
                  sub="Switch between Pro and Elite, monthly/yearly"
                  onClick={onChangePlan}
                />
                <ActionRow
                  icon={<CardIcon size={16} />}
                  label="Payment method"
                  sub="Update your card or billing details"
                  onClick={onManagePayment}
                />
                <ActionRow
                  icon={<ReceiptIcon size={16} />}
                  label="Invoices"
                  sub="Download past invoices"
                  onClick={onViewInvoices}
                />
                <ActionRow
                  icon={<XIcon size={16} />}
                  label="Cancel subscription"
                  sub="Access continues until the end of the current period"
                  onClick={onCancel}
                  danger
                />
              </>
            )}
          </div>
        </SpringReveal>

        {/* Restore purchases */}
        <SpringReveal delay={140}>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <button
              type="button"
              onClick={async () => {
                if (!isRevenueCatAvailable()) {
                  toast.message('Billing setup pending', {
                    description: 'RevenueCat is not available on this device.',
                  });
                  return;
                }
                const res = await restorePurchases();
                if (res.isActive) {
                  toast.success('Purchases restored');
                } else if (res.success) {
                  toast.message('Nothing to restore', {
                    description: 'No active subscription found on this account.',
                  });
                } else {
                  toast.error('Could not restore purchases', {
                    description: 'Please try again in a moment.',
                  });
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--rd-fg-muted))',
                fontSize: 12,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                padding: '8px 12px',
              }}
            >
              Restore purchases
            </button>
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { SubscriptionSettings };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function BackBar({ onBack }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{
          width: 36, height: 36, borderRadius: 9999,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--rd-fg-primary))', marginTop: 2 }}>
        {value || '—'}
      </div>
    </div>
  );
}

function ActionRow({ icon, label, sub, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '14px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: danger ? '#F87171' : 'hsl(var(--rd-fg-primary))',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <span style={{
        width: 32, height: 32, borderRadius: 10,
        background: danger ? 'rgba(248,113,113,0.10)' : 'rgba(255,255,255,0.04)',
        border: danger ? '1px solid rgba(248,113,113,0.26)' : '1px solid rgba(255,255,255,0.10)',
        color: 'currentColor',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }}>{label}</div>
        <div style={{
          fontSize: 11.5,
          color: danger ? 'rgba(248,113,113,0.70)' : 'hsl(var(--rd-fg-muted))',
          marginTop: 2, lineHeight: 1.4,
        }}>
          {sub}
        </div>
      </div>
      <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'hsl(var(--rd-fg-muted))' }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ─── Tiny inline icons (local to this screen) ──────────────────────────── */

function CardIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
function ReceiptIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function statusLabel(status, { compact = false } = {}) {
  switch (status) {
    case 'trialing':  return compact ? 'Trial' : 'Trial · No charge yet';
    case 'active':    return compact ? 'Active' : 'Active';
    case 'canceled':  return compact ? 'Canceled' : 'Canceled · ends at period';
    case 'past_due':  return compact ? 'Past due' : 'Past due · update payment';
    case 'free':      return compact ? 'Free' : 'Free forever plan';
    default:          return compact ? '—' : 'Loading…';
  }
}

function formatCurrency(cents) {
  if (cents == null) return '—';
  return `$${Number(cents).toFixed(2)}`;
}

function formatDate(input) {
  if (!input) return '—';
  try {
    return new Date(input).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(input);
  }
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function SubscriptionSettingsRoute() {
  const navigate = useNavigate();
  const rc = useSubscription();

  // Honest mapping: while loading OR when billing is unavailable, pass
  // `subscription=null` so the component shows its existing "Loading…"
  // or "Free" states instead of a fabricated plan. Only expose a real
  // subscription once RevenueCat returns an active entitlement.
  const subscription = rc.status === 'active' || rc.status === 'trialing'
    ? {
        planId: rc.tier,                // 'pro'
        status: rc.status,              // 'active' | 'trialing'
        renewsAt: rc.renewsAt,
        priceMonthly: null,             // sourced from the store; we don't fabricate
        billingPeriod: billingPeriodFromProductId(rc.productId),
      }
    : null;

  return (
    <SubscriptionSettings
      subscription={subscription}
      onBack={() => navigate(-1)}
      onUpgrade={() => navigate('/app/billing/paywall')}
      onChangePlan={() => navigate('/app/billing/paywall')}
      onManagePayment={() => navigate('/app/billing/payment-method')}
      onViewInvoices={() => navigate('/app/billing/invoices')}
      onCancel={() => navigate('/app/billing/cancel')}
    />
  );
}

/**
 * Map a RevenueCat product identifier back to a human billing period.
 * Defaults to 'monthly' when unknown so the UI doesn't show a misleading
 * yearly label for an unrecognized product.
 */
function billingPeriodFromProductId(productId) {
  if (!productId) return 'monthly';
  if (productId.includes('yearly') || productId.includes('annual')) return 'yearly';
  if (productId.includes('weekly')) return 'weekly';
  return 'monthly';
}
