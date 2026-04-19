import React from 'react';
import { cn } from '../lib/cn';

/**
 * Card — canonical surface. Three elevations.
 * Use `interactive` for tap/click; uses `button` semantics and focus ring.
 */
export function Card({
  as: Comp = 'div',
  elevation = 'base',
  interactive = false,
  glow = false,
  tone,
  className,
  children,
  ...rest
}) {
  const bg =
    elevation === 'flat'     ? 'bg-rd-surface/60' :
    elevation === 'raised'   ? 'bg-rd-surface-2'  :
    elevation === 'elevated' ? 'bg-rd-elevated'   :
                               'bg-rd-surface';
  const toneClass =
    tone === 'ai'       ? 'border-rd-ai-border bg-rd-ai-muted'      :
    tone === 'premium'  ? 'border-rd-premium-border bg-rd-premium-muted' :
    tone === 'danger'   ? 'border-rd-danger/40 bg-rd-danger-muted'  :
    tone === 'warning'  ? 'border-rd-warning/40 bg-rd-warning-muted':
    tone === 'success'  ? 'border-rd-success/40 bg-rd-success-muted':
                          'border-rd-border';
  return (
    <Comp
      className={cn(
        'relative rounded-rd-card border',
        bg, toneClass,
        glow && 'shadow-rd-glow',
        interactive && 'cursor-pointer transition-all duration-rd-base ease-rd-out hover:-translate-y-[1px] hover:border-rd-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent',
        className,
      )}
      {...(interactive && Comp === 'div' ? { role: 'button', tabIndex: 0 } : {})}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 p-4 pb-0', className)}>
      <div className="min-w-0">
        {title && <h3 className="text-rd-h4 text-rd-fg">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-[13px] text-rd-fg-muted truncate">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('flex items-center gap-2 border-t border-rd-border p-3 px-4', className)}>{children}</div>;
}

/** Metric: oversized tabular number + label, optional delta. */
export function MetricCard({ label, value, unit, delta, deltaTone = 'success', icon, className }) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between text-rd-fg-muted">
        <span className="text-rd-overline uppercase tracking-[0.08em]">{label}</span>
        {icon && <span aria-hidden>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-rd-metric-lg text-rd-fg rd-tnum">{value}</span>
        {unit && <span className="text-[13px] text-rd-fg-muted">{unit}</span>}
      </div>
      {delta != null && (
        <p className={cn(
          'mt-1 text-[12px] rd-tnum',
          deltaTone === 'success' ? 'text-rd-success' :
          deltaTone === 'danger'  ? 'text-rd-danger'  :
                                    'text-rd-fg-muted',
        )}>
          {delta}
        </p>
      )}
    </Card>
  );
}
