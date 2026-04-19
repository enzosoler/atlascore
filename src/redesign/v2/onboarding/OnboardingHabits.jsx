/**
 * OnboardingHabits — Step 7/10. Sleep, hydration, daily steps target.
 * Ref: Noom habit loop + Oura sleep goal
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { ChoicePill, Glass } from '../lib/glass';

const SLEEP = [
  { id: 'lt6',  label: '< 6 hours',   description: 'Often sleep-deprived' },
  { id: '6_7',  label: '6–7 hours',   description: 'Usually enough, not always' },
  { id: '7_8',  label: '7–8 hours',   description: 'Pretty consistent' },
  { id: 'gt8',  label: '8+ hours',    description: 'Sleep priority on lock' },
];

const STEPS = [
  { id: '5k',  label: '5k steps',  description: 'Mostly seated day' },
  { id: '8k',  label: '8k steps',  description: 'Light walking' },
  { id: '10k', label: '10k steps', description: 'Active day' },
  { id: '12k', label: '12k+ steps',description: 'Very active job or commute' },
];

export default function OnboardingHabits({ value = {}, onChange, onBack, onContinue }) {
  const [sleep, setSleep] = useState(value.sleep || null);
  const [steps, setSteps] = useState(value.steps || null);
  const [waterL, setWaterL] = useState(value.waterL ?? 2.5);

  const commit = (patch) => {
    const next = { sleep, steps, waterL, ...patch };
    onChange?.(next);
  };

  const ready = !!sleep && !!steps;

  return (
    <OnboardingShell
      step={7}
      total={10}
      title="A few daily habits."
      subtitle="We anchor your recovery score and coach nudges on these."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!ready}
    >
      <Section title="Typical sleep">
        <div style={{ display: 'grid', gap: 10 }}>
          {SLEEP.map((s) => (
            <ChoicePill
              key={s.id}
              selected={sleep === s.id}
              onClick={() => { setSleep(s.id); commit({ sleep: s.id }); }}
              label={s.label}
              description={s.description}
            />
          ))}
        </div>
      </Section>

      <Section title="Daily steps goal">
        <div style={{ display: 'grid', gap: 10 }}>
          {STEPS.map((s) => (
            <ChoicePill
              key={s.id}
              selected={steps === s.id}
              onClick={() => { setSteps(s.id); commit({ steps: s.id }); }}
              label={s.label}
              description={s.description}
            />
          ))}
        </div>
      </Section>

      <Section title="Daily water target">
        <Glass radius="xl" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))' }}>Target</span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
                color: 'hsl(var(--rd-fg-primary))',
              }}
            >
              {waterL.toFixed(1)} <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500 }}>L</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={waterL}
            onChange={(e) => { const v = Number(e.target.value); setWaterL(v); commit({ waterL: v }); }}
            style={{
              width: '100%',
              height: 4,
              accentColor: 'hsl(var(--rd-accent))',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>
            <span>1L</span>
            <span>3L</span>
            <span>5L</span>
          </div>
        </Glass>
      </Section>
    </OnboardingShell>
  );
}
export { OnboardingHabits };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'hsl(var(--rd-fg-muted))',
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
