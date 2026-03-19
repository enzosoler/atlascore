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
            {detail || (remaining > 0 ? `${remaining}${unit} restantes` : 'Meta atingida')}
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
      className="w-full rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-4 py-4 text-left transition-colors hover:bg-[hsl(var(--fill)/0.72)] disabled:cursor-wait disabled:opacity-70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {food.name}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {food.brand || 'USDA FoodData Central'}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.86)] text-[hsl(var(--fg-2))]">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
          ) : (
            <Plus className="h-4 w-4" strokeWidth={1.9} />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <div className="rounded-[18px] bg-[hsl(var(--card)/0.92)] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
            kcal
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">
            {Math.round(food.calories || 0)}
          </p>
        </div>
        <div className="rounded-[18px] bg-[hsl(var(--card)/0.92)] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
            proteína
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">
            {Math.round(food.protein || 0)} g
          </p>
        </div>
        <div className="rounded-[18px] bg-[hsl(var(--card)/0.92)] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
            carbs
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">
            {Math.round(food.carbs || 0)} g
          </p>
        </div>
        <div className="rounded-[18px] bg-[hsl(var(--card)/0.92)] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
            gordura
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[hsl(var(--fg))]">
            {Math.round(food.fat || 0)} g
          </p>
        </div>
      </div>
    </button>
  );
}

