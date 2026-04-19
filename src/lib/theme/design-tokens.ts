/**
 * Atlas Core Design Tokens
 * 
 * OLED-first, premium minimal aesthetics.
 * Built for high-performance fitness and health tracking.
 */

export const tokens = {
  colors: {
    base: {
      black: '#000000', // Pure OLED Black
      white: '#FFFFFF',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#030712',
      },
    },
    brand: {
      gold: '#D4AF37',     // Premium Gold
      goldLight: '#F3CF60',
      goldDark: '#997B25',
      emerald: '#10B981',  // Success/Vitality
      emeraldLight: '#34D399',
      emeraldDark: '#059669',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    charts: [
      '#D4AF37', // Gold
      '#10B981', // Emerald
      '#3B82F6', // Blue
      '#F59E0B', // Amber
      '#8B5CF6', // Violet
      '#EC4899', // Pink
    ],
  },

  typography: {
    fonts: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
      '4xl': '40px',
      '5xl': '48px',
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.2',
      snug: '1.3',
      normal: '1.5',
      relaxed: '1.6',
    },
  },

  spacing: {
    px: '1px',
    0: '0',
    1: '4px',   // 4px grid
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  radius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    premium: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)', // Gold-standard depth
    glow: '0 0 15px rgba(212, 175, 55, 0.3)', // Subtle gold glow
  },

  motion: {
    durations: {
      fast: '150ms',
      base: '250ms',
      slow: '400ms',
    },
    easings: {
      snappy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type DesignTokens = typeof tokens;
export default tokens;
