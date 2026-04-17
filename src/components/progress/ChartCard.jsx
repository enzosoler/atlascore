import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * ChartCard — reusable card wrapper for all Progress charts.
 */
export function ChartCard({ children, className = '' }) {
  return (
    <div className={cn(
      'rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card)/0.96)_0%,hsl(var(--card)/0.88)_100%)] p-4 shadow-[var(--shadow-xs)]',
      className
    )}>
      {children}
    </div>
  );
}

export function ChartHeader({ label, value, unit, badge, sublabel }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] mb-1">{label}</p>
        {value != null && (
          <p className="text-[26px] font-bold tracking-[-0.045em] text-[hsl(var(--fg))] leading-none">
            {typeof value === 'number' ? value.toFixed(1) : value}
            {unit && <span className="ml-1 text-[14px] font-medium text-[hsl(var(--fg-2))]">{unit}</span>}
          </p>
        )}
        {sublabel && <p className="text-[11px] leading-5 text-[hsl(var(--fg-3))] mt-1">{sublabel}</p>}
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  );
}

export function EmptyChart({ label, cta, to }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.28)] px-5 py-10 gap-3 text-center">
      <p className="max-w-sm text-[13px] leading-6 text-[hsl(var(--fg-3))]">{label}</p>
      {cta && to && (
        <Link
          to={to}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--brand))] hover:opacity-80"
        >
          {cta}
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
