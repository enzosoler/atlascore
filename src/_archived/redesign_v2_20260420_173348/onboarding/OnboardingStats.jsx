/**
 * OnboardingStats — Step 4/10. Height, current weight, target weight, DOB, sex.
 * Ref: Cal AI stats screen (big numeric inputs, unit toggle, DOB wheel-ish)
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { Glass, BigNumberInput, ChoicePill } from '../lib/glass';

export default function OnboardingStats({ value = {}, onChange, onBack, onContinue }) {
  const [state, setState] = useState({
    unit: value.unit || 'metric', // 'metric' | 'imperial'
    heightCm: value.heightCm || '',
    weightKg: value.weightKg || '',
    targetKg: value.targetKg || '',
    sex: value.sex || '',
    dob: value.dob || '',
    ...value,
  });
  const set = (patch) => {
    const next = { ...state, ...patch };
    setState(next);
    onChange?.(next);
  };

  const ready =
    !!state.sex &&
    !!state.dob &&
    Number(state.heightCm) > 0 &&
    Number(state.weightKg) > 0 &&
    Number(state.targetKg) > 0;

  return (
    <OnboardingShell
      step={4}
      total={10}
      title="Your body, in numbers."
      subtitle="Used to calibrate macros, caloric burn, and strength baseline. Nothing is shared."
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!ready}
    >
      <div style={{ display: 'grid', gap: 16 }}>
        <UnitToggle value={state.unit} onChange={(u) => set({ unit: u })} />

        <Glass radius="xl" style={{ padding: 20 }}>
          <FieldLabel>Height</FieldLabel>
          <BigNumberInput
            value={state.heightCm}
            onChange={(v) => set({ heightCm: v })}
            suffix={state.unit === 'metric' ? 'cm' : 'in'}
            placeholder={state.unit === 'metric' ? '175' : '69'}
          />
        </Glass>

        <Glass radius="xl" style={{ padding: 20 }}>
          <FieldLabel>Current weight</FieldLabel>
          <BigNumberInput
            value={state.weightKg}
            onChange={(v) => set({ weightKg: v })}
            suffix={state.unit === 'metric' ? 'kg' : 'lb'}
            placeholder={state.unit === 'metric' ? '72' : '160'}
            autoFocus={false}
          />
        </Glass>

        <Glass radius="xl" style={{ padding: 20 }}>
          <FieldLabel>Target weight</FieldLabel>
          <BigNumberInput
            value={state.targetKg}
            onChange={(v) => set({ targetKg: v })}
            suffix={state.unit === 'metric' ? 'kg' : 'lb'}
            placeholder={state.unit === 'metric' ? '68' : '150'}
            autoFocus={false}
          />
        </Glass>

        <div style={{ display: 'grid', gap: 10 }}>
          <FieldLabel>Biological sex <span style={{ color: 'hsl(var(--rd-fg-muted))', fontWeight: 400 }}>(for metabolic calc)</span></FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ChoicePill
              selected={state.sex === 'male'}
              onClick={() => set({ sex: 'male' })}
              label="Male"
            />
            <ChoicePill
              selected={state.sex === 'female'}
              onClick={() => set({ sex: 'female' })}
              label="Female"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <FieldLabel>Date of birth</FieldLabel>
          <Glass radius="lg" style={{ padding: 4 }}>
            <input
              type="date"
              value={state.dob}
              onChange={(e) => set({ dob: e.target.value })}
              style={{
                width: '100%',
                height: 52,
                padding: '0 16px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'hsl(var(--rd-fg-primary))',
                fontSize: 16,
                colorScheme: 'dark',
              }}
            />
          </Glass>
        </div>
      </div>
    </OnboardingShell>
  );
}
export { OnboardingStats };

function FieldLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'hsl(var(--rd-fg-muted))',
        fontWeight: 600,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function UnitToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        padding: 4,
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {['metric', 'imperial'].map((u) => {
        const active = value === u;
        return (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            style={{
              height: 40,
              borderRadius: 9999,
              border: 'none',
              background: active ? 'hsl(var(--rd-accent))' : 'transparent',
              color: active ? 'hsl(var(--rd-fg-on-accent))' : 'hsl(var(--rd-fg-secondary))',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '-0.01em',
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'background 220ms, color 220ms',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {u}
          </button>
        );
      })}
    </div>
  );
}
