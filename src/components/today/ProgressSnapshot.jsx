import React from 'react';
import { Flame, Dumbbell, Scale } from 'lucide-react';

function SnapshotCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="flex-1 flex flex-col gap-1 p-3.5 rounded-[15px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.38)]">
      <div className="flex items-center justify-between mb-0.5">
        <Icon className={`w-3.5 h-3.5 ${accent || 'text-[hsl(var(--fg-3))]'}`} strokeWidth={2} />
      </div>
      <p className={`text-[18px] font-bold tracking-[-0.03em] ${accent || 'text-[hsl(var(--fg))]'}`}>
        {value}
      </p>
      <p className="text-[11px] font-semibold text-[hsl(var(--fg-3))]">{label}</p>
      {sub && (
        <p className="text-[10px] text-[hsl(var(--fg-3))] leading-tight">{sub}</p>
      )}
    </div>
  );
}

/**
 * ProgressSnapshot — 3 compact stat cards: streak, workouts this week, weight.
 */
export function ProgressSnapshot({ recentMeasurements, todaySession, lastWorkout, weekWorkoutCount = 0 }) {
  // Streak: days since last workout (simple heuristic)
  const lastDate = todaySession?.status === 'completed'
    ? todaySession.completed_at || todaySession.date
    : lastWorkout?.completed_at || lastWorkout?.date;

  const daysSince = lastDate
    ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86_400_000)
    : null;

  const streakValue = daysSince === null ? '—'
    : daysSince === 0 ? '1'
    : `${daysSince}d`;

  const streakLabel = daysSince === null ? 'No sessions'
    : daysSince === 0 ? 'Active today'
    : `Since last session`;

  const streakAccent = daysSince === 0 ? 'text-[hsl(var(--ok))]' : undefined;

  // Weight
  const latestWeight = recentMeasurements?.[0]?.weight;
  const prevWeight = recentMeasurements?.[1]?.weight;
  const weightDelta = latestWeight && prevWeight
    ? (latestWeight - prevWeight).toFixed(1)
    : null;

  const weightValue = latestWeight ? `${latestWeight}` : '—';
  const weightSub = weightDelta !== null
    ? `${Number(weightDelta) > 0 ? '+' : ''}${weightDelta} kg`
    : latestWeight ? 'kg' : 'Not logged';

  return (
    <section className="space-y-2.5">
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] px-0.5">
        Progress
      </p>
      <div className="flex gap-2.5">
        <SnapshotCard
          icon={Flame}
          label={streakLabel}
          value={streakValue}
          accent={streakAccent}
        />
        <SnapshotCard
          icon={Dumbbell}
          label="This week"
          value={weekWorkoutCount}
          sub="sessions"
        />
        <SnapshotCard
          icon={Scale}
          label="Weight"
          value={weightValue}
          sub={weightSub}
        />
      </div>
    </section>
  );
}
