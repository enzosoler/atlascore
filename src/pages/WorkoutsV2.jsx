import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import { ActionRow, AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, SecondaryButton } from '@/components/shared/StablePage';
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
    date: new Date().toISOString().split('T')[0],
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

function formatRelativeDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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

          {/* Library search panel */}
          {showSearch ? (
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
              <button
                onClick={() => setShowSearch(true)}
                className="flex w-full items-center gap-1.5 rounded-[12px] border border-dashed border-[hsl(var(--border))] px-3 py-2.5 text-xs text-[hsl(var(--fg-3))] transition-colors hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.04)] hover:text-[hsl(var(--brand))]"
              >
                <Search className="w-3.5 h-3.5" />
                Add exercise from library
              </button>
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
        start_date: new Date().toISOString().split('T')[0],
      });
      onCreated();
    } catch (err) {
      toast.error(err.message || 'Failed to create plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
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
    </div>
  );
}

// ─── DayCard (plan day in list view) ──────────────────────────────────────────

function DayCard({ day, dayIndex, onStart }) {
  const [expanded, setExpanded] = useState(false);
  const exerciseCount = (day.exercises || []).length;

  return (
    <div className="overflow-hidden rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.6)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[hsl(var(--brand)/0.15)] flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-[hsl(var(--brand))]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[hsl(var(--fg))] leading-tight truncate">
            {day.label || day.name || `Day ${dayIndex + 1}`}
          </p>
          <p className="text-xs text-[hsl(var(--fg-2))] mt-0.5">{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onStart(dayIndex); }}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-[12px] bg-[hsl(var(--brand))] px-3 py-2 text-xs font-bold text-white transition-colors hover:opacity-90"
        >
          <Play className="w-3 h-3 fill-current" />
          Start
        </button>
        <span className="flex-shrink-0 text-[hsl(var(--fg-3))] ml-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[hsl(var(--border)/0.7)] px-4 py-2 space-y-2">
          {(day.exercises || []).map((ex, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <span className="w-5 h-5 rounded-md bg-[hsl(var(--fill))] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--fg-3))] flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[hsl(var(--fg))] truncate">{ex.name}</p>
              </div>
              <span className="text-xs text-[hsl(var(--fg-3))] flex-shrink-0">{ex.sets}×{ex.reps}</span>
              {ex.load && <span className="text-xs text-[hsl(var(--brand)/0.7)] flex-shrink-0">{ex.load}kg</span>}
            </div>
          ))}
          {exerciseCount === 0 && (
            <p className="text-xs text-[hsl(var(--fg-3))] py-2">No exercises added yet</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SessionCard ──────────────────────────────────────────────────────────────

function SessionCard({ session }) {
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
          {formatRelativeDate(session.completed_at)}
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
  const [mode, setMode] = useState('list'); // 'list' | 'execution'
  const [activeSession, setActiveSession] = useState(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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

  const generateAIPlan = async () => {
    setAiGenerating(true);
    try {
      const profileData = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const profile = profileData?.data || {};
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed weekly workout plan in English for an athlete with the following profile:
- Goal: ${profile.training_goal || 'general fitness'}
- Experience: ${profile.training_experience || 'intermediate'}
- Location: ${profile.training_location || 'gym'}
- Session duration: ${profile.training_session_minutes || 60} minutes
- Frequency: ${profile.training_frequency || 4} days/week

Create a structured plan with 3-5 training days, each with specific exercises, sets, reps and rest time.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            objective: { type: 'string' },
            frequency: { type: 'number' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  focus: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        sets: { type: 'number' },
                        reps: { type: 'string' },
                        rest: { type: 'number' },
                        notes: { type: 'string' },
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (res?.days?.length) {
        await deactivateAllWorkoutPlans(user.id);
        await createWorkoutPlan(user.id, {
          ...res,
          active: true,
          created_by_type: 'ai',
          version: 1,
          start_date: new Date().toISOString().split('T')[0],
        });
        qc.invalidateQueries({ queryKey: ['active-workout-plan', user?.id] });
        qc.invalidateQueries({ queryKey: ['today-workout-plan', user?.id] });
        toast.success('Plan generated!');
        setShowAIGen(false);
      } else {
        toast.error('Could not generate plan. Try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating plan.');
    } finally {
      setAiGenerating(false);
    }
  };

  // ── Execution mode ────────────────────────────────────────────────────────
  if (mode === 'execution') {
    return (
      <WorkoutExecutionScreen
        workout={activeSession}
        onComplete={handleCompleteWorkout}
        onBack={() => { setMode('list'); setActiveSession(null); }}
        workoutHistory={workoutHistory}
        personalRecords={personalRecords}
      />
    );
  }

  const isLoading = isLoadingPlan || isLoadingRecent;
  const days = activePlan?.days || [];

  // ── List mode ─────────────────────────────────────────────────────────────
  return (
    <AppContainer maxWidth="max-w-3xl">
      <PageHeader
        eyebrow="Training"
        title="Workouts"
        subtitle="Manage your active plan, launch focused sessions, and keep recent training history easy to scan."
        actions={(
          <ActionRow>
            {can('ai_workout_generation') ? (
              <SecondaryButton className="gap-2" onClick={() => setShowAIGen(true)}>
                <Sparkles className="h-4 w-4" />
                Plan builder
              </SecondaryButton>
            ) : null}
            <PrimaryButton className="gap-2" onClick={() => setShowCreatePlan(true)}>
              <Plus className="h-4 w-4" />
              New Plan
            </PrimaryButton>
            <SecondaryButton className="gap-2" onClick={handleStartEmpty}>
              <Zap className="h-4 w-4" />
              Free Workout
            </SecondaryButton>
          </ActionRow>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="px-4 py-4">
            <p className="atlas-overline">Status</p>
            <p className="mt-3 text-[17px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {activePlan ? activePlan.name : 'No active plan'}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {activePlan
                ? `${days.length} days ready to execute`
                : 'Create a plan or jump into a free workout.'}
            </p>
          </Card>
          <Card className="px-4 py-4">
            <p className="atlas-overline">Recent sessions</p>
            <p className="mt-3 text-[24px] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              {recentSessions.length}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Logged and ready for comparison.
            </p>
          </Card>
          <Card className="px-4 py-4">
            <p className="atlas-overline">Personal records</p>
            <p className="mt-3 text-[24px] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              {Object.keys(personalRecords || {}).length}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Available during execution as live feedback.
            </p>
          </Card>
        </div>
      </PageHeader>

      <div className="space-y-7 pb-12">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[hsl(var(--brand))] animate-spin" />
          </div>
        )}

        {!isLoading && activePlan && (
          <Section
            eyebrow="Active plan"
            title={activePlan.name}
            subtitle={activePlan.objective || 'Structured plan ready for execution.'}
          >
            <Card className="mb-4 border-[hsl(var(--brand)/0.2)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.12),transparent_34%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--brand)/0.2)]">
                    <Zap className="w-4 h-4 text-[hsl(var(--brand))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold tracking-widest text-[hsl(var(--brand))] uppercase">Active plan</p>
                    <p className="text-base font-bold text-[hsl(var(--fg))] mt-0.5 truncate">{activePlan.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--fg-3))]">
                        <Calendar className="w-3 h-3" />{activePlan.frequency}× / week
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--fg-3))]">
                        <Dumbbell className="w-3 h-3" />{days.length} days
                      </span>
                    </div>
                    {activePlan.objective && (
                      <p className="text-xs text-[hsl(var(--fg-3))] mt-1 italic truncate">{activePlan.objective}</p>
                    )}
                  </div>
                </div>
                <SecondaryButton
                  type="button"
                  onClick={() => setShowCreatePlan(true)}
                  className="shrink-0"
                >
                  Replace
                </SecondaryButton>
              </div>
            </Card>

            <div className="space-y-2.5">
              {days.map((day, i) => (
                <DayCard key={i} day={day} dayIndex={i} onStart={handleStartFromPlan} />
              ))}
            </div>
          </Section>
        )}

        {!isLoading && !activePlan && (
          <Card className="px-5 py-4">
            <EmptyState
              icon={Dumbbell}
              title="No active plan"
              description="Create a structured plan or jump straight into a free workout."
              action={(
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton className="gap-2" onClick={() => setShowCreatePlan(true)}>
                    <Plus className="h-4 w-4" />
                    Create Plan
                  </PrimaryButton>
                  <SecondaryButton className="gap-2" onClick={handleStartEmpty}>
                    <Play className="h-4 w-4 fill-current" />
                    Free Workout
                  </SecondaryButton>
                </div>
              )}
            />
          </Card>
        )}

        {!isLoading && recentSessions.length > 0 && (
          <Section
            eyebrow="History"
            title="Recent sessions"
            subtitle="Latest logs from completed workouts."
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-[hsl(var(--fg-3))] uppercase">Recent sessions</p>
              <span className="flex items-center gap-1 text-xs text-[hsl(var(--fg-3))]">
                <Flame className="w-3 h-3 text-orange-400" />
                {recentSessions.length} logged
              </span>
            </div>
            <div className="space-y-2.5">
              {recentSessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* Create Plan Modal */}
      {showCreatePlan && (
        <CreatePlanModal
          userId={user?.id}
          onClose={() => setShowCreatePlan(false)}
          onCreated={handlePlanCreated}
        />
      )}

      {/* Plan generation modal */}
      {showAIGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-sm rounded-[24px] border border-[hsl(var(--border))] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--fg-3))]">Plan builder</p>
            <h2 className="mt-2 text-lg font-bold text-[hsl(var(--fg))] tracking-tight">Build workout plan</h2>
            <p className="mt-2 text-sm text-[hsl(var(--fg-2))] leading-6">Your profile will be used to build a personalized training plan. Your current active plan will be replaced.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <SecondaryButton type="button" onClick={() => setShowAIGen(false)} className="flex-1">
                Cancel
              </SecondaryButton>
              <PrimaryButton type="button" onClick={generateAIPlan} disabled={aiGenerating} className="flex-1 gap-2">
                {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiGenerating ? 'Building...' : 'Build'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

    </AppContainer>
  );
}
