/**
 * OnboardingSummary — Step 9/10. "Your personalized plan is ready"
 * Ref: Cal AI reveal + Noom plan screen
 * The computed targets (calories/macros/protein, session volume, recovery goal)
 * are computed upstream and passed in — this component only RENDERS.
 */
import React from 'react';
import { OnboardingShell } from './OnboardingShell';
import { Glass } from '../lib/glass';

export default function OnboardingSummary({ targets = {}, onBack, onContinue }) {
  const {
    calories = 2200,
    protein = 165,
    carbs = 220,
    fat = 73,
    sessionMinutes = 50,
    weeklySessions = 4,
    recoveryTarget = 'Moderate 7-day average',
    paceWeekly = '0.5 kg / week',
  } = targets;

  return (
    <OnboardingShell
      step={9}
      total={10}
      title="Your plan is ready."
      subtitle="Every number below was calibrated from what you told us. Tap any card for the math."
      onBack={onBack}
      onContinue={onContinue}
      continueLabel="Looks good — continue"
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {/* Calorie + pace hero */}
        <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 20 }}>
          <Eyebrow>Daily target</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                color: 'hsl(var(--rd-fg-primary))',
              }}
            >
              {calories}
            </span>
            <span style={{ fontSize: 15, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>kcal / day</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'hsl(var(--rd-fg-secondary))' }}>
            Projected pace: <strong style={{ color: 'hsl(var(--rd-accent))' }}>{paceWeekly}</strong>
          </div>
        </Glass>

        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <MacroCard label="Protein" value={protein} unit="g" tint="rgba(0,255,255,0.18)" color="hsl(var(--rd-accent))" />
          <MacroCard label="Carbs"   value={carbs}   unit="g" tint="rgba(245,158,11,0.22)" color="#FBBF24" />
          <MacroCard label="Fat"     value={fat}     unit="g" tint="rgba(139,92,246,0.22)" color="#A78BFA" />
        </div>

        {/* Training summary */}
        <Glass radius="xl" style={{ padding: 20 }}>
          <Eyebrow>Training</Eyebrow>
          <Row label="Sessions / week" value={`${weeklySessions}×`} />
          <Row label="Typical session" value={`${sessionMinutes} min`} />
          <Row label="Recovery goal" value={recoveryTarget} last />
        </Glass>

        {/* Transparency footer */}
        <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.4, textAlign: 'center', paddingInline: 8 }}>
          Based on your age, sex, weight, activity level, and goal. You can re-run this any time from
          Settings → Targets.
        </div>
      </div>
    </OnboardingShell>
  );
}
export { OnboardingSummary };

function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'hsl(var(--rd-fg-muted))',
        fontWeight: 700,
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

function MacroCard({ label, value, unit, tint, color }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: tint,
          color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {value}
        <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginLeft: 2, fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBlock: 10,
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(var(--rd-fg-primary))', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
