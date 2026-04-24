/**
 * v3 paper design system primitives — translated from the Claude Design
 * canvas (atlas-core/screens-lib.jsx). Editorial paper+ink+amber aesthetic.
 *
 * Vocabulary
 *   paper  = #efe9da background in light mode
 *   ink    = #0a0a0a foreground/background flip in dark mode
 *   amber  = #e8b500 (sulfur) accent — the only chromatic color in the system
 *
 * Typography
 *   display: SF Pro Display — numbers, headlines, anything big
 *   body   : SF Pro Text    — body, labels, UI
 *   mono   : SF Mono fallback JetBrains Mono — data, timestamps, codes
 *   brand  : Archivo Black  — splash, manifesto, logo lockups ONLY
 *
 * Theme contract
 *   useACT(dark) returns the resolved palette for the current variant. The
 *   global useACTheme() hook reads from a React context (PaperThemeProvider).
 *   Falls back to a sensible default if the provider is missing so subtree
 *   previews work in isolation (Storybook, gallery cards).
 */

import React, { createContext, useContext, useMemo } from 'react';

// ── design tokens ─────────────────────────────────────────────
export const ACFonts = {
  display: '-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif',
  body:    '-apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif',
  mono:    'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
  brand:   '"Archivo Black", "Arial Black", sans-serif',
};

export const ACRadii = {
  chip:   8,
  button: 12,
  input:  14,
  card:   18,
  sheet:  24,
};

// Brand palette — single source of truth. Light = paper, dark = ink, accent = amber.
export const ACBrand = {
  paper:  '#efe9da',
  ink:    '#0a0a0a',
  accent: '#e8b500',
  error:  '#c65b4b',
  ecg:    'classic', // 'classic' | 'sharp' | 'flat'
};

// ── theme context ─────────────────────────────────────────────
const PaperThemeContext = createContext(ACBrand);

export function PaperThemeProvider({ value, children }) {
  const merged = useMemo(() => ({ ...ACBrand, ...(value || {}) }), [value]);
  return <PaperThemeContext.Provider value={merged}>{children}</PaperThemeContext.Provider>;
}

export function useACTheme() {
  return useContext(PaperThemeContext);
}

/**
 * Resolve full palette for a given variant.
 * dark=false → paper background, ink foreground.
 * dark=true  → ink background, paper foreground.
 * accent stays amber regardless.
 */
export function useACT(dark) {
  const t = useACTheme();
  return useMemo(() => ({
    bg:    dark ? t.ink : t.paper,
    fg:    dark ? t.paper : t.ink,
    dim:   dark ? 'rgba(239,233,218,0.68)' : 'rgba(10,10,10,0.64)',
    mute:  dark ? 'rgba(239,233,218,0.50)' : 'rgba(10,10,10,0.48)',
    faint: dark ? 'rgba(239,233,218,0.20)' : 'rgba(10,10,10,0.16)',
    hair:  dark ? 'rgba(239,233,218,0.12)' : 'rgba(10,10,10,0.10)',
    card:  dark ? '#19150f' : '#e7dec6',
    card2: dark ? '#231c14' : '#ddd1b3',
    accent: t.accent,
    ink: t.ink,
    paper: t.paper,
    ecg: t.ecg,
  }), [dark, t]);
}

// ── tiny atoms ────────────────────────────────────────────────
export function ACDot({ size = 8, color, style }) {
  const t = useACTheme();
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        background: color ?? t.accent,
        ...style,
      }}
    />
  );
}

