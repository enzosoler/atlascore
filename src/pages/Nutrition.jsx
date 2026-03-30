import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Camera,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  UtensilsCrossed,
  Sunrise,
  Sun,
  Moon,
  Apple,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  ActionRow,
  AppContainer,
  Card,
  Section,
} from '@/components/shared/AppContainer';
import {
  DateStepper,
  DialogPanelHeader,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/app/ResponsiveModal';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { MEAL_TYPES, getToday } from '@/lib/atlas-theme';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { searchFoods, getFoodDetails } from '@/services/foodSearchService';
import { searchTaco } from '@/services/tacoService';
import AIFoodInput from '@/components/nutrition/AIFoodInput';
import FoodCameraScanner from '@/components/nutrition/FoodCameraScanner';
import NutritionHeroCard from '@/components/nutrition/NutritionHeroCard';
import NutritionQuickActions from '@/components/nutrition/NutritionQuickActions';
import MealTimeline from '@/components/nutrition/MealTimeline';
import MacroProgressBar from '@/components/nutrition/MacroProgressBar';
import AINutritionSuggestions from '@/components/nutrition/AINutritionSuggestions';
import { useAICoach } from '@/hooks/useAICoach';

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field mt-2 h-11 px-4 py-2 text-base';
const SELECT_CLASS_NAME = `${INPUT_CLASS_NAME} appearance-none`;

const DEFAULT_PROFILE = {
  calories_target: 0,
  protein_target: 0,
  carbs_target: 0,
  fat_target: 0,
};

const TODAY = getToday();
const FATSECRET_SEARCH_DEBOUNCE_MS = 400;
const RECENT_FOODS_STORAGE_KEY = 'atlas_recent_foods';

const MEAL_ORDER = [
  'breakfast',
  'morning_snack',
  'lunch',
  'afternoon_snack',
  'pre_workout',
  'post_workout',
  'dinner',
  'evening_snack',
];

const MEAL_BUCKETS = {
  breakfast: { icon: Sunrise, label: 'Breakfast', time: 'Morning' },
  morning_snack: { icon: Apple, label: 'Morning Snack', time: 'Late Morning' },
  lunch: { icon: Sun, label: 'Lunch', time: 'Midday' },
  afternoon_snack: { icon: Apple, label: 'Afternoon Snack', time: 'Afternoon' },
  pre_workout: { icon: Zap, label: 'Pre-Workout', time: 'Before Training' },
  post_workout: { icon: Zap, label: 'Post-Workout', time: 'After Training' },
  dinner: { icon: Moon, label: 'Dinner', time: 'Evening' },
  evening_snack: { icon: Apple, label: 'Evening Snack', time: 'Night' },
};

const QUICK_SUGGESTIONS = [
  { name: 'Chicken + rice', emoji: '🍗' },
  { name: 'Eggs + toast', emoji: '🍳' },
  { name: 'Protein shake', emoji: '🥤' },
  { name: 'Pasta + sauce', emoji: '🍝' },
  { name: 'Greek yogurt', emoji: '🥣' },
  { name: 'Salmon + veggies', emoji: '🐟' },
];

const MEAL_MACRO_DOT = {
  calories: 'bg-[hsl(var(--fg))]',
  protein: 'bg-[hsl(var(--brand))]',
  carbs: 'bg-[hsl(var(--brand-ai))]',
  fat: 'bg-[hsl(var(--warn))]',
};

const TRACK_FILL_CLASS = {
  calories: 'bg-[hsl(var(--fg))]',
  protein: 'bg-[hsl(var(--brand))]',
  carbs: 'bg-[hsl(var(--brand-ai))]',
  fat: 'bg-[hsl(var(--warn))]',
};

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getMealTypeLabel(mealType) {
  return MEAL_TYPES[mealType]?.label || mealType || 'Meal';
}

function getMealSortOrder(mealType) {
  const index = MEAL_ORDER.indexOf(mealType);
  return index === -1 ? MEAL_ORDER.length : index;
}

function toNumber(value) {
  return Number(value || 0);
}

function formatUnit(value, unit) {
  return `${Math.round(Number(value || 0))}${unit}`;
}

function getProgressPercent(current, target) {
  if (!target) return 0;
  return Math.min((current / target) * 100, 100);
}

function getRemainingValue(target, current) {
  return Math.max(0, Math.round(target - current));
}

function getRecentFoods() {
  try {
    const item = localStorage.getItem(RECENT_FOODS_STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function addRecentFood(food) {
  try {
    const recentFoods = getRecentFoods();
    const updatedFoods = [food, ...recentFoods.filter((f) => f.id !== food.id)].slice(0, 5);
    localStorage.setItem(RECENT_FOODS_STORAGE_KEY, JSON.stringify(updatedFoods));
  } catch {
    // ignore
  }
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeFoodKey(food) {
  const name = normalizeText(food.name);
  const brand = normalizeText(food.brand || '');
  return `${name}|${brand}`;
}

function mergeFoodResults(localFoods, externalFoods, limit = 12) {
  const seen = new Set();
  const merged = [];
  for (const food of [...localFoods, ...externalFoods]) {
    const key = normalizeFoodKey(food);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(food);
    if (merged.length >= limit) break;
  }
  return merged;
}

function formatDateKey(value) {
  if (!value) return TODAY;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return TODAY;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildSnapshotDate(selectedDate) {
  if (!selectedDate || selectedDate === TODAY) return new Date().toISOString();
  const [year, month, day] = selectedDate.split('-').map(Number);
  const snapshotDate = new Date();
  snapshotDate.setFullYear(year, (month || 1) - 1, day || 1);
  snapshotDate.setHours(12, 0, 0, 0);
  return snapshotDate.toISOString();
}

function getMealTypeFromDate(value) {
  // Date-only strings (YYYY-MM-DD) have no time component — JS parses them as UTC
  // midnight, which in local timezones (e.g. UTC-3) becomes 9pm → incorrectly maps
  // to 'dinner'. Fall back to breakfast for date-only strings.
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(String(value))) return 'breakfast';
  const parsed = new Date(value);
  const hour = Number.isNaN(parsed.getTime()) ? 8 : parsed.getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 12) return 'morning_snack';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'afternoon_snack';
  if (hour < 20) return 'post_workout';
  if (hour < 22) return 'dinner';
  return 'evening_snack';
}

function mapFoodLogToMeal(log) {
  const quantity = Number(log?.quantity || 1);
  const foodName = log?.food_name || 'Food logged';
  return {
    id: log?.id ? `food-log-${log.id}` : createLocalId('food-log'),
    source: 'supabase',
    source_row_id: log?.id || null,
    date: formatDateKey(log?.date),
    meal_type: log?.meal_type || getMealTypeFromDate(log?.date),
    title: foodName,
    foods: [{
      name: foodName,
      kcal: Number(log?.calories || 0),
      protein: Number(log?.protein || 0),
      carbs: Number(log?.carbs || 0),
      fat: Number(log?.fat || 0),
      amount: Number(log?.serving_size || 100),
      unit: log?.serving_unit || 'g',
      external_id: log?.external_id || null,
      source_api: log?.source_api || null,
    }],
    total_calories: Number(log?.calories || 0),
    total_protein: Number(log?.protein || 0),
    total_carbs: Number(log?.carbs || 0),
    total_fat: Number(log?.fat || 0),
    notes: 'Food saved.',
  };
}

const MEAL_TYPE_HOURS = {
  breakfast: 8,
  morning_snack: 10,
  lunch: 12,
  afternoon_snack: 15,
  pre_workout: 17,
  post_workout: 18,
  dinner: 20,
  evening_snack: 22,
};

// ─── Nutrition Stats Header ───────────────────────────────────────────────────

function NutritionStatsHeader({ dailyTotals, profile, sortedMeals, loggingStreak, t }) {
  const mealsToday = sortedMeals.length;
  const caloriesRemaining = Math.max(0, (profile.calories_target || 0) - dailyTotals.calories);
  const proteinRemaining = Math.max(0, (profile.protein_target || 0) - dailyTotals.protein);
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-[16px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('nutrition.stats.streak')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--brand))] mt-1">{loggingStreak}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('nutrition.stats.days')}</p>
      </div>
      <div className="rounded-[16px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('nutrition.stats.meals')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--fg))] mt-1">{mealsToday}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('nutrition.stats.logged')}</p>
      </div>
      <div className="rounded-[16px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('nutrition.stats.remaining')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--ok))] mt-1">{caloriesRemaining}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('nutrition.stats.kcal')}</p>
      </div>
    </div>
  );
}

