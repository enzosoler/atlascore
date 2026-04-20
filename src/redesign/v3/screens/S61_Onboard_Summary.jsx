/**
 * S61_Onboard_Summary — Step 9 of 10.
 *
 * Display-only plan review before activation. Shows computed nutrition targets,
 * training parameters, recovery goals, and any constraints flagged in the
 * previous step. This is a GIFT MOMENT (see CLAUDE.md §12): the protocol
 * reveal uses a 3-stage sequence — anticipation, reveal, celebration.
 *
 * Props
 * -----
 * @param {boolean}  dark               - light / dark variant
 * @param {number}   [step=9]           - current onboarding step
 * @param {number}   [total=10]         - total onboarding steps
 * @param {object}   [targets]          - { calories, protein, carbs, fat,
 *                                          sessionMinutes, weeklySessions,
 *                                          experience, sleep, waterL, steps }
 * @param {object}   [constraints]      - { injuries:[], medical:[], notes }
 * @param {function} [onBack]           - back handler
 * @param {function} [onContinue]       - activation / continue handler
 *
 * DEMO fallbacks: renders sensible defaults when targets are omitted.
 */
import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACSpark,
} from '../lib/paper.jsx';

/* ── progress header (matches S7–S11 exactly) ──────────────── */
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

/* ── experience label helper ────────────────────────────────── */
function expLabel(v) {
  if (v === 'beginner' || v === 1)     return 'Beginner';
  if (v === 'intermediate' || v === 2) return 'Intermediate';
  if (v === 'advanced' || v === 3)     return 'Advanced';
  return String(v || 'Intermediate');
}

/* ── animation durations (3-stage gift moment) ──────────────── */
const ANTICIPATION_MS = 1200;
const REVEAL_MS       = 600;
const CELEBRATE_MS    = 400;

