import React, { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  ClipboardList,
  Dumbbell,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import WorkoutComparison from '@/components/workouts/WorkoutComparison';
import {
  DateStepper,
  EmptyState,
  PageShell,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WORKOUT_TYPES, getToday } from '@/lib/atlas-theme';

const INPUT_CLASS_NAME =
  'w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400';
const TEXTAREA_CLASS_NAME = `${INPUT_CLASS_NAME} min-h-[120px] resize-y`;
const WORKOUT_FILTERS = ['all', 'pending', 'completed'];

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

function SummaryTile({ label, value, hint, icon: Icon }) {
  return (
    <article className="rounded-[28px] border border-zinc-200/90 bg-white px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{hint}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function getWorkoutTypeLabel(type) {
  return WORKOUT_TYPES[type]?.label || type || 'Treino';
}

function getWorkoutStatusLabel(status) {
  return status === 'completed' ? 'Completed' : 'Pending';
}

function getWorkoutStatusTone(status) {
  return status === 'completed'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-amber-100 text-amber-700';
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

function WorkoutCard({ workout, onEdit, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-950">{workout.name}</h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getWorkoutStatusTone(workout.status)}`}
              >
                {getWorkoutStatusLabel(workout.status)}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                {getWorkoutTypeLabel(workout.type)}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              {workout.exercises.length} exercicios · {workout.duration_minutes || 0} min · RPE{' '}
              {workout.perceived_effort || '--'}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <InfoBadge label="Volume" value={workout.volume_load || 0} suffix="kg" />
            <InfoBadge label="Data" value={workout.date} />
            <InfoBadge label="Status" value={getWorkoutStatusLabel(workout.status)} />
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Exercises
            </p>
            <div className="mt-2 space-y-2 text-sm text-zinc-700">
              {workout.exercises.map((exercise, index) => (
                <p key={`${exercise.name}-${index}`}>
                  {exercise.name} · {exercise.sets?.length || 0} sets · {exercise.sets?.[0]?.reps || '--'} reps
                  {exercise.sets?.[0]?.weight ? ` @ ${exercise.sets[0].weight}kg` : ''}
                </p>
              ))}
            </div>
          </div>

          {workout.notes ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Notes
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{workout.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Edit
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              workout.status === 'completed'
                ? 'border-zinc-200 bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {workout.status === 'completed' ? 'Reabrir' : 'Concluir'}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoBadge({ label, value, suffix = '' }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-950">
        {value}
        {suffix ? <span className="ml-1 text-xs font-medium text-zinc-500">{suffix}</span> : null}
      </p>
    </div>
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
    <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-zinc-700">
          Data
          <input
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Nome do treino
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ex: Upper A"
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="block text-sm font-medium text-zinc-700">
          Tipo
          <select
            value={form.type}
            onChange={(event) => updateField('type', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          >
            {Object.entries(WORKOUT_TYPES).map(([value, item]) => (
              <option key={value} value={value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Status
          <select
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Duracao
          <input
            type="number"
            min="0"
            value={form.duration_minutes}
            onChange={(event) => updateField('duration_minutes', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          RPE
          <input
            type="number"
            min="0"
            max="10"
            value={form.perceived_effort}
            onChange={(event) => updateField('perceived_effort', event.target.value)}
            className={`${INPUT_CLASS_NAME} mt-2`}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-zinc-700">
        Volume total
        <input
          type="number"
          min="0"
          value={form.volume_load}
          onChange={(event) => updateField('volume_load', event.target.value)}
          className={`${INPUT_CLASS_NAME} mt-2`}
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-700">Exercicios</p>
          <button
            type="button"
            onClick={addExercise}
            className="text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-80"
          >
            + Adicionar exercicio
          </button>
        </div>

        {form.exercises.map((exercise, index) => (
          <div key={`exercise-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_120px_120px_auto]">
              <label className="block text-sm font-medium text-zinc-700">
                Nome
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(event) => updateExercise(index, 'name', event.target.value)}
                  className={`${INPUT_CLASS_NAME} mt-2`}
                />
              </label>

              <label className="block text-sm font-medium text-zinc-700">
                Sets
                <input
                  type="number"
                  min="1"
                  value={exercise.sets}
                  onChange={(event) => updateExercise(index, 'sets', event.target.value)}
                  className={`${INPUT_CLASS_NAME} mt-2`}
                />
              </label>

              <label className="block text-sm font-medium text-zinc-700">
                Reps
                <input
                  type="text"
                  value={exercise.reps}
                  onChange={(event) => updateExercise(index, 'reps', event.target.value)}
                  className={`${INPUT_CLASS_NAME} mt-2`}
                />
              </label>

              <label className="block text-sm font-medium text-zinc-700">
                Peso
                <input
                  type="number"
                  min="0"
                  value={exercise.weight}
                  onChange={(event) => updateExercise(index, 'weight', event.target.value)}
                  className={`${INPUT_CLASS_NAME} mt-2`}
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  disabled={form.exercises.length === 1}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <label className="block text-sm font-medium text-zinc-700">
        Observacoes
        <textarea
          value={form.notes}
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="Ex: treino mais curto, foco em tecnica."
          className={`${TEXTAREA_CLASS_NAME} mt-2`}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit">{workout ? 'Salvar treino' : 'Adicionar treino'}</PrimaryButton>
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
    <PageShell
      title="Workouts"
      subtitle="Tudo nesta tela e especifico de treino: plano do dia, execucao e historico local."
      actions={
        <>
          <DateStepper date={selectedDate} onChange={(amount) => setSelectedDate(shiftDate(selectedDate, amount))} />
          <PrimaryButton type="button" onClick={handleCreate} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Novo treino
          </PrimaryButton>
        </>
      }
      maxWidth="max-w-6xl"
    >
      <StatusBanner tone="warning">
        Workouts agora usa somente estado local desta pagina. Nenhuma logica de Protocols continua ligada a esta rota.
      </StatusBanner>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryTile
          label="Planned"
          value={plannedExerciseCount}
          hint="Exercicios planejados para a data selecionada."
          icon={ClipboardList}
        />
        <SummaryTile
          label="Logged"
          value={workoutsForDate.length}
          hint="Sessoes locais registradas nesta pagina."
          icon={Dumbbell}
        />
        <SummaryTile
          label="Completed"
          value={completedCount}
          hint="Treinos marcados como concluidos neste dia."
          icon={CalendarCheck2}
        />
      </section>

      <SectionCard
        title="Plano vs execucao"
        subtitle="Comparacao correta de treino: plano do dia contra um treino registrado."
        actions={
          workoutsForDate.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {workoutsForDate.map((workout) => (
                <button
                  key={workout.id}
                  type="button"
                  onClick={() => setComparisonWorkoutId(workout.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    comparisonWorkout?.id === workout.id
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                  }`}
                >
                  {workout.name}
                </button>
              ))}
            </div>
          ) : null
        }
      >
        <WorkoutComparison planned={plannedWorkout} logged={comparisonWorkout} />
      </SectionCard>

      <SectionCard
        title="Treinos registrados"
        subtitle="Cards e acoes locais proprias desta tela."
        actions={
          <div className="flex flex-wrap gap-2">
            {WORKOUT_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === option
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        }
      >
        {!workoutsForDate.length ? (
          <EmptyState
            title="Nenhum treino registrado"
            description="Abra o modal correto de treino para adicionar sua execucao do dia."
            action={
              <PrimaryButton type="button" onClick={handleCreate}>
                Novo treino
              </PrimaryButton>
            }
          />
        ) : null}

        {workoutsForDate.length > 0 && filteredWorkouts.length === 0 ? (
          <EmptyState
            title="Nenhum treino neste filtro"
            description="Troque o status ou registre mais um treino para este dia."
          />
        ) : null}

        {filteredWorkouts.length > 0 ? (
          <div className="space-y-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onEdit={() => handleEdit(workout)}
                onToggleStatus={() => handleToggleStatus(workout)}
                onDelete={() => handleDelete(workout)}
              />
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
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] border-zinc-200 bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:max-w-4xl">
          <DialogHeader className="border-b border-zinc-200 px-6 pb-5 pt-6 text-left">
            <DialogTitle className="text-[28px] font-semibold tracking-[-0.04em] text-zinc-950">
              {editingWorkout ? 'Editar treino' : 'Novo treino'}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Este modal pertence apenas a Workouts e manipula somente dados de treino do estado local desta rota.
            </DialogDescription>
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
    </PageShell>
  );
}