// ─── Nutrition Complete Card ──────────────────────────────────────────────────

function NutritionCompleteCard({ dailyTotals, profile, t }) {
  const caloriesPct = profile.calories_target > 0 
    ? Math.min((dailyTotals.calories / profile.calories_target) * 100, 100)
    : 0;
  const proteinPct = profile.protein_target > 0 
    ? Math.min((dailyTotals.protein / profile.protein_target) * 100, 100)
    : 0;
  
  const isComplete = caloriesPct >= 100 && proteinPct >= 80;
  
  if (!isComplete) return null;
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--ok)/0.12)] via-[hsl(var(--ok)/0.06)] to-[hsl(var(--card))] border border-[hsl(var(--ok)/0.3)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--ok))] flex items-center justify-center shadow-lg shadow-[hsl(var(--ok)/0.3)]">
          <Target className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-title3 font-bold text-[hsl(var(--fg))]">{t('nutrition.complete.title')}</p>
          <p className="text-body text-[hsl(var(--fg-2))] mt-1">{t('nutrition.complete.subtitle')}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-caption1 text-[hsl(var(--fg-3))]">
              <TrendingUp className="w-3.5 h-3.5" />
              {Math.round(caloriesPct)}% {t('nutrition.complete.calories')}
            </div>
            <div className="flex items-center gap-1.5 text-caption1 text-[hsl(var(--fg-3))]">
              <Zap className="w-3.5 h-3.5" />
              {Math.round(proteinPct)}% {t('nutrition.complete.protein')}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[hsl(var(--ok)/0.2)]">
        <p className="text-caption1 text-[hsl(var(--fg-3))] text-center">{t('nutrition.complete.message')}</p>
      </div>
    </div>
  );
}

// ─── Next Meal Suggestion ─────────────────────────────────────────────────────

function NextMealSuggestion({ dailyTotals, profile, sortedMeals, onAddMeal, t }) {
  const hasTargets = profile.calories_target > 0;
  const hasMeals = sortedMeals.length > 0;
  
  if (!hasTargets) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-[hsl(var(--brand)/0.1)] to-[hsl(var(--brand-ai)/0.08)] border border-[hsl(var(--brand)/0.25)] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.15)] flex items-center justify-center">
            <Target className="w-5 h-5 text-[hsl(var(--brand))]" />
          </div>
          <div className="flex-1">
            <p className="text-subhead font-bold text-[hsl(var(--fg))]">{t('nutrition.suggestion.setTargets')}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))]">{t('nutrition.suggestion.setTargetsDesc')}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const caloriesRemaining = Math.max(0, profile.calories_target - dailyTotals.calories);
  const proteinRemaining = Math.max(0, profile.protein_target - dailyTotals.protein);
  
  let suggestion = null;
  let priority = 'medium';
  
  if (!hasMeals) {
    suggestion = {
      title: t('nutrition.suggestion.startDay'),
      subtitle: t('nutrition.suggestion.startDayDesc'),
      icon: Sunrise,
      action: t('nutrition.suggestion.logBreakfast'),
    };
    priority = 'high';
  } else if (caloriesRemaining > 500 && proteinRemaining > 40) {
    suggestion = {
      title: t('nutrition.suggestion.prioritizeProtein', { remaining: proteinRemaining }),
      subtitle: t('nutrition.suggestion.prioritizeProteinDesc'),
      icon: Zap,
      action: t('nutrition.suggestion.addProtein'),
    };
  } else if (caloriesRemaining < 200) {
    suggestion = {
      title: t('nutrition.suggestion.almostThere'),
      subtitle: t('nutrition.suggestion.almostThereDesc'),
      icon: TrendingUp,
      action: t('nutrition.suggestion.addSnack'),
    };
    priority = 'low';
  } else {
    suggestion = {
      title: t('nutrition.suggestion.keepGoing'),
      subtitle: t('nutrition.suggestion.keepGoingDesc', { remaining: caloriesRemaining }),
      icon: Apple,
      action: t('nutrition.suggestion.addMeal'),
    };
  }
  
  if (!suggestion) return null;
  
  const Icon = suggestion.icon;
  
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      priority === 'high' && "bg-[hsl(var(--err)/0.06)] border-[hsl(var(--err)/0.2)]",
      priority === 'medium' && "bg-[hsl(var(--warn)/0.06)] border-[hsl(var(--warn)/0.2)]",
      priority === 'low' && "bg-[hsl(var(--success)/0.06)] border-[hsl(var(--success)/0.2)]",
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            priority === 'high' && "bg-[hsl(var(--err)/0.15)] text-[hsl(var(--err))]",
            priority === 'medium' && "bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]",
            priority === 'low' && "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-subhead font-bold text-[hsl(var(--fg))]">{suggestion.title}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))]">{suggestion.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onAddMeal}
          className={cn(
            "rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors",
            priority === 'high' && "bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err)/0.9)]",
            priority === 'medium' && "bg-[hsl(var(--warn))] text-white hover:bg-[hsl(var(--warn)/0.9)]",
            priority === 'low' && "bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success)/0.9)]",
          )}
        >
          {suggestion.action}
        </button>
      </div>
    </div>
  );
}

// ─── Empty State Upgrade ──────────────────────────────────────────────────────

