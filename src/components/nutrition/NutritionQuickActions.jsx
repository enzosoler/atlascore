import React from 'react';
import { Plus, Sparkles, Search, Copy } from 'lucide-react';

/**
 * NutritionQuickActions — horizontal scrollable action row.
 * add meal, quick AI add, copy yesterday, search foods
 */
export default function NutritionQuickActions({ onAddMeal, onQuickAI, onCopyYesterday, onSearch }) {
  const actions = [
    { icon: Plus, label: 'Add Meal', color: 'brand', onClick: onAddMeal },
    { icon: Sparkles, label: 'Quick AI', color: 'brand-ai', onClick: onQuickAI },
    { icon: Copy, label: 'Copy Yesterday', color: 'fg-2', onClick: onCopyYesterday },
    { icon: Search, label: 'Search Foods', color: 'fg-2', onClick: onSearch },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {actions.map(({ icon: Icon, label, color, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className={`shrink-0 flex items-center gap-2 rounded-[12px] border px-3.5 h-10 text-[12px] font-semibold transition-all active:scale-[0.97] ${
            color === 'brand'
              ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
              : color === 'brand-ai'
                ? 'border-[hsl(var(--brand-ai)/0.3)] bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))]'
                : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] text-[hsl(var(--fg-2))]'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}
