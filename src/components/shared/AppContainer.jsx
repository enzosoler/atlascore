import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CARD_CLASS_NAME =
  'rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]';

export function AppContainer({ children, className = '' }) {
  return (
    <div className="min-h-full bg-[#F5F5F7] text-[#111827]" style={{ colorScheme: 'light' }}>
      <div className={cn('mx-auto flex w-full max-w-[30rem] flex-col gap-5 px-4 pb-8 pt-[max(env(safe-area-inset-top),20px)] sm:px-5 sm:pb-10', className)}>
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
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--card))] hover:shadow-[var(--shadow-md)]',
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
    <Card className={cn('relative overflow-hidden px-5 py-5', className)}>
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b to-transparent', accentClassName)} />

      <div className="relative space-y-5">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-[34px] font-bold tracking-[-0.07em] text-[#111827]">{title}</h1>
            {subtitle ? <p className="text-[15px] leading-6 text-[#6B7280]">{subtitle}</p> : null}
          </div>
        </div>

        {actions ? <ActionRow>{actions}</ActionRow> : null}
        {children ? <div className="space-y-3">{children}</div> : null}
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
    <section className={cn('space-y-3', className)}>
      {eyebrow || title || subtitle || actions ? (
        <div className={cn('flex items-end justify-between gap-3', headerClassName)}>
          <div className="min-w-0 space-y-2">
            {eyebrow ? (
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-[#111827]">{title}</h2> : null}
            {subtitle ? <p className="text-[14px] leading-6 text-[#6B7280]">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      <div className={contentClassName}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, detail, icon: Icon, className = '' }) {
  return (
    <Card className={cn('px-4 py-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            {label}
          </p>
          <p className="mt-3 break-words text-[17px] font-semibold tracking-[-0.03em] text-[#111827]">
            {value}
          </p>
          {detail ? <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">{detail}</p> : null}
        </div>

        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]">
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function ActionRow({ children, className = '' }) {
  return <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', className)}>{children}</div>;
}

export function TabBar({ items, className = '' }) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] border-t border-[#E5E7EB] bg-[rgba(255,255,255,0.94)] backdrop-blur-xl lg:hidden',
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
              ? 'border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_4px_20px_rgba(15,23,42,0.05)]'
              : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
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
