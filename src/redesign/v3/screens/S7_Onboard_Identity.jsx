import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel,
} from '../lib/paper.jsx';
import { OnboardingCard, OnboardingHero, OnboardingPrimaryAction, OnboardingShell } from './onboardingShared.jsx';

function S7_Onboard_Identity({ dark = false, onContinue, onBack, onExit, onChange, value }) {
  const c = useACT(dark);
  const [sex, setSex] = React.useState(value?.sex || 'male');
  const [ageRaw, setAgeRaw] = React.useState(value?.age ? String(value.age) : '');
  const [heightCmRaw, setHeightCmRaw] = React.useState(value?.heightCm ? String(value.heightCm) : '');

  const age = parseInt(ageRaw) || 0;
  const heightCm = parseInt(heightCmRaw) || 0;
  const heightFt = Math.floor(heightCm / 30.48);
  const heightIn = Math.round((heightCm - heightFt * 30.48) / 2.54);
  const canContinue = age >= 13 && age <= 120 && heightCm >= 100 && heightCm <= 250;

  function emit(patch) {
    onChange?.({ sex, age: parseInt(ageRaw) || 0, heightCm: parseInt(heightCmRaw) || 0, ...patch });
  }

  return (
    <OnboardingShell
      dark={dark}
      step={1}
      total={10}
      onBack={onBack || false}
      onExit={onExit}
      eyebrow="Foundation"
      footer={(
        <OnboardingPrimaryAction
          dark={dark}
          onClick={canContinue ? onContinue : undefined}
          style={{ opacity: canContinue ? 1 : 0.42, pointerEvents: canContinue ? 'auto' : 'none' }}
        >
          Continue →
        </OnboardingPrimaryAction>
      )}
    >
      <OnboardingHero
        dark={dark}
        label="About you"
        title={<>Get the baseline right.</>}
        body="These inputs set the first draft of energy, recovery, and macro assumptions. They stay private."
        aside={(
          <>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>Use</ACLabel>
            <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.45, color: c.dim }}>Targets only. Never shared.</div>
          </>
        )}
      />

      <OnboardingCard dark={dark} accent>
        <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>Sex at birth</ACLabel>
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          {['male', 'female'].map((k) => {
            const on = sex === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => { setSex(k); emit({ sex: k }); }}
                style={{
                  flex: 1,
                  padding: '16px 0',
                  textAlign: 'center',
                  borderRadius: ACRadii.input,
                  background: on ? (dark ? 'rgba(239,233,218,0.92)' : 'rgba(10,10,10,0.92)') : 'transparent',
                  color: on ? c.bg : c.fg,
                  boxShadow: on && !dark ? '0 8px 18px rgba(10,10,10,0.08)' : 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  border: `1px solid ${on ? 'transparent' : c.hair}`,
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
      </OnboardingCard>

      <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
        <OnboardingCard dark={dark}>
          <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>Age</ACLabel>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="28"
              value={ageRaw}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                setAgeRaw(v);
                emit({ age: parseInt(v) || 0 });
              }}
              style={{
                fontFamily: ACFonts.display,
                fontSize: 44,
                fontWeight: 700,
                color: c.fg,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: 92,
                padding: 0,
                letterSpacing: -1.2,
                fontVariantNumeric: 'tabular-nums',
              }}
            />
            <ACLabel size={12} color={c.dim} style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>years</ACLabel>
          </div>
        </OnboardingCard>

        <OnboardingCard dark={dark}>
          <ACLabel size={11} color={c.dim} style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.6 }}>Height</ACLabel>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="180"
                value={heightCmRaw}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setHeightCmRaw(v);
                  emit({ heightCm: parseInt(v) || 0 });
                }}
                style={{
                  fontFamily: ACFonts.display,
                  fontSize: 44,
                  fontWeight: 700,
                  color: c.fg,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: 92,
                  padding: 0,
                  letterSpacing: -1.2,
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
              <span style={{ fontSize: 12, color: c.dim, fontFamily: ACFonts.mono, textTransform: 'uppercase' }}>cm</span>
            </div>
            {heightCm >= 100 ? (
              <ACLabel size={12} color={c.accent} style={{ fontFamily: ACFonts.mono }}>
                {heightFt}'{heightIn}"
              </ACLabel>
            ) : null}
          </div>
        </OnboardingCard>
      </div>
    </OnboardingShell>
  );
}

export default S7_Onboard_Identity;
