import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';

const surfaceClassName =
  'rounded-[18px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))]';
const summaryCtaClassName =
  'h-11 w-full justify-center gap-2 rounded-[16px] px-4 text-[13px] font-semibold tracking-[-0.014em] shadow-[var(--shadow-xs)] [&_svg]:h-[15px] [&_svg]:w-[15px]';
const summaryCtaBaseClassName = buttonVariants({ variant: 'default', size: 'default' });

const toneStyles = {
  blue: {
    icon: 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
    pill: 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
    glow: '',
  },
  orange: {
    icon: 'bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
    pill: 'bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
    glow: '',
  },
  green: {
    icon: 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
    pill: 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
    glow: '',
  },
  teal: {
    icon: 'bg-[hsl(var(--accent-secondary)/0.08)] text-[hsl(var(--accent-secondary))]',
    pill: 'bg-[hsl(var(--accent-secondary)/0.08)] text-[hsl(var(--accent-secondary))]',
    glow: '',
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
        'group flex items-start gap-4 p-5 transition-colors active:bg-[hsl(var(--fill)/0.4)]'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          highlighted
            ? toneStyles.blue.icon
            : 'bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))]'
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        {priority ? <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))] mb-1">{priority}</p> : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {title}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{description}</p>
          </div>
          <ChevronRight
            className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]"
            strokeWidth={2}
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
        'flex min-h-[200px] flex-col p-5 transition-colors active:bg-[hsl(var(--fill)/0.4)]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">{label}</p>
          <p className="mt-2.5 tabular-nums text-[28px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">{value}</p>
        </div>
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          done ? 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]' : styles.icon
        )}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-2.5 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{description}</p>

      <div className="mt-auto flex flex-col gap-2.5 pt-5">
        {meta ? (
          <span className={cn(
            'inline-flex self-start rounded-full px-3 py-1 text-[11px] font-semibold',
            done ? 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]' : styles.pill
          )}>
            {meta}
          </span>
        ) : null}
        {ctaLabel ? (
          <span className={cn(
            summaryCtaBaseClassName,
            summaryCtaClassName,
            done
              ? 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.12)]'
              : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-fg,var(--bg)))] hover:bg-[hsl(var(--primary)/0.94)]'
          )}>
            <span className="truncate text-center">{ctaLabel}</span>
            <ChevronRight className="shrink-0" strokeWidth={2.2} />
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export function TodayAdherenceCard({ score, summary, items = [], t: tProp }) {
  const { t: tHook } = useI18n();
  const t = tProp || tHook;
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
    <TodayCard>
      <div className="flex items-start gap-4">
        <div className="relative h-[64px] w-[64px] shrink-0">
          <svg width="64" height="64" className="-rotate-90">
            <circle cx="32" cy="32" r="24" fill="none" stroke="hsl(var(--fill-secondary))" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="24"
              fill="none"
              stroke={scoreColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={(2 * Math.PI * 24) - (score / 100) * (2 * Math.PI * 24)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="tabular-nums text-[20px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">{score}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {t('today.adherenceCard.title')}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{summary}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-full bg-[hsl(var(--fill)/0.6)] px-3 py-1">
              <span className="text-[11px] font-medium text-[hsl(var(--fg-3))]">
                {item.label}
              </span>
              <span className="ml-1.5 text-[11px] font-semibold text-[hsl(var(--fg))]">{item.value}%</span>
            </div>
          ))}
        </div>
      ) : null}
    </TodayCard>
  );
}

export function TodayInsightCard({
  to,
  eyebrow,
  title,
  description,
  cta,
  icon: Icon,
}) {
  const { t } = useI18n();
  const resolvedEyebrow = eyebrow || t('today.insightCard.insights');
  const resolvedCta = cta || t('today.insightCard.viewInsights');
  return (
    <Link
      to={to}
      className={cn(
        surfaceClassName,
        'block p-5 transition-colors active:bg-[hsl(var(--fill)/0.4)]'
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneStyles.teal.icon)}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--fg-3))]">{resolvedEyebrow}</p>
          <p className="mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {title}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">{description}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--brand))]">
            {resolvedCta}
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
