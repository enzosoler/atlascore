import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  Zap,
  Target,
  Activity,
  ArrowRight,
  RotateCcw,
  Home,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import AIWorkoutInput from '@/components/workouts/AIWorkoutInput';
import PlanBuilderWizard from '@/components/workouts/PlanBuilderWizard';
import QuickWorkoutModal from '@/components/workouts/QuickWorkoutModal';
import { ActionRow, AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, SecondaryButton } from '@/components/shared/StablePage';
import { useI18n } from '@/lib/i18nContext';
import { DAILY_QUERY_KEYS } from '@/hooks/useDailyState';
import {
  getActiveWorkoutPlans,
  createWorkoutPlan,
  deactivateAllWorkoutPlans,
} from '@/services/workoutPlanService';
import { getRecentWorkouts, saveCompletedWorkout } from '@/services/workoutService';
import {
  fetchRecentWorkoutHistory,
  computePersonalRecords,
} from '@/services/workoutHistoryService';

// ─── helpers ──────────────────────────────────────────────────────────────────

function planExToExecution(ex) {
  const setCount = typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 3;
  const setsArr = Array.from({ length: setCount }, (_, i) => ({
    set_number: i + 1,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.load ?? ex.target_weight ?? null,
  }));
  return {
    name: ex.name,
    primary_muscles: ex.muscle_group ? [ex.muscle_group] : [],
    technique: ex.technique || null,
    rest_seconds: ex.rest || ex.rest_seconds || 60,
    execution_notes: ex.notes || null,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.load ?? ex.target_weight ?? null,
    media_gif_url: ex.media_gif_url || null,
    sets: setsArr,
  };
}

function buildSessionFromPlan(plan, dayIndex) {
  const day = plan.days[dayIndex];
  return {
    name: day.label || day.name || `Dia ${dayIndex + 1}`,
    date: (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })(),
    plan_id: plan.id,
    plan_day_index: dayIndex,
    status: 'in_progress',
    exercises: (day.exercises || []).map(planExToExecution),
  };
}

