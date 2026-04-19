import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Button, IconButton, Badge, Chip, Input, ListRow, ProgressBar } from '../ui';
import { cn } from '../lib/cn';
import { fmtDuration } from '../lib/formatters';

/** Workouts — Hevy-inspired active logging. Tactile, fast, one-thumb friendly. */

export function WorkoutPlanCard({ plan, onStart }) {
  return (
    <Card interactive onClick={() => onStart?.(plan)}>
      <CardBody>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-rd-card bg-rd-accent-muted text-rd-accent">
            <DumbbellIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-rd-h4 text-rd-fg truncate">{plan.name}</p>
            <p className="mt-0.5 text-[13px] text-rd-fg-muted">{plan.duration} · {plan.exercises} exercises · {plan.focus}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {plan.tags?.map((t) => <Badge key={t} tone="neutral" size="xs">{t}</Badge>)}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function WorkoutFilters({ filters, onToggle }) {
  const all = ['All','Upper body','Lower body','Push','Pull','Legs','Full body','Conditioning'];
  return (
    <div className="flex gap-2 overflow-x-auto rd-scroll-hide py-1">
      {all.map((f) => <Chip key={f} active={filters.includes(f)} onClick={() => onToggle?.(f)}>{f}</Chip>)}
    </div>
  );
}

export function HistoryRow({ entry, onClick }) {
  return (
    <ListRow
      onClick={onClick}
      title={entry.name}
      subtitle={`${entry.date} · ${entry.duration} · ${entry.volume} kg lifted`}
      meta={entry.prs ? `${entry.prs} PR${entry.prs > 1 ? 's' : ''}` : null}
      trailing={<span aria-hidden className="text-rd-fg-muted">›</span>}
    />
  );
}

/** Active-workout set logger. Per-row inline edit. */
export function SetLogger({ sets, onEdit, onCompleteSet, onAddSet }) {
  return (
    <div className="rounded-rd-card border border-rd-border bg-rd-surface overflow-hidden">
      <div className="grid grid-cols-[32px_1fr_1fr_60px_44px] items-center gap-2 border-b border-rd-border bg-rd-surface-2 px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">
        <span>Set</span><span>Kg</span><span>Reps</span><span>RPE</span><span></span>
      </div>
      <ul className="divide-y divide-rd-border">
        {sets.map((s) => (
          <li key={s.n} className={cn('grid grid-cols-[32px_1fr_1fr_60px_44px] items-center gap-2 px-3 py-2', s.done && 'bg-rd-success-muted/50')}>
            <span className="rd-tnum text-[13px] text-rd-fg-muted">{s.n}</span>
            <input
              type="number"
              step="0.5"
              defaultValue={s.kg ?? ''}
              onChange={(e) => onEdit?.(s.n, { kg: parseFloat(e.target.value) || null })}
              className="h-9 w-full rounded-rd-sm border border-rd-border bg-rd-surface-2 px-2 text-[14px] text-rd-fg rd-tnum outline-none focus:border-rd-accent"
              placeholder={s.kg ? String(s.kg) : '—'}
            />
            <input
              type="number"
              defaultValue={s.reps ?? ''}
              onChange={(e) => onEdit?.(s.n, { reps: parseInt(e.target.value, 10) || null })}
              className="h-9 w-full rounded-rd-sm border border-rd-border bg-rd-surface-2 px-2 text-[14px] text-rd-fg rd-tnum outline-none focus:border-rd-accent"
              placeholder={s.reps ? String(s.reps) : '—'}
            />
            <input
              type="number"
              step="0.5"
              defaultValue={s.rpe ?? ''}
              onChange={(e) => onEdit?.(s.n, { rpe: parseFloat(e.target.value) || null })}
              className="h-9 w-16 rounded-rd-sm border border-rd-border bg-rd-surface-2 px-2 text-[14px] text-rd-fg rd-tnum outline-none focus:border-rd-accent"
              placeholder="—"
            />
            <button
              onClick={() => onCompleteSet?.(s.n)}
              aria-label={s.done ? 'Undo set' : 'Complete set'}
              className={cn(
                'h-9 w-9 rounded-rd-sm flex items-center justify-center transition-colors',
                s.done ? 'bg-rd-success text-white' : 'bg-rd-surface-2 text-rd-fg-muted hover:bg-rd-elevated',
              )}
            >✓</button>
          </li>
        ))}
      </ul>
      <button onClick={onAddSet} className="w-full border-t border-rd-border py-2.5 text-[13px] text-rd-accent hover:bg-rd-surface-2">
        + Add set
      </button>
    </div>
  );
}

/** Rest timer — large dial, dismissible. Mimics Hevy. */
export function RestTimer({ seconds, remaining, onStop, onAdjust }) {
  const pct = 1 - (remaining / seconds);
  return (
    <div className="flex items-center justify-between gap-3 rounded-rd-card border border-rd-accent-muted bg-rd-accent-muted px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <svg viewBox="0 0 36 36" className="-rotate-90">
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--rd-bg-surface-2))" strokeWidth="3" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--rd-accent))" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={100.5} strokeDashoffset={100.5 * (1 - pct)} />
          </svg>
        </div>
        <div>
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-accent">Rest</p>
          <p className="text-rd-metric-md text-rd-fg rd-tnum">{fmtDuration(remaining)}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton size="sm" onClick={() => onAdjust?.(-15)}>−15</IconButton>
        <IconButton size="sm" onClick={() => onAdjust?.(+15)}>+15</IconButton>
        <Button size="sm" intent="ghost" onClick={onStop}>Skip</Button>
      </div>
    </div>
  );
}

