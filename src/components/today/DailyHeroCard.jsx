/**
 * DailyHeroCard — single dominant visual answering "how is today going?"
 *
 * Combines workout/nutrition/checkin status into one completion ring.
 * Inspired by Apple Fitness+ Activity Rings and Whoop daily strain gauge.
 */

import React from 'react';
import { Activity, Dumbbell, UtensilsCrossed, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

function CompletionRing({ size = 120, strokeWidth = 10, pct, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(pct, 0), 100);
  const offset = circ - (clamped / 100) * circ;

  // Color shifts with completion: brand-ai (low) -> brand (mid) -> ok (done)
  let strokeColor = 'hsl(var(--brand-ai))';
  if (clamped >= 100) strokeColor = 'hsl(var(--ok))';
  else if (clamped >= 50) strokeColor = 'hsl(var(--brand))';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="hsl(var(--fill))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function StatusDot({ done, label, icon: Icon }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
        done
          ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
          : 'bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-3))]'
      )}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </div>
      <span className={cn(
        'text-[13px] font-medium',
        done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'
      )}>
        {label}
      </span>
    </div>
  );
}

export default function DailyHeroCard({
  workoutDone,
  nutritionLogged,
  checkinDone,
  weightLogged,
  completedCount,
  totalCount,
  statusLabel,
  statusMessage,
  status,
}) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statusColorMap = {
    'on-track':        'bg-[hsl(var(--ok))]',
    'neutral':         'bg-[hsl(var(--fg-3))]',
    'caution':         'bg-[hsl(var(--warn))]',
    'needs-attention': 'bg-[hsl(var(--err))]',
  };
  const dotColor = statusColorMap[status] || statusColorMap['neutral'];

  return (
    <section className="overflow-hidden rounded-[26px] border border-[hsl(var(--border)/0.55)] bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)/0.08),transparent_50%),linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.12)_100%)] shadow-[0_2px_24px_hsl(var(--brand)/0.04)]">
      <div className={cn(
        'h-[2px]',
        status === 'needs-attention' ? 'bg-[hsl(var(--err))]'
          : status === 'caution' ? 'bg-[hsl(var(--warn))]'
          : status === 'on-track' ? 'bg-[hsl(var(--ok))]'
          : 'bg-[hsl(var(--brand))]'
      )} />

      <div className="p-5 sm:p-6">
        {/* Top: Status label */}
        <div className="flex items-center gap-2 mb-5">
          <span className={cn('h-2 w-2 rounded-full', dotColor)} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
            Daily status
          </p>
        </div>

        {/* Center: Ring + status text side by side */}
        <div className="flex items-center gap-6">
          <CompletionRing size={110} strokeWidth={9} pct={pct}>
            <div className="text-center">
              <p className="text-[28px] font-bold tabular-nums tracking-[-0.04em] text-[hsl(var(--fg))]">
                {pct}%
              </p>
            </div>
          </CompletionRing>

          <div className="flex-1 min-w-0 space-y-1.5">
            <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {statusLabel}
            </h2>
            <p className="text-[14px] leading-[1.45] text-[hsl(var(--fg-2))] line-clamp-2">
              {statusMessage}
            </p>
            <p className="text-[12px] font-semibold text-[hsl(var(--fg-3))]">
              {completedCount}/{totalCount} complete
            </p>
          </div>
        </div>

        {/* Bottom: individual status dots */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-[hsl(var(--border)/0.35)]">
          <StatusDot done={workoutDone} label="Workout" icon={Dumbbell} />
          <StatusDot done={nutritionLogged} label="Nutrition" icon={UtensilsCrossed} />
          <StatusDot done={checkinDone || weightLogged} label="Check-in" icon={Scale} />
        </div>
      </div>
    </section>
  );
}
