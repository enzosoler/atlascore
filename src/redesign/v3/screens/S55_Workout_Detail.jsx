import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACNum, ACBtn,
} from '../lib/paper.jsx';

/* ── demo data (gallery fallback) ─────────────────────────────── */

const DEMO_SESSION = {
  id: 'w-001',
  name: 'Heavy Lower',
  date: '2026-04-18T09:30:00',
  duration: 58,
  volume: 18420,
  exerciseCount: 5,
  setCount: 18,
  intensity: 'High',
};

const DEMO_EXERCISES = [
  {
    name: 'Deadlift', muscle: 'Posterior chain',
    sets: [
      { weight: 315, reps: 5, rpe: 7.0 },
      { weight: 365, reps: 3, rpe: 8.0 },
      { weight: 405, reps: 1, rpe: 8.5 },
      { weight: 415, reps: 1, rpe: 9.0, pr: true },
      { weight: 365, reps: 3, rpe: 8.0 },
    ],
  },
  {
    name: 'Barbell Row', muscle: 'Upper back',
    sets: [
      { weight: 155, reps: 8, rpe: 7.0 },
      { weight: 175, reps: 8, rpe: 7.5 },
      { weight: 185, reps: 8, rpe: 8.0 },
      { weight: 185, reps: 6, rpe: 8.5 },
    ],
  },
  {
    name: 'Hip Thrust', muscle: 'Glutes',
    sets: [
      { weight: 245, reps: 10, rpe: 6.5 },
      { weight: 275, reps: 10, rpe: 7.0 },
      { weight: 275, reps: 10, rpe: 7.5 },
    ],
  },
  {
    name: 'Hamstring Curl', muscle: 'Hamstrings',
    sets: [
      { weight: 80, reps: 12, rpe: 7.0 },
      { weight: 90, reps: 12, rpe: 8.0 },
      { weight: 90, reps: 10, rpe: 8.5 },
    ],
  },
  {
    name: 'Plank', muscle: 'Core',
    sets: [
      { weight: 0, reps: 60, rpe: 6.0 },
      { weight: 0, reps: 60, rpe: 6.5 },
      { weight: 0, reps: 60, rpe: 7.0 },
    ],
  },
];

const DEMO_PRS = [
  { exercise: 'Deadlift', weight: 415, reps: 1 },
];

const DEMO_NEXT = {
  date: 'Mon Apr 20',
  name: 'Upper Push · Moderate',
  summary: 'Bench 4x6 @ 80% · OHP 3x8 · Dips · Incline DB',
};

/**
 * S55_Workout_Detail — past completed session detail view.
 *
 * Gallery:    <S55_Workout_Detail dark />
 * Production: <S55_Workout_Detail dark
 *               session={{id, name, date, duration, volume, exerciseCount, setCount, intensity}}
 *               exercises={[{name, muscle, sets: [{weight, reps, rpe, pr?}]}]}
 *               prs={[{exercise, weight, reps}]}
 *               nextSession={{date, name, summary}}
 *               onShare={fn} onDelete={fn} onRepeat={fn} onBack={fn} />
 *
 * onShare({sessionId})  — share session card
 * onDelete({sessionId}) — delete session
 * onRepeat({sessionId}) — repeat as new session
 * onBack()              — back navigation
 */
