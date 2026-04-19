import tokens from './design-tokens';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Atlas Core Theme Configuration
 * Can be used to extend Tailwind or for dynamic styling in components.
 */
export const theme = {
  extend: {
    colors: {
      brand: {
        gold: tokens.colors.brand.gold,
        emerald: tokens.colors.brand.emerald,
      },
      status: tokens.colors.status,
      base: tokens.colors.base,
    },
    spacing: tokens.spacing,
    borderRadius: tokens.radius,
    boxShadow: tokens.shadows,
    transitionDuration: tokens.motion.durations,
    transitionTimingFunction: tokens.motion.easings,
  },
} as const;

/**
 * Helper to get dynamic tokens based on status or brand needs
 */
export const getStatusColor = (status: keyof typeof tokens.colors.status) => {
  return tokens.colors.status[status];
};

export const getBrandColor = (variant: 'gold' | 'emerald' = 'gold') => {
  return tokens.colors.brand[variant];
};

/**
 * Chart utility to get accessible colors
 */
export const getChartColor = (index: number) => {
  return tokens.colors.charts[index % tokens.colors.charts.length];
};

export default theme;
