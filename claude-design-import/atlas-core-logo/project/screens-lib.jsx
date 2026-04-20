// screens-lib.jsx — shared primitives for atlas.core app screens
// Every screen uses these. Keep the vocabulary tight: no emoji,
// no rounded corners except where iOS forces them, Archivo Black
// for numbers/headings, JetBrains Mono for data labels, Inter for body.

// SF Pro is the app's voice. Archivo Black is the BRAND's voice —
// reserved for splash, marketing moments, and the logo itself.
const ACFonts = {
  // SF Pro Display — numbers, headlines, anything big
  display: '-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif',
  // SF Pro Text — body, labels, UI (iOS picks the right optical size automatically)
  body: '-apple-system, "SF Pro Text", "SF Pro", system-ui, sans-serif',
  // SF Mono — data, timestamps, codes
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
  // Brand-only — splash, logo, big manifesto moments
  brand: '"Archivo Black", "Arial Black", sans-serif',
};

// radius scale — soft brutalism: hard corners survive only on
// divisors, ticks, and ECG traces. UI surfaces get soft corners.
const ACRadii = {
  chip: 8,
  button: 12,
  input: 14,
  card: 18,
  sheet: 24,
};

// ── theme helpers ─────────────────────────────────────────────
// light = paper, dark = ink. accent is always sulfur.
function useACT(dark) {
  const t = window.useTheme();
  return {
    bg: dark ? t.ink : t.bg,
    fg: dark ? t.bg : t.ink,
    // softened hierarchy — more steps, more air
    dim: dark ? 'rgba(239,233,218,0.6)'  : 'rgba(10,10,10,0.56)',
    mute: dark ? 'rgba(239,233,218,0.42)' : 'rgba(10,10,10,0.42)',
    faint:dark ? 'rgba(239,233,218,0.22)' : 'rgba(10,10,10,0.22)',
    hair: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.07)', // near-invisible
    card: dark ? '#16140f' : '#f4efde',
    card2:dark ? '#1e1a14' : '#ebe4cd',
    accent: t.accent,
    ink: t.ink,
    paper: t.bg,
  };
}

// ── tiny atoms ────────────────────────────────────────────────
function ACDot({ size = 8, color, style }) {
  const t = window.useTheme();
  return <span style={{ display: 'inline-block', width: size, height: size, background: color ?? t.accent, ...style }} />;
}

// Label — small SF Pro Text, medium weight, slight tracking.
// Not monospaced. Use ACMono only for timestamps/raw data.
function ACLabel({ children, size = 11, track = 0.3, color, style }) {
  return (
    <span style={{
      fontFamily: ACFonts.body, fontSize: size, letterSpacing: track,
      fontWeight: 500, color, ...style,
    }}>{children}</span>
  );
}

function ACMono({ children, size = 11, track = 0.4, color, style }) {
  return (
    <span style={{
      fontFamily: ACFonts.mono, fontSize: size, letterSpacing: track,
      fontWeight: 500, color, ...style,
    }}>{children}</span>
  );
}

// Numbers use SF Pro Display with tabular figures so digits line up.
function ACNum({ children, size = 48, color, weight = 700, style }) {
  return (
    <span style={{
      fontFamily: ACFonts.display, fontSize: size,
      fontWeight: weight,
      // SF Pro tightens naturally at large sizes; only tighten above 40px
      letterSpacing: size > 40 ? -size * 0.035 : -size * 0.02,
      lineHeight: 0.95,
      fontVariantNumeric: 'tabular-nums',
      color, display: 'inline-block', ...style,
    }}>{children}</span>
  );
}

function ACBtn({ children, primary, dark, block, style, size = 'md', pill }) {
  const c = useACT(dark);
  const pads = { sm: '10px 16px', md: '14px 20px', lg: '18px 24px' };
  const fs   = { sm: 14, md: 16, lg: 17 };
  const bg = primary ? c.accent : (dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.05)');
  const fg = primary ? c.ink : c.fg;
  return (
    <div style={{
      display: block ? 'flex' : 'inline-flex', width: block ? '100%' : undefined,
      justifyContent: 'center', alignItems: 'center', gap: 8,
      padding: pads[size], background: bg, color: fg,
      fontFamily: ACFonts.body, fontSize: fs[size], fontWeight: 600,
      letterSpacing: -0.2,
      borderRadius: pill ? 999 : ACRadii.button,
      cursor: 'pointer',
      ...style,
    }}>{children}</div>
  );
}

