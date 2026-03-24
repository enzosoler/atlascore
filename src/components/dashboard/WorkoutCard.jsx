import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatWeight, formatWeightDiff, isImperial } from '@/lib/units';

/**
 * Today's Workout Card
 * Shows the main lift for the day with PR tracking and workout metadata
 */
export function TodayWorkoutCard({
  to,
  title,
  subtitle,
  primaryLift,
  weight,
  weightDiff,
  isPR = false,
  tags = [],
  stats = [],
  tone = 'teal',
  loading = false,
}) {
  const toneStyles = {
    teal: {
      border: 'border-[hsl(var(--accent-secondary)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--accent-secondary))]',
      accentBg: 'bg-[hsl(var(--accent-secondary))]',
      tagBorder: 'border-[hsl(var(--accent-secondary)/0.2)]',
      tagBg: 'bg-[hsl(var(--accent-secondary)/0.08)]',
    },
    orange: {
      border: 'border-[hsl(var(--warn)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--warn))]',
      accentBg: 'bg-[hsl(var(--warn))]',
      tagBorder: 'border-[hsl(var(--warn)/0.2)]',
      tagBg: 'bg-[hsl(var(--warn)/0.08)]',
    },
    blue: {
      border: 'border-[hsl(var(--brand)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--brand))]',
      accentBg: 'bg-[hsl(var(--brand))]',
      tagBorder: 'border-[hsl(var(--brand)/0.2)]',
      tagBg: 'bg-[hsl(var(--brand)/0.08)]',
    },
  };

  const styles = toneStyles[tone] || toneStyles.teal;

  if (loading) {
    return (
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-6 animate-pulse">
        <div className="h-4 w-24 bg-[hsl(var(--fill))] rounded mb-4" />
        <div className="h-8 w-32 bg-[hsl(var(--fill))] rounded mb-2" />
        <div className="h-4 w-48 bg-[hsl(var(--fill))] rounded" />
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        'block rounded-[24px] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        styles.border,
        styles.bg
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="atlas-overline">TODAY&apos;S WORKOUT</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border',
            styles.tagBorder,
            styles.tagBg,
            styles.accent
          )}
        >
          <Dumbbell className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      {/* Main Lift */}
      {primaryLift && (
        <div className="mb-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] mb-1">
            {primaryLift}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[42px] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">
              {weight}
            </span>
            {isPR && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.12)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--ok))]">
                <TrendingUp className="h-3 w-3" />
                PR
              </span>
            )}
          </div>
          {weightDiff && (
            <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1">
              <span className={cn('font-medium', weightDiff > 0 ? 'text-[hsl(var(--ok))]' : '')}>
                {weightDiff > 0 ? '↑' : '↓'} {formatWeightDiff(Math.abs(weightDiff), { unit_system: 'metric' })}
              </span>
              <span className="text-[hsl(var(--fg-3))]"> from last session</span>
            </p>
          )}
        </div>
      )}

      {/* Stats Progress Bars */}
      {stats.length > 0 && (
        <div className="space-y-3 mb-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="w-16 text-[11px] font-medium text-[hsl(var(--fg-3))]">
                {stat.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-[hsl(var(--fill))] overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', styles.accentBg)}
                  style={{ width: `${Math.min(100, Math.max(0, stat.percentage || 0))}%` }}
                />
              </div>
              <span className="w-12 text-right text-[12px] font-semibold text-[hsl(var(--fg))]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium',
                styles.tagBorder,
                styles.tagBg,
                'text-[hsl(var(--fg-2))]'
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
