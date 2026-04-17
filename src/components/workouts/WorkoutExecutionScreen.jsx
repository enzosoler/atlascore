import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, Clock, Plus, Trophy, X, Timer } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { tapMedium, celebrateHeavy } from '@/lib/haptics';
import { PaywallSheet } from '@/components/entitlements/PaywallTrigger';
import { Button } from '@/components/ui/button';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import ExerciseMedia from '@/components/exercises/ExerciseMedia.jsx';
import { toast } from 'sonner';
import { getLastSession, checkSetIsPR } from '@/services/workoutHistoryService';
import { saveSession, clearSession } from '@/lib/workoutSession';

// ─── Set suggestion engine ────────────────────────────────────────────────────

function computeSetSuggestion({ exercise, setIdx, exerciseIdx, completedSets, lastSession }) {
  const none = { weight: '', reps: '', rir: '', source: null, label: null, lastDisplay: null };
  if (!exercise) return none;

  function parseReps(str) {
    const s = String(str || '');
    const range = s.match(/^(\d+)[-–](\d+)$/);
    if (range) return { min: parseInt(range[1]), max: parseInt(range[2]) };
    const single = s.match(/^(\d+)/);
    if (single) { const n = parseInt(single[1]); return { min: n, max: n }; }
    return null;
  }

  if (lastSession?.sets?.length > 0) {
    const histSet = lastSession.sets[Math.min(setIdx, lastSession.sets.length - 1)];
    if (histSet && (histSet.load > 0 || histSet.reps > 0)) {
      const target = parseReps(exercise.target_reps);
      let sugWeight = histSet.load > 0 ? histSet.load : null;
      let sugReps   = histSet.reps > 0 ? histSet.reps : (target?.max ?? null);
      let label     = 'lastSession';

      if (sugWeight !== null && target) {
        if (histSet.reps >= target.max) {
          sugWeight = Math.round((sugWeight + 2.5) * 4) / 4;
          sugReps   = target.min;
          label     = 'progressiveOverload';
        } else if (histSet.reps < target.min) {
          sugReps = target.min;
        }
      }

      const lastDisplay = [
        histSet.load > 0 ? `${histSet.load}kg` : null,
        histSet.reps > 0 ? `${histSet.reps}` : null,
      ].filter(Boolean).join(' x ');

      return {
        weight: sugWeight !== null ? String(sugWeight) : '',
        reps:   sugReps   !== null ? String(sugReps)   : '',
        rir: '',
        source: 'last_session',
        label,
        lastDisplay: lastDisplay || null,
      };
    }
  }

  if (setIdx > 0) {
    const prev = completedSets[exerciseIdx]?.[setIdx - 1];
    if (prev && (prev.weight || prev.reps)) {
      return {
        weight: prev.weight || '',
        reps:   prev.reps   || '',
        rir: '',
        source: 'previous_set',
        label: 'previousSet',
        lastDisplay: null,
      };
    }
  }

  const tw = exercise.target_weight;
  const repsMatch = String(exercise.target_reps || '').match(/^(\d+)/);
  const tr = repsMatch ? repsMatch[1] : '';
  if (tw || tr) {
    return {
      weight: tw ? String(tw) : '',
      reps:   tr,
      rir: '',
      source: 'target',
      label: 'targetFromPlan',
      lastDisplay: null,
    };
  }

  return none;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function searchResultToExecution(ex) {
  const setCount =
    typeof ex.default_set_range === 'number' && ex.default_set_range > 0
      ? ex.default_set_range
      : 3;
  const repRange = ex.default_rep_range || '8-12';
  const restSec =
    typeof ex.default_rest_seconds === 'number' ? ex.default_rest_seconds : 60;

  return {
    name: ex.name,
    primary_muscles: ex.primary_muscles || [],
    technique: null,
    rest_seconds: restSec,
    execution_notes: null,
    target_sets: setCount,
    target_reps: repRange,
    target_weight: null,
    media_gif_url: ex.media_gif_url || null,
    exercise_master_id: ex.exercise_master_id || null,
    sets: Array.from({ length: setCount }, (_, i) => ({
      set_number: i + 1,
      target_sets: setCount,
      target_reps: repRange,
      target_weight: null,
    })),
  };
}

function formatRestCountdown(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Inline editable cell (large tap target) ─────────────────────────────────

function TapCell({ value, onChange, placeholder, className = '' }) {
  const inputRef = useRef(null);
  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="decimal"
      min="0"
      max="999"
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '' || (Number(v) >= 0 && Number(v) <= 999)) onChange(v);
      }}
      placeholder={placeholder}
      className={`w-full min-h-[44px] min-w-[44px] rounded-xl bg-[hsl(var(--fill)/0.6)] border border-[hsl(var(--border)/0.4)] text-center text-[16px] font-semibold text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.4)] focus:border-[hsl(var(--brand)/0.5)] transition-all ${className}`}
    />
  );
}