// ── ECG sparkline (reusable, any width/height) ────────────────
function ACSpark({ w = 280, h = 40, color, stroke = 2, data, dark }) {
  const c = useACT(dark);
  const col = color ?? c.accent;
  // default: a canonical ECG beat repeated
  const d = data ?? [
    50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
    45, 55, 20, 80, 30, 50, 50, 50, 50, 50, 50,
    50, 50, 50, 50, 45, 55, 20, 80, 30, 50, 50, 50,
  ];
  const step = w / (d.length - 1);
  const pts = d.map((v, i) => `${i * step},${(v / 100) * h}`).join(' L ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={`M ${pts}`} fill="none" stroke={col} strokeWidth={stroke}
        strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

// ── readiness ring — thick, segmented, no gradient ────────────
function ACRing({ size = 220, value = 87, dark, thickness = 12, color }) {
  const c = useACT(dark);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      {/* track */}
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke={dark ? 'rgba(239,233,218,0.14)' : 'rgba(10,10,10,0.12)'}
        strokeWidth={thickness} />
      {/* value */}
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke={color ?? c.accent} strokeWidth={thickness}
        strokeDasharray={`${fill} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(-90 ${cx} ${cx})`}
        strokeLinecap="butt" />
      {/* tick marks every 10% */}
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a) * (r + thickness / 2 + 2);
        const y1 = cx + Math.sin(a) * (r + thickness / 2 + 2);
        const x2 = cx + Math.cos(a) * (r + thickness / 2 + 6);
        const y2 = cx + Math.sin(a) * (r + thickness / 2 + 6);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={dark ? 'rgba(239,233,218,0.3)' : 'rgba(10,10,10,0.25)'}
          strokeWidth="1" />;
      })}
    </svg>
  );
}

// ── chunky horizontal bar chart ───────────────────────────────
function ACBars({ data, w = 320, h = 120, dark, labelFmt = (x) => x }) {
  const c = useACT(dark);
  const max = Math.max(...data.map(d => d.v));
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
            <ACMono size={9} color={d.hl ? c.accent : c.dim}>{labelFmt(d.k)}</ACMono>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── line chart for weight trend ───────────────────────────────
function ACLine({ data, w = 340, h = 140, dark, highlightLast = true }) {
  const c = useACT(dark);
  const vs = data.map(d => d.v);
  const min = Math.min(...vs), max = Math.max(...vs);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => [i * step, h - ((d.v - min) / span) * (h - 20) - 10]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  // moving average (7-day)
  const ma = data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - 6), i + 1);
    return slice.reduce((s, d) => s + d.v, 0) / slice.length;
  });
  const maPts = ma.map((v, i) => [i * step, h - ((v - min) / span) * (h - 20) - 10]);
  const maPath = maPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {/* grid */}
      {[0, 0.5, 1].map((v, i) => (
        <line key={i} x1="0" x2={w} y1={h * (1 - v) - 5} y2={h * (1 - v) - 5}
          stroke={c.hair} strokeDasharray="2 4" />
      ))}
      {/* raw points line */}
      <path d={path} fill="none" stroke={c.dim} strokeWidth="1.5" strokeDasharray="2 2" />
      {/* moving average — the hero */}
      <path d={maPath} fill="none" stroke={c.fg} strokeWidth="2.5" strokeLinejoin="miter" />
      {/* points */}
      {pts.map((p, i) => {
        const last = i === pts.length - 1;
        return <rect key={i} x={p[0] - 2} y={p[1] - 2} width="4" height="4"
          fill={last && highlightLast ? c.accent : c.dim} />;
      })}
    </svg>
  );
}

// Status chip — softer pill. Reserve for live/status signals.
function ACChip({ children, accent, dark, inverse, dot }) {
  const c = useACT(dark);
  const bg = accent ? c.accent
           : inverse ? c.fg
           : (dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.05)');
  const fg = accent ? c.ink : (inverse ? c.bg : c.fg);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', background: bg, color: fg,
      borderRadius: ACRadii.chip,
      fontFamily: ACFonts.body, fontSize: 11, fontWeight: 600,
      letterSpacing: -0.1,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: accent ? c.ink : c.accent }} />}
      {children}
    </span>
  );
}

