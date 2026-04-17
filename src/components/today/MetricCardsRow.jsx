/**
 * MetricCardsRow — 3-4 compact metric tiles in a grid.
 *
 * Inspired by Whoop dashboard metric tiles and Apple Fitness summary cards.
 * Each card is tappable and shows a single KPI at a glance.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Beef, Dumbbell, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

function MetricTile({ to, onClick, icon: Icon, label, value, subtext, colorClass }) {
  const inner = (
    <div className="flex flex-col justify-between rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3.5 shadow-sm transition-all duration-200 active:bg-[hsl(var(--fill)/0.5)] active:scale-[0.97] min-h-[96px]">
      <div className="flex items-center justify-between mb-2">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-[10px]', colorClass)}>
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
      </div>
      <div>
        <p className="text-[18px] font-bold tabular-nums tracking-[-0.03em] text-[hsl(var(--fg))] leading-tight">
          {value}
        </p>
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] mt-0.5">{label}</p>
        {subtext && (
          <p className="text-[10px] text-[hsl(var(--fg-3)/0.7)] mt-0.5">{subtext}</p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="text-left w-full">{inner}</button>;
  }
  return <Link to={to} className="block">{inner}</Link>;
}

export default function MetricCardsRow({
  caloriesRemaining,
  caloriesTarget,
  proteinConsumed,
  proteinTarget,
  weekWorkoutCount,
  streak,
}) {
  const calDisplay = caloriesRemaining > 0 ? `${caloriesRemaining}` : '0';
  const calSubtext = caloriesTarget > 0 ? `of ${caloriesTarget} kcal` : 'kcal remaining';
  const proteinPct = proteinTarget > 0 ? Math.round((proteinConsumed / proteinTarget) * 100) : 0;
  const proteinDisplay = proteinTarget > 0 ? `${proteinConsumed}/${proteinTarget}g` : `${proteinConsumed}g`;

  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricTile
        to={ROUTES.nutrition}
        icon={Flame}
        label="Calories left"
        value={calDisplay}
        subtext={calSubtext}
        colorClass="bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]"
      />
      <MetricTile
        to={ROUTES.nutrition}
        icon={Beef}
        label="Protein"
        value={proteinDisplay}
        subtext={proteinPct > 0 ? `${proteinPct}% of target` : null}
        colorClass="bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]"
      />
      <MetricTile
        to={ROUTES.workouts}
        icon={Dumbbell}
        label="Workouts this week"
        value={String(weekWorkoutCount || 0)}
        subtext="sessions"
        colorClass="bg-[hsl(var(--brand-ai)/0.1)] text-[hsl(var(--brand-ai))]"
      />
      <MetricTile
        to={ROUTES.goals}
        icon={Activity}
        label="Current streak"
        value={streak > 0 ? `${streak}d` : '--'}
        subtext={streak > 0 ? 'consecutive days' : 'start today'}
        colorClass="bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]"
      />
    </div>
  );
}
