import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CARD_CLASS_NAME = 'atlas-card';

export function AppContainer({ children, className = '', maxWidth = 'max-w-5xl' }) {
  return (
    <div
      className="min-h-full bg-[hsl(var(--bg))] text-[hsl(var(--fg))] atlas-page-enter"
    >
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-7 px-4 pb-12 pt-5 sm:gap-8 sm:px-6 sm:pb-14 sm:pt-6 lg:gap-9 lg:px-8 lg:pb-16 lg:pt-9',
          maxWidth,
          className
        )}
      >
        {children}
      </div>
      {/* No spacer needed — main scroll container already has pb-[calc(94px+env(safe-area-inset-bottom))] */}
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
  accentClassName = 'from-[hsl(var(--brand)/0.18)] via-[hsl(var(--brand-ai)/0.08)]',
}) {
  return (
    <Card className={cn('atlas-page-header relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7 lg:px-7 lg:py-8', className)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent',
          accentClassName
        )}
      />

      <div className="relative space-y-7">
        <div className="space-y-4">
          {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
          <div className="space-y-3.5">
            <h1 className="atlas-display-title text-[clamp(2.15rem,1.9rem+1vw,3rem)]">{title}</h1>
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
    <section className={cn('space-y-5', className)}>
      {eyebrow || title || subtitle || actions ? (
        <div
          className={cn(
            'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
            headerClassName
          )}
        >
          <div className="min-w-0 max-w-3xl space-y-2.5">
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
    <Card className={cn('px-5 py-5 sm:px-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 break-words text-[1.15rem] font-semibold tracking-[-0.038em] text-[hsl(var(--fg))]">
            {value}
          </p>
          {detail ? <p className="mt-2.5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p> : null}
        </div>

        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.96)_0%,hsl(var(--card))_100%)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function ActionRow({ children, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto', className)}>
      {children}
    </div>
  );
}

export function TabBar({ items, className = '' }) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-[60] border-t border-[hsl(var(--border)/0.84)] bg-[hsl(var(--bg)/0.92)] shadow-[0_-12px_34px_hsl(var(--label)/0.05)] backdrop-blur-[24px] lg:hidden',
        className
      )}
    >
      <div
        className="mx-auto flex w-full max-w-[28rem] items-stretch gap-1 px-3 pt-2.5"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const key = item.key || item.to || item.label;
          const classes = cn(
            'flex min-h-[58px] flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-center text-[11.5px] font-semibold tracking-[-0.014em] leading-none transition-[color] duration-150',
            item.active
              ? 'text-[hsl(var(--brand))]'
              : 'text-[hsl(var(--fg-3))]'
          );

          if (item.to) {
            return (
              <Link key={key} to={item.to} onClick={item.onClick} className={classes}>
                {Icon ? (
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[14px] transition-colors duration-150',
                      item.active
                        ? 'text-[hsl(var(--brand))]'
                        : 'text-inherit'
                    )}
                  >
                    <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={item.active ? 2.35 : 2.1} />
                  </div>
                ) : null}
                <span className={cn('max-w-[64px] truncate', item.active ? 'font-semibold text-[hsl(var(--fg))]' : '')}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <button key={key} type="button" onClick={item.onClick} className={classes}>
              {Icon ? (
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[14px] transition-[background-color,box-shadow] duration-150',
                    item.active
                      ? 'bg-[hsl(var(--brand)/0.14)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)] ring-1 ring-inset ring-[hsl(var(--brand)/0.12)]'
                      : 'bg-transparent'
                  )}
                >
                  <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={item.active ? 2.35 : 2.1} />
                </div>
              ) : null}
              <span className={cn('max-w-[64px] truncate', item.active ? 'font-semibold text-[hsl(var(--fg))]' : '')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
