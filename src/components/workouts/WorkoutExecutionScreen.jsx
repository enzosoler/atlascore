import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Play, Plus, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getWorkoutMethodLabel } from '@/lib/workoutMethods';
import ExerciseSearch from '@/components/workouts/ExerciseSearch';
import { toast } from 'sonner';

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricTile({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-[20px] border px-4 py-3 ${
        accent
          ? 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)]'
          : 'border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.76)_0%,hsl(var(--card))_100%)]'
      }`}
    >
      <p className="atlas-overline">{label}</p>
      <p className="mt-2 text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
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
        className="h-12 text-center text-base"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkoutExecutionScreen({ workout, onComplete }) {
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

  const audioRef = useRef(null);
  const startedAt = useRef(Date.now());

  const exercise = exercises[exerciseIdx];
  const sets = exercise?.sets || [];
  const currentSet = sets?.[setIdx];
  const completionRatio = exercises.length
    ? ((exerciseIdx + setIdx / Math.max(sets.length, 1)) / exercises.length) * 100
    : 0;

  // ── Rest countdown timer ──────────────────────────────────────────────────

  useEffect(() => {
    if (!resting || restTime <= 0) return;
    const timer = setInterval(() => {
      setRestTime((v) => {
        if (v <= 1) {
          if (audioRef.current) audioRef.current.play().catch(() => {});
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [restTime, resting]);

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
          rir: logged?.rir ? Number(logged.rir) : null,
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
    toast.success('Treino concluído e salvo! 💪');
    onComplete?.(payload);
  };

  // ── Render: Add Exercise Panel ────────────────────────────────────────────
  // Checked first so it takes priority over done/rest/execution views

  if (showAddExercise) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-5 pb-8 pt-4 lg:px-8">
        <div className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="atlas-overline">Sessão</p>
              <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                Adicionar exercício
              </h2>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Busque na biblioteca ou adicione manualmente.
              </p>
            </div>
            {exercises.length > 0 && (
              <button
                onClick={() => setShowAddExercise(false)}
                className="shrink-0 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors pt-1"
              >
                ← Cancelar
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
      <div className="fixed inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.14),transparent_32%),linear-gradient(180deg,hsl(var(--bg))_0%,hsl(var(--shell))_100%)] p-5 z-10">
        <div className="atlas-card flex w-full max-w-md flex-col items-center gap-6 rounded-[32px] px-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.15)]">
            <Trophy className="h-8 w-8 text-[hsl(var(--ok))]" />
          </div>
          <div>
            <p className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              Treino Concluído!
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--fg-2))]">{workout.name}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="rounded-xl bg-[hsl(var(--shell))] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                Exercícios
              </p>
              <p className="mt-1 text-[18px] font-bold text-[hsl(var(--fg))]">
                {exercises.length}
              </p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--shell))] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                Sets
              </p>
              <p className="mt-1 text-[18px] font-bold text-[hsl(var(--fg))]">{totalSets}</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--shell))] p-3 text-center">
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">
                Tempo
              </p>
              <p className="mt-1 text-[18px] font-bold text-[hsl(var(--fg))]">{durationMin}min</p>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddExercise(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
            <Button className="flex-1" onClick={handleFinish}>
              <CheckCircle2 className="h-4 w-4" />
              Salvar treino
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Rest Timer ────────────────────────────────────────────────────

  if (resting && restTime > 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.14),transparent_32%),linear-gradient(180deg,hsl(var(--bg))_0%,hsl(var(--shell))_100%)] p-5">
        <div className="atlas-card flex w-full max-w-md flex-col items-center gap-6 rounded-[32px] px-6 py-8 text-center">
          <p className="atlas-overline">Recuperação</p>
          <p className="text-[1.8rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
            Descanse
          </p>
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[hsl(var(--brand)/0.24)] bg-[radial-gradient(circle,hsl(var(--brand)/0.18)_0%,transparent_70%)]">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[hsl(var(--brand)/0.28)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]">
              <span className="text-[2.25rem] font-bold tracking-[-0.06em] text-[hsl(var(--brand))]">
                {restTime}s
              </span>
            </div>
          </div>
          <p className="max-w-xs text-sm leading-6 text-[hsl(var(--fg-2))]">
            Próximo passo: set {setIdx + 1} de {sets.length} em {exercise?.name}.
          </p>
          <Button variant="outline" className="min-w-[180px]" onClick={() => setResting(false)}>
            <Play className="h-4 w-4" />
            Pular descanso
          </Button>
          <audio
            ref={audioRef}
            src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
          />
        </div>
      </div>
    );
  }

  // Guard: no exercise (shouldn't reach here in normal flow)
  if (!exercise) return null;

  // ── Render: Main Execution View ───────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 pb-8 pt-4 lg:px-8">

      {/* Exercise name + session progress */}
      <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="atlas-overline">Execução</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              {exercise.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
              Exercício {exerciseIdx + 1} de {exercises.length} · Set {setIdx + 1} de {sets.length}
            </p>
          </div>
          <div className="min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-[12px] font-medium text-[hsl(var(--fg-2))]">
              <span>Progresso da sessão</span>
              <span>{Math.min(100, Math.round(completionRatio))}%</span>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--border)/0.9)]">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,hsl(var(--brand))_0%,hsl(var(--accent-secondary))_100%)]"
                style={{ width: `${Math.min(100, Math.max(completionRatio, 8))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Exercise media — only shown when the exercise has a GIF/image URL */}
      {exercise.media_gif_url && (
        <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] overflow-hidden">
          <img
            src={exercise.media_gif_url}
            alt={`Demonstração: ${exercise.name}`}
            className="w-full object-cover max-h-64"
            loading="lazy"
          />
        </section>
      )}

      {/* Exercise metadata: muscles, technique, targets */}
      <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
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
                {exercise.rest_seconds}s descanso
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
              label="Repetições alvo"
              value={currentSet?.target_reps ?? exercise.target_reps ?? '—'}
              accent
            />
            <MetricTile
              label="Carga alvo"
              value={
                (currentSet?.target_weight ?? exercise.target_weight)
                  ? `${currentSet?.target_weight ?? exercise.target_weight} kg`
                  : '—'
              }
            />
            <MetricTile
              label="Séries"
              value={currentSet?.target_sets ?? exercise.target_sets ?? '—'}
            />
          </div>
        </div>
      </section>

      {/* Set logging form */}
      <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <p className="atlas-overline">Registrar set</p>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
              Preencha o realizado agora. Se preferir, deixe campos vazios e avance apenas com o fluxo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FieldInput
              label="Peso (kg)"
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
          <Button className="w-full sm:w-auto" onClick={handleSetComplete}>
            {setIdx < sets.length - 1 ? 'Salvar e ir ao próximo set' : 'Concluir exercício'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Logged sets history for the current exercise */}
      {Object.keys(completedSets[exerciseIdx] || {}).length > 0 ? (
        <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
          <div className="space-y-3">
            <div>
              <p className="atlas-overline">Histórico imediato</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
                Resumo dos sets já logados para o exercício atual.
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(completedSets[exerciseIdx]).map(([si, data]) => (
                <div
                  key={si}
                  className="flex flex-wrap items-center gap-3 rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.68)_0%,hsl(var(--card))_100%)] px-4 py-3 text-[13px] text-[hsl(var(--fg-2))]"
                >
                  <span className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--fg))]">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--ok))]" />
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
          className="flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors py-2 px-4 rounded-lg hover:bg-[hsl(var(--shell))]"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar exercício
        </button>
      </div>

      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
      />
    </div>
  );
}
