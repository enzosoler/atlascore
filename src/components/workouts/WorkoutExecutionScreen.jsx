import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, CheckCircle2, Play } from 'lucide-react';
import { getWorkoutMethodLabel } from '@/lib/workoutMethods';

/**
 * WorkoutExecutionScreen — One exercise at a time, super focused.
 *
 * Tracks completed set data and returns it via onComplete({ exercises_completed }).
 * The parent is responsible for persisting the session to the database.
 */
export default function WorkoutExecutionScreen({ workout, onComplete }) {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [formData, setFormData] = useState({ weight: '', reps: '', rir: '' });

  // completedSets: { [exerciseIdx]: { [setIdx]: { weight, reps, rir } } }
  const [completedSets, setCompletedSets] = useState({});

  const audioRef = useRef(null);

  const exercise = workout.exercises?.[exerciseIdx];
  const sets = exercise?.sets || [];
  const currentSet = sets?.[setIdx];

  // Rest timer
  useEffect(() => {
    if (!resting || restTime <= 0) return;
    const timer = setInterval(() => {
      setRestTime((t) => {
        if (t <= 1) {
          if (audioRef.current) audioRef.current.play().catch(() => {});
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resting, restTime]);

  // ── Persist a completed set into local state ──────────────────────────────

  const recordSet = (exIdx, sIdx, data) => {
    setCompletedSets((prev) => ({
      ...prev,
      [exIdx]: {
        ...(prev[exIdx] || {}),
        [sIdx]: data,
      },
    }));
  };

  // ── Build the final completed-exercises payload ───────────────────────────

  const buildCompletedPayload = () => {
    const exercises_completed = (workout.exercises || []).map((ex, eIdx) => {
      const setsData = completedSets[eIdx] || {};
      const sets_completed = (ex.sets || []).map((s, sIdx) => ({
        set_number: sIdx + 1,
        target_reps: s.target_reps ?? ex.target_reps,
        target_weight: s.target_weight ?? ex.target_weight,
        reps_actual: setsData[sIdx]?.reps ? Number(setsData[sIdx].reps) : null,
        load_actual: setsData[sIdx]?.weight ? Number(setsData[sIdx].weight) : null,
        rir: setsData[sIdx]?.rir ? Number(setsData[sIdx].rir) : null,
      }));
      return {
        name: ex.name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        sets_completed,
      };
    });
    return { exercises_completed };
  };

  // ── Navigation handlers ───────────────────────────────────────────────────

  const handleSetComplete = () => {
    // Record what the user logged for this set
    if (formData.weight || formData.reps) {
      recordSet(exerciseIdx, setIdx, { ...formData });
    }

    if (setIdx < sets.length - 1) {
      // More sets for this exercise → go to next set, start rest timer
      setSetIdx(setIdx + 1);
      setFormData({ weight: '', reps: '', rir: '' });
      setResting(true);
      setRestTime(exercise.rest_seconds || 60);
    } else {
      // All sets done → move to next exercise (or finish)
      handleExerciseComplete();
    }
  };

  const handleExerciseComplete = () => {
    setResting(false);
    if (exerciseIdx < (workout.exercises?.length ?? 0) - 1) {
      setExerciseIdx(exerciseIdx + 1);
      setSetIdx(0);
      setFormData({ weight: '', reps: '', rir: '' });
    } else {
      // Entire workout complete — send data back to parent for persistence
      onComplete?.(buildCompletedPayload());
    }
  };

  if (!exercise) return null;

  // ── Rest screen ───────────────────────────────────────────────────────────

  if (resting && restTime > 0) {
    return (
      <div className="fixed inset-0 bg-[hsl(var(--bg))] flex items-center justify-center flex-col gap-6 p-5">
        <p className="t-headline text-center">Descanse</p>
        <div className="w-32 h-32 rounded-full bg-[hsl(var(--brand)/0.1)] border-4 border-[hsl(var(--brand))] flex items-center justify-center">
          <span className="t-kpi-lg text-[hsl(var(--brand))]">{restTime}s</span>
        </div>
        <p className="t-caption text-center">
          Próximo: Set {setIdx + 1} de {sets.length}
        </p>
        <button
          onClick={() => setResting(false)}
          className="btn btn-secondary h-11 px-6 rounded-xl text-[14px] gap-2"
        >
          <Play className="w-4 h-4" /> Pular descanso
        </button>
        {/* Silent audio beacon for rest-end chime */}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" />
      </div>
    );
  }

  // ── Execution screen ──────────────────────────────────────────────────────

  return (
    <div className="p-5 space-y-6 max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-[12px]">
        <span className="t-label">
          Exercício {exerciseIdx + 1} de {workout.exercises?.length}
        </span>
        <span className="t-label">
          Set {setIdx + 1} de {sets.length}
        </span>
      </div>

      {/* Exercise card */}
      <div className="surface rounded-xl p-5 space-y-4">
        <div>
          <p className="t-headline mb-2">{exercise.name}</p>
          <div className="flex gap-2 flex-wrap">
            {exercise.primary_muscles?.map((m) => (
              <span key={m} className="badge badge-blue text-[11px]">{m}</span>
            ))}
            {exercise.technique ? (
              <span className="badge badge-neutral text-[11px]">{getWorkoutMethodLabel(exercise.technique)}</span>
            ) : null}
            {exercise.rest_seconds ? (
              <span className="badge badge-neutral text-[11px]">{exercise.rest_seconds}s descanso</span>
            ) : null}
          </div>
          {exercise.execution_notes && (
            <p className="t-caption mt-2">{exercise.execution_notes}</p>
          )}
        </div>

        {/* Set targets */}
        <div className="p-4 rounded-lg bg-[hsl(var(--brand)/0.05)] border border-[hsl(var(--brand)/0.2)]">
          <p className="t-small text-[hsl(var(--brand))] mb-2">Meta para este set</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="t-caption">Sets</p>
              <p className="text-[16px] font-bold">{currentSet?.target_sets ?? exercise.target_sets ?? '—'}</p>
            </div>
            <div>
              <p className="t-caption">Reps</p>
              <p className="text-[16px] font-bold">{currentSet?.target_reps ?? exercise.target_reps ?? '—'}</p>
            </div>
            <div>
              <p className="t-caption">Peso</p>
              <p className="text-[16px] font-bold">
                {currentSet?.target_weight ?? exercise.target_weight
                  ? `${currentSet?.target_weight ?? exercise.target_weight}kg`
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Log inputs */}
        <div className="space-y-3">
          <p className="t-label">Registre o set</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="t-label block mb-1">Peso (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={formData.weight}
                onChange={(e) => setFormData((f) => ({ ...f, weight: e.target.value }))}
                placeholder="0"
                className="atlas-input h-10 rounded-lg text-center text-base"
              />
            </div>
            <div>
              <label className="t-label block mb-1">Reps</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.reps}
                onChange={(e) => setFormData((f) => ({ ...f, reps: e.target.value }))}
                placeholder="0"
                className="atlas-input h-10 rounded-lg text-center text-base"
              />
            </div>
            <div>
              <label className="t-label block mb-1">RIR</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.rir}
                onChange={(e) => setFormData((f) => ({ ...f, rir: e.target.value }))}
                placeholder="0"
                className="atlas-input h-10 rounded-lg text-center text-base"
              />
            </div>
          </div>
        </div>

        {/* Previous sets summary (if any) */}
        {Object.keys(completedSets[exerciseIdx] || {}).length > 0 && (
          <div className="space-y-1">
            <p className="t-label">Sets anteriores</p>
            {Object.entries(completedSets[exerciseIdx]).map(([si, data]) => (
              <div key={si} className="flex items-center gap-3 text-[12px] text-[hsl(var(--fg-2))]">
                <span className="font-medium w-10">Set {Number(si) + 1}</span>
                {data.weight && <span>{data.weight}kg</span>}
                {data.reps && <span>× {data.reps} reps</span>}
                {data.rir != null && data.rir !== '' && <span>RIR {data.rir}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (setIdx > 0) {
              setSetIdx(setIdx - 1);
            } else if (exerciseIdx > 0) {
              const prevEx = workout.exercises[exerciseIdx - 1];
              setExerciseIdx(exerciseIdx - 1);
              setSetIdx((prevEx?.sets?.length ?? 1) - 1);
            }
            setFormData({ weight: '', reps: '', rir: '' });
          }}
          disabled={exerciseIdx === 0 && setIdx === 0}
          className="btn btn-secondary flex-1 h-11 rounded-xl text-[14px]"
        >
          ← Voltar
        </button>
        <button
          onClick={handleSetComplete}
          className="btn btn-primary flex-1 h-11 rounded-xl text-[14px] gap-2"
        >
          {setIdx < sets.length - 1 ? (
            <>Próximo Set <ChevronRight className="w-4 h-4" /></>
          ) : exerciseIdx < (workout.exercises?.length ?? 0) - 1 ? (
            <>Próximo Exercício <ChevronRight className="w-4 h-4" /></>
          ) : (
            <>Finalizar <CheckCircle2 className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
