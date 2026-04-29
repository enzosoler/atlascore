/**
 * S58_Onboard_Workout — Step 6/10
 * Workout preferences: experience level, weekly frequency, available equipment.
 * Replaces v2 OnboardingWorkout with v3 paper design system.
 *
 * @example Gallery
 * <S58_Onboard_Workout dark={false} step={6} total={10}
 *   value={{ experience: 'intermediate', frequency: '4x', equipment: ['Full gym'] }}
 *   onChange={v => console.log(v)} onBack={() => {}} onContinue={() => {}} />
 *
 * @example Production
 * <S58_Onboard_Workout dark={dark} step={6} total={10}
 *   value={onboardData.workout} onChange={v => merge('workout', v)}
 *   onBack={() => goStep(5)} onContinue={() => goStep(7)} />
 */
import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';
import { useT } from '@/lib/i18nContext';

/* ── OBHeader (inline, matches S7–S11 exactly) ─────────────── */
function OBHeader({ step, total, dark, onBack = true, onExit }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      {onBack ? (
        <button type="button" onClick={typeof onBack === 'function' ? onBack : undefined} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 10px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{step}/{total}</ACLabel>
      {onExit && (
        <button type="button" onClick={onExit} aria-label="Exit" style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
      )}
    </div>
  );
}

/* ── data ──────────────────────────────────────────────────── */
const FREQUENCY = [
  { id: '2x', label: '2\u00d7' },
  { id: '3x', label: '3\u00d7' },
  { id: '4x', label: '4\u00d7' },
  { id: '5x', label: '5\u00d7' },
  { id: '6x', label: '6\u00d7' },
];

const EQUIPMENT_KEYS = ['fullGym', 'dumbbellsOnly', 'bodyweight', 'resistanceBands', 'homeGym'];

/* ── screen ────────────────────────────────────────────────── */
function S58_Onboard_Workout({
  dark = false,
  step = 6,
  total = 10,
  value,
  onChange,
  onBack,
  onExit,
  onContinue,
}) {
  const c = useACT(dark);
  const t = useT();

  const [experience, setExperience] = React.useState(value?.experience || null);
  const [frequency, setFrequency]   = React.useState(value?.frequency || null);
  const [equipment, setEquipment]   = React.useState(new Set(value?.equipment || []));

  const canContinue = !!experience && !!frequency;

  function emit(patch) {
    onChange?.({ experience, frequency, equipment: Array.from(equipment), ...patch });
  }

  function toggleEquip(e) {
    const next = new Set(equipment);
    next.has(e) ? next.delete(e) : next.add(e);
    setEquipment(next);
    emit({ equipment: Array.from(next) });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg, minHeight: 0 }}>
      <OBHeader step={step} total={total} dark={dark} onBack={onBack} onExit={onExit} />

      {/* scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 28px 16px', display: 'flex', flexDirection: 'column' }}>

        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{t('onboardWorkout.eyebrow')}</ACLabel>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg, whiteSpace: 'pre-line',
        }}>
          {t('onboardWorkout.title')}
        </div>

        {/* ── Experience level (single select) ───────────── */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>{t('onboardWorkout.experienceLabel')}</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['beginner', 'intermediate', 'advanced'].map(id => {
              const on = experience === id;
              return (
                <button key={id} type="button" onClick={() => { setExperience(id); emit({ experience: id }); }} style={{
                  padding: '12px 18px', borderRadius: ACRadii.input,
                  background: on ? c.fg : 'transparent',
                  color: on ? c.bg : c.fg,
                  border: on ? 'none' : `1px solid ${c.hair}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{t(`onboardWorkout.experience.${id}`)}</div>
                    <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{t(`onboardWorkout.experience.${id}Desc`)}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: 999,
                    border: `1.8px solid ${on ? c.accent : c.faint}`,
                    background: on ? c.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Weekly frequency (single select pill row) ──── */}
        <div style={{ marginTop: 20 }}>
          <ACLabel size={12} color={c.dim}>{t('onboardWorkout.frequencyLabel')}</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {FREQUENCY.map(f => {
              const on = frequency === f.id;
              return (
                <button key={f.id} type="button" onClick={() => { setFrequency(f.id); emit({ frequency: f.id }); }} style={{
                  flex: 1, padding: '14px 0', borderRadius: ACRadii.input,
                  background: on ? c.fg : c.card,
                  color: on ? c.bg : c.fg,
                  fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', border: 'none', textAlign: 'center',
                }}>{f.label}</button>
              );
            })}
          </div>
        </div>

        {/* ── Equipment (multi-select chip toggles) ──────── */}
        <div style={{ marginTop: 20 }}>
          <ACLabel size={12} color={c.dim}>{t('onboardWorkout.equipmentLabel')}</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EQUIPMENT_KEYS.map(k => {
              const on = equipment.has(k);
              return (
                <button key={k} type="button" onClick={() => toggleEquip(k)} style={{
                  padding: '10px 16px', borderRadius: 999,
                  background: on ? c.accent : c.card,
                  color: on ? c.ink : c.fg,
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                }}>{t(`onboardWorkout.equipment.${k}`)}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* sticky footer */}
      <div style={{ padding: '14px 28px 26px', background: c.bg, flexShrink: 0 }}>
        <ACBtn
          primary block dark={dark} size="lg" pill
          onClick={canContinue ? onContinue : undefined}
          style={{ opacity: canContinue ? 1 : 0.4, pointerEvents: canContinue ? 'auto' : 'none' }}
        >
          {t('onboardWorkout.cta')}
        </ACBtn>
      </div>
    </div>
  );
}

export default S58_Onboard_Workout;
