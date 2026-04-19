import React from 'react';
import { cn } from '../lib/cn';

/**
 * Badge — compact status / meta label.
 * tone: neutral | accent | success | warning | danger | ai | premium
 * shape: pill | square
 */
export function Badge({ tone = 'neutral', shape = 'pill', size = 'sm', icon, className, children }) {
  const tones = {
    neutral: 'bg-rd-surface-2 text-rd-fg-secondary border-rd-border',
    accent:  'bg-rd-accent-muted text-rd-accent border-rd-accent/30',
    success: 'bg-rd-success-muted text-rd-success border-rd-success/30',
    warning: 'bg-rd-warning-muted text-rd-warning border-rd-warning/30',
    danger:  'bg-rd-danger-muted text-rd-danger border-rd-danger/30',
    ai:      'bg-rd-ai-muted text-rd-ai border-rd-ai-border',
    premium: 'bg-rd-premium-muted text-rd-premium border-rd-premium-border',
  };
  const sizes = {
    xs: 'h-5 px-1.5 text-[10px]',
    sm: 'h-6 px-2 text-[11px]',
    md: 'h-7 px-2.5 text-[12px]',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 border font-medium uppercase tracking-[0.06em]',
      shape === 'pill' ? 'rounded-full' : 'rounded-rd-sm',
      tones[tone], sizes[size], className,
    )}>
      {icon}
      <span>{children}</span>
    </span>
  );
}

/** Pill-style stat display. Used in chips/filters/meta. */
export function StatPill({ label, value, tone = 'neutral', className }) {
  const tones = {
    neutral: 'border-rd-border text-rd-fg',
    success: 'border-rd-success/30 text-rd-success',
    warning: 'border-rd-warning/30 text-rd-warning',
    danger:  'border-rd-danger/30 text-rd-danger',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border bg-rd-surface-2 px-3 h-8 text-[13px]',
      tones[tone], className,
    )}>
      <span className="text-rd-fg-muted">{label}</span>
      <span className="rd-tnum font-semibold">{value}</span>
    </span>
  );
}

export function Chip({ active, onClick, className, children, ...rest }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 rounded-full border px-3 text-[13px] font-medium transition-colors duration-rd-fast',
        active
          ? 'bg-rd-accent text-rd-fg-on-accent border-rd-accent'
          : 'bg-rd-surface-2 text-rd-fg-secondary border-rd-border hover:border-rd-border-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