function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatVolume(kg) {
  if (!kg) return '—';
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function formatRelativeDate(iso, locale = 'en-US') {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

// Get today's day index based on plan start date and frequency
function getTodayDayIndex(plan) {
  if (!plan?.start_date || !plan?.frequency) return 0;
  const start = new Date(plan.start_date);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const daysSinceStart = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // If negative (plan hasn't started), return 0
  if (daysSinceStart < 0) return 0;
  // Calculate which day in the rotation
  const dayIndex = daysSinceStart % plan.frequency;
  return dayIndex;
}

// Get session status based on recent workouts
function getSessionStatus(dayIndex, recentSessions, plan) {
  // Check if there's a completed session for this specific day recently
  const today = (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })();
  const lastSession = recentSessions[0];
  
  if (lastSession) {
    const lastSessionDate = lastSession.completed_at?.split('T')[0];
    const lastSessionDayIndex = lastSession.plan_day_index;
    
    // If completed today
    if (lastSessionDate === today && lastSessionDayIndex === dayIndex) {
      return 'completed';
    }
    // If started but not completed (would need more tracking)
    // For now, simplified logic:
    if (lastSession.completed_at) {
      const completedDate = new Date(lastSession.completed_at);
      const hoursSinceLastSession = (new Date().getTime() - completedDate.getTime()) / (1000 * 60 * 60);
      
      // If it's today's scheduled day and not completed
      const todayIndex = getTodayDayIndex(plan);
      if (dayIndex === todayIndex && lastSessionDayIndex !== dayIndex) {
        return 'not_started';
      }
    }
  }
  
  return 'not_started';
}

// ─── CreatePlanModal ──────────────────────────────────────────────────────────

// ── ExerciseRow — editable row inside DayEditor ───────────────────────────────

function ExerciseRow({ ex, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2 py-1.5 group">
      {/* Exercise name — read-only display; library selection handles setting it */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--fg))] truncate">{ex.name}</p>
        {ex.muscle_group && (
          <p className="text-[10px] text-[hsl(var(--fg-3))] capitalize truncate">{ex.muscle_group}</p>
        )}
      </div>
      {/* Sets */}
      <input
        type="number"
        min="1"
        max="20"
        value={ex.sets}
        onChange={(e) => onChange('sets', Number(e.target.value) || 3)}
        className="w-12 h-8 px-1.5 rounded-lg bg-[hsl(var(--fill))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--fg))] text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand)/0.5)]"
        title="Sets"
      />
      {/* Reps */}
      <input
        type="text"
        placeholder="8-12"
        value={ex.reps}
        onChange={(e) => onChange('reps', e.target.value)}
        className="w-16 h-8 px-1.5 rounded-lg bg-[hsl(var(--fill))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--fg))] text-center focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand)/0.5)]"
        title="Reps"
      />
      <button
        onClick={onRemove}
        className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-[hsl(var(--fg-3))] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── DayEditor — one training day with exercise library search ────────────────

function DayEditor({ day, dayIndex, onChange, onAddExerciseFromLibrary, onRemoveExercise, onUpdateExercise }) {
  const [expanded, setExpanded] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleSelect = (searchResult) => {
    // searchResult comes from ExerciseSearch.onSelect — unified shape
    const name = searchResult.canonical_name_en || searchResult.canonical_name_pt || searchResult.name || '';
    const muscle = (searchResult.primary_muscles || [])[0] || '';
    const sets = searchResult.default_set_range || 3;
    const reps = searchResult.default_rep_range || '8-12';
    const rest = searchResult.default_rest_seconds || 60;
    onAddExerciseFromLibrary(dayIndex, { name, muscle_group: muscle, sets, reps: String(reps), rest });
    setShowSearch(false);
  };

  const handleAIExercisesDetected = (exercises) => {
    // exercises comes from AIWorkoutInput.onExercisesDetected
    exercises.forEach((ex) => {
      onAddExerciseFromLibrary(dayIndex, {
        name: ex.name,
        muscle_group: ex.muscle_group || '',
        sets: ex.sets || 3,
        reps: String(ex.reps || '8-12'),
        rest: ex.rest_seconds || 60,
      });
    });
    setShowAI(false);
    toast.success(`${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} added via AI`);
  };

  return (
    <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.4)]">
      {/* Day header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={day.label}
            onChange={(e) => { e.stopPropagation(); onChange(dayIndex, 'label', e.target.value); }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-sm font-semibold text-[hsl(var(--fg))] focus:outline-none"
            placeholder={`Day ${dayIndex + 1}`}
          />
        </div>
        <span className="text-xs text-[hsl(var(--fg-3))] flex-shrink-0">{day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}</span>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-[hsl(var(--fg-3))] flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--fg-3))] flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-[hsl(var(--border)/0.7)]">
          {/* Exercise rows */}
          {day.exercises.length > 0 && (
            <div className="px-3 pt-2 pb-1">
              {/* Column headers */}
              <div className="flex items-center gap-2 mb-1 px-0">
                <span className="flex-1 text-[10px] text-[hsl(var(--fg-3))] uppercase tracking-wider">Exercise</span>
                <span className="w-12 text-[10px] text-[hsl(var(--fg-3))] text-center uppercase tracking-wider">Sets</span>
                <span className="w-16 text-[10px] text-[hsl(var(--fg-3))] text-center uppercase tracking-wider">Reps</span>
                <span className="w-8" />
              </div>
              {day.exercises.map((ex, exIdx) => (
                <ExerciseRow
                  key={exIdx}
                  ex={ex}
                  onChange={(field, val) => onUpdateExercise(dayIndex, exIdx, field, val)}
                  onRemove={() => onRemoveExercise(dayIndex, exIdx)}
                />
              ))}
            </div>
          )}

          {/* AI Workout Input panel */}
          {showAI ? (
            <div className="px-3 pb-3 pt-2 border-t border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[hsl(var(--fg-2))]">Describe exercises with AI</p>
                <button
                  onClick={() => setShowAI(false)}
                  className="text-xs text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] transition-colors"
                >
                  Cancel
                </button>
              </div>
              <AIWorkoutInput onExercisesDetected={handleAIExercisesDetected} />
            </div>
          ) : showSearch ? (
            <div className="px-3 pb-3 pt-2 border-t border-[hsl(var(--border)/0.5)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[hsl(var(--fg-2))]">Search library</p>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-xs text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] transition-colors"
                >
                  Cancel
                </button>
              </div>
              <ExerciseSearch onSelect={handleSelect} />
            </div>
          ) : (
            <div className="px-3 pb-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-[hsl(var(--border))] px-3 py-2.5 text-xs text-[hsl(var(--fg-3))] transition-colors hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.04)] hover:text-[hsl(var(--brand))]"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search library
                </button>
                <button
                  onClick={() => setShowAI(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-[hsl(var(--brand)/0.3)] px-3 py-2.5 text-xs text-[hsl(var(--brand))] transition-colors hover:border-[hsl(var(--brand)/0.6)] hover:bg-[hsl(var(--brand)/0.08)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Describe with AI
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreatePlanModal({ onClose, onCreated, userId }) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [frequency, setFrequency] = useState(3);
  const [days, setDays] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({ label: `Day ${i + 1}`, exercises: [] }))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDays((prev) => {
      const next = [...prev];
      while (next.length < frequency) next.push({ label: `Day ${next.length + 1}`, exercises: [] });
      while (next.length > frequency) next.pop();
      return next;
    });
  }, [frequency]);

  const totalExercises = days.reduce((sum, day) => sum + (day.exercises?.length || 0), 0);
  const validationErrors = [];

  if (!name.trim()) {
    validationErrors.push('Plan name is required.');
  }

  if (totalExercises === 0) {
    validationErrors.push('Add at least one exercise before saving.');
  }

  const isPlanValid = validationErrors.length === 0;

  const handleDayLabelChange = (dayIdx, _field, value) => {
    setDays((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, label: value } : d)));
  };

  const handleAddExerciseFromLibrary = (dayIdx, exercise) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, exercises: [...d.exercises, { name: exercise.name, muscle_group: exercise.muscle_group || '', sets: exercise.sets || 3, reps: exercise.reps || '8-12', rest: exercise.rest || 60 }] }
          : d
      )
    );
  };

  const handleRemoveExercise = (dayIdx, exIdx) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d
      )
    );
  };

  const handleUpdateExercise = (dayIdx, exIdx, field, value) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, exercises: d.exercises.map((e, j) => (j === exIdx ? { ...e, [field]: value } : e)) }
          : d
      )
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a plan name.');
      return;
    }

    if (totalExercises === 0) {
      toast.error('Add at least one exercise before saving the plan.');
      return;
    }

    setSaving(true);
    try {
      await deactivateAllWorkoutPlans(userId);
      await createWorkoutPlan(userId, {
        name: name.trim(),
        objective: objective.trim() || null,
        frequency,
        days: days.map((d) => ({
          label: d.label || '',
          exercises: d.exercises.filter((e) => e.name.trim()),
        })),
        active: true,
        created_by_type: 'user',
        start_date: (() => { const _d = new Date(); return `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`; })(),
      });
      onCreated();
    } catch (err) {
      toast.error(err.message || 'Failed to create plan.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[hsl(var(--border))] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] sm:max-h-[85vh] sm:max-w-lg sm:rounded-[24px]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[hsl(var(--border))] flex-shrink-0">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[hsl(var(--fg-3))] uppercase">New plan</p>
            <h2 className="text-lg font-bold text-[hsl(var(--fg))] mt-0.5">Create training plan</h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--warn)/0.08)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--warn))]">
                Plan validation
              </p>
              <div className="mt-2 space-y-1">
                {validationErrors.map((error) => (
                  <p key={error} className="text-sm text-[hsl(var(--fg))]">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider mb-2">
              Plan name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Push Pull Legs · 3×/week"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="atlas-field h-11 w-full rounded-[12px] border-0 px-4 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider mb-2">
              Objective <span className="text-[hsl(var(--fg-3))] font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Hypertrophy, strength, fat loss..."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="atlas-field h-11 w-full rounded-[12px] border-0 px-4 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider mb-2">
              Sessions per week
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`flex-1 h-10 rounded-[12px] text-sm font-semibold transition-colors ${
                    frequency === f
                      ? 'bg-[hsl(var(--brand))] text-white'
                      : 'bg-[hsl(var(--fill))] border border-[hsl(var(--border))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill-secondary))]'
                  }`}
                >
                  {f}×
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider mb-2">
              Training days
            </label>
            <div className="space-y-2">
              {days.map((day, i) => (
                <DayEditor
                  key={i}
                  day={day}
                  dayIndex={i}
                  onChange={handleDayLabelChange}
                  onAddExerciseFromLibrary={handleAddExerciseFromLibrary}
                  onRemoveExercise={handleRemoveExercise}
                  onUpdateExercise={handleUpdateExercise}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 py-4 border-t border-[hsl(var(--border))] flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-11 rounded-[12px] bg-[hsl(var(--fill))] border border-[hsl(var(--border))] text-sm font-semibold text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill-secondary))] transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isPlanValid}
            className="flex flex-1 items-center justify-center gap-2 h-11 rounded-[12px] bg-[hsl(var(--brand))] text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Plan'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

// ─── Today's Workout Card ───────────────────────────────────────────────────

function TodayWorkoutCard({ day, dayIndex, plan, status, onStart, isToday }) {
  const exerciseCount = (day.exercises || []).length;
  const estimatedDuration = day.exercises?.reduce((sum, ex) => {
    const sets = ex.sets || 3;
    const rest = ex.rest || 60;
    return sum + (sets * 45) + (sets * rest); // ~45s per set + rest
  }, 300) / 60; // +5min warmup in seconds, convert to minutes
  
  const muscleGroups = [...new Set((day.exercises || []).map(ex => ex.muscle_group).filter(Boolean))];
  
  const statusConfig = {
    not_started: { label: 'Ready to start', color: 'text-[hsl(var(--brand))]', bg: 'bg-[hsl(var(--brand)/0.15)]', icon: Play },
    in_progress: { label: 'In progress', color: 'text-amber-400', bg: 'bg-amber-400/15', icon: Activity },
    completed: { label: 'Completed today', color: 'text-emerald-400', bg: 'bg-emerald-400/15', icon: CheckCircle2 },
  };
  
  const config = statusConfig[status] || statusConfig.not_started;
  const StatusIcon = config.icon;
  
  return (
    <div className="overflow-hidden rounded-[20px] border-2 border-[hsl(var(--brand)/0.3)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.15),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] shadow-lg shadow-[hsl(var(--brand)/0.1)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[hsl(var(--brand)/0.2)] flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-[hsl(var(--brand))]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] text-[10px] font-bold uppercase tracking-wider">
                  TODAY
                </span>
                {status !== 'not_started' && (
                  <span className={`flex items-center gap-1 text-[11px] font-medium ${config.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--fg))] leading-tight">
                {day.label || day.name || `Day ${dayIndex + 1}`}
              </h3>
              {muscleGroups.length > 0 && (
                <p className="text-sm text-[hsl(var(--fg-2))] mt-1 capitalize">
                  {muscleGroups.slice(0, 3).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
              <StatusIcon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-sm font-semibold ${config.color}`}>
                {exerciseCount} exercises
              </span>
            </div>
          </div>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[hsl(var(--border)/0.5)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[hsl(var(--fg-3))]" />
            <span className="text-sm text-[hsl(var(--fg-2))]">~{Math.round(estimatedDuration)} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[hsl(var(--fg-3))]" />
            <span className="text-sm text-[hsl(var(--fg-2))]">
              {day.exercises?.reduce((sum, ex) => sum + (ex.sets || 3), 0)} sets
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[hsl(var(--fg-3))]" />
            <span className="text-sm text-[hsl(var(--fg-2))]">
              {muscleGroups.length} muscle groups
            </span>
          </div>
        </div>
      </div>
      
      {/* Exercise preview */}
      <div className="px-5 pb-4">
        <div className="space-y-2">
          {(day.exercises || []).slice(0, 4).map((ex, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="w-6 h-6 rounded-md bg-[hsl(var(--fill))] flex items-center justify-center text-xs font-bold text-[hsl(var(--fg-3))]">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-[hsl(var(--fg))] truncate">{ex.name}</span>
              <span className="text-xs text-[hsl(var(--fg-3))]">{ex.sets}×{ex.reps}</span>
            </div>
          ))}
          {exerciseCount > 4 && (
            <p className="text-xs text-[hsl(var(--fg-3))] pl-9">
              +{exerciseCount - 4} more exercises
            </p>
          )}
        </div>
      </div>
      
      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onStart(dayIndex)}
          disabled={status === 'completed'}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-[14px] font-bold text-base transition-all ${
            status === 'completed'
              ? 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))] cursor-not-allowed'
              : 'bg-[hsl(var(--brand))] text-white hover:opacity-90 shadow-lg shadow-[hsl(var(--brand)/0.3)]'
          }`}
        >
          {status === 'completed' ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Completed Today
            </>
          ) : status === 'in_progress' ? (
            <>
              <Activity className="w-5 h-5" />
              Continue Workout
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              Start Today's Workout
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Compact Day Card (for non-today days) ───────────────────────────────────

function CompactDayCard({ day, dayIndex, status, onStart }) {
  const [expanded, setExpanded] = useState(false);
  const exerciseCount = (day.exercises || []).length;
  
  const statusConfig = {
    not_started: { icon: CircleIcon, color: 'text-[hsl(var(--fg-3))]' },
    completed: { icon: CheckCircle2, color: 'text-emerald-400' },
  };
  
  const config = statusConfig[status] || statusConfig.not_started;
  const StatusIcon = config.icon;
  
  return (
    <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.4)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <StatusIcon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[hsl(var(--fg))] truncate">
            {day.label || day.name || `Day ${dayIndex + 1}`}
          </p>
          <p className="text-xs text-[hsl(var(--fg-3))]">
            {exerciseCount} exercises
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onStart(dayIndex); }}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-[10px] bg-[hsl(var(--fill-secondary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--brand)/0.1)] hover:text-[hsl(var(--brand))] transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          Start
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-[hsl(var(--fg-3))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--fg-3))]" />}
      </button>
      
      {expanded && (
        <div className="border-t border-[hsl(var(--border)/0.5)] px-4 py-3 space-y-1.5">
          {(day.exercises || []).map((ex, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-[hsl(var(--fg-3))]">{i + 1}.</span>
              <span className="flex-1 text-[hsl(var(--fg))] truncate">{ex.name}</span>
              <span className="text-xs text-[hsl(var(--fg-3))]">{ex.sets}×{ex.reps}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CircleIcon({ className }) {
  return <div className={`w-4 h-4 rounded-full border-2 border-current ${className}`} />;
}

// ─── AI Insights Card ────────────────────────────────────────────────────────

function AIInsightsCard({ plan, recentSessions }) {
  const insights = useMemo(() => {
    const list = [];
    
    // Check training consistency
    if (recentSessions.length > 0) {
      const lastSession = recentSessions[0];
      if (lastSession?.completed_at) {
        const lastDate = new Date(lastSession.completed_at);
        const now = new Date();
        const hoursSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSince > 72) {
          list.push({
            type: 'warning',
            icon: AlertCircle,
            message: `You haven't trained in ${Math.floor(hoursSince / 24)} days`,
            action: 'Time to get back on track',
          });
        } else if (hoursSince < 24) {
          list.push({
            type: 'success',
            icon: CheckCircle2,
            message: 'You trained today — great consistency!',
            action: null,
          });
        }
      }
    } else {
      list.push({
        type: 'info',
        icon: Sparkles,
        message: 'Start your first workout to build momentum',
        action: 'Every journey begins with a single rep',
      });
    }
    
    // Weekly volume check (simplified)
    const thisWeekSessions = recentSessions.filter(s => {
      if (!s.completed_at) return false;
      const daysAgo = (new Date().getTime() - new Date(s.completed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });
    
    if (thisWeekSessions.length >= 3) {
      list.push({
        type: 'success',
        icon: TrendingUp,
        message: `On fire! ${thisWeekSessions.length} sessions this week`,
        action: 'Keep this consistency',
      });
    } else if (thisWeekSessions.length === 0 && recentSessions.length > 0) {
      list.push({
        type: 'warning',
        icon: RotateCcw,
        message: 'No sessions this week yet',
        action: 'Your plan is waiting',
      });
    }
    
    return list.slice(0, 2); // Max 2 insights
  }, [recentSessions]);
  
  if (insights.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {insights.map((insight, i) => {
        const Icon = insight.icon;
        const colors = {
          warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          info: 'bg-[hsl(var(--brand)/0.1)] border-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]',
        };
        const colorClass = colors[insight.type] || colors.info;
        
        return (
          <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-[14px] border ${colorClass}`}>
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{insight.message}</p>
              {insight.action && (
                <p className="text-xs opacity-80 mt-0.5">{insight.action}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SessionCard({ session }) {
  const { locale } = useI18n();
  const exerciseCount = Array.isArray(session.exercises_completed)
    ? session.exercises_completed.length
    : 0;

  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.6)] px-4 py-3.5">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[hsl(var(--fg))] truncate">{session.name}</p>
        <p className="text-xs text-[hsl(var(--fg-3))] mt-0.5">
          {formatRelativeDate(session.completed_at, locale === 'pt-BR' ? 'pt-BR' : 'en-US')}
          {exerciseCount > 0 && ` · ${exerciseCount} exercises`}
        </p>
      </div>
      <div className="flex-shrink-0 text-right space-y-0.5">
        <div className="flex items-center gap-1 justify-end">
          <Clock className="w-3 h-3 text-[hsl(var(--fg-3))]" />
          <span className="text-xs text-[hsl(var(--fg-2))]">{formatDuration(session.duration_minutes)}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <TrendingUp className="w-3 h-3 text-[hsl(var(--fg-3))]" />
          <span className="text-xs text-[hsl(var(--fg-2))]">{formatVolume(session.volume_load)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkoutsV2() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { can } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState('list'); // 'list' | 'execution'
  const [activeSession, setActiveSession] = useState(null);
  const [autoStartHandled, setAutoStartHandled] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);

  // Fetch user profile data for AI plan generation
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data || {};
    },
    enabled: !!user?.id,
  });

  const { data: activePlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      const plans = await getActiveWorkoutPlans(user.id);
      return plans[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: recentSessions = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recent-workouts', user?.id],
    queryFn: () => getRecentWorkouts(user.id, 5),
    enabled: !!user?.id,
  });

  // History for PR computation — fetched ahead of execution so it's ready instantly
  const { data: workoutHistory = [] } = useQuery({
    queryKey: ['workout-history', user?.id],
    queryFn: () => fetchRecentWorkoutHistory(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 min
  });
  const personalRecords = computePersonalRecords(workoutHistory);

  const saveWorkoutMut = useMutation({
    mutationFn: ({ userId, payload, originalWorkout }) =>
      saveCompletedWorkout(userId, payload, originalWorkout),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recent-workouts', user?.id] });
      qc.invalidateQueries({ queryKey: ['recent-workouts'] });
      qc.invalidateQueries({ queryKey: ['workout-history', user?.id] });
      qc.invalidateQueries({ queryKey: ['today-sessions', user?.id] });
      qc.invalidateQueries({ queryKey: DAILY_QUERY_KEYS.todaySession(user?.id) });
      setMode('list');
      setActiveSession(null);
      toast.success('Session saved!');
    },
    onError: () => {
      toast.error('Error saving workout. Check your connection.');
    },
  });

  const handleStartFromPlan = (dayIndex) => {
    if (!activePlan) return;
    setActiveSession(buildSessionFromPlan(activePlan, dayIndex));
    setMode('execution');
  };

  const handleStartEmpty = () => {
    setActiveSession({ name: 'Free Workout', exercises: [] });
    setMode('execution');
  };

  // ── Auto-start from Today quick action (?action=start) ──────────────────────
  useEffect(() => {
    if (autoStartHandled) return;
    if (searchParams.get('action') !== 'start') return;
    if (isLoadingPlan) return; // wait for plan data
    setAutoStartHandled(true);
    // Clean up the URL param
    setSearchParams((prev) => { prev.delete('action'); return prev; }, { replace: true });
    if (activePlan && activePlan.days?.length > 0) {
      // Find today's day index based on plan schedule, or default to first day
      const todayIdx = activePlan.current_day_index ?? 0;
      const safeIdx = Math.min(todayIdx, (activePlan.days?.length || 1) - 1);
      setActiveSession(buildSessionFromPlan(activePlan, safeIdx));
      setMode('execution');
    } else {
      // No plan — start a free workout
      setActiveSession({ name: 'Free Workout', exercises: [] });
      setMode('execution');
    }
  }, [searchParams, isLoadingPlan, activePlan, autoStartHandled, setSearchParams]);

  const handleCompleteWorkout = (completedData) => {
    if (!user?.id || !activeSession) return;
    saveWorkoutMut.mutate({ userId: user.id, payload: completedData, originalWorkout: activeSession });
  };

  const handlePlanCreated = () => {
    setShowCreatePlan(false);
    qc.invalidateQueries({ queryKey: ['active-workout-plan', user?.id] });
    qc.invalidateQueries({ queryKey: ['today-workout-plan', user?.id] });
    qc.invalidateQueries({ queryKey: ['workout-history', user?.id] });
    toast.success('Plan created! Start a session from any day.');
  };


  // ── Execution mode ────────────────────────────────────────────────────────
  if (mode === 'execution') {
    return (
      <WorkoutExecutionScreen
        workout={activeSession}
        onComplete={handleCompleteWorkout}
        onCancel={() => { setMode('list'); setActiveSession(null); }}
        workoutHistory={workoutHistory}
        personalRecords={personalRecords}
      />
    );
  }

  const isLoading = isLoadingPlan || isLoadingRecent;
  const days = activePlan?.days || [];
  const todayDayIndex = activePlan ? getTodayDayIndex(activePlan) : 0;

  // ── List mode ─────────────────────────────────────────────────────────────
  return (
    <AppContainer maxWidth="max-w-3xl">
      {/* NEW HEADER: Execution-focused */}
      <PageHeader
        eyebrow="Train Today"
        title={activePlan ? "Your Training Plan" : "Start Training"}
        subtitle={activePlan 
          ? `Day ${todayDayIndex + 1} of ${activePlan.frequency} · ${activePlan.name}` 
          : "Create a plan or generate a quick workout with AI"}
        actions={(
          <ActionRow>
            {can('ai_workout_generation') && (
              <SecondaryButton className="gap-2" onClick={() => setShowPlanBuilder(true)}>
                <Sparkles className="h-4 w-4" />
                AI Plan Builder
              </SecondaryButton>
            )}
            <SecondaryButton className="gap-2" onClick={() => setShowQuickWorkout(true)}>
              <Zap className="h-4 w-4" />
              Quick Workout
            </SecondaryButton>
          </ActionRow>
        )}
      >
        <div className="h-2" />{/* Spacer for PageHeader children requirement */}
      </PageHeader>

      <div className="space-y-7 pb-12">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[hsl(var(--brand))] animate-spin" />
          </div>
        )}

        {!isLoading && activePlan && (
          <>
            {/* AI INSIGHTS */}
            <AIInsightsCard plan={activePlan} recentSessions={recentSessions} />
            
            {/* TODAY'S WORKOUT - PRIMARY CARD */}
            {days[todayDayIndex] && (
              <TodayWorkoutCard
                day={days[todayDayIndex]}
                dayIndex={todayDayIndex}
                plan={activePlan}
                status={getSessionStatus(todayDayIndex, recentSessions, activePlan)}
                onStart={handleStartFromPlan}
                isToday={true}
              />
            )}
            
            {/* OTHER DAYS - COLLAPSED */}
            {days.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-widest text-[hsl(var(--fg-3))] uppercase">Upcoming Days</p>
                  <span className="text-xs text-[hsl(var(--fg-3))]">{days.length - 1} more</span>
                </div>
                <div className="space-y-2">
                  {days.map((day, i) => {
                    if (i === todayDayIndex) return null;
                    return (
                      <CompactDayCard
                        key={i}
                        day={day}
                        dayIndex={i}
                        status={getSessionStatus(i, recentSessions, activePlan)}
                        onStart={handleStartFromPlan}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* PLAN CONTROLS */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--fg-3))]">
                <Calendar className="w-4 h-4" />
                <span>{activePlan.frequency}× per week · {activePlan.objective || 'General fitness'}</span>
              </div>
              <div className="flex gap-2">
                <SecondaryButton size="sm" onClick={() => setShowPlanBuilder(true)}>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  New AI Plan
                </SecondaryButton>
                <SecondaryButton size="sm" onClick={() => setShowCreatePlan(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Manual
                </SecondaryButton>
              </div>
            </div>
          </>
        )}

        {!isLoading && !activePlan && (
          <div className="space-y-6">
            {/* NO PLAN STATE - AI-FIRST */}
            <Card className="px-6 py-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.15)] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[hsl(var(--brand))]" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--fg))] mb-2">Build your training plan with AI</h3>
              <p className="text-sm text-[hsl(var(--fg-2))] mb-6 max-w-sm mx-auto">
                Answer 3 quick questions and get a complete, personalized training program in seconds.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row justify-center">
                <PrimaryButton className="gap-2" onClick={() => setShowPlanBuilder(true)}>
                  <Sparkles className="h-4 w-4" />
                  AI Plan Builder
                </PrimaryButton>
                <SecondaryButton className="gap-2" onClick={() => setShowQuickWorkout(true)}>
                  <Zap className="h-4 w-4" />
                  Quick Workout
                </SecondaryButton>
              </div>
            </Card>
            
            {/* AI INSIGHTS FOR NO-PLAN STATE */}
            <AIInsightsCard plan={null} recentSessions={recentSessions} />
          </div>
        )}

        {!isLoading && recentSessions.length > 0 && (
          <Section
            eyebrow="History"
            title="Recent sessions"
            subtitle="Your completed workouts"
            actions={<div />}
          >
            <div className="space-y-2.5">
              {recentSessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* Quick Workout Modal */}
      <QuickWorkoutModal
        open={showQuickWorkout}
        onClose={() => setShowQuickWorkout(false)}
        onStart={(session) => {
          setActiveSession(session);
          setMode('execution');
        }}
      />

      {/* Create Plan Modal */}
      {showCreatePlan && (
        <CreatePlanModal
          userId={user?.id}
          onClose={() => setShowCreatePlan(false)}
          onCreated={handlePlanCreated}
        />
      )}

      {/* Plan Builder Wizard */}
      {showPlanBuilder && (
        <PlanBuilderWizard
          open={showPlanBuilder}
          onClose={() => setShowPlanBuilder(false)}
          userId={user?.id}
          profileData={userProfile || {}}
        />
      )}

    </AppContainer>
  );
}
