import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACChip, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function TrophyStamp({ color, accent, fresh }) {
  // A minimalist "bar + stack of plates" stamp instead of a literal trophy icon.
  return (
    <div style={{
      width: 46, height: 46, flexShrink: 0,
      border: `1.5px solid ${fresh ? accent : color}`,
      borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        {/* barbell bar */}
        <rect x="3" y="13.5" width="24" height="3" fill={fresh ? accent : color} />
        {/* left plate */}
        <rect x="5" y="9" width="3" height="12" fill={fresh ? accent : color} />
        {/* right plate */}
        <rect x="22" y="9" width="3" height="12" fill={fresh ? accent : color} />
        {/* left end cap */}
        <rect x="2" y="11" width="2" height="8" fill={fresh ? accent : color} opacity="0.6" />
        <rect x="26" y="11" width="2" height="8" fill={fresh ? accent : color} opacity="0.6" />
      </svg>
    </div>
  );
}

function S20_PR_Gallery({ dark = false }) {
  const c = useACT(dark);
  const prs = [
    { lift: 'Deadlift',     w: '415', u: 'lb × 1', e1rm: '415', date: 'Apr 18', days: 'today', fresh: true },
    { lift: 'Bench press',  w: '275', u: 'lb × 1', e1rm: '275', date: 'Apr 11', days: '7d ago' },
    { lift: 'Back squat',   w: '325', u: 'lb × 3', e1rm: '352', date: 'Apr 04', days: '14d ago' },
    { lift: 'Overhead press', w: '165', u: 'lb × 1', e1rm: '165', date: 'Mar 28', days: '21d ago' },
    { lift: 'Weighted pullup', w: '95', u: 'lb × 5', e1rm: '108', date: 'Mar 21', days: '28d ago' },
    { lift: 'Front squat',  w: '255', u: 'lb × 3', e1rm: '276', date: 'Mar 14', days: '35d ago' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Personal records · all-time</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            The wall
          </div>
        </div>
        <ACChip accent dark={dark}>+6 this yr</ACChip>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Summary hero — this month's tonnage / PR count */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18,
        }}>
          <div>
            <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>April PRs</ACLabel>
            <ACNum size={76} color={c.bg} weight={700}>3</ACNum>
            <ACLabel size={11} color="rgba(239,233,218,0.6)">lifts moved · 52 total tonnes</ACLabel>
          </div>
          <div style={{
            borderLeft: '1px solid rgba(239,233,218,0.14)', paddingLeft: 18,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Biggest lift</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginTop: 4 }}>415 lb</div>
              <ACLabel size={11} color="rgba(239,233,218,0.55)">Deadlift · today</ACLabel>
            </div>
            <div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.accent, fontWeight: 700 }}>+10 lb vs Feb</div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{
          marginTop: 18, display: 'flex', gap: 6, overflow: 'auto', paddingBottom: 2,
        }}>
          {['All lifts', 'Squat', 'Bench', 'Deadlift', 'Press', 'Accessory'].map((t, i) => (
            <div key={t} style={{
              padding: '8px 14px', borderRadius: 999,
              background: i === 0 ? c.fg : c.card,
              color: i === 0 ? c.bg : c.fg,
              fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}>{t}</div>
          ))}
        </div>

        {/* Records list */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prs.map((r, i) => (
            <div key={i} style={{
              position: 'relative',
              padding: '16px 16px 16px 18px',
              background: c.card, borderRadius: ACRadii.card,
              display: 'flex', alignItems: 'center', gap: 14,
              overflow: 'hidden',
            }}>
              {r.fresh && (
                <div style={{
                  position: 'absolute', top: 10, right: 12,
                  padding: '3px 7px', fontSize: 9, fontWeight: 700,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  background: c.accent, color: c.ink, borderRadius: 4,
                }}>New</div>
              )}
              <TrophyStamp color={c.fg} accent={c.accent} fresh={r.fresh} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600,
                  letterSpacing: -0.3, color: c.fg,
                }}>{r.lift}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 3 }}>
                  <ACNum size={22} color={r.fresh ? c.accent : c.fg} weight={700}>{r.w}</ACNum>
                  <span style={{ fontSize: 11, color: c.dim, fontFamily: ACFonts.mono }}>{r.u}</span>
                </div>
                <div style={{
                  marginTop: 4, display: 'flex', gap: 10,
                  fontFamily: ACFonts.mono, fontSize: 10, color: c.mute,
                  letterSpacing: 0.3,
                }}>
                  <span>e1RM {r.e1rm}</span>
                  <span>·</span>
                  <span>{r.date}</span>
                  <span>·</span>
                  <span>{r.days}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="workout" dark={dark} HeartMarkComp={HeartMark} />
    </div>
  );
}

export default S20_PR_Gallery;
