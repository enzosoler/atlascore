/**
 * Atlas Core — Design Tokens
 *
 * Dark & premium. Obsidian base, cyan accent, restrained chroma.
 * All values are the source of truth; `theme.css` mirrors into CSS variables
 * so components can use `hsl(var(--bg-app))` or the Tailwind preset names.
 *
 * Rules:
 *   - NEVER hardcode a hex in a component. Pull from here or Tailwind.
 *   - Semantic tokens (bg-app, fg-primary) over raw palette names in UI code.
 *   - Chart palette is hue-differentiated AND value-differentiated so charts
 *     remain legible in grayscale.
 */

// ─── Palette (raw) ──────────────────────────────────────────────────────────
export const palette = {
  obsidian: {
    50:  '#F5F7FA',
    100: '#E6EAF0',
    200: '#C6CDD7',
    300: '#8E98A5',
    400: '#5B6472',
    500: '#323B47',
    600: '#1D242E',
    700: '#141A22',
    800: '#0B0F15',   // card base
    850: '#080C11',
    900: '#05070A',   // app canvas
    950: '#02040680',
  },
  cyan: {
    50:  '#E6FFFF',
    100: '#B3FFFF',
    200: '#80FFFF',
    300: '#4DFFFF',
    400: '#1AFFFF',
    500: '#00FFFF',   // Atlas accent
    600: '#00D4D4',
    700: '#00A8A8',
    800: '#007D7D',
    900: '#005252',
  },
  violet: {
    400: '#A78BFA',
    500: '#8B5CF6',   // AI insight accent
    600: '#7C3AED',
  },
  gold: {
    400: '#D4B982',
    500: '#C9A96A',   // Premium accent
    600: '#B29049',
  },
  emerald: {
    400: '#34D399',
    500: '#10B981',   // success
    600: '#059669',
  },
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',   // warning
    600: '#D97706',
  },
  rose: {
    400: '#FB7185',
    500: '#EF4444',   // error
    600: '#DC2626',
  },
};

// ─── Semantic tokens (dark theme) ───────────────────────────────────────────
export const theme = {
  bg: {
    app:          palette.obsidian[900],   // page canvas
    surface:      palette.obsidian[800],   // cards
    surface2:     palette.obsidian[700],   // elevated cards, list rows on surface
    elevated:     palette.obsidian[600],   // sheets, popovers
    inverse:      palette.obsidian[50],    // toast, photo capture chrome
    overlay:      'rgba(2, 4, 6, 0.72)',   // sheet/dialog backdrop
  },
  fg: {
    primary:      palette.obsidian[50],    // headings, primary body
    secondary:    palette.obsidian[200],   // supporting text
    muted:        palette.obsidian[300],   // metadata, placeholders
    disabled:     palette.obsidian[400],
    onAccent:     palette.obsidian[900],   // text on cyan
    onPremium:    palette.obsidian[900],   // text on gold
    inverse:      palette.obsidian[900],
  },
  border: {
    subtle:       'rgba(255,255,255,0.06)',
    default:      'rgba(255,255,255,0.10)',
    strong:       'rgba(255,255,255,0.18)',
    focus:        palette.cyan[500],
  },
  accent: {
    primary:      palette.cyan[500],
    primaryHover: palette.cyan[400],
    primaryMuted: 'rgba(0,255,255,0.12)',
    ai:           palette.violet[500],
    aiMuted:      'rgba(139,92,246,0.10)',
    aiBorder:     'rgba(139,92,246,0.24)',
    premium:      palette.gold[500],
    premiumMuted: 'rgba(201,169,106,0.12)',
    premiumBorder:'rgba(201,169,106,0.28)',
  },
  status: {
    success:      palette.emerald[500],
    successMuted: 'rgba(16,185,129,0.12)',
    warning:      palette.amber[500],
    warningMuted: 'rgba(245,158,11,0.14)',
    danger:       palette.rose[500],
    dangerMuted:  'rgba(239,68,68,0.12)',
    info:         palette.cyan[400],
    infoMuted:    'rgba(26,255,255,0.10)',
  },
  // Ring/recovery color scale (Whoop/Oura-ish)
  health: {
    excellent:    palette.emerald[400],
    good:         palette.cyan[400],
    moderate:     palette.amber[400],
    low:          palette.rose[400],
  },
  // Chart palette — chosen so 5 lines on a chart remain distinguishable
  chart: [
    palette.cyan[400],
    palette.violet[400],
    palette.gold[400],
    palette.emerald[400],
    palette.rose[400],
    palette.amber[400],
  ],
};

