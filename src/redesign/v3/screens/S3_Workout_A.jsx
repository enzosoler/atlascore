import React from 'react';
import {
  ACFonts, ACRadii, useACT, useACTheme,
  ACDot, ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACBars, ACLine, ACChip,
  ACHeader, ACBrandMark, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag } from '../lib/brandMarks.jsx';

function S3_Workout_A({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Session 24</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: c.fg, marginTop: 2 }}>
            Heavy Lower
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <ACLabel size={11} color={c.dim}>Elapsed</ACLabel>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 18, fontWeight: 600, color: c.accent, marginTop: 2 }}>
            24:18
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px' }}>
        <div style={{ display: 'flex', height: 6, gap: 3, borderRadius: 3, overflow: 'hidden' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              background: i < 3 ? c.accent : (i === 3 ? c.fg : c.faint),
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 22px 20px' }}>
        <div style={{ padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card, marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Now · Exercise 4</ACLabel>
            <ACLabel size={11} color="rgba(239,233,218,0.5)">Last: 215×5</ACLabel>
          </div>
          <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginTop: 8 }}>
            Back Squat
          </div>
          <div style={{ marginTop: 14, borderTop: '1px solid rgba(239,233,218,0.12)' }}>
            {[
              { n: 1, w: 215, r: 5, rpe: 7,   done: true },
              { n: 2, w: 215, r: 5, rpe: 8,   done: true },
              { n: 3, w: 225, r: 5, rpe: 8.5, done: true },
              { n: 4, w: 225, r: 5, rpe: null, done: false, active: true },
              { n: 5, w: 225, r: 5, rpe: null, done: false },
              { n: 6, w: 230, r: 4, rpe: null, done: false },
            ].map(s => (
              <div key={s.n} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                alignItems: 'center', padding: '10px 8px',
                borderBottom: '1px solid rgba(239,233,218,0.08)',
                opacity: s.done ? 0.55 : 1,
                background: s.active ? 'rgba(232,181,0,0.14)' : 'transparent',
                borderRadius: s.active ? 10 : 0,
                margin: s.active ? '2px -8px' : 0,
              }}>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: s.active ? c.accent : 'rgba(239,233,218,0.55)', fontWeight: 600 }}>{String(s.n).padStart(2,'0')}</span>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 600 }}>{s.w} <span style={{ opacity: 0.5, fontSize: 11 }}>lb</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 600 }}>{s.r} <span style={{ opacity: 0.5, fontSize: 11 }}>rep</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 12, color: s.rpe ? c.accent : 'rgba(239,233,218,0.3)', fontWeight: 600 }}>
                  {s.rpe ? `@${s.rpe}` : '—'}
                </div>
                <div style={{ width: 18, height: 18, borderRadius: 6, background: s.done ? c.accent : 'transparent', border: s.done ? 'none' : '1.5px solid rgba(239,233,218,0.3)', justifySelf: 'end' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '15px 0', background: c.accent, color: c.ink, textAlign: 'center', borderRadius: ACRadii.button, fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>
            Log set · 225 × 5
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={12} color={c.dim}>Queue · 4 more</ACLabel>
            <ACLabel size={12} color={c.dim}>Est. 34 min</ACLabel>
          </div>
          {[
            { n: '05', t: 'Romanian deadlift', sx: '4 × 8 · 185 lb' },
            { n: '06', t: 'Bulgarian split squat', sx: '3 × 10 · 45 lb' },
            { n: '07', t: 'Leg curl', sx: '4 × 12' },
            { n: '08', t: 'Standing calf raise', sx: '5 × 15' },
          ].map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <ACLabel size={12} color={c.mute} style={{ fontFamily: ACFonts.mono }}>{e.n}</ACLabel>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: c.fg }}>{e.t}</div>
                <ACLabel size={12} color={c.dim}>{e.sx}</ACLabel>
              </div>
              <div style={{ width: 14, height: 14, borderRadius: 5, background: c.faint }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default S3_Workout_A;
