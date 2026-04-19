import React from 'react';
import { Card, CardHeader, CardBody, Button, Input, Badge, ListRow } from '../ui';
import { cn } from '../lib/cn';
import { fmtKg, fmtDec, fmtRelDay } from '../lib/formatters';

/** Body / Measurements / Progress. Happy Scale + MacroFactor inspired. */

/** Trend chart — lightweight inline SVG. Moving average emphasized. */
export function TrendChart({ data, height = 140, accessor = 'kg', unit = 'kg' }) {
  if (!data?.length) return null;
  const values = data.map((d) => d[accessor]);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const w = 300;
  const h = height;
  const pointX = (i) => (i / (data.length - 1)) * w;
  const pointY = (v) => h - ((v - min) / (max - min)) * h;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${pointX(i).toFixed(1)} ${pointY(d[accessor]).toFixed(1)}`).join(' ');
  // 7-day moving average
  const mov = values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - 6), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
  const movPath = mov.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pointX(i).toFixed(1)} ${pointY(v).toFixed(1)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" preserveAspectRatio="none">
        <path d={`${linePath} L ${w} ${h} L 0 ${h} Z`} fill="hsl(var(--rd-accent) / 0.08)" />
        <path d={linePath} stroke="hsl(var(--rd-fg-muted))" strokeOpacity=".3" strokeWidth="1.25" fill="none" />
        <path d={movPath}  stroke="hsl(var(--rd-accent))" strokeWidth="2" fill="none" />
      </svg>
      <div className="mt-2 flex items-center gap-4 text-[11px] text-rd-fg-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-[2px] w-4 bg-rd-accent rounded" /> 7-day moving avg</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-[2px] w-4 bg-rd-fg-muted/30 rounded" /> Daily ({unit})</span>
      </div>
    </div>
  );
}

export function WeightEntryCard({ latest, onLog }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Weight</p>
            <p className="mt-1 text-rd-metric-xl text-rd-fg rd-tnum">{fmtKg(latest?.kg)}</p>
            <p className="text-[12px] text-rd-fg-muted">
              {latest ? `Last logged ${fmtRelDay(latest.date)}` : 'No entries yet'}
            </p>
          </div>
          <Button intent="primary" size="md" onClick={onLog}>Log today</Button>
        </div>
      </CardBody>
    </Card>
  );
}

export function MeasurementsList({ rows, onEdit }) {
  return (
    <ul className="divide-y divide-rd-border rounded-rd-card border border-rd-border bg-rd-surface">
      {rows.map((r) => (
        <li key={r.id}>
          <ListRow
            onClick={() => onEdit?.(r)}
            title={r.label}
            subtitle={r.date ? `Last ${fmtRelDay(r.date)}` : 'Not logged'}
            meta={r.value ? `${fmtDec(r.value, 1)} ${r.unit}` : '—'}
          />
        </li>
      ))}
    </ul>
  );
}

export function BeforeAfterSlider({ before, after, position = 50, onChange, label = 'Drag to compare' }) {
  return (
    <div className="space-y-2">
      <div className="relative w-full overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface-2 aspect-[4/5]">
        {before && <img src={before} alt="before" className="absolute inset-0 h-full w-full object-cover" />}
        {after && (
          <img
            src={after}
            alt="after"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)` }}
          />
        )}
        <div className="absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
          <div className="absolute top-0 bottom-0 -ml-px w-0.5 bg-white/80" />
          <div className="absolute top-1/2 -left-3 -mt-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-black/40 text-white">↔</div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => onChange?.(parseInt(e.target.value, 10))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          aria-label={label}
        />
      </div>
      <p className="text-center text-[12px] text-rd-fg-muted">{label}</p>
    </div>
  );
}

export function PoseGuide({ pose = 'front' }) {
  const poses = {
    front: 'Stand relaxed, arms at sides.',
    side:  'Turn 90° to the right, arms relaxed.',
    back:  'Face away, arms relaxed.',
  };
  return (
    <div className="rounded-rd-card border border-rd-border bg-rd-surface p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rd-surface-2 text-2xl">🧍</div>
        <div>
          <p className="text-rd-h4 text-rd-fg capitalize">{pose} pose</p>
          <p className="text-[13px] text-rd-fg-muted">{poses[pose]}</p>
        </div>
      </div>
    </div>
  );
}
