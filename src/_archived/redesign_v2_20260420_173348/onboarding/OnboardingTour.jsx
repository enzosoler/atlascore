/**
 * OnboardingTour — post-paywall guided tour. 3 slides + finish.
 * Ref: Duolingo tour + Cal AI post-onboarding overlay
 */
import React, { useState } from 'react';
import { LiquidButton, SpringReveal } from '../lib/glass';

const SLIDES = [
  {
    title: 'Log without thinking.',
    sub: 'Snap a meal photo. Scan a barcode. Or say "2 eggs and toast" — we handle the rest.',
    visual: 'photo',
  },
  {
    title: 'Your coach is always here.',
    sub: 'Ask anything. It knows your plan, sleep, training, and what you ate yesterday.',
    visual: 'chat',
  },
  {
    title: 'Recovery is earned, not guessed.',
    sub: 'Every morning you get a score: what to push, what to hold, when to rest.',
    visual: 'ring',
  },
];

export default function OnboardingTour({ onFinish }) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'hsl(var(--rd-bg-app))',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'calc(env(safe-area-inset-top) + 40px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
        paddingInline: 'max(24px, env(safe-area-inset-left))',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(60% 50% at 50% 20%, rgba(0,255,255,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Visual */}
      <SpringReveal key={`v-${i}`} delay={20} className="flex-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <TourVisual kind={slide.visual} />
      </SpringReveal>

      {/* Copy */}
      <SpringReveal key={`t-${i}`} delay={60} style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.12,
            margin: 0,
            textAlign: 'center',
          }}
        >
          {slide.title}
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 16,
            lineHeight: 1.45,
            color: 'hsl(var(--rd-fg-secondary))',
            textAlign: 'center',
            maxWidth: 440,
            marginInline: 'auto',
          }}
        >
          {slide.sub}
        </p>
      </SpringReveal>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, position: 'relative', zIndex: 1 }}>
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            aria-hidden
            style={{
              width: idx === i ? 22 : 6,
              height: 6,
              borderRadius: 9999,
              background: idx === i ? 'hsl(var(--rd-accent))' : 'rgba(255,255,255,0.18)',
              transition: 'all 260ms cubic-bezier(.22,1,.36,1)',
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'grid', gap: 10, marginTop: 28, position: 'relative', zIndex: 1 }}>
        <LiquidButton
          intent="primary"
          size="xl"
          block
          onClick={() => (last ? onFinish?.() : setI(i + 1))}
        >
          {last ? 'Open my dashboard' : 'Next'}
        </LiquidButton>
        {!last && (
          <LiquidButton intent="ghost" size="md" block onClick={() => onFinish?.()}>
            Skip tour
          </LiquidButton>
        )}
      </div>
    </div>
  );
}
export { OnboardingTour };

function TourVisual({ kind }) {
  const common = { width: 180, height: 180, position: 'relative' };
  if (kind === 'photo') {
    return (
      <div style={common}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: 'linear-gradient(180deg, rgba(0,255,255,0.24), rgba(0,255,255,0.04))', boxShadow: '0 20px 60px -10px rgba(0,255,255,0.3)' }} />
        <div style={{ position: 'absolute', inset: 18, borderRadius: 20, background: 'rgba(5,7,10,0.6)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="hsl(var(--rd-accent))" strokeWidth="1.75" />
            <circle cx="12" cy="13" r="3.5" stroke="hsl(var(--rd-accent))" strokeWidth="1.75" />
            <path d="M8 6l1.5-2h5L16 6" stroke="hsl(var(--rd-accent))" strokeWidth="1.75" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  }
  if (kind === 'chat') {
    return (
      <div style={{ ...common, display: 'grid', gap: 8, alignContent: 'center', padding: 20 }}>
        <div style={{ justifySelf: 'start', background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '8px 12px', fontSize: 13, color: 'hsl(var(--rd-fg-primary))' }}>How was my sleep?</div>
        <div style={{ justifySelf: 'end', background: 'linear-gradient(180deg, rgba(139,92,246,0.28), rgba(139,92,246,0.14))', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '18px 18px 4px 18px', padding: '8px 12px', fontSize: 13, color: '#fff', maxWidth: 140 }}>7h 12m · good recovery</div>
      </div>
    );
  }
  // ring
  return (
    <div style={common}>
      <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }} aria-hidden>
        <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke="hsl(var(--rd-health-excellent))"
          strokeWidth="10"
          strokeDasharray="314"
          strokeDashoffset="62"
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 60 60)"
          style={{ filter: 'drop-shadow(0 0 8px hsl(var(--rd-health-excellent)/.5))' }}
        />
        <text x="60" y="58" textAnchor="middle" fontSize="28" fontWeight="700" fill="hsl(var(--rd-fg-primary))" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          82
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="10" fill="hsl(var(--rd-fg-muted))" style={{ letterSpacing: '0.12em' }}>
          RECOVERY
        </text>
      </svg>
    </div>
  );
}
