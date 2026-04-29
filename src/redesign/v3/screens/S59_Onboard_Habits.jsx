/**
 * S59_Onboard_Habits — Step 7/10
 * Daily habits: sleep, steps target, water intake.
 * Replaces v2 OnboardingHabits with v3 paper design system.
 *
 * @example Gallery
 * <S59_Onboard_Habits dark={false} step={7} total={10}
 *   value={{ sleep: '7_8', steps: '10k', waterL: 2.5 }}
 *   onChange={v => console.log(v)} onBack={() => {}} onContinue={() => {}} />
 *
 * @example Production
 * <S59_Onboard_Habits dark={dark} step={7} total={10}
 *   value={onboardData.habits} onChange={v => merge('habits', v)}
 *   onBack={() => goStep(6)} onContinue={() => goStep(8)} />
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
const SLEEP_IDS = ['lt6', '6_7', '7_8', 'gt8'];
const STEPS_IDS = ['5k', '8k', '10k', '12k'];

const WATER = [
  { id: 1,   label: '1L' },
  { id: 1.5, label: '1.5L' },
  { id: 2,   label: '2L' },
  { id: 2.5, label: '2.5L' },
  { id: 3,   label: '3L+' },
];

/* ── screen ────────────────────────────────────────────────── */
function S59_Onboard_Habits({
  dark = false,
  step = 7,
  total = 10,
  value,
  onChange,
  onBack,
  onExit,
  onContinue,
}) {
  const c = useACT(dark);
  const t = useT();

  const [sleep, setSleep]   = React.useState(value?.sleep || null);
  const [steps, setSteps]   = React.useState(value?.steps || null);
  const [waterL, setWaterL] = React.useState(value?.waterL ?? 2);

  const canContinue = !!sleep && !!steps;

  function emit(patch) {
    onChange?.({ sleep, steps, waterL, ...patch });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg, minHeight: 0 }}>
      <OBHeader step={step} total={total} dark={dark} onBack={onBack} onExit={onExit} />

      {/* scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 28px 16px', display: 'flex', flexDirection: 'column' }}>

        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{t('onboardHabits.eyebrow')}</ACLabel>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg, whiteSpace: 'pre-line',
        }}>
          {t('onboardHabits.title')}
        </div>

        {/* ── Sleep (horizontal pill row) ────────────────── */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={12} color={c.dim}>{t('onboardHabits.sleepLabel')}</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {SLEEP_IDS.map(id => {
              const on = sleep === id;
              return (
                <button key={id} type="button" onClick={() => { setSleep(id); emit({ sleep: id }); }} style={{
                  flex: 1, padding: '12px 0', borderRadius: ACRadii.input,
                  background: on ? c.fg : c.card,
                  color: on ? c.bg : c.fg,
                  border: 'none',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', textAlign: 'center',
                }}>{t(`onboardHabits.sleep.${id}`)}</button>
              );
            })}
          </div>
        </div>

        {/* ── Daily steps target (horizontal pill row) ───── */}
        <div style={{ marginTop: 20 }}>
          <ACLabel size={12} color={c.dim}>{t('onboardHabits.stepsLabel')}</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {STEPS_IDS.map(id => {
              const on = steps === id;
              return (
                <button key={id} type="button" onClick={() => { setSteps(id); emit({ steps: id }); }} style={{
                  flex: 1, padding: '12px 0', borderRadius: ACRadii.input,
                  background: on ? c.fg : c.card,
                  color: on ? c.bg : c.fg,
                  border: 'none',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', textAlign: 'center',
                }}>{t(`onboardHabits.steps.${id}`)}</button>
              );
            })}
          </div>
        </div>

        {/* ── Water intake (pill row, no large number display) */}
        <div style={{ marginTop: 20 }}>
          <ACLabel size={12} color={c.dim}>{t('onboardHabits.waterLabel')}</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            {WATER.map(w => {
              const on = waterL === w.id;
              return (
                <button key={w.id} type="button" onClick={() => { setWaterL(w.id); emit({ waterL: w.id }); }} style={{
                  flex: 1, padding: '12px 0', borderRadius: ACRadii.input,
                  background: on ? c.accent : c.card,
                  color: on ? c.ink : c.fg,
                  border: 'none',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', textAlign: 'center',
                }}>{w.label}</button>
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
          {t('onboardHabits.cta')}
        </ACBtn>
      </div>
    </div>
  );
}

export default S59_Onboard_Habits;