/** Exercise header inside active workout. */
export function ActiveExerciseHeader({ name, target, lastResult, onSwap, onMore }) {
  return (
    <div className="flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-rd-h2 text-rd-fg truncate">{name}</p>
        <p className="mt-0.5 text-[13px] text-rd-fg-muted">
          Target: {target.sets} × {target.reps}{target.rpe ? ` @ RPE ${target.rpe}` : ''} · Last: {lastResult ?? '—'}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button intent="secondary" size="sm" onClick={onSwap}>Swap</Button>
        <IconButton size="sm" onClick={onMore} label="More">⋯</IconButton>
      </div>
    </div>
  );
}

export function SupersetHeader({ letters = ['A','B'], label = 'Superset' }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-[12px] uppercase tracking-[0.08em] text-rd-fg-muted">
      <span className="inline-flex h-5 items-center gap-1 rounded-full border border-rd-border bg-rd-surface-2 px-2">
        {letters.map((l) => <span key={l} className="font-semibold text-rd-fg">{l}</span>)}
      </span>
      <span>{label}</span>
    </div>
  );
}

/** Plate calculator — sum to target load. */
export function PlateCalculator({ total, bar = 20, plates = [25, 20, 15, 10, 5, 2.5, 1.25] }) {
  const perSide = Math.max(0, (total - bar) / 2);
  const sideStack = [];
  let rem = perSide;
  for (const p of plates) {
    while (rem - p >= -0.001) { sideStack.push(p); rem -= p; }
  }
  return (
    <div className="flex items-center gap-2 rounded-rd-control bg-rd-surface-2 p-2 text-[12px] text-rd-fg-muted">
      <span className="rd-tnum text-rd-fg">{total} kg</span>
      <span>=</span>
      <span className="rd-tnum">{bar} kg bar</span>
      <span>+</span>
      <span className="flex items-center gap-1">
        {sideStack.map((p, i) => <span key={i} className="inline-block rounded-rd-xs bg-rd-accent/20 px-1 text-[11px] rd-tnum text-rd-accent">{p}</span>)}
      </span>
      <span className="text-rd-fg-muted">per side</span>
    </div>
  );
}

function DumbbellIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 10v4 M5 8v8 M7 6v12 M17 6v12 M19 8v8 M21 10v4 M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
}

/** Client hook — drop-in timer. */
export function useRestTimer(duration = 90) {
  const [remaining, setRemaining] = useState(duration);
  const [running, setRunning] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setRemaining((r) => (r <= 1 ? (setRunning(false), 0) : r - 1)), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  return {
    seconds: duration,
    remaining,
    running,
    start: () => { setRemaining(duration); setRunning(true); },
    stop:  () => setRunning(false),
    adjust: (d) => setRemaining((r) => Math.max(0, r + d)),
  };
}
