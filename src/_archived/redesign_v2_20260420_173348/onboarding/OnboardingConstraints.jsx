/**
 * OnboardingConstraints — Step 8/10. Injuries, medical notes, pregnancy, meds.
 * Ref: Noom medical + Future coach intake
 */
import React, { useState } from 'react';
import { OnboardingShell } from './OnboardingShell';
import { Glass } from '../lib/glass';

const INJURIES = ['Knee', 'Lower back', 'Shoulder', 'Hip', 'Elbow', 'Wrist', 'Ankle', 'Neck'];
const MEDICAL = ['Hypertension', 'Diabetes (1 / 2)', 'Thyroid', 'PCOS', 'Heart condition'];

export default function OnboardingConstraints({ value = {}, onChange, onBack, onContinue }) {
  const [injuries, setInjuries] = useState(new Set(value.injuries || []));
  const [medical, setMedical] = useState(new Set(value.medical || []));
  const [pregnant, setPregnant] = useState(!!value.pregnant);
  const [notes, setNotes] = useState(value.notes || '');

  const commit = (patch) => {
    const next = { injuries: Array.from(injuries), medical: Array.from(medical), pregnant, notes, ...patch };
    onChange?.(next);
  };
  const toggleInjury = (i) => {
    const next = new Set(injuries);
    next.has(i) ? next.delete(i) : next.add(i);
    setInjuries(next);
    commit({ injuries: Array.from(next) });
  };
  const toggleMedical = (m) => {
    const next = new Set(medical);
    next.has(m) ? next.delete(m) : next.add(m);
    setMedical(next);
    commit({ medical: Array.from(next) });
  };

  return (
    <OnboardingShell
      step={8}
      total={10}
      title="Anything to flag?"
      subtitle="Tap what applies. Everything here stays private — used only to filter unsafe prescriptions."
      onBack={onBack}
      onContinue={onContinue}
      onSkip={() => onContinue?.()}
    >
      <Section title="Injuries">
        <ChipGroup items={INJURIES} active={injuries} onToggle={toggleInjury} tint="amber" />
      </Section>

      <Section title="Medical">
        <ChipGroup items={MEDICAL} active={medical} onToggle={toggleMedical} tint="rose" />
      </Section>

      <Section title="Pregnancy">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { v: false, label: 'No' },
            { v: true, label: 'Yes' },
          ].map((o) => {
            const active = pregnant === o.v;
            return (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => { setPregnant(o.v); commit({ pregnant: o.v }); }}
                style={{
                  height: 52,
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-primary))',
                  background: active
                    ? 'linear-gradient(180deg, rgba(0,255,255,0.14) 0%, rgba(0,255,255,0.06) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Anything else to share?">
        <Glass radius="lg" style={{ padding: 4 }}>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); commit({ notes: e.target.value }); }}
            placeholder="Medications, recent surgery, dietary needs the coach should know…"
            rows={4}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'hsl(var(--rd-fg-primary))',
              padding: 14,
              resize: 'none',
              fontSize: 15,
              lineHeight: 1.4,
              fontFamily: 'inherit',
            }}
          />
        </Glass>
      </Section>
    </OnboardingShell>
  );
}
export { OnboardingConstraints };

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

function ChipGroup({ items, active, onToggle, tint = 'accent' }) {
  const tintStyles = {
    accent: { on: { bg: 'rgba(0,255,255,0.14)', border: 'rgba(0,255,255,0.5)', color: 'hsl(var(--rd-accent))' } },
    amber:  { on: { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.5)', color: '#FBBF24' } },
    rose:   { on: { bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.5)', color: '#FB7185' } },
  }[tint];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((i) => {
        const on = active.has(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onToggle(i)}
            style={{
              height: 40,
              paddingInline: 14,
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 600,
              background: on ? tintStyles.on.bg : 'rgba(255,255,255,0.04)',
              border: on ? `1px solid ${tintStyles.on.border}` : '1px solid rgba(255,255,255,0.10)',
              color: on ? tintStyles.on.color : 'hsl(var(--rd-fg-secondary))',
              backdropFilter: 'blur(14px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            {i}
          </button>
        );
      })}
    </div>
  );
}
