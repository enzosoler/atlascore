import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, Clock, Plus, Trophy, X } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { tapMedium, celebrateHeavy } from '@/lib/haptics';
import { PaywallSheet } from '@/components/entitlements/PaywallTrigger';
import { Button } from '@/components/ui/button';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import { toast } from 'sonner';
import { getLastSession } from '@/services/workoutHistoryService';
import { saveSession, clearSession } from '@/lib/workoutSession';
import { ExerciseBlock, formatElapsed, searchResultToExecution } from './WorkoutExecutionScreen/executionBlocks.jsx';

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
        exercise_master_id: ex.exercise_master_id || null,
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

  // Keep hook order stable even when the screen swaps between
  // add-exercise, paywall, completion, and main execution states.
  const allExercisesComplete = exercises.length > 0 && exercises.every((ex, ei) => {
    const setCount = ex.sets?.length || 0;
    const doneCount = Object.keys(completedSets[ei] || {}).length;
    return doneCount >= setCount;
  });

  useEffect(() => {
    if (allExercisesComplete && exercises.length > 0 && !isDone) {
      setIsDone(true);
    }
  }, [allExercisesComplete, exercises.length, isDone]);

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
              {t('workoutExecution.volume')}: <span className="font-bold text-[hsl(var(--fg))]">{Math.round(totalVolume).toLocaleString(locale)} kg</span>
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
                  {Math.round(totalVolume).toLocaleString(locale)} kg
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
              isCurrent={ei === currentExIdx}
              completedSets={completedSets[ei] || {}}
              lastSession={lastSessions[ei]}
              allCompletedSets={completedSets}
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
