import React from 'react';
import {
  ACFonts, useACT,
  ACLabel, ACBrandMark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/**
 * S30_Weekly_Recap — editorial weekly digest (poster format).
 *
 * Gallery:    <S30_Weekly_Recap dark />
 * Production: <S30_Weekly_Recap dark weekLabel="WK 16 · SUN 19 APR"
 *               issueNumber={16} heroLines={['you','showed','up.']}
 *               tagline="Five sessions..." stats={[...]} headline="..."
 *               dailyBars={[{d,v,hi?},...]} moments={[{d,t,hi?},...]}
 *               nextWeekLabel="Next issue · wk 17" nextWeekText="..."
 *               onClose={fn} onGoToday={fn} />
 *
 * stats: [{k, v, sub, hi?}]
 * dailyBars: [{d, v, hi?}] — v is 0–100 (relative %)
 * moments: [{d, t, hi?}]
 */

const DEMO_STATS = [
  { k: 'Sessions', v: '5',    sub: 'of 5 planned', hi: true },
  { k: 'Tonnes',   v: '52',   sub: '+8 vs last',   hi: true },
  { k: 'Protein',  v: '94%',  sub: 'of target' },
  { k: 'Sleep',    v: '7:08', sub: '−0:22' },
];

const DEMO_BARS = [
  { d: 'M', v: 55 },
  { d: 'T', v: 0 },
  { d: 'W', v: 72 },
  { d: 'T', v: 40 },
  { d: 'F', v: 35 },
  { d: 'S', v: 95, hi: true },
  { d: 'S', v: 0 },
];

const DEMO_MOMENTS = [
  { d: 'MON', t: 'Heavy Upper · 4 sets @ RPE 9' },
  { d: 'WED', t: 'Sleep dropped to 6:12 · we rescheduled Heavy Pull' },
  { d: 'FRI', t: 'Hit 186g protein target · first time this block' },
  { d: 'SAT', t: 'Deadlift 415 lb · all-time record', hi: true },
];

export default function S30_Weekly_Recap({
  dark = false,
  noData = false,
  weekLabel = 'WK 16 · SUN 19 APR',
  issueNumber = 16,
  heroLines = ['you', 'showed', 'up.'],
  tagline = 'Five sessions. One record. Protein held. Sleep slipped Thursday — we noticed.',
  stats,
  headline = 'You pulled 415 on Saturday. That\'s 58 days after the last ceiling — and eighteen weeks of deadlift work paid out.',
  highlightValue,
  dailyBars,
  moments,
  nextWeekLabel = 'Next issue · wk 17',
  nextWeekText = 'Deload week. Volume drops 40%, intensity holds. Your nervous system earned it.',
  onClose,
  onGoToday,
}) {
  const c = useACT(dark);
  const _stats = stats || DEMO_STATS;
  const _bars = dailyBars || DEMO_BARS;
  const _moments = moments || DEMO_MOMENTS;
  const issueStr = String(issueNumber).padStart(3, '0');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.ink, color: '#efe9da' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke="#efe9da" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7 }}>{weekLabel}</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '22px 22px 30px' }}>
        {noData ? (
          <>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.accent, letterSpacing: 1, fontWeight: 700 }}>
              ISSUE 000 · THE WEEK IN REVIEW
            </div>
            <div style={{
              marginTop: 12, fontFamily: ACFonts.brand, fontSize: 56, lineHeight: 0.85,
              letterSpacing: -2.5, textTransform: 'lowercase',
              color: '#efe9da',
            }}>
              no week
              <br />
              <span style={{ color: c.accent }}>yet</span>.
            </div>
            <div style={{
              marginTop: 14, fontSize: 13, color: 'rgba(239,233,218,0.65)',
              lineHeight: 1.5, maxWidth: 280,
            }}>
              Finish a few real sessions and atlas.core will turn them into a weekly recap here.
            </div>
            <div style={{
              marginTop: 24, padding: 18,
              border: `1px solid ${c.accent}`,
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
                ── What unlocks this
              </div>
              <div style={{ marginTop: 10, fontSize: 14, color: '#efe9da', lineHeight: 1.55 }}>
                Logged training, food, and recovery patterns across a real week.
              </div>
              <button type="button" onClick={onGoToday} style={{ marginTop: 14, padding: '10px 16px', borderRadius: 999, border: 'none', background: c.accent, color: c.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Go to today →
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Big poster title */}
            <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.accent, letterSpacing: 1, fontWeight: 700 }}>
              ISSUE {issueStr} · THE WEEK IN REVIEW
            </div>
            <div style={{
              marginTop: 12, fontFamily: ACFonts.brand, fontSize: 56, lineHeight: 0.85,
              letterSpacing: -2.5, textTransform: 'lowercase',
              color: '#efe9da',
            }}>
              {heroLines[0]}
              {heroLines.length > 1 && <><br /><span style={{ color: c.accent }}>{heroLines[1]}</span></>}
              {heroLines.length > 2 && <><br />{heroLines[2]}</>}
            </div>
            <div style={{
              marginTop: 14, fontSize: 13, color: 'rgba(239,233,218,0.65)',
              lineHeight: 1.5, maxWidth: 260,
            }}>
              {tagline}
            </div>

            {/* Stat strip */}
            <div style={{
              marginTop: 24, display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 0,
              borderTop: '1px solid rgba(239,233,218,0.18)',
              borderBottom: '1px solid rgba(239,233,218,0.18)',
            }}>
              {_stats.map((m, i) => (
                <div key={i} style={{
                  padding: '18px 14px',
                  borderLeft: i % 2 === 1 ? '1px solid rgba(239,233,218,0.18)' : 'none',
                  borderTop: i >= 2 ? '1px solid rgba(239,233,218,0.18)' : 'none',
                }}>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.55)', letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</div>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
                    letterSpacing: -1.2, marginTop: 6, lineHeight: 1,
                    color: m.hi ? c.accent : '#efe9da',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{m.v}</div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.45)', marginTop: 4, letterSpacing: 0.3 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Headline of the week */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
                ── The headline
              </div>
              <div style={{
                marginTop: 10, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
                letterSpacing: -0.6, lineHeight: 1.2, color: '#efe9da',
              }}>
                {headline}
              </div>
            </div>

            {/* Day bars */}
            <div style={{ marginTop: 26 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
                ── Daily tonnage
              </div>
              <div style={{
                marginTop: 14, display: 'flex', gap: 6, height: 100,
                alignItems: 'flex-end',
              }}>
                {_bars.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: '100%', height: b.v > 0 ? `${b.v}%` : 2,
                      background: b.hi ? c.accent : (b.v === 0 ? 'rgba(239,233,218,0.15)' : '#efe9da'),
                    }} />
                    <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: b.hi ? c.accent : 'rgba(239,233,218,0.5)', fontWeight: 700 }}>{b.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moments feed */}
            <div style={{ marginTop: 26 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
                ── Moments
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {_moments.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 14, paddingBottom: 14,
                    borderBottom: '1px solid rgba(239,233,218,0.12)',
                  }}>
                    <div style={{
                      fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
                      color: m.hi ? c.accent : 'rgba(239,233,218,0.55)',
                      letterSpacing: 0.5, width: 34,
                    }}>{m.d}</div>
                    <div style={{
                      flex: 1, fontSize: 13.5, lineHeight: 1.5,
                      color: m.hi ? c.accent : 'rgba(239,233,218,0.85)',
                      fontWeight: m.hi ? 600 : 400,
                    }}>{m.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kicker / next week */}
            <div style={{
              marginTop: 26, padding: 18,
              border: `1px solid ${c.accent}`,
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>
                ── {nextWeekLabel}
              </div>
              <div style={{ marginTop: 10, fontSize: 14, color: '#efe9da', lineHeight: 1.55 }}>
                {nextWeekText}
              </div>
            </div>

            {/* Footer credit */}
            <div style={{
              marginTop: 30, paddingTop: 16,
              borderTop: '1px solid rgba(239,233,218,0.18)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <ACBrandMark size={12} dark={true} HeartMarkComp={HeartMark} />
              <ACLabel size={9} color="rgba(239,233,218,0.45)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7 }}>
                END / ISSUE {issueStr}
              </ACLabel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
