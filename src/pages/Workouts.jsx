import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Pencil,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import {
  DateStepper,
  EmptyState,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import {
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WORKOUT_TYPES, getToday } from '@/lib/atlas-theme';
import { cn } from '@/lib/utils';

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field mt-2 h-11 px-4 py-2 text-sm';
const SELECT_CLASS_NAME = `${INPUT_CLASS_NAME} appearance-none`;
const TEXTAREA_CLASS_NAME = 'atlas-field mt-2 min-h-[120px] resize-y px-4 py-3 text-sm';
const WORKOUT_FILTERS = ['all', 'pending', 'completed'];

const STATUS_META = {
  pending: {
    label: 'Pending',
    chip:
      'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.12)] text-[hsl(34_68%_32%)]',
    actionLabel: 'Concluir',
  },
  completed: {
    label: 'Completed',
    chip: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
    actionLabel: 'Reabrir',
  },
};

const TODAY = getToday();
const YESTERDAY = shiftDate(TODAY, -1);

const MOCK_PLANNED_WORKOUTS = [
  {
    id: 'plan-upper-a',
    date: TODAY,
    name: 'Upper A',
    duration_minutes: 70,
    perceived_effort: 8,
    exercises: [
      {
        name: 'Supino reto',
        sets: [{ reps: '8' }, { reps: '8' }, { reps: '6' }],
      },
      {
        name: 'Remada curvada',
        sets: [{ reps: '10' }, { reps: '10' }, { reps: '8' }],
      },
      {
        name: 'Desenvolvimento halteres',
        sets: [{ reps: '12' }, { reps: '10' }, { reps: '10' }],
      },
    ],
  },
  {
    id: 'plan-lower-b',
    date: YESTERDAY,
    name: 'Lower B',
    duration_minutes: 80,
    perceived_effort: 7,
    exercises: [
      {
        name: 'Agachamento livre',
        sets: [{ reps: '6' }, { reps: '6' }, { reps: '6' }],
      },
      {
        name: 'Leg press',
        sets: [{ reps: '12' }, { reps: '12' }, { reps: '10' }],
      },
    ],
  },
];

const MOCK_LOGGED_WORKOUTS = [
  {
    id: 'workout-upper-a-logged',
    date: TODAY,
    name: 'Upper A',
    type: 'strength',
    status: 'completed',
    duration_minutes: 68,
    perceived_effort: 8,
    volume_load: 5620,
    notes: 'Bom ritmo e descansos curtos.',
    exercises: [
      {
        name: 'Supino reto',
        sets: [
          { reps: '8', weight: 70 },
          { reps: '8', weight: 70 },
          { reps: '6', weight: 72.5 },
        ],
      },
      {
        name: 'Remada curvada',
        sets: [
          { reps: '10', weight: 55 },
          { reps: '10', weight: 55 },
          { reps: '8', weight: 60 },
        ],
      },
      {
        name: 'Desenvolvimento halteres',
        sets: [
          { reps: '12', weight: 20 },
          { reps: '10', weight: 22.5 },
          { reps: '10', weight: 22.5 },
        ],
      },
    ],
  },
  {
    id: 'workout-condition',
    date: TODAY,
    name: 'Conditioning finisher',
    type: 'cardio',
    status: 'pending',
    duration_minutes: 20,
    perceived_effort: 6,
    volume_load: 0,
    notes: 'Opcional se sobrar energia.',
    exercises: [
      {
        name: 'Bike',
        sets: [{ reps: '12 min', weight: '' }],
      },
      {
        name: 'Sled push',
        sets: [{ reps: '6 tiros', weight: '' }],
      },
    ],
  },
  {
    id: 'workout-lower-b',
    date: YESTERDAY,
    name: 'Lower B',
    type: 'strength',
    status: 'completed',
    duration_minutes: 77,
    perceived_effort: 7,
    volume_load: 6480,
    notes: '',
    exercises: [
      {
        name: 'Agachamento livre',
        sets: [
          { reps: '6', weight: 90 },
          { reps: '6', weight: 92.5 },
          { reps: '6', weight: 92.5 },
        ],
      },
      {
        name: 'Leg press',
        sets: [
          { reps: '12', weight: 180 },
          { reps: '12', weight: 180 },
          { reps: '10', weight: 190 },
        ],
      },
    ],
  },
];

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getWorkoutTypeLabel(type) {
  return WORKOUT_TYPES[type]?.label || type || 'Treino';
}

function getWorkoutStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.pending;
}

