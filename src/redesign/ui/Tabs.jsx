import React, { createContext, useContext, useState } from 'react';
import { cn } from '../lib/cn';

const TabsCtx = createContext(null);

/**
 * Tabs — accessible, roving-tabindex. Controlled via `value` or uncontrolled.
 * Variants: underline (default), pill (segmented).
 */
export function Tabs({ value, defaultValue, onChange, variant = 'underline', children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const set = (v) => { onChange?.(v); if (value === undefined) setInternal(v); };
  return (
    <TabsCtx.Provider value={{ current, set, variant }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabList({ children, className }) {
  const { variant } = useContext(TabsCtx);
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center',
        variant === 'pill'
          ? 'gap-1 rounded-rd-control bg-rd-surface-2 p-1'
          : 'gap-6 border-b border-rd-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Tab({ value, children, icon, disabled }) {
  const { current, set, variant } = useContext(TabsCtx);
  const active = current === value;
  const base = 'inline-flex items-center gap-2 font-medium transition-colors duration-rd-fast focus-visible:outline-none';
  const pill = active
    ? 'bg-rd-accent text-rd-fg-on-accent rounded-rd-md px-3 h-8 text-[13px]'
    : 'text-rd-fg-secondary hover:text-rd-fg rounded-rd-md px-3 h-8 text-[13px]';
  const underline = active
    ? 'text-rd-fg border-b-2 border-rd-accent -mb-px py-3 text-[14px]'
    : 'text-rd-fg-muted hover:text-rd-fg py-3 text-[14px]';
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => set(value)}
      className={cn(base, variant === 'pill' ? pill : underline, disabled && 'opacity-40 cursor-not-allowed')}
    >
      {icon}
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className }) {
  const { current } = useContext(TabsCtx);
  if (current !== value) return null;
  return <div role="tabpanel" className={cn('pt-4', className)}>{children}</div>;
}

/** SegmentedControl — like iOS, fully controlled. */
export function SegmentedControl({ value, onChange, options, size = 'md', className }) {
  const h = size === 'sm' ? 'h-8 text-[12px]' : 'h-10 text-[13px]';
  return (
    <div
      role="tablist"
      className={cn('inline-flex items-center gap-1 rounded-rd-control bg-rd-surface-2 p-1', className)}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(o.value)}
            className={cn(
              'px-3 rounded-rd-sm font-medium transition-all duration-rd-fast',
              h,
              active
                ? 'bg-rd-elevated text-rd-fg shadow-rd-sm'
                : 'text-rd-fg-secondary hover:text-rd-fg',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
