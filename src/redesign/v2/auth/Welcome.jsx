/**
 * Welcome — first screen a brand-new user sees (before onboarding, before auth).
 * Ref: Duolingo welcome + Superhuman first-open + Cal AI hero.
 *
 * Layout:
 *  - Full-bleed obsidian with animated heartbeat arc behind the mark
 *  - Oversized wordmark + 1-line value prop
 *  - 3 micro-benefits (icon + label)
 *  - Primary CTA "Get started" + secondary "I already have an account"
 *  - Tiny legal link at the bottom, respects safe-area
 */
import React from 'react';
import { SafeScreen, LiquidButton, SpringReveal } from '../lib/glass';

export default function Welcome({
  onGetStarted,
  onSignIn,
  appName = 'atlas.core',
  tagline = 'Measure. Train. Recover.',
  valueProp = 'Your body, quantified. Your training, prescribed. Your recovery, earned.',
}) {
  return (
    <SafeScreen paddingX={24} scrollable={false}>
      {/* Ambient cyan aurora — sits behind everything */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(0,255,255,0.10) 0%, transparent 60%), radial-gradient(50% 50% at 80% 90%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight:
            'calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px)',
        }}
      >
        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <SpringReveal delay={80}>
            <div style={{ marginBottom: 20 }}>
              <HeartbeatHero />
            </div>
          </SpringReveal>

          <SpringReveal delay={180}>
            <h1
              style={{
                fontSize: 44,
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Welcome to{' '}
              <span style={{ color: 'hsl(var(--rd-fg-primary))' }}>
                atlas<span style={{ color: 'hsl(var(--rd-accent))' }}>.</span>core
              </span>
            </h1>
          </SpringReveal>

          <SpringReveal delay={260}>
            <p
              style={{
                marginTop: 14,
                fontSize: 17,
                lineHeight: 1.45,
                color: 'hsl(var(--rd-fg-secondary))',
                letterSpacing: '-0.01em',
                maxWidth: 520,
              }}
            >
              {valueProp}
            </p>
          </SpringReveal>

          <SpringReveal delay={360}>
            <div style={{ marginTop: 32, display: 'grid', gap: 12 }}>
              <BenefitRow
                icon={<IconPulse />}
                title="Daily readiness"
                sub="Whoop-grade recovery score, from your real data."
              />
              <BenefitRow
                icon={<IconBar />}
                title="AI meal photos"
                sub="Snap a plate, see macros. Confirm in one tap."
              />
              <BenefitRow
                icon={<IconSpark />}
                title="Coach that learns you"
                sub="Prescribed workouts, never generic."
              />
            </div>
          </SpringReveal>
        </div>

        {/* CTA stack */}
        <SpringReveal delay={480} className="w-full">
          <div
            style={{
              display: 'grid',
              gap: 10,
              paddingTop: 20,
              paddingBottom: 8,
            }}
          >
            <LiquidButton intent="primary" size="xl" block onClick={onGetStarted}>
              Get started
            </LiquidButton>
            <LiquidButton intent="ghost" size="lg" block onClick={onSignIn}>
              I already have an account
            </LiquidButton>
          </div>
        </SpringReveal>

        <SpringReveal delay={560}>
          <div
            style={{
              textAlign: 'center',
              marginTop: 4,
              fontSize: 11,
              color: 'hsl(var(--rd-fg-muted))',
              letterSpacing: '0.02em',
            }}
          >
            By continuing you agree to our{' '}
            <a href="/terms" style={{ color: 'hsl(var(--rd-fg-secondary))', textDecoration: 'underline' }}>
              Terms
            </a>{' '}
            and{' '}
            <a href="/privacy" style={{ color: 'hsl(var(--rd-fg-secondary))', textDecoration: 'underline' }}>
              Privacy
            </a>
            .
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { Welcome };

/* ─── Hero heartbeat mark ───────────────────────────────────────────────── */
function HeartbeatHero() {
  return (
    <svg width="96" height="48" viewBox="0 0 200 100" fill="none" aria-hidden>
      <path
        d="M20 50H50L57 62L68 24L80 62L88 50H104L140 32"
        stroke="hsl(var(--rd-fg-primary))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M133 32H140V40"
        stroke="hsl(var(--rd-accent))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Benefit row ───────────────────────────────────────────────────────── */
function BenefitRow({ icon, title, sub }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 2px',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,255,255,0.08)',
          border: '1px solid rgba(0,255,255,0.22)',
          color: 'hsl(var(--rd-accent))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'hsl(var(--rd-fg-primary))',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'hsl(var(--rd-fg-muted))',
            marginTop: 1,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
const IconPulse = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path {...stroke} d="M3 12h4l2 6 4-12 2 6h6" />
  </svg>
);
const IconBar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect {...stroke} x="3" y="14" width="4" height="7" rx="1" />
    <rect {...stroke} x="10" y="9" width="4" height="12" rx="1" />
    <rect {...stroke} x="17" y="4" width="4" height="17" rx="1" />
  </svg>
);
const IconSpark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path {...stroke} d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);
