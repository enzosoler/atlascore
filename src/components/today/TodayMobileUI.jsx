import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const surfaceClassName =
  'rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]';

const toneStyles = {
  blue: {
    accent: 'text-[#0A84FF]',
    icon: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#0A84FF]',
    pill: 'bg-[#EFF6FF] text-[#0A84FF]',
  },
  orange: {
    accent: 'text-[#FF9F0A]',
    icon: 'border-[#FED7AA] bg-[#FFF7ED] text-[#FF9F0A]',
    pill: 'bg-[#FFF7ED] text-[#C2410C]',
  },
  green: {
    accent: 'text-[#34C759]',
    icon: 'border-[#BBF7D0] bg-[#ECFDF3] text-[#34C759]',
    pill: 'bg-[#ECFDF3] text-[#15803D]',
  },
};

export function TodayScreen({ children }) {
  return (
    <div className="min-h-full bg-[#F5F5F7] text-[#111827]" style={{ colorScheme: 'light' }}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 pb-8 pt-[max(env(safe-area-inset-top),24px)] sm:px-5 lg:gap-8 lg:py-10">
        {children}
      </div>
    </div>
  );
}

export function TodayCard({ className, children }) {
  return <section className={cn(surfaceClassName, 'p-4 sm:p-5', className)}>{children}</section>;
}

export function TodaySection({ eyebrow, title, description, children, className }) {
  return (
    <section className={cn('space-y-3', className)}>
      {(eyebrow || title || description) ? (
        <div className="space-y-1.5 px-1">
          {eyebrow ? (
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-[20px] font-semibold tracking-[-0.04em] text-[#111827]">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="text-[14px] leading-6 text-[#6B7280]">{description}</p>
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
        'group flex items-start gap-3 p-4 transition-transform duration-200 hover:-translate-y-0.5',
        highlighted
          ? 'border-[#BFDBFE] bg-[linear-gradient(135deg,#F8FBFF_0%,#FFFFFF_100%)]'
          : ''
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border',
          highlighted
            ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#0A84FF]'
            : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        {priority ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            {priority}
          </p>
        ) : null}
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-semibold tracking-[-0.03em] text-[#111827]">
              {title}
            </p>
            <p className="mt-1 text-[14px] leading-6 text-[#6B7280]">{description}</p>
          </div>
          <ChevronRight
            className="mt-1 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 group-hover:translate-x-0.5"
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
}) {
  const styles = toneStyles[tone] || toneStyles.blue;

  return (
    <Link to={to} className={cn(surfaceClassName, 'block p-4 transition-transform duration-200 hover:-translate-y-0.5')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            {label}
          </p>
          <p className="mt-3 text-[28px] font-bold tracking-[-0.06em] text-[#111827]">{value}</p>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border', styles.icon)}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">{description}</p>

      {meta ? (
        <span className={cn('mt-4 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', styles.pill)}>
          {meta}
        </span>
      ) : null}
    </Link>
  );
}

export function TodayAdherenceCard({ score, summary, items = [] }) {
  const circumference = 2 * Math.PI * 26;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <TodayCard>
      <div className="flex items-center gap-4">
        <div className="relative h-[72px] w-[72px] shrink-0">
          <svg width="72" height="72" className="-rotate-90">
            <circle cx="36" cy="36" r="26" fill="none" stroke="#E5E7EB" strokeWidth="6" />
            <circle
              cx="36"
              cy="36"
              r="26"
              fill="none"
              stroke="#34C759"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[20px] font-bold tracking-[-0.05em] text-[#111827]">{score}</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                Aderência
              </p>
              <p className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-[#111827]">
                Consistência em alta
              </p>
            </div>
            <span className="inline-flex shrink-0 rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-semibold text-[#15803D]">
              Em dia
            </span>
          </div>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">{summary}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-full bg-[#F9FAFB] px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                {item.label}
              </span>
              <span className="ml-2 text-[12px] font-semibold text-[#111827]">{item.value}%</span>
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
      className="block rounded-[20px] border border-[#BFDBFE] bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_100%)] p-4 shadow-[0_4px_20px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-0.5 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-[#BFDBFE] bg-white text-[#0A84FF]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0A84FF]">
            {eyebrow}
          </p>
          <p className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-[#111827]">
            {title}
          </p>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#0A84FF]">
            {cta}
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