function getWorkoutFormState(workout, selectedDate) {
  return {
    date: workout?.date || selectedDate,
    name: workout?.name || '',
    type: workout?.type || 'strength',
    status: workout?.status || 'pending',
    duration_minutes:
      workout?.duration_minutes === 0 || workout?.duration_minutes
        ? String(workout.duration_minutes)
        : '',
    perceived_effort:
      workout?.perceived_effort === 0 || workout?.perceived_effort
        ? String(workout.perceived_effort)
        : '',
    volume_load:
      workout?.volume_load === 0 || workout?.volume_load ? String(workout.volume_load) : '',
    notes: workout?.notes || '',
    exercises:
      workout?.exercises?.map((exercise) => ({
        name: exercise.name || '',
        sets:
          exercise.sets?.length === 0 || !exercise.sets ? '' : String(exercise.sets.length),
        reps: exercise.sets?.[0]?.reps || '',
        weight:
          exercise.sets?.[0]?.weight === 0 || exercise.sets?.[0]?.weight
            ? String(exercise.sets[0].weight)
            : '',
      })) || [{ name: '', sets: '3', reps: '10', weight: '' }],
  };
}

function buildExerciseSets(count, reps, weight) {
  const normalizedCount = Math.max(1, Number(count || 1));
  const normalizedWeight = weight === '' ? '' : Number(weight);

  return Array.from({ length: normalizedCount }, () => ({
    reps: reps || '',
    weight: normalizedWeight,
  }));
}

