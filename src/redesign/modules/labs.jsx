import React from 'react';
import { Card, CardBody, Badge } from '../ui';
import { cn } from '../lib/cn';
import { fmtDec } from '../lib/formatters';

/** Function Health-style biomarker presentation. */

const STATUS = {
  optimal:  { label: 'Optimal',  tone: 'success', color: 'hsl(var(--rd-success))' },
  normal:   { label: 'Normal',   tone: 'accent',  color: 'hsl(var(--rd-info))' },
  elevated: { label: 'Elevated', tone: 'warning', color: 'hsl(var(--rd-warning))' },
  low:      { label: 'Low',      tone: 'warning', color: 'hsl(var(--rd-warning))' },
  high:     { label: 'High',     tone: 'danger',  color: 'hsl(var(--rd-danger))' },
};

/** Range visualization — diverges red / yellow / green. */
export function BiomarkerRange({ value, range, status }) {
  const [lo, hi] = range;
  const span = hi - lo;
  const clamped = Math.max(lo, Math.min(hi, value));
  const pos = ((clamped - lo) / span) * 100;
  const s = STATUS[status] || STATUS.normal;
  return (
    <div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-rd-warning/50 via-rd-success/60 to-rd-danger/50" aria-hidden>
        <div className="absolute top-1/2 -mt-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-white bg-white/90" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-rd-fg-muted rd-tnum">
        <span>{fmtDec(lo, 0)}</span>
        <span style={{ color: s.color }}>{s.label}</span>
        <span>{fmtDec(hi, 0)}</span>
      </div>
    </div>
  );
}

export function BiomarkerCard({ biomarker, onClick }) {
  const s = STATUS[biomarker.status] || STATUS.normal;
  return (
    <Card interactive onClick={onClick}>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] text-rd-fg-secondary">{biomarker.name}</p>
          <Badge tone={s.tone} size="xs">{s.label}</Badge>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-rd-metric-md text-rd-fg rd-tnum">{fmtDec(biomarker.value, biomarker.value > 10 ? 0 : 1)}</span>
          <span className="text-[12px] text-rd-fg-muted">{biomarker.unit}</span>
        </div>
        <div className="mt-3">
          <BiomarkerRange value={biomarker.value} range={biomarker.range} status={biomarker.status} />
        </div>
      </CardBody>
    </Card>
  );
}

export function CategoryScore({ title, score, max = 100, insights = [] }) {
  const pct = (score / max) * 100;
  const tone = pct >= 75 ? 'success' : pct >= 50 ? 'accent' : pct >= 25 ? 'warning' : 'danger';
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <p className="text-rd-h4 text-rd-fg">{title}</p>
          <span className="rd-tnum text-rd-metric-sm text-rd-fg">{score}<span className="text-rd-fg-muted text-[12px]">/{max}</span></span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-rd-surface-2">
          <div className={cn('h-full rounded-full',
            tone === 'success' ? 'bg-rd-success' :
            tone === 'accent'  ? 'bg-rd-accent'  :
            tone === 'warning' ? 'bg-rd-warning' : 'bg-rd-danger',
          )} style={{ width: `${pct}%` }} />
        </div>
        {insights.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-[13px] text-rd-fg-secondary">
            {insights.map((i) => <li key={i}>· {i}</li>)}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export function InterpretationPanel({ biomarker, explanation, recommendations }) {
  return (
    <Card>
      <CardBody>
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">What this means</p>
        <p className="mt-2 text-[14px] text-rd-fg-secondary leading-relaxed">{explanation}</p>
        {recommendations?.length > 0 && (
          <>
            <p className="mt-5 text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Suggested actions</p>
            <ul className="mt-2 space-y-2">
              {recommendations.map((r, i) => (
                <li key={i} className="rounded-rd-md border border-rd-border bg-rd-surface-2 p-3 text-[13px] text-rd-fg">
                  {r}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardBody>
    </Card>
  );
}
