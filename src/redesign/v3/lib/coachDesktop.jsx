import React from 'react';
import { ACFonts, ACBrand, useACTheme } from './paper.jsx';

function useCoachTheme() {
  const t = useACTheme();
  return {
    bg: t.paper || ACBrand.paper,
    ink: t.ink || ACBrand.ink,
    accent: t.accent || ACBrand.accent,
  };
}

export function CoachShell({ active, title, breadcrumb, children, actions }) {
  const t = useCoachTheme();
  const nav = [
    { k: 'roster', label: 'Roster', stamp: 'R' },
    { k: 'queue', label: 'Queue', stamp: 'Q', badge: 7 },
    { k: 'library', label: 'Library', stamp: 'L' },
    { k: 'analytics', label: 'Analytics', stamp: 'A' },
    { k: 'settings', label: 'Settings', stamp: 'S' },
  ];

  return (
    <div
      style={{
        width: 1280,
        height: 820,
        background: t.bg,
        color: t.ink,
        fontFamily: ACFonts.body,
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        borderTop: `1px solid ${t.ink}22`,
      }}
    >
      <div
        style={{
          background: t.ink,
          color: t.bg,
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${t.ink}`,
        }}
      >
        <div style={{ padding: '0 20px 24px', display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: ACFonts.brand, fontSize: 18, letterSpacing: -0.6, textTransform: 'lowercase' }}>atlas</span>
          <span style={{ color: t.accent, fontFamily: ACFonts.brand, fontSize: 18 }}>.</span>
          <span style={{ fontFamily: ACFonts.brand, fontSize: 18, letterSpacing: -0.6, textTransform: 'lowercase' }}>core</span>
          <span style={{ marginLeft: 8, fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 2, color: `${t.bg}88`, textTransform: 'uppercase' }}>/ coach</span>
        </div>
        <div style={{ padding: '0 12px 18px' }}>
          <div style={{ height: 1, background: `${t.bg}12` }} />
        </div>
        {nav.map((n) => {
          const on = n.k === active;
          return (
            <div
              key={n.k}
              style={{
                margin: '2px 12px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: on ? `${t.bg}0e` : 'transparent',
                borderLeft: on ? `2px solid ${t.accent}` : '2px solid transparent',
                fontSize: 13,
                fontWeight: on ? 600 : 500,
                color: on ? t.bg : `${t.bg}b0`,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  display: 'grid',
                  placeItems: 'center',
                  background: on ? t.accent : `${t.bg}14`,
                  color: on ? t.ink : t.bg,
                  fontFamily: ACFonts.mono,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {n.stamp}
              </span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge !== undefined && (
                <span
                  style={{
                    fontFamily: ACFonts.mono,
                    fontSize: 9,
                    letterSpacing: 1,
                    padding: '2px 6px',
                    background: t.accent,
                    color: t.ink,
                    fontWeight: 700,
                  }}
                >
                  {n.badge}
                </span>
              )}
            </div>
          );
        })}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '18px 20px 0', borderTop: `1px solid ${t.bg}10` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: t.accent, color: t.ink, display: 'grid', placeItems: 'center', fontFamily: ACFonts.brand, fontSize: 12 }}>
              MK
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.bg }}>Dr. M. Kline</div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.4, color: `${t.bg}70`, textTransform: 'uppercase' }}>coach · 12 clients</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 32px', borderBottom: `1px solid ${t.ink}12`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            {breadcrumb && <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 1.8, color: `${t.ink}80`, textTransform: 'uppercase', marginBottom: 6 }}>{breadcrumb}</div>}
            <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1 }}>{title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{actions}</div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '20px 32px' }}>{children}</div>
      </div>
    </div>
  );
}

export function CMono({ children, size = 11, track = 1.4, color, style }) {
  return <span style={{ fontFamily: ACFonts.mono, fontSize: size, letterSpacing: track, textTransform: 'uppercase', color, ...style }}>{children}</span>;
}

export function CLabel({ children, size = 11, color, style }) {
  return <span style={{ fontFamily: ACFonts.body, fontSize: size, fontWeight: 500, color, ...style }}>{children}</span>;
}

export function CNum({ children, size = 28, color, weight = 700, style }) {
  return <span style={{ fontFamily: ACFonts.display, fontSize: size, fontWeight: weight, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6, color, ...style }}>{children}</span>;
}

export function CBtn({ children, primary, danger, size = 'md', style, icon }) {
  const t = useCoachTheme();
  const pads = { sm: '8px 14px', md: '10px 18px', lg: '14px 22px' };
  const bg = primary ? t.ink : danger ? '#c2391a' : 'transparent';
  const fg = primary || danger ? t.bg : t.ink;
  const border = primary || danger ? 'transparent' : `${t.ink}24`;
  return (
    <button
      type="button"
      style={{
        padding: pads[size],
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        fontFamily: ACFonts.body,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

export function CChip({ children, state, style }) {
  const t = useCoachTheme();
  const palettes = {
    neutral: { bg: `${t.ink}10`, fg: `${t.ink}b0` },
    good: { bg: '#1f4d2e18', fg: '#2a7a47' },
    flag: { bg: `${t.accent}24`, fg: t.ink, dot: t.accent },
    warn: { bg: '#c2391a18', fg: '#c2391a' },
    live: { bg: t.ink, fg: t.bg, dot: t.accent },
  };
  const p = palettes[state] || palettes.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        background: p.bg,
        color: p.fg,
        fontFamily: ACFonts.mono,
        fontSize: 10,
        letterSpacing: 1.2,
        fontWeight: 600,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {p.dot && <span style={{ width: 6, height: 6, background: p.dot, borderRadius: 999 }} />}
      {children}
    </span>
  );
}

export function CAvatar({ name = 'AK', size = 36, accent }) {
  const t = useCoachTheme();
  return (
    <div
      style={{
        width: size,
        height: size,
        background: accent ? t.accent : `${t.ink}10`,
        color: t.ink,
        display: 'grid',
        placeItems: 'center',
        fontFamily: ACFonts.brand,
        fontSize: size * 0.36,
      }}
    >
      {name}
    </div>
  );
}

export function DeskSpark({ data, w = 120, h = 32, color, stroke = 1.6 }) {
  const t = useCoachTheme();
  const col = color ?? t.accent;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1, max - min);
  const pts = data.map((v, i) => [i * (w / (data.length - 1)), h - ((v - min) / span) * (h - 4) - 2]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={col} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
