/**
 * Atlas Core Redesign — Tailwind preset.
 *
 * Merge into your main tailwind.config.js:
 *   presets: [require('./src/redesign/tokens/tailwind.preset.js')],
 *
 * All tokens mirror design-tokens.js + theme.css so classes like
 * `bg-rd-surface`, `text-rd-fg`, `border-rd-default`, `rounded-rd-card` work.
 */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'rd-bg':           'hsl(var(--rd-bg-app) / <alpha-value>)',
        'rd-surface':      'hsl(var(--rd-bg-surface) / <alpha-value>)',
        'rd-surface-2':    'hsl(var(--rd-bg-surface-2) / <alpha-value>)',
        'rd-elevated':     'hsl(var(--rd-bg-elevated) / <alpha-value>)',
        'rd-inverse':      'hsl(var(--rd-bg-inverse) / <alpha-value>)',

        'rd-fg':           'hsl(var(--rd-fg-primary) / <alpha-value>)',
        'rd-fg-secondary': 'hsl(var(--rd-fg-secondary) / <alpha-value>)',
        'rd-fg-muted':     'hsl(var(--rd-fg-muted) / <alpha-value>)',
        'rd-fg-disabled':  'hsl(var(--rd-fg-disabled) / <alpha-value>)',
        'rd-fg-on-accent': 'hsl(var(--rd-fg-on-accent) / <alpha-value>)',

        'rd-border':         'hsl(var(--rd-border-default))',
        'rd-border-subtle':  'hsl(var(--rd-border-subtle))',
        'rd-border-strong':  'hsl(var(--rd-border-strong))',

        'rd-accent':         'hsl(var(--rd-accent) / <alpha-value>)',
        'rd-accent-hover':   'hsl(var(--rd-accent-hover) / <alpha-value>)',
        'rd-accent-muted':   'hsl(var(--rd-accent-muted))',

        'rd-ai':             'hsl(var(--rd-ai) / <alpha-value>)',
        'rd-ai-muted':       'hsl(var(--rd-ai-muted))',
        'rd-ai-border':      'hsl(var(--rd-ai-border))',

        'rd-premium':        'hsl(var(--rd-premium) / <alpha-value>)',
        'rd-premium-muted':  'hsl(var(--rd-premium-muted))',
        'rd-premium-border': 'hsl(var(--rd-premium-border))',

        'rd-success':        'hsl(var(--rd-success) / <alpha-value>)',
        'rd-success-muted':  'hsl(var(--rd-success-muted))',
        'rd-warning':        'hsl(var(--rd-warning) / <alpha-value>)',
        'rd-warning-muted':  'hsl(var(--rd-warning-muted))',
        'rd-danger':         'hsl(var(--rd-danger) / <alpha-value>)',
        'rd-danger-muted':   'hsl(var(--rd-danger-muted))',
        'rd-info':           'hsl(var(--rd-info) / <alpha-value>)',
        'rd-info-muted':     'hsl(var(--rd-info-muted))',

        'rd-health-excellent':'hsl(var(--rd-health-excellent) / <alpha-value>)',
        'rd-health-good':     'hsl(var(--rd-health-good) / <alpha-value>)',
        'rd-health-moderate': 'hsl(var(--rd-health-moderate) / <alpha-value>)',
        'rd-health-low':      'hsl(var(--rd-health-low) / <alpha-value>)',

        'rd-chart-1': 'hsl(var(--rd-chart-1) / <alpha-value>)',
        'rd-chart-2': 'hsl(var(--rd-chart-2) / <alpha-value>)',
        'rd-chart-3': 'hsl(var(--rd-chart-3) / <alpha-value>)',
        'rd-chart-4': 'hsl(var(--rd-chart-4) / <alpha-value>)',
        'rd-chart-5': 'hsl(var(--rd-chart-5) / <alpha-value>)',
        'rd-chart-6': 'hsl(var(--rd-chart-6) / <alpha-value>)',
      },
      borderRadius: {
        'rd-xs':      'var(--rd-radius-xs)',
        'rd-sm':      'var(--rd-radius-sm)',
        'rd-md':      'var(--rd-radius-md)',
        'rd-control': 'var(--rd-radius-control)',
        'rd-lg':      'var(--rd-radius-lg)',
        'rd-card':    'var(--rd-radius-card)',
        'rd-xl':      'var(--rd-radius-xl)',
        'rd-sheet':   'var(--rd-radius-sheet)',
        'rd-2xl':     'var(--rd-radius-2xl)',
      },
      boxShadow: {
        'rd-sm':    'var(--rd-shadow-sm)',
        'rd-md':    'var(--rd-shadow-md)',
        'rd-lg':    'var(--rd-shadow-lg)',
        'rd-xl':    'var(--rd-shadow-xl)',
        'rd-glow':  'var(--rd-shadow-glow)',
        'rd-inset': 'var(--rd-shadow-inset)',
      },
      fontSize: {
        'rd-display-xl': ['56px', { lineHeight: '60px', letterSpacing: '-0.03em', fontWeight: '700' }],
        'rd-display-lg': ['40px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '700' }],
        'rd-display-md': ['32px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'rd-h1':         ['28px', { lineHeight: '34px', letterSpacing: '-0.02em', fontWeight: '650' }],
        'rd-h2':         ['22px', { lineHeight: '28px', letterSpacing: '-0.015em', fontWeight: '650' }],
        'rd-h3':         ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'rd-h4':         ['16px', { lineHeight: '22px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'rd-body':       ['15px', { lineHeight: '22px', fontWeight: '450' }],
        'rd-body-sm':    ['13px', { lineHeight: '18px', fontWeight: '450' }],
        'rd-caption':    ['11px', { lineHeight: '14px', letterSpacing: '0.01em', fontWeight: '500' }],
        'rd-overline':   ['11px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '600' }],
        'rd-metric-xl':  ['44px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'rd-metric-lg':  ['32px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'rd-metric-md':  ['22px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '650' }],
        'rd-metric-sm':  ['16px', { lineHeight: '20px', letterSpacing: '-0.005em', fontWeight: '600' }],
      },
      transitionTimingFunction: {
        'rd-out':    'var(--rd-ease-out)',
        'rd-inout':  'var(--rd-ease-inout)',
        'rd-spring': 'var(--rd-ease-spring)',
      },
      transitionDuration: {
        'rd-fast': '140ms',
        'rd-base': '200ms',
        'rd-slow': '320ms',
      },
      spacing: {
        'rd-bottom-nav': '64px',
        'rd-top-bar':    '56px',
        'rd-sidebar':    '260px',
      },
      zIndex: {
        'rd-sticky': '20',
        'rd-nav':    '50',
        'rd-overlay':'60',
        'rd-sheet':  '70',
        'rd-modal':  '80',
        'rd-toast':  '90',
      },
      fontFamily: {
        rd: ['-apple-system', 'BlinkMacSystemFont', '"Inter"', 'system-ui', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'rd-fade-in':   { from: { opacity: '0' }, to: { opacity: '1' } },
        'rd-slide-up':  { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'rd-sheet-in':  { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'rd-pulse-soft':{ '0%,100%': { opacity: '1' }, '50%': { opacity: '0.55' } },
        'rd-shimmer':   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'rd-fade-in':   'rd-fade-in 140ms var(--rd-ease-out)',
        'rd-slide-up':  'rd-slide-up 200ms var(--rd-ease-out)',
        'rd-sheet-in':  'rd-sheet-in 320ms var(--rd-ease-spring)',
        'rd-pulse-soft':'rd-pulse-soft 1.6s ease-in-out infinite',
        'rd-shimmer':   'rd-shimmer 1.8s linear infinite',
      },
    },
  },
};
