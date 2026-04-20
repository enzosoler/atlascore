/**
 * BodyCheckIn — weekly body/state check-in form.
 * Ref: Whoop journal + Oura tags + Future coach intake.
 *
 * Fields (all optional, takes 30s):
 *  - Mood emoji picker (4 options)
 *  - Sleep quality 1-5 stars
 *  - Soreness slider 0-10
 *  - Stress slider 0-10
 *  - Energy slider 0-10
 *  - Measurements quick grid (waist/chest/arms)
 *  - Notes textarea
 *  - Big Save CTA
 */
import React, { useState } from 'react';
import { SafeScreen, Glass, LiquidButton, SpringReveal } from '../lib/glass';

const MOODS = [
  { v: 'great', emoji: '😄', label: 'Great' },
  { v: 'good',  emoji: '🙂', label: 'Good' },
  { v: 'ok',    emoji: '😐', label: 'OK' },
  { v: 'low',   emoji: '😔', label: 'Low' },
];

export default function BodyCheckIn({
  onCancel,
  onSave,
}) {
  const [mood, setMood] = useState(null);
  const [sleepQuality, setSleepQuality] = useState(null);
  const [soreness, setSoreness] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [measurements, setMeasurements] = useState({ waist: '', chest: '', leftArm: '', rightArm: '' });
  const [notes, setNotes] = useState('');

  const setMeasure = (k, v) => setMeasurements((m) => ({ ...m, [k]: v.replace(/[^\d.,]/g, '').replace(',', '.') }));

  const canSave = mood || sleepQuality != null;

  const result = {
    mood,
    sleepQuality,
    soreness,
    stress,
    energy,
    measurements: Object.fromEntries(Object.entries(measurements).map(([k, v]) => [k, v ? Number(v) : null])),
    notes,
    at: new Date().toISOString(),
  };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      {/* Back */}
      <button
        type="button"
        onClick={onCancel}
        aria-label="Back"
        style={{
          position: 'fixed', top: 'calc(env(safe-area-inset-top) + 14px)', left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 45,
          width: 36, height: 36, borderRadius: 9999,
          background: 'rgba(10,14,20,0.55)',
          backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
      </button>

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
          Weekly check-in
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          How are you, really?
        </h1>
        <p style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', marginTop: 6, marginBottom: 0, lineHeight: 1.45 }}>
          30 seconds. Your coach uses this to calibrate next week's prescription.
        </p>

        <SpringReveal delay={40}>
          <Section title="Mood">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {MOODS.map((m) => {
                const active = mood === m.v;
                return (
                  <button
                    key={m.v}
                    type="button"
                    onClick={() => setMood(m.v)}
                    aria-pressed={active}
                    style={{
                      padding: '12px 4px',
                      borderRadius: 14,
                      background: active ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(0,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: 'hsl(var(--rd-fg-primary))',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      transition: 'background 200ms, border-color 200ms, transform 180ms cubic-bezier(.34,1.56,.64,1)',
                    }}
                  >
                    <span aria-hidden style={{ fontSize: 26 }}>{m.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-secondary))' }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </Section>
        </SpringReveal>

        <SpringReveal delay={80}>
          <Section title="Sleep quality">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = sleepQuality != null && n <= sleepQuality;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSleepQuality(n)}
                    aria-label={`${n} stars`}
                    style={{
                      width: 44, height: 44, borderRadius: 9999,
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      color: active ? '#FBBF24' : 'rgba(255,255,255,0.25)',
                      transition: 'color 160ms, transform 160ms cubic-bezier(.34,1.56,.64,1)',
                      transform: active ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}>
                      <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </Section>
        </SpringReveal>

        <SpringReveal delay={120}>
          <Section title="Soreness">
            <Slider value={soreness} onChange={setSoreness} min={0} max={10} leftLabel="None" rightLabel="Very sore" color="#FB7185" />
          </Section>
        </SpringReveal>

        <SpringReveal delay={160}>
          <Section title="Stress">
            <Slider value={stress} onChange={setStress} min={0} max={10} leftLabel="Calm" rightLabel="Maxed out" color="#FBBF24" />
          </Section>
        </SpringReveal>

        <SpringReveal delay={200}>
          <Section title="Energy">
            <Slider value={energy} onChange={setEnergy} min={0} max={10} leftLabel="Drained" rightLabel="Electric" color="hsl(var(--rd-accent))" />
          </Section>
        </SpringReveal>

        <SpringReveal delay={240}>
          <Section title="Measurements" optional>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MeasureField label="Waist"    value={measurements.waist}    onChange={(v) => setMeasure('waist', v)} />
              <MeasureField label="Chest"    value={measurements.chest}    onChange={(v) => setMeasure('chest', v)} />
              <MeasureField label="L arm"    value={measurements.leftArm}  onChange={(v) => setMeasure('leftArm', v)} />
              <MeasureField label="R arm"    value={measurements.rightArm} onChange={(v) => setMeasure('rightArm', v)} />
            </div>
          </Section>
        </SpringReveal>

        <SpringReveal delay={280}>
          <Section title="Notes" optional>
            <Glass radius="lg" style={{ padding: 4 }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything to flag? Nutrition changes, new injury, life stress…"
                rows={3}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: 'hsl(var(--rd-fg-primary))', padding: 12,
                  resize: 'none', fontSize: 14, lineHeight: 1.4,
                  fontFamily: 'inherit',
                }}
              />
            </Glass>
          </Section>
        </SpringReveal>
      </div>

      {/* Sticky Save */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 520, margin: '0 auto' }}>
          <LiquidButton intent="primary" size="xl" block disabled={!canSave} onClick={() => onSave?.(result)}>
            Save check-in
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}
export { BodyCheckIn };

function Section({ title, optional, children }) {
  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, paddingInline: 2 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {title}
        </span>
        {optional && (
          <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontStyle: 'italic' }}>optional</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Slider({ value, onChange, min, max, leftLabel, rightLabel, color }) {
  const pct = (value - min) / (max - min || 1);
  return (
    <Glass radius="lg" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>{leftLabel}</span>
        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color }}>
          {value}
          <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>/{max}</span>
        </span>
        <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, height: 4 }}
      />
    </Glass>
  );
}

function MeasureField({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          style={{
            width: '100%', height: 48, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'hsl(var(--rd-fg-primary))', padding: '0 38px 0 12px',
            fontSize: 15, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            outline: 'none',
          }}
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>
          cm
        </span>
      </div>
    </div>
  );
}
