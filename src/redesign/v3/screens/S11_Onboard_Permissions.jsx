import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';

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

// Real brand-ish icons for permission cards.
function PermIcon({ k, on }) {
  // Apple Health — white rounded square w/ pink heart (brand-accurate)
  if (k === 'health') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#fff',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 18.5s-7-4.3-7-9.4a4.3 4.3 0 0 1 7-3.3 4.3 4.3 0 0 1 7 3.3c0 5.1-7 9.4-7 9.4Z"
          fill="#FF2D55" />
      </svg>
    </div>
  );
  // Notifications — iOS bell in accent-filled rounded square
  if (k === 'notif') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#FF3B30',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3c-3 0-5 2.2-5 5v2.5L3.5 13h13L15 10.5V8c0-2.8-2-5-5-5Z"
          stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M8 15a2 2 0 0 0 4 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
  // Whoop — black disc with bold white W
  if (k === 'whoop') return (
    <div style={{
      width: 38, height: 38, borderRadius: 999,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Archivo Black", sans-serif',
      color: '#fff', fontSize: 17, letterSpacing: -0.5,
      lineHeight: 1,
    }}>W</div>
  );
  return null;
}

function S11_Onboard_Permissions({ dark = false, onBack, onContinue, onSkip }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={5} total={10} dark={dark} onBack={onBack} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Connect</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Connect your sources.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          atlas.core reads signal — never writes without asking.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              k: 'health',
              t: 'Apple Health',
              d: 'HRV, sleep, steps, heart rate',
              status: 'Connected', on: true,
            },
            {
              k: 'notif',
              t: 'Notifications',
              d: 'Coach check-ins, workout reminders',
              status: 'Enable', on: false,
            },
            {
              k: 'whoop',
              t: 'Whoop / Oura',
              d: 'Optional · import recovery scores',
              status: 'Skip for now', on: false, muted: true,
            },
          ].map((p, i) => (
            <div key={i} style={{
              padding: 18, borderRadius: ACRadii.card,
              background: c.card,
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: p.muted ? 0.6 : 1,
            }}>
              <PermIcon k={p.k} on={p.on} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{p.t}</div>
                <ACLabel size={12} color={c.dim}>{p.d}</ACLabel>
              </div>
              <ACChip accent={p.on} dark={dark}>{p.status}</ACChip>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 22, padding: '14px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Privacy</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            All data stays on-device by default. Cloud sync is opt-in, encrypted, and exportable.
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={onContinue}>Continue →</ACBtn>
        <div style={{ textAlign: 'center', padding: 4 }}>
          <button type="button" onClick={onSkip} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
            <ACLabel size={12} color={c.dim}>Skip for now</ACLabel>
          </button>
        </div>
      </div>
    </div>
  );
}

export default S11_Onboard_Permissions;
