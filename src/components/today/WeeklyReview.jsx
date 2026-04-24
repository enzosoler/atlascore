/**
 * WeeklyReview — Strava-style weekly recap card.
 *
 * Shows: week headline, totals strip, highlight card, trend bars, share CTA.
 * Designed to feel like a story recap you can share.
 */

import React, { useMemo } from 'react';
import { Calendar, Share2, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

function getWeekDateRange() {
  const now = new Date();
  const dow = now.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

function TotalsPill({ label, value }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-[14px] bg-[hsl(var(--fill)/0.35)] border border-[hsl(var(--border)/0.4)]">
      <span className="text-[16px] font-bold tabular-nums tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mt-0.5">
        {label}
      </span>
    </div>
  );
}

function TrendBar({ label, value, maxValue }) {
  const pct = maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[hsl(var(--fg-3))] w-6 text-center shrink-0">
        {label}
      </span>
      <div className="flex-1 h-6 rounded-full bg-[hsl(var(--fill)/0.3)] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            pct > 0
              ? 'bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-ai))]'
              : 'bg-[hsl(var(--fg-3)/0.12)]'
          )}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}

export default function WeeklyReview({
  weekWorkoutCount = 0,
  weekCheckinCount = 0,
  avgCalories = 0,
  streak = 0,
  bestWorkoutName = null,
  segments = [],
  onShare,
  narrative,
}) {
  const dateRange = useMemo(() => getWeekDateRange(), []);
  const adherencePct = Math.min(100, Math.round((weekCheckinCount / 7) * 100));
  const maxSegmentValue = useMemo(() => Math.max(...segments.map(s => s.value || 0), 1), [segments]);

  // Determine highlight
  const highlight = useMemo(() => {
    if (bestWorkoutName) return { icon: Trophy, text: `Best session: ${bestWorkoutName}` };
    if (streak >= 7) return { icon: Trophy, text: `${streak}-day streak and counting` };
    if (weekWorkoutCount >= 4) return { icon: TrendingUp, text: `${weekWorkoutCount} sessions this week` };
    if (weekCheckinCount >= 5) return { icon: TrendingUp, text: `${weekCheckinCount}/7 days tracked` };
    return null;
  }, [bestWorkoutName, streak, weekWorkoutCount, weekCheckinCount]);

  return (
    <section className="overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.55)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.18)_100%)] shadow-[var(--shadow-xs)]">
      {/* Header */}
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(var(--brand)/0.09)] text-[hsl(var(--brand))]">
                <Calendar className="h-4 w-4" strokeWidth={2} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Weekly review
              </p>
            </div>
            <p className="text-[14px] font-medium text-[hsl(var(--fg-2))]">{dateRange}</p>
          </div>

          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.4)] px-3 py-1.5 text-[11px] font-semibold text-[hsl(var(--fg-2))] transition-colors active:bg-[hsl(var(--fill)/0.7)]"
            >
              <Share2 className="h-3 w-3" strokeWidth={2.2} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Totals strip */}
      <div className="flex gap-2.5 px-5 pt-4 overflow-x-auto scrollbar-none">
        <TotalsPill label="Sessions" value={weekWorkoutCount} />
        <TotalsPill label="Avg cal" value={avgCalories > 0 ? Math.round(avgCalories) : '--'} />
        <TotalsPill label="Adherence" value={`${adherencePct}%`} />
        {streak > 0 && <TotalsPill label="Streak" value={`${streak}d`} />}
      </div>

      {/* Highlight card */}
      {highlight && (
        <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-[14px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.12)] px-3.5 py-2.5">
          <highlight.icon className="h-4 w-4 text-[hsl(var(--brand))] shrink-0" strokeWidth={2} />
          <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{highlight.text}</p>
        </div>
      )}

      {/* Trend bars */}
      {segments.length > 0 && (
        <div className="px-5 pt-4 space-y-2">
          {segments.map((seg) => (
            <TrendBar
              key={seg.key || seg.label}
              label={seg.label}
              value={seg.value || 0}
              maxValue={maxSegmentValue}
            />
          ))}
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <p className="px-5 pt-3 text-[13px] leading-[1.55] text-[hsl(var(--fg-2))]">
          {narrative}
        </p>
      )}

      {/* Share CTA */}
      {onShare && (
        <div className="px-5 pt-4 pb-5">
          <button
            type="button"
            onClick={onShare}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.06)] px-4 py-3 text-[13px] font-semibold text-[hsl(var(--brand))] transition-colors active:bg-[hsl(var(--brand)/0.12)]"
          >
            <Share2 className="h-4 w-4" strokeWidth={2} />
            Share your week
          </button>
        </div>
      )}

      {!onShare && <div className="pb-5" />}
    </section>
  );
}
