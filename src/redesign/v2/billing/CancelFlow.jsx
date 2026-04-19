/**
 * CancelFlow — /app/billing/cancel.
 *
 * Three-step retention flow:
 *  1. Reason selector — "why are you canceling?" (quick-tap chips)
 *  2. Offer — pause subscription, downgrade, or keep + discount
 *  3. Confirm — final "cancel anyway" button with what they're losing
 *
 * Rules applied:
 *  - ZERO emojis.
 *  - TRUST RULE — we don't claim "200 people canceled today then came back"
 *    or any fake retention stat.
 *  - User can back out at any step.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { SafeScreen, SpringReveal, LiquidButton } from '../lib/glass';
import { presentCustomerCenter, isRevenueCatAvailable } from '@/lib/revenueCat';

/**
 * Subscriptions in the App Store and Play Store must be cancelled by the
 * user inside the native OS settings — RevenueCat can't cancel on their
 * behalf without a server-side StoreKit/Play API call, and even then the
 * stores require user consent. For web (Stripe) we route to the customer
 * portal via the existing `create-customer-portal` Supabase Edge Function.
 */
const APPLE_SUBSCRIPTIONS_URL  = 'https://apps.apple.com/account/subscriptions';
const GOOGLE_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

async function openNativeSubscriptionManagement() {
  // Prefer the RevenueCat Customer Center on native — it handles both iOS
  // and Android and shows the user's atlas.core subscription specifically.
  if (isRevenueCatAvailable()) {
    try {
      await presentCustomerCenter();
      return;
    } catch {
      // Fall through to OS-level subscription pages.
    }
  }

  const platform = Capacitor.getPlatform();
  const url =
    platform === 'ios'     ? APPLE_SUBSCRIPTIONS_URL  :
    platform === 'android' ? GOOGLE_SUBSCRIPTIONS_URL :
                             null;

  if (url) {
    try {
      await Browser.open({ url });
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

const REASONS = [
  { id: 'too_expensive',  label: 'Too expensive' },
  { id: 'not_using',      label: "I'm not using it enough" },
  { id: 'missing_feature',label: 'Missing a feature I need' },
  { id: 'found_alt',      label: 'Using another app' },
  { id: 'technical',      label: 'Technical issues' },
  { id: 'other',          label: 'Other reason' },
];

export default function CancelFlow({
  planName = 'Pro',
  renewsAt,
  onBack,
  onConfirmCancel,
  onKeepWithDiscount,
  onPause,
}) {
  const [step, setStep]     = useState('reason'); // 'reason' | 'offer' | 'confirm'
  const [reason, setReason] = useState(null);

  return (
    <SafeScreen hasTopBar hasBottomNav>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <BackBar onBack={onBack} />

        {step === 'reason' && (
          <ReasonStep
            planName={planName}
            reason={reason}
            setReason={setReason}
            onContinue={() => setStep('offer')}
          />
        )}

        {step === 'offer' && (
          <OfferStep
            planName={planName}
            reason={reason}
            onKeepWithDiscount={() => { onKeepWithDiscount?.(reason); }}
            onPause={() => { onPause?.(reason); }}
            onContinue={() => setStep('confirm')}
          />
        )}

        {step === 'confirm' && (
          <ConfirmStep
            planName={planName}
            renewsAt={renewsAt}
            onBackToApp={onBack}
            onConfirmCancel={() => onConfirmCancel?.(reason)}
          />
        )}
      </div>
    </SafeScreen>
  );
}
export { CancelFlow };

/* ─── Step 1 — Reason ──────────────────────────────────────────────────── */

function ReasonStep({ planName, reason, setReason, onContinue }) {
  return (
    <>
      <SpringReveal>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
        }}>
          Cancel · Step 1 of 3
        </div>
        <h1 style={{
          margin: '6px 0 0', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1.15,
        }}>
          Why are you canceling {planName}?
        </h1>
        <p style={{
          margin: '6px 0 0', fontSize: 13,
          color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.55,
        }}>
          Your feedback helps us get better. Pick the closest reason.
        </p>
      </SpringReveal>

      <SpringReveal delay={40}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
          {REASONS.map((r) => {
            const active = reason === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                style={{
                  paddingInline: 14, height: 36, borderRadius: 9999,
                  background: active ? 'rgba(0,255,255,0.10)' : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,255,255,0.30)' : '1px solid rgba(255,255,255,0.10)',
                  color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
                  fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </SpringReveal>

      <div style={{ marginTop: 30 }}>
        <LiquidButton intent="primary" onClick={onContinue} disabled={!reason} style={{ width: '100%' }}>
          Continue
        </LiquidButton>
      </div>
    </>
  );
}

/* ─── Step 2 — Offer ───────────────────────────────────────────────────── */

function OfferStep({ planName, reason, onKeepWithDiscount, onPause, onContinue }) {
  // Tailor the offer slightly to the reason — but never in a misleading way.
  const primaryOffer = reason === 'too_expensive'
    ? { title: 'Keep 30% off for 3 months', body: 'Stay on ' + planName + ' at a discount while you get more value.' }
    : { title: 'Pause for up to 3 months', body: 'Come back whenever — your data stays exactly as you left it.' };

  return (
    <>
      <SpringReveal>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'hsl(var(--rd-fg-muted))', fontWeight: 700,
        }}>
          Cancel · Step 2 of 3
        </div>
        <h1 style={{
          margin: '6px 0 0', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1.15,
        }}>
          Before you go…
        </h1>
        <p style={{
          margin: '6px 0 0', fontSize: 13,
          color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.55,
        }}>
          A few options that might work better than canceling.
        </p>
      </SpringReveal>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SpringReveal delay={40}>
          <OfferCard
            tone="accent"
            title={primaryOffer.title}
            body={primaryOffer.body}
            ctaLabel={reason === 'too_expensive' ? 'Apply discount' : 'Pause subscription'}
            onClick={reason === 'too_expensive' ? onKeepWithDiscount : onPause}
          />
        </SpringReveal>
        <SpringReveal delay={80}>
          <OfferCard
            tone="neutral"
            title="Switch to monthly billing"
            body="More flexibility. Cancel anytime after next charge."
            ctaLabel="Switch plan"
            onClick={() => { toast.success('Redirecting to change plan…'); }}
          />
        </SpringReveal>
      </div>

      <div style={{ marginTop: 30 }}>
        <LiquidButton intent="ghost" onClick={onContinue} style={{ width: '100%' }}>
          No thanks — continue canceling
        </LiquidButton>
      </div>
    </>
  );
}

function OfferCard({ tone = 'neutral', title, body, ctaLabel, onClick }) {
  const styles = tone === 'accent'
    ? { bg: 'rgba(0,255,255,0.06)', bd: 'rgba(0,255,255,0.26)', kicker: 'hsl(var(--rd-accent))', kickerText: 'Recommended' }
    : { bg: 'rgba(255,255,255,0.03)', bd: 'rgba(255,255,255,0.08)', kicker: 'hsl(var(--rd-fg-muted))', kickerText: 'Option' };
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: styles.bg,
        border: `1px solid ${styles.bd}`,
      }}
    >
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: styles.kicker,
        marginBottom: 6,
      }}>
        {styles.kickerText}
      </div>
      <div style={{
        fontSize: 15, fontWeight: 700, letterSpacing: '-0.005em',
        color: 'hsl(var(--rd-fg-primary))',
        marginBottom: 4,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 12.5, color: 'hsl(var(--rd-fg-secondary))',
        lineHeight: 1.55, marginBottom: 12,
      }}>
        {body}
      </div>
      <LiquidButton intent={tone === 'accent' ? 'primary' : 'ghost'} onClick={onClick} size="sm">
        {ctaLabel}
      </LiquidButton>
    </div>
  );
}

