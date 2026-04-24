import React from 'react';
import { ACFonts, ACRadii, ACLabel, ACBtn, useACT } from '../lib/paper.jsx';
import { OnboardingHeader } from './onboardingShared.jsx';

export default function S73_Import({ dark = false }) {
  const c = useACT(dark);
  const [picked, setPicked] = React.useState('mf');
  const sources = [
    { k: 'mf', t: 'MacroFactor', sub: '14 mo · 1,204 logs', stamp: 'MF', hot: true },
    { k: 'mfp', t: 'MyFitnessPal', sub: 'Full history', stamp: 'MP' },
    { k: 'strong', t: 'Strong', sub: 'Workouts · 240 sess', stamp: 'ST' },
    { k: 'hevy', t: 'Hevy', sub: 'Workouts + PRs', stamp: 'HV' },
    { k: 'apple', t: 'Apple Health', sub: 'Weight · sleep · HR', stamp: 'AH' },
    { k: 'file', t: 'CSV / JSON file', sub: 'Custom export', stamp: '··' },
  ];
  const selected = sources.find((s) => s.k === picked);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OnboardingHeader step={2} total={6} dark={dark} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Bring your history</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05, color: c.fg }}>Don't start<br />from zero.</div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>Your old app's data becomes your new baseline. Import once, own it forever.</div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sources.map((s) => {
            const on = picked === s.k;
            return (
              <div key={s.k} onClick={() => setPicked(s.k)} style={{ padding: '14px 16px', borderRadius: ACRadii.card, background: on ? c.fg : c.card, color: on ? c.bg : c.fg, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 34, height: 34, background: on ? c.accent : `${c.fg}12`, color: c.fg, display: 'grid', placeItems: 'center', fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700 }}>{s.stamp}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s.t}</span>
                    {s.hot && <span style={{ padding: '2px 6px', background: on ? c.accent : `${c.accent}30`, color: on ? c.fg : c.accent, fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.2, fontWeight: 700 }}>POPULAR</span>}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 2, opacity: on ? 0.6 : 0.55 }}>{s.sub}</div>
                </div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14 }}>{on ? '●' : '○'}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, padding: '14px 16px', background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>{selected.t} → atlas.core</ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              ['foods · meals', true], ['daily totals', true], ['body weight', true],
              ['macro targets', true], ['workouts', selected.k === 'strong' || selected.k === 'hevy'], ['coach chat', false],
            ].map(([k, ok]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                <span style={{ width: 14, height: 14, display: 'grid', placeItems: 'center', background: ok ? c.fg : `${c.fg}14`, color: ok ? c.bg : c.dim, fontFamily: ACFonts.mono, fontSize: 9, fontWeight: 700 }}>{ok ? '✓' : '—'}</span>
                <span style={{ color: ok ? c.fg : c.dim }}>{k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Connect {selected.t} →</ACBtn>
        <div style={{ textAlign: 'center', paddingTop: 10 }}><ACLabel size={12} color={c.dim}>Skip — I'll start fresh</ACLabel></div>
      </div>
    </div>
  );
}

