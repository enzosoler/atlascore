// heart-mark.jsx — atlas.core brand identity
// Only the current, shipped logo system. Single heart mark + wordmark + lockups.
// Sourced directly from /assets/*.svg (mark.svg, wordmark.svg, lockup-*.svg, app-icon-*.svg).

const useTheme = () => {
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    const h = () => tick((n) => n + 1);
    window.addEventListener('actheme-change', h);
    return () => window.removeEventListener('actheme-change', h);
  }, []);
  return window.ACTheme || { ink: '#0a0a0a', bg: '#efe9da', accent: '#e8b500', ecg: 'sharp' };
};

const FONTS = {
  display: '"Archivo Black", sans-serif',
  wide:    '"Archivo", sans-serif',
  mono:    '"JetBrains Mono", monospace',
};

// ─────────────────────────────────────────
// HEART · Vital mark
// 96-unit grid, symmetrical heart silhouette, ECG trace across midline.
// Two ECG variants — sharp (new default, matches zip) and flat.
// ─────────────────────────────────────────
const ECG_PATHS = {
  sharp: "M10 50 L32 50 L38 50 L44 28 L52 72 L58 28 L64 50 L86 50",
  flat:  "M10 50 L86 50",
};

function HeartMark({ size = 96, color, accent, strokeW = 3.2 }) {
  const t = useTheme();
  const ink = color  ?? t.ink;
  const acc = accent ?? t.accent;
  const path = ECG_PATHS[t.ecg] || ECG_PATHS.sharp;
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label="atlas.core" style={{ display: 'block' }}>
      <path d="M48 82 C 34 72, 10 58, 10 36 C 10 22, 22 12, 32 12 C 40 12, 44 18, 48 24 C 52 18, 56 12, 64 12 C 74 12, 86 22, 86 36 C 86 58, 62 72, 48 82 Z"
        fill={ink} />
      <path d={path} fill="none" stroke={acc}
        strokeWidth={strokeW} strokeLinejoin="miter" strokeLinecap="square" />
    </svg>
  );
}

// ─────────────────────────────────────────
// WORDMARK · atlas█core (accent square acts as the period/dot)
// Matches /assets/wordmark.svg proportions exactly.
// ─────────────────────────────────────────
function Wordmark({ size = 48, color, accent }) {
  const t = useTheme();
  const ink = color  ?? t.ink;
  const acc = accent ?? t.accent;
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
        alignSelf: 'flex-end',
      }} />
      <span>core</span>
    </div>
  );
}

// ─────────────────────────────────────────
// LOCKUPS · horizontal + stacked
// Match /assets/lockup-horizontal.svg and lockup-stacked.svg.
// ─────────────────────────────────────────
function LockupH({ size = 64, gap = 18, wsize = 36, color, accent }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <HeartMark size={size} color={color} accent={accent} />
      <Wordmark size={wsize} color={color} accent={accent} />
    </div>
  );
}

function LockupV({ size = 80, gap = 14, wsize = 32, color, accent }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      alignItems: 'center', gap,
    }}>
      <HeartMark size={size} color={color} accent={accent} />
      <Wordmark size={wsize} color={color} accent={accent} />
    </div>
  );
}

// ─────────────────────────────────────────
// APP ICON · squircle tile with mark centered
// Matches /assets/app-icon-{paper,ink,accent,mono}.svg
// ─────────────────────────────────────────
function AppIconTile({ bg, accent, mark, size = 160 }) {
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
      <HeartMark size={size * 0.62} color={mark ?? t.ink} accent={accent ?? t.accent} />
    </div>
  );
}

// Expose globals — only the ones the app actually uses.
Object.assign(window, {
  HeartMark, Wordmark, LockupH, LockupV, AppIconTile,
  useTheme, FONTS,
});
