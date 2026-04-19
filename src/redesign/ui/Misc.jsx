import React from 'react';
import { cn } from '../lib/cn';

/** Small primitives grouped for economy. */

export function Avatar({ src, name, size = 'md', className }) {
  const s = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-[12px]', md: 'h-10 w-10 text-[14px]', lg: 'h-12 w-12 text-[16px]', xl: 'h-16 w-16 text-[20px]' }[size];
  const initials = (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={cn('inline-flex items-center justify-center overflow-hidden rounded-full bg-rd-surface-2 font-semibold text-rd-fg-secondary border border-rd-border', s, className)}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
    </span>
  );
}

export function Divider({ orientation = 'horizontal', label, className }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 text-[12px] text-rd-fg-muted', className)}>
        <div className="h-px flex-1 bg-rd-border" />
        <span>{label}</span>
        <div className="h-px flex-1 bg-rd-border" />
      </div>
    );
  }
  return orientation === 'vertical'
    ? <div className={cn('w-px self-stretch bg-rd-border', className)} />
    : <div className={cn('h-px w-full bg-rd-border', className)} />;
}

export function SectionHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex items-end justify-between gap-3 mb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-rd-h2 text-rd-fg">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-rd-fg-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, back, className }) {
  return (
    <header className={cn('flex items-center justify-between gap-3 border-b border-rd-border px-4 md:px-6 h-rd-top-bar rd-safe-top bg-rd-bg/80 backdrop-blur', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {back && (
          <button onClick={back} aria-label="Back" className="h-10 w-10 rounded-rd-control text-rd-fg-secondary hover:bg-rd-surface-2">←</button>
        )}
        <div className="min-w-0">
          <h1 className="text-rd-h3 text-rd-fg truncate">{title}</h1>
          {subtitle && <p className="text-[12px] text-rd-fg-muted truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function AppContainer({ children, className }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 md:px-6', className)}>{children}</div>;
}

export function ListRow({ leading, title, subtitle, meta, trailing, onClick, className, active }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-rd-fast',
        onClick && 'hover:bg-rd-surface-2 focus-visible:bg-rd-surface-2 focus-visible:outline-none',
        active && 'bg-rd-surface-2',
        className,
      )}
    >
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] text-rd-fg">{title}</span>
        {subtitle && <span className="block truncate text-[12px] text-rd-fg-muted">{subtitle}</span>}
      </span>
      {meta && <span className="shrink-0 text-[12px] text-rd-fg-muted rd-tnum">{meta}</span>}
      {trailing && <span className="shrink-0">{trailing}</span>}
    </Comp>
  );
}

export function KeyValueRow({ label, value, className }) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-[13px] text-rd-fg-muted">{label}</span>
      <span className="text-[14px] font-medium text-rd-fg rd-tnum">{value}</span>
    </div>
  );
}

export function Switch({ checked, onChange, disabled, label, className }) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-40 cursor-not-allowed', className)}>
      <span className={cn(
        'relative h-6 w-10 rounded-full transition-colors duration-rd-fast',
        checked ? 'bg-rd-accent' : 'bg-rd-surface-2 border border-rd-border',
      )}>
        <span className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-rd-sm transition-transform duration-rd-fast',
          checked && 'translate-x-4',
        )} />
        <input type="checkbox" className="sr-only" checked={!!checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      </span>
      {label && <span className="text-[14px] text-rd-fg">{label}</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, label, className }) {
  return (
    <label className={cn('inline-flex items-center gap-2.5 cursor-pointer select-none', className)}>
      <span className={cn(
        'relative h-5 w-5 rounded-rd-sm border transition-colors',
        checked ? 'bg-rd-accent border-rd-accent' : 'bg-rd-surface border-rd-border hover:border-rd-border-strong',
      )}>
        {checked && (
          <svg className="absolute inset-0 m-auto h-3 w-3 text-rd-fg-on-accent" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5 9-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <input type="checkbox" className="sr-only" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
      </span>
      {label && <span className="text-[14px] text-rd-fg">{label}</span>}
    </label>
  );
}

export function StickyActionBar({ children, className }) {
  return (
    <div className={cn(
      'sticky bottom-0 left-0 right-0 z-[20] mt-4 border-t border-rd-border bg-rd-bg/90 p-3 backdrop-blur rd-safe-bottom',
      className,
    )}>
      <div className="mx-auto flex max-w-[720px] items-center gap-2">{children}</div>
    </div>
  );
}

export function Toast({ tone = 'neutral', title, description, className }) {
  const tones = {
    neutral: 'bg-rd-elevated border-rd-border',
    success: 'bg-rd-success-muted border-rd-success/40',
    warning: 'bg-rd-warning-muted border-rd-warning/40',
    danger:  'bg-rd-danger-muted border-rd-danger/40',
  };
  return (
    <div role="status" className={cn('pointer-events-auto flex items-start gap-3 rounded-rd-card border p-3 shadow-rd-lg', tones[tone], className)}>
      <div className="min-w-0">
        {title && <p className="text-[14px] font-medium text-rd-fg">{title}</p>}
        {description && <p className="text-[12px] text-rd-fg-muted">{description}</p>}
      </div>
    </div>
  );
}
