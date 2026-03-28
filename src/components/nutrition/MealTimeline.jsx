import React from 'react';
import {
  Sunrise, Sun, Moon, Apple, Zap, Plus, Pencil, Trash2,
} from 'lucide-react';

const MEAL_META = {
  breakfast:        { icon: Sunrise, label: 'Breakfast', time: 'Morning' },
  morning_snack:    { icon: Apple,   label: 'Morning Snack', time: 'Late Morning' },
  lunch:            { icon: Sun,     label: 'Lunch', time: 'Midday' },
  afternoon_snack:  { icon: Apple,   label: 'Afternoon Snack', time: 'Afternoon' },
  pre_workout:      { icon: Zap,     label: 'Pre-Workout', time: 'Before Training' },
  post_workout:     { icon: Zap,     label: 'Post-Workout', time: 'After Training' },
  dinner:           { icon: Moon,    label: 'Dinner', time: 'Evening' },
  evening_snack:    { icon: Apple,   label: 'Evening Snack', time: 'Night' },
};

function MealEntry({ meal, onEdit, onDelete }) {
  const meta = MEAL_META[meal.meal_type] || MEAL_META.lunch;
  const Icon = meta.icon;

  return (
    <div className="flex gap-3 py-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-7 h-7 rounded-[9px] bg-[hsl(var(--fill)/0.8)] flex items-center justify-center text-[hsl(var(--fg-2))]">
          <Icon className="w-3.5 h-3.5" strokeWidth={1.9} />
        </div>
        <div className="flex-1 w-px bg-[hsl(var(--border)/0.5)] mt-1.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))] truncate">{meal.title}</p>
            <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">{meta.label}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(meal)}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.6)] transition-colors"
            >
              <Pencil className="w-3 h-3" strokeWidth={2} />
            </button>
            <button
              onClick={() => onDelete(meal)}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)] transition-colors"
            >
              <Trash2 className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Macro pills */}
        <div className="flex gap-2 mt-2">
          {[
            { label: 'kcal', value: meal.total_calories },
            { label: 'P', value: meal.total_protein, unit: 'g' },
            { label: 'C', value: meal.total_carbs, unit: 'g' },
            { label: 'F', value: meal.total_fat, unit: 'g' },
          ].map(({ label, value, unit }) => (
            <span key={label} className="text-[10px] font-medium text-[hsl(var(--fg-3))] bg-[hsl(var(--fill)/0.6)] rounded-md px-1.5 py-0.5">
              {Math.round(value || 0)}{unit || ''} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * MealTimeline — chronological list of today's meals with edit/delete.
 */
export default function MealTimeline({ meals, onEdit, onDelete, onAddMeal }) {
  if (meals.length === 0) {
    return (
      <div className="rounded-[16px] border border-dashed border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.15)] py-8 flex flex-col items-center gap-3">
        <p className="text-[13px] text-[hsl(var(--fg-3))]">No meals logged today</p>
        <button
          onClick={onAddMeal}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--brand))] hover:opacity-80"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          Add your first meal
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] px-4 divide-y divide-[hsl(var(--border)/0.4)]">
      {meals.map((meal) => (
        <MealEntry
          key={meal.id}
          meal={meal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