function MealCard({ meal, onEdit, onDelete }) {
  return (
    <article className="atlas-card px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
              {getMealTypeLabel(meal?.meal_type)}
            </span>
            <span className="rounded-full border border-transparent bg-[hsl(var(--warn)/0.12)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(34_68%_32%)]">
              {meal?.foods?.length || 0} itens
            </span>
          </div>

          <div>
            <h3 className="text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {meal?.title || getMealTypeLabel(meal?.meal_type)}
            </h3>
            <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
              {meal?.foods?.length
                ? meal.foods.map((food) => food.name).join(' · ')
                : 'Sem alimentos adicionados'}
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.55)]">
            <div className="grid gap-px bg-[hsl(var(--border)/0.7)] sm:grid-cols-4">
              <LoggedMetric label="Calorias" value={meal?.total_calories || 0} unit="kcal" />
              <LoggedMetric
                label="Proteína"
                value={meal?.total_protein || 0}
                unit="g"
                tone="protein"
              />
              <LoggedMetric
                label="Carbos"
                value={meal?.total_carbs || 0}
                unit="g"
                tone="carbs"
              />
              <LoggedMetric label="Gordura" value={meal?.total_fat || 0} unit="g" tone="fat" />
            </div>
          </div>

          {meal?.notes ? (
            <div className="rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Contexto
              </p>
              <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">{meal.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-[188px]">
          <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.58)] px-4 py-4">
            <p className="atlas-metric-label">Energia</p>
            <p className="mt-3 text-[1.75rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
              {Math.round(meal?.total_calories || 0)}
              <span className="ml-1 text-[13px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
                kcal
              </span>
            </p>
            <p className="mt-2 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
              Registro isolado desta refeição.
            </p>
          </div>

          {onEdit || onDelete ? (
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="atlas-button atlas-button-secondary h-10 flex-1 lg:w-full"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.9} />
                  Editar
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="atlas-button h-10 flex-1 border border-[hsl(var(--err)/0.18)] bg-[hsl(var(--err)/0.06)] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.1)] lg:w-full"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                  Excluir
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MealForm({ meal, selectedDate, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => getMealFormState(meal, selectedDate));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const foods = buildFoodList(form.foodsText);

    onSubmit({
      id: meal?.id || createLocalId('meal'),
      date: form.date || selectedDate,
      meal_type: form.meal_type,
      title: form.title.trim() || getMealTypeLabel(form.meal_type),
      foods,
      total_calories: toNumber(form.total_calories),
      total_protein: toNumber(form.total_protein),
      total_carbs: toNumber(form.total_carbs),
      total_fat: toNumber(form.total_fat),
      notes: form.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 lg:px-7 lg:py-7">
      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--fill)/0.5)] px-5 py-5">
        <p className="atlas-overline">Dados da refeição</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className={FIELD_LABEL_CLASS}>
            Data
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className={FIELD_LABEL_CLASS}>
            Tipo de refeição
            <select
              value={form.meal_type}
              onChange={(event) => updateField('meal_type', event.target.value)}
              className={SELECT_CLASS_NAME}
            >
              {Object.entries(MEAL_TYPES).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={cn(FIELD_LABEL_CLASS, 'mt-4')}>
          Titulo
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Ex: Pos-treino rapido"
            className={INPUT_CLASS_NAME}
          />
        </label>

        <label className={cn(FIELD_LABEL_CLASS, 'mt-4')}>
          Alimentos
          <textarea
            value={form.foodsText}
            onChange={(event) => updateField('foodsText', event.target.value)}
            placeholder={'Um alimento por linha\nEx: Frango desfiado\nEx: Arroz branco'}
            className={TEXTAREA_CLASS_NAME}
          />
        </label>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <p className="atlas-overline">Resumo de macros</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className={FIELD_LABEL_CLASS}>
            Calorias
            <input
              type="number"
              min="0"
              value={form.total_calories}
              onChange={(event) => updateField('total_calories', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>
          <label className={FIELD_LABEL_CLASS}>
            Proteína
            <input
              type="number"
              min="0"
              value={form.total_protein}
              onChange={(event) => updateField('total_protein', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>
          <label className={FIELD_LABEL_CLASS}>
            Carbos
            <input
              type="number"
              min="0"
              value={form.total_carbs}
              onChange={(event) => updateField('total_carbs', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>
          <label className={FIELD_LABEL_CLASS}>
            Gordura
            <input
              type="number"
              min="0"
              value={form.total_fat}
              onChange={(event) => updateField('total_fat', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <label className={FIELD_LABEL_CLASS}>
          Observacoes
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Contexto util para lembrar o motivo dessa refeição."
            className={TEXTAREA_CLASS_NAME}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[hsl(var(--border)/0.85)] pt-6 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit">
          {meal ? 'Salvar refeição' : 'Adicionar refeição'}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Nutrition() {
  return (
    <SafePageBoundary
      title="Nutrição"
      subtitle="Busca USDA, snapshots no Supabase e comparação simples com as metas do dia."
      maxWidth="max-w-6xl"
      fallbackDescription="A rota de Nutrition continua acessivel mesmo se a interface principal falhar."
    >
      <NutritionContent />
    </SafePageBoundary>
  );
}

function NutritionContent() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [mealFilter, setMealFilter] = useState('all');

  // ── Active diet plan ──────────────────────────────────────────────────────
  const { data: activePlans = [] } = useQuery({
    queryKey: ['diet-plans-active'],
    queryFn: () => base44.entities.DietPlan.filter({ active: true }),
    staleTime: 5 * 60 * 1000,
  });
  const activeDietPlan = activePlans[0] || null;

  // Resolve macro targets: plan first, then DEFAULT_PROFILE fallback
  const nutritionProfile = useMemo(() => ({
    calories_target:
      activeDietPlan?.target_calories ??
      activeDietPlan?.daily_calories ??
      DEFAULT_PROFILE.calories_target,
    protein_target:
      activeDietPlan?.target_protein ??
      activeDietPlan?.daily_protein ??
      DEFAULT_PROFILE.protein_target,
    carbs_target:
      activeDietPlan?.target_carbs ??
      activeDietPlan?.daily_carbs ??
      DEFAULT_PROFILE.carbs_target,
    fat_target:
      activeDietPlan?.target_fat ??
      activeDietPlan?.daily_fat ??
      DEFAULT_PROFILE.fat_target,
  }), [activeDietPlan]);
  const [notice, setNotice] = useState(null);
  const [meals, setMeals] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [savingFoodId, setSavingFoodId] = useState(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadFoodLogs() {
      if (!user?.id) {
        setMeals([]);
        return;
      }

      setIsLoadingMeals(true);

      try {
        const { data, error } = await supabase
          .from('food_logs')
          .select('id, food_name, calories, protein, carbs, fat, quantity, date')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(200);

        if (error) throw error;
        if (!isActive) return;

        setMeals((data || []).map(mapFoodLogToMeal));
      } catch (error) {
        console.error('Nutrition food_logs load failed:', error);

        if (!isActive) return;

        setNotice({
          tone: 'warning',
          message:
            'Não foi possivel carregar os snapshots salvos no Supabase. O registro manual continua disponível.',
        });
      } finally {
        if (isActive) {
          setIsLoadingMeals(false);
        }
      }
    }

    loadFoodLogs();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setResults([]);
      setSearchError('');
      setIsSearchingFoods(false);
      return undefined;
    }

    let isActive = true;
    const timeout = window.setTimeout(async () => {
      setIsSearchingFoods(true);
      setSearchError('');

      try {
        const foods = await searchFoods(normalizedQuery);
        if (isActive) {
          setResults(foods);
        }
      } catch (error) {
        console.error('USDA food search failed:', error);

        if (isActive) {
          setResults([]);
          setSearchError(error?.message || 'Não foi possivel buscar alimentos agora.');
        }
      } finally {
        if (isActive) {
          setIsSearchingFoods(false);
        }
      }
    }, USDA_SEARCH_DEBOUNCE_MS);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const mealsForDate = useMemo(() => {
    return meals
      .filter((meal) => meal.date === selectedDate)
      .sort((left, right) => getMealSortOrder(left.meal_type) - getMealSortOrder(right.meal_type));
  }, [meals, selectedDate]);

  const filterOptions = useMemo(() => {
    const availableTypes = Array.from(new Set(mealsForDate.map((meal) => meal.meal_type)));
    return ['all', ...availableTypes];
  }, [mealsForDate]);

  const filteredMeals = useMemo(() => {
    if (mealFilter === 'all') return mealsForDate;
    return mealsForDate.filter((meal) => meal.meal_type === mealFilter);
  }, [mealFilter, mealsForDate]);

  const nutritionTotals = useMemo(() => {
    return mealsForDate.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.total_calories || 0),
        protein: totals.protein + (meal.total_protein || 0),
        carbs: totals.carbs + (meal.total_carbs || 0),
        fat: totals.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [mealsForDate]);

  const remainingCalories = getRemainingValue(
    nutritionProfile.calories_target,
    nutritionTotals.calories
  );
  const remainingProtein = getRemainingValue(
    nutritionProfile.protein_target,
    nutritionTotals.protein
  );
  const calorieProgress = getProgressPercent(
    nutritionTotals.calories,
    nutritionProfile.calories_target
  );
  const planMealCount = activeDietPlan?.meals?.length || MOCK_PRESCRIBED_DIET.meals.length;
  const mealCoverage = Math.round(
    getProgressPercent(mealsForDate.length, planMealCount)
  );

  const handleCreate = () => {
    setNotice(null);
    setEditingMeal(null);
    setIsFormOpen(true);
  };

  const handleEdit = (meal) => {
    setNotice(null);
    setEditingMeal(meal);
    setIsFormOpen(true);
  };

  const handleDelete = async (meal) => {
    const mealLabel = meal?.title || getMealTypeLabel(meal?.meal_type);
    const confirmed = window.confirm(`Excluir ${mealLabel}?`);

    if (!confirmed) return;

    try {
      if (meal?.source === 'supabase' && meal?.source_row_id && user?.id) {
        const { error } = await supabase
          .from('food_logs')
          .delete()
          .eq('id', meal.source_row_id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setMeals((current) => current.filter((item) => item.id !== meal.id));
      setNotice({
        tone: 'success',
        message:
          meal?.source === 'supabase'
            ? 'Snapshot removido do food_logs.'
            : 'Refeição removida do estado local.',
      });
    } catch (error) {
      console.error('Nutrition delete failed:', error);
      setNotice({
        tone: 'warning',
        message: 'Não foi possivel excluir este registro agora.',
      });
    }
  };

  const handleSaveMeal = (payload) => {
    if (!payload.foods.length && !payload.title.trim()) {
      setNotice({
        tone: 'warning',
        message: 'Adicione um titulo ou ao menos um alimento antes de salvar.',
      });
      return;
    }

    setMeals((current) => {
      const exists = current.some((item) => item.id === payload.id);

      if (exists) {
        return current.map((item) =>
          item.id === payload.id ? { ...payload, source: item.source || 'local' } : item
        );
      }

      return [{ ...payload, source: 'local' }, ...current];
    });

    setIsFormOpen(false);
    setEditingMeal(null);
    setNotice({
      tone: 'success',
      message:
        payload.id === editingMeal?.id ? 'Refeição local atualizada.' : 'Refeição local adicionada.',
    });
  };

  const handleSelectFood = async (food) => {
    if (!user?.id) {
      setNotice({
        tone: 'warning',
        message: 'Faça login para salvar alimentos.',
      });
      return;
    }

    const snapshot = {
      user_id: user.id,
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      quantity: 1,
      date: buildSnapshotDate(selectedDate),
    };

    setSavingFoodId(food.id);
    setNotice(null);

    try {
      const { data, error } = await supabase
        .from('food_logs')
        .insert(snapshot)
        .select('id, food_name, calories, protein, carbs, fat, quantity, date')
        .single();

      if (error) throw error;

      const savedMeal = mapFoodLogToMeal(data || snapshot);

      setMeals((current) => [savedMeal, ...current]);
      setQuery('');
      setResults([]);
      setSearchError('');
      setNotice({
        tone: 'success',
        message: `${food.name} adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Nutrition snapshot save failed:', error);
      setNotice({
        tone: 'warning',
        message: 'Não foi possivel salvar o snapshot deste alimento no Supabase.',
      });
    } finally {
      setSavingFoodId(null);
    }
  };

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Nutrição"
        title="Nutrição que acompanha o ritmo do dia."
        subtitle="Busque alimentos na USDA, salve snapshots no Supabase e mantenha a leitura do dia focada na próxima decisão alimentar."
        accentClassName="from-[hsl(var(--warn)/0.12)] via-[hsl(var(--warn)/0.04)]"
        actions={
          <ActionRow>
            <DateStepper
              date={selectedDate}
              onChange={(amount) => setSelectedDate(shiftDate(selectedDate, amount))}
            />
            <PrimaryButton
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              Adicionar refeição
            </PrimaryButton>
          </ActionRow>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Consumo"
            value={formatUnit(nutritionTotals.calories, ' kcal')}
            detail={`${remainingCalories} kcal restantes para a meta do dia.`}
          />
          <StatCard
            label="Proteína"
            value={formatUnit(nutritionTotals.protein, ' g')}
            detail={`${remainingProtein} g faltando para atingir a proteína alvo.`}
          />
          <StatCard
            label="Refeições"
            value={`${mealsForDate.length} registradas`}
            detail={`Cobertura de ${mealCoverage}% da estrutura prevista para hoje.`}
          />
        </div>
      </PageHeader>

      {/* Info banner removed — internal implementation detail, not user-facing */}

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}
      {isLoadingMeals ? (
        <StatusBanner tone="neutral">Carregando refeições salvas da sua conta...</StatusBanner>
      ) : null}

      <Section
        title="Buscar alimento"
        subtitle="Digite pelo menos 2 letras. Ao selecionar um item, a tela salva nome e macros."
      >
        <Card className="px-5 py-5">
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

          <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            Data ativa do registro:{' '}
            <span className="font-semibold text-[hsl(var(--fg))]">{selectedDate}</span>
          </p>

          {query.trim().length > 0 && query.trim().length < 2 ? (
            <p className="mt-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Continue digitando para buscar alimentos na USDA.
            </p>
          ) : null}

          {isSearchingFoods ? (
            <div className="mt-5 flex items-center gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] text-[hsl(var(--fg-2))]">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.9} />
              Buscando alimentos na USDA FoodData Central...
            </div>
          ) : null}

          {!isSearchingFoods && searchError ? (
            <div className="mt-5 rounded-[22px] border border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.06)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--err))]">
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
            <div className="mt-5 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Nenhum alimento encontrado para esta busca.
            </div>
          ) : null}
        </Card>
      </Section>

      <Section
        title="Consumo e metas"
        subtitle="Leitura nutricional clara para o dia selecionado, com foco no que falta fechar."
      >
        <Card className="px-5 py-5">
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] px-4 py-4">
            <p className="atlas-metric-label">Calorias registradas</p>
            <p className="mt-3 text-[2rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
              {Math.round(nutritionTotals.calories)}
              <span className="ml-1 text-[15px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
                / {nutritionProfile.calories_target} kcal
              </span>
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              {remainingCalories > 0
                ? `${remainingCalories} kcal ainda abertas dentro da meta do dia.`
                : 'Meta calórica atingida para o dia selecionado.'}
            </p>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--card))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--fg))]"
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <MacroTrack
              label="Proteína"
              consumed={nutritionTotals.protein}
              target={nutritionProfile.protein_target}
              unit="g"
              tone="protein"
            />
            <MacroTrack
              label="Carboidratos"
              consumed={nutritionTotals.carbs}
              target={nutritionProfile.carbs_target}
              unit="g"
              tone="carbs"
            />
            <MacroTrack
              label="Gordura"
              consumed={nutritionTotals.fat}
              target={nutritionProfile.fat_target}
              unit="g"
              tone="fat"
            />
          </div>
        </Card>
      </Section>

      <Section
        title="Refeições do dia"
        subtitle="Cards editáveis com leitura sequencial e foco em alimento, contexto e macros."
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            {filterOptions.map((option) => {
              const isActive = mealFilter === option;

              return (
                <FilterChip
                  key={option}
                  onClick={() => setMealFilter(option)}
                  active={isActive}
                >
                  {option === 'all' ? 'Todas' : getMealTypeLabel(option)}
                </FilterChip>
              );
            })}
          </div>
        }
      >
        {!mealsForDate.length ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Nenhuma refeição registrada"
            description="Use a busca USDA ou o botão acima para abrir o modal local de refeição e comecar o dia alimentar."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Adicionar refeição
              </PrimaryButton>
            }
          />
        ) : null}

        {mealsForDate.length > 0 && filteredMeals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhuma refeição neste filtro"
            description="Troque o filtro atual ou adicione um novo registro para este periodo."
          />
        ) : null}

        {filteredMeals.length > 0 ? (
          <div className="space-y-3">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={meal?.source === 'supabase' ? undefined : () => handleEdit(meal)}
                onDelete={() => handleDelete(meal)}
              />
            ))}
          </div>
        ) : null}
      </Section>

      <Section
        title="Plano e leitura"
        subtitle="O plano alimentar e a leitura curta do dia ficam abaixo da ação principal."
      >
        <div className="space-y-3">
          <Card className="px-5 py-5">
            {activeDietPlan ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="atlas-overline">Plano ativo</p>
                    <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                      {activeDietPlan.name}
                    </p>
                    {(activeDietPlan.description || activeDietPlan.objective) && (
                      <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                        {activeDietPlan.description || activeDietPlan.objective}
                      </p>
                    )}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.78)] text-[hsl(var(--fg-2))]">
                    <UtensilsCrossed className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                </div>

                {(activeDietPlan.meals || []).length > 0 && (
                  <div className="mt-5 space-y-3">
                    {activeDietPlan.meals.map((meal, index) => (
                      <div
                        key={`${meal.name}-${index}`}
                        className="flex items-start gap-3 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4"
                      >
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--fg-2))]">
                          <Clock3 className="h-4 w-4" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
                              Refeição {index + 1}
                            </p>
                            {meal.time && (
                              <span className="text-[12px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                                {meal.time}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                            {meal.name}
                          </p>
                          {(meal.calories || meal.protein) ? (
                            <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))]">
                              {meal.calories ? `${meal.calories} kcal` : ''}
                              {meal.protein ? ` · ${meal.protein}g prot` : ''}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.78)] text-[hsl(var(--fg-2))]">
                  <UtensilsCrossed className="h-4 w-4" strokeWidth={1.9} />
                </div>
                <div>
                  <p className="atlas-overline">Plano do dia</p>
                  <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                    Nenhum plano alimentar ativo. Crie um em{' '}
                    <span className="font-semibold text-[hsl(var(--fg))]">Minha Dieta</span>.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="px-5 py-5">
            <p className="atlas-metric-label">Snapshot</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                  Refeicoes registradas
                </p>
                <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                  {mealsForDate.length} hoje · {planMealCount} previstas no plano.
                </p>
              </div>
              <div>
                <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                  Proteína restante
                </p>
                <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                  {remainingProtein} g para fechar a meta configurada.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--warn))]">
                  <Flame className="h-4 w-4" strokeWidth={1.9} />
                </div>
                <div>
                  <p className="atlas-metric-label">Foco sugerido</p>
                  <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    Feche a refeição seguinte antes de revisar o resto.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                Quanto mais cedo o dia alimentar fica visível, mais fácil fica manter contexto,
                aderência e decisão limpa nas outras rotas.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingMeal(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[32rem]">
          <DialogPanelHeader
            eyebrow="Refeição"
            title={editingMeal ? 'Editar refeição' : 'Adicionar refeição'}
            description="Este modal é local. Para salvar no Supabase, use a busca USDA acima."
            accentClassName="from-[hsl(var(--warn)/0.1)]"
          />

          <MealForm
            key={editingMeal?.id || 'new-meal'}
            meal={editingMeal}
            selectedDate={selectedDate}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingMeal(null);
            }}
            onSubmit={handleSaveMeal}
          />
        </DialogContent>
      </Dialog>
    </AppContainer>
  );
}
