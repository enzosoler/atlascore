/**
 * OnboardingWorkout — Step 6/10. Workout experience + frequency + equipment access.
 * Ref: Strong (experience) + Fitbod (equipment picker) + Hevy (frequency)
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { ChoicePill } from '../lib/glass';

const EXPERIENCE = [
  { id: 'beginner',      label: 'Beginner',       description: '< 6 months lifting consistently' },
  { id: 'intermediate',  label: 'Intermediate',   description: '6 months – 2 years' },
  { id: 'advanced',      label: 'Advanced',       description: '2+ years, solid form, near or at plateaus' },
];

const FREQUENCY = [
  { id: '2x', label: '2× / week' },
  { id: '3x', label: '3× / week' },
  { id: '4x', label: '4× / week' },
  { id: '5x', label: '5× / week' },
  { id: '6x', label: '6× / week' },
];

const EQUIPMENT = ['Full gym', 'Home gym', 'Dumbbells only', 'Bodyweight', 'Resistance bands', 'Cables / machines', 'Barbell + rack'];

export default function OnboardingWorkout({ value = {}, onChange, onBack, onContinue }) {
  const [exp, setExp] = useState(value.experience || null);
  const [freq, setFreq] = useState(value.frequency || null);
  const [equip, setEquip] = useState(new Set(value.equipment || []));

  const commit = (patch) => {
    const next = { experience: exp, frequency: freq, equipment: Array.from(equip), ...patch };
    onChange?.(next);
  };
  const toggleEquip = (e) => {
    const next = new Set(equip);
    next.has(e) ? next.delete(e) : next.add(e);
    setEquip(next);
    commit({ equipment: Array.from(next) });
  };

  const ready = !!exp && !!freq && equip.size > 0;

  return (
    <OnboardingShell
      step={6}
      total={10}
      title="Your training context."
      subtitle="Defines starting volume and which exercises get prescribed."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!ready}
    >
      <Section title="Experience">
        <div style={{ display: 'grid', gap: 10 }}>
          {EXPERIENCE.map((e) => (
            <ChoicePill
              key={e.id}
              selected={exp === e.id}
              onClick={() => { setExp(e.id); commit({ experience: e.id }); }}
              label={e.label}
              description={e.description}
            />
          ))}
        </div>
      </Section>

      <Section title="Frequency">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {FREQUENCY.map((f) => {
            const active = freq === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => { setFreq(f.id); commit({ frequency: f.id }); }}
                style={{
                  height: 56,
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  background: active
                    ? 'linear-gradient(180deg, rgba(0,255,255,0.22) 0%, rgba(0,255,255,0.10) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))',
                  backdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 14px -4px rgba(0,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.14)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Equipment available">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EQUIPMENT.map((e) => {
            const active = equip.has(e);
            return (
              <button
                key={e}
                type="button"
                onClick={() => toggleEquip(e)}
                style={{
                  height: 40,
                  paddingInline: 14,
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 600,
                  background: active
                    ? 'linear-gradient(180deg, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.08) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.10)',
                  color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))',
                  backdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background 200ms, border-color 200ms, color 200ms',
                }}
              >
                {e}
              </button>
            );
          })}
        </div>
      </Section>
    </OnboardingShell>
  );
}
export { OnboardingWorkout };

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
