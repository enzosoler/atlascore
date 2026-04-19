import React from 'react';
import { cn } from '../lib/cn';

/**
 * Linear progress bar.
 */
export function ProgressBar({ value = 0, max = 100, tone = 'accent', label, showValue, className }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fills = {
    accent:    'bg-rd-accent',
    success:   'bg-rd-success',
    warning:   'bg-rd-warning',
    danger:    'bg-rd-danger',
    ai:        'bg-rd-ai',
    premium:   'bg-rd-premium',
    excellent: 'bg-rd-health-excellent',
    good:      'bg-rd-health-good',
    moderate:  'bg-rd-health-moderate',
    low:       'bg-rd-health-low',
  };
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[12px] text-rd-fg-muted">
          {label && <span>{label}</span>}
          {showValue && <span className="rd-tnum text-rd-fg-secondary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-rd-surface-2">
        <div
          className={cn('h-full rounded-full transition-all duration-rd-slow ease-rd-out', fills[tone])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/**
 * RingProgress — Apple Fitness / Whoop / Oura style. SVG.
 * Concentric rings when given an array of { value, max, tone, label }.
 */
export function RingProgress({
  size = 120,
  stroke = 10,
  value = 0,
  max = 100,
  tone = 'accent',
  label,
  sublabel,
  rings,
  className,
}) {
  const radius = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * radius;
  const toneColor = {
    accent:   'var(--rd-accent)',
    success:  'var(--rd-success)',
    warning:  'var(--rd-warning)',
    danger:   'var(--rd-danger)',
    ai:       'var(--rd-ai)',
    premium:  'var(--rd-premium)',
    excellent:'var(--rd-health-excellent)',
    good:     'var(--rd-health-good)',
    moderate: 'var(--rd-health-moderate)',
    low:      'var(--rd-health-low)',
  };

  const single = !rings;
  const ringData = single ? [{ value, max, tone }] : rings;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {ringData.map((r, i) => {
          const rStroke = stroke - i * (stroke / (ringData.length + 1));
          const rRadius = radius - i * (stroke + 2);
          const rC = 2 * Math.PI * rRadius;
          const pct = Math.max(0, Math.min(1, (r.value ?? 0) / (r.max ?? 100)));
          const offset = rC * (1 - pct);
          return (
            <g key={i}>
              <circle cx={size / 2} cy={size / 2} r={rRadius} fill="none"
                stroke="hsl(var(--rd-bg-surface-2))" strokeWidth={rStroke} />
              <circle cx={size / 2} cy={size / 2} r={rRadius} fill="none"
                stroke={`hsl(${toneColor[r.tone] ?? toneColor.accent})`}
                strokeWidth={rStroke} strokeLinecap="round"
                strokeDasharray={rC}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 600ms var(--rd-ease-out)' }}
              />
            </g>
          );
        })}
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && <span className="text-rd-metric-md text-rd-fg rd-tnum">{label}</span>}
          {sublabel && <span className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