// Tab bar — iOS-feel but with our marks. SF Pro Text 10/600.
function ACTabBar({ active = 'today', dark }) {
  const c = useACT(dark);
  const tabs = [
    { k: 'today', label: 'Today', icon: 'home' },
    { k: 'train', label: 'Train', icon: 'bars' },
    { k: 'eat',   label: 'Eat',   icon: 'plate' },
    { k: 'body',  label: 'Body',  icon: 'heart' },
    { k: 'you',   label: 'You',   icon: 'face' },
  ];
  const Icon = ({ k, on }) => {
    const col = on ? c.accent : c.dim;
    const sw = 2;
    if (k === 'home') return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 10 L11 3 L19 10 V18 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 Z" stroke={col} strokeWidth={sw} strokeLinejoin="round"/>
      </svg>
    );
    if (k === 'bars') return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3"  y="12" width="3" height="7"  rx="1" fill={col} />
        <rect x="9.5" y="7"  width="3" height="12" rx="1" fill={col} />
        <rect x="16" y="9"  width="3" height="10" rx="1" fill={col} />
      </svg>
    );
    if (k === 'plate') return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke={col} strokeWidth={sw}/>
        <circle cx="11" cy="11" r="3" fill={col}/>
      </svg>
    );
    if (k === 'heart') return <HeartMark size={20} color={col} accent="transparent" />;
    if (k === 'face') return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8.5" r="4" stroke={col} strokeWidth={sw}/>
        <path d="M3 19 a8 8 0 0 1 16 0" stroke={col} strokeWidth={sw} strokeLinecap="round"/>
      </svg>
    );
    return null;
  };
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 26px', background: c.bg,
      borderTop: `1px solid ${c.hair}`,
    }}>
      {tabs.map(t => {
        const on = t.k === active;
        return (
          <div key={t.k} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            minWidth: 54,
          }}>
            <Icon k={t.icon} on={on} />
            <span style={{
              fontFamily: ACFonts.body, fontSize: 10, fontWeight: 600,
              letterSpacing: -0.1, color: on ? c.accent : c.dim,
            }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Screen header — iOS large-title feel, SF Pro Display Bold.
function ACHeader({ title, sub, right, dark }) {
  const c = useACT(dark);
  return (
    <div style={{
      padding: '16px 20px 14px', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'space-between',
    }}>
      <div>
        {sub && <div style={{ marginBottom: 4 }}>
          <ACLabel size={12} color={c.dim}>{sub}</ACLabel>
        </div>}
        <div style={{
          fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
          letterSpacing: -0.8, lineHeight: 1.1, color: c.fg,
        }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// Brand lockup for in-app header — ARCHIVO BLACK stays here (it's the logo).
// Keeping the brand's voice for identity, UI speaks SF Pro everywhere else.
function ACBrand({ size = 18, dark }) {
  const c = useACT(dark);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <HeartMark size={size} color={c.fg} accent={c.accent} />
      <div style={{
        fontFamily: ACFonts.brand, fontSize: size * 0.78,
        letterSpacing: -0.8, color: c.fg, textTransform: 'lowercase',
        display: 'inline-flex', alignItems: 'baseline',
      }}>
        <span>atlas</span>
        <span style={{ width: size * 0.16, height: size * 0.16, background: c.accent, margin: '0 2px 1px', borderRadius: 2 }} />
        <span>core</span>
      </div>
    </div>
  );
}

// Screen shell — iOS frame with a small label above.
function ACScreen({ label, dark, children, keyboard }) {
  const c = useACT(dark);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: ACFonts.body, fontSize: 12, fontWeight: 500,
          letterSpacing: -0.1, color: 'rgba(60,50,40,0.75)',
        }}>{label}</span>
        <span style={{
          fontFamily: ACFonts.body, fontSize: 11, color: 'rgba(60,50,40,0.45)',
          padding: '2px 8px', borderRadius: 999,
          background: dark ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.06)',
          color: dark ? '#efe9da' : 'rgba(60,50,40,0.7)',
        }}>{dark ? 'dark' : 'light'}</span>
      </div>
      <IOSDevice width={360} height={780} dark={dark} keyboard={keyboard}>
        <div style={{
          width: '100%', height: '100%', background: c.bg, color: c.fg,
          fontFamily: ACFonts.body,
          display: 'flex', flexDirection: 'column',
          paddingTop: 54, paddingBottom: 34,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}>
          {children}
        </div>
      </IOSDevice>
    </div>
  );
}

// Capture icons for nutrition quick-add row. Minimal, single-stroke.
function CaptureIcon({ k, color = '#000', accent = '#e8b500', size = 22 }) {
  const sw = 1.8;
  if (k === 'scan') return (
    // Barcode
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M3 5v12M6 5v12M9 5v12M13 5v12M16 5v12M19 5v12" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M3 3h3M16 3h3M3 19h3M16 19h3" stroke={accent} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
  if (k === 'camera') return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M3 7a2 2 0 0 1 2-2h2l1.5-2h5L15 5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/>
      <circle cx="11" cy="11.5" r="3.2" stroke={color} strokeWidth={sw}/>
      <circle cx="16.2" cy="8" r="0.9" fill={accent}/>
    </svg>
  );
  if (k === 'voice') return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <rect x="8.5" y="3" width="5" height="10" rx="2.5" stroke={color} strokeWidth={sw}/>
      <path d="M5 11a6 6 0 0 0 12 0" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M11 17v2" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <circle cx="11" cy="8" r="1" fill={accent}/>
    </svg>
  );
  if (k === 'recents') return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={sw}/>
      <path d="M11 6.5V11l3 2" stroke={accent} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

Object.assign(window, {
  ACFonts, ACRadii, useACT, ACDot, ACLabel, ACMono, ACNum, ACBtn, ACSpark, ACRing, ACBars, ACLine,
  ACChip, ACTabBar, ACHeader, ACBrand, ACScreen, CaptureIcon,
});
