import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Clock, Play, Plus, Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getWorkoutMethodLabel } from '@/lib/workoutMethods';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import { toast } from 'sonner';
import { getLastSession, checkSetIsPR } from '@/services/workoutHistoryService';
import { saveSession, clearSession } from '@/lib/workoutSession';

// ─── Set suggestion engine ────────────────────────────────────────────────────

/**
 * Compute the pre-fill suggestion for weight/reps based on history.
 *
 * Priority:
 *   1. Last completed session for the same exercise (with progressive overload)
 *   2. Last completed set in the current session
 *   3. Program target weight / rep range
 *   4. Empty
 *
 * Returns { weight, reps, rir, source, label, lastDisplay }
 */
function computeSetSuggestion({ exercise, setIdx, exerciseIdx, completedSets, lastSession }) {
  const none = { weight: '', reps: '', rir: '', source: null, label: null, lastDisplay: null };
  if (!exercise) return none;

  // Parse a rep range string ("6-8", "10", "8–12") into { min, max }
  function parseReps(str) {
    const s = String(str || '');
    const range = s.match(/^(\d+)[-–](\d+)$/);
    if (range) return { min: parseInt(range[1]), max: parseInt(range[2]) };
    const single = s.match(/^(\d+)/);
    if (single) { const n = parseInt(single[1]); return { min: n, max: n }; }
    return null;
  }

  // ── 1. Last session ────────────────────────────────────────────────────────
  if (lastSession?.sets?.length > 0) {
    const histSet = lastSession.sets[Math.min(setIdx, lastSession.sets.length - 1)];
    if (histSet && (histSet.load > 0 || histSet.reps > 0)) {
      const target = parseReps(exercise.target_reps);
      let sugWeight = histSet.load > 0 ? histSet.load : null;
      let sugReps   = histSet.reps > 0 ? histSet.reps : (target?.max ?? null);
      let label     = 'Based on last session';

      if (sugWeight !== null && target) {
        if (histSet.reps >= target.max) {
          // Met or beat max reps — progressive overload: +2.5kg, back to target min
          sugWeight = Math.round((sugWeight + 2.5) * 4) / 4;
          sugReps   = target.min;
          label     = 'Progressive overload';
        } else if (histSet.reps < target.min) {
          // Missed target — keep weight, aim for target min
          sugReps = target.min;
        }
        // else: within range — repeat same weight/reps
      }

      const lastDisplay = [
        histSet.load > 0 ? `${histSet.load}kg` : null,
        histSet.reps > 0 ? `${histSet.reps}` : null,
      ].filter(Boolean).join(' × ');

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

  // ── 2. Previous set in current session ────────────────────────────────────
  if (setIdx > 0) {
    const prev = completedSets[exerciseIdx]?.[setIdx - 1];
    if (prev && (prev.weight || prev.reps)) {
      return {
        weight: prev.weight || '',
        reps:   prev.reps   || '',
        rir: '',
        source: 'previous_set',
        label: 'Based on previous set',
        lastDisplay: null,
      };
    }
  }

  // ── 3. Plan target ─────────────────────────────────────────────────────────
  const tw = exercise.target_weight;
  const repsMatch = String(exercise.target_reps || '').match(/^(\d+)/);
  const tr = repsMatch ? repsMatch[1] : '';
  if (tw || tr) {
    return {
      weight: tw ? String(tw) : '',
      reps:   tr,
      rir: '',
      source: 'target',
      label: 'Target from plan',
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricTile({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-[16px] border px-4 py-3 ${
        accent
          ? 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)]'
          : 'border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.76)_0%,hsl(var(--card))_100%)]'
      }`}
    >
      <p className="atlas-overline">{label}</p>
      <p className="mt-2 font-mono text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-[hsl(var(--fg))]">{label}</label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="atlas-field h-14 rounded-[12px] border-0 text-center text-base font-medium"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkoutExecutionScreen({
  workout,
  initialSession = null,
  onComplete,
  workoutHistory = [],
  personalRecords = {},
}) {
  const { locale } = useI18n();

  // All state initialised from saved session if provided
  const [exercises, setExercises] = useState(
    () => initialSession?.exercises || workout.exercises || []
  );
  const [exerciseIdx, setExerciseIdx] = useState(() => initialSession?.exerciseIdx ?? 0);
  const [setIdx, setSetIdx] = useState(() => initialSession?.setIdx ?? 0);
  const [resting, setResting] = useState(() => initialSession?.resting ?? false);
  // Timestamp-based rest: store when rest started + total duration
  const [restStartedAt, setRestStartedAt] = useState(() => initialSession?.restStartedAt ?? null);
  const [restDuration, setRestDuration] = useState(() => initialSession?.restDuration ?? 0);
  const [formData, setFormData] = useState(() => initialSession?.formData ?? { weight: '', reps: '', rir: '' });
  const [completedSets, setCompletedSets] = useState(() => initialSession?.completedSets ?? {});
  const [suggestionMeta, setSuggestionMeta] = useState(null);
  const [showAddExercise, setShowAddExercise] = useState(
    () => (initialSession?.exercises ?? workout.exercises ?? []).length === 0
  );
  const [isDone, setIsDone] = useState(false);
  const [prFlash, setPrFlash] = useState(null);
  // Tick counter — increments twice/sec to drive re-renders for the live countdown
  const [, forceUpdate] = useState(0);

  const audioRef = useRef(null);
  const startedAt = useRef(initialSession?.startedAt ?? Date.now());

  // ── Computed rest remaining (derived — not stored) ────────────────────────
  const restRemaining = resting && restStartedAt
    ? Math.max(0, restDuration - Math.floor((Date.now() - restStartedAt) / 1000))
    : 0;

  const exercise = exercises[exerciseIdx];
  const sets = exercise?.sets || [];
  const currentSet = sets?.[setIdx];
  const completionRatio = exercises.length
    ? ((exerciseIdx + setIdx / Math.max(sets.length, 1)) / exercises.length) * 100
    : 0;
  const totalSavedSets = Object.values(completedSets).reduce(
    (acc, ex) => acc + Object.keys(ex).length,
    0
  );

  // ── Last-session context ──────────────────────────────────────────────────
  const lastSession = useMemo(
    () => (exercise ? getLastSession(workoutHistory, exercise.name) : null),
    [workoutHistory, exercise?.name]
  );

  // ── Current suggestion (for UI display) ──────────────────────────────────
  const currentSuggestion = useMemo(
    () => computeSetSuggestion({ exercise, setIdx, exerciseIdx, completedSets, lastSession }),
    [exercise, setIdx, exerciseIdx, completedSets, lastSession]
  );

  // ── Auto-fill on history load (fires when lastSession resolves from null) ─
  useEffect(() => {
    if (!exercise) return;
    setFormData((prev) => {
      if (prev.weight || prev.reps) return prev; // preserve user/session values
      const s = computeSetSuggestion({ exercise, setIdx, exerciseIdx, completedSets, lastSession });
      if (!s.source) return prev;
      setSuggestionMeta({ source: s.source, label: s.label, lastDisplay: s.lastDisplay });
      return { weight: s.weight, reps: s.reps, rir: prev.rir || '' };
    });
  }, [lastSession]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live PR check ─────────────────────────────────────────────────────────
  const livePR = useMemo(() => {
    if (!exercise || !formData.weight || !formData.reps) return null;
    const { isPR, type } = checkSetIsPR(
      personalRecords,
      exercise.name,
      Number(formData.weight),
      Number(formData.reps)
    );
    return isPR ? type : null;
  }, [personalRecords, exercise?.name, formData.weight, formData.reps]);

  // ── Timer: tick twice/sec while resting ──────────────────────────────────
  useEffect(() => {
    if (!resting || !restStartedAt) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 500);
    return () => clearInterval(interval);
  }, [resting, restStartedAt]);

  // ── Auto-stop rest when timer hits 0 ─────────────────────────────────────
  useEffect(() => {
    if (resting && restRemaining === 0 && restStartedAt) {
      if (audioRef.current) audioRef.current.play().catch(() => {});
      setResting(false);
      setRestStartedAt(null);
    }
  }, [resting, restRemaining, restStartedAt]);

  // ── Persist session to localStorage on every meaningful change ───────────
  useEffect(() => {
    if (isDone) return;
    saveSession({
      workout,
      exercises,
      exerciseIdx,
      setIdx,
      completedSets,
      formData,
      resting,
      restStartedAt,
      restDuration,
      startedAt: startedAt.current,
    });
    window.dispatchEvent(new Event('atlas:session:change'));
  }, [exercises, exerciseIdx, setIdx, completedSets, formData, resting, restStartedAt, restDuration, isDone]);

  // ── Payload builder ───────────────────────────────────────────────────────
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

  // ── Add exercise from search ──────────────────────────────────────────────
  const handleAddExercise = (searchResult) => {
    const newEx = searchResultToExecution(searchResult);
    const prevCount = exercises.length;
    const wasDone = isDone;

    setExercises((prev) => [...prev, newEx]);
    setShowAddExercise(false);

    if (wasDone || prevCount === 0) {
      const nextExIdx  = wasDone ? prevCount : 0;
      const nextLast   = getLastSession(workoutHistory, newEx.name);
      const s = computeSetSuggestion({ exercise: newEx, setIdx: 0, exerciseIdx: nextExIdx, completedSets, lastSession: nextLast });
      setExerciseIdx(nextExIdx);
      setSetIdx(0);
      setFormData({ weight: s.weight, reps: s.reps, rir: '' });
      setSuggestionMeta(s.source ? { source: s.source, label: s.label, lastDisplay: s.lastDisplay } : null);
      if (wasDone) {
        setResting(false);
        setRestStartedAt(null);
        setIsDone(false);
      }
    }
  };

  // ── Exercise/set progression ──────────────────────────────────────────────
  const handleExerciseComplete = (latestCompletedSets) => {
    const cs = latestCompletedSets ?? completedSets;
    setResting(false);
    setRestStartedAt(null);
    if (exerciseIdx < exercises.length - 1) {
      const nextExIdx = exerciseIdx + 1;
      const nextEx    = exercises[nextExIdx];
      const nextLast  = getLastSession(workoutHistory, nextEx.name);
      const s = computeSetSuggestion({ exercise: nextEx, setIdx: 0, exerciseIdx: nextExIdx, completedSets: cs, lastSession: nextLast });
      setExerciseIdx(nextExIdx);
      setSetIdx(0);
      setFormData({ weight: s.weight, reps: s.reps, rir: '' });
      setSuggestionMeta(s.source ? { source: s.source, label: s.label, lastDisplay: s.lastDisplay } : null);
      return;
    }
    setIsDone(true);
  };

  const handleSetComplete = () => {
    // Build the updated completedSets synchronously so suggestion can read it
    const hasData = formData.weight || formData.reps || formData.rir;
    const nextCompletedSets = hasData
      ? { ...completedSets, [exerciseIdx]: { ...(completedSets[exerciseIdx] || {}), [setIdx]: { ...formData } } }
      : completedSets;

    if (hasData) {
      setCompletedSets(nextCompletedSets);
      if (livePR) {
        setPrFlash(exerciseIdx);
        setTimeout(() => setPrFlash(null), 3000);
      }
    }

    if (setIdx < sets.length - 1) {
      const nextSetIdx = setIdx + 1;
      const s = computeSetSuggestion({ exercise, setIdx: nextSetIdx, exerciseIdx, completedSets: nextCompletedSets, lastSession });
      setSetIdx(nextSetIdx);
      setFormData({ weight: s.weight, reps: s.reps, rir: '' });
      setSuggestionMeta(s.source ? { source: s.source, label: s.label, lastDisplay: s.lastDisplay } : null);
      const duration = exercise.rest_seconds || 60;
      setResting(true);
      setRestStartedAt(Date.now());
      setRestDuration(duration);
      return;
    }
    handleExerciseComplete(nextCompletedSets);
  };

  const handleSkipRest = () => {
    setResting(false);
    setRestStartedAt(null);
  };

  const handleFinish = () => {
    clearSession();
    window.dispatchEvent(new Event('atlas:session:change'));
    const payload = buildCompletedPayload();
    toast.success('Workout completed and saved! 💪');
    onComplete?.(payload);
  };

  // ── Render: Add Exercise Panel ────────────────────────────────────────────
  if (showAddExercise) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-5 pb-8 pt-4 lg:px-8">
        <div className="atlas-card space-y-4 rounded-[22px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="atlas-overline">Session</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                Add exercise
              </h2>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Search the library or add manually.
              </p>
            </div>
            {exercises.length > 0 && (
              <button
                onClick={() => setShowAddExercise(false)}
                className="shrink-0 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors pt-1"
              >
                ← Cancel
              </button>
            )}
          </div>
          <ExerciseSearch onSelect={handleAddExercise} />
        </div>
      </div>
    );
  }

  // ── Render: Completion Screen ─────────────────────────────────────────────
  if (isDone) {
    const totalSets = Object.values(completedSets).reduce(
      (acc, exSets) => acc + Object.keys(exSets).length,
      0
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
              Workout Completed!
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--fg-2))]">{workout.name}</p>
          </div>
          <div className="grid w-full grid-cols-3 gap-3">
            <div className="rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                Exercises
              </p>
              <p className="mt-1 font-mono text-[18px] font-bold text-[hsl(var(--fg))]">
                {exercises.length}
              </p>
            </div>
            <div className="rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                Sets
              </p>
              <p className="mt-1 font-mono text-[18px] font-bold text-[hsl(var(--fg))]">{totalSets}</p>
            </div>
            <div className="rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                Time
              </p>
              <p className="mt-1 font-mono text-[18px] font-bold text-[hsl(var(--fg))]">{durationMin}min</p>
            </div>
          </div>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="h-12 flex-1 rounded-[12px]" onClick={() => setShowAddExercise(true)}>
              Add more
            </Button>
            <Button className="h-12 flex-1 rounded-[12px]" onClick={handleFinish}>
              Save and close
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ── Render: Rest Screen ───────────────────────────────────────────────────
  if (resting) {
    const R = 110;
    const CIRC = 2 * Math.PI * R;
    const pct = restDuration > 0 ? restRemaining / restDuration : 0;
    const urgent = restRemaining > 0 && restRemaining <= 5;

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_30%,hsl(var(--brand)/0.14),transparent_55%),hsl(var(--bg))]">

        {/* Context header */}
        <div className="flex flex-col items-center gap-2.5 px-8 mb-10 text-center">
          <span className="inline-flex items-center rounded-full border border-[hsl(var(--brand)/0.28)] bg-[hsl(var(--brand)/0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">
            Rest
          </span>
          <p className="text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {exercise.name}
            <span className="ml-2 text-[15px] font-normal text-[hsl(var(--fg-3))]">Set {setIdx + 1}</span>
          </p>
          {(formData.weight || formData.reps) && (
            <p className="text-[14px] font-medium text-[hsl(var(--fg-2))]">
              {[formData.weight && `${formData.weight} kg`, formData.reps && `${formData.reps} reps`].filter(Boolean).join(' × ')}
              {suggestionMeta?.label && (
                <span className="ml-2 text-[13px] text-[hsl(var(--fg-3))]">· {suggestionMeta.label}</span>
              )}
            </p>
          )}
        </div>

        {/* Timer ring */}
        <div className="relative flex h-[260px] w-[260px] items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 260 260"
          >
            <defs>
              <linearGradient id="restArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.45" />
                <stop offset="100%" stopColor="hsl(var(--brand))" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="130" cy="130" r={R}
              fill="none"
              stroke="hsl(var(--border)/0.2)"
              strokeWidth="10"
            />
            {/* Progress arc */}
            <circle
              cx="130" cy="130" r={R}
              fill="none"
              stroke={urgent ? 'hsl(var(--warn))' : 'url(#restArcGrad)'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - CIRC * pct}
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <div className="flex flex-col items-center gap-3">
            <span
              className={`text-[5.25rem] font-bold tabular-nums leading-none tracking-[-0.08em] transition-colors duration-300 ${
                urgent ? 'text-[hsl(var(--warn))]' : 'text-[hsl(var(--fg))]'
              }`}
            >
              {formatRestCountdown(restRemaining)}
            </span>
            <button
              onClick={() => setRestDuration((d) => d + 30)}
              className="rounded-full border border-[hsl(var(--border)/0.55)] bg-[hsl(var(--fill)/0.5)] px-3.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
            >
              +30s
            </button>
          </div>
        </div>

        {/* Skip CTA */}
        <div className="mt-10 w-full max-w-[280px] px-4">
          <Button
            className="h-14 w-full rounded-[16px] text-[15px] font-semibold tracking-[-0.01em]"
            onClick={handleSkipRest}
          >
            Skip Rest
          </Button>
        </div>

      </div>,
      document.body
    );
  }

  // ── Render: Execution Screen ──────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-4 lg:px-8">
      <div className="sticky top-0 z-10 -mx-5 bg-[hsl(var(--bg)/0.8)] px-5 py-3 backdrop-blur-md lg:-mx-8 lg:px-8">
        <div className="atlas-card rounded-[18px] px-4 py-3">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="atlas-overline">{workout.name}</p>
              <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                Workout in progress
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[11px] font-bold text-[hsl(var(--fg-3))]">
                {Math.round(completionRatio)}%
              </span>
              {totalSavedSets > 0 && (
                <span className="text-[10px] font-semibold text-[hsl(var(--ok))]">
                  {totalSavedSets} {totalSavedSets === 1 ? 'set' : 'sets'} saved
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--border)/0.5)]">
              <div
                className="h-full bg-[hsl(var(--brand))] transition-all duration-500"
                style={{ width: `${completionRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="atlas-overline">
              Exercise {exerciseIdx + 1} of {exercises.length}
            </p>
            <h1 className="text-[1.6rem] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {exercise.name}
            </h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {exercise.primary_muscles?.map((muscle) => (
              <span key={muscle} className="badge badge-blue text-[11px]">
                {muscle}
              </span>
            ))}
            {exercise.technique ? (
              <span className="badge badge-ai text-[11px]">
                {getWorkoutMethodLabel(exercise.technique)}
              </span>
            ) : null}
            {exercise.rest_seconds ? (
              <span className="badge badge-neutral text-[11px]">
                {exercise.rest_seconds}s rest
              </span>
            ) : null}
          </div>

          {exercise.execution_notes ? (
            <p className="text-sm leading-6 text-[hsl(var(--fg-2))]">
              {exercise.execution_notes}
            </p>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <MetricTile
              label="Target reps"
              value={currentSet?.target_reps ?? exercise.target_reps ?? '—'}
              accent
            />
            <MetricTile
              label="Target load"
              value={
                (currentSet?.target_weight ?? exercise.target_weight)
                  ? `${currentSet?.target_weight ?? exercise.target_weight} kg`
                  : '—'
              }
            />
            <MetricTile
              label="Sets"
              value={currentSet?.target_sets ?? exercise.target_sets ?? '—'}
            />
          </div>
        </div>
      </section>

      {lastSession && (
        <div className="flex items-center gap-2.5 rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
          <span className="text-[12px] text-[hsl(var(--fg-2))]">
            {currentSuggestion?.lastDisplay ? (
              <>
                <span>Last: </span>
                <span className="font-semibold text-[hsl(var(--fg))]">{currentSuggestion.lastDisplay}</span>
                {currentSuggestion.label === 'Progressive overload' && currentSuggestion.weight && (
                  <>
                    <span className="mx-1.5 text-[hsl(var(--fg-3))]">→</span>
                    <span className="font-semibold text-[hsl(var(--brand))]">
                      {currentSuggestion.weight}kg × {currentSuggestion.reps}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span>Last: </span>
                <span className="font-semibold text-[hsl(var(--fg))]">
                  {lastSession.setCount}×{lastSession.maxWeight > 0 ? ` ${lastSession.maxWeight}kg` : ''}
                  {lastSession.avgReps > 0 ? ` · ${lastSession.avgReps} reps` : ''}
                </span>
              </>
            )}
            <span className="ml-1.5 text-[hsl(var(--fg-3))]">
              {new Date(lastSession.date).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric' })}
            </span>
          </span>
        </div>
      )}

      <section className={`atlas-card rounded-[22px] p-5 sm:p-6 transition-all duration-300 ${prFlash === exerciseIdx ? 'border-[hsl(var(--ok)/0.7)] bg-[hsl(var(--ok)/0.04)]' : 'border-[hsl(var(--border)/0.92)]'}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="atlas-overline">
                Log set {setIdx + 1}/{sets.length}
              </p>
            </div>
            {livePR && (
              <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--ok)/0.12)] border border-[hsl(var(--ok)/0.3)] px-2.5 py-1">
                <Trophy className="h-3 w-3 text-[hsl(var(--ok))]" strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--ok))]">
                  {livePR === 'weight' ? 'New weight PR!' : 'New volume PR!'}
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FieldInput
              label="Weight (kg)"
              value={formData.weight}
              placeholder="0"
              onChange={(value) => { setSuggestionMeta(null); setFormData((prev) => ({ ...prev, weight: value })); }}
            />
            <FieldInput
              label="Reps"
              value={formData.reps}
              placeholder="0"
              onChange={(value) => { setSuggestionMeta(null); setFormData((prev) => ({ ...prev, reps: value })); }}
            />
            <FieldInput
              label="RIR"
              value={formData.rir}
              placeholder="0"
              onChange={(value) => setFormData((prev) => ({ ...prev, rir: value }))}
            />
          </div>
          {suggestionMeta?.label && (
            <p className="text-[11px] font-medium text-[hsl(var(--brand)/0.8)]">
              ✦ {suggestionMeta.label}
            </p>
          )}
          <Button className="h-12 w-full rounded-[12px] sm:w-auto" onClick={handleSetComplete}>
            {setIdx < sets.length - 1 ? 'Save and next set' : 'Finish exercise'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {Object.keys(completedSets[exerciseIdx] || {}).length > 0 ? (
        <section className="atlas-card rounded-[22px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
          <div className="space-y-3">
            <div>
              <p className="atlas-overline">Immediate history</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Summary of sets already logged for the current exercise.
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(completedSets[exerciseIdx]).map(([si, data]) => (
                <div
                  key={si}
                  className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.68)_0%,hsl(var(--card))_100%)] px-4 py-3 text-[13px] text-[hsl(var(--fg-2))]"
                >
                  <span className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--fg))]">
                    Set {Number(si) + 1}
                  </span>
                  {data.weight ? <span>{data.weight} kg</span> : null}
                  {data.reps ? <span>{data.reps} reps</span> : null}
                  {data.rir != null && data.rir !== '' ? <span>RIR {data.rir}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="flex justify-center pb-2">
        <button
          onClick={() => setShowAddExercise(true)}
          className="flex items-center gap-1.5 rounded-[12px] px-4 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--shell))] hover:text-[hsl(var(--fg))]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add exercise
        </button>
      </div>

      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
      />
    </div>
  );
}
