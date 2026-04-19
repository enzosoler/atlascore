import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

function EmptyFirstWorkout({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      {/* Big empty barbell stamp */}
      <div style={{
        width: 160, height: 160, borderRadius: 18,
        border: `1.5px dashed ${c.faint}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
          <rect x="12" y="43" width="72" height="5" fill={c.fg} opacity="0.4" />
          <rect x="16" y="33" width="6" height="25" fill={c.fg} opacity="0.4" />
          <rect x="74" y="33" width="6" height="25" fill={c.fg} opacity="0.4" />
          <rect x="9"  y="38" width="4" height="15" fill={c.fg} opacity="0.25" />
          <rect x="83" y="38" width="4" height="15" fill={c.fg} opacity="0.25" />
        </svg>
        <div style={{
          position: 'absolute', bottom: -10, padding: '4px 10px',
          background: c.accent, color: c.ink,
          fontSize: 9, fontWeight: 700, letterSpacing: 0.7,
          borderRadius: 4, textTransform: 'uppercase',
        }}>
          Day 000
        </div>
      </div>

      <div style={{
        marginTop: 40, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1, color: c.fg, maxWidth: 280,
      }}>
        Your wall is <span style={{ color: c.accent }}>empty</span>.
      </div>
      <div style={{
        marginTop: 12, fontSize: 14.5, color: c.dim, lineHeight: 1.55,
        maxWidth: 280,
      }}>
        Log your first set. Every PR here started as zero. We'll build the system around you.
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <ACBtn primary dark={dark} size="lg" pill block>Start first workout →</ACBtn>
        <div style={{
          textAlign: 'center', padding: 8,
          fontSize: 13, fontWeight: 500, color: c.dim,
        }}>
          or <span style={{ color: c.fg, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>import from Hevy / Strong</span>
        </div>
      </div>
    </div>
  );
}

function EmptyNoData({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'stretch', padding: '0 8px',
    }}>
      <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        ApoB · 24 months
      </ACLabel>

      {/* Flatline chart with 'waiting' treatment */}
      <div style={{
        marginTop: 12, padding: 20, background: c.card,
        borderRadius: ACRadii.card, position: 'relative',
        overflow: 'hidden',
      }}>
        <svg width="100%" height="120" viewBox="0 0 280 120" fill="none">
          {[0, 1, 2, 3].map(i => (
            <line key={i} x1="0" x2="280" y1={24 + i * 24} y2={24 + i * 24}
              stroke={c.hair} strokeDasharray="2 4" />
          ))}
          {/* dashed horizontal skeleton line */}
          <line x1="0" x2="280" y1="72" y2="72"
            stroke={c.mute} strokeWidth="2" strokeDasharray="6 6" />
          {/* pending marker */}
          <circle cx="240" cy="72" r="5" fill={c.accent} />
          <circle cx="240" cy="72" r="10" fill="none" stroke={c.accent} strokeWidth="1.5" opacity="0.4" />
        </svg>
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '4px 9px', fontSize: 10, fontWeight: 700,
          letterSpacing: 0.5, textTransform: 'uppercase',
          background: c.accent, color: c.ink, borderRadius: 4,
        }}>Pending</div>
      </div>

      <div style={{
        marginTop: 24, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
        letterSpacing: -0.6, color: c.fg, lineHeight: 1.1,
      }}>
        No readings yet.
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: c.dim, lineHeight: 1.55 }}>
        Your first ApoB result will plot here. Function Health panels ship in 5–7 business days.
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex', gap: 8, marginTop: 18,
      }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="md" pill block>Remind me</ACBtn>
        </div>
        <div style={{ flex: 1.2 }}>
          <ACBtn primary dark={dark} size="md" pill block>Order panel →</ACBtn>
        </div>
      </div>
    </div>
  );
}

function EmptyOffline({ c, dark }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 8px',
    }}>
      {/* Severed ECG line as offline metaphor */}
      <div style={{ width: '100%', padding: '0 10px' }}>
        <svg width="100%" height="64" viewBox="0 0 280 64" fill="none">
          {/* left trace */}
          <path d="M0 32 L40 32 L50 24 L60 40 L70 32 L100 32"
            stroke={c.fg} strokeWidth="2" strokeLinejoin="miter" opacity="0.6" />
          {/* gap marker */}
          <line x1="118" y1="32" x2="162" y2="32" stroke={c.accent}
            strokeWidth="2" strokeDasharray="4 4" />
          {/* right trace */}
          <path d="M180 32 L210 32 L220 24 L230 40 L240 32 L280 32"
            stroke={c.fg} strokeWidth="2" strokeLinejoin="miter" opacity="0.6" />
          {/* end dots */}
          <circle cx="118" cy="32" r="4" fill={c.accent} />
          <circle cx="162" cy="32" r="4" fill={c.accent} />
        </svg>
      </div>

      <div style={{
        marginTop: 32, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1, lineHeight: 1, color: c.fg, maxWidth: 280,
      }}>
        Signal <span style={{ color: c.accent }}>lost</span>.
      </div>
      <div style={{
        marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55,
        maxWidth: 280,
      }}>
        You're offline. Everything you log stays safe on this device and syncs when you're back.
      </div>

      {/* Local queue readout */}
      <div style={{
        marginTop: 26, padding: 14,
        background: c.card, borderRadius: ACRadii.card,
        width: '100%', maxWidth: 280,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: 2, background: c.accent,
          }} />
          <div style={{ textAlign: 'left' }}>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Queued locally</ACLabel>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.fg, marginTop: 2 }}>
              4 sets · 1 meal
            </div>
          </div>
        </div>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>00:04:12 ago</ACLabel>
      </div>

      <div style={{ marginTop: 20, width: '100%' }}>
        <ACBtn dark={dark} size="lg" pill block>Retry connection</ACBtn>
      </div>
    </div>
  );
}

function S23_Empty_States({ dark = false }) {
  const c = useACT(dark);
  const [active, setActive] = React.useState('first-workout');
  const states = {
    'first-workout': <EmptyFirstWorkout c={c} dark={dark} />,
    'no-data':       <EmptyNoData c={c} dark={dark} />,
    'offline':       <EmptyOffline c={c} dark={dark} />,
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>System states</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Empty &amp; edges
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 22px 0', display: 'flex', gap: 6 }}>
        {[
          { k: 'first-workout', l: 'First run' },
          { k: 'no-data',       l: 'No data' },
          { k: 'offline',       l: 'Offline' },
        ].map(t => {
          const on = t.k === active;
          return (
            <button key={t.k} type="button" onClick={() => setActive(t.k)} style={{
              flex: 1, padding: '9px 0', textAlign: 'center',
              background: on ? c.fg : c.card,
              color: on ? c.bg : c.fg,
              fontSize: 12, fontWeight: 600, borderRadius: 999,
              cursor: 'pointer', border: 'none',
            }}>{t.l}</button>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '18px 22px 20px', display: 'flex' }}>
        {states[active]}
      </div>
    </div>
  );
}

export default S23_Empty_States;
