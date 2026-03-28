import React from 'react';
import { Moon, Zap, TrendingUp, Droplets } from 'lucide-react';

const SIGNALS = [
  { key: 'sleep',    icon: Moon,       label: 'Sleep' },
  { key: 'energy',   icon: Zap,        label: 'Energy' },
  { key: 'recovery', icon: TrendingUp, label: 'Recovery' },
  { key: 'water',    icon: Droplets,   label: 'Water' },
];

const STATUS_STYLES = {
  good:    'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.07)] text-[hsl(var(--ok))]',
  warn:    'border-[hsl(var(--warn)/0.22)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
  low:     'border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.06)] text-[hsl(var(--err))]',
  neutral: 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-3))]',
};

const ICON_STATUS = {
  good:    'text-[hsl(var(--ok))]',
  warn:    'text-[hsl(var(--warn))]',
  low:     'text-[hsl(var(--err))]',
  neutral: 'text-[hsl(var(--fg-3))]',
};

/**
 * ReadinessRow — 4 compact tappable pills: Sleep, Energy, Recovery, Water.
 * Each pill opens a quick-input sheet via onTap(key).
 *
 * signals: { sleep, energy, recovery, water } — each: { value, status: 'good'|'warn'|'low'|'neutral' }
 */
export function ReadinessRow({ signals = {}, onTap }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-0.5 px-0.5">
      {SIGNALS.map(({ key, icon: Icon, label }) => {
        const signal = signals[key] || {};
        const status = signal.status || 'neutral';
        const value = signal.value;

        return (
          <button
            key={key}
            onClick={() => onTap?.(key)}
            className={`flex-1 min-w-[70px] flex flex-col items-center gap-1.5 py-3 px-2 rounded-[15px] border transition-all active:scale-95 ${STATUS_STYLES[status]}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${ICON_STATUS[status]}`} strokeWidth={2} />
            <span className="text-[11px] font-semibold leading-none text-[hsl(var(--fg-2))]">
              {label}
            </span>
            {value ? (
              <span className={`text-[10px] font-bold leading-none ${ICON_STATUS[status]}`}>
                {value}
              </span>
            ) : (
              <span className="text-[10px] font-medium leading-none text-[hsl(var(--fg-3))]">
                —
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
