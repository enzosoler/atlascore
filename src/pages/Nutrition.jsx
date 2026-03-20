
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Clock3,
  Flame,
  Loader2,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import {
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
  Section,
  StatCard,
} from '@/components/shared/AppContainer';
import {
  DateStepper,
  DialogPanelHeader,
  EmptyState,
  FilterChip,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { MEAL_TYPES, getToday } from '@/lib/atlas-theme';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { searchFatSecretFoods } from '@/services/fatsecretService';
import { searchTaco } from '@/services/tacoService';

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field mt-2 h-11 px-4 py-2 text-base';
const SELECT_CLASS_NAME = `${INPUT_CLASS_NAME} appearance-none`;
const TEXTAREA_CLASS_NAME = 'atlas-field mt-2 min-h-[120px] resize-y px-4 py-3 text-base';

// Sensible fallback if the user has never configured targets.
// These values are intentionally conservative and only used until the profile loads.
const DEFAULT_PROFILE = {
  calories_target: 0,
  protein_target: 0,
  carbs_target: 0,
  fat_target: 0,
};

// MOCK_PRESCRIBED_DIET removed — targets now come from profiles.profile_data

const TODAY = getToday();
const YESTERDAY = shiftDate(TODAY, -1);
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

// MOCK_MEALS removed — all meal data comes from Supabase food_logs table

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getMealTypeLabel(mealType) {
  return MEAL_TYPES[mealType]?.label || mealType || 'Refeição';
}

function getMealSortOrder(mealType) {
  const index = MEAL_ORDER.indexOf(mealType);
  return index === -1 ? MEAL_ORDER.length : index;
}

function buildFoodList(foodText) {
  return foodText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

function getMealFormState(meal, selectedDate) {
  return {
    date: meal?.date || selectedDate,
    meal_type: meal?.meal_type || 'breakfast',
    title: meal?.title || '',
    foodsText: (meal?.foods || []).map((food) => food.name).join('\n'),
    total_calories:
      meal?.total_calories === 0 || meal?.total_calories ? String(meal.total_calories) : '',
    total_protein:
      meal?.total_protein === 0 || meal?.total_protein ? String(meal.total_protein) : '',
    total_carbs: meal?.total_carbs === 0 || meal?.total_carbs ? String(meal.total_carbs) : '',
    total_fat: meal?.total_fat === 0 || meal?.total_fat ? String(meal.total_fat) : '',
    notes: meal?.notes || '',
  };
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
  } catch (error) {
    console.error("Error reading recent foods from local storage:", error);
    return [];
  }
}

function addRecentFood(food) {
  try {
    const recentFoods = getRecentFoods();
    const updatedFoods = [food, ...recentFoods.filter((f) => f.id !== food.id)].slice(0, 5);
    localStorage.setItem(RECENT_FOODS_STORAGE_KEY, JSON.stringify(updatedFoods));
  } catch (error) {
    console.error("Error saving recent food to local storage:", error);
  }
}

function formatDateKey(value) {
  if (!value) return TODAY;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return TODAY;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildSnapshotDate(selectedDate) {
  if (!selectedDate || selectedDate === TODAY) {
    return new Date().toISOString();
  }

  const [year, month, day] = selectedDate.split('-').map(Number);
  const snapshotDate = new Date();

  snapshotDate.setFullYear(year, (month || 1) - 1, day || 1);
  snapshotDate.setHours(12, 0, 0, 0);

  return snapshotDate.toISOString();
}

function getMealTypeFromDate(value) {
  const parsed = value ? new Date(value) : new Date();
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
  const foodName = log?.food_name || 'Alimento registrado';

  return {
    id: log?.id ? `food-log-${log.id}` : createLocalId('food-log'),
    source: 'supabase',
    source_row_id: log?.id || null,
    date: formatDateKey(log?.date),
    meal_type: getMealTypeFromDate(log?.date),
    title: foodName,
    foods: [{ name: foodName }],
    total_calories: Number(log?.calories || 0),
    total_protein: Number(log?.protein || 0),
    total_carbs: Number(log?.carbs || 0),
    total_fat: Number(log?.fat || 0),
    notes:
      quantity > 1
        ? `Alimento salvo com sucesso.`
        : 'Alimento salvo com sucesso.',
  };
}

function MacroTrack({ label, consumed, target, unit, tone = 'calories', detail }) {
  const pct = getProgressPercent(consumed, target);
  const remaining = getRemainingValue(target, consumed);

  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', MEAL_MACRO_DOT[tone])} />
            <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
              {label}
            </p>
          </div>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {detail || (remaining > 0 ? `${remaining}${unit} remaining` : 'Goal reached')}
          </p>
        </div>
        <p className="shrink-0 text-[13px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
          {Math.round(consumed)} / {target}
          {unit}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
        <div
          className={cn('h-full rounded-full', TRACK_FILL_CLASS[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
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
        <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]\">{unit}</span>
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
      className="w-full rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-4 py-4 text-left transition-colors hover:bg-[hsl(var(--fill)/0.72)] disabled:cursor-wait disabled:opacity-70"
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
          <LoggedMetric label="kcal" value={formatUnit(food.calories, '')} />
          <LoggedMetric label="prot" value={formatUnit(food.protein, 'g')} tone="protein" />
          <LoggedMetric label="carbs" value={formatUnit(food.carbs, 'g')} tone="carbs" />
          <LoggedMetric label="fat" value={formatUnit(food.fat, 'g')} tone="fat" />
        </div>
      </div>
    </button>
  );
}

function MealCard({ meal, onEdit, onDelete, isProcessing = false }) {
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
            {meal.foods.map((food) => food.name).join(', ')}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-2 text-right">
          <LoggedMetric label="kcal" value={formatUnit(meal.total_calories, '')} />
          <LoggedMetric label="prot" value={formatUnit(meal.total_protein, 'g')} tone="protein" />
          <LoggedMetric label="carbs" value={formatUnit(meal.total_carbs, 'g')} tone="carbs" />
          <LoggedMetric label="fat" value={formatUnit(meal.total_fat, 'g')} tone="fat" />
        </div>
      </div>
      {meal.notes ? (
        <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
          <p className="text-sm text-[hsl(var(--fg-2))]\">{meal.notes}</p>
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
          Apagar
        </SecondaryButton>
        <PrimaryButton
          size="sm"
          onClick={() => onEdit(meal)}
          disabled={isProcessing}
          className="gap-2"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </PrimaryButton>
      </div>
    </Card>
  );
}

// Maps meal type to hour so getMealTypeFromDate can round-trip correctly when saving to food_logs
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

function MealForm({ onSave, onCancel, isSaving = false, meal, selectedDate }) {
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

  // Busca: TACO instantâneo → FatSecret fallback
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setIsSearching(false);
      return;
    }

    // 1. TACO (offline, imediato)
    const tacoHits = searchTaco(q, 8);
    if (tacoHits.length > 0) {
      setSearchResults(tacoHits);
      setIsSearching(false);
      setSearchError('');
      return;
    }

    // 2. FatSecret (industrializados não cobertos pelo TACO)
    setIsSearching(true);
    setSearchError('');
    const timer = setTimeout(async () => {
      try {
        let results = await searchFatSecretFoods(q, 'pt');
        if (results.length === 0) results = await searchFatSecretFoods(q, 'en');
        setSearchResults(results.slice(0, 8));
      } catch {
        setSearchError('Erro ao buscar. Tente outro nome.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addFood = (food) => {
    setFoods((prev) => [
      ...prev,
      {
        name: food.name,
        kcal: Math.round(food.calories || 0),
        protein: Math.round((food.protein || 0) * 10) / 10,
        carbs: Math.round((food.carbs || 0) * 10) / 10,
        fat: Math.round((food.fat || 0) * 10) / 10,
        amount: 100,
        unit: 'g',
        external_id: food.id || null,
        source_api: 'FatSecret',
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
      {/* Date + Meal type */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <label className={FIELD_LABEL_CLASS}>
          Data da refeição
          <input
            type="date"
            value={formatDateKey(date)}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className={FIELD_LABEL_CLASS}>
          Tipo de refeição
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

      {/* FatSecret food search */}
      <div className="mt-5">
        <p className={FIELD_LABEL_CLASS}>Buscar alimento</p>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: frango grelhado, arroz integral, banana..."
            className={cn(INPUT_CLASS_NAME, 'pl-11')}
          />
        </div>

        {isSearching ? (
          <div className="mt-3 flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
            <Loader2 className="h-4 w-4 animate-spin" /> Não achei no TACO, buscando na FatSecret...
          </div>
        ) : null}

        {!isSearching && searchError ? (
          <p className="mt-3 text-[13px] text-[hsl(var(--err))]">{searchError}</p>
        ) : null}

        {!isSearching && searchResults.length > 0 ? (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-[16px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]">
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
        ) : null}

        {!isSearching && !searchError && searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
          <p className="mt-3 text-[13px] text-[hsl(var(--fg-2))]">
            Nenhum resultado para &quot;{searchQuery}&quot;. Tente outro nome.
          </p>
        ) : null}
      </div>

      {/* Added foods list */}
      {foods.length > 0 ? (
        <div className="mt-5">
          <p className={FIELD_LABEL_CLASS}>
            Alimentos adicionados ({foods.length})
          </p>
          <div className="mt-2 space-y-2">
            {foods.map((food, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-4 py-2.5"
              >
                <div className="min-w-0">
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
            ))}
          </div>

          {/* Totals row */}
          <div className="mt-3 grid grid-cols-4 gap-3 rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-4 py-3">
            {[
              { label: 'kcal', value: Math.round(totals.kcal), tone: 'calories' },
              { label: 'Prot', value: `${Math.round(totals.protein)}g`, tone: 'protein' },
              { label: 'Carb', value: `${Math.round(totals.carbs)}g`, tone: 'carbs' },
              { label: 'Gord', value: `${Math.round(totals.fat)}g`, tone: 'fat' },
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
      ) : null}

      {foods.length === 0 && searchQuery.trim().length < 2 ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[hsl(var(--border-h))] py-8 text-center">
          <UtensilsCrossed className="h-8 w-8 text-[hsl(var(--fg-3))]" strokeWidth={1.5} />
          <p className="mt-3 text-[13px] font-medium text-[hsl(var(--fg-2))]">
            Busque e adicione alimentos acima
          </p>
          <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">
            Busca instantânea via TACO 🇧🇷 — industrializados via FatSecret
          </p>
        </div>
      ) : null}

      <ActionRow className="mt-6">
        <SecondaryButton type="button" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          disabled={isSaving || foods.length === 0}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {meal ? t('pages.nutrition.save_changes') : t('pages.nutrition.add_meal')}
        </PrimaryButton>
      </ActionRow>
    </form>
  );
}

export default function NutritionPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [notice, setNotice] = useState(null);
  const [meals, setMeals] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  // Unified food search (TACO → FatSecret fallback)
  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);
  const [foodSearchError, setFoodSearchError] = useState('');
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);
  const [showTargetsEditor, setShowTargetsEditor] = useState(false);
  const [targetDraft, setTargetDraft] = useState(null); // populated when editor opens
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load nutrition targets from profile_data (the same source Profile.jsx writes to)
  useEffect(() => {
    if (!user?.id) return undefined;

    let isActive = true;

    const fetchTargets = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_data')
          .eq('id', user.id)
          .single();

        if (error) {
          // Profile row may not exist yet — keep defaults
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
            protein_target:  Number(pd.protein_target)  || 0,
            carbs_target:    Number(pd.carbs_target)    || 0,
            fat_target:      Number(pd.fat_target)      || 0,
          });
          setProfileLoaded(true);
        }
      } catch (err) {
        // Non-fatal — page still works with DEFAULT_PROFILE
        console.warn('[Nutrition] Could not load targets from profile:', err);
        if (isActive) setProfileLoaded(true);
      }
    };

    fetchTargets();

    return () => { isActive = false; };
  }, [user?.id]);

  // Auto-open targets editor on first visit when no targets are configured
  useEffect(() => {
    if (profileLoaded && profile.calories_target === 0 && !showTargetsEditor) {
      setTargetDraft({ ...DEFAULT_PROFILE });
      setShowTargetsEditor(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded]);

  useEffect(() => {
    if (!user?.id) return undefined;

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
        console.error('Failed to load meals:', error);
        if (isActive) {
          setNotice({
            tone: 'error',
            message: t('pages.nutrition.load_error'),
          });
        }
      } finally {
        if (isActive) {
          setIsLoadingMeals(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

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
      // Read current profile_data first so we don't overwrite unrelated fields
      const { data: existing } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();

      const merged = {
        ...(existing?.profile_data || {}),
        calories_target: Number(targetDraft.calories_target) || 0,
        protein_target:  Number(targetDraft.protein_target)  || 0,
        carbs_target:    Number(targetDraft.carbs_target)    || 0,
        fat_target:      Number(targetDraft.fat_target)      || 0,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ profile_data: merged })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        calories_target: merged.calories_target,
        protein_target:  merged.protein_target,
        carbs_target:    merged.carbs_target,
        fat_target:      merged.fat_target,
      });
      setShowTargetsEditor(false);
      setTargetDraft(null);
      setNotice({ tone: 'success', message: 'Nutrition targets updated.' });
    } catch (err) {
      setNotice({ tone: 'error', message: 'Could not save targets. Try again.' });
    } finally {
      setIsSavingTargets(false);
    }
  };

  useEffect(() => {
    const q = foodQuery.trim();
    if (q.length < 2) {
      setFoodResults([]);
      setFoodSearchError('');
      setIsSearchingFoods(false);
      return;
    }

    // Passo 1: busca instantânea no TACO (offline, sem custo)
    const tacoResults = searchTaco(q, 10);
    if (tacoResults.length > 0) {
      setFoodResults(tacoResults);
      setIsSearchingFoods(false);
      setFoodSearchError('');
      return;
    }

    // Passo 2: fallback FatSecret para industrializados não cobertos pelo TACO
    setIsSearchingFoods(true);
    setFoodSearchError('');
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        let foods = await searchFatSecretFoods(q, 'pt');
        if (foods.length === 0) foods = await searchFatSecretFoods(q, 'en');
        if (active) setFoodResults(foods.slice(0, 8));
      } catch (error) {
        console.error('FatSecret search failed:', error);
        if (active) {
          setFoodResults([]);
          setFoodSearchError(t('pages.nutrition.not_found'));
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

    setSavingFoodId(food.id);
    try {
      const snapshot = {
        user_id: user.id,
        date: buildSnapshotDate(selectedDate),
        food_name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        quantity: 1,
        serving_unit: 'g',
        serving_size: 100,
        external_id: food.id,
        source_api: food.brand === 'TACO' ? 'TACO' : 'FatSecret',
      };

      const { data, error } = await supabase.from('food_logs').insert(snapshot).select().single();

      if (error) throw error;

      const savedMeal = mapFoodLogToMeal(data || snapshot);

      setMeals((current) => [savedMeal, ...current]);
      setFoodQuery('');
      setFoodResults([]);
      setFoodSearchError('');
      setNotice({
        tone: 'success',
        message: `${food.name} adicionado com sucesso.`,
      });
      addRecentFood(food);
    } catch (error) {
      console.error('Failed to save food log:', error);
      setNotice({
        tone: 'error',
        message: `Não foi possível salvar ${food.name}. Tente novamente.`,
      });
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
      setNotice({ tone: 'error', message: 'Adicione pelo menos um alimento antes de salvar.' });
      return;
    }

    // Build a timestamp that encodes the meal type so getMealTypeFromDate can round-trip it
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
      for (const food of foods) {
        const snapshot = {
          user_id: user.id,
          date: buildMealTimestamp(form.date, form.meal_type),
          food_name: food.name,
          calories: Math.round(food.kcal || 0),
          protein: Math.round((food.protein || 0) * 10) / 10,
          carbs: Math.round((food.carbs || 0) * 10) / 10,
          fat: Math.round((food.fat || 0) * 10) / 10,
          quantity: 1,
          serving_unit: food.unit || 'g',
          serving_size: food.amount || 100,
          external_id: food.external_id || null,
          source_api: food.source_api || 'FatSecret',
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
      console.error('[Nutrition] Failed to save meal to Supabase:', error);
      setNotice({ tone: 'error', message: `Erro ao salvar refeição. Verifique sua conexão e tente novamente.` });
      return;
    }

    setMeals((current) => [...current, ...savedMeals]);
    setIsFormOpen(false);
    setEditingMeal(null);
    setNotice({
      tone: 'success',
      message: `${foods.length} alimento(s) adicionado(s) em ${mealLabel}.`,
    });
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
        console.error('Failed to delete meal from Supabase:', error);
        setNotice({ tone: 'error', message: `Erro ao remover ${meal.title}. Tente novamente.` });
        return;
      }
    }
    setMeals((current) => current.filter((m) => m.id !== meal.id));
    setNotice({ tone: 'success', message: `${meal.title} foi removida.` });
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(formatDateKey(newDate));
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

  // Logging streak: count consecutive days ending today (or yesterday) with at least one log
  const loggingStreak = useMemo(() => {
    const loggedDates = new Set(meals.map((m) => m.date));
    let count = 0;
    // Start from today; if today has no logs, allow streak to count from yesterday
    const todayHasLogs = loggedDates.has(TODAY);
    let cursor = new Date(TODAY);
    if (!todayHasLogs) {
      // Peek at yesterday — if nothing there either, streak is 0
      cursor.setDate(cursor.getDate() - 1);
      const yd = cursor.toISOString().slice(0, 10);
      if (!loggedDates.has(yd)) return 0;
    }
    // Walk backwards while we find logged days
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!loggedDates.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [meals]);

  return (
    <SafePageBoundary>
      <AppContainer>
        <PageHeader
          title="Nutrition"
          subtitle={`Calorie and macro summary for ${selectedDate}`}
        />

        {notice ? (
          <StatusBanner
            tone={notice.tone}
            message={notice.message}
            onDismiss={() => setNotice(null)}
            className="mb-6"
          />
        ) : null}

        <Section
          title="Daily Goals"
          subtitle="Calories and macronutrients for quick reference."
          actions={loggingStreak >= 2 ? (
            <div className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--warn)/0.12)] border border-[hsl(var(--warn)/0.25)] px-3 py-1">
              <span className="text-[13px]">🔥</span>
              <span className="text-[12px] font-semibold text-[hsl(var(--warn))]">
                {loggingStreak}-day streak
              </span>
            </div>
          ) : null}
        >
          {/* Targets banner / inline editor */}
          {!showTargetsEditor && (
            <div className={`mb-4 flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 ${profile.calories_target === 0 ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.04)]' : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)]'}`}>
              <div className="flex items-center gap-2.5 text-[13px] text-[hsl(var(--fg-2))]">
                <Target className={`h-4 w-4 shrink-0 ${profile.calories_target === 0 ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--brand))]'}`} strokeWidth={1.9} />
                <span>
                  {profile.calories_target === 0
                    ? 'Set your daily calorie and macro targets to get started.'
                    : `${profile.calories_target} kcal · ${profile.protein_target}g protein · ${profile.carbs_target}g carbs · ${profile.fat_target}g fat`}
                </span>
              </div>
              <button
                onClick={handleOpenTargetsEditor}
                className="flex-shrink-0 text-[12px] font-semibold text-[hsl(var(--brand))] hover:underline underline-offset-2"
              >
                {profile.calories_target === 0 ? 'Set targets →' : 'Edit'}
              </button>
            </div>
          )}

          {/* Inline targets editor */}
          {showTargetsEditor && targetDraft && (
            <div className="mb-4 rounded-[22px] border border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.03)] px-5 py-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
                    {profile.calories_target === 0 ? 'Set up your nutrition targets' : 'Daily Nutrition Targets'}
                  </p>
                  {profile.calories_target === 0 && (
                    <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">Enter your daily goals to track progress against them.</p>
                  )}
                </div>
                <Target className="h-5 w-5 text-[hsl(var(--brand))]" strokeWidth={1.8} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'calories_target', label: 'Calories', unit: 'kcal' },
                  { key: 'protein_target',  label: 'Protein',  unit: 'g'    },
                  { key: 'carbs_target',    label: 'Carbs',    unit: 'g'    },
                  { key: 'fat_target',      label: 'Fat',      unit: 'g'    },
                ].map(({ key, label, unit }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-medium text-[hsl(var(--fg-2))] mb-1">{label} ({unit})</label>
                    <input
                      type="number"
                      min="0"
                      value={targetDraft[key] || ''}
                      onChange={(e) => setTargetDraft((d) => ({ ...d, [key]: e.target.value }))}
                      placeholder="0"
                      className="atlas-field h-9 px-3 text-[13px] w-full"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                {profile.calories_target > 0 && (
                  <button
                    onClick={() => { setShowTargetsEditor(false); setTargetDraft(null); }}
                    disabled={isSavingTargets}
                    className="flex-1 h-9 rounded-[14px] border border-[hsl(var(--border))] text-[13px] font-medium text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveTargets}
                  disabled={isSavingTargets}
                  className="flex-1 h-9 rounded-[14px] bg-[hsl(var(--brand))] text-[13px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSavingTargets ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MacroTrack
              label="Calories"
              consumed={dailyTotals.calories}
              target={profile.calories_target}
              unit="kcal"
              tone="calories"
            />
            <MacroTrack
              label="Protein"
              consumed={dailyTotals.protein}
              target={profile.protein_target}
              unit="g"
              tone="protein"
            />
            <MacroTrack
              label="Carbohydrates"
              consumed={dailyTotals.carbs}
              target={profile.carbs_target}
              unit="g"
              tone="carbs"
            />
            <MacroTrack
              label="Fats"
              consumed={dailyTotals.fat}
              target={profile.fat_target}
              unit="g"
              tone="fat"
            />
          </div>
        </Section>

        <Section
          title="Daily Log"
          subtitle="Meals and foods logged for the selected date."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DateStepper date={selectedDate} onChange={handleDateChange} />
            <PrimaryButton onClick={() => setIsFormOpen(true)} className="gap-2 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              Adicionar refeição
            </PrimaryButton>
          </div>

          {isLoadingMeals ? (
            <div className="mt-6 flex items-center justify-center gap-3 rounded-lg bg-[hsl(var(--fill))] p-8 text-sm text-[hsl(var(--fg-2))]\">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando refeições...
            </div>
          ) : null}

          {!isLoadingMeals && sortedMeals.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="Nenhuma refeição registrada"
              message="Adicione uma refeição para começar a monitorar sua nutrição."
              className="mt-6"
            />
          ) : null}

          {!isLoadingMeals && sortedMeals.length > 0 ? (
            <div className="mt-6 space-y-4">
              {sortedMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={() => {
                    setEditingMeal(meal);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteMeal}
                />
              ))}
            </div>
          ) : null}
        </Section>

        <Section
          title="Buscar alimento"
          subtitle="Resultados instantâneos da tabela TACO. Para industrializados, busca automaticamente na FatSecret."
        >
          <Card className="px-5 py-5">
            <label className={FIELD_LABEL_CLASS}>
              Buscar alimento
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
                <input
                  type="text"
                  value={foodQuery}
                  onChange={(event) => setFoodQuery(event.target.value)}
                  placeholder="Ex: frango grelhado, arroz, banana, whey..."
                  className={cn(INPUT_CLASS_NAME, 'pl-11')}
                />
              </div>
            </label>

            {isSearchingFoods ? (
              <div className="mt-5 flex items-center gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] text-[hsl(var(--fg-2))]">
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
                Não achei no TACO, buscando na FatSecret...
              </div>
            ) : null}

            {!isSearchingFoods && foodSearchError ? (
              <div className="mt-5 rounded-[22px] border border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.06)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--err))]">
                {foodSearchError}
              </div>
            ) : null}

            {!isSearchingFoods && !foodSearchError && foodResults.length > 0 ? (
              <div className="mt-5 space-y-3">
                {foodResults.map((food) => (
                  <FoodSearchResult
                    key={food.id}
                    food={food}
                    onSelect={handleSelectFood}
                    isSaving={savingFoodId === food.id}
                  />
                ))}
              </div>
            ) : null}

            {!isSearchingFoods && !foodSearchError && foodQuery.trim().length >= 2 && foodResults.length === 0 ? (
              <div className="mt-5 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                Nenhum resultado. Tente um nome diferente ou mais genérico.
              </div>
            ) : null}
          </Card>

          {!isSearchingFoods && !foodQuery && recentFoods.length > 0 ? (
            <Card className="px-5 py-5 mt-5">
              <p className={FIELD_LABEL_CLASS}>Alimentos recentes</p>
              <div className="mt-5 space-y-3">
                {recentFoods.map((food) => (
                  <FoodSearchResult
                    key={food.id}
                    food={food}
                    onSelect={handleSelectFood}
                    isSaving={savingFoodId === food.id}
                  />
                ))}
              </div>
            </Card>
          ) : null}
        </Section>
      </AppContainer>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogPanelHeader
            title={editingMeal ? t('pages.nutrition.edit_meal') : t('pages.nutrition.add_meal')}
            subtitle={editingMeal ? t('pages.nutrition.meal_subtitle') : t('pages.nutrition.register_new_meal')}
          />
          <div className="p-6 pt-0">
            <MealForm
              meal={editingMeal}
              selectedDate={selectedDate}
              onSave={handleSaveMeal}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMeal(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </SafePageBoundary>
  );
}