export default function S55_Workout_Detail({
  dark = false,
  session,
  exercises,
  prs,
  nextSession,
  onShare,
  onDelete,
  onRepeat,
  onBack,
}) {
  const c = useACT(dark);
  const _session   = session   || DEMO_SESSION;
  const _exercises = exercises || DEMO_EXERCISES;
  const _prs       = prs       || DEMO_PRS;
  const _next      = nextSession || DEMO_NEXT;

  const sessionId = _session.id;
  const handleShare  = () => { if (typeof onShare  === 'function') onShare({ sessionId });  };
  const handleDelete = () => { if (typeof onDelete === 'function') onDelete({ sessionId }); };
  const handleRepeat = () => { if (typeof onRepeat === 'function') onRepeat({ sessionId }); };
  const handleBack   = () => { if (typeof onBack   === 'function') onBack(); };

  const d = new Date(_session.date);
  const dateLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── nav bar ────────────────────────────────────────── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button" onClick={handleBack}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>
          {timeLabel}
        </ACLabel>
        <button
          type="button" onClick={handleShare}
          style={{
            width: 28, height: 28, borderRadius: 999, background: c.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4-4 4 4M7 1v9M2 13h10" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── scrollable content ─────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>

        {/* ── session header ─────────────────────────────── */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Completed session
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
          letterSpacing: -1.6, lineHeight: 0.95, color: c.fg,
        }}>
          {_session.name}.
        </div>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {dateLabel}
        </div>

        {/* ── stat strip ─────────────────────────────────── */}
        <div style={{
          marginTop: 18, padding: 18, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0,
        }}>
          {[
            { k: 'Duration', v: `${_session.duration}`, u: 'min' },
            { k: 'Exercises', v: `${_session.exerciseCount}`, u: 'lifts' },
            { k: 'Sets', v: `${_session.setCount}`, u: 'total' },
            { k: 'Volume', v: formatBig(_session.volume), u: 'lb', accent: true },
          ].map((m, i) => (
            <div key={i} style={{
              paddingLeft: i > 0 ? 14 : 0,
              borderLeft: i > 0 ? `1px solid ${dark ? 'rgba(239,233,218,0.12)' : 'rgba(10,10,10,0.10)'}` : 'none',
            }}>
              <div style={{
                fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase',
                color: dark ? 'rgba(239,233,218,0.5)' : 'rgba(10,10,10,0.45)',
              }}>{m.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
                <span style={{
                  fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
                  letterSpacing: -0.6, color: m.accent ? c.accent : c.bg,
                  fontVariantNumeric: 'tabular-nums',
                }}>{m.v}</span>
                <span style={{
                  fontFamily: ACFonts.mono, fontSize: 9,
                  color: dark ? 'rgba(239,233,218,0.45)' : 'rgba(10,10,10,0.35)',
                }}>{m.u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── intensity chip ─────────────────────────────── */}
        {_session.intensity && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <span style={{
              padding: '5px 12px', borderRadius: ACRadii.chip,
              fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 600,
              letterSpacing: 0.3, textTransform: 'uppercase',
              background: c.card, color: c.fg,
            }}>
              {_session.intensity} intensity
            </span>
          </div>
        )}

        {/* ── PR callout cards ───────────────────────────── */}
        {_prs.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              {_prs.length} new PR{_prs.length !== 1 ? 's' : ''}
            </ACLabel>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {_prs.map((pr, i) => (
                <div key={i} style={{
                  padding: '14px 16px',
                  background: c.card, borderRadius: ACRadii.card,
                  borderLeft: `3px solid ${c.accent}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{
                      fontFamily: ACFonts.display, fontSize: 15, fontWeight: 600,
                      letterSpacing: -0.2, color: c.fg,
                    }}>
                      {pr.exercise}
                    </div>
                    <ACMono size={10} color={c.accent} style={{ fontWeight: 700, marginTop: 2, display: 'block' }}>
                      PERSONAL RECORD
                    </ACMono>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <ACNum size={26} color={c.accent} weight={700}>{pr.weight}</ACNum>
                    <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, marginTop: 2 }}>
                      lb x {pr.reps}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── exercise list ──────────────────────────────── */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            The work · {_exercises.length} exercise{_exercises.length !== 1 ? 's' : ''}
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {_exercises.map((ex, exIdx) => (
              <div key={exIdx} style={{
                padding: 16, background: c.card, borderRadius: ACRadii.card,
              }}>
                {/* exercise header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      fontFamily: ACFonts.display, fontSize: 16, fontWeight: 600,
                      letterSpacing: -0.3, color: c.fg,
                    }}>{ex.name}</div>
                    {ex.muscle && (
                      <ACLabel size={11} color={c.dim} style={{ marginTop: 2 }}>{ex.muscle}</ACLabel>
                    )}
                  </div>
                  <ACMono size={10} color={c.mute}>
                    {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
                  </ACMono>
                </div>

                {/* set table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 22px',
                  gap: 4, marginTop: 12, paddingBottom: 6,
                  borderBottom: `1px solid ${c.hair}`,
                }}>
                  {['#', 'Weight', 'Reps', 'RPE', ''].map((h, i) => (
                    <ACMono key={i} size={9} color={c.mute} style={{
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      textAlign: i === 0 ? 'center' : (i === 4 ? 'right' : 'center'),
                    }}>{h}</ACMono>
                  ))}
                </div>

                {/* set rows */}
                {ex.sets.map((s, sIdx) => (
                  <div key={sIdx} style={{
                    display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 22px',
                    gap: 4, padding: '8px 0',
                    borderBottom: sIdx < ex.sets.length - 1 ? `1px solid ${c.hair}` : 'none',
                    background: s.pr ? (dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.06)') : 'transparent',
                    borderRadius: s.pr ? 6 : 0,
                    margin: s.pr ? '2px -4px' : 0,
                    padding: s.pr ? '8px 4px' : '8px 0',
                  }}>
                    <ACMono size={11} color={s.pr ? c.accent : c.mute} style={{ textAlign: 'center', fontWeight: 600 }}>
                      {String(sIdx + 1).padStart(2, '0')}
                    </ACMono>
                    <ACMono size={13} color={c.fg} style={{ textAlign: 'center', fontWeight: 600 }}>
                      {s.weight > 0 ? s.weight : 'BW'}
                      {s.weight > 0 && <span style={{ fontSize: 10, color: c.dim }}> lb</span>}
                    </ACMono>
                    <ACMono size={13} color={c.fg} style={{ textAlign: 'center', fontWeight: 600 }}>
                      {s.reps}
                      <span style={{ fontSize: 10, color: c.dim }}> {s.weight === 0 ? 'sec' : 'rep'}</span>
                    </ACMono>
                    <ACMono size={12} color={s.rpe ? c.fg : c.faint} style={{ textAlign: 'center', fontWeight: 600 }}>
                      {s.rpe ? `@${s.rpe}` : '--'}
                    </ACMono>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {s.pr ? (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4,
                          background: c.accent, color: c.ink,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1 5l2.5 3L8 1" stroke={c.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ) : (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4,
                          background: c.faint,
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── what's next card ───────────────────────────── */}
        <div style={{
          marginTop: 22, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Next · {_next.date}
          </ACLabel>
          <div style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: c.fg, fontFamily: ACFonts.body }}>
            {_next.name}
          </div>
          <div style={{
            marginTop: 4, fontFamily: ACFonts.mono, fontSize: 11,
            color: c.dim, letterSpacing: 0.3,
          }}>
            {_next.summary}
          </div>
        </div>
      </div>

      {/* ── bottom action bar ──────────────────────────────── */}
      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block onClick={handleRepeat}>Repeat</ACBtn>
        </div>
        <div style={{ flex: 1 }}>
          <button
            type="button" onClick={handleDelete}
            style={{
              display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center',
              padding: '14px 20px', borderRadius: 999,
              background: dark ? 'rgba(198,91,75,0.14)' : 'rgba(198,91,75,0.10)',
              border: 'none', cursor: 'pointer',
              fontFamily: ACFonts.body, fontSize: 16, fontWeight: 600,
              letterSpacing: -0.2, color: '#c65b4b',
              WebkitAppearance: 'none',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────── */

function formatBig(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}
