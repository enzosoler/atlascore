import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACChip, ACBtn,
} from '../lib/paper.jsx';

export default function S34_Watch({ dark = false }) {
  const c = useACT(dark);
  // Draw a 44mm-ish pitch-black watch face floating on the screen.
  // Phone context around it: "mirroring to watch"
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Companion · watch</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            On the wrist
          </div>
        </div>
        <ACChip accent dark={dark} dot>Live</ACChip>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 22px 0' }}>
        {/* Watch device frame */}
        <div style={{
          width: 200, height: 240, position: 'relative',
          filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.3))',
        }}>
          {/* side crown */}
          <div style={{
            position: 'absolute', right: -6, top: 70,
            width: 10, height: 30, borderRadius: 4,
            background: '#222',
          }} />
          <div style={{
            position: 'absolute', right: -4, top: 112,
            width: 6, height: 18, borderRadius: 2,
            background: '#333',
          }} />
          {/* watch body */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#0a0a0a', borderRadius: 46,
            border: '3px solid #1a1a1a',
            overflow: 'hidden',
          }}>
            {/* Face content */}
            <div style={{
              position: 'absolute', inset: 14,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Top: set counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: '#efe9da', opacity: 0.55, letterSpacing: 0.6, fontWeight: 700 }}>DEADLIFT</span>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.accent, letterSpacing: 0.5, fontWeight: 700 }}>SET 4/5</span>
              </div>

              {/* Center weight */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 62, fontWeight: 700,
                  letterSpacing: -3, lineHeight: 1, color: '#efe9da',
                  fontVariantNumeric: 'tabular-nums',
                }}>415</div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.accent, letterSpacing: 0.5, fontWeight: 700, marginTop: 2 }}>LB × 1 · PR</div>
              </div>

              {/* Bottom: rest timer ring + HR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 42, height: 42 }}>
                  <svg width="42" height="42" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="18" stroke="rgba(239,233,218,0.15)" strokeWidth="3" fill="none"/>
                    <circle cx="21" cy="21" r="18" stroke={c.accent} strokeWidth="3" fill="none"
                      strokeDasharray={`${2 * Math.PI * 18 * 0.62} ${2 * Math.PI * 18}`}
                      transform="rotate(-90 21 21)" strokeLinecap="butt"/>
                  </svg>
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: ACFonts.display, fontSize: 12, fontWeight: 700, color: '#efe9da',
                    letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums',
                  }}>1:24</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700,
                    color: '#efe9da', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums',
                  }}>132</div>
                  <div style={{ fontFamily: ACFonts.mono, fontSize: 8, color: 'rgba(239,233,218,0.5)', letterSpacing: 0.5, fontWeight: 600 }}>BPM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* strap hint */}
        <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.7, marginTop: 16, fontWeight: 600 }}>
          44 MM · SERIES 10 · MIRRORED
        </div>

        {/* Phone view — what's mirroring */}
        <div style={{
          marginTop: 28, width: '100%', padding: 18,
          background: c.card, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Mirroring to watch
          </ACLabel>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { k: 'During set', v: 'Weight · reps · BPM', on: true },
              { k: 'Between sets', v: 'Rest timer + next target', on: true },
              { k: 'Haptic at rest-end', v: 'Double tap · 0:00', on: true },
              { k: 'Raise-to-log reps', v: 'Auto-count', on: false },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 8, height: 8,
                  background: r.on ? c.accent : c.faint,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.fg }}>{r.k}</div>
                  <ACLabel size={11} color={c.dim} style={{ marginTop: 1, display: 'block' }}>{r.v}</ACLabel>
                </div>
                <ACLabel size={10} color={r.on ? c.accent : c.mute} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5 }}>
                  {r.on ? 'ON' : 'OFF'}
                </ACLabel>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px 22px' }}>
        <ACBtn dark={dark} size="lg" pill block>Open in Watch app →</ACBtn>
      </div>
    </div>
  );
}
