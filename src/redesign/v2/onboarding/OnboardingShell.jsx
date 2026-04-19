/**
 * OnboardingShell — shared layout for every onboarding step.
 * Ref: Cal AI / Noom onboarding flow
 *
 * Header (fixed, blurred): back arrow + progress bar + step counter
 * Body: scrollable, centered, 560px max reading column
 * Footer (fixed, blurred): primary CTA ("Continue") + optional skip
 *
 * Respects safe-area on both ends, never collides with iOS chrome.
 */
import React from 'react';
import { LiquidButton, LiquidProgress, SpringReveal } from '../lib/glass';

export default function OnboardingShell({
  step = 1,
  total = 9,
  title,
  subtitle,
  onBack,
  onContinue,
  onSkip,
  continueLabel = 'Continue',
  continueDisabled = false,
  continueLoading = false,
  hideBack = false,
  children,
}) {
  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        position: 'relative',
      }}
    >
      {/* Ambient gradient — very subtle */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(70% 50% at 50% 0%, rgba(0,255,255,0.06) 0%, transparent 55%)',
        }}
      />

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: 'rgba(5,7,10,0.75)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'grid',
            gridTemplateColumns: '44px 1fr 44px',
            alignItems: 'center',
            paddingInline: 'max(12px, env(safe-area-inset-left))',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            disabled={hideBack}
            aria-label="Go back"
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: 'transparent',
              border: 'none',
              color: hideBack ? 'transparent' : 'hsl(var(--rd-fg-primary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
              cursor: hideBack ? 'default' : 'pointer',
              opacity: hideBack ? 0 : 1,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingInline: 4 }}>
            <LiquidProgress value={step} max={total} height={3} />
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'hsl(var(--rd-fg-muted))',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Step {step} of {total}
            </div>
          </div>

          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              style={{
                height: 44,
                padding: '0 12px',
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--rd-fg-muted))',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Skip
            </button>
          ) : (
            <div />
          )}
        </div>
      </header>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: 'calc(env(safe-area-inset-top) + 72px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 104px)',
          paddingInline: 'max(20px, env(safe-area-inset-left))',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {(title || subtitle) && (
            <SpringReveal delay={40}>
              <div style={{ marginBottom: 28 }}>
                {title && (
                  <h1
                    style={{
                      fontSize: 30,
                      lineHeight: 1.12,
                      fontWeight: 700,
                      letterSpacing: '-0.025em',
                      margin: 0,
                    }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: 15,
                      lineHeight: 1.45,
                      color: 'hsl(var(--rd-fg-secondary))',
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </SpringReveal>
          )}

          <SpringReveal delay={120}>{children}</SpringReveal>
        </div>
      </main>

      {/* ─── Footer CTA ─────────────────────────────────────────────── */}
      <footer
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
        <div
          style={{
            padding: '12px max(16px, env(safe-area-inset-left)) 12px max(16px, env(safe-area-inset-right))',
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          <LiquidButton
            intent="primary"
            size="xl"
            block
            disabled={continueDisabled}
            loading={continueLoading}
            onClick={onContinue}
          >
            {continueLabel}
          </LiquidButton>
        </div>
      </footer>
    </div>
  );
}

export { OnboardingShell };
