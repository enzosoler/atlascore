import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const surfaceClassName =
  'atlas-card rounded-[22px] border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] shadow-[var(--shadow-sm)]';
const summaryMetaClassName =
  'inline-flex min-h-[36px] max-w-full items-center self-start overflow-hidden truncate whitespace-nowrap rounded-[13px] px-3.5 text-[11px] font-semibold tracking-[-0.012em] leading-none shadow-[var(--shadow-xs)]';
const summaryCtaClassName =
  'h-11 w-full justify-center gap-2 rounded-[16px] px-4 text-[13px] font-semibold tracking-[-0.014em] shadow-[var(--shadow-xs)] [&_svg]:h-[15px] [&_svg]:w-[15px]';
const summaryCtaBaseClassName = buttonVariants({ variant: 'default', size: 'default' });

const toneStyles = {
  blue: {
    icon: 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
    pill: 'border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
    glow: 'border-[hsl(var(--brand)/0.2)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.16),transparent_36%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
  },
  orange: {
    icon: 'border-[hsl(var(--warn)/0.22)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]',
    pill: 'border border-[hsl(var(--warn)/0.22)] bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]',
    glow: 'border-[hsl(var(--warn)/0.2)] bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.16),transparent_36%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
  },
  green: {
    icon: 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]',
    pill: 'border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]',
    glow: 'border-[hsl(var(--ok)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.16),transparent_36%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
  },
  teal: {
    icon: 'border-[hsl(var(--accent-secondary)/0.22)] bg-[hsl(var(--accent-secondary)/0.14)] text-[hsl(var(--accent-secondary))]',
    pill: 'border border-[hsl(var(--accent-secondary)/0.18)] bg-[hsl(var(--accent-secondary)/0.14)] text-[hsl(var(--accent-secondary))]',
    glow: 'border-[hsl(var(--accent-secondary)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.14),transparent_36%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
  },
};

function getAdherenceTone(score) {
  if (score >= 75) return 'green';
  if (score >= 45) return 'orange';
  return 'blue';
}

export function TodayScreen({ children }) {
  return (
    <div className="min-h-full bg-transparent text-[hsl(var(--fg))]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 pb-12 pt-5 sm:gap-8 sm:px-6 sm:pb-14 sm:pt-6 lg:gap-9 lg:px-8 lg:pb-16 lg:pt-9">
        {children}
      </div>
    </div>
  );
}

export function TodayCard({ className, children }) {
  return <section className={cn(surfaceClassName, 'p-5 sm:p-6', className)}>{children}</section>;
}

export function TodaySection({ eyebrow, title, description, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      {(eyebrow || title || description) ? (
        <div className="space-y-2.5 px-0.5">
          {eyebrow ? <p className="atlas-overline">{eyebrow}</p> : null}
          {title ? (
            <h2 className="atlas-section-title text-[1.28rem]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="atlas-copy">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function TodayActionCard({
  to,
  title,
  description,
  icon: Icon,
  priority,
  highlighted = false,
}) {
  return (
    <Link
      to={to}
      className={cn(
        surfaceClassName,
        'group flex min-h-[124px] items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        highlighted ? toneStyles.blue.glow : ''
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border',
          highlighted
            ? toneStyles.blue.icon
            : 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.74)] text-[hsl(var(--fg-2))]'
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {priority ? <p className="atlas-overline">{priority}</p> : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-semibold tracking-[-0.034em] text-[hsl(var(--fg))]">
              {title}
            </p>
            <p className="mt-1.5 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{description}</p>
          </div>
          <ChevronRight
            className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--fg-3))] transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2.2}
          />
        </div>
      </div>
    </Link>
  );
}

export function TodayStatCard({
  to,
  label,
  value,
  description,
  meta,
  icon: Icon,
  tone = 'blue',
  ctaLabel,
  done = false,
}) {
  const styles = toneStyles[tone] || toneStyles.blue;

  return (
    <Link
      to={to}
      className={cn(
        surfaceClassName,
        'flex min-h-[214px] flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        done
          ? 'border-[hsl(var(--ok)/0.2)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.08),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]'
          : styles.glow
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="atlas-overline">{label}</p>
          <p className="mt-3 tabular-nums text-[29px] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">{value}</p>
        </div>
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border',
          done
            ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
            : styles.icon
        )}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{description}</p>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        {meta ? (
          <span
            className={cn(
              summaryMetaClassName,
              done
                ? 'border border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]'
                : styles.pill
            )}
          >
            {meta}
          </span>
        ) : null}
        {ctaLabel ? (
          <span
            className={cn(
              summaryCtaBaseClassName,
              summaryCtaClassName,
              done
                ? 'border-[hsl(var(--ok)/0.16)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.16)]'
                : 'border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-fg,var(--bg)))] hover:bg-[hsl(var(--primary)/0.94)]'
            )}
          >
            <span className="truncate text-center">{ctaLabel}</span>
            <ChevronRight className="shrink-0" strokeWidth={2.6} />
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function TodayAdherenceCard({ score, summary, items = [] }) {
  const circumference = 2 * Math.PI * 26;
  const dashOffset = circumference - (score / 100) * circumference;
  const tone = getAdherenceTone(score);
  const styles = toneStyles[tone];
  const scoreColor =
    tone === 'green'
      ? 'hsl(var(--ok))'
      : tone === 'orange'
        ? 'hsl(var(--warn))'
        : 'hsl(var(--brand))';

  return (
    <TodayCard className={styles.glow}>
      <div className="flex items-start gap-4">
        <div className="relative h-[72px] w-[72px] shrink-0">
          <svg width="72" height="72" className="-rotate-90">
            <circle cx="36" cy="36" r="26" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="36"
              cy="36"
              r="26"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="tabular-nums text-[22px] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">{score}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="atlas-overline">Adherence</p>
              <p className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                Current block consistency
              </p>
            </div>
            <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', styles.pill)}>
              {score >= 75 ? 'On track' : score >= 45 ? 'Adjust' : 'Focus up'}
            </span>
          </div>
          <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{summary}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-full border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.8)] px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                {item.label}
              </span>
              <span className="ml-2 text-[12px] font-semibold text-[hsl(var(--fg))]">{item.value}%</span>
            </div>
          ))}
        </div>
      ) : null}
    </TodayCard>
  );
}

export function TodayInsightCard({
  to,
  eyebrow = 'Atlas AI',
  title,
  description,
  cta = 'Abrir Atlas AI',
  icon: Icon,
}) {
  return (
    <Link
      to={to}
      className={cn(
        surfaceClassName,
        toneStyles.teal.glow,
        'block p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-6'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border', toneStyles.teal.icon)}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="atlas-overline text-[hsl(var(--accent-secondary))]">{eyebrow}</p>
          <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {title}
          </p>
          <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--accent-secondary))]">
            {cta}
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