function formatVolume(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function getExerciseSummary(exercise) {
  const sets = exercise?.sets?.length || 0;
  const reps = exercise?.sets?.[0]?.reps || '--';
  const weight = exercise?.sets?.[0]?.weight;

  return `${sets} sets${reps ? ` × ${reps}` : ''}${weight ? ` @ ${weight}kg` : ''}`;
}

function getExecutionCoverage(planned, logged) {
  const plannedCount = planned?.exercises?.length || 0;
  const loggedCount = logged?.exercises?.length || 0;

  if (!plannedCount) return 0;
  return Math.min((loggedCount / plannedCount) * 100, 100);
}

function HeroStat({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function SessionSignal({ label, value, detail, tone = 'neutral' }) {
  const toneClass =
    tone === 'ok'
      ? 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]'
      : tone === 'warn'
        ? 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(34_68%_32%)]'
        : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.78)] text-[hsl(var(--fg))]';

  return (
    <div className={cn('rounded-[22px] border px-4 py-4', toneClass)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function WorkoutMetric({ label, value, suffix = '' }) {
  return (
    <div className="bg-[hsl(var(--card)/0.86)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        {suffix ? <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{suffix}</span> : null}
      </p>
    </div>
  );
}

function ComparisonPanel({ title, eyebrow, workout, planned = false }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border px-5 py-5 shadow-[var(--shadow-xs)]',
        planned
          ? 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.52)]'
          : 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.82)]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="atlas-overline">{eyebrow}</p>
          <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {workout?.name || title}
          </p>
        </div>
        {workout ? (
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]',
              planned
                ? 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.72)] text-[hsl(var(--fg-2))]'
                : getWorkoutStatusMeta(workout.status).chip
            )}
          >
            {planned ? `${workout.exercises.length} exerc.` : getWorkoutStatusMeta(workout.status).label}
          </span>
        ) : null}
      </div>

      {workout ? (
        <>
          <p className="mt-3 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
            {workout.duration_minutes || 0} min · RPE {workout.perceived_effort || '--'}
            {!planned && workout.volume_load ? ` · ${formatVolume(workout.volume_load)} kg volume` : ''}
          </p>

          <div className="mt-5 space-y-3 border-t border-[hsl(var(--border)/0.82)] pt-4">
            {workout.exercises.map((exercise, index) => (
              <div key={`${exercise.name}-${index}`} className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                    {exercise.name}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                    {getExerciseSummary(exercise)}
                  </p>
                </div>
                {!planned && exercise.sets?.[0]?.weight ? (
                  <span className="shrink-0 text-[12px] font-semibold text-[hsl(var(--fg-2))]">
                    {exercise.sets[0].weight}kg
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
          {planned
            ? 'Sem plano definido para a data selecionada.'
            : 'Nenhum treino registrado para comparar ainda.'}
        </p>
      )}
    </div>
  );
}

function WorkoutCard({ workout, onEdit, onToggleStatus, onDelete }) {
  const status = getWorkoutStatusMeta(workout.status);

  return (
    <article className="atlas-card px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex flex-col gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]', status.chip)}>
              {status.label}
            </span>
            <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
              {getWorkoutTypeLabel(workout.type)}
            </span>
          </div>

          <div>
            <h3 className="text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {workout.name}
            </h3>
            <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
              {workout.exercises.length} exercicios · {workout.duration_minutes || 0} min · RPE{' '}
              {workout.perceived_effort || '--'}
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.55)]">
            <div className="grid gap-px bg-[hsl(var(--border)/0.7)] sm:grid-cols-3">
              <WorkoutMetric label="Volume" value={formatVolume(workout.volume_load || 0)} suffix="kg" />
              <WorkoutMetric label="Data" value={workout.date} />
              <WorkoutMetric label="Status" value={status.label} />
            </div>
          </div>

          <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              Exercises
            </p>
            <div className="mt-3 space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={`${exercise.name}-${index}`} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                      {exercise.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      {getExerciseSummary(exercise)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {workout.notes ? (
            <div className="rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Notes
              </p>
              <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">{workout.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.58)] px-4 py-4">
            <p className="atlas-metric-label">Execution</p>
            <p className="mt-3 text-[1.75rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
              {workout.duration_minutes || 0}
              <span className="ml-1 text-[13px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
                min
              </span>
            </p>
            <p className="mt-2 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
              {status.label} · RPE {workout.perceived_effort || '--'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="atlas-button atlas-button-secondary h-10 flex-1"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.9} />
              Editar
            </button>
            <button
              type="button"
              onClick={onToggleStatus}
              className={cn(
                'atlas-button h-10 flex-1',
                workout.status === 'completed'
                  ? 'border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill-secondary))]'
                  : 'border border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.14)]'
              )}
            >
              {status.actionLabel}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="atlas-button h-10 flex-1 border border-[hsl(var(--err)/0.18)] bg-[hsl(var(--err)/0.06)] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.1)]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.9} />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function WorkoutForm({ workout, selectedDate, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => getWorkoutFormState(workout, selectedDate));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateExercise = (index, field, value) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      ),
    }));
  };

  const addExercise = () => {
    setForm((current) => ({
      ...current,
      exercises: [...current.exercises, { name: '', sets: '3', reps: '10', weight: '' }],
    }));
  };

  const removeExercise = (index) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.filter((_, exerciseIndex) => exerciseIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const exercises = form.exercises
      .filter((exercise) => exercise.name.trim())
      .map((exercise) => ({
        name: exercise.name.trim(),
        sets: buildExerciseSets(exercise.sets, exercise.reps, exercise.weight),
      }));

    onSubmit({
      id: workout?.id || createLocalId('workout'),
      date: form.date || selectedDate,
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      duration_minutes: Number(form.duration_minutes || 0),
      perceived_effort: Number(form.perceived_effort || 0),
      volume_load: Number(form.volume_load || 0),
      notes: form.notes.trim(),
      exercises,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 lg:px-7 lg:py-7">
      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--fill)/0.5)] px-5 py-5">
        <p className="atlas-overline">Session basics</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={FIELD_LABEL_CLASS}>
            Data
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className={FIELD_LABEL_CLASS}>
            Nome do treino
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Ex: Upper A"
              className={INPUT_CLASS_NAME}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={FIELD_LABEL_CLASS}>
            Tipo
            <select
              value={form.type}
              onChange={(event) => updateField('type', event.target.value)}
              className={SELECT_CLASS_NAME}
            >
              {Object.entries(WORKOUT_TYPES).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className={FIELD_LABEL_CLASS}>
            Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className={SELECT_CLASS_NAME}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className={FIELD_LABEL_CLASS}>
            Duracao
            <input
              type="number"
              min="0"
              value={form.duration_minutes}
              onChange={(event) => updateField('duration_minutes', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className={FIELD_LABEL_CLASS}>
            RPE
            <input
              type="number"
              min="0"
              max="10"
              value={form.perceived_effort}
              onChange={(event) => updateField('perceived_effort', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>
        </div>

        <label className={cn(FIELD_LABEL_CLASS, 'mt-4')}>
          Volume total
          <input
            type="number"
            min="0"
            value={form.volume_load}
            onChange={(event) => updateField('volume_load', event.target.value)}
            className={INPUT_CLASS_NAME}
          />
        </label>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="atlas-overline">Exercises</p>
            <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              Mantenha cada bloco limpo para preservar a leitura da execucao.
            </p>
          </div>
          <button
            type="button"
            onClick={addExercise}
            className="atlas-button atlas-button-secondary h-9 px-4 text-[12px]"
          >
            + Adicionar exercicio
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {form.exercises.map((exercise, index) => (
            <div
              key={`exercise-${index}`}
              className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.5)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={FIELD_LABEL_CLASS}>
                  Nome
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(event) => updateExercise(index, 'name', event.target.value)}
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <label className={FIELD_LABEL_CLASS}>
                  Sets
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(event) => updateExercise(index, 'sets', event.target.value)}
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <label className={FIELD_LABEL_CLASS}>
                  Reps
                  <input
                    type="text"
                    value={exercise.reps}
                    onChange={(event) => updateExercise(index, 'reps', event.target.value)}
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <label className={FIELD_LABEL_CLASS}>
                  Peso
                  <input
                    type="number"
                    min="0"
                    value={exercise.weight}
                    onChange={(event) => updateExercise(index, 'weight', event.target.value)}
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    disabled={form.exercises.length === 1}
                    className="atlas-button atlas-button-secondary h-11 w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <label className={FIELD_LABEL_CLASS}>
          Observacoes
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Ex: treino mais curto, foco em tecnica."
            className={TEXTAREA_CLASS_NAME}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[hsl(var(--border)/0.85)] pt-6 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit">
          {workout ? 'Salvar treino' : 'Adicionar treino'}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Workouts() {
  return (
    <SafePageBoundary
      title="Workouts"
      subtitle="Execucao e registro de treinos com estado local proprio, separado de protocols."
      maxWidth="max-w-6xl"
      fallbackDescription="A rota de Workouts continua acessivel mesmo se a interface principal falhar."
    >
      <WorkoutsContent />
    </SafePageBoundary>
  );
}

function WorkoutsContent() {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notice, setNotice] = useState(null);
  const [loggedWorkouts, setLoggedWorkouts] = useState(MOCK_LOGGED_WORKOUTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [comparisonWorkoutId, setComparisonWorkoutId] = useState('');

  const plannedWorkout = useMemo(() => {
    return MOCK_PLANNED_WORKOUTS.find((workout) => workout.date === selectedDate) || null;
  }, [selectedDate]);

  const workoutsForDate = useMemo(() => {
    return loggedWorkouts.filter((workout) => workout.date === selectedDate);
  }, [loggedWorkouts, selectedDate]);

  const filteredWorkouts = useMemo(() => {
    if (statusFilter === 'all') return workoutsForDate;
    return workoutsForDate.filter((workout) => workout.status === statusFilter);
  }, [statusFilter, workoutsForDate]);

  const comparisonWorkout = useMemo(() => {
    return (
      workoutsForDate.find((workout) => workout.id === comparisonWorkoutId) ||
      workoutsForDate[0] ||
      null
    );
  }, [comparisonWorkoutId, workoutsForDate]);

  const completedCount = workoutsForDate.filter((workout) => workout.status === 'completed').length;
  const plannedExerciseCount = plannedWorkout?.exercises?.length || 0;
  const totalVolume = workoutsForDate.reduce((total, workout) => total + (workout.volume_load || 0), 0);
  const executionCoverage = getExecutionCoverage(plannedWorkout, comparisonWorkout);

  const handleCreate = () => {
    setNotice(null);
    setEditingWorkout(null);
    setIsFormOpen(true);
  };

  const handleEdit = (workout) => {
    setNotice(null);
    setEditingWorkout(workout);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (workout) => {
    const nextStatus = workout.status === 'completed' ? 'pending' : 'completed';

    setLoggedWorkouts((current) =>
      current.map((item) =>
        item.id === workout.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    setNotice({
      tone: 'success',
      message:
        nextStatus === 'completed'
          ? 'Treino marcado como concluido.'
          : 'Treino voltou para pendente.',
    });
  };

  const handleDelete = (workout) => {
    const confirmed = window.confirm(`Delete ${workout.name}?`);

    if (!confirmed) return;

    setLoggedWorkouts((current) => current.filter((item) => item.id !== workout.id));
    setNotice({
      tone: 'success',
      message: 'Treino removido do estado local.',
    });
  };

  const handleSaveWorkout = (payload) => {
    if (!payload.name || payload.exercises.length === 0) {
      setNotice({
        tone: 'warning',
        message: 'Adicione nome e pelo menos um exercicio para salvar o treino.',
      });
      return;
    }

    setLoggedWorkouts((current) => {
      const exists = current.some((item) => item.id === payload.id);

      if (exists) {
        return current.map((item) => (item.id === payload.id ? payload : item));
      }

      return [payload, ...current];
    });

    setComparisonWorkoutId(payload.id);
    setIsFormOpen(false);
    setEditingWorkout(null);
    setNotice({
      tone: 'success',
      message: payload.id === editingWorkout?.id ? 'Treino atualizado.' : 'Treino adicionado.',
    });
  };

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Workouts"
        title="Training with a clear line from plan to execution."
        subtitle="Keep the day&apos;s plan visible, log execution without noise and read performance status with enough structure to act quickly."
        accentClassName="from-[hsl(var(--brand)/0.09)] via-[hsl(var(--brand)/0.03)]"
        actions={
          <ActionRow>
            <DateStepper
              date={selectedDate}
              onChange={(amount) => setSelectedDate(shiftDate(selectedDate, amount))}
            />
            <PrimaryButton type="button" onClick={handleCreate} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              Novo treino
            </PrimaryButton>
          </ActionRow>
        }
      >
        <div className="grid gap-3">
          <HeroStat
            label="Plan"
            value={plannedWorkout?.name || 'No plan'}
            detail={
              plannedWorkout
                ? `${plannedExerciseCount} exercicios previstos para a data selecionada.`
                : 'Nenhum treino planejado para o dia selecionado.'
            }
          />
          <HeroStat
            label="Execution"
            value={`${workoutsForDate.length} registradas`}
            detail={`${completedCount} concluido(s) dentro do estado local desta rota.`}
          />
          <HeroStat
            label="Volume"
            value={`${formatVolume(totalVolume)} kg`}
            detail="Carga total registrada nas sessoes do dia."
          />
        </div>
      </PageHeader>

      <StatusBanner tone="warning">
        Workouts agora usa somente estado local desta pagina. Nenhuma logica de Protocols continua ligada a esta rota.
      </StatusBanner>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      <Section
        title="Session line"
        subtitle="Antes do log detalhado, deixe visivel se existe plano, execucao e comparacao pronta para agir."
      >
        <Card className="px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="atlas-overline">Session line</p>
              <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                {plannedWorkout?.name || 'No planned session'}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                {plannedWorkout
                  ? `${plannedWorkout.duration_minutes || 0} min · RPE ${plannedWorkout.perceived_effort || '--'}`
                  : 'Use o registro local para estruturar a execucao do dia mesmo sem plano.'}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.76)] text-[hsl(var(--fg-2))]">
              <Dumbbell className="h-4 w-4" strokeWidth={1.9} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <SessionSignal
              label="Plan ready"
              value={plannedWorkout ? 'Visible' : 'Open'}
              detail={
                plannedWorkout
                  ? `${plannedExerciseCount} exercicios definidos para comparar.`
                  : 'Sem plano ativo para o dia selecionado.'
              }
              tone={plannedWorkout ? 'neutral' : 'warn'}
            />
            <SessionSignal
              label="Execution logged"
              value={workoutsForDate.length > 0 ? `${workoutsForDate.length} session(s)` : 'None yet'}
              detail={
                workoutsForDate.length > 0
                  ? `${completedCount} marcada(s) como concluida(s).`
                  : 'Adicione uma execucao para acompanhar o dia.'
              }
              tone={workoutsForDate.length > 0 ? 'ok' : 'warn'}
            />
            <SessionSignal
              label="Comparison ready"
              value={`${Math.round(executionCoverage)}% match`}
              detail="A comparacao abaixo separa claramente o que era plano do que foi executado."
              tone={executionCoverage >= 100 ? 'ok' : 'neutral'}
            />
          </div>
        </Card>
      </Section>

        <SectionCard
          title="Plan vs execution"
          subtitle="Plano, execucao e status aparecem separados para leitura imediata da sessao."
          actions={
            workoutsForDate.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {workoutsForDate.map((workout) => (
                  <button
                    key={workout.id}
                    type="button"
                    onClick={() => setComparisonWorkoutId(workout.id)}
                    className={cn(
                      'atlas-button h-9 rounded-full px-4 text-[12px]',
                      comparisonWorkout?.id === workout.id
                        ? 'atlas-button-primary'
                        : 'atlas-button-secondary shadow-none'
                    )}
                  >
                    {workout.name}
                  </button>
                ))}
              </div>
            ) : null
          }
        >
          <div className="grid gap-4">
            <ComparisonPanel
              title="No planned session"
              eyebrow="Planned"
              workout={plannedWorkout}
              planned
            />
            <ComparisonPanel
              title="No execution logged"
              eyebrow="Executed"
              workout={comparisonWorkout}
            />
          </div>

          {plannedWorkout && comparisonWorkout ? (
            <div className="mt-4 rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.48)] px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="atlas-metric-label">Execution coverage</p>
                  <p className="mt-3 text-[2rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
                    {Math.round(executionCoverage)}%
                  </p>
                  <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                    {comparisonWorkout.exercises.length} de {plannedWorkout.exercises.length} exercicios aparecem na leitura comparada.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                  {executionCoverage >= 100 ? 'Sessao coberta' : 'Ainda em andamento'}
                </span>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--card))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--fg))]"
                  style={{ width: `${executionCoverage}%` }}
                />
              </div>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Workout log"
          subtitle="Cards e acoes desta rota, com plano, status e execucao visualmente separados."
          actions={
            <div className="flex flex-wrap gap-2">
              {WORKOUT_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={cn(
                    'atlas-button h-9 rounded-full px-4 text-[12px]',
                    statusFilter === option
                      ? 'atlas-button-primary'
                      : 'atlas-button-secondary shadow-none'
                  )}
                >
                  {option[0].toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          }
        >
          {!workoutsForDate.length ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhum treino registrado"
              description="Abra o modal local de treino para adicionar a execucao do dia."
              action={
                <PrimaryButton type="button" onClick={handleCreate}>
                  Novo treino
                </PrimaryButton>
              }
            />
          ) : null}

          {workoutsForDate.length > 0 && filteredWorkouts.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Nenhum treino neste filtro"
              description="Troque o status atual ou registre outra sessao para este dia."
            />
          ) : null}

          {filteredWorkouts.length > 0 ? (
            <div className="space-y-4">
              {filteredWorkouts.map((workout, index) => (
                <div key={workout.id} className="space-y-4">
                  {index > 0 ? <div className="mx-auto h-px w-full max-w-[92%] bg-[hsl(var(--border)/0.75)]" /> : null}
                  <WorkoutCard
                    workout={workout}
                    onEdit={() => handleEdit(workout)}
                    onToggleStatus={() => handleToggleStatus(workout)}
                    onDelete={() => handleDelete(workout)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </SectionCard>

        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingWorkout(null);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[32rem]">
            <DialogHeader className="relative overflow-hidden border-b border-[hsl(var(--border)/0.82)] px-6 pb-5 pt-6 text-left lg:px-7">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--brand)/0.1)] to-transparent" />
              <div className="relative">
                <p className="atlas-overline">Workout session</p>
                <DialogTitle className="mt-3">
                  {editingWorkout ? 'Editar treino' : 'Novo treino'}
                </DialogTitle>
                <DialogDescription className="mt-3 max-w-2xl">
                  Este modal pertence apenas a Workouts e manipula somente dados de treino do estado local desta rota.
                </DialogDescription>
              </div>
            </DialogHeader>

            <WorkoutForm
              key={editingWorkout?.id || 'new-workout'}
              workout={editingWorkout}
              selectedDate={selectedDate}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingWorkout(null);
              }}
              onSubmit={handleSaveWorkout}
            />
          </DialogContent>
        </Dialog>
    </AppContainer>
  );
}