function NutritionEmptyState({ onAddMeal, onQuickAdd, hasTargets, t }) {
  const quickMeals = [
    { type: 'breakfast', icon: Sunrise, label: t('nutrition.empty.breakfast'), color: 'text-[hsl(var(--brand))]' },
    { type: 'lunch', icon: Sun, label: t('nutrition.empty.lunch'), color: 'text-[hsl(var(--brand-ai))]' },
    { type: 'dinner', icon: Moon, label: t('nutrition.empty.dinner'), color: 'text-[hsl(var(--warn))]' },
  ];
  
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[hsl(var(--fill)/0.5)] to-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto mb-4">
        <UtensilsCrossed className="w-8 h-8 text-[hsl(var(--brand))]" strokeWidth={1.5} />
      </div>
      <p className="text-title3 font-bold text-[hsl(var(--fg))] mb-2">{t('nutrition.empty.title')}</p>
      <p className="text-body text-[hsl(var(--fg-2))] mb-5 max-w-[280px] mx-auto">{t('nutrition.empty.desc')}</p>
      
      {!hasTargets && (
        <p className="text-caption1 text-[hsl(var(--brand))] mb-4">{t('nutrition.empty.setTargetsFirst')}</p>
      )}
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickMeals.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            onClick={() => onQuickAdd(type)}
            className="flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] p-3 transition-all hover:bg-[hsl(var(--fill)/0.6)] hover:border-[hsl(var(--brand)/0.3)]"
          >
            <Icon className={cn("w-5 h-5", color)} strokeWidth={1.8} />
            <span className="text-[11px] font-medium text-[hsl(var(--fg))]">{label}</span>
          </button>
        ))}
      </div>
      
      <button
        onClick={onAddMeal}
        className="w-full rounded-xl bg-[hsl(var(--brand))] text-white py-3 text-[14px] font-semibold hover:bg-[hsl(var(--brand)/0.9)] transition-colors shadow-[0_4px_14px_hsl(var(--brand)/0.3)]"
      >
        <Plus className="w-4 h-4 inline mr-2" />
        {t('nutrition.empty.cta')}
      </button>
    </div>
  );
}

// ============ EXISTING COMPONENTS ============

function StatusHeader({ dailyTotals, profile, sortedMeals, onAddMeal, t }) {
  const hasTargets = profile.calories_target > 0;
  const hasMeals = sortedMeals.length > 0;
  const caloriesPct = hasTargets ? getProgressPercent(dailyTotals.calories, profile.calories_target) : 0;
  const proteinPct = hasTargets ? getProgressPercent(dailyTotals.protein, profile.protein_target) : 0;

  let status = 'empty';
  if (hasMeals) {
    if (caloriesPct >= 100 && proteinPct >= 80) status = 'complete';
    else if (caloriesPct >= 50) status = 'good';
    else status = 'partial';
  }

  const configs = {
    empty: {
      icon: Sunrise,
      title: t('pages.nutrition.status_empty_title'),
      subtitle: t('pages.nutrition.status_empty_subtitle'),
      cta: t('pages.nutrition.status_empty_cta'),
      tone: 'brand',
    },
    partial: {
      icon: Zap,
      title: t('pages.nutrition.status_partial_title', { pct: Math.round(caloriesPct) }),
      subtitle: t('pages.nutrition.status_partial_subtitle'),
      cta: t('pages.nutrition.status_partial_cta'),
      tone: 'warn',
    },
    good: {
      icon: TrendingUp,
      title: t('pages.nutrition.status_good_title'),
      subtitle: t('pages.nutrition.status_good_subtitle'),
      cta: t('pages.nutrition.status_good_cta'),
      tone: 'success',
    },
    complete: {
      icon: Target,
      title: t('pages.nutrition.status_complete_title'),
      subtitle: t('pages.nutrition.status_complete_subtitle'),
      cta: t('pages.nutrition.status_complete_cta'),
      tone: 'success',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  const toneClasses = {
    brand: 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.06)]',
    warn: 'border-[hsl(var(--warn)/0.3)] bg-[hsl(var(--warn)/0.06)]',
    success: 'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.06)]',
  };

  return (
    <div className={cn('rounded-[20px] border px-5 py-5', toneClasses[config.tone])}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          config.tone === 'brand' && 'bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]',
          config.tone === 'warn' && 'bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]',
          config.tone === 'success' && 'bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]',
        )}>
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {config.title}
          </h2>
          <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))] leading-5">
            {config.subtitle}
          </p>
          {!hasTargets && (
            <p className="mt-2 text-[12px] text-[hsl(var(--brand))]">
              {'⚠️ ' + t('pages.nutrition.set_targets_warning')}
            </p>
          )}
        </div>
        <PrimaryButton onClick={onAddMeal} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          {config.cta}
        </PrimaryButton>
      </div>
    </div>
  );
}

function NextAction({ dailyTotals, profile, sortedMeals, onAddMeal, t }) {
  const hasTargets = profile.calories_target > 0;
  const hasMeals = sortedMeals.length > 0;

  let action = null;

  if (!hasTargets) {
    action = {
      label: t('pages.nutrition.set_targets'),
      sublabel: t('pages.nutrition.set_targets_sub'),
      priority: 'high',
    };
  } else if (!hasMeals) {
    action = {
      label: t('pages.nutrition.add_first_meal'),
      sublabel: t('pages.nutrition.start_with_breakfast'),
      priority: 'high',
    };
  } else {
    const proteinRemaining = getRemainingValue(profile.protein_target, dailyTotals.protein);
    const caloriesRemaining = getRemainingValue(profile.calories_target, dailyTotals.calories);

    if (proteinRemaining > 30 && dailyTotals.protein / profile.protein_target < 0.5) {
      action = {
        label: t('pages.nutrition.prioritize_protein', { remaining: proteinRemaining }),
        sublabel: t('pages.nutrition.prioritize_protein_sub'),
        priority: 'medium',
      };
    } else if (caloriesRemaining > 500) {
      action = {
        label: t('pages.nutrition.kcal_remaining', { remaining: caloriesRemaining }),
        sublabel: t('pages.nutrition.plan_next_meal'),
        priority: 'medium',
      };
    } else if (caloriesRemaining < 200 && dailyTotals.calories >= profile.calories_target * 0.9) {
      action = {
        label: t('pages.nutrition.almost_at_goal'),
        sublabel: t('pages.nutrition.great_work_today'),
        priority: 'low',
      };
    } else {
      action = {
        label: t('pages.nutrition.add_next_meal'),
        sublabel: t('pages.nutrition.keep_logging_track'),
        priority: 'low',
      };
    }
  }

  if (!action) return null;

  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            action.priority === 'high' && 'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]',
            action.priority === 'medium' && 'bg-[hsl(var(--warn)/0.1)] text-[hsl(var(--warn))]',
            action.priority === 'low' && 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]',
          )}>
            <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
              {t('pages.nutrition.next_action_label')}
            </p>
            <p className="text-[15px] font-semibold text-[hsl(var(--fg))] mt-0.5">
              {action.label}
            </p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              {action.sublabel}
            </p>
          </div>
        </div>
        <SecondaryButton size="sm" onClick={onAddMeal} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          {t('pages.nutrition.add_button')}
        </SecondaryButton>
      </div>
    </div>
  );
}

function AIInsight({ meals, dailyTotals, profile }) {
  const { t } = useI18n();
  const hasMeals = meals.length > 0;
  const hasHistory = meals.length > 5;

  let insight = null;

  const breakfastMeals = meals.filter(m => m.meal_type === 'breakfast');
  const missedBreakfast = hasHistory && breakfastMeals.length < meals.length * 0.3;

  if (!hasMeals) {
    insight = {
      text: `💡 ${t('pages.nutrition.tip_start_with_protein')}`,
      tone: 'neutral',
    };
  } else if (missedBreakfast) {
    insight = {
      text: `⚠️ ${t('pages.nutrition.warn_missed_breakfast')}`,
      tone: 'warn',
    };
  } else if (dailyTotals.protein > 0 && profile.protein_target > 0) {
    const proteinPct = dailyTotals.protein / profile.protein_target;
    if (proteinPct < 0.5) {
      insight = {
        text: `🎯 ${t('pages.nutrition.protein_intake_low')}`,
        tone: 'action',
      };
    } else if (proteinPct >= 0.9) {
      insight = {
        text: `✅ ${t('pages.nutrition.protein_intake_great')}`,
        tone: 'success',
      };
    }
  }

  if (!insight) return null;

  return (
    <div className="flex items-start gap-2 rounded-[14px] bg-[hsl(var(--fill)/0.5)] px-3 py-2.5">
      <span className="text-[13px] leading-5 text-[hsl(var(--fg-2))]">{insight.text}</span>
    </div>
  );
}

