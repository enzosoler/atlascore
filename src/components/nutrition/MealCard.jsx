import React from 'react';
import { Trash2 } from 'lucide-react';
import { MEAL_TYPES } from '@/lib/atlas-theme';
import { useI18n } from '@/lib/i18nContext';

export default function MealCard({ meal, onDelete }) {
  const { t } = useI18n();
  const label = MEAL_TYPES[meal.meal_type]?.label || meal.meal_type;
  const foodPreview = (meal.foods || []).map((food) => food.name).filter(Boolean).slice(0, 3).join(', ');

  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--card))] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{label}</p>
          <p className="mt-1 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] truncate">
            {meal.title}
          </p>
          <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))] truncate">
            {foodPreview || `${(meal.foods || []).length} item(s)`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">{meal.total_calories || 0} {t('nutrition.mealCard.kcal')}</p>
          {onDelete && (
            <button onClick={() => onDelete(meal.id)} className="ml-auto mt-2 text-[hsl(var(--fg-3))] hover:text-[hsl(var(--err))] transition-colors">
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-4 border-t border-[hsl(var(--border)/0.5)] pt-3 text-[11px]">
        <span className="text-[hsl(var(--fg-2))]">{t('nutrition.mealCard.proteinAbbr')} <span className="text-[hsl(var(--fg))] font-medium">{meal.total_protein || 0}g</span></span>
        <span className="text-[hsl(var(--fg-2))]">{t('nutrition.mealCard.carbsAbbr')} <span className="text-[hsl(var(--fg))] font-medium">{meal.total_carbs || 0}g</span></span>
        <span className="text-[hsl(var(--fg-2))]">{t('nutrition.mealCard.fatAbbr')} <span className="text-[hsl(var(--fg))] font-medium">{meal.total_fat || 0}g</span></span>
      </div>
    </div>
  );
}
