/**
 * OnboardingPaywall — Step 10/10. Trial gate.
 * Ref: Duolingo paywall + Cal AI trial timeline + Blinkist urgency
 *
 * Platform-aware: web → Stripe checkout; native → RevenueCat.
 * Uses onStartTrial({ planId }) — consumer supplies the real flow.
 */
import React, { useState } from 'react';
import { LiquidButton, Glass, LiquidProgress } from '../lib/glass';

const PLANS = [
  {
    id: 'weekly',
    title: 'Weekly',
    price: '$4.99',
    unit: '/ week',
    sub: 'Flexibility first',
    badge: null,
  },
  {
    id: 'annual',
    title: 'Annual',
    price: '$59.99',
    unit: '/ year',
    sub: 'Just $1.15 / week · save 77%',
    badge: 'BEST VALUE',
    recommended: true,
  },
];

export default function OnboardingPaywall({ onStartTrial, onRestore, onSkip, platform = 'web' }) {
  const [planId, setPlanId] = useState('annual');

  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 140px)',
        paddingInline: 'max(20px, env(safe-area-inset-left))',
      }}
    >
      {/* Aurora */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 0%, rgba(0,255,255,0.10) 0%, transparent 60%), radial-gradient(50% 40% at 50% 100%, rgba(201,169,106,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Close X / progress top */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <LiquidProgress value={10} max={10} height={3} color="hsl(var(--rd-accent))" style={{ flex: 1, marginRight: 12 }} />
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--rd-fg-muted))',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Not now
            </button>
          )}
        </div>

        <h1
          style={{
            fontSize: 34,
            lineHeight: 1.1,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          Start your 7-day free trial.
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 16,
            lineHeight: 1.45,
            color: 'hsl(var(--rd-fg-secondary))',
          }}
        >
          Full access to AI coach, meal plans, labs, and protocols. Cancel anytime in one tap.
        </p>

        {/* Trial timeline (3-step) */}
        <Glass radius="xl" style={{ padding: 20, marginTop: 24 }}>
          <TimelineRow
            number="1"
            title="Today"
            sub="Get full access. No charge until day 7."
            color="hsl(var(--rd-accent))"
          />
          <TimelineRow
            number="2"
            title="Day 5 · We email you"
            sub="Reminder before the trial ends. Cancel or keep."
            color="hsl(var(--rd-fg-muted))"
          />
          <TimelineRow
            number="3"
            title="Day 7 · Trial ends"
            sub="You're charged only if you didn't cancel."
            color="hsl(var(--rd-fg-muted))"
            last
          />
        </Glass>

        {/* Plan picker */}
        <div style={{ display: 'grid', gap: 10, marginTop: 24 }}>
          {PLANS.map((p) => {
            const active = planId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                aria-pressed={active}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 18px',
                  borderRadius: 18,
                  position: 'relative',
                  background: active
                    ? 'linear-gradient(180deg, rgba(0,255,255,0.14) 0%, rgba(0,255,255,0.06) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(18px) saturate(1.6)',
                  WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
                  color: 'hsl(var(--rd-fg-primary))',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: active
                    ? '0 8px 22px -6px rgba(0,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.14)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  transition: 'background 220ms, border-color 220ms, box-shadow 220ms',
                }}
              >
                {p.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      padding: '3px 10px',
                      borderRadius: 9999,
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      fontWeight: 700,
                      background: 'hsl(var(--rd-accent))',
                      color: 'hsl(var(--rd-fg-on-accent))',
                    }}
                  >
                    {p.badge}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.title}</div>
                    <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>{p.sub}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {p.price}
                    </div>
                    <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>{p.unit}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Social proof strip */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 13,
            color: 'hsl(var(--rd-fg-muted))',
          }}
        >
          <Stars />
          <span>4.9 · 12k+ reviews</span>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: 'rgba(5,7,10,0.85)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '12px max(16px, env(safe-area-inset-left))' }}>
          <LiquidButton
            intent="primary"
            size="xl"
            block
            onClick={() => onStartTrial?.({ planId })}
          >
            Start 7-day free trial
          </LiquidButton>
          <div
            style={{
              textAlign: 'center',
              marginTop: 8,
              fontSize: 11,
              color: 'hsl(var(--rd-fg-muted))',
            }}
          >
            {platform === 'web'
              ? 'Secure checkout by Stripe · Cancel anytime'
              : 'Billed through Apple · Cancel anytime in Settings'}
            {' · '}
            <button
              type="button"
              onClick={onRestore}
              style={{ color: 'hsl(var(--rd-fg-secondary))', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}
            >
              Restore purchases
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export { OnboardingPaywall };

function TimelineRow({ number, title, sub, color, last }) {
  return (
    <div style={{ display: 'flex', gap: 12, paddingBlock: 8, position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${color}`,
            color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            zIndex: 1,
          }}
        >
          {number}
        </div>
        {!last && (
          <div
            style={{
              position: 'absolute',
              top: 28,
              bottom: -8,
              width: 2,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
        )}
      </div>
      <div style={{ paddingTop: 3, paddingBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Stars() {
  return (
    <span aria-hidden style={{ color: 'hsl(var(--rd-premium))', letterSpacing: 1 }}>
      ★★★★★
    </span>
  );
}