// ─── Typography ─────────────────────────────────────────────────────────────
// Use SF Pro on native, Inter on web via fallback. Numeric tnum for data density.
export const typography = {
  fontFamily: {
    sans: [
      'SF Pro Text',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'sans-serif',
    ],
    display: [
      'SF Pro Display',
      'Inter',
      '-apple-system',
      'system-ui',
      'sans-serif',
    ],
    mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
  },
  size: {
    // Mobile-first type ramp
    'display-xl': { px: 56, lh: 60, tracking: '-0.03em', weight: 700 },
    'display-lg': { px: 40, lh: 44, tracking: '-0.025em', weight: 700 },
    'display-md': { px: 32, lh: 38, tracking: '-0.02em', weight: 700 },
    h1:           { px: 28, lh: 34, tracking: '-0.02em', weight: 650 },
    h2:           { px: 22, lh: 28, tracking: '-0.015em', weight: 650 },
    h3:           { px: 18, lh: 24, tracking: '-0.01em', weight: 600 },
    h4:           { px: 16, lh: 22, tracking: '-0.005em', weight: 600 },
    body:         { px: 15, lh: 22, tracking: '0',       weight: 450 },
    'body-sm':    { px: 13, lh: 18, tracking: '0',       weight: 450 },
    caption:      { px: 11, lh: 14, tracking: '0.01em',  weight: 500 },
    overline:     { px: 11, lh: 14, tracking: '0.08em',  weight: 600, transform: 'uppercase' },
    // Numeric (tabular) — used for macros, weights, timers
    'metric-xl':  { px: 44, lh: 48, tracking: '-0.02em', weight: 700, numeric: 'tabular-nums' },
    'metric-lg':  { px: 32, lh: 36, tracking: '-0.02em', weight: 700, numeric: 'tabular-nums' },
    'metric-md':  { px: 22, lh: 26, tracking: '-0.01em', weight: 650, numeric: 'tabular-nums' },
    'metric-sm':  { px: 16, lh: 20, tracking: '-0.005em', weight: 600, numeric: 'tabular-nums' },
  },
};

// ─── Spacing scale (4pt base) ───────────────────────────────────────────────
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// ─── Radius ─────────────────────────────────────────────────────────────────
export const radius = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  control: '14px',   // buttons, inputs, chips — Atlas atlas-control
  lg: '16px',
  card: '18px',      // Atlas atlas-card
  xl: '20px',
  sheet: '24px',     // Atlas atlas-sheet (top corners only)
  '2xl': '28px',
  full: '9999px',
};

// ─── Elevation / shadow ─────────────────────────────────────────────────────
// Dark-friendly — subtle; use borders as primary separation.
export const shadow = {
  none: 'none',
  sm:   '0 1px 2px 0 rgba(0,0,0,0.40)',
  md:   '0 4px 12px -2px rgba(0,0,0,0.50)',
  lg:   '0 12px 28px -4px rgba(0,0,0,0.55), 0 4px 10px -2px rgba(0,0,0,0.40)',
  xl:   '0 24px 48px -8px rgba(0,0,0,0.65), 0 8px 16px -4px rgba(0,0,0,0.40)',
  // Specialty
  glow: '0 0 0 1px rgba(0,255,255,0.24), 0 0 24px -4px rgba(0,255,255,0.35)',
  inset: 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
};

// ─── Motion ─────────────────────────────────────────────────────────────────
export const motion = {
  duration: {
    instant: '50ms',
    fast:    '140ms',
    base:    '200ms',
    slow:    '320ms',
    slower:  '480ms',
  },
  ease: {
    out:     'cubic-bezier(0.22, 1, 0.36, 1)',     // standard ease-out
    inOut:   'cubic-bezier(0.65, 0, 0.35, 1)',      // symmetric
    spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',   // gentle overshoot
    snappy:  'cubic-bezier(0.5, 0, 0, 1)',
  },
};

// ─── Layout widths ──────────────────────────────────────────────────────────
export const layout = {
  maxContent:   '1200px',
  maxReading:   '720px',
  maxForm:      '480px',
  sidebar:      '260px',
  sidebarCompact:'72px',
  bottomNav:    '64px',
  topBar:       '56px',
  appGutterMobile: '16px',
  appGutterDesktop:'32px',
};

// ─── Z-index ────────────────────────────────────────────────────────────────
export const z = {
  base:      0,
  raised:    10,
  sticky:    20,
  dropdown:  30,
  sidebar:   40,
  topbar:    50,
  bottomNav: 50,
  overlay:   60,
  sheet:     70,
  modal:     80,
  toast:     90,
  tooltip:   100,
};

// ─── Breakpoints (mobile-first) ─────────────────────────────────────────────
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ─── Touch targets & a11y ───────────────────────────────────────────────────
export const a11y = {
  minTouchTarget: '44px',
  focusRingWidth: '2px',
  focusRingOffset: '2px',
};

export const tokens = {
  palette,
  theme,
  typography,
  spacing,
  radius,
  shadow,
  motion,
  layout,
  z,
  breakpoints,
  a11y,
};

export default tokens;
