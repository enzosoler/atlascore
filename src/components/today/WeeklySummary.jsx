import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { subDays } from 'date-fns';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function buildLegacySegments({ allCheckins = [], meals = [], workouts = [], t }) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayCheckin = allCheckins.find((c) => c.date === dateStr);
    const dayMeals = meals.filter((m) => m.date === dateStr);
    const dayWorkouts = workouts.filter((w) => w.date === dateStr);
    const score = (dayCheckin ? 42 : 0) + (dayMeals.length > 0 ? 28 : 0) + (dayWorkouts.some((w) => w.completed) ? 30 : 0);

    return {
      key: dateStr,
      label: t(`today.weeklySummary.days.${DAY_KEYS[date.getDay()]}`),
      value: score,
      note: dayCheckin ? 'Check-in' : dayWorkouts.some((w) => w.completed) ? 'Workout' : 'Open',
    };
  });
}

/**
 * WeeklySummary — Strava-style weekly recap card.
 * Supports explicit segments for richer TodayV2 summaries, while preserving the
 * original fallback props used elsewhere.
 */
export default function WeeklySummary({
  label,
  summary,
  narrative,
  highlights = [],
  segments,
  allCheckins,
  meals,
  workouts,
  className,
}) {
  const { t } = useI18n();
  const weekSegments = Array.isArray(segments) && segments.length > 0
    ? segments
    : buildLegacySegments({ allCheckins, meals, workouts, t });

  const resolvedSummary = summary || t('today.weeklySummary.label');
  const visibleHighlights = Array.isArray(highlights) ? highlights.slice(0, 3) : [];

  return (
    <section className={cn(
      'overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.55)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.2)_100%)] shadow-[var(--shadow-xs)]',
      className
    )}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(var(--brand)/0.09)] text-[hsl(var(--brand))]">
              <Calendar className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {label || t('today.weeklySummary.label')}
            </p>
          </div>
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {resolvedSummary}
          </p>
        </div>

        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2.4} />
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="grid grid-cols-7 gap-2">
          {weekSegments.map((segment) => {
            const value = Math.max(0, Math.min(100, Number(segment.value) || 0));
            const isActive = value > 0;
            return (
              <div key={segment.key || segment.label} className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end justify-center rounded-[16px] bg-[hsl(var(--fill)/0.26)] px-1.5 py-2">
                  <div
                    className={cn(
                      'w-full rounded-[10px] bg-gradient-to-t transition-all duration-500',
                      isActive
                        ? 'from-[hsl(var(--brand))] to-[hsl(var(--brand-ai))]'
                        : 'from-[hsl(var(--fg-3)/0.18)] to-[hsl(var(--fg-3)/0.08)]'
                    )}
                    style={{ height: `${Math.max(10, value)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
                    {segment.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[hsl(var(--fg-3))]">
                    {segment.note || ' '}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {narrative ? (
          <p className="mt-4 text-[13px] leading-[1.55] text-[hsl(var(--fg-2))]">
            {narrative}
          </p>
        ) : null}

        {visibleHighlights.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleHighlights.map((highlight) => (
              <div
                key={`${highlight.label}-${highlight.value}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--card)/0.85)] px-3 py-1.5"
              >
                <span className="text-[11px] font-medium text-[hsl(var(--fg-3))]">{highlight.label}</span>
                <span className="text-[11px] font-semibold text-[hsl(var(--fg))]">{highlight.value}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
