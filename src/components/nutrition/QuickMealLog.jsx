import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18nContext';

export default function QuickMealLog({ date, mealType, onClose }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [foods, setFoods] = useState([{ name: '', amount: '', unit: '', kcal: '' }]);

  const createMut = useMutation({
    mutationFn: async (data) => ({}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals', date] });
      toast.success(t('nutrition.quickLog.mealLogged'));
      onClose?.();
    },
  });

  const handleAddFood = () => {
    setFoods([...foods, { name: '', amount: '', unit: '', kcal: '' }]);
  };

  const handleRemoveFood = (idx) => {
    setFoods(foods.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!foods.some(f => f.name?.trim())) {
      toast.error(t('nutrition.quickLog.addAtLeastOne'));
      return;
    }

    const totalCals = foods.reduce((sum, f) => sum + (Number(f.kcal) || 0), 0);
    const payload = {
      date,
      meal_type: mealType,
      foods: foods.filter(f => f.name?.trim()),
      total_calories: totalCals,
    };

    createMut.mutate(payload);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {foods.map((food, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <input
              type="text"
              value={food.name}
              onChange={e => { const u = [...foods]; u[idx].name = e.target.value; setFoods(u); }}
              placeholder={t('nutrition.quickLog.foodNamePlaceholder')}
              className="atlas-field h-9 flex-1 rounded-lg px-3 text-base"
            />
            <input
              type="number"
              value={food.amount}
              onChange={e => { const u = [...foods]; u[idx].amount = e.target.value; setFoods(u); }}
              placeholder={t('nutrition.quickLog.amountPlaceholder')}
              className="atlas-field h-9 w-16 rounded-lg px-2 text-base"
            />
            <input
              type="text"
              value={food.unit}
              onChange={e => { const u = [...foods]; u[idx].unit = e.target.value; setFoods(u); }}
              placeholder="g"
              className="atlas-field h-9 w-12 rounded-lg px-2 text-base"
            />
            <input
              type="number"
              value={food.kcal}
              onChange={e => { const u = [...foods]; u[idx].kcal = e.target.value; setFoods(u); }}
              placeholder="kcal"
              className="atlas-field h-9 w-16 rounded-lg px-2 text-base"
            />
            <button
              onClick={() => handleRemoveFood(idx)}
              className="w-9 h-9 rounded-lg hover:bg-[hsl(var(--err)/0.1)] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--err))] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mx-auto" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddFood}
        className="w-full py-2 rounded-lg border border-dashed border-[hsl(var(--border-h))] text-[12px] font-medium text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3 h-3" /> {t('nutrition.quickLog.addFood')}
      </button>

      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="atlas-button atlas-button-secondary flex-1 h-9 rounded-lg text-[12px]">
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={createMut.isPending}
          className="atlas-button atlas-button-primary flex-1 h-9 rounded-lg text-[12px] gap-1"
        >
          {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          {t('nutrition.quickLog.saveMeal')}
        </button>
      </div>
    </div>
  );
}
