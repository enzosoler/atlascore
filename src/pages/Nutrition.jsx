
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
import { MEAL_TYPES, getToday } from '@/lib/atlas-theme';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';
import { searchFoods } from '@/services/foodApi';
import { searchFatSecretFoods } from '@/services/fatsecretService';

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field mt-2 h-11 px-4 py-2 text-base';
const SELECT_CLASS_NAME = `${INPUT_CLASS_NAME} appearance-none`;
const TEXTAREA_CLASS_NAME = 'atlas-field mt-2 min-h-[120px] resize-y px-4 py-3 text-base';

const DEFAULT_PROFILE = {
  calories_target: 2300,
  protein_target: 170,
  carbs_target: 230,
  fat_target: 75,
};

const MOCK_PRESCRIBED_DIET = {
  id: 'diet-blueprint',
  name: 'Cutting clean',
  description:
    'Distribuicao simples das refeicoes para manter proteina alta e calorias sob controle.',
  meals: [
    { name: 'Cafe da manha', time: '07:00' },
    { name: 'Almoco', time: '12:30' },
    { name: 'Pos-treino', time: '17:30' },
    { name: 'Jantar', time: '20:30' },
  ],
  target_calories: 2300,
  target_protein: 170,
  target_carbs: 230,
  target_fat: 75,
};

const TODAY = getToday();
const YESTERDAY = shiftDate(TODAY, -1);
const USDA_SEARCH_DEBOUNCE_MS = 300;
const FATSECRET_SEARCH_DEBOUNCE_MS = 300;
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

const MOCK_MEALS = [
  {
    id: 'meal-breakfast',
    date: TODAY,
    meal_type: 'breakfast',
    title: 'Cafe da manha',
    foods: [{ name: 'Iogurte grego' }, { name: 'Banana' }, { name: 'Aveia' }],
    total_calories: 420,
    total_protein: 32,
    total_carbs: 48,
    total_fat: 11,
    notes: 'Mantido leve para treinar no meio da manha.',
    source: 'mock',
  },
  {
    id: 'meal-lunch',
    date: TODAY,
    meal_type: 'lunch',
    title: 'Almoco',
    foods: [{ name: 'Arroz' }, { name: 'Frango' }, { name: 'Legumes' }],
    total_calories: 690,
    total_protein: 54,
    total_carbs: 68,
    total_fat: 18,
    notes: 'Refeição principal do dia.',
    source: 'mock',
  },
  {
    id: 'meal-post-workout',
    date: TODAY,
    meal_type: 'post_workout',
    title: 'Pos-treino',
    foods: [{ name: 'Whey' }, { name: 'Creme de arroz' }],
    total_calories: 310,
    total_protein: 31,
    total_carbs: 38,
    total_fat: 4,
    notes: 'Foco em digestao facil.',
    source: 'mock',
  },
  {
    id: 'meal-yesterday',
    date: YESTERDAY,
    meal_type: 'dinner',
    title: 'Jantar',
    foods: [{ name: 'Salmao' }, { name: 'Batata doce' }, { name: 'Salada' }],
    total_calories: 640,
    total_protein: 45,
    total_carbs: 44,
    total_fat: 24,
    notes: '',
    source: 'mock',
  },
];

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
            <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]\
              {label}
            </p>
          </div>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]\
            {detail || (remaining > 0 ? `${remaining}${unit} restantes` : 'Meta atingida')}
          </p>
        </div>
        <p className="shrink-0 text-[13px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]\
          {Math.round(consumed)} / {target}
          {unit}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--fill))]\
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]\
          {label}
        </p>
      </div>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]\
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
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]\
            {food.name}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]\
            {food.brand || 'USDA FoodData Central'}
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
            <p className="text-sm font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]\
              {meal.title}
            </p>
          </div>
          <p className="mt-2.5 text-sm text-[hsl(var(--fg-2))]\
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

