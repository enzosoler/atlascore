/**
 * SmartOnboarding — adaptive flow for returning users / partial profiles.
 * Ref: Linear adaptive setup — tells the user what's missing, lets them fix it fast.
 */
import React from 'react';
import { OnboardingShell } from './OnboardingShell';
import { Glass } from '../lib/glass';

export default function SmartOnboarding({
  missing = [
    { key: 'goal',     label: 'Primary goal',        route: '/onboarding/goal' },
    { key: 'stats',    label: 'Height / weight',     route: '/onboarding/stats' },
    { key: 'workout',  label: 'Training context',    route: '/onboarding/workout' },
  ],
  completed = [],
  onJumpTo,
  onContinue,
  onBack,
}) {
  const total = missing.length + completed.length;
  const step = completed.length + 1;
  return (
    <OnboardingShell
      step={Math.min(step, total)}
      total={Math.max(total, 1)}
      title="Welcome back."
      subtitle="A few things left to personalize your plan. Pick up where you left off."
      onBack={onBack}
      onContinue={onContinue}
      continueLabel="Continue"
      continueDisabled={missing.length > 0}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {completed.map((c) => (
          <Row key={c.key} label={c.label} state="done" />
        ))}
        {missing.map((m) => (
          <Row key={m.key} label={m.label} state="todo" onClick={() => onJumpTo?.(m.route)} />
        ))}
      </div>

      {missing.length === 0 && (
        <Glass tint="success" radius="xl" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>You're all set.</div>
          <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))' }}>
            Tap Continue to open your dashboard.
          </div>
        </Glass>
      )}
    </OnboardingShell>
  );
}
export { SmartOnboarding };

function Row({ label, state, onClick }) {
  const done = state === 'done';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={done}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 14,
        background: done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
        border: done ? '1px solid rgba(16,185,129,0.22)' : '1px solid rgba(255,255,255,0.10)',
        color: 'hsl(var(--rd-fg-primary))',
        width: '100%',
        textAlign: 'left',
        cursor: done ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: 9999,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)',
          color: done ? '#34D399' : 'hsl(var(--rd-fg-muted))',
          border: done ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</span>
      {!done && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M9 6l6 6-6 6" stroke="hsl(var(--rd-fg-muted))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
