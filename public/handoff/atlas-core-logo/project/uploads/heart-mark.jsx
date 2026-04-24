// heart-mark.jsx — refined heart + chevron marks for atlas.core

const useTheme = () => {
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    const h = () => tick((n) => n + 1);
    window.addEventListener('actheme-change', h);
    return () => window.removeEventListener('actheme-change', h);
  }, []);
  return window.ACTheme || { ink: '#0a0a0a', bg: '#efe9da', accent: '#e8b500', ecg: 'classic' };
};

const FONTS = {
  display: '"Archivo Black", sans-serif',
  wide: '"Archivo", sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// ─────────────────────────────────────────
// Refined HEART geometry
// Built on a 96-unit grid, symmetrical, with a tuned ECG path
// that actually "reads" as a vital-sign — not a random zigzag.
// ─────────────────────────────────────────
const ECG_PATHS = {
  classic: "M10 50 L30 50 L36 50 L42 42 L48 60 L54 32 L60 58 L66 50 L86 50",
  sharp:   "M10 50 L32 50 L38 50 L44 28 L52 72 L58 28 L64 50 L86 50",
  flat:    "M10 50 L86 50",
};

function HeartMark({ size = 96, color, accent, strokeW = 3.2 }) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  const path = ECG_PATHS[t.ecg] || ECG_PATHS.classic;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      {/* heart — classical two-lobe path, anchored on a grid */}
      <path d="M48 82
               C 34 72, 10 58, 10 36
               C 10 22, 22 12, 32 12
               C 40 12, 44 18, 48 24
               C 52 18, 56 12, 64 12
               C 74 12, 86 22, 86 36
               C 86 58, 62 72, 48 82 Z"
        fill={ink} />
      {/* ECG trace — sits on the heart's horizontal axis */}
      <path d={path} fill="none" stroke={acc}
        strokeWidth={strokeW} strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

// ─────────────────────────────────────────
// Refined CHEVRON — double-chevron, ascending
// Reads as "progress / level up / PR" and contains
// the hidden A of ATLAS in the upper triangle.
// ─────────────────────────────────────────
function ChevronMark({ size = 96, color, accent }) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      {/* Upper chevron — ink. Hollow "A" triangle shows the bg */}
      <path d="M14 56 L48 18 L82 56 L70 56 L48 33 L26 56 Z" fill={ink} />
      {/* Lower chevron — accent */}
      <path d="M14 82 L48 44 L82 82 L70 82 L48 59 L26 82 Z" fill={acc} />
    </svg>
  );
}

// ─────────────────────────────────────────
// Wordmark — fixed geometry, dot = accent square
// (bullet) to echo the ECG spike & chevron beat.
// ─────────────────────────────────────────
function Wordmark({ size = 48, color, accent, dot = 'dot' }) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  void ink; void acc;
  return (
    <div style={{
      fontFamily: FONTS.display, fontSize: size,
      letterSpacing: -size * 0.055, lineHeight: 1,
      color: ink, textTransform: 'lowercase',
      display: 'inline-flex', alignItems: 'baseline',
    }}>
      <span>atlas</span>
      <span style={{
        display: 'inline-block',
        width: size * 0.16, height: size * 0.16,
        background: acc,
        margin: `0 ${size * 0.04}px ${size * 0.06}px`,
        borderRadius: dot === 'round' ? '50%' : 0,
        alignSelf: 'flex-end',
      }} />
      <span>core</span>
    </div>
  );
}

// ─────────────────────────────────────────
// Primary lockup — horizontal
// ─────────────────────────────────────────
function LockupH({ Mark, size = 64, gap = 18, wsize = 36, color, accent }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Mark size={size} color={color} accent={accent} />
      <Wordmark size={wsize} color={color} accent={accent} />
    </div>
  );
}

// ─────────────────────────────────────────
// Stacked lockup
// ─────────────────────────────────────────
function LockupV({ Mark, size = 80, gap = 14, wsize = 32, color, accent }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      alignItems: 'center', gap,
    }}>
      <Mark size={size} color={color} accent={accent} />
      <Wordmark size={wsize} color={color} accent={accent} />
    </div>
  );
}

// ─────────────────────────────────────────
// Tagline lockup
// ─────────────────────────────────────────
function LockupTag({ Mark, color, accent }) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20 }}>
      <Mark size={80} color={ink} accent={acc} />
      <div>
        <Wordmark size={42} color={ink} accent={acc} />
        <div style={{
          fontFamily: FONTS.mono, fontSize: 10, letterSpacing: 3,
          color: ink, opacity: 0.6, marginTop: 6,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: acc }}>●</span>
          BODY · OPERATING · SYSTEM
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Clear space diagram
// ─────────────────────────────────────────
function ClearSpace({ Mark }) {
  const t = useTheme();
  const x = 24; // "x" = 1/4 of mark size
  return (
    <div style={{ position: 'relative', display: 'inline-block', padding: x }}>
      <div style={{
        position: 'absolute', inset: 0,
        border: `1px dashed ${t.ink}`, opacity: 0.3, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: x, height: x,
        background: t.accent, opacity: 0.15,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, width: x, height: x,
        background: t.accent, opacity: 0.15,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: x, height: x,
        background: t.accent, opacity: 0.15,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: x, height: x,
        background: t.accent, opacity: 0.15,
      }} />
      <Mark size={96} />
      <div style={{
        position: 'absolute', top: 4, left: x + 4,
        fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 2,
        color: t.ink, opacity: 0.6,
      }}>x</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Size scale
// ─────────────────────────────────────────
function SizeScale({ Mark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      {[16, 24, 32, 48, 64, 96].map(s => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Mark size={s} />
          <div style={{
            fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 2, opacity: 0.6,
          }}>{s}px</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// App icon tile (squircle-ish)
// ─────────────────────────────────────────
function AppIconTile({ Mark, bg, accent, mark, size = 160 }) {
  const t = useTheme();
  const tileBg = bg ?? t.bg;
  return (
    <div style={{
      width: size, height: size,
      background: tileBg,
      borderRadius: size * 0.22,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.08)',
    }}>
      <Mark size={size * 0.62} color={mark ?? t.ink} accent={accent ?? t.accent} />
    </div>
  );
}

// ─────────────────────────────────────────
// HYBRID — Chevron-Heart
// The heart silhouette built from double chevrons.
// Top lobes become two ascending chevrons (progress),
// bottom point stays sharp (anatomical heart).
// ECG trace still runs across the middle.
// ─────────────────────────────────────────
function ChevronHeartMark({ size = 96, color, accent, strokeW = 3.2 }) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const acc = accent ?? t.accent;
  const path = ECG_PATHS[t.ecg] || ECG_PATHS.classic;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" style={{ display: 'block' }}>
      {/* Heart silhouette with chevron-pointed lobes.
          Two peaked lobes at top (the chevron DNA), sharp V at bottom.
          Clean geometry on the same 96-grid. No internal notch —
          the ECG trace is the only accent element, matching the heart mark. */}
      <path d="M48 84
               L 10 46
               L 10 28
               L 28 10
               L 48 30
               L 68 10
               L 86 28
               L 86 46
               Z" fill={ink} />
      {/* ECG trace */}
      <path d={path} fill="none" stroke={acc}
        strokeWidth={strokeW} strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

Object.assign(window, {
  HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag,
  ClearSpace, SizeScale, AppIconTile, useTheme, FONTS,
});
