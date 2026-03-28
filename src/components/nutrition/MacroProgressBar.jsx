import React from 'react';

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'hsl(var(--fg))' },
  { key: 'protein', label: 'Protein', unit: 'g', color: 'hsl(var(--brand))' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: 'hsl(var(--brand-ai))' },
  { key: 'fat', label: 'Fat', unit: 'g', color: 'hsl(var(--warn))' },
];

/**
 * MacroProgressBar — compact visual bars for calories + macros vs targets.
 */
export default function MacroProgressBar({ dailyTotals, profile }) {
  const targets = {
    calories: profile.calories_target || 0,
    protein: profile.protein_target || 0,
    carbs: profile.carbs_target || 0,
    fat: profile.fat_target || 0,
  };

  return (
    <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-4 space-y-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
        Macros
      </p>
      {MACROS.map(({ key, label, unit, color }) => {
        const consumed = dailyTotals[key] ?? 0;
        const target = targets[key];
        const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
        const remaining = Math.max(0, target - consumed);

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[12px] font-semibold text-[hsl(var(--fg))]">{label}</span>
              </div>
              <span className="text-[11px] text-[hsl(var(--fg-3))]">
                {Math.round(consumed)}{unit === 'kcal' ? '' : unit}
                {target > 0 && <span> / {target}{unit === 'kcal' ? '' : unit}</span>}
                {target > 0 && remaining > 0 && (
                  <span className="ml-1 font-medium text-[hsl(var(--fg-2))]">
                    ({Math.round(remaining)} left)
                  </span>
                )}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--fill)/0.8)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: target > 0 ? `${pct}%` : '0%', backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