// ─── Set row in the table ─────────────────────────────────────────────────────

function SetRow({ setNumber, previousDisplay, weight, reps, onWeightChange, onRepsChange, onComplete, isCompleted, isPR, t }) {
  return (
    <div className={`grid grid-cols-[40px_1fr_1fr_1fr_44px] gap-2 items-center min-h-[52px] px-3 py-1.5 transition-colors ${isCompleted ? 'bg-[hsl(var(--ok)/0.06)]' : ''}`}>
      {/* Set # */}
      <div className="flex items-center justify-center min-h-[44px]">
        <span className={`text-[13px] font-bold ${isCompleted ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'}`}>
          {setNumber}
        </span>
      </div>

      {/* Previous */}
      <div className="flex items-center justify-center min-h-[44px]">
        <span className="text-[12px] text-[hsl(var(--fg-3))] font-medium truncate">
          {previousDisplay || '---'}
        </span>
      </div>

      {/* Weight input */}
      <TapCell
        value={weight}
        onChange={onWeightChange}
        placeholder="0"
      />

      {/* Reps input */}
      <TapCell
        value={reps}
        onChange={onRepsChange}
        placeholder="0"
      />

      {/* Checkmark */}
      <button
        onClick={onComplete}
        className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all active:scale-95 ${
          isCompleted
            ? 'bg-[hsl(var(--ok))] text-white shadow-sm'
            : (weight || reps)
              ? 'bg-[hsl(var(--brand))] text-white shadow-sm'
              : 'bg-[hsl(var(--fill)/0.8)] text-[hsl(var(--fg-3))]'
        }`}
      >
        {isPR ? (
          <Trophy className="w-4 h-4" strokeWidth={2.5} />
        ) : (
          <Check className="w-4 h-4" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}

// ─── Inline rest timer (appears between sets) ────────────────────────────────

function InlineRestTimer({ remaining, duration, onSkip, onAdd30, setNumber, t }) {
  const pct = duration > 0 ? remaining / duration : 0;
  const urgent = remaining > 0 && remaining <= 5;

  return (
    <div className="mx-3 my-2 rounded-2xl bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.15)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[hsl(var(--brand))]" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-[hsl(var(--brand))] uppercase tracking-wide">
            {t('workoutExecution.rest')}
          </span>
        </div>
        <span className="text-[11px] text-[hsl(var(--fg-3))]">
          {t('workoutExecution.restAfterSet', { n: setNumber })}
        </span>
      </div>

      {/* Timer display */}
      <div className="flex items-center gap-4">
        <span className={`text-[2.5rem] font-bold tabular-nums leading-none tracking-tight transition-colors ${urgent ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--fg))]'}`}>
          {formatRestCountdown(remaining)}
        </span>
        <div className="flex-1">
          <div className="h-2 w-full rounded-full bg-[hsl(var(--border)/0.3)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-linear ${urgent ? 'bg-[hsl(var(--warn))]' : 'bg-[hsl(var(--brand))]'}`}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onAdd30}
          className="rounded-full border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.5)] px-3 py-1.5 text-[11px] font-medium text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
        >
          {t('workoutExecution.plus30s')}
        </button>
        <Button
          size="sm"
          className="rounded-full h-8 px-4 text-[12px]"
          onClick={onSkip}
        >
          {t('workoutExecution.skipRest')}
        </Button>
      </div>
    </div>
  );
}