function InterpretedMacroTrack({ label, consumed, target, unit, tone = 'calories', interpretation, locale = 'en' }) {
  const pct = getProgressPercent(consumed, target);
  const remaining = getRemainingValue(target, consumed);

  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', MEAL_MACRO_DOT[tone])} />
            <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
              {label}
            </p>
          </div>
          {interpretation && (
            <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--brand))]">
              {interpretation}
            </p>
          )}
          <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            {remaining > 0
              ? `${remaining}${unit} remaining`
              : consumed > target
                ? `${Math.round(consumed - target)}${unit} over`
                : 'Goal reached'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {Math.round(consumed)}
            <span className="text-[13px] font-medium text-[hsl(var(--fg-2))]">/{target}{unit}</span>
          </p>
          <p className="text-[11px] font-medium text-[hsl(var(--fg-3))]">
            {Math.round(pct)}% complete
          </p>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
        <div
          className={cn('h-full rounded-full transition-all duration-500', TRACK_FILL_CLASS[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickAddButtons({ onQuickAdd }) {
  const { t } = useI18n();
  const buttons = [
    { type: 'breakfast', icon: Sunrise, label: t('pages.nutrition.quick_breakfast') },
    { type: 'lunch', icon: Sun, label: t('pages.nutrition.quick_lunch') },
    { type: 'dinner', icon: Moon, label: t('pages.nutrition.quick_dinner') },
  ];

  return (
    <div className="flex gap-2">
      {buttons.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onQuickAdd(type)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-3 py-3 text-[13px] font-medium text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--fill)/0.6)] hover:border-[hsl(var(--brand)/0.3)]"
        >
          <Icon className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
          {label}
        </button>
      ))}
    </div>
  );
}

function MealBucket({ bucketKey, meals, onEdit, onDelete, onAdd, isProcessing }) {
  const { t } = useI18n();
  const config = MEAL_BUCKETS[bucketKey];
  if (!config) return null;

  const bucketMeals = meals.filter(m => m.meal_type === bucketKey);
  const hasMeals = bucketMeals.length > 0;
  const Icon = config.icon;

  const bucketTotals = bucketMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.total_calories,
      protein: acc.protein + m.total_protein,
    }),
    { calories: 0, protein: 0 }
  );

  return (
    <div className={cn(
      'rounded-[18px] border overflow-hidden transition-all',
      hasMeals
        ? 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))]'
        : 'border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.3)]'
    )}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border)/0.5)]">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            hasMeals ? 'bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]' : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]'
          )}>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{config.label}</p>
            <p className="text-[11px] text-[hsl(var(--fg-3))]">{config.time}</p>
          </div>
        </div>
        {hasMeals ? (
          <div className="text-right">
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{bucketTotals.calories} kcal</p>
            <p className="text-[11px] text-[hsl(var(--fg-3))]">{bucketTotals.protein}g protein</p>
          </div>
        ) : (
          <button
            onClick={() => onAdd(bucketKey)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[hsl(var(--brand))] transition-colors hover:bg-[hsl(var(--brand)/0.1)]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('pages.nutrition.add_button')}
          </button>
        )}
      </div>

      {hasMeals && (
        <div className="p-3 space-y-2">
          {bucketMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between rounded-xl bg-[hsl(var(--fill)/0.4)] px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[hsl(var(--fg))] truncate">{meal.title}</p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">
                  {meal.total_calories} kcal · {meal.total_protein}g P
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onEdit(meal)}
                  disabled={isProcessing}
                  className="rounded-lg p-1.5 text-[hsl(var(--fg-3))] hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDelete(meal)}
                  disabled={isProcessing}
                  className="rounded-lg p-1.5 text-[hsl(var(--fg-3))] hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => onAdd(bucketKey)}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[hsl(var(--border)/0.5)] py-2 text-[12px] font-medium text-[hsl(var(--brand))] transition-colors hover:bg-[hsl(var(--brand)/0.08)]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('pages.nutrition.add_item')}
          </button>
        </div>
      )}
    </div>
  );
}

function LoggedMetric({ label, value, unit, tone = 'calories' }) {
  return (
    <div className="bg-[hsl(var(--card)/0.86)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', MEAL_MACRO_DOT[tone])} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{unit}</span>
      </p>
    </div>
  );
}

function FoodSearchResult({ food, onSelect, isSaving = false }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(food)}
      disabled={isSaving}
      className="w-full rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.46)] px-4 py-4 text-left transition-colors hover:bg-[hsl(var(--fill)/0.72)] disabled:cursor-wait disabled:opacity-70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {food.name}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {food.brand === 'TACO'
              ? '🇧🇷 TACO/UNICAMP'
              : food.brand || 'FatSecret'}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-2 text-right">
          <LoggedMetric label="kcal" value={formatUnit(food.calories, '')} unit="" />
          <LoggedMetric label="prot" value={formatUnit(food.protein, 'g')} unit="g" tone="protein" />
          <LoggedMetric label="carbs" value={formatUnit(food.carbs, 'g')} unit="g" tone="carbs" />
          <LoggedMetric label="fat" value={formatUnit(food.fat, 'g')} unit="g" tone="fat" />
        </div>
      </div>
    </button>
  );
}