export function ACLabel({ children, size = 11, track = 0.3, color, style }) {
  return (
    <span
      style={{
        fontFamily: ACFonts.body,
        fontSize: size,
        letterSpacing: track,
        fontWeight: 500,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function ACMono({ children, size = 11, track = 0.4, color, style }) {
  return (
    <span
      style={{
        fontFamily: ACFonts.mono,
        fontSize: size,
        letterSpacing: track,
        fontWeight: 500,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Numbers — SF Pro Display with tabular figures. Tighten letter-spacing as size grows. */
export function ACNum({ children, size = 48, color, weight = 700, style }) {
  return (
    <span
      style={{
        fontFamily: ACFonts.display,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: size > 40 ? -size * 0.035 : -size * 0.02,
        lineHeight: 0.95,
        fontVariantNumeric: 'tabular-nums',
        color,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Standard button — primary fills with amber, default is a flat panel. */
export function ACBtn({
  children, primary, dark, block, style, size = 'md', pill, onClick, type = 'button', disabled = false,
}) {
  const c = useACT(dark);
  const pads = { sm: '10px 16px', md: '14px 20px', lg: '18px 24px' };
  const fs   = { sm: 14, md: 16, lg: 17 };
  const bg = primary ? c.accent : (dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.05)');
  const fg = primary ? c.ink : c.fg;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : undefined,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: pads[size],
        background: bg,
        color: fg,
        border: 'none',
        fontFamily: ACFonts.body,
        fontSize: fs[size],
        fontWeight: 600,
        letterSpacing: -0.2,
        borderRadius: pill ? 999 : ACRadii.button,
        cursor: disabled ? 'not-allowed' : 'pointer',
        WebkitAppearance: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── ECG sparkline (reusable, any width/height) ────────────────
export function ACSpark({ w = 280, h = 40, color, stroke = 2, data, dark }) {
  const c = useACT(dark);
  const col = color ?? c.accent;
  const d = data ?? [
    50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
    45, 55, 20, 80, 30, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 45, 55, 20, 80, 30, 50, 50, 50,
  ];
  const step = w / (d.length - 1);
  const pts = d.map((v, i) => `${i * step},${(v / 100) * h}`).join(' L ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path
        d={`M ${pts}`}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

// ── readiness ring — thick, segmented, no gradient ────────────
export function ACRing({ size = 220, value = 87, dark, thickness = 12, color }) {
  const c = useACT(dark);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={dark ? 'rgba(239,233,218,0.14)' : 'rgba(10,10,10,0.12)'}
        strokeWidth={thickness}
      />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color ?? c.accent}
        strokeWidth={thickness}
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(-90 ${cx} ${cx})`}
        strokeLinecap="butt"
      />
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * (r + thickness / 2 + 2);
        const y1 = cx + Math.sin(a) * (r + thickness / 2 + 2);
        const x2 = cx + Math.cos(a) * (r + thickness / 2 + 6);
        const y2 = cx + Math.sin(a) * (r + thickness / 2 + 6);
        return (
          <line
            key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={dark ? 'rgba(239,233,218,0.3)' : 'rgba(10,10,10,0.25)'}
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

// ── chunky horizontal bar chart ───────────────────────────────
export function ACBars({ data, w = 320, h = 120, dark, labelFmt = (x) => x }) {
  const c = useACT(dark);
  const max = Math.max(...data.map((d) => d.v));
  const bw = (w - (data.length - 1) * 6) / data.length;
  return (
    <div style={{ width: w }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: h }}>
        {data.map((d, i) => {
          const bh = Math.max(6, (d.v / max) * h);
          return (
            <div key={i} style={{ width: bw, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ height: h - bh }} />
              <div style={{ height: bh, background: d.hl ? c.accent : c.fg }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ width: bw, textAlign: 'center' }}>
            <ACMono size={9} color={d.hl ? c.accent : c.dim}>
              {labelFmt(d.k)}
            </ACMono>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── line chart for weight trend (raw points + 7-day MA) ───────
export function ACLine({ data, w = 340, h = 140, dark, highlightLast = true }) {
  const c = useACT(dark);
  const safeWidth = Number.isFinite(w) && w > 0 ? w : 340;
  const safeHeight = Number.isFinite(h) && h > 0 ? h : 140;
  const innerHeight = Math.max(1, safeHeight - 20);
  const sanitizedData = Array.isArray(data)
    ? data
      .map((point, index) => {
        const value = Number(point?.v);
        if (!Number.isFinite(value)) return null;
        return { ...point, v: value, k: point?.k ?? index };
      })
      .filter(Boolean)
    : [];

  const gridYs = [0, 0.5, 1]
    .map((v) => safeHeight * (1 - v) - 5)
    .filter((value) => Number.isFinite(value));

  if (sanitizedData.length === 0) {
    return (
      <svg width={safeWidth} height={safeHeight} style={{ display: 'block' }}>
        {gridYs.map((y, i) => (
          <line
            key={i}
            x1="0"
            x2={safeWidth}
            y1={y}
            y2={y}
            stroke={c.hair}
            strokeDasharray="2 4"
          />
        ))}
      </svg>
    );
  }

  const vs = sanitizedData.map((d) => d.v);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const span = max - min || 1;
  const step = sanitizedData.length > 1 ? safeWidth / (sanitizedData.length - 1) : 0;
  const toY = (value) => safeHeight - ((value - min) / span) * innerHeight - 10;
  const pts = sanitizedData
    .map((d, i) => [i * step, toY(d.v)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const path = pts.length > 1
    ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
    : '';
  const ma = sanitizedData.map((_, i) => {
    const slice = sanitizedData.slice(Math.max(0, i - 6), i + 1);
    return slice.reduce((s, d) => s + d.v, 0) / slice.length;
  });
  const maPts = ma
    .map((v, i) => [i * step, toY(v)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  const maPath = maPts.length > 1
    ? maPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
    : '';

  const hasRenderablePoints = pts.length > 0 || maPts.length > 0;
  if (!hasRenderablePoints) {
    return (
      <svg width={safeWidth} height={safeHeight} style={{ display: 'block' }}>
        {gridYs.map((y, i) => (
          <line
            key={i}
            x1="0"
            x2={safeWidth}
            y1={y}
            y2={y}
            stroke={c.hair}
            strokeDasharray="2 4"
          />
        ))}
      </svg>
    );
  }

  return (
    <svg width={safeWidth} height={safeHeight} style={{ display: 'block' }}>
      {gridYs.map((y, i) => (
        <line
          key={i} x1="0" x2={safeWidth}
          y1={y} y2={y}
          stroke={c.hair} strokeDasharray="2 4"
        />
      ))}
      {path ? <path d={path} fill="none" stroke={c.dim} strokeWidth="1.5" strokeDasharray="2 2" /> : null}
      {maPath ? <path d={maPath} fill="none" stroke={c.fg} strokeWidth="2.5" strokeLinejoin="miter" /> : null}
      {pts.map((p, i) => {
        const last = i === pts.length - 1;
        return (
          <rect
            key={i} x={p[0] - 2} y={p[1] - 2} width="4" height="4"
            fill={last && highlightLast ? c.accent : c.dim}
          />
        );
      })}
    </svg>
  );
}

// ── status chip ───────────────────────────────────────────────
export function ACChip({ children, accent, dark, inverse, dot, style }) {
  const c = useACT(dark);
  const bg = accent ? c.accent
           : inverse ? c.fg
           : (dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.05)');
  const fg = accent ? c.ink : (inverse ? c.bg : c.fg);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        background: bg,
        color: fg,
        borderRadius: ACRadii.chip,
        fontFamily: ACFonts.body,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: -0.1,
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6, height: 6, borderRadius: 999,
            background: accent ? c.ink : c.accent,
          }}
        />
      )}
      {children}
    </span>
  );
}

// ── capture icons (nutrition quick-add row) ───────────────────
export function CaptureIcon({ k, color = '#000', accent = '#e8b500', size = 22 }) {
  const sw = 1.8;
  if (k === 'scan') {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <path d="M3 5v12M6 5v12M9 5v12M13 5v12M16 5v12M19 5v12" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d="M3 3h3M16 3h3M3 19h3M16 19h3" stroke={accent} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }
  if (k === 'camera') {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <path d="M3 7a2 2 0 0 1 2-2h2l1.5-2h5L15 5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="11" cy="11.5" r="3.2" stroke={color} strokeWidth={sw} />
        <circle cx="16.2" cy="8" r="0.9" fill={accent} />
      </svg>
    );
  }
  if (k === 'voice') {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <rect x="8.5" y="3" width="5" height="10" rx="2.5" stroke={color} strokeWidth={sw} />
        <path d="M5 11a6 6 0 0 0 12 0" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <path d="M11 17v2" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="11" cy="8" r="1" fill={accent} />
      </svg>
    );
  }
  if (k === 'recents') {
    return (
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={sw} />
        <path d="M11 6.5V11l3 2" stroke={accent} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

// ── header (iOS large-title feel, SF Pro Display 700) ─────────
export function ACHeader({ title, sub, right, dark, style }) {
  const c = useACT(dark);
  return (
    <div
      style={{
        padding: '16px 20px 14px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <div>
        {sub && (
          <div style={{ marginBottom: 4 }}>
            <ACLabel size={12} color={c.dim}>{sub}</ACLabel>
          </div>
        )}
        <div
          style={{
            fontFamily: ACFonts.display,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.8,
            lineHeight: 1.1,
            color: c.fg,
          }}
        >
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}

/**
 * In-app brand lockup (HeartMark + wordmark with amber dot). Renamed to
 * ACBrandMark to free `ACBrand` for the brand-color constant export above.
 * Imports HeartMark lazily to avoid a circular module import.
 */
export function ACBrandMark({ size = 18, dark, HeartMarkComp }) {
  const c = useACT(dark);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {HeartMarkComp ? <HeartMarkComp size={size} color={c.fg} accent={c.accent} /> : null}
      <div
        style={{
          fontFamily: ACFonts.brand,
          fontSize: size * 0.78,
          letterSpacing: -0.8,
          color: c.fg,
          textTransform: 'lowercase',
          display: 'inline-flex',
          alignItems: 'baseline',
        }}
      >
        <span>atlas</span>
        <span
          style={{
            width: size * 0.16, height: size * 0.16,
            background: c.accent, margin: '0 2px 1px',
            borderRadius: 2,
          }}
        />
        <span>core</span>
      </div>
    </div>
  );
}

/**
 * Tab bar — iOS feel with v3 ink/paper/amber palette. The Heart icon
 * uses the brand HeartMark with a transparent ECG accent so the icon
 * is the silhouette only.
 */
export function ACTabBar({ active = 'today', dark, onChange, HeartMarkComp }) {
  const c = useACT(dark);
  const normalizedActive = (
    {
      workout: 'workouts',
      train: 'workouts',
      eat: 'nutrition',
      body: 'profile',
      you: 'profile',
    }[active] || active
  );
  const tabs = [
    { k: 'today', label: 'Today', icon: 'home' },
    { k: 'workouts', label: 'Workouts', icon: 'bars' },
    { k: 'nutrition', label: 'Nutrition', icon: 'plate' },
    { k: 'coach', label: 'Coach', icon: 'heart' },
    { k: 'profile', label: 'Profile', icon: 'face' },
  ];
  const Icon = ({ k, on }) => {
    const col = on ? c.accent : c.dim;
    const sw = 2;
    if (k === 'home') {
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 10 L11 3 L19 10 V18 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 Z"
            stroke={col} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
    }
    if (k === 'bars') {
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3"   y="12" width="3" height="7"  rx="1" fill={col} />
          <rect x="9.5" y="7"  width="3" height="12" rx="1" fill={col} />
          <rect x="16"  y="9"  width="3" height="10" rx="1" fill={col} />
        </svg>
      );
    }
    if (k === 'plate') {
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8" stroke={col} strokeWidth={sw} />
          <circle cx="11" cy="11" r="3" fill={col} />
        </svg>
      );
    }
    if (k === 'heart') {
      return HeartMarkComp
        ? <HeartMarkComp size={20} color={col} accent="transparent" />
        : null;
    }
    if (k === 'face') {
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8.5" r="4" stroke={col} strokeWidth={sw} />
          <path d="M3 19 a8 8 0 0 1 16 0" stroke={col} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    }
    return null;
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0 calc(12px + env(safe-area-inset-bottom, 0px))',
        background: c.bg,
        borderTop: `1px solid ${c.hair}`,
      }}
    >
      {tabs.map((tab) => {
        const on = tab.k === normalizedActive;
        return (
          <button
            key={tab.k}
            type="button"
            onClick={onChange ? () => onChange(tab.k) : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 54,
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            <Icon k={tab.icon} on={on} />
            <span
              style={{
                fontFamily: ACFonts.body,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: -0.1,
                color: on ? c.accent : c.dim,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
