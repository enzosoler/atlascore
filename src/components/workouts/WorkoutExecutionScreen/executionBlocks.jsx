import React, { useState, useRef, useEffect } from 'react';
import { Check, Clock, Plus, Trophy, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseMedia from '@/components/exercises/ExerciseMedia.jsx';
import { checkSetIsPR } from '@/services/workoutHistoryService';

// ─── Set suggestion engine ────────────────────────────────────────────────────

export function computeSetSuggestion({ exercise, setIdx, exerciseIdx, completedSets, lastSession }) {
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

export function searchResultToExecution(ex) {
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

export function formatRestCountdown(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function formatElapsed(ms) {
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

function SetRow({ setNumber, previousDisplay, weight, reps, onWeightChange, onRepsChange, onComplete, isCompleted, isPR }) {
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

export function ExerciseBlock({
  exercise,
  exerciseIdx,
  isCurrent,
  completedSets,
  lastSession,
  allCompletedSets,
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
                {t('workoutExecution.restBadge', { seconds: exercise.rest_seconds })}
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
