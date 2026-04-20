/**
 * ComingSoon — Liquid Glass placeholder for routes that aren't v2-redesigned yet.
 * Rendered instead of the old page code, so no "Alex Johnson" mock data leaks
 * into any route that Enzo hasn't explicitly rebuilt.
 */
import React from 'react';
import { Glass, LiquidButton, SafeScreen, SpringReveal } from '../lib/glass';

export default function ComingSoon({ routeName = 'This screen', onBack, onGoHome }) {
  return (
    <SafeScreen paddingX={20}>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(0,255,255,0.08) 0%, transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 520,
          margin: '0 auto',
          minHeight:
            'calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 24,
        }}
      >
        <SpringReveal delay={40}>
          <Glass tint="accent" radius="pill" style={{ padding: '8px 16px', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: 'hsl(var(--rd-accent))', boxShadow: '0 0 6px hsl(var(--rd-accent))' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-accent))' }}>
              In redesign
            </span>
          </Glass>
        </SpringReveal>

        <SpringReveal delay={120}>
          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'hsl(var(--rd-fg-primary))',
            }}
          >
            {routeName} is being rebuilt.
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
              maxWidth: 420,
              marginInline: 'auto',
            }}
          >
            Part of the v2 redesign. Liquid Glass UI across all 122 surfaces is
            landing screen by screen — your previous data is safe and still in the
            database.
          </p>
        </SpringReveal>

        <SpringReveal delay={200}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {onGoHome && (
              <LiquidButton intent="primary" size="lg" onClick={onGoHome}>
                Go home
              </LiquidButton>
            )}
            {onBack && (
              <LiquidButton intent="neutral" size="lg" onClick={onBack}>
                Back
              </LiquidButton>
            )}
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}
export { ComingSoon };