/* ── main screen ────────────────────────────────────────────── */
function S61_Onboard_Summary({
  dark = false,
  step = 9,
  total = 10,
  targets,
  constraints,
  onBack,
  onContinue,
}) {
  const c = useACT(dark);

  /* safe target defaults */
  const t = {
    calories:       targets?.calories       ?? 2200,
    protein:        targets?.protein        ?? 165,
    carbs:          targets?.carbs          ?? 220,
    fat:            targets?.fat            ?? 73,
    sessionMinutes: targets?.sessionMinutes ?? 50,
    weeklySessions: targets?.weeklySessions ?? 4,
    experience:     targets?.experience     ?? 'intermediate',
    sleep:          targets?.sleep          ?? 8,
    waterL:         targets?.waterL         ?? 3,
    steps:          targets?.steps          ?? 8000,
  };

  const hasConstraints =
    (constraints?.injuries?.length || 0) > 0 ||
    (constraints?.medical?.length || 0) > 0 ||
    (constraints?.notes && constraints.notes.trim().length > 0);

  /* ── 3-stage gift: anticipation → reveal → celebration ────── */
  const [phase, setPhase] = React.useState('anticipate'); // 'anticipate' | 'reveal' | 'celebrate'

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), ANTICIPATION_MS);
    const t2 = setTimeout(() => setPhase('celebrate'), ANTICIPATION_MS + REVEAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const showReveal    = phase === 'reveal' || phase === 'celebrate';
  const showCelebrate = phase === 'celebrate';

  /* shared fade-in style */
  const fadeIn = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity ${CELEBRATE_MS}ms ease ${delay}ms, transform ${CELEBRATE_MS}ms ease ${delay}ms`,
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={step} total={total} dark={dark} onBack={onBack} />

      {/* scrollable body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 28px 16px' }}>

        {/* ── Stage 1: anticipation ──────────────────────────── */}
        {phase === 'anticipate' && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
              letterSpacing: -0.6, color: c.fg, lineHeight: 1.3,
            }}>
              Computing your protocol...
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: 999,
                  background: c.accent,
                  opacity: 0.35,
                  animation: `pulse-dot 1s ease-in-out ${i * 0.2}s infinite alternate`,
                }} />
              ))}
            </div>
            <style>{`@keyframes pulse-dot { from { opacity: 0.25; } to { opacity: 1; } }`}</style>
            <div style={{ marginTop: 22, fontSize: 13, color: c.dim, lineHeight: 1.5 }}>
              Analyzing identity, goal, activity level,<br />and constraints...
            </div>
          </div>
        )}

        {/* ── Stage 2 + 3: reveal + celebration ──────────────── */}
        {showReveal && (
          <>
            {/* heading */}
            <div style={fadeIn(showReveal)}>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Your protocol</ACLabel>
              <div style={{
                marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
                letterSpacing: -1, lineHeight: 1.05, color: c.fg,
              }}>
                Your system<br/>is <span style={{ color: c.accent }}>ready</span>.
              </div>
            </div>

            {/* ── hero card: calories + macros (inverted) ──── */}
            <div style={{
              marginTop: 24, padding: 22, background: c.fg, color: c.bg,
              borderRadius: ACRadii.card,
              ...fadeIn(showReveal, 80),
            }}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Daily target</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <ACNum size={72} color={c.bg} weight={700}>{t.calories.toLocaleString()}</ACNum>
                <ACLabel size={13} color="rgba(239,233,218,0.6)">kcal</ACLabel>
              </div>

              <div style={{ marginTop: 18, height: 1, background: 'rgba(239,233,218,0.12)' }} />

              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { l: 'Protein', v: String(t.protein), u: 'g' },
                  { l: 'Carbs',   v: String(t.carbs),   u: 'g' },
                  { l: 'Fat',     v: String(t.fat),      u: 'g' },
                ].map((m, i) => (
                  <div key={i}>
                    <ACLabel size={11} color="rgba(239,233,218,0.55)">{m.l}</ACLabel>
                    <div style={{ marginTop: 6 }}>
                      <ACNum size={26} color={c.bg} weight={700}>{m.v}</ACNum>
                      <span style={{ fontSize: 11, color: 'rgba(239,233,218,0.55)', marginLeft: 3 }}>{m.u}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── training card ──────────────────────────────── */}
            <div style={{
              marginTop: 12, padding: 18, background: c.card,
              borderRadius: ACRadii.card,
              ...fadeIn(showCelebrate, 0),
            }}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Training</ACLabel>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div>
                  <ACLabel size={11} color={c.dim}>Sessions / wk</ACLabel>
                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, fontFamily: ACFonts.display, color: c.fg }}>{t.weeklySessions}</div>
                </div>
                <div>
                  <ACLabel size={11} color={c.dim}>Avg duration</ACLabel>
                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, fontFamily: ACFonts.display, color: c.fg }}>{t.sessionMinutes}<span style={{ fontSize: 12, color: c.dim, marginLeft: 2 }}>min</span></div>
                </div>
                <div>
                  <ACLabel size={11} color={c.dim}>Experience</ACLabel>
                  <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: c.fg }}>{expLabel(t.experience)}</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <ACSpark w={272} h={28} dark={dark} stroke={2} />
              </div>
            </div>

            {/* ── recovery card ──────────────────────────────── */}
            <div style={{
              marginTop: 12, padding: 18, background: c.card,
              borderRadius: ACRadii.card,
              ...fadeIn(showCelebrate, 120),
            }}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Recovery</ACLabel>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div>
                  <ACLabel size={11} color={c.dim}>Sleep target</ACLabel>
                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, fontFamily: ACFonts.display, color: c.fg }}>{t.sleep}<span style={{ fontSize: 12, color: c.dim, marginLeft: 2 }}>hrs</span></div>
                </div>
                <div>
                  <ACLabel size={11} color={c.dim}>Water target</ACLabel>
                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, fontFamily: ACFonts.display, color: c.fg }}>{t.waterL}<span style={{ fontSize: 12, color: c.dim, marginLeft: 2 }}>L</span></div>
                </div>
                <div>
                  <ACLabel size={11} color={c.dim}>Step goal</ACLabel>
                  <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, fontFamily: ACFonts.display, color: c.fg }}>{(t.steps / 1000).toFixed(0)}<span style={{ fontSize: 12, color: c.dim, marginLeft: 2 }}>k</span></div>
                </div>
              </div>
            </div>

            {/* ── constraints summary (conditional) ──────────── */}
            {hasConstraints && (
              <div style={{
                marginTop: 12, padding: 18, background: c.card,
                borderRadius: ACRadii.card,
                ...fadeIn(showCelebrate, 240),
              }}>
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Constraints</ACLabel>
                {constraints?.injuries?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <ACLabel size={10} color={c.dim}>Injuries</ACLabel>
                    <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {constraints.injuries.map(item => (
                        <span key={item} style={{
                          padding: '4px 10px', borderRadius: 999,
                          fontSize: 12, fontWeight: 600,
                          fontFamily: ACFonts.body,
                          background: 'rgba(232,181,0,0.16)',
                          color: '#e8b500',
                        }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                {constraints?.medical?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <ACLabel size={10} color={c.dim}>Medical</ACLabel>
                    <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {constraints.medical.map(item => (
                        <span key={item} style={{
                          padding: '4px 10px', borderRadius: 999,
                          fontSize: 12, fontWeight: 600,
                          fontFamily: ACFonts.body,
                          background: 'rgba(198,91,75,0.16)',
                          color: '#c65b4b',
                        }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                {constraints?.notes?.trim() && (
                  <div style={{ marginTop: 10, fontSize: 13, color: c.dim, lineHeight: 1.4 }}>
                    {constraints.notes}
                  </div>
                )}
              </div>
            )}

            {/* recalibration note */}
            <div style={{
              marginTop: 16, padding: '14px 16px', borderRadius: ACRadii.card,
              border: `1px dashed ${c.faint}`,
              ...fadeIn(showCelebrate, 320),
            }}>
              <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
                atlas.core recalibrates weekly from your weight trend, logs, and readiness. These targets evolve with you.
              </ACLabel>
            </div>
          </>
        )}
      </div>

      {/* bottom CTA */}
      <div style={{
        padding: '14px 28px 26px', background: c.bg,
        ...fadeIn(showCelebrate, 200),
      }}>
        <ACBtn
          primary block dark={dark} size="lg" pill
          onClick={() => onContinue?.()}
          style={{ opacity: showCelebrate ? 1 : 0.4, pointerEvents: showCelebrate ? 'auto' : 'none' }}
        >
          Activate system →
        </ACBtn>
      </div>
    </div>
  );
}

export default S61_Onboard_Summary;
