import React, { useState } from 'react';
import { Moon, Zap, TrendingUp, Droplets } from 'lucide-react';
import MobileSheet from '@/components/shared/MobileSheet';

const SIGNALS = [
  { key: 'sleep',    icon: Moon,       label: 'Sleep',    unit: 'hrs',  min: 0, max: 14, step: 0.5, defaultVal: 7 },
  { key: 'energy',   icon: Zap,        label: 'Energy',   unit: '/10',  min: 1, max: 10, step: 1,   defaultVal: 5 },
  { key: 'recovery', icon: TrendingUp, label: 'Recovery', unit: '/10',  min: 1, max: 10, step: 1,   defaultVal: 5 },
  { key: 'water',    icon: Droplets,   label: 'Water',    unit: 'L',    min: 0, max: 6,  step: 0.25, defaultVal: 2 },
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

export function ReadinessRow({ signals = {}, onSignalSave }) {
  const [activeKey, setActiveKey] = useState(null);
  const [inputValue, setInputValue] = useState(0);

  const activeSignal = SIGNALS.find((s) => s.key === activeKey);

  const openSheet = (key) => {
    const sig = SIGNALS.find((s) => s.key === key);
    const current = signals[key]?.rawValue;
    setInputValue(current ?? sig.defaultVal);
    setActiveKey(key);
  };

  const handleSave = () => {
    if (activeKey && onSignalSave) {
      onSignalSave(activeKey, inputValue);
    }
    setActiveKey(null);
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-0.5 px-0.5">
        {SIGNALS.map(({ key, icon: Icon, label }) => {
          const signal = signals[key] || {};
          const status = signal.status || 'neutral';
          const value = signal.value;

          return (
            <button
              key={key}
              onClick={() => openSheet(key)}
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

      {/* Per-signal input sheet */}
      <MobileSheet
        open={!!activeKey}
        onOpenChange={(o) => { if (!o) setActiveKey(null); }}
        title={activeSignal?.label}
        description={`Set your ${activeSignal?.label?.toLowerCase()} for today`}
      >
        <MobileSheet.Body className="flex flex-col items-center gap-6 py-6">
          {activeSignal && (
            <>
              <p className="text-[3rem] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
                {inputValue}{' '}
                <span className="text-[1rem] font-medium text-[hsl(var(--fg-2))]">
                  {activeSignal.unit}
                </span>
              </p>
              <input
                type="range"
                min={activeSignal.min}
                max={activeSignal.max}
                step={activeSignal.step}
                value={inputValue}
                onChange={(e) => setInputValue(parseFloat(e.target.value))}
                className="w-full max-w-[280px] accent-[hsl(var(--brand))]"
              />
              <div className="flex w-full max-w-[280px] justify-between text-[11px] text-[hsl(var(--fg-3))]">
                <span>{activeSignal.min}</span>
                <span>{activeSignal.max}</span>
              </div>
            </>
          )}
        </MobileSheet.Body>
        <MobileSheet.Footer>
          <button
            onClick={handleSave}
            className="atlas-button atlas-button-primary w-full"
          >
            Save
          </button>
        </MobileSheet.Footer>
      </MobileSheet>
    </>
  );
}
