import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton } from '@/components/shared/StablePage';

const TONE_STYLES = {
  brand: 'bg-[hsl(var(--brand)/0.14)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.14)]',
  success: 'bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))] border-[hsl(var(--ok)/0.14)]',
  warning: 'bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))] border-[hsl(var(--warn)/0.14)]',
  danger: 'bg-[hsl(var(--err)/0.14)] text-[hsl(var(--err))] border-[hsl(var(--err)/0.14)]',
  neutral: 'bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] border-[hsl(var(--border)/0.84)]',
};

export function WorkspaceHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  tone = 'brand',
  badge,
  actions,
  children,
}) {
  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      accentClassName="from-[hsl(var(--brand)/0.08)] via-[hsl(var(--brand-ai)/0.04)]"
      actions={actions}
    >
      <div className="flex flex-wrap items-center gap-3">
        {Icon ? (
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-[18px] border shadow-[var(--shadow-xs)]',
              TONE_STYLES[tone] || TONE_STYLES.brand
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
        ) : null}
        {badge ? (
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--border)/0.84)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.05em] text-[hsl(var(--fg-2))]">
            {badge}
          </span>
        ) : null}
      </div>
      {children ? <div className="space-y-4">{children}</div> : null}
    </PageHeader>
  );
}

export function WorkspaceMetricGrid({ children, className = '' }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>;
}

export function WorkspaceMetricTile({ label, value, hint, icon: Icon, tone = 'brand' }) {
  return (
    <Card className="px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 text-[1.75rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
            {value}
          </p>
          {hint ? <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border shadow-[var(--shadow-xs)]',
              TONE_STYLES[tone] || TONE_STYLES.brand
            )}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function WorkspaceRosterSection({
  eyebrow,
  title,
  subtitle,
  action,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
}) {
  return (
    <Section eyebrow={eyebrow} title={title} subtitle={subtitle} actions={action}>
      {React.Children.count(children) ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      )}
    </Section>
  );
}

export function WorkspacePersonRow({
  to,
  initial,
  title,
  subtitle,
  meta,
  badge,
  badgeTone = 'neutral',
  accentTone = 'brand',
  actions,
}) {
  const Comp = to ? Link : 'div';

  return (
    <Card
      as={Comp}
      to={to}
      interactive={Boolean(to)}
      className="flex items-center gap-4 px-4 py-4 sm:px-5"
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border text-[14px] font-semibold tracking-[-0.03em] shadow-[var(--shadow-xs)]',
          TONE_STYLES[accentTone] || TONE_STYLES.brand
        )}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {title}
          </p>
          {badge ? (
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em]',
                TONE_STYLES[badgeTone] || TONE_STYLES.neutral
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[13px] text-[hsl(var(--fg-2))]">{subtitle}</p>
        {meta ? <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-3))]">{meta}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : to ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
      ) : null}
    </Card>
  );
}

export function WorkspaceActionButton({ children, className = '', ...props }) {
  return (
    <PrimaryButton
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </PrimaryButton>
  );
}

export function WorkspaceInviteAction({ label, onClick }) {
  return (
    <PrimaryButton type="button" onClick={onClick} className="inline-flex items-center gap-2">
      <Plus className="h-4 w-4" strokeWidth={2} />
      {label}
    </PrimaryButton>
  );
}
