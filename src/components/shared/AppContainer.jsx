import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CARD_CLASS_NAME = 'atlas-card';

export function AppContainer({ children, className = '', maxWidth = 'max-w-5xl' }) {
  return (
    <div
      className="min-h-full bg-[hsl(var(--bg))] text-[hsl(var(--fg))]"
      style={{ colorScheme: 'light' }}
    >
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-6 px-4 pb-10 pt-[max(env(safe-area-inset-top),20px)] sm:px-6 sm:pb-12 lg:px-8 lg:pb-16 lg:pt-10',
          maxWidth,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Card({ as: Comp = 'div', interactive = false, className = '', children, ...props }) {
  return (
    <Comp
      className={cn(
        CARD_CLASS_NAME,
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--separator-strong))] hover:bg-[hsl(var(--card))] hover:shadow-[var(--shadow-md)]',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  className = '',
  accentClassName = 'from-[#EFF6FF]',
}) {
  return (
    <Card className={cn('atlas-page-header relative overflow-hidden px-5 py-6 sm:px-6', className)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent',
          accentClassName
        )}
      />

      <div className="relative space-y-6">
        <div className="space-y-4">
          {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
          <div className="space-y-3">
            <h1 className="atlas-display-title text-[clamp(2rem,1.65rem+1vw,2.8rem)]">{title}</h1>
            {subtitle ? <p className="atlas-copy max-w-3xl">{subtitle}</p> : null}
          </div>
        </div>

        {actions ? <ActionRow>{actions}</ActionRow> : null}
        {children ? <div className="space-y-4">{children}</div> : null}
      </div>
    </Card>
  );
}

export function Section({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {eyebrow || title || subtitle || actions ? (
        <div
          className={cn(
            'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
            headerClassName
          )}
        >
          <div className="min-w-0 max-w-3xl space-y-2">
            {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
            {title ? <h2 className="atlas-section-title text-[1.25rem]">{title}</h2> : null}
            {subtitle ? <p className="atlas-copy">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0 self-start sm:self-auto">{actions}</div> : null}
        </div>
      ) : null}

      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, detail, icon: Icon, className = '' }) {
  return (
    <Card className={cn('px-4 py-4 sm:px-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 break-words text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {value}
          </p>
          {detail ? <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p> : null}
        </div>

        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.76)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function ActionRow({ children, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center', className)}>
      {children}
    </div>
  );
}

export function TabBar({ items, className = '' }) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] border-t border-[hsl(var(--border)/0.88)] bg-[rgba(255,255,255,0.94)] backdrop-blur-xl lg:hidden',
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-[30rem] items-center gap-2 px-3 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const key = item.key || item.to || item.label;
          const classes = cn(
            'flex flex-1 min-w-0 flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-center text-[10px] font-semibold tracking-[-0.01em] leading-none transition-all duration-200',
            item.active
              ? 'border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
              : 'text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.92)] hover:text-[hsl(var(--fg))]'
          );

          if (item.to) {
            return (
              <Link key={key} to={item.to} onClick={item.onClick} className={classes}>
                {Icon ? <Icon className="h-5 w-5 shrink-0" strokeWidth={item.active ? 2.25 : 1.9} /> : null}
                <span className="max-w-[56px] truncate">{item.label}</span>
              </Link>
            );
          }

          return (
            <button key={key} type="button" onClick={item.onClick} className={classes}>
              {Icon ? <Icon className="h-5 w-5 shrink-0" strokeWidth={item.active ? 2.25 : 1.9} /> : null}
              <span className="max-w-[56px] truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
