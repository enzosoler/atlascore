import React from 'react';
import { cn } from '../lib/cn';

/**
 * Single source of truth for the atlas.core brand mark.
 * - Uses /branding/dark/logo.svg from public/ (served by Vite).
 * - Name: "atlas.core" (lowercase, with dot) — matches meta/og/manifest.
 * - Variants:
 *     mark      → just the logo
 *     wordmark  → just "atlas.core" text
 *     lockup    → logo + wordmark side by side (default)
 *     stack     → logo above, wordmark below
 */
export function Brand({
  variant = 'lockup',
  size = 'md',
  theme = 'dark',
  className,
  href,
}) {
  const dims = {
    xs: { px: 16, text: 'text-[13px]' },
    sm: { px: 20, text: 'text-[14px]' },
    md: { px: 24, text: 'text-[16px]' },
    lg: { px: 32, text: 'text-[18px]' },
    xl: { px: 48, text: 'text-[22px]' },
    '2xl': { px: 80, text: 'text-[32px]' },
    '3xl': { px: 112, text: 'text-[44px]' },
  }[size] || { px: 24, text: 'text-[16px]' };

  const logoSrc = theme === 'light' ? '/branding/light/logo.svg' : '/branding/dark/logo.svg';

  const inner = (() => {
    const mark = (
      <img
        src={logoSrc}
        alt="atlas.core"
        width={dims.px}
        height={dims.px}
        style={{ width: dims.px, height: dims.px }}
        className="shrink-0 select-none"
        draggable={false}
      />
    );
    const wordmark = (
      <span className={cn('font-semibold tracking-tight text-rd-fg', dims.text)}>
        atlas<span className="text-rd-accent">.</span>core
      </span>
    );
    if (variant === 'mark')     return mark;
    if (variant === 'wordmark') return wordmark;
    if (variant === 'stack') {
      return (
        <span className="inline-flex flex-col items-center gap-2">
          {mark}{wordmark}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2">
        {mark}{wordmark}
      </span>
    );
  })();

  if (href) {
    return <a href={href} className={cn('inline-flex items-center', className)} aria-label="atlas.core">{inner}</a>;
  }
  return <span className={cn('inline-flex items-center', className)} aria-label="atlas.core">{inner}</span>;
}

export default Brand;
