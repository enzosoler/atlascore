import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Pencil,
  Plus,
  Target,
  Trash2,
  User,
  UserCheck,
} from 'lucide-react';
import {
  ActionRow,
  AppContainer,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  DateStepper,
  DialogPanelHeader,
  EmptyState,
  FilterChip,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WORKOUT_TYPES, getToday } from '@/lib/atlas-theme';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field mt-2 h-11 px-4 py-2 text-base';
const SELECT_CLASS_NAME = `${INPUT_CLASS_NAME} appearance-none`;
const TEXTAREA_CLASS_NAME = 'atlas-field mt-2 min-h-[120px] resize-y px-4 py-3 text-base';
const WORKOUT_FILTERS = ['all', 'pending', 'completed'];

function getStatusMeta(t) {
  return {
    pending: {
      label: t('pages.workouts.status.pending'),
      chip:
        'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.12)] text-[hsl(34_68%_32%)]',
      actionLabel: t('pages.workouts.actions.mark_complete'),
    },
    completed: {
      label: t('pages.workouts.status.completed'),
      chip: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
      actionLabel: t('pages.workouts.actions.mark_pending'),
    },
  };
}

const PLAN_SOURCES = {
  self: {
    label: 'By you',
    Icon: User,
    className:
      'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]',
  },
  ai: {
    label: 'Generated',
    Icon: ClipboardList,
    className:
      'border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]',
  },
  coach: {
    label: 'Coach assigned',
    Icon: UserCheck,
    className:
      'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]',
  },
};

const TODAY = getToday();
const YESTERDAY = shiftDate(TODAY, -1);

const MOCK_PLANNED_WORKOUTS = [
  {
    id: 'plan-upper-a',
    date: TODAY,
    name: 'Upper A',
    source: 'coach',
    duration_minutes: 70,
    perceived_effort: 8,
    exercises: [
      { name: 'Flat bench press', sets: [{ reps: '8' }, { reps: '8' }, { reps: '6' }] },
      { name: 'Bent-over row', sets: [{ reps: '10' }, { reps: '10' }, { reps: '8' }] },
      { name: 'Dumbbell shoulder press', sets: [{ reps: '12' }, { reps: '10' }, { reps: '10' }] },
    ],
  },
  {
    id: 'plan-lower-b',
    date: YESTERDAY,
    name: 'Lower B',
    source: 'ai',
    duration_minutes: 80,
    perceived_effort: 7,
    exercises: [
      { name: 'Back squat', sets: [{ reps: '6' }, { reps: '6' }, { reps: '6' }] },
      { name: 'Leg press', sets: [{ reps: '12' }, { reps: '12' }, { reps: '10' }] },
    ],
  },
];

