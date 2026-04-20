import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

/**
 * S29_Workout_Summary — post-session summary (gift moment: workout completion).
 *
 * Gallery:    <S29_Workout_Summary dark />
 * Production: <S29_Workout_Summary dark sessionLabel="SESSION 087 · 18 APR"
 *               sessionName="Heavy Lower" sessionMeta="58 MIN · 5 LIFTS · 18 SETS · 1 PR"
 *               stats={[...]} comparison={{today, avg, deltaPct}}
 *               lifts={[...]} nextSession={{date, name, summary}}
 *               onShare={fn} onClose={fn} />
 *
 * onShare() — share PR card action
 * onClose() — save + dismiss
 */
const DEMO_LIFTS = [
  { n: 'Deadlift',     sets: '5×3', top: '415', hit: true,  rpe: 9.0, note: 'PR · +10 lb' },
  { n: 'Barbell row',  sets: '4×8', top: '185', hit: true,  rpe: 7.5 },
  { n: 'Hip thrust',   sets: '3×10', top: '275', hit: true, rpe: 7.0 },
  { n: 'Hamstring curl', sets: '3×12', top: '90', hit: false, rpe: 8.0, note: 'short 2 reps set 3' },
  { n: 'Plank',        sets: '3×60s', top: '—', hit: true,  rpe: 6.5 },
];

const DEMO_STATS = [
  { k: 'Tonnage', v: '18,420', u: 'lb' },
  { k: 'Top set', v: '415',    u: 'lb', accent: true },
  { k: 'Avg RPE', v: '7.6',    u: '/10' },
  { k: 'Rest',    v: '2:14',   u: 'avg' },
];

export default function S29_Workout_Summary({
  dark = false,
  session = null,
  sessionLabel = 'SESSION 087 · 18 APR',
  sessionName = 'Heavy Lower',
  sessionMeta = '58 MIN · 5 LIFTS · 18 SETS · 1 PR',
  stats,
  comparison,
  lifts,
  nextSession,
  onShare,
  onRepeat,
  onClose,
}) {
  const sessionId = (session && session.id) || sessionLabel;
  const handleShare = () => { if (typeof onShare === 'function') onShare({ sessionId, sharedAt: Date.now() }); };
  const handleRepeat = () => { if (typeof onRepeat === 'function') onRepeat({ sessionId, repeatedAt: Date.now() }); };
  const c = useACT(dark);
  const _lifts = lifts || DEMO_LIFTS;
  const _stats = stats || DEMO_STATS;
  const _comparison = comparison || { today: 18420, avg: 15080, deltaPct: 22 };
  const _next = nextSession || { date: 'Mon Apr 20', name: 'Upper push · Moderate', summary: 'Bench 4×6 @ 80% · OHP 3×8 · Dips · Incline DB' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: onClose ? 'pointer' : 'default' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>{sessionLabel}</ACLabel>
        <button type="button" onClick={onShare} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: onShare ? 'pointer' : 'default' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4-4 4 4M7 1v9M2 13h10" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {/* Big moment — "you just did" */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Session complete
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 44, fontWeight: 700,
          letterSpacing: -1.8, lineHeight: 0.95, color: c.fg,
        }}>
          {sessionName}.
        </div>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          {sessionMeta}
        </div>

        {/* Four-up signal grid */}
        <div style={{
          marginTop: 22, padding: 20, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        }}>
          {_stats.map((m, i) => (
            <div key={i} style={{
              padding: '4px 0',
              borderTop: i >= 2 ? '1px solid rgba(239,233,218,0.14)' : 'none',
              paddingTop: i >= 2 ? 16 : 0,
              paddingLeft: i % 2 === 1 ? 16 : 0,
              borderLeft: i % 2 === 1 ? '1px solid rgba(239,233,218,0.14)' : 'none',
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                <span style={{
                  fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
                  letterSpacing: -1, color: m.accent ? c.accent : c.bg,
                  fontVariantNumeric: 'tabular-nums',
                }}>{m.v}</span>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: 'rgba(239,233,218,0.5)' }}>{m.u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tonnage bar — session vs 12-week avg */}
        <div style={{
          marginTop: 14, padding: 16, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Volume · this vs 12-wk avg
            </ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 700 }}>+{_comparison.deltaPct}%</ACLabel>
          </div>
          {(() => {
            const maxV = Math.max(_comparison.today, _comparison.avg, 1);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, width: 34 }}>Avg</ACLabel>
                  <div style={{ flex: 1, height: 10, background: c.faint }}>
                    <div style={{ width: `${Math.round((_comparison.avg / maxV) * 100)}%`, height: '100%', background: c.dim }} />
                  </div>
                  <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, width: 52, textAlign: 'right' }}>{_comparison.avg.toLocaleString()}</ACLabel>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ACLabel size={10} color={c.fg} style={{ fontFamily: ACFonts.mono, width: 34, fontWeight: 700 }}>Today</ACLabel>
                  <div style={{ flex: 1, height: 10, background: c.faint }}>
                    <div style={{ width: `${Math.round((_comparison.today / maxV) * 100)}%`, height: '100%', background: c.accent }} />
                  </div>
                  <ACLabel size={10} color={c.fg} style={{ fontFamily: ACFonts.mono, width: 52, textAlign: 'right', fontWeight: 700 }}>{_comparison.today.toLocaleString()}</ACLabel>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Lift log */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            The work · {_lifts.length} lift{_lifts.length !== 1 ? 's' : ''}
          </ACLabel>
          <div style={{ marginTop: 12 }}>
            {_lifts.map((l, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: l.note && l.note.includes('PR') ? c.accent : (l.hit ? c.fg : 'transparent'),
                  border: !l.hit ? `1.5px dashed ${c.faint}` : 'none',
                  color: l.note && l.note.includes('PR') ? c.ink : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {l.hit && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5L4 8L9.5 2.5" stroke={l.note && l.note.includes('PR') ? c.ink : c.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{l.n}</div>
                  {l.note && (
                    <div style={{
                      marginTop: 3, fontFamily: ACFonts.mono, fontSize: 10.5,
                      color: l.note.includes('PR') ? c.accent : c.mute,
                      letterSpacing: 0.3, fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>{l.note}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 13, color: c.fg, fontWeight: 600 }}>
                    {l.sets}
                  </div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, marginTop: 2 }}>
                    {l.top !== '—' && <>top <span style={{ color: c.fg }}>{l.top}</span> · </>}RPE {l.rpe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's next */}
        <div style={{
          marginTop: 22, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Next · {_next.date}
          </ACLabel>
          <div style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: c.fg }}>
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

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8, background: c.bg }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block onClick={handleShare}>Share PR</ACBtn>
        </div>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block onClick={handleRepeat}>Repeat</ACBtn>
        </div>
        <div style={{ flex: 1.3 }}>
          <ACBtn primary dark={dark} size="lg" pill block onClick={onClose}>Save · close →</ACBtn>
        </div>
      </div>
    </div>
  );
}
