import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowRight, Clock, Play, Plus, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getWorkoutMethodLabel } from '@/lib/workoutMethods';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import { toast } from 'sonner';
import { getLastSession, checkSetIsPR } from '@/services/workoutHistoryService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert an ExerciseSearch.onSelect result → execution-ready exercise object.
 * ExerciseSearch returns { name, primary_muscles, default_set_range,
 *   default_rep_range, default_rest_seconds, media_gif_url, exercise_master_id }
 */
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

export default function WorkoutExecutionScreen({ workout, onComplete, workoutHistory = [], personalRecords = {} }) {
  // Local exercises list — starts from workout.exercises, user can extend it
  const [exercises, setExercises] = useState(() => workout.exercises || []);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [formData, setFormData] = useState({ weight: '', reps: '', rir: '' });
  const [completedSets, setCompletedSets] = useState({});
  // showAddExercise is true when no exercises exist (free-form) or user clicks +
  const [showAddExercise, setShowAddExercise] = useState(
    () => (workout.exercises || []).length === 0
  );
  const [isDone, setIsDone] = useState(false);
  // PR flash: exerciseIdx when a PR was just set (cleared after 3s)
  const [prFlash, setPrFlash] = useState(null);

  const audioRef = useRef(null);
  const startedAt = useRef(Date.now());

  const exercise = exercises[exerciseIdx];
  const sets = exercise?.sets || [];
  const currentSet = sets?.[setIdx];
  const completionRatio = exercises.length
    ? ((exerciseIdx + setIdx / Math.max(sets.length, 1)) / exercises.length) * 100
    : 0;

  // ── Last-session context for current exercise ──────────────────────────────
  const lastSession = useMemo(
    () => (exercise ? getLastSession(workoutHistory, exercise.name) : null),
    [workoutHistory, exercise?.name]
  );

  // ── Live PR check — re-evaluate whenever weight/reps inputs change ─────────
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

  // ── Rest countdown timer ──────────────────────────────────────────────────

  useEffect(() => {
    if (!resting || restTime > 0) return;
    setResting(false);
  }, [resting, restTime]);

  useEffect(() => {
    if (!resting || restTime <= 0) return;
    const timer = setTimeout(() => {
      setRestTime((value) => {
        if (value <= 1) {
          if (audioRef.current) audioRef.current.play().catch(() => {});
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [resting, restTime]);

  // ── Set/exercise recording ────────────────────────────────────────────────

  const recordSet = (exIdx, stIdx, data) => {
    setCompletedSets((prev) => ({
      ...prev,
      [exIdx]: { ...(prev[exIdx] || {}), [stIdx]: data },
    }));
  };

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

    if (wasDone) {
      // Resume execution at the newly added exercise
      setExerciseIdx(prevCount);
      setSetIdx(0);
      setFormData({ weight: '', reps: '', rir: '' });
      setResting(false);
      setIsDone(false);
    } else if (prevCount === 0) {
      setExerciseIdx(0);
    }
  };

  // ── Exercise/set progression ──────────────────────────────────────────────

  const handleExerciseComplete = () => {
    setResting(false);
    if (exerciseIdx < exercises.length - 1) {
      setExerciseIdx((i) => i + 1);
      setSetIdx(0);
      setFormData({ weight: '', reps: '', rir: '' });
      return;
    }
    // All exercises done → show completion screen
    setIsDone(true);
  };

  const handleSetComplete = () => {
    if (formData.weight || formData.reps || formData.rir) {
      recordSet(exerciseIdx, setIdx, { ...formData });
      // Fire PR flash if this set broke a record
      if (livePR) {
        setPrFlash(exerciseIdx);
        setTimeout(() => setPrFlash(null), 3000);
      }
    }
    if (setIdx < sets.length - 1) {
      setSetIdx((i) => i + 1);
      setFormData({ weight: '', reps: '', rir: '' });
      setResting(true);
      setRestTime(exercise.rest_seconds || 60);
      return;
    }
    handleExerciseComplete();
  };

  const handleFinish = () => {
    const payload = buildCompletedPayload();
    toast.success('Workout completed and saved! 💪');
    onComplete?.(payload);
  };

  // ── Render: Add Exercise Panel ────────────────────────────────────────────
  // Checked first so it takes priority over done/rest/execution views

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

    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.14),transparent_32%),linear-gradient(180deg,hsl(var(--bg))_0%,hsl(var(--shell))_100%)] p-5">
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
      </div>
    );
  }

  // ── Render: Rest Screen ───────────────────────────────────────────────────

  if (resting) {
    return (
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.1),transparent_40%),hsl(var(--bg))] p-5">
        <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
          <div className="space-y-2">
            <p className="atlas-overline">Rest</p>
            <p className="text-sm text-[hsl(var(--fg-2))]">
              Next set: {exercise.name} (Set {setIdx + 1})
            </p>
          </div>
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="hsl(var(--border)/0.4)"
                strokeWidth="6"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="hsl(var(--brand))"
                strokeWidth="6"
                strokeDasharray={552}
                strokeDashoffset={552 - (552 * restTime) / (exercise.rest_seconds || 60)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="font-mono text-[4rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">
              {formatRestCountdown(restTime)}
            </span>
          </div>
          <div className="flex w-full gap-3">
            <Button variant="outline" className="h-12 flex-1 rounded-[12px]" onClick={() => setRestTime((v) => v + 30)}>
              +30s
            </Button>
            <Button
              className="h-12 flex-1 rounded-[12px]"
              onClick={() => {
                setRestTime(0);
                setResting(false);
              }}
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
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
            <span className="font-mono text-[11px] font-bold text-[hsl(var(--fg-3))]">
              {Math.round(completionRatio)}%
            </span>
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

      {/* Last-session context — shows what the user did last time */}
      {lastSession && (
        <div className="flex items-center gap-2.5 rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
          <span className="text-[12px] text-[hsl(var(--fg-2))]">
            Last time:
            {' '}
            <span className="font-semibold text-[hsl(var(--fg))]">
              {lastSession.setCount}×{lastSession.maxWeight > 0 ? ` ${lastSession.maxWeight}kg` : ''}
              {lastSession.avgReps > 0 ? ` · ${lastSession.avgReps} reps` : ''}
            </span>
            <span className="ml-1.5 text-[hsl(var(--fg-3))]">
              {new Date(lastSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </span>
        </div>
      )}

      {/* Set logging form */}
      <section className={`atlas-card rounded-[22px] p-5 sm:p-6 transition-all duration-300 ${prFlash === exerciseIdx ? 'border-[hsl(var(--ok)/0.7)] bg-[hsl(var(--ok)/0.04)]' : 'border-[hsl(var(--border)/0.92)]'}`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="atlas-overline">
                Log set {setIdx + 1}/{sets.length}
              </p>
            </div>
            {/* Live PR badge — shown when current inputs would be a PR */}
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
              onChange={(value) => setFormData((prev) => ({ ...prev, weight: value }))}
            />
            <FieldInput
              label="Reps"
              value={formData.reps}
              placeholder="0"
              onChange={(value) => setFormData((prev) => ({ ...prev, reps: value }))}
            />
            <FieldInput
              label="RIR"
              value={formData.rir}
              placeholder="0"
              onChange={(value) => setFormData((prev) => ({ ...prev, rir: value }))}
            />
          </div>
          <Button className="h-12 w-full rounded-[12px] sm:w-auto" onClick={handleSetComplete}>
            {setIdx < sets.length - 1 ? 'Save and next set' : 'Finish exercise'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Logged sets history for the current exercise */}
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

      {/* Add another exercise (always available during execution) */}
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
