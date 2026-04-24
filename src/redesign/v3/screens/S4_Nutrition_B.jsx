import React from 'react';
import { ACRadii, useACT, ACLabel, ACChip } from '../lib/paper.jsx';

export default function S4_Nutrition_B({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderLeft: `2px solid ${c.fg}`, borderBottom: `2px solid ${c.fg}`, transform: 'rotate(45deg) translate(2px, -2px)' }} />
        <ACLabel size={13} color={c.fg} style={{ fontWeight: 500 }}>Add to Breakfast</ACLabel>
      </div>
      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ padding: '14px 16px', background: c.card, borderRadius: ACRadii.input, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke={c.dim} strokeWidth="2" /><path d="M11 11l3 3" stroke={c.dim} strokeWidth="2" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 15, color: c.fg }}>greek</span>
          <div style={{ width: 1, height: 18, background: c.accent }} />
        </div>
      </div>
      <div style={{ padding: '0 22px 18px', display: 'flex', gap: 8 }}>
        {['Scan', 'Camera', 'Voice', 'Recents'].map((t) => (
          <div key={t} style={{ flex: 1, padding: '14px 0', borderRadius: ACRadii.input, background: c.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: c.fg, opacity: 0.85 }} />
            <ACLabel size={11} color={c.fg} style={{ fontWeight: 500 }}>{t}</ACLabel>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 22px 8px' }}><ACLabel size={12} color={c.dim}>Results · 6</ACLabel></div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {[
          { t: 'Greek yogurt, Fage 0%', d: '1 cup · 245g', k: 140, ai: true },
          { t: 'Greek yogurt, plain whole', d: '1 cup · 245g', k: 220 },
          { t: 'Greek salad', d: 'Restaurant · avg', k: 285 },
          { t: 'Greek chicken pita', d: "Trader Joe's", k: 410 },
          { t: 'Greek olives, kalamata', d: '10 olives · 35g', k: 58 },
          { t: 'Greek seasoning', d: '1 tsp', k: 5 },
        ].map((r) => (
          <div key={r.t} style={{ padding: '14px 0', borderBottom: `1px solid ${c.hair}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 15, color: c.fg }}>{r.t}</div>
                {r.ai && <ACChip accent dark={dark}>AI</ACChip>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <ACLabel size={12} color={c.dim}>{r.d}</ACLabel>
                <ACLabel size={12} color={c.dim}>·</ACLabel>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{r.k} kcal</ACLabel>
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: c.fg, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500 }}>+</div>
          </div>
        ))}
      </div>
    </div>
  );
}
