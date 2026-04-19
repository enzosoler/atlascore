import React from 'react';
import { Card, CardHeader, CardBody, CardFooter, MetricCard, Badge, ProgressBar, RingProgress, Button, ListRow } from '../ui';
import { cn } from '../lib/cn';
import { readinessBand, fmtInt } from '../lib/formatters';

/**
 * Today module — Whoop-style modular dashboard cards.
 * Each card is self-contained and safe to compose.
 */

export function ReadinessCard({ score, hrv, rhr, sleepHours }) {
  const band = readinessBand(score);
  return (
    <Card className="overflow-hidden">
      <CardBody>
        <div className="flex items-center gap-5">
          <RingProgress
            size={128}
            stroke={12}
            value={score}
            max={100}
            tone={score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'moderate' : 'low'}
            label={fmtInt(score)}
            sublabel="READINESS"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full bg-${band.color}`} />
              <p className="text-rd-h3 text-rd-fg">{band.label}</p>
            </div>
            <p className="mt-1 text-[13px] text-rd-fg-muted">Your body looks ready for a moderate to hard session today.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="HRV"   value={hrv}         unit="ms" />
              <Stat label="RHR"   value={rhr}         unit="bpm" />
              <Stat label="Sleep" value={sleepHours}  unit="h" decimal />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function Stat({ label, value, unit, decimal }) {
  return (
    <div>
      <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">{label}</p>
      <p className="mt-0.5 text-rd-metric-sm text-rd-fg rd-tnum">
        {value == null ? '—' : decimal ? value.toFixed(1) : value}{' '}
        <span className="text-[12px] text-rd-fg-muted font-normal">{unit}</span>
      </p>
    </div>
  );
}

export function DailyTargetsCard({ macros }) {
  const rings = [
    { value: macros.consumed.kcal,    max: macros.targets.kcal,    tone: 'accent' },
    { value: macros.consumed.protein, max: macros.targets.protein, tone: 'good' },
    { value: macros.consumed.carbs,   max: macros.targets.carbs,   tone: 'premium' },
  ];
  return (
    <Card>
      <CardHeader title="Today's targets" subtitle="Calories · Protein · Carbs" />
      <CardBody>
        <div className="flex items-center gap-5">
          <RingProgress size={104} stroke={9} rings={rings} label={`${fmtInt(macros.consumed.kcal)}`} sublabel="KCAL" />
          <div className="flex-1 space-y-2.5">
            <MacroRow label="Protein" consumed={macros.consumed.protein} target={macros.targets.protein} tone="good" />
            <MacroRow label="Carbs"   consumed={macros.consumed.carbs}   target={macros.targets.carbs}   tone="premium" />
            <MacroRow label="Fat"     consumed={macros.consumed.fat}     target={macros.targets.fat}     tone="warning" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function MacroRow({ label, consumed, target, tone = 'accent' }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-rd-fg-muted">{label}</span>
        <span className="text-[12px] rd-tnum text-rd-fg-secondary">
          <span className="text-rd-fg font-semibold">{fmtInt(consumed)}</span> / {fmtInt(target)} g
        </span>
      </div>
      <ProgressBar value={consumed} max={target} tone={tone} className="mt-1" />
    </div>
  );
}

export function TodayAgendaCard({ tasks }) {
  return (
    <Card>
      <CardHeader title="Agenda" subtitle={tasks.filter(t => !t.done).length + ' to do'} />
      <div className="divide-y divide-rd-border">
        {tasks.map((t) => (
          <ListRow
            key={t.id}
            leading={<KindIcon kind={t.kind} />}
            title={t.title}
            subtitle={t.due}
            trailing={t.done ? <Badge tone="success" size="xs">Done</Badge> : <Badge tone="neutral" size="xs">{t.kind}</Badge>}
          />
        ))}
      </div>
    </Card>
  );
}
function KindIcon({ kind }) {
  const color = kind === 'workout' ? 'bg-rd-accent' : kind === 'nutrition' ? 'bg-rd-premium' : 'bg-rd-ai';
  return <span className={cn('inline-block h-2.5 w-2.5 rounded-full', color)} />;
}

export function StreakCard({ days }) {
  return (
    <Card className="bg-gradient-to-br from-rd-accent-muted via-transparent to-rd-surface">
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Streak</p>
            <p className="mt-1 text-rd-metric-lg text-rd-fg rd-tnum">{days} days</p>
            <p className="mt-1 text-[13px] text-rd-fg-muted">Logged every day this week.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rd-accent-muted text-rd-accent text-2xl">🔥</div>
        </div>
      </CardBody>
    </Card>
  );
}

export function AIInsightCard({ title, body, onExplain, onAct }) {
  return (
    <Card tone="ai">
      <CardHeader
        title={<span className="inline-flex items-center gap-2 text-rd-ai"><Sparkle /> Coach insight</span>}
        subtitle="Based on the last 7 days"
      />
      <CardBody>
        <p className="text-rd-h3 text-rd-fg">{title}</p>
        <p className="mt-2 text-[14px] text-rd-fg-secondary leading-relaxed">{body}</p>
      </CardBody>
      <CardFooter>
        {onAct && <Button size="sm" intent="ai" onClick={onAct}>Apply suggestion</Button>}
        {onExplain && <Button size="sm" intent="ghost" onClick={onExplain}>Why this?</Button>}
      </CardFooter>
    </Card>
  );
}

export function WeeklyReviewCard({ kcalAvg, pr, workouts, trend }) {
  return (
    <Card className="bg-[radial-gradient(400px_200px_at_10%_0%,rgba(0,255,255,0.08),transparent)]">
      <CardHeader title="Your week" subtitle="Apr 10 – Apr 16" />
      <CardBody>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Avg kcal" value={kcalAvg} unit="kcal" />
          <Stat label="Workouts" value={workouts} unit="" />
          <Stat label="PRs" value={pr} unit="" />
        </div>
        <p className="mt-4 text-[13px] text-rd-fg-secondary">{trend}</p>
      </CardBody>
      <CardFooter>
        <Button intent="secondary" size="sm">See full review</Button>
      </CardFooter>
    </Card>
  );
}

export function QuickActionsRow({ onLog, onWorkout, onCoach, onWeight }) {
  const items = [
    { id: 'log',     label: 'Log food',    onClick: onLog,     icon: '🍽' },
    { id: 'workout', label: 'Start workout', onClick: onWorkout, icon: '🏋' },
    { id: 'weight',  label: 'Weigh in',    onClick: onWeight,  icon: '⚖' },
    { id: 'coach',   label: 'Ask coach',   onClick: onCoach,   icon: '✨' },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((a) => (
        <button key={a.id} onClick={a.onClick} className="flex flex-col items-center gap-2 rounded-rd-card border border-rd-border bg-rd-surface p-3 transition-colors hover:border-rd-border-strong hover:bg-rd-surface-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rd-surface-2 text-lg">{a.icon}</span>
          <span className="text-[12px] text-rd-fg-secondary">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5L18 18 M6 18l2.5-2.5 M15.5 8.5 18 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
