import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getWorkoutMethodLabel } from '@/lib/workoutMethods';

function MetricTile({ label, value, accent = false }) {
  return (
    <div className={`rounded-[20px] border px-4 py-3 ${accent ? 'border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)]' : 'border-[hsl(var(--border)/0.88)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.76)_0%,hsl(var(--card))_100%)]'}`}>
      <p className="atlas-overline">{label}</p>
      <p className="mt-2 text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{value}</p>
    </div>
  );
}

export default function WorkoutExecutionScreen({ workout, onComplete }) {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [formData, setFormData] = useState({ weight: '', reps: '', rir: '' });
  const [completedSets, setCompletedSets] = useState({});

  const audioRef = useRef(null);

  const exercise = workout.exercises?.[exerciseIdx];
  const sets = exercise?.sets || [];
  const currentSet = sets?.[setIdx];
  const completionRatio = workout.exercises?.length
    ? ((exerciseIdx + setIdx / Math.max(sets.length, 1)) / workout.exercises.length) * 100
    : 0;

  useEffect(() => {
    if (!resting || restTime <= 0) return;

    const timer = setInterval(() => {
      setRestTime((currentValue) => {
        if (currentValue <= 1) {
          if (audioRef.current) audioRef.current.play().catch(() => {});
          return 0;
        }
        return currentValue - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restTime, resting]);

  const recordSet = (exerciseIndex, targetSetIndex, data) => {
    setCompletedSets((previous) => ({
      ...previous,
      [exerciseIndex]: {
        ...(previous[exerciseIndex] || {}),
        [targetSetIndex]: data,
      },
    }));
  };

  const buildCompletedPayload = () => {
    const exercises_completed = (workout.exercises || []).map((currentExercise, currentExerciseIndex) => {
      const setsData = completedSets[currentExerciseIndex] || {};
      const sets_completed = (currentExercise.sets || []).map((currentLoggedSet, currentSetIndex) => ({
        set_number: currentSetIndex + 1,
        target_reps: currentLoggedSet.target_reps ?? currentExercise.target_reps,
        target_weight: currentLoggedSet.target_weight ?? currentExercise.target_weight,
        reps_actual: setsData[currentSetIndex]?.reps ? Number(setsData[currentSetIndex].reps) : null,
        load_actual: setsData[currentSetIndex]?.weight ? Number(setsData[currentSetIndex].weight) : null,
        rir: setsData[currentSetIndex]?.rir ? Number(setsData[currentSetIndex].rir) : null,
      }));

      return {
        name: currentExercise.name,
        target_sets: currentExercise.target_sets,
        target_reps: currentExercise.target_reps,
        sets_completed,
      };
    });

    return { exercises_completed };
  };

  const handleExerciseComplete = () => {
    setResting(false);

    if (exerciseIdx < (workout.exercises?.length ?? 0) - 1) {
      setExerciseIdx(exerciseIdx + 1);
      setSetIdx(0);
      setFormData({ weight: '', reps: '', rir: '' });
      return;
    }

    onComplete?.(buildCompletedPayload());
  };

  const handleSetComplete = () => {
    if (formData.weight || formData.reps || formData.rir) {
      recordSet(exerciseIdx, setIdx, { ...formData });
    }

    if (setIdx < sets.length - 1) {
      setSetIdx(setIdx + 1);
      setFormData({ weight: '', reps: '', rir: '' });
      setResting(true);
      setRestTime(exercise.rest_seconds || 60);
      return;
    }

    handleExerciseComplete();
  };

  if (!exercise) return null;

  if (resting && restTime > 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--brand)/0.14),transparent_32%),linear-gradient(180deg,hsl(var(--bg))_0%,hsl(var(--shell))_100%)] p-5">
        <div className="atlas-card flex w-full max-w-md flex-col items-center gap-6 rounded-[32px] px-6 py-8 text-center">
          <p className="atlas-overline">Recuperação</p>
          <p className="text-[1.8rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">Descanse</p>

          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[hsl(var(--brand)/0.24)] bg-[radial-gradient(circle,hsl(var(--brand)/0.18)_0%,transparent_70%)]">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[hsl(var(--brand)/0.28)] bg-[hsl(var(--card))] shadow-[var(--shadow-md)]">
              <span className="text-[2.25rem] font-bold tracking-[-0.06em] text-[hsl(var(--brand))]">{restTime}s</span>
            </div>
          </div>

          <p className="max-w-xs text-sm leading-6 text-[hsl(var(--fg-2))]">
            Próximo passo: set {setIdx + 1} de {sets.length} em {exercise.name}.
          </p>

          <Button variant="outline" className="min-w-[180px]" onClick={() => setResting(false)}>
            <Play className="h-4 w-4" />
            Pular descanso
          </Button>

          <audio ref={audioRef} src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 pb-8 pt-4 lg:px-8">
      <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="atlas-overline">Execução</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              {exercise.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--fg-2))]">
              Exercício {exerciseIdx + 1} de {workout.exercises?.length} · Set {setIdx + 1} de {sets.length}
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

      <section className="atlas-card rounded-[28px] border-[hsl(var(--border)/0.92)] p-5 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {exercise.primary_muscles?.map((muscle) => (
              <span key={muscle} className="badge badge-blue text-[11px]">{muscle}</span>
            ))}
            {exercise.technique ? (
              <span className="badge badge-ai text-[11px]">{getWorkoutMethodLabel(exercise.technique)}</span>
            ) : null}
            {exercise.rest_seconds ? (
              <span className="badge badge-neutral text-[11px]">{exercise.rest_seconds}s descanso</span>
            ) : null}
          </div>

          {exercise.execution_notes ? (
            <p className="text-sm leading-6 text-[hsl(var(--fg-2))]">{exercise.execution_notes}</p>
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
                currentSet?.target_weight ?? exercise.target_weight
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
              onChange={(value) => setFormData((previous) => ({ ...previous, weight: value }))}
            />
            <FieldInput
              label="Reps"
              value={formData.reps}
              placeholder="0"
              onChange={(value) => setFormData((previous) => ({ ...previous, reps: value }))}
            />
            <FieldInput
              label="RIR"
              value={formData.rir}
              placeholder="0"
              onChange={(value) => setFormData((previous) => ({ ...previous, rir: value }))}
            />
          </div>

          <Button className="w-full sm:w-auto" onClick={handleSetComplete}>
            {setIdx < sets.length - 1 ? 'Salvar e ir ao próximo set' : 'Concluir exercício'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

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
              {Object.entries(completedSets[exerciseIdx]).map(([currentCompletedSetIndex, data]) => (
                <div
                  key={currentCompletedSetIndex}
                  className="flex flex-wrap items-center gap-3 rounded-[18px] border border-[hsl(var(--border)/0.84)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.68)_0%,hsl(var(--card))_100%)] px-4 py-3 text-[13px] text-[hsl(var(--fg-2))]"
                >
                  <span className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--fg))]">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--ok))]" />
                    Set {Number(currentCompletedSetIndex) + 1}
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
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 text-center text-base"
      />
    </div>
  );
}