function MealForm({ onSave, onCancel, isSaving = false, meal, selectedDate }) {
  const [form, setForm] = useState(getMealFormState(meal, selectedDate));

  const handleField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({ ...form });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
        <label className={FIELD_LABEL_CLASS}>
          Data da refeição
          <input
            type="date"
            value={formatDateKey(form.date)}
            onChange={(event) => handleField('date', event.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className={FIELD_LABEL_CLASS}>
          Tipo de refeição
          <select
            value={form.meal_type}
            onChange={(event) => handleField('meal_type', event.target.value)}
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
        <label className={FIELD_LABEL_CLASS}>
          Título da refeição
          <input
            type="text"
            value={form.title}
            onChange={(event) => handleField('title', event.target.value)}
            placeholder="Ex: Café da manhã, Pós-treino"
            className={INPUT_CLASS_NAME}
          />
        </label>
      </div>
      <div className="mt-5">
        <label className={FIELD_LABEL_CLASS}>
          Alimentos (um por linha)
          <textarea
            value={form.foodsText}
            onChange={(event) => handleField('foodsText', event.target.value)}
            placeholder="Ex:\n1 banana\n1 scoop de whey\n2 fatias de pão integral"
            className={TEXTAREA_CLASS_NAME}
          />
        </label>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 md:grid-cols-4">
        <label className={FIELD_LABEL_CLASS}>
          Calorias (kcal)
          <input
            type="number"
            value={form.total_calories}
            onChange={(event) => handleField('total_calories', event.target.value)}
            placeholder="0"
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className={FIELD_LABEL_CLASS}>
          Proteínas (g)
          <input
            type="number"
            value={form.total_protein}
            onChange={(event) => handleField('total_protein', event.target.value)}
            placeholder="0"
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className={FIELD_LABEL_CLASS}>
          Carboidratos (g)
          <input
            type="number"
            value={form.total_carbs}
            onChange={(event) => handleField('total_carbs', event.target.value)}
            placeholder="0"
            className={INPUT_CLASS_NAME}
          />
        </label>
        <label className={FIELD_LABEL_CLASS}>
          Gorduras (g)
          <input
            type="number"
            value={form.total_fat}
            onChange={(event) => handleField('total_fat', event.target.value)}
            placeholder="0"
            className={INPUT_CLASS_NAME}
          />
        </label>
      </div>
      <div className="mt-5">
        <label className={FIELD_LABEL_CLASS}>
          Notas
          <textarea
            value={form.notes}
            onChange={(event) => handleField('notes', event.target.value)}
            placeholder="Alguma observação sobre a refeição?"
            className={TEXTAREA_CLASS_NAME}
          />
        </label>
      </div>
      <ActionRow className="mt-6">
        <SecondaryButton type="button" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {meal ? 'Salvar' : 'Adicionar'}
        </PrimaryButton>
      </ActionRow>
    </form>
  );
}

export default function NutritionPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [notice, setNotice] = useState(null);
  const [meals, setMeals] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [query, setQuery] = useState(''); // For USDA search
  const [results, setResults] = useState([]); // For USDA search
  const [isSearchingFoods, setIsSearchingFoods] = useState(false); // For USDA search
  const [searchError, setSearchError] = useState(''); // For USDA search

  const [fatSecretQuery, setFatSecretQuery] = useState('');
  const [fatSecretResults, setFatSecretResults] = useState([]);
  const [isSearchingFatSecretFoods, setIsSearchingFatSecretFoods] = useState(false);
  const [fatSecretSearchError, setFatSecretSearchError] = useState('');
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);

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
            message: 'Não foi possível carregar seu histórico de refeições.',
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

  useEffect(() => {
    // USDA Search Logic
    const normalizedUSDAQuery = query.trim();
    if (normalizedUSDAQuery.length < 2) {
      setResults([]);
      setSearchError('');
      setIsSearchingFoods(false);
    } else {
      let isActiveUSDA = true;
      const timeoutUSDA = window.setTimeout(async () => {
        setIsSearchingFoods(true);
        setSearchError('');
        try {
          const foods = await searchFoods(normalizedUSDAQuery);
          if (isActiveUSDA) {
            setResults(foods);
          }
        } catch (error) {
          console.error('USDA food search failed:', error);
          if (isActiveUSDA) {
            setResults([]);
            setSearchError(error?.message || 'Não foi possivel buscar alimentos agora.');
          }
        } finally {
          if (isActiveUSDA) {
            setIsSearchingFoods(false);
          }
        }
      }, USDA_SEARCH_DEBOUNCE_MS);
      return () => {
        isActiveUSDA = false;
        window.clearTimeout(timeoutUSDA);
      };
    }

    // FatSecret Search Logic
    const normalizedFatSecretQuery = fatSecretQuery.trim();
    if (normalizedFatSecretQuery.length < 2) {
      setFatSecretResults([]);
      setFatSecretSearchError('');
      setIsSearchingFatSecretFoods(false);
    } else {
      let isActiveFatSecret = true;
      const timeoutFatSecret = window.setTimeout(async () => {
        setIsSearchingFatSecretFoods(true);
        setFatSecretSearchError('');
        try {
          let foods = await searchFatSecretFoods(normalizedFatSecretQuery, 'en');
          if (foods.length === 0) {
            foods = await searchFatSecretFoods(normalizedFatSecretQuery, 'pt');
          }
          if (isActiveFatSecret) {
            setFatSecretResults(foods);
          }
        } catch (error) {
          console.error('FatSecret food search failed:', error);
          if (isActiveFatSecret) {
            setFatSecretResults([]);
            setFatSecretSearchError(error?.message || 'Não foi possivel buscar alimentos agora.');
          }
        } finally {
          if (isActiveFatSecret) {
            setIsSearchingFatSecretFoods(false);
          }
        }
      }, FATSECRET_SEARCH_DEBOUNCE_DEBOUNCE_MS);
      return () => {
        isActiveFatSecret = false;
        window.clearTimeout(timeoutFatSecret);
      };
    }
  }, [query, fatSecretQuery]);

  const handleSelectFood = async (food) => {
    if (!user?.id) {
      setNotice({ tone: 'error', message: 'Você precisa estar logado para salvar um alimento.' });
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
        source_api: food.brand === 'USDA' ? 'USDA' : 'FatSecret',
      };

      const { data, error } = await supabase.from('food_logs').insert(snapshot).select().single();

      if (error) throw error;

      const savedMeal = mapFoodLogToMeal(data || snapshot);

      setMeals((current) => [savedMeal, ...current]);
      setQuery('');
      setResults([]);
      setSearchError('');
      setFatSecretQuery('');
      setFatSecretResults([]);
      setFatSecretSearchError('');
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
      setNotice({ tone: 'error', message: 'Você precisa estar logado para salvar uma refeição.' });
      return;
    }

    const isEditing = !!editingMeal?.id;
    const mealId = isEditing ? editingMeal.id : createLocalId('meal');

    const mealData = {
      id: mealId,
      source: 'supabase',
      source_row_id: isEditing ? editingMeal.source_row_id : null,
      date: formatDateKey(form.date),
      meal_type: form.meal_type,
      title: form.title || getMealTypeLabel(form.meal_type),
      foods: buildFoodList(form.foodsText),
      total_calories: toNumber(form.total_calories),
      total_protein: toNumber(form.total_protein),
      total_carbs: toNumber(form.total_carbs),
      total_fat: toNumber(form.total_fat),
      notes: form.notes,
    };

    // TODO: Implement Supabase upsert for meals

    setMeals((current) =>
      isEditing ? current.map((m) => (m.id === mealId ? mealData : m)) : [mealData, ...current]
    );
    setIsFormOpen(false);
    setEditingMeal(null);
    setNotice({
      tone: 'success',
      message: `${mealData.title} foi ${isEditing ? 'atualizada' : 'adicionada'} com sucesso.`,
    });
  };

  const handleDeleteMeal = (meal) => {
    // TODO: Implement Supabase delete for meals
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

  return (
    <SafePageBoundary>
      <AppContainer>
        <PageHeader
          title="Nutrição"
          subtitle={`Resumo de calorias e macros para ${selectedDate}`}
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
          title="Metas do dia"
          subtitle="Calorias e macronutrientes para referência rápida."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MacroTrack
              label="Calorias"
              consumed={dailyTotals.calories}
              target={profile.calories_target}
              unit="kcal"
              tone="calories"
            />
            <MacroTrack
              label="Proteínas"
              consumed={dailyTotals.protein}
              target={profile.protein_target}
              unit="g"
              tone="protein"
            />
            <MacroTrack
              label="Carboidratos"
              consumed={dailyTotals.carbs}
              target={profile.carbs_target}
              unit="g"
              tone="carbs"
            />
            <MacroTrack
              label="Gorduras"
              consumed={dailyTotals.fat}
              target={profile.fat_target}
              unit="g"
              tone="fat"
            />
          </div>
        </Section>

        <Section
          title="Registro do dia"
          subtitle="Refeições e alimentos registrados na data selecionada."
        >
          <div className="flex items-center justify-between">
            <DateStepper date={selectedDate} onChange={handleDateChange} />
            <PrimaryButton onClick={() => setIsFormOpen(true)} className="gap-2">
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
          subtitle="Digite pelo menos 2 letras. Ao selecionar um item, a tela salva nome e macros."
        >
          <Card className="px-5 py-5">
            <label className={FIELD_LABEL_CLASS}>
              Busca FatSecret (PT/EN)
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
                <input
                  type="text"
                  value={fatSecretQuery}
                  onChange={(event) => setFatSecretQuery(event.target.value)}
                  placeholder="Ex: peito de frango, arroz, banana"
                  className={cn(INPUT_CLASS_NAME, 'pl-11')}
                />
              </div>
            </label>
            {fatSecretQuery.trim().length > 0 && fatSecretQuery.trim().length < 2 ? (
              <p className="mt-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]\">
                Continue digitando para buscar alimentos na FatSecret.
              </p>
            ) : null}
            {isSearchingFatSecretFoods ? (
              <div className="mt-5 flex items-center gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] text-[hsl(var(--fg-2))]\">
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
                Buscando alimentos na FatSecret...
              </div>
            ) : null}
            {!isSearchingFatSecretFoods && fatSecretSearchError ? (
              <div className="mt-5 rounded-[22px] border border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.06)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--err))]\">
                {fatSecretSearchError}
              </div>
            ) : null}
            {!isSearchingFatSecretFoods && !fatSecretSearchError && fatSecretResults.length > 0 ? (
              <div className="mt-5 space-y-3">
                {fatSecretResults.map((food) => (
                  <FoodSearchResult
                    key={food.id}
                    food={food}
                    onSelect={handleSelectFood}
                    isSaving={savingFoodId === food.id}
                  />
                ))}
              </div>
            ) : null}
            {!isSearchingFatSecretFoods &&
            !fatSecretSearchError &&
            fatSecretQuery.trim().length >= 2 &&
            fatSecretResults.length === 0 ? (
              <div className="mt-5 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]\">
                Nenhum alimento encontrado para esta busca na FatSecret.
              </div>
            ) : null}
          </Card>

          {!isSearchingFoods &&
          !isSearchingFatSecretFoods &&
          !query &&
          !fatSecretQuery &&
          recentFoods.length > 0 ? (
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

          <Card className="px-5 py-5 mt-5">
            <label className={FIELD_LABEL_CLASS}>
              Busca USDA
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ex: chicken breast, rice, banana"
                  className={cn(INPUT_CLASS_NAME, 'pl-11')}
                />
              </div>
            </label>
            <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]\">
              Data ativa do registro:{' '}
              <span className="font-semibold text-[hsl(var(--fg))]\">{selectedDate}</span>
            </p>
            {query.trim().length > 0 && query.trim().length < 2 ? (
              <p className="mt-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]\">
                Continue digitando para buscar alimentos na USDA.
              </p>
            ) : null}
            {isSearchingFoods ? (
              <div className="mt-5 flex items-center gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] text-[hsl(var(--fg-2))]\">
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
                Buscando alimentos na USDA FoodData Central...
              </div>
            ) : null}
            {!isSearchingFoods && searchError ? (
              <div className="mt-5 rounded-[22px] border border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.06)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--err))]\">
                {searchError}
              </div>
            ) : null}
            {!isSearchingFoods && !searchError && results.length > 0 ? (
              <div className="mt-5 space-y-3">
                {results.map((food) => (
                  <FoodSearchResult
                    key={food.id}
                    food={food}
                    onSelect={handleSelectFood}
                    isSaving={savingFoodId === food.id}
                  />
                ))}
              </div>
            ) : null}
            {!isSearchingFoods && !searchError && query.trim().length >= 2 && results.length === 0 ? (
              <div className="mt-5 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]\">
                Nenhum alimento encontrado para esta busca.
              </div>
            ) : null}
          </Card>

          {!isSearchingFoods &&
          !isSearchingFatSecretFoods &&
          !query &&
          !fatSecretQuery &&
          recentFoods.length > 0 ? (
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
            title={editingMeal ? 'Editar refeição' : 'Adicionar refeição'}
            subtitle={editingMeal ? 'Ajuste os detalhes da sua refeição.' : 'Registre uma nova refeição.'}
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
