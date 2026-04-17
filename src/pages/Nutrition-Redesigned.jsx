import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Camera,
  UtensilsCrossed,
  Flame,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabaseClient';
import { getTodayNutrition } from '@/services/nutritionService';
import { cn } from '@/lib/utils';

function NutritionRedesigned() {
  const { user } = useAuth();
  const { t } = useT();
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  // Today's nutrition data
  const { data: nutritionData, isLoading } = useQuery({
    queryKey: ['nutrition-today', user?.id],
    queryFn: () => getTodayNutrition(user?.id),
    enabled: !!user?.id
  });

  const isLoading = isLoading;

  // Calculate macros and calories
  const nutrition = useMemo(() => {
    if (!nutritionData) return null;

    const { calories_consumed = 0, protein_consumed = 0, carbs_consumed = 0, fat_consumed = 0 } = nutritionData;
    const { calories_target = 2000, protein_target = 150, carbs_target = 250, fat_target = 65 } = nutritionData;
    
    return {
      caloriesConsumed,
      caloriesTarget,
      proteinConsumed,
      proteinTarget,
      carbsConsumed,
      carbsTarget,
      fatConsumed,
      fatTarget,
      proteinPercentage: protein_target > 0 ? Math.round((protein_consumed / protein_target) * 100) : 0,
      carbsPercentage: carbs_target > 0 ? Math.round((carbs_consumed / carbs_target) * 100) : 0,
      fatPercentage: fat_target > 0 ? Math.round((fat_consumed / fat_target) * 100) : 0
    };
  }, [nutritionData]);

  const meals = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'pre_workout', 'post_workout', 'dinner', 'evening_snack'];
  
  const mealLabels = {
    breakfast: t('nutrition.breakfast'),
    morning_snack: t('nutrition.morning_snack'),
    lunch: t('nutrition.lunch'),
    afternoon_snack: t('nutrition.afternoon_snack'),
    pre_workout: t('nutrition.pre_workout'),
    post_workout: t('nutrition.post_workout'),
    dinner: t('nutrition.dinner'),
    evening_snack: t('nutrition.evening_snack')
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[hsl(var(--card))]/90 backdrop-blur-md border-b border-[hsl(var(--border))/0.5] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[hsl(var(--fg))]">
            {t('nutrition.title')}
          </h1>
          <Link
            to={ROUTES.today}
            className="text-sm text-[hsl(var(--brand))] hover:text-[hsl(var(--brand)/0.8)]"
          >
            {t('common.back_to_today')}
          </Link>
        </div>
      </header>

      <main className="px-4 py-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--fg))/30 border-t-[hsl(var(--fg))]" />
          </div>
        ) : !nutrition ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className="text-xl font-semibold text-[hsl(var(--fg))] mb-2">
                {t('nutrition.no_data')}
              </h2>
              <p className="text-[hsl(var(--fg-3))] mb-4">
                {t('nutrition.start_tracking')}
              </p>
              <Link
                to={ROUTES.nutrition}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('nutrition.log_first_meal')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Calories and Macros Summary */}
            <div className="bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--fg))] mb-4">
                {t('nutrition.today_summary')}
              </h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* Calories */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--fg))] mb-1">
                    {nutrition.caloriesConsumed}
                  </div>
                  <div className="text-sm text-[hsl(var(--fg-3))]">
                    {t('nutrition.of')} {nutrition.caloriesTarget}
                  </div>
                  <div className="w-16 h-16 mx-auto mt-2">
                    <div className="relative w-full h-full bg-[hsl(var(--border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((nutrition.caloriesConsumed / nutrition.caloriesTarget) * 100, 100)}%`,
                          backgroundColor: 'hsl(var(--brand))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

                {/* Protein */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--brand))] mb-1">
                    {nutrition.proteinConsumed}g
                  </div>
                  <div className="text-sm text-[hsl(var(--fg-3))]">
                    {t('nutrition.of')} {nutrition.proteinTarget}g
                  </div>
                  <div className="w-16 h-16 mx-auto mt-2">
                    <div className="relative w-full h-full bg-[hsl(var(--border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((nutrition.proteinConsumed / nutrition.proteinTarget) * 100, 100)}%`,
                          backgroundColor: 'hsl(var(--brand))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

                {/* Carbs */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--ok))] mb-1">
                    {nutrition.carbsConsumed}g
                  </div>
                  <div className="text-sm text-[hsl(var(--fg-3))]">
                    {t('nutrition.of')} {nutrition.carbsTarget}g
                  </div>
                  <div className="w-16 h-16 mx-auto mt-2">
                    <div className="relative w-full h-full bg-[hsl(var(--border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((nutrition.carbsConsumed / nutrition.carbsTarget) * 100, 100)}%`,
                          backgroundColor: 'hsl(var(--ok))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

                {/* Fat */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-[hsl(var(--warn))] mb-1">
                    {nutrition.fatConsumed}g
                  </div>
                  <div className="text-sm text-[hsl(var(--fg-3))]">
                    {t('nutrition.of')} {nutrition.fatTarget}g
                  </div>
                  <div className="w-16 h-16 mx-auto mt-2">
                    <div className="relative w-full h-full bg-[hsl(var(--border))] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((nutrition.fatConsumed / nutrition.fatTarget) * 100, 100)}%`,
                          backgroundColor: 'hsl(var(--warn))'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[hsl(var(--fg))]">
                  {t('nutrition.meals')}
                </h2>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
                  onClick={() => {}}
                >
                  <Plus className="h-4 w-4" />
                  {t('nutrition.add_meal')}
                </button>
              </div>

              {/* Meal Tabs */}
              <div className="flex space-x-2 mb-4 border-b border-[hsl(var(--border))]">
                {meals.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setSelectedMeal(meal)}
                    className={cn(
                      "flex-1 pb-2 px-1 text-sm font-medium transition-colors relative",
                      selectedMeal === meal 
                        ? "text-[hsl(var(--fg))] border-b-2 border-[hsl(var(--brand))]"
                        : "text-[hsl(var(--fg-3))] border-b-2 border-transparent hover:text-[hsl(var(--fg))]"
                    )}
                  >
                    {mealLabels[meal]}
                  </button>
                ))}
              </div>

              {/* Selected Meal Content */}
              <div className="bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">
                    {mealLabels[selectedMeal]}
                  </h3>
                  <button
                    className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] transition-colors"
                    onClick={() => {}}
                  >
                    <Search className="h-4 w-4 text-[hsl(var(--fg-2))]" />
                  </button>
                </div>

                {/* Food Items */}
                <div className="space-y-2">
                  <div className="text-center py-8 text-[hsl(var(--fg-3))]">
                    <UtensilsCrossed className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{t('nutrition.no_foods_logged')}</p>
                  </div>
                </div>

                {/* Add Food Actions */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[hsl(var(--ok))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--ok)/0.9)] transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    {t('nutrition.scan_food')}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    {t('nutrition.search_food')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default NutritionRedesigned;