function MealCard({ meal, onEdit, onDelete, isProcessing = false }) {
  const { t } = useI18n();
  return (
    <Card className="px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
            <p className="text-sm font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {meal.title}
            </p>
          </div>
          <p className="mt-2.5 text-sm text-[hsl(var(--fg-2))]">
            {(meal?.foods || []).map((food) => food.name).join(', ')}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-2 text-right">
          <LoggedMetric label="kcal" value={formatUnit(meal.total_calories, '')} unit="" />
          <LoggedMetric label="prot" value={formatUnit(meal.total_protein, 'g')} unit="g" tone="protein" />
          <LoggedMetric label="carbs" value={formatUnit(meal.total_carbs, 'g')} unit="g" tone="carbs" />
          <LoggedMetric label="fat" value={formatUnit(meal.total_fat, 'g')} unit="g" tone="fat" />
        </div>
      </div>
      {meal.notes ? (
        <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
          <p className="text-sm text-[hsl(var(--fg-2))]">{meal.notes}</p>
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-end gap-3 border-t border-[hsl(var(--border))] pt-4">
        <SecondaryButton
          size="sm"
          onClick={() => onDelete(meal)}
          disabled={isProcessing}
          className="gap-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t('common.delete')}
        </SecondaryButton>
        <PrimaryButton
          size="sm"
          onClick={() => onEdit(meal)}
          disabled={isProcessing}
          className="gap-2"
        >
          <Pencil className="h-3.5 w-3.5" />
          {t('common.edit')}
        </PrimaryButton>
      </div>
    </Card>
  );
}

function MealForm({ onSave, onCancel, isSaving = false, meal, selectedDate, recentFoods = [] }) {
  const { t } = useI18n();
  const [date, setDate] = useState(meal?.date || selectedDate || TODAY);
  const [mealType, setMealType] = useState(meal?.meal_type || 'breakfast');
  const [foods, setFoods] = useState(
    (meal?.foods || []).map((f) => ({
      name: f.name || '',
      kcal: f.kcal || 0,
      protein: f.protein || 0,
      carbs: f.carbs || 0,
      fat: f.fat || 0,
      amount: f.amount || 100,
      unit: f.unit || 'g',
      external_id: f.external_id || null,
      source_api: f.source_api || null,
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [inputMode, setInputMode] = useState('ai'); // 'ai', 'search', 'camera'

  const handleCameraFoodsDetected = (detectedFoods) => {
    const formatted = detectedFoods.map(f => {
      const grams = parseFloat(f.estimatedAmount) || 100;
      return {
        name: f.name,
        kcal: Math.round(f.calories || 0),
        protein: Math.round((f.protein || 0) * 10) / 10,
        carbs: Math.round((f.carbs || 0) * 10) / 10,
        fat: Math.round((f.fat || 0) * 10) / 10,
        amount: grams,
        _baseAmount: grams,
        _baseKcal: Math.round(f.calories || 0),
        _baseProtein: Math.round((f.protein || 0) * 10) / 10,
        _baseCarbs: Math.round((f.carbs || 0) * 10) / 10,
        _baseFat: Math.round((f.fat || 0) * 10) / 10,
        unit: 'g',
        external_id: null,
        source_api: 'AI-Vision',
      };
    });
    setFoods((prev) => [...prev, ...formatted]);
    setInputMode('ai');
  };

  const handleAIFoodsDetected = (detectedFoods) => {
    const formatted = detectedFoods.map(f => {
      const grams = parseFloat(f.serving_description) || 100;
      return {
        name: f.name,
        kcal: Math.round(f.calories || 0),
        protein: Math.round((f.protein || 0) * 10) / 10,
        carbs: Math.round((f.carbs || 0) * 10) / 10,
        fat: Math.round((f.fat || 0) * 10) / 10,
        amount: grams,
        _baseAmount: grams,
        _baseKcal: Math.round(f.calories || 0),
        _baseProtein: Math.round((f.protein || 0) * 10) / 10,
        _baseCarbs: Math.round((f.carbs || 0) * 10) / 10,
        _baseFat: Math.round((f.fat || 0) * 10) / 10,
        unit: 'g',
        external_id: null,
        source_api: 'AI',
      };
    });
    setFoods((prev) => [...prev, ...formatted]);
  };

  const updateFoodAmount = (idx, newAmount) => {
    setFoods((prev) => prev.map((f, i) => {
      if (i !== idx || !f._baseAmount) return f;
      const ratio = (newAmount || 0) / f._baseAmount;
      return {
        ...f,
        amount: newAmount,
        kcal: Math.round(f._baseKcal * ratio),
        protein: Math.round(f._baseProtein * ratio * 10) / 10,
        carbs: Math.round(f._baseCarbs * ratio * 10) / 10,
        fat: Math.round(f._baseFat * ratio * 10) / 10,
      };
    }));
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setIsSearching(false);
      return;
    }

    const tacoHits = searchTaco(q, 8);
    setSearchResults(tacoHits);

    setIsSearching(true);
    setSearchError('');

    const timer = setTimeout(async () => {
      try {
        const externalResult = await searchFoods(q, 'pt', 'BR');
        if (!externalResult.success) throw new Error(externalResult.error);
        const combined = mergeFoodResults(tacoHits, externalResult.results || [], 10);
        setSearchResults(combined);
      } catch {
        setSearchResults(tacoHits);
        setSearchError(tacoHits.length > 0 ? 'External search failed. Showing local results.' : 'No results found.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addFood = (food) => {
    const baseAmount = 100;
    const baseKcal = Math.round(food.calories || 0);
    const baseProtein = Math.round((food.protein || 0) * 10) / 10;
    const baseCarbs = Math.round((food.carbs || 0) * 10) / 10;
    const baseFat = Math.round((food.fat || 0) * 10) / 10;

    setFoods((prev) => [
      ...prev,
      {
        name: food.name,
        kcal: baseKcal,
        protein: baseProtein,
        carbs: baseCarbs,
        fat: baseFat,
        amount: baseAmount,
        unit: 'g',
        external_id: food.id || null,
        source_api: 'FatSecret',
        _baseAmount: baseAmount,
        _baseKcal: baseKcal,
        _baseProtein: baseProtein,
        _baseCarbs: baseCarbs,
        _baseFat: baseFat,
      },
    ]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFood = (idx) => {
    setFoods((prev) => prev.filter((_, i) => i !== idx));
  };

  const totals = useMemo(
    () =>
      foods.reduce(
        (acc, f) => ({
          kcal: acc.kcal + (f.kcal || 0),
          protein: acc.protein + (f.protein || 0),
          carbs: acc.carbs + (f.carbs || 0),
          fat: acc.fat + (f.fat || 0),
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [foods]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (foods.length === 0) return;
    onSave({
      date: formatDateKey(date),
      meal_type: mealType,
      foods,
      total_calories: Math.round(totals.kcal),
      total_protein: Math.round(totals.protein * 10) / 10,
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_fat: Math.round(totals.fat * 10) / 10,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <label className={FIELD_LABEL_CLASS}>
          Meal date
          <input
            type="date"
            value={formatDateKey(date)}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className={FIELD_LABEL_CLASS}>
          Meal type
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className={SELECT_CLASS_NAME}
          >
            {Object.entries(MEAL_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setInputMode('ai')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all',
              inputMode === 'ai'
                ? 'bg-[hsl(var(--brand))] text-white shadow-lg shadow-[hsl(var(--brand)/0.3)]'
                : 'bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
            )}
          >
            <Sparkles className="h-4 w-4" />
            {t('pages.nutrition.describeWithAI')}
          </button>
          <button
            type="button"
            onClick={() => setInputMode('search')}
            className={cn(
              'flex items-center justify-center rounded-xl p-2.5 transition-all',
              inputMode === 'search'
                ? 'bg-[hsl(var(--fg))] text-white'
                : 'bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)]'
            )}
            aria-label="Search foods"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="flex items-center justify-center rounded-xl p-2.5 bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--fill)/0.72)]"
            aria-label="Scan food photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        <FoodCameraScanner
          open={showCamera}
          onOpenChange={setShowCamera}
          onFoodsDetected={handleCameraFoodsDetected}
        />

        {inputMode === 'ai' && (
          <div className="space-y-3">
            <div className="rounded-[18px] border-2 border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.04)] p-4">
              <p className="text-[13px] font-medium text-[hsl(var(--fg))] mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" />
                {t('pages.nutrition.whatDidYouEat')}
              </p>
              <AIFoodInput 
                onFoodsDetected={handleAIFoodsDetected} 
                onFallbackToSearch={(searchTerm) => {
                  setInputMode('search');
                  setSearchQuery(searchTerm);
                }}
              />
            </div>

            <div>
              <p className="text-[12px] font-medium text-[hsl(var(--fg-3))] mb-2">{t('pages.nutrition.quickSuggestions')}:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-3 py-1.5 text-[12px] text-[hsl(var(--fg))] transition-all hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.05)]"
                  >
                    <span>{suggestion.emoji}</span>
                    {suggestion.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {inputMode === 'search' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pages.nutrition.searchPlaceholder')}
                className={cn(INPUT_CLASS_NAME, 'pl-11')}
              />
            </div>

            {isSearching && (
              <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
                <Loader2 className="h-4 w-4 animate-spin" /> {t('pages.nutrition.searchingDatabase')}
              </div>
            )}

            {!isSearching && searchError && (
              <p className="text-[13px] text-[hsl(var(--err))]">{searchError}</p>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => addFood(food)}
                    className="w-full border-b border-[hsl(var(--border)/0.5)] px-4 py-3 text-left text-[13px] transition-colors last:border-0 hover:bg-[hsl(var(--fill)/0.72)]"
                  >
                    <p className="font-semibold text-[hsl(var(--fg))]">{food.name}</p>
                    <p className="text-[12px] text-[hsl(var(--fg-2))]">
                      {Math.round(food.calories)} kcal · P {Math.round(food.protein)}g · C{' '}
                      {Math.round(food.carbs)}g · G {Math.round(food.fat)}g
                    </p>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim().length < 2 && recentFoods.length > 0 && (
              <div className="mt-4">
                <p className="text-[12px] font-medium text-[hsl(var(--fg-3))] mb-2">{t('pages.nutrition.recentFoods')}:</p>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.slice(0, 5).map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => addFood(food)}
                      className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-3 py-1.5 text-[12px] text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--fill)/0.6)]"
                    >
                      <Clock className="h-3 w-3 text-[hsl(var(--fg-3))]" />
                      {food.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {foods.length > 0 && (
        <div className="mt-5">
          <p className={FIELD_LABEL_CLASS}>
            Added foods ({foods.length})
          </p>
          <div className="mt-2 space-y-2">
            {foods.map((food, idx) => (
              <div
                key={idx}
                className="rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.46)] px-4 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[hsl(var(--fg))]">{food.name}</p>
                    <p className="text-[12px] text-[hsl(var(--fg-2))]">
                      {food.kcal} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFood(idx)}
                    className="ml-3 shrink-0 rounded-lg p-1.5 text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                {food._baseAmount && (
                  <div className="mt-2 flex items-center gap-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
                    <label className="text-[11px] text-[hsl(var(--fg-3))] shrink-0">Portion</label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={food.amount}
                      onChange={(e) => updateFoodAmount(idx, parseFloat(e.target.value) || 0)}
                      className="w-20 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2 py-1 text-[12px] text-[hsl(var(--fg))] text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand)/0.3)]"
                    />
                    <span className="text-[11px] text-[hsl(var(--fg-3))]">g</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
            {[
              { label: 'kcal', value: Math.round(totals.kcal), tone: 'calories' },
              { label: 'Prot', value: `${Math.round(totals.protein)}g`, tone: 'protein' },
              { label: 'Carb', value: `${Math.round(totals.carbs)}g`, tone: 'carbs' },
              { label: 'Fat', value: `${Math.round(totals.fat)}g`, tone: 'fat' },
            ].map(({ label, value, tone }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className={cn('h-2 w-2 rounded-full', MEAL_MACRO_DOT[tone])} />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
                    {label}
                  </p>
                </div>
                <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {foods.length === 0 && (
        <div className="mt-5 flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[hsl(var(--border-h))] py-8 text-center">
          <Sparkles className="h-8 w-8 text-[hsl(var(--brand))]" strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-medium text-[hsl(var(--fg-2))]">
            Describe your meal with AI for instant logging
          </p>
          <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">
            Try: &quot;Chicken, rice, avocado&quot; or &quot;2 eggs and toast&quot;
          </p>
        </div>
      )}

      <div className="sticky bottom-0 bg-[hsl(var(--bg))] pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] mt-6 -mx-6 px-6 border-t border-[hsl(var(--border)/0.5)]">
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="atlas-button atlas-button-ghost w-full justify-center text-[hsl(var(--fg-2))] sm:w-auto"
          >
            {t('nutrition.cancel')}
          </button>
          <PrimaryButton
            type="submit"
            disabled={isSaving || foods.length === 0}
            className="gap-2 w-full justify-center sm:w-auto sm:flex-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {meal ? t('pages.nutrition.save_changes') : t('pages.nutrition.add_meal')}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

// Main Page Component
export default function NutritionPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const ai = useAICoach({ userId: user?.id });
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [notice, setNotice] = useState(null);
  const [meals, setMeals] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState('');
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [pendingFood, setPendingFood] = useState(null);
  const [pendingFoodAmount, setPendingFoodAmount] = useState('100');
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);
  const [showTargetsEditor, setShowTargetsEditor] = useState(false);
  const [targetDraft, setTargetDraft] = useState(null);
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [quickAddType, setQuickAddType] = useState(null);

  useEffect(() => {
    if (!isFormOpen && !pendingFood) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.pointerEvents = '';
      document.body.removeAttribute('data-scroll-locked');
    }
  }, [isFormOpen, pendingFood]);

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;

    const fetchTargets = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_data')
          .eq('id', user.id)
          .single();

        if (error) {
          if (isActive) setProfileLoaded(true);
          return;
        }

        const pd = data?.profile_data;
        if (!pd || typeof pd !== 'object') {
          if (isActive) setProfileLoaded(true);
          return;
        }

        if (isActive) {
          setProfile({
            calories_target: Number(pd.calories_target) || 0,
            protein_target: Number(pd.protein_target) || 0,
            carbs_target: Number(pd.carbs_target) || 0,
            fat_target: Number(pd.fat_target) || 0,
          });
          setProfileLoaded(true);
        }
      } catch (err) {
        if (isActive) setProfileLoaded(true);
      }
    };

    fetchTargets();
    return () => { isActive = false; };
  }, [user?.id]);

  useEffect(() => {
    if (profileLoaded && profile.calories_target === 0 && !showTargetsEditor) {
      setTargetDraft({ ...DEFAULT_PROFILE });
      setShowTargetsEditor(true);
    }
  }, [profileLoaded]);

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;
    const fetchInitialData = async () => {
      setIsLoadingMeals(true);
      try {
        const { data, error } = await supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        if (isActive) {
          setMeals(data.map(mapFoodLogToMeal));
        }
      } catch (error) {
        if (isActive) {
          setNotice({
            tone: 'error',
            message: t('pages.nutrition.load_error'),
          });
        }
      } finally {
        if (isActive) setIsLoadingMeals(false);
      }
    };

    fetchInitialData();
    return () => { isActive = false; };
  }, [user?.id, t]);

  useEffect(() => {
    setRecentFoods(getRecentFoods());
  }, []);

  const handleOpenTargetsEditor = () => {
    setTargetDraft({ ...profile });
    setShowTargetsEditor(true);
  };

  const handleSaveTargets = async () => {
    if (!user?.id || !targetDraft) return;
    setIsSavingTargets(true);

    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();

      const merged = {
        ...(existing?.profile_data || {}),
        calories_target: Number(targetDraft.calories_target) || 0,
        protein_target: Number(targetDraft.protein_target) || 0,
        carbs_target: Number(targetDraft.carbs_target) || 0,
        fat_target: Number(targetDraft.fat_target) || 0,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ profile_data: merged })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        calories_target: merged.calories_target,
        protein_target: merged.protein_target,
        carbs_target: merged.carbs_target,
        fat_target: merged.fat_target,
      });
      setShowTargetsEditor(false);
      setTargetDraft(null);
      setNotice({ tone: 'success', message: 'Nutrition targets updated.' });
    } catch {
      setNotice({ tone: 'error', message: 'Could not save targets. Try again.' });
    } finally {
      setIsSavingTargets(false);
    }
  };

  const detectLanguage = (query) => {
    const ptChars = /[çãõâêîôûáéíóúàèìòùäëïöü]/i;
    return ptChars.test(query) ? 'pt' : 'en';
  };

  useEffect(() => {
    const q = foodQuery.trim();
    if (q.length < 2) {
      setFoodResults([]);
      setFoodSearchError('');
      setIsSearchingFoods(false);
      return;
    }

    const tacoResults = searchTaco(q, 10);
    setFoodResults(tacoResults);

    setIsSearchingFoods(true);
    setFoodSearchError('');

    const lang = detectLanguage(q);
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const searchResult = await searchFoods(q, lang, 'BR');
        if (!searchResult.success) throw new Error(searchResult.error);
        const externalFoods = searchResult.results || [];
        if (!active) return;
        const combinedResults = mergeFoodResults(tacoResults, externalFoods, 12);
        setFoodResults(combinedResults);
      } catch (error) {
        if (active) {
          setFoodResults(tacoResults);
          setFoodSearchError(`Food search error: ${error.message}`);
        }
      } finally {
        if (active) setIsSearchingFoods(false);
      }
    }, FATSECRET_SEARCH_DEBOUNCE_MS);

    return () => { active = false; window.clearTimeout(timer); };
  }, [foodQuery]);

  const handleSelectFood = async (food) => {
    if (!user?.id) {
      setNotice({ tone: 'error', message: t('pages.nutrition.need_login_food') });
      return;
    }

    if (food.source === 'TACO' || food.brand === 'TACO') {
      setPendingFood(food);
      setPendingFoodAmount('100');
      return;
    }

    setSavingFoodId(food.id);
    try {
      const detail = await getFoodDetails(food.sourceId || food.id);
      if (!detail.success) throw new Error(detail.error);
      const fullFood = detail.food;

      setPendingFood({
        ...food,
        servings: fullFood.servings || [],
        source: 'FatSecret',
      });
      setPendingFoodAmount('100');
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Could not load food details',
      });
    } finally {
      setSavingFoodId(null);
    }
  };

  const handleConfirmPortionAndSave = async () => {
    if (!pendingFood || !user?.id) return;

    const amount = parseFloat(pendingFoodAmount);
    if (isNaN(amount) || amount <= 0) return;

    const ratio = amount / 100;
    setSavingFoodId(pendingFood.id);
    try {
      const snapshot = {
        user_id: user.id,
        date: buildSnapshotDate(selectedDate),
        food_name: pendingFood.name,
        calories: Math.round((pendingFood.calories || 0) * ratio * 10) / 10,
        protein: Math.round((pendingFood.protein || 0) * ratio * 10) / 10,
        carbs: Math.round((pendingFood.carbs || 0) * ratio * 10) / 10,
        fat: Math.round((pendingFood.fat || 0) * ratio * 10) / 10,
        quantity: 1,
        serving_unit: 'g',
        serving_size: amount,
        external_id: pendingFood.sourceId || pendingFood.id,
        source_api: pendingFood.source || 'FatSecret',
      };

      const { data, error } = await supabase.from('food_logs').insert(snapshot).select().single();
      if (error) throw error;

      const savedMeal = mapFoodLogToMeal(data || snapshot);
      setMeals((current) => [savedMeal, ...current]);
      setFoodQuery('');
      setFoodResults([]);
      setFoodSearchError('');
      setNotice({ tone: 'success', message: `${pendingFood.name} added successfully.` });
      addRecentFood(pendingFood);
      setPendingFood(null);
    } catch (error) {
      setNotice({ tone: 'error', message: `Could not save ${pendingFood.name}. Try again.` });
    } finally {
      setSavingFoodId(null);
    }
  };

  const handleSaveMeal = async (form) => {
    if (!user?.id) {
      setNotice({ tone: 'error', message: t('pages.nutrition.need_login_meal') });
      return;
    }

    const foods = form.foods || [];
    if (foods.length === 0) {
      setNotice({ tone: 'error', message: 'Add at least one food before saving.' });
      return;
    }

    setIsSavingMeal(true);

    const buildMealTimestamp = (dateStr, mealTypeKey) => {
      const hour = MEAL_TYPE_HOURS[mealTypeKey] ?? 12;
      const [year, month, day] = (dateStr || TODAY).split('-').map(Number);
      const d = new Date();
      d.setFullYear(year, (month || 1) - 1, day || 1);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };

    const mealLabel = getMealTypeLabel(form.meal_type);
    const savedMeals = [];

    try {
      if (editingMeal?.source_row_id) {
        const { error: deleteError } = await supabase
          .from('food_logs')
          .delete()
          .eq('id', editingMeal.source_row_id)
          .eq('user_id', user.id);
        if (deleteError) throw deleteError;
      }

      for (const food of foods) {
        const snapshot = {
          user_id: user.id,
          date: form.date || TODAY,
          meal_type: form.meal_type || null,
          food_name: food.name,
          calories: Math.round(food.kcal || 0),
          protein: Math.round((food.protein || 0) * 10) / 10,
          carbs: Math.round((food.carbs || 0) * 10) / 10,
          fat: Math.round((food.fat || 0) * 10) / 10,
          quantity: 1,
          serving_unit: food.unit || 'g',
          serving_size: food.amount || 100,
          external_id: food.external_id || null,
          source_api: food.source_api || null,
        };

        const { data, error } = await supabase
          .from('food_logs')
          .insert(snapshot)
          .select()
          .single();

        if (error) throw error;
        if (data) savedMeals.push(mapFoodLogToMeal(data));
      }
    } catch (error) {
      console.error('Save meal error:', error);
      setIsSavingMeal(false);
      setNotice({ tone: 'error', message: 'Error saving meal. Check your connection.' });
      return;
    }

    setMeals((current) => {
      const withoutEditedMeal = editingMeal?.id
        ? current.filter((meal) => meal.id !== editingMeal.id)
        : current;
      return [...withoutEditedMeal, ...savedMeals];
    });
    setIsSavingMeal(false);
    setIsFormOpen(false);
    setEditingMeal(null);
    setNotice({
      tone: 'success',
      message: editingMeal?.id
        ? `${foods.length} food item(s) updated in ${mealLabel}.`
        : `${foods.length} food item(s) added to ${mealLabel}.`,
    });
    // Cascade: invalidate AI coach so briefing/priorities update with new nutrition data
    ai.invalidateCoach();
  };

  const handleDeleteMeal = async (meal) => {
    if (meal.source_row_id) {
      try {
        const { error } = await supabase
          .from('food_logs')
          .delete()
          .eq('id', meal.source_row_id)
          .eq('user_id', user.id);
        if (error) throw error;
      } catch (error) {
        setNotice({ tone: 'error', message: `Could not remove ${meal.title}.` });
        return;
      }
    }
    setMeals((current) => current.filter((m) => m.id !== meal.id));
    setNotice({ tone: 'success', message: `${meal.title} was removed.` });
  };

  const handleDateChange = (delta) => {
    setSelectedDate((current) => shiftDate(current, delta));
  };

  const handleQuickAdd = (mealType) => {
    setQuickAddType(mealType);
    setIsFormOpen(true);
  };

  const handleAddMeal = () => {
    setQuickAddType(null);
    setEditingMeal(null);
    setIsFormOpen(true);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setIsFormOpen(true);
  };

  const dailyTotals = useMemo(() => {
    const todaysMeals = meals.filter((meal) => meal.date === selectedDate);
    return {
      calories: todaysMeals.reduce((sum, meal) => sum + meal.total_calories, 0),
      protein: todaysMeals.reduce((sum, meal) => sum + meal.total_protein, 0),
      carbs: todaysMeals.reduce((sum, meal) => sum + meal.total_carbs, 0),
      fat: todaysMeals.reduce((sum, meal) => sum + meal.total_fat, 0),
    };
  }, [meals, selectedDate]);

  const sortedMeals = useMemo(() => {
    return meals
      .filter((meal) => meal.date === selectedDate)
      .sort((a, b) => getMealSortOrder(a.meal_type) - getMealSortOrder(b.meal_type));
  }, [meals, selectedDate]);

  const loggingStreak = useMemo(() => {
    const loggedDates = new Set(meals.map((m) => m.date));
    let count = 0;
    const todayHasLogs = loggedDates.has(TODAY);
    let cursor = new Date(TODAY);
    if (!todayHasLogs) {
      cursor.setDate(cursor.getDate() - 1);
      const yd = cursor.toISOString().slice(0, 10);
      if (!loggedDates.has(yd)) return 0;
    }
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!loggedDates.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [meals]);

  const getMacroInterpretation = (consumed, target, type) => {
    if (target === 0) return null;
    const pct = consumed / target;

    if (consumed === 0) {
      if (type === 'protein') return t('pages.nutrition.interp_prioritize_protein');
      return t('pages.nutrition.interp_not_eaten');
    }
    if (pct < 0.3) {
      if (type === 'protein') return t('pages.nutrition.interp_protein_very_low');
      return t('pages.nutrition.interp_below_expected');
    }
    if (pct >= 0.9) return t('pages.nutrition.interp_goal_almost');
    return null;
  };

  return (
    <SafePageBoundary
      title={t('pages.nutrition.title')}
      subtitle="Daily nutrition tracking and guidance"
      fallbackDescription="Nutrition loaded in safe mode."
    >
      <div className="min-h-full bg-[hsl(var(--bg))]">
        <div className="mx-auto max-w-lg px-4 pt-5 space-y-4">

        {/* Header + Date */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {t('pages.nutrition.title')}
          </h1>
          <DateStepper date={selectedDate} onChange={handleDateChange} />
        </div>

        {notice && <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>}

        {/* 1 — Stats Header */}
        <NutritionStatsHeader 
          dailyTotals={dailyTotals} 
          profile={profile} 
          sortedMeals={sortedMeals}
          loggingStreak={loggingStreak}
          t={t}
        />

        {/* 2 — Complete Celebration (if targets reached) */}
        <NutritionCompleteCard 
          dailyTotals={dailyTotals} 
          profile={profile}
          t={t}
        />

        {/* 3 — Next Meal Suggestion */}
        <NextMealSuggestion 
          dailyTotals={dailyTotals}
          profile={profile}
          sortedMeals={sortedMeals}
          onAddMeal={handleAddMeal}
          t={t}
        />

        {/* 4 — Meal Timeline or Empty State */}
        {isLoadingMeals ? (
          <div className="flex items-center justify-center gap-3 rounded-[18px] bg-[hsl(var(--fill)/0.4)] p-8 text-[13px] text-[hsl(var(--fg-2))]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading meals...
          </div>
        ) : sortedMeals.length > 0 ? (
          <MealTimeline
            meals={sortedMeals}
            onEdit={handleEditMeal}
            onDelete={handleDeleteMeal}
            onAddMeal={handleAddMeal}
          />
        ) : (
          <NutritionEmptyState
            onAddMeal={handleAddMeal}
            onQuickAdd={handleQuickAdd}
            hasTargets={profile.calories_target > 0}
            t={t}
          />
        )}

        {/* 5 — Macro Progress (if has meals) */}
        {sortedMeals.length > 0 && (
          <MacroProgressBar dailyTotals={dailyTotals} profile={profile} />
        )}

        {/* 6 — AI Suggestions */}
        <AINutritionSuggestions
          dailyTotals={dailyTotals}
          profile={profile}
          mealCount={sortedMeals.length}
        />

        </div>
      </div>

      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        dialogClassName="max-w-xl p-0 max-h-[90vh]"
        dialogProps={{ onOpenAutoFocus: (e) => e.preventDefault() }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
          <DialogPanelHeader
            eyebrow={editingMeal ? t('pages.nutrition.edit_meal') : t('pages.nutrition.add_meal')}
            title={editingMeal ? t('pages.nutrition.edit_meal') : t('pages.nutrition.add_meal')}
            description={editingMeal ? t('pages.nutrition.meal_subtitle') : 'Log what you ate — AI makes it instant'}
          />
          <div className="p-6 pt-0">
            <MealForm
              meal={editingMeal || (quickAddType ? { meal_type: quickAddType } : null)}
              selectedDate={selectedDate}
              onSave={handleSaveMeal}
              isSaving={isSavingMeal}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMeal(null);
                setQuickAddType(null);
              }}
              recentFoods={recentFoods}
            />
          </div>
        </div>
      </ResponsiveModal>

      <Dialog open={!!pendingFood} onOpenChange={(open) => { if (!open) setPendingFood(null); }}>
        <DialogContent>
          {pendingFood && (() => {
            const amount = parseFloat(pendingFoodAmount) || 0;
            const ratio = amount / 100;
            const scaled = {
              calories: Math.round((pendingFood.calories || 0) * ratio),
              protein: Math.round((pendingFood.protein || 0) * ratio * 10) / 10,
              carbs: Math.round((pendingFood.carbs || 0) * ratio * 10) / 10,
              fat: Math.round((pendingFood.fat || 0) * ratio * 10) / 10,
            };
            return (
              <>
                <DialogPanelHeader
                  eyebrow="Portion"
                  title={pendingFood.name}
                  description="Set the serving size to log."
                />
                <div className="px-6 pb-6 space-y-5">
                  <div>
                    <label className={FIELD_LABEL_CLASS}>
                      Amount (g)
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={pendingFoodAmount}
                        onChange={(e) => setPendingFoodAmount(e.target.value)}
                        autoFocus
                        className={cn(INPUT_CLASS_NAME, 'mt-2')}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmPortionAndSave(); }}
                      />
                    </label>
                  </div>

                  {amount > 0 && (
                    <div className="grid grid-cols-4 gap-3 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
                      {[
                        { label: 'kcal', value: scaled.calories, tone: 'calories' },
                        { label: 'Prot', value: `${scaled.protein}g`, tone: 'protein' },
                        { label: 'Carb', value: `${scaled.carbs}g`, tone: 'carbs' },
                        { label: 'Fat', value: `${scaled.fat}g`, tone: 'fat' },
                      ].map(({ label, value, tone }) => (
                        <div key={label} className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className={cn('h-2 w-2 rounded-full', MEAL_MACRO_DOT[tone])} />
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">{label}</p>
                          </div>
                          <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <ActionRow>
                    <SecondaryButton type="button" onClick={() => setPendingFood(null)}>
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      type="button"
                      onClick={handleConfirmPortionAndSave}
                      disabled={!amount || amount <= 0 || savingFoodId === pendingFood.id}
                      className="gap-2"
                    >
                      {savingFoodId === pendingFood.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add to log
                    </PrimaryButton>
                  </ActionRow>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </SafePageBoundary>
  );
}