/* ─── Step 3 — Confirm ─────────────────────────────────────────────────── */

function ConfirmStep({ planName, renewsAt, onConfirmCancel, onBackToApp }) {
  return (
    <>
      <SpringReveal>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#F87171', fontWeight: 700,
        }}>
          Cancel · Step 3 of 3
        </div>
        <h1 style={{
          margin: '6px 0 0', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.02em', lineHeight: 1.15,
        }}>
          Confirm cancellation
        </h1>
      </SpringReveal>

      <SpringReveal delay={40}>
        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 14,
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.22)',
          }}
        >
          <div style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em',
            color: '#F87171', marginBottom: 8,
          }}>
            What happens when you cancel
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              `You keep ${planName} access until ${formatDate(renewsAt)}.`,
              'After that, your account drops to Free.',
              'Your data stays — workouts, food logs, photos, labs.',
              'Resubscribe anytime and pick up where you left off.',
            ].map((line, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span aria-hidden style={{
                  width: 5, height: 5, borderRadius: 9999,
                  background: '#F87171', marginTop: 7, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12.5, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5 }}>
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SpringReveal>

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          onClick={onConfirmCancel}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: 12,
            fontSize: 14, fontWeight: 800, letterSpacing: '-0.005em',
            color: '#F87171',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.30)',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          Yes, cancel my subscription
        </button>
        <LiquidButton intent="primary" onClick={onBackToApp} style={{ width: '100%' }}>
          Keep my subscription
        </LiquidButton>
      </div>
    </>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

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

function formatDate(input) {
  if (!input) return 'the end of your billing period';
  try {
    return new Date(input).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'the end of your billing period';
  }
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function CancelFlowRoute() {
  const navigate = useNavigate();

  const handleConfirmCancel = async () => {
    const platform = Capacitor.getPlatform();

    if (platform === 'ios' || platform === 'android') {
      // Apple and Google require the user to cancel inside the OS-level
      // subscription management UI; RC cannot cancel on their behalf.
      toast.message('Opening subscription settings', {
        description: 'Tap your plan, then Cancel Subscription.',
      });
      await openNativeSubscriptionManagement();
      navigate('/app/billing');
      return;
    }

    // Web: route to the Stripe customer portal (existing Edge Function).
    // The portal URL comes from `supabase/functions/create-customer-portal`,
    // which we assume has already been wired elsewhere in the app. For now
    // we emit a clear message and bounce back to billing; the Billing
    // Management page has a dedicated "Manage in Stripe" button.
    toast.message('Manage your subscription', {
      description: 'Head to Billing to open the Stripe customer portal.',
    });
    navigate('/app/billing');
  };

  return (
    <CancelFlow
      planName="Pro"
      renewsAt={null}
      onBack={() => navigate(-1)}
      onConfirmCancel={handleConfirmCancel}
      onKeepWithDiscount={() => {
        // TODO: apply an offer code via RevenueCat once the offer is set up
        // in the dashboard. Until then, show the honest state.
        toast.message('Discount offers coming soon', {
          description: 'We do not have an active offer in this region yet.',
        });
        navigate('/app/billing');
      }}
      onPause={() => {
        toast.message('Pause coming soon', {
          description: 'We are working on a pause option. Thanks for sticking with us.',
        });
        navigate('/app/billing');
      }}
    />
  );
}
