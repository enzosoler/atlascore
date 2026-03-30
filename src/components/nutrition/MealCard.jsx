import React from 'react';
import { Trash2 } from 'lucide-react';
import { MEAL_TYPES } from '@/lib/atlas-theme';
import { useI18n } from '@/lib/i18nContext';

export default function MealCard({ meal, onDelete }) {
  const { t } = useI18n();
  const label = MEAL_TYPES[meal.meal_type]?.label || meal.meal_type;

  return (
    <div className="atlas-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-[hsl(var(--fg-2))]">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold">{meal.total_calories || 0} {t('nutrition.mealCard.kcal')}</span>
          {onDelete && (
            <button onClick={() => onDelete(meal.id)} className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--err))] transition-colors">
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {(meal.foods || []).map((food, i) => (
          <div key={i} className="flex items-center justify-between text-[12px]">
            <span className="text-[hsl(var(--fg)/0.8)] truncate">{food.name}</span>
            <span className="text-[hsl(var(--fg-2))] shrink-0 ml-2">{food.amount}{food.unit}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-3 border-t border-[hsl(var(--border))] text-[11px]">
        <span className="text-[hsl(var(--fg-2))]">{t('nutrition.mealCard.proteinAbbr')} <span className="text-[hsl(var(--fg))] font-medium">{meal.total_protein || 0}g</span></span>
        <span className="text-[hsl(var(--fg-2))]">{t('nutrition.mealCard.carbsAbbr')} <span className="text-[hsl(var(--fg))] font-medium">{meal.total_carbs || 0}g</span></span>
        <span className="text-[hsl(var(--fg-2))]">{t('nutrition.mealCard.fatAbbr')} <span className="text-[hsl(var(--fg))] font-medium">{meal.total_fat || 0}g</span></span>
      </div>
    </div>
  );
}