const MOCK_LOGGED_WORKOUTS = [
  {
    id: 'workout-upper-a-logged',
    plan_id: 'plan-upper-a',
    date: TODAY,
    name: 'Upper A',
    type: 'strength',
    status: 'completed',
    duration_minutes: 68,
    perceived_effort: 8,
    volume_load: 5620,
    notes: 'Strong pace and short rest periods.',
    exercises: [
      {
        name: 'Flat bench press',
        sets: [
          { reps: '8', weight: 70 },
          { reps: '8', weight: 70 },
          { reps: '6', weight: 72.5 },
        ],
      },
      {
        name: 'Bent-over row',
        sets: [
          { reps: '10', weight: 55 },
          { reps: '10', weight: 55 },
          { reps: '8', weight: 60 },
        ],
      },
      {
        name: 'Dumbbell shoulder press',
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
    notes: 'Optional if energy is still high.',
    exercises: [
      { name: 'Bike', sets: [{ reps: '12 min', weight: '' }] },
      { name: 'Sled push', sets: [{ reps: '6 pushes', weight: '' }] },
    ],
  },
  {
    id: 'workout-lower-b',
    plan_id: 'plan-lower-b',
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
        name: 'Back squat',
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
  return WORKOUT_TYPES[type]?.label || type || 'Workout';
}

function getWorkoutStatusMeta(status, statusMeta) {
  return statusMeta[status] || statusMeta.pending;
}

function getWorkoutFormState(workout, selectedDate) {
  return {
    plan_id: workout?.plan_id || null,
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
  return Number(value || 0).toLocaleString(locale);
}

function getExerciseSummary(exercise) {
  const sets = exercise?.sets?.length || 0;
  const reps = exercise?.sets?.[0]?.reps || '--';
  const weight = exercise?.sets?.[0]?.weight;
  return `${sets} sets${reps ? ` × ${reps}` : ''}${weight ? ` @ ${weight}kg` : ''}`;
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

function WorkoutMetric({ label, value, suffix = '' }) {
  return (
    <div className="bg-[hsl(var(--card)/0.86)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        {suffix ? (
          <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

function SessionSignal({ label, value, detail, tone = 'neutral' }) {
  const toneStyles = {
    neutral: 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] text-[hsl(var(--fg))]',
    ok: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
    warn: 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
  };

  return (
    <div className="rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-2 text-[1.05rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {value}
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
        </div>
        <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]', toneStyles[tone] || toneStyles.neutral)}>
          {tone}
        </span>
      </div>
    </div>
  );
}

function ComparisonPanel({ title, eyebrow, workout, planned = false, statusMeta }) {
  const status = workout ? getWorkoutStatusMeta(workout.status || 'pending', statusMeta) : null;

  return (
    <div className="rounded-[28px] border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="atlas-overline">{eyebrow}</p>
          <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {workout?.name || title}
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {workout
              ? `${workout.exercises?.length || 0} exercises · ${workout.duration_minutes || 0} min`
              : 'No session available for this comparison view.'}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.74)] text-[hsl(var(--fg-2))]">
          {planned ? <ClipboardList className="h-4 w-4" strokeWidth={1.9} /> : <Dumbbell className="h-4 w-4" strokeWidth={1.9} />}
        </div>
      </div>

      {workout ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]', planned ? 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))]' : status?.chip)}>
              {planned ? `${workout.exercises?.length || 0} exercises` : status?.label}
            </span>
            {!planned ? (
              <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                {getWorkoutTypeLabel(workout.type)}
              </span>
            ) : null}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-[hsl(var(--border)/0.82)] pt-4">
            {workout.exercises?.map((exercise, index) => (
              <div key={`${exercise.name}-${index}`} className="flex items-center justify-between gap-4">
                <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                  {exercise.name}
                </p>
                <p className="shrink-0 text-[13px] tabular-nums text-[hsl(var(--fg-2))]">
                  {exercise.sets.length}&thinsp;x&thinsp;{exercise.sets[0]?.reps || '--'}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function PlanCard({ plan, onLogSession }) {
  if (!plan) {
    return (
      <div className="rounded-[28px] border border-dashed border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.3)] px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.76)] text-[hsl(var(--fg-3))]">
          <Dumbbell className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          No training plan for today
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          Build one yourself, use the structured plan builder, or wait for your coach to assign it.
        </p>
      </div>
    );
  }

  const sourceMeta = PLAN_SOURCES[plan.source] || PLAN_SOURCES.self;
  const SourceIcon = sourceMeta.Icon;

  return (
    <div className="rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="atlas-overline">Assigned plan</p>
          <h3 className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
            {plan.name}
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {plan.duration_minutes || 0} min · RPE {plan.perceived_effort || '--'}
          </p>
        </div>

        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]', sourceMeta.className)}>
          <SourceIcon className="h-3 w-3" strokeWidth={2} />
          {sourceMeta.label}
        </span>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-[hsl(var(--border)/0.82)] pt-4">
        {plan.exercises.map((exercise, index) => (
          <div key={`${exercise.name}-${index}`} className="flex items-center justify-between gap-4">
            <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
              {exercise.name}
            </p>
            <p className="shrink-0 text-[13px] tabular-nums text-[hsl(var(--fg-2))]">
              {exercise.sets.length}&thinsp;x&thinsp;{exercise.sets[0]?.reps || '--'}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogSession}
        className="atlas-button mt-5 h-10 w-full"
      >
        Log plan session
      </button>
    </div>
  );
}

function WorkoutCard({ workout, onEdit, onToggleStatus, onDelete, statusMeta }) {
  const status = getWorkoutStatusMeta(workout.status, statusMeta);

  return (
    <article className="atlas-card px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex flex-col gap-5">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]',
                status.chip
              )}
            >
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
              {workout.exercises.length} exercises · {workout.duration_minutes || 0} min · RPE{' '}
              {workout.perceived_effort || '--'}
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.55)]">
            <div className="grid gap-px bg-[hsl(var(--border)/0.7)] sm:grid-cols-3">
              <WorkoutMetric label="Volume" value={formatVolume(workout.volume_load || 0)} suffix="kg" />
              <WorkoutMetric label="Date" value={workout.date} />
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

        <div className="flex w-full flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="atlas-button atlas-button-secondary h-10 flex-1"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.9} />
            Edit
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
            Delete
          </button>
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
      plan_id: form.plan_id || null,
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
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label className={FIELD_LABEL_CLASS}>
            Workout name
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
            Type
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
            Duration
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
              Keep each block clean so the execution read stays easy to scan.
            </p>
          </div>
          <button
            type="button"
            onClick={addExercise}
            className="atlas-button atlas-button-secondary h-9 px-4 text-[12px]"
          >
            + Add exercise
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
                  Name
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
                  Weight
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
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <label className={FIELD_LABEL_CLASS}>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="e.g. shorter workout, technique focus."
            className={TEXTAREA_CLASS_NAME}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[hsl(var(--border)/0.85)] pt-6 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit">
          {workout?.id ? 'Save workout' : 'Add workout'}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Workouts() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('pages.workouts.title')}
      subtitle={t('pages.workouts.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription="The Workouts route remains accessible even if the main interface fails."
    >
      <WorkoutsContent />
    </SafePageBoundary>
  );
}

function WorkoutsContent() {
  const { t } = useI18n();
  const statusMeta = getStatusMeta(t);

  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [freeFilter, setFreeFilter] = useState('all');
  const [comparisonWorkoutId, setComparisonWorkoutId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loggedWorkouts, setLoggedWorkouts] = useState(MOCK_LOGGED_WORKOUTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const plannedWorkout = useMemo(
    () => MOCK_PLANNED_WORKOUTS.find((w) => w.date === selectedDate) || null,
    [selectedDate]
  );

  const workoutsForDate = useMemo(
    () => loggedWorkouts.filter((w) => w.date === selectedDate),
    [loggedWorkouts, selectedDate]
  );

  const planSessions = useMemo(
    () => workoutsForDate.filter((w) => w.plan_id && w.plan_id === plannedWorkout?.id),
    [workoutsForDate, plannedWorkout]
  );

  const freeWorkouts = useMemo(
    () => workoutsForDate.filter((w) => !w.plan_id),
    [workoutsForDate]
  );

  const filteredFreeWorkouts = useMemo(() => {
    if (freeFilter === 'all') return freeWorkouts;
    return freeWorkouts.filter((w) => w.status === freeFilter);
  }, [freeWorkouts, freeFilter]);
  const filteredWorkouts = filteredFreeWorkouts;
  const comparisonCandidates = planSessions.length > 0 ? planSessions : workoutsForDate;
  const comparisonWorkout =
    comparisonCandidates.find((w) => w.id === comparisonWorkoutId) || comparisonCandidates[0] || null;
  const plannedExerciseCount = plannedWorkout?.exercises?.length || 0;
  const completedCount = workoutsForDate.filter((w) => w.status === 'completed').length;
  const executionCoverage =
    plannedExerciseCount > 0
      ? Math.min(100, ((comparisonWorkout?.exercises?.length || 0) / plannedExerciseCount) * 100)
      : 0;

  const totalVolume = workoutsForDate.reduce((total, w) => total + (w.volume_load || 0), 0);

  const openForm = (preset = null) => {
    setNotice(null);
    setEditingWorkout(preset);
    setIsFormOpen(true);
  };

  const handleLogPlanSession = () => {
    if (!plannedWorkout) return;
    openForm({
      plan_id: plannedWorkout.id,
      name: plannedWorkout.name,
      date: selectedDate,
      type: 'strength',
      exercises: plannedWorkout.exercises,
    });
  };

  const handleAddFreeWorkout = () => openForm(null);

  const handleEdit = (workout) => openForm(workout);

  const handleToggleStatus = (workout) => {
    const nextStatus = workout.status === 'completed' ? 'pending' : 'completed';
    setLoggedWorkouts((current) =>
      current.map((item) => (item.id === workout.id ? { ...item, status: nextStatus } : item))
    );
    setNotice({
      tone: 'success',
      message:
        nextStatus === 'completed'
          ? t('pages.workouts.messages.workout_marked_complete')
          : 'Workout moved back to pending.',
    });
  };

  const handleDelete = (workout) => {
    if (!window.confirm(`Delete ${workout.name}?`)) return;
    setLoggedWorkouts((current) => current.filter((item) => item.id !== workout.id));
    setNotice({ tone: 'success', message: 'Workout removed.' });
  };

  const handleSaveWorkout = (payload) => {
    if (!payload.name || payload.exercises.length === 0) {
      setNotice({
        tone: 'warning',
        message: t('pages.workouts.messages.empty_subtitle'),
      });
      return;
    }

    setLoggedWorkouts((current) => {
      const exists = current.some((item) => item.id === payload.id);
      if (exists) return current.map((item) => (item.id === payload.id ? payload : item));
      return [payload, ...current];
    });

    setIsFormOpen(false);
    setEditingWorkout(null);
    setNotice({
      tone: 'success',
      message: editingWorkout?.id ? 'Workout updated.' : 'Workout added.',
    });
  };

  const isEditing = Boolean(editingWorkout?.id);
  const formTitle = isEditing
    ? 'Edit workout'
    : editingWorkout?.plan_id
      ? 'Log plan session'
      : 'New free workout';

  return (
    <AppContainer>
      <PageHeader
        eyebrow={isPt ? "Treinos" : "Workouts"}
        title="Planned and free execution, side by side."
        subtitle="Your assigned plan on top, free workouts below. Two distinct spaces with no mixing."
        accentClassName="from-[hsl(var(--brand)/0.09)] via-[hsl(var(--brand)/0.03)]"
        actions={
          <ActionRow>
            <DateStepper
              date={selectedDate}
              onChange={(amount) => setSelectedDate(shiftDate(selectedDate, amount))}
            />
          </ActionRow>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat
            label="Plan"
            value={plannedWorkout?.name || t('pages.workouts.messages.no_plan')}
            detail={
              plannedWorkout
                ? `${plannedWorkout.exercises.length} exercises · ${PLAN_SOURCES[plannedWorkout.source]?.label || 'By you'}`
                : 'No plan assigned for the selected date.'
            }
          />
          <HeroStat
            label="Plan sessions"
            value={`${planSessions.length} logged`}
            detail={
              planSessions.length > 0
                ? `${planSessions.filter((w) => w.status === 'completed').length} completed.`
                : 'No sessions logged against the plan yet.'
            }
          />
          <HeroStat
            label="Total volume"
            value={`${formatVolume(totalVolume)} kg`}
            detail="Combined load from the plan and all free workouts for the day."
          />
        </div>
      </PageHeader>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      {/* ── SECTION 1: TRAINING PLAN ── */}
          <SectionCard
        title="Training Plan"
        subtitle={
          plannedWorkout
            ? 'Your assigned workout for today. Log a session when you start executing.'
            : 'No plan assigned for this day. Create, build, or request one.'
        }
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
                  : t('pages.workouts.messages.use_local_register')}
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
                  ? `${plannedExerciseCount} exercises defined for comparison.`
                  : 'No active plan for the selected day.'
              }
              tone={plannedWorkout ? 'neutral' : 'warn'}
            />
            <SessionSignal
              label="Logged execution"
              value={workoutsForDate.length > 0 ? `${workoutsForDate.length} sessions` : 'None yet'}
              detail={
                workoutsForDate.length > 0
                  ? `${completedCount} marked as completed.`
                  : t('pages.workouts.messages.no_execution_logged')
              }
              tone={workoutsForDate.length > 0 ? 'ok' : 'warn'}
            />
            <SessionSignal
              label="Comparison ready"
              value={`${Math.round(executionCoverage)}% match`}
              detail="The comparison below clearly separates the plan from what was actually executed."
              tone={executionCoverage >= 100 ? 'ok' : 'neutral'}
            />
          </div>
        </Card>
      </SectionCard>

        <SectionCard
          title="Plan vs execution"
          subtitle="Plan, execution, and status stay separate for an immediate read of the session."
          actions={
            workoutsForDate.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {workoutsForDate.map((workout) => (
                  <FilterChip
                    key={workout.id}
                    onClick={() => setComparisonWorkoutId(workout.id)}
                    active={comparisonWorkout?.id === workout.id}
                  >
                    {workout.name}
                  </FilterChip>
                ))}
              </div>
            ) : null
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ComparisonPanel
              title={t('pages.workouts.messages.no_plan')}
              eyebrow="Planned"
              workout={plannedWorkout}
              planned
              statusMeta={statusMeta}
            />
            <ComparisonPanel
              title={t('pages.workouts.messages.empty_state')}
              eyebrow="Executed"
              workout={comparisonWorkout}
              statusMeta={statusMeta}
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
                    {comparisonWorkout.exercises.length} of {plannedWorkout.exercises.length} exercises appear in the comparison.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                  {executionCoverage >= 100 ? t('pages.workouts.messages.session_covered') : t('pages.workouts.messages.still_in_progress')}
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

      {/* ── SECTION 2: FREE WORKOUT ── */}
      <SectionCard
        title={isPt ? "Treino Livre" : "Free Workout"}
        subtitle="Workouts done outside your training plan — extra sessions, cardio, mobility, anything goes."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {freeWorkouts.length > 0
              ? WORKOUT_FILTERS.map((option) => (
                  <FilterChip
                    key={option}
                    onClick={() => setFreeFilter(option)}
                    active={freeFilter === option}
                  >
                    {option[0].toUpperCase() + option.slice(1)}
                  </FilterChip>
                ))
              : null}
            <button
              type="button"
              onClick={handleAddFreeWorkout}
              className="atlas-button atlas-button-secondary inline-flex h-9 items-center gap-2 px-4 text-[12px]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.9} />
              Add free workout
            </button>
          </div>
        }
      >
        {freeWorkouts.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No free workouts today"
            description="Add an unplanned session — extra cardio, a second lift, or anything outside your training plan."
            action={
              <PrimaryButton type="button" onClick={handleAddFreeWorkout}>
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Add free workout
              </PrimaryButton>
            }
          />
        ) : null}

        {freeWorkouts.length > 0 && filteredFreeWorkouts.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No workouts in this filter"
            description="Switch the filter or add a new free workout."
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
                    statusMeta={statusMeta}
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
          <DialogPanelHeader
            eyebrow={editingWorkout?.plan_id ? 'Plan session' : 'Free workout'}
            title={formTitle}
            description={
              editingWorkout?.plan_id
                ? 'Log your execution against today\'s training plan.'
                : 'Record an unplanned session separate from your training plan.'
            }
            accentClassName="from-[hsl(var(--brand)/0.1)]"
          />
          <WorkoutForm
            key={editingWorkout?.id || editingWorkout?.plan_id || 'new'}
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
