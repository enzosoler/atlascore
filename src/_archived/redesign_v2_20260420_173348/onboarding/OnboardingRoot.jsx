/**
 * OnboardingRoot — intro / "let's set this up" screen. Step 0 of 9.
 * Ref: Noom intro + Cal AI opener
 */
import React from 'react';
import { OnboardingShell } from './OnboardingShell';
import { Glass } from '../lib/glass';

export default function OnboardingRoot({ onContinue, onBack }) {
  return (
    <OnboardingShell
      step={1}
      total={10}
      hideBack
      onBack={onBack}
      onContinue={onContinue}
      continueLabel="Let's begin"
    >
      <div style={{ display: 'grid', gap: 20, paddingTop: 8 }}>
        <Glass tint="accent" radius="xl" elevation="lg" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-accent))', marginBottom: 8 }}>
            What you get
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
            A plan built from your body, not a template.
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.5, margin: 0 }}>
            Nine quick questions calibrate your macros, workout intensity, recovery targets, and
            coach tone. Takes about 90 seconds.
          </p>
        </Glass>

        <div style={{ display: 'grid', gap: 10 }}>
          <Checklist
            items={[
              'Personalized macro + calorie targets',
              'Prescribed training load per day',
              'Recovery score calibrated to your baseline',
              'Your coach learns your preferences',
            ]}
          />
        </div>
      </div>
    </OnboardingShell>
  );
}
export { OnboardingRoot };

function Checklist({ items }) {
  return (
    <ul style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            color: 'hsl(var(--rd-fg-secondary))',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 22,
              height: 22,
              borderRadius: 9999,
              background: 'rgba(0,255,255,0.14)',
              color: 'hsl(var(--rd-accent))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
