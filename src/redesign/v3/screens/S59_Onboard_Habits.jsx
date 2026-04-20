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

/* ── OBHeader (inline, matches S7–S11 exactly) ─────────────── */
function OBHeader({ step, total, dark, onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <button type="button" onClick={typeof onBack === 'function' ? onBack : undefined} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{step}/{total}</ACLabel>
    </div>
  );
}

/* ── data ──────────────────────────────────────────────────── */
const SLEEP = [
  { id: 'lt6', label: '< 6h',  desc: 'Often sleep-deprived' },
  { id: '6_7', label: '6\u20137h', desc: 'Usually enough, not always' },
  { id: '7_8', label: '7\u20138h', desc: 'Pretty consistent' },
  { id: 'gt8', label: '8h+',   desc: 'Sleep priority on lock' },
];

const STEPS = [
  { id: '5k',  label: '5k',   desc: 'Mostly seated day' },
  { id: '8k',  label: '8k',   desc: 'Light walking' },
  { id: '10k', label: '10k',  desc: 'Active day' },
  { id: '12k', label: '12k+', desc: 'Very active job or commute' },
];

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
  onContinue,
}) {
  const c = useACT(dark);

  const [sleep, setSleep]   = React.useState(value?.sleep || null);
  const [steps, setSteps]   = React.useState(value?.steps || null);
  const [waterL, setWaterL] = React.useState(value?.waterL ?? 2);

  const canContinue = !!sleep && !!steps;

  function emit(patch) {
    onChange?.({ sleep, steps, waterL, ...patch });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={step} total={total} dark={dark} onBack={onBack} />

      {/* scrollable content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 28px 16px' }}>

        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Habits</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          A few daily<br/>habits.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          We anchor your recovery score and coach nudges on these.
        </div>

        {/* ── Sleep (single select) ──────────────────────── */}
        <div style={{ marginTop: 30 }}>
          <ACLabel size={12} color={c.dim}>Typical sleep</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SLEEP.map(s => {
              const on = sleep === s.id;
              return (
                <button key={s.id} type="button" onClick={() => { setSleep(s.id); emit({ sleep: s.id }); }} style={{
                  padding: '16px 18px', borderRadius: ACRadii.input,
                  background: on ? c.fg : 'transparent',
                  color: on ? c.bg : c.fg,
                  border: on ? 'none' : `1px solid ${c.hair}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{s.desc}</div>
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

        {/* ── Daily steps target (single select) ─────────── */}
        <div style={{ marginTop: 28 }}>
          <ACLabel size={12} color={c.dim}>Daily steps target</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map(s => {
              const on = steps === s.id;
              return (
                <button key={s.id} type="button" onClick={() => { setSteps(s.id); emit({ steps: s.id }); }} style={{
                  padding: '16px 18px', borderRadius: ACRadii.input,
                  background: on ? c.fg : 'transparent',
                  color: on ? c.bg : c.fg,
                  border: on ? 'none' : `1px solid ${c.hair}`,
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{s.desc}</div>
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

        {/* ── Water intake (preset pill buttons) ─────────── */}
        <div style={{ marginTop: 28 }}>
          <ACLabel size={12} color={c.dim}>Daily water intake</ACLabel>
          <div style={{
            marginTop: 10, padding: 18, background: c.card, borderRadius: ACRadii.card,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <ACLabel size={12} color={c.mute}>Target</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums', color: c.fg,
                }}>
                  {waterL % 1 === 0 ? waterL : waterL.toFixed(1)}
                </span>
                <ACLabel size={13} color={c.dim}>L</ACLabel>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {WATER.map(w => {
                const on = waterL === w.id;
                return (
                  <button key={w.id} type="button" onClick={() => { setWaterL(w.id); emit({ waterL: w.id }); }} style={{
                    flex: 1, padding: '12px 0', borderRadius: ACRadii.input,
                    background: on ? c.accent : 'transparent',
                    color: on ? c.ink : c.fg,
                    border: on ? 'none' : `1px solid ${c.hair}`,
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', textAlign: 'center',
                  }}>{w.label}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* sticky footer */}
      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn
          primary block dark={dark} size="lg" pill
          onClick={canContinue ? onContinue : undefined}
          style={{ opacity: canContinue ? 1 : 0.4, pointerEvents: canContinue ? 'auto' : 'none' }}
        >
          Continue \u2192
        </ACBtn>
      </div>
    </div>
  );
}

export default S59_Onboard_Habits;
