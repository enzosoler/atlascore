/**
 * QuickMealSheet — inline quick-log for meals from the Today screen.
 * Simple form: description + calories + protein → inserts into food_logs.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import MobileSheet from '@/components/shared/MobileSheet';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useT } from '@/lib/i18nContext';
import { DAILY_KEYS } from '@/hooks/useDailyStateV2';
import { AI_COACH_KEY } from '@/hooks/useAICoach';
import { getToday } from '@/lib/atlas-theme';

function getMealTypeFromHour() {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 12) return 'morning_snack';
  if (h < 14) return 'lunch';
  if (h < 17) return 'afternoon_snack';
  return 'dinner';
}

export default function QuickMealSheet({ open, onOpenChange }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const t = useT();
  const nameRef = useRef(null);

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameRef.current?.focus(), 350);
    } else {
      setName('');
      setCalories('');
      setProtein('');
    }
  }, [open]);

  const handleLog = async () => {
    const cal = parseFloat(calories);
    if (!name.trim()) {
      toast.error(t('today.quickMeal.errorName'));
      return;
    }
    if (!cal || isNaN(cal) || cal <= 0) {
      toast.error(t('today.quickMeal.errorCalories'));
      return;
    }
    if (!user?.id) return;

    setSaving(true);
    try {
      const today = getToday();
      const prot = parseFloat(protein) || 0;

      const { error } = await supabase.from('food_logs').insert({
        user_id: user.id,
        date: today,
        food_name: name.trim(),
        calories: Math.round(cal),
        protein: Math.round(prot * 10) / 10,
        carbs: 0,
        fat: 0,
        quantity: 1,
        serving_unit: 'serving',
        serving_size: 1,
        meal_type: getMealTypeFromHour(),
      });

      if (error) throw error;

      toast.success(t('today.quickMeal.success', { name: name.trim() }));
      queryClient.invalidateQueries({ queryKey: DAILY_KEYS.meals(user.id) });
      queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, user.id] });
      setName('');
      setCalories('');
      setProtein('');
      onOpenChange(false);
    } catch {
      toast.error(t('today.quickMeal.errorFailed'));
    } finally {
      setSaving(false);
    }
  };

  const canLog = name.trim() && calories && parseFloat(calories) > 0;

  return (
    <MobileSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('today.quickMeal.title')}
      description={t('today.quickMeal.description')}
    >
      <MobileSheet.Body>
        <div className="space-y-4">
          {/* Meal name */}
          <div>
            <label className="text-[12px] font-semibold text-[hsl(var(--fg-2))] mb-1.5 block">
              {t('today.quickMeal.nameLabel')}
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('today.quickMeal.namePlaceholder')}
              className="w-full h-11 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-3 text-[15px] font-semibold text-[hsl(var(--fg))] outline-none focus:border-[hsl(var(--brand)/0.5)]"
            />
          </div>

          {/* Calories + Protein row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[hsl(var(--fg-2))] mb-1.5 block">
                {t('today.quickMeal.caloriesLabel')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="5000"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-3 pr-12 text-[15px] font-semibold text-[hsl(var(--fg))] outline-none focus:border-[hsl(var(--brand)/0.5)]"
                  onKeyDown={(e) => { if (e.key === 'Enter' && canLog) handleLog(); }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--fg-3))]">kcal</span>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[hsl(var(--fg-2))] mb-1.5 block">
                {t('today.quickMeal.proteinLabel')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="500"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-3 pr-8 text-[15px] font-semibold text-[hsl(var(--fg))] outline-none focus:border-[hsl(var(--brand)/0.5)]"
                  onKeyDown={(e) => { if (e.key === 'Enter' && canLog) handleLog(); }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[hsl(var(--fg-3))]">g</span>
              </div>
            </div>
          </div>
        </div>
      </MobileSheet.Body>

      <MobileSheet.Footer>
        <button
          onClick={handleLog}
          disabled={!canLog || saving}
          className="atlas-button atlas-button-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" strokeWidth={2.5} />
          )}
          {t('today.quickMeal.logButton')}
        </button>
      </MobileSheet.Footer>
    </MobileSheet>
  );
}