// ─── Exercise block ───────────────────────────────────────────────────────────

function ExerciseBlock({
  exercise,
  exerciseIdx,
  isActive,
  isCurrent,
  completedSets,
  lastSession,
  allCompletedSets,
  workoutHistory,
  personalRecords,
  resting,
  restRemaining,
  restDuration,
  restingAfterSetIdx,
  onSetComplete,
  onSkipRest,
  onAdd30,
  onAddSet,
  onScrollRef,
  t,
}) {
  const sets = exercise?.sets || [];

  // Local form state for each set in this exercise
  const [setForms, setSetForms] = useState(() => {
    const forms = {};
    sets.forEach((_, si) => {
      const saved = completedSets?.[si];
      if (saved) {
        forms[si] = { weight: saved.weight || '', reps: saved.reps || '' };
      } else {
        const s = computeSetSuggestion({ exercise, setIdx: si, exerciseIdx, completedSets: allCompletedSets, lastSession });
        forms[si] = { weight: s.weight, reps: s.reps };
      }
    });
    return forms;
  });

  // Update forms when sets change (e.g., adding a set)
  useEffect(() => {
    setSetForms((prev) => {
      const next = { ...prev };
      sets.forEach((_, si) => {
        if (next[si] === undefined) {
          const saved = completedSets?.[si];
          if (saved) {
            next[si] = { weight: saved.weight || '', reps: saved.reps || '' };
          } else {
            const s = computeSetSuggestion({ exercise, setIdx: si, exerciseIdx, completedSets: allCompletedSets, lastSession });
            next[si] = { weight: s.weight, reps: s.reps };
          }
        }
      });
      return next;
    });
  }, [sets.length]);

  const handleSetComplete = (si) => {
    const form = setForms[si] || { weight: '', reps: '' };
    onSetComplete(exerciseIdx, si, form);
  };

  // Get previous performance per set from lastSession
  const getPreviousDisplay = (si) => {
    if (lastSession?.sets?.[si]) {
      const s = lastSession.sets[si];
      const parts = [];
      if (s.load > 0) parts.push(`${s.load}kg`);
      if (s.reps > 0) parts.push(`x${s.reps}`);
      return parts.join(' ') || '---';
    }
    return '---';
  };

  const completedCount = Object.keys(completedSets || {}).length;
  const allDone = completedCount >= sets.length && sets.length > 0;

  return (
    <div
      ref={isCurrent ? onScrollRef : undefined}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isCurrent
          ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--card))] shadow-sm'
          : allDone
            ? 'border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.03)]'
            : 'border-[hsl(var(--border)/0.4)] bg-[hsl(var(--card)/0.5)]'
      }`}
    >
      {/* Exercise header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border)/0.2)]">
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[hsl(var(--fill)/0.5)]">
          <ExerciseMedia exercise={exercise} size="sm" showFallback={true} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-semibold truncate ${allDone ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'}`}>
            {exercise.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {exercise.primary_muscles?.slice(0, 2).map((m) => (
              <span key={m} className="text-[10px] font-medium text-[hsl(var(--fg-3))] uppercase">
                {m}
              </span>
            ))}
            {exercise.rest_seconds && (
              <span className="text-[10px] text-[hsl(var(--fg-3))]">
                {exercise.rest_seconds}s rest
              </span>
            )}
          </div>
        </div>
        {allDone && (
          <div className="w-6 h-6 rounded-full bg-[hsl(var(--ok))] flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        )}
        <span className="text-[11px] font-medium text-[hsl(var(--fg-3))]">
          {completedCount}/{sets.length}
        </span>
      </div>

      {/* Previous performance banner */}
      {lastSession && isCurrent && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--fill)/0.3)] border-b border-[hsl(var(--border)/0.15)]">
          <Clock className="w-3 h-3 text-[hsl(var(--fg-3))] shrink-0" strokeWidth={2} />
          <span className="text-[11px] text-[hsl(var(--fg-2))]">
            {t('workoutExecution.last')}{' '}
            <span className="font-semibold text-[hsl(var(--fg))]">
              {lastSession.setCount} {t('train.sets')} - {lastSession.maxWeight > 0 ? `${lastSession.maxWeight}kg` : ''} {lastSession.avgReps > 0 ? `x${lastSession.avgReps}` : ''}
            </span>
          </span>
        </div>
      )}

      {/* Set table header */}
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_44px] gap-2 items-center px-3 py-2 border-b border-[hsl(var(--border)/0.15)]">
        <span className="text-[10px] font-bold text-[hsl(var(--fg-3))] text-center uppercase">{t('workoutExecution.setN')}</span>
        <span className="text-[10px] font-bold text-[hsl(var(--fg-3))] text-center uppercase">{t('workoutExecution.previous')}</span>
        <span className="text-[10px] font-bold text-[hsl(var(--fg-3))] text-center uppercase">{t('workoutExecution.weight')}</span>
        <span className="text-[10px] font-bold text-[hsl(var(--fg-3))] text-center uppercase">{t('workoutExecution.reps')}</span>
        <span className="text-[10px] font-bold text-[hsl(var(--fg-3))] text-center uppercase"><Check className="w-3 h-3 mx-auto" /></span>
      </div>

      {/* Set rows */}
      <div className="divide-y divide-[hsl(var(--border)/0.1)]">
        {sets.map((_, si) => {
          const isSetCompleted = !!completedSets?.[si];
          const form = setForms[si] || { weight: '', reps: '' };

          // PR check
          const isPR = isSetCompleted && form.weight && form.reps
            ? checkSetIsPR(personalRecords, exercise.name, Number(form.weight), Number(form.reps)).isPR
            : false;

          return (
            <React.Fragment key={si}>
              <SetRow
                setNumber={si + 1}
                previousDisplay={getPreviousDisplay(si)}
                weight={form.weight}
                reps={form.reps}
                onWeightChange={(v) => setSetForms((prev) => ({ ...prev, [si]: { ...prev[si], weight: v } }))}
                onRepsChange={(v) => setSetForms((prev) => ({ ...prev, [si]: { ...prev[si], reps: v } }))}
                onComplete={() => handleSetComplete(si)}
                isCompleted={isSetCompleted}
                isPR={isPR}
                t={t}
              />
              {/* Inline rest timer after completing this set */}
              {resting && restingAfterSetIdx === si && isCurrent && (
                <InlineRestTimer
                  remaining={restRemaining}
                  duration={restDuration}
                  onSkip={onSkipRest}
                  onAdd30={onAdd30}
                  setNumber={si + 1}
                  t={t}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Add set button */}
      {isCurrent && (
        <button
          onClick={() => onAddSet(exerciseIdx)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.04)] transition-colors border-t border-[hsl(var(--border)/0.15)]"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          {t('workoutExecution.addSet')}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkoutExecutionScreen({
  workout,
  initialSession = null,
  onComplete,
  onCancel,
  workoutHistory = [],
  personalRecords = {},
}) {
  const { locale, t } = useI18n();

  const [exercises, setExercises] = useState(
    () => initialSession?.exercises || workout.exercises || []
  );
  const [currentExIdx, setCurrentExIdx] = useState(() => initialSession?.exerciseIdx ?? 0);
  const [resting, setResting] = useState(() => initialSession?.resting ?? false);
  const [restStartedAt, setRestStartedAt] = useState(() => initialSession?.restStartedAt ?? null);
  const [restDuration, setRestDuration] = useState(() => initialSession?.restDuration ?? 0);
  const [restingAfterSetIdx, setRestingAfterSetIdx] = useState(null);
  const [completedSets, setCompletedSets] = useState(() => initialSession?.completedSets ?? {});
  const [showAddExercise, setShowAddExercise] = useState(
    () => (initialSession?.exercises ?? workout.exercises ?? []).length === 0
  );
  const [isDone, setIsDone] = useState(false);
  const [showWorkoutPaywall, setShowWorkoutPaywall] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [, forceUpdate] = useState(0);

  const audioRef = useRef(null);
  const startedAt = useRef(initialSession?.startedAt ?? Date.now());
  const currentExRef = useRef(null);

  // Elapsed timer
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest remaining (derived)
  const restRemaining = resting && restStartedAt
    ? Math.max(0, restDuration - Math.floor((Date.now() - restStartedAt) / 1000))
    : 0;

  // Timer tick for rest
  useEffect(() => {
    if (!resting || !restStartedAt) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 500);
    return () => clearInterval(interval);
  }, [resting, restStartedAt]);

  // Auto-stop rest
  useEffect(() => {
    if (resting && restRemaining === 0 && restStartedAt) {
      if (audioRef.current) audioRef.current.play().catch(() => {});
      setResting(false);
      setRestStartedAt(null);
      setRestingAfterSetIdx(null);
    }
  }, [resting, restRemaining, restStartedAt]);

  // Persist session
  useEffect(() => {
    if (isDone) return;
    saveSession({
      workout,
      exercises,
      exerciseIdx: currentExIdx,
      setIdx: 0,
      completedSets,
      formData: { weight: '', reps: '', rir: '' },
      resting,
      restStartedAt,
      restDuration,
      startedAt: startedAt.current,
    });
    window.dispatchEvent(new Event('atlas:session:change'));
  }, [exercises, currentExIdx, completedSets, resting, restStartedAt, restDuration, isDone]);

  // Warn before leaving
  useEffect(() => {
    if (isDone) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDone]);

  // Get last session for each exercise
  const lastSessions = useMemo(() => {
    const map = {};
    exercises.forEach((ex, i) => {
      map[i] = getLastSession(workoutHistory, ex.name);
    });
    return map;
  }, [exercises, workoutHistory]);

  // Total stats
  const totalSavedSets = Object.values(completedSets).reduce(
    (acc, ex) => acc + Object.keys(ex).length, 0
  );
  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.values(completedSets).forEach((exSets) => {
      Object.values(exSets).forEach((s) => {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        vol += w * r;
      });
    });
    return vol;
  }, [completedSets]);

  // Completion progress
  const totalPlannedSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  const completionPct = totalPlannedSets > 0 ? Math.round((totalSavedSets / totalPlannedSets) * 100) : 0;

  // ── Payload builder ──────────────────────────────────────────────────────
  const buildCompletedPayload = () => {
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    let volumeLoad = 0;

    const exercises_completed = exercises.map((ex, ei) => {
      const setsData = completedSets[ei] || {};
      const sets_completed = (ex.sets || []).map((s, si) => {
        const logged = setsData[si];
        const repsActual = logged?.reps ? Number(logged.reps) : null;
        const loadActual = logged?.weight ? Number(logged.weight) : null;
        if (repsActual && loadActual) volumeLoad += repsActual * loadActual;
        return {
          set_number: si + 1,
          target_reps: s.target_reps ?? ex.target_reps,
          target_weight: s.target_weight ?? ex.target_weight,
          reps_actual: repsActual,
          load_actual: loadActual,
          rir_actual: logged?.rir ? Number(logged.rir) : null,
        };
      });
      return {
        name: ex.name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        sets_completed,
      };
    });

    return {
      exercises_completed,
      volume_load: Math.round(volumeLoad),
      duration_minutes: durationMinutes,
    };
  };

  // ── Set complete handler ──────────────────────────────────────────────────
  const handleSetComplete = useCallback((exIdx, setIdx, formData) => {
    const hasData = formData.weight || formData.reps;
    if (!hasData) return;

    const w = Number(formData.weight);
    const r = Number(formData.reps);
    if (formData.weight && (isNaN(w) || w < 0 || w > 999)) return;
    if (formData.reps && (isNaN(r) || r < 0 || r > 999)) return;

    setCompletedSets((prev) => ({
      ...prev,
      [exIdx]: {
        ...(prev[exIdx] || {}),
        [setIdx]: { weight: formData.weight, reps: formData.reps, rir: '' },
      },
    }));

    tapMedium();

    // Check if this was the last set of the exercise
    const exercise = exercises[exIdx];
    const setCount = exercise?.sets?.length || 0;
    const currentCompleted = Object.keys(completedSets[exIdx] || {}).length;

    if (setIdx < setCount - 1) {
      // Start rest timer
      const duration = exercise.rest_seconds || 60;
      setResting(true);
      setRestStartedAt(Date.now());
      setRestDuration(duration);
      setRestingAfterSetIdx(setIdx);
    } else if (currentCompleted + 1 >= setCount) {
      // Exercise complete - move to next
      if (exIdx < exercises.length - 1) {
        setCurrentExIdx(exIdx + 1);
        setTimeout(() => {
          currentExRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [exercises, completedSets]);

  // ── Add exercise ──────────────────────────────────────────────────────────
  const handleAddExercise = (searchResult) => {
    const newEx = searchResultToExecution(searchResult);
    setExercises((prev) => [...prev, newEx]);
    setShowAddExercise(false);
    if (exercises.length === 0) {
      setCurrentExIdx(0);
    }
  };

  // ── Add set to exercise ───────────────────────────────────────────────────
  const handleAddSet = useCallback((exIdx) => {
    setExercises((prev) => prev.map((ex, i) => {
      if (i !== exIdx) return ex;
      const newSetNum = (ex.sets?.length || 0) + 1;
      return {
        ...ex,
        sets: [
          ...(ex.sets || []),
          {
            set_number: newSetNum,
            target_reps: ex.target_reps,
            target_weight: ex.target_weight,
          },
        ],
        target_sets: newSetNum,
      };
    }));
  }, []);

  const handleSkipRest = () => {
    setResting(false);
    setRestStartedAt(null);
    setRestingAfterSetIdx(null);
  };

  const handleAdd30 = () => {
    setRestDuration((d) => d + 30);
  };

  const handleFinish = () => {
    celebrateHeavy();
    clearSession();
    window.dispatchEvent(new Event('atlas:session:change'));
    const payload = buildCompletedPayload();
    toast.success(t('workoutExecution.toastCompleted'));
    onComplete?.(payload);
    try {
      if (!localStorage.getItem('atlas_first_workout_done')) {
        localStorage.setItem('atlas_first_workout_done', '1');
        setShowWorkoutPaywall(true);
      }
    } catch { /* quota */ }
  };

  const handleCancelWorkout = () => {
    clearSession();
    window.dispatchEvent(new Event('atlas:session:change'));
    toast(t('workoutExecution.toastCancelled'));
    onCancel?.();
  };

  // ── Render: Add Exercise Panel ──────────────────────────────────────────
  if (showAddExercise) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-5 pb-8 pt-4 lg:px-8">
        <div className="atlas-card space-y-4 rounded-[22px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="atlas-overline">{t('workoutExecution.session')}</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                {t('workoutExecution.addExercise')}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--fg-2))]">
                {t('workoutExecution.searchLibrary')}
              </p>
            </div>
            {exercises.length > 0 && (
              <button
                onClick={() => setShowAddExercise(false)}
                className="shrink-0 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors pt-1"
              >
                {t('workoutExecution.cancelLabel')}
              </button>
            )}
          </div>
          <ExerciseSearch onSelect={handleAddExercise} />
        </div>
      </div>
    );
  }

  // ── Paywall after workout finish ────────────────────────────────────────
  if (showWorkoutPaywall) {
    return <PaywallSheet trigger="workout" show onClose={() => setShowWorkoutPaywall(false)} />;
  }

  // ── Render: Completion Screen ───────────────────────────────────────────
  if (isDone) {
    const totalSets = Object.values(completedSets).reduce(
      (acc, exSets) => acc + Object.keys(exSets).length, 0
    );
    const durationMin = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.14),transparent_32%),linear-gradient(180deg,hsl(var(--bg))_0%,hsl(var(--shell))_100%)] p-5">
        <div className="atlas-card flex w-full max-w-md flex-col items-center gap-6 rounded-[28px] px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.15)]">
            <Trophy className="h-8 w-8 text-[hsl(var(--ok))]" />
          </div>
          <div>
            <p className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {t('workoutExecution.completed')}
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--fg-2))]">{workout.name}</p>
          </div>
          <div className="grid w-full grid-cols-3 gap-3">
            <div className="rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                {t('workoutExecution.statsExercises')}
              </p>
              <p className="mt-1 font-mono text-[18px] font-bold text-[hsl(var(--fg))]">
                {exercises.length}
              </p>
            </div>
            <div className="rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                {t('workoutExecution.statsSets')}
              </p>
              <p className="mt-1 font-mono text-[18px] font-bold text-[hsl(var(--fg))]">{totalSets}</p>
            </div>
            <div className="rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                {t('workoutExecution.statsTime')}
              </p>
              <p className="mt-1 font-mono text-[18px] font-bold text-[hsl(var(--fg))]">{durationMin}min</p>
            </div>
          </div>
          {totalVolume > 0 && (
            <p className="text-[14px] font-medium text-[hsl(var(--fg-2))]">
              {t('workoutExecution.volume')}: <span className="font-bold text-[hsl(var(--fg))]">{Math.round(totalVolume).toLocaleString()} kg</span>
            </p>
          )}
          <div className="flex w-full gap-3">
            <Button variant="outline" className="h-12 flex-1 rounded-[12px]" onClick={() => setShowAddExercise(true)}>
              {t('workoutExecution.addMore')}
            </Button>
            <Button className="h-12 flex-1 rounded-[12px]" onClick={handleFinish}>
              {t('workoutExecution.saveAndClose')}
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ── Check if all exercises are complete ──────────────────────────────────
  const allExercisesComplete = exercises.length > 0 && exercises.every((ex, ei) => {
    const setCount = ex.sets?.length || 0;
    const doneCount = Object.keys(completedSets[ei] || {}).length;
    return doneCount >= setCount;
  });

  // Auto-trigger done screen
  useEffect(() => {
    if (allExercisesComplete && exercises.length > 0 && !isDone) {
      setIsDone(true);
    }
  }, [allExercisesComplete, exercises.length]);

  // ── Render: Main Execution Screen (Hevy/Strong style) ───────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[hsl(var(--bg))]">
      {/* ── Top sticky: session header ──────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[hsl(var(--card))] border-b border-[hsl(var(--border)/0.3)] safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: cancel */}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[hsl(var(--fill))] transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--fg-2))]" strokeWidth={2} />
          </button>

          {/* Center: workout title + timer */}
          <div className="flex flex-col items-center">
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))] truncate max-w-[200px]">
              {workout.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3 h-3 text-[hsl(var(--brand))]" strokeWidth={2} />
              <span className="text-[12px] font-mono font-medium text-[hsl(var(--brand))] tabular-nums">
                {formatElapsed(elapsedMs)}
              </span>
            </div>
          </div>

          {/* Right: finish */}
          <Button
            size="sm"
            className="rounded-full h-9 px-4 text-[12px] font-semibold"
            onClick={() => setIsDone(true)}
          >
            {t('workoutExecution.finishWorkout')}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[hsl(var(--border)/0.2)]">
          <div
            className="h-full bg-[hsl(var(--brand))] transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* ── Scrollable exercise list ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4 pb-32">
          {/* Stats bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-[hsl(var(--fg-3))]">
                {totalSavedSets} {t('workoutExecution.statsSets').toLowerCase()}
              </span>
              {totalVolume > 0 && (
                <span className="text-[12px] text-[hsl(var(--fg-3))]">
                  {Math.round(totalVolume).toLocaleString()} kg
                </span>
              )}
            </div>
            <span className="text-[12px] font-medium text-[hsl(var(--brand))]">
              {completionPct}%
            </span>
          </div>

          {/* Exercise blocks */}
          {exercises.map((ex, ei) => (
            <ExerciseBlock
              key={ei}
              exercise={ex}
              exerciseIdx={ei}
              isActive={ei <= currentExIdx}
              isCurrent={ei === currentExIdx}
              completedSets={completedSets[ei] || {}}
              lastSession={lastSessions[ei]}
              allCompletedSets={completedSets}
              workoutHistory={workoutHistory}
              personalRecords={personalRecords}
              resting={resting && ei === currentExIdx}
              restRemaining={restRemaining}
              restDuration={restDuration}
              restingAfterSetIdx={restingAfterSetIdx}
              onSetComplete={handleSetComplete}
              onSkipRest={handleSkipRest}
              onAdd30={handleAdd30}
              onAddSet={handleAddSet}
              onScrollRef={currentExRef}
              t={t}
            />
          ))}

          {/* Next exercise preview */}
          {currentExIdx < exercises.length - 1 && (
            <div className="rounded-2xl border border-dashed border-[hsl(var(--border)/0.3)] bg-[hsl(var(--fill)/0.2)] p-4">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
                <div>
                  <p className="text-[10px] font-semibold text-[hsl(var(--fg-3))] uppercase tracking-wide">
                    {t('workoutExecution.upNext')}
                  </p>
                  <p className="text-[14px] font-medium text-[hsl(var(--fg-2))] mt-0.5">
                    {exercises[currentExIdx + 1]?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add exercise */}
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-[hsl(var(--border)/0.3)] text-[13px] font-semibold text-[hsl(var(--fg-3))] hover:text-[hsl(var(--brand))] hover:border-[hsl(var(--brand)/0.3)] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            {t('workoutExecution.addExercise')}
          </button>
        </div>
      </div>

      {/* ── Bottom sticky: Finish CTA ───────────────────────────────────── */}
      <div className="sticky bottom-0 z-20 bg-[hsl(var(--card)/0.95)] backdrop-blur-md border-t border-[hsl(var(--border)/0.2)] safe-area-bottom">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Button
            className="w-full h-[52px] rounded-2xl text-[15px] font-semibold shadow-[0_4px_16px_hsl(var(--brand)/0.25)]"
            onClick={() => setIsDone(true)}
          >
            <Check className="w-5 h-5 mr-1" strokeWidth={2.5} />
            {t('workoutExecution.finishWorkout')}
          </Button>
        </div>
      </div>

      {/* Audio for rest timer */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
      />

      {/* Cancel confirmation */}
      {showCancelConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative w-full max-w-[320px] rounded-[24px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-6 py-6 shadow-[var(--shadow-lg)]">
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {t('workoutExecution.cancelWorkoutTitle')}
            </h3>
            <p className="mt-2 text-[13px] leading-5 text-[hsl(var(--fg-2))]">
              {t('workoutExecution.cancelWorkoutDesc')}
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-[12px]"
                onClick={() => setShowCancelConfirm(false)}
              >
                {t('workoutExecution.keepGoing')}
              </Button>
              <Button
                className="h-11 flex-1 rounded-[12px] bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err)/0.9)]"
                onClick={handleCancelWorkout}
              >
                {t('workoutExecution.cancelWorkout')}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
