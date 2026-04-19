import React from 'react';
import { Trash2 } from 'lucide-react';
import { Food } from './types';
import { cn } from '@/lib/utils';

interface FoodRowProps {
  food: Food;
  onDelete?: () => void;
  onUpdateAmount?: (newAmount: number) => void;
  showMacros?: boolean;
}

const MACRO_DOT_CLASS = {
  calories: 'bg-[hsl(var(--fg))]',
  protein: 'bg-[hsl(var(--brand))]',
  carbs: 'bg-[hsl(var(--brand-ai))]',
  fat: 'bg-[hsl(var(--warn))]',
};

export function FoodRow({ food, onDelete, onUpdateAmount, showMacros = true }: FoodRowProps) {
  return (
    <div className="rounded-[14px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.46)] px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[hsl(var(--fg))]">{food.name}</p>
          {showMacros && (
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              {food.kcal} kcal · P {food.protein}g · C {food.carbs}g · F {food.fat}g
            </p>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-3 shrink-0 rounded-lg p-1.5 text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
      {onUpdateAmount && food._baseAmount && (
        <div className="mt-2 flex items-center gap-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
          <label className="text-[11px] text-[hsl(var(--fg-3))] shrink-0">Portion</label>
          <input
            type="number"
            min="1"
            max="5000"
            value={food.amount}
            onChange={(e) => onUpdateAmount(parseFloat(e.target.value) || 0)}
            className="w-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-1 text-[12px] text-[hsl(var(--fg))] text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand)/0.3)]"
          />
          <span className="text-[11px] text-[hsl(var(--fg-3))]">g</span>
        </div>
      )}
    </div>
  );
}
