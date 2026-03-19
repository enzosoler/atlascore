import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dumbbell, Play, Plus, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, Calendar, ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert a plan-day exercise (plan schema) → execution exercise (session schema) */
function planExToExecution(ex) {
  const setCount = typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 3;
  const setsArr = Array.from({ length: setCount }, (_, i) => ({
    set_number: i + 1,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.target_weight ?? null,
  }));
  return {
    name: ex.name,
    primary_muscles: ex.muscle_group ? [ex.muscle_group] : [],
    technique: ex.technique || null,
    rest_seconds: ex.rest_seconds || 60,
    execution_notes: ex.notes || null,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.target_weight ?? null,
    sets: setsArr,
  };
}

/** Build a new WorkoutSession object from a plan + day index */
function buildSessionFromPlan(plan, dayIndex) {
  const day = plan.days[dayIndex];
  return {
    name: day.name || day.day || `Dia ${dayIndex + 1}`,
    date: new Date().toISOString().split('T')[0],
    plan_id: plan.id,
    plan_day_index: dayIndex,
    status: 'in_progress',
    exercises: (day.exercises || []).map(planExToExecution),
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PlanDayCard({ day, dayIndex, onStart, isStarting }) {
  const [open, setOpen] = useState(false);
  const exercises = day.exercises || [];
  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center justify-between text-left gap-3 min-w-0"
        >
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))] truncate">
              {day.name || day.day || `Dia ${dayIndex + 1}`}
            </p>
            {day.focus && <p className="t-caption mt-0.5 truncate">{day.focus}</p>}
            <p className="t-caption">{exercises.length} exercício{exercises.length !== 1 ? 's' : ''}</p>
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          )}
        </button>
        <button
          onClick={() => onStart(dayIndex)}
          disabled={isStarting}
          className="btn btn-primary h-9 px-4 rounded-lg text-[13px] gap-1.5 shrink-0"
        >
          {isStarting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          Iniciar
        </button>
      </div>

      {open && exercises.length > 0 && (
        <div className="border-t border-[hsl(var(--border-h))] px-5 pb-4 pt-3 space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-[hsl(var(--border-h))] last:border-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--shell))] text-[11px] font-bold text-[hsl(var(--fg-2))] mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{ex.name}</p>
                <p className="t-caption">
                  {ex.muscle_group && <span>{ex.muscle_group} · </span>}
                  {typeof ex.sets === 'number' && <span>{ex.sets} séries</span>}
                  {ex.reps && <span> × {ex.reps} reps</span>}
                  {ex.rest_seconds > 0 && <span> · {ex.rest_seconds}s descanso</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentSessionCard({ session }) {
  const dateStr = session.date
    ? format(new Date(session.date + 'T12:00'), 'EEE, d MMM', { locale: ptBR })
    : '—';
  const isComplete = session.status === 'completed';
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--shell))] transition-colors">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isComplete ? 'bg-[hsl(var(--ok)/0.1)]' : 'bg-[hsl(var(--shell))]'}`}>
        {isComplete ? (
          <CheckCircle2 className="w-4 h-4 text-[hsl(var(--ok))]" />
        ) : (
          <Dumbbell className="w-4 h-4 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[hsl(var(--fg))] truncate">{session.name}</p>
        <p className="t-caption">{dateStr} · {session.exercises?.length || 0} exercícios</p>
      </div>
      {isComplete && (
        <span className="badge badge-neutral text-[10px] shrink-0">Concluído</span>
      )}
    </div>
  );
}

// ─── Free-form quick session ──────────────────────────────────────────────────

function buildFreeSession(name) {
  return {
    name: name || 'Sessão Livre',
    date: new Date().toISOString().split('T')[0],
    plan_id: null,
    plan_day_index: null,
    status: 'in_progress',
    exercises: [],
  };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WorkoutsV2() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [mode, setMode] = useState('planning'); // 'planning' | 'execution'
  const [activeSession, setActiveSession] = useState(null); // persisted Workout entity
  const [startingDay, setStartingDay] = useState(null); // dayIndex being started

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: activePlans = [], isLoading: loadingPlan } = useQuery({
    queryKey: ['workout-plans-active'],
    queryFn: () => base44.entities.WorkoutPlan.filter({ active: true }),
  });

  const activePlan = activePlans[0] || null;

  const { data: recentSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['workout-sessions-recent'],
    queryFn: () => base44.entities.Workout.list('-created_date', 10),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createSessionMut = useMutation({
    mutationFn: (sessionData) => base44.entities.Workout.create(sessionData),
    onSuccess: (created, dayIndex) => {
      qc.invalidateQueries({ queryKey: ['workout-sessions-recent'] });
      setActiveSession(created);
      setStartingDay(null);
      setMode('execution');
    },
    onError: () => setStartingDay(null),
  });

  const completeSessionMut = useMutation({
    mutationFn: ({ id, completedData }) =>
      base44.entities.Workout.update(id, { ...completedData, status: 'completed' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-sessions-recent'] });
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStartFromPlan = (dayIndex) => {
    if (!activePlan) return;
    setStartingDay(dayIndex);
    const sessionData = buildSessionFromPlan(activePlan, dayIndex);
    createSessionMut.mutate(sessionData);
  };

  const handleStartFreeSession = () => {
    const sessionData = buildFreeSession('Sessão Livre');
    createSessionMut.mutate(sessionData);
  };

  const handleSessionComplete = (completedData) => {
    if (activeSession?.id) {
      completeSessionMut.mutate({ id: activeSession.id, completedData });
    }
    setActiveSession(null);
    setMode('planning');
  };

  // ── Execution Mode ────────────────────────────────────────────────────────

  if (mode === 'execution' && activeSession) {
    return (
      <div className="pb-20 lg:pb-8">
        <div className="px-5 pt-5 lg:px-8">
          <button
            onClick={() => {
              setActiveSession(null);
              setMode('planning');
            }}
            className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] font-medium transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancelar treino
          </button>
          <p className="t-headline">{activeSession.name}</p>
          {activeSession.date && (
            <p className="t-caption">
              {format(new Date(activeSession.date + 'T12:00'), 'EEEE, d MMM', { locale: ptBR })}
            </p>
          )}
        </div>
        <WorkoutExecutionScreen
          workout={activeSession}
          onComplete={handleSessionComplete}
        />
      </div>
    );
  }

  // ── Planning Mode ─────────────────────────────────────────────────────────

  const isLoading = loadingPlan || loadingSessions;

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="t-headline mb-1">Treinos</h1>
          <p className="t-caption">
            {format(new Date(), 'EEEE, d MMM', { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStartFreeSession}
            disabled={createSessionMut.isPending}
            className="btn btn-secondary h-10 gap-1.5 text-[13px]"
          >
            {createSessionMut.isPending && startingDay === null ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Treino livre
          </button>
          <button
            onClick={() => navigate(ROUTES.myWorkout)}
            className="btn btn-secondary h-10 gap-1.5 text-[13px]"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Meu Plano
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 t-small text-[hsl(var(--fg-2))]">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <>
          {/* Active plan days */}
          {activePlan ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="t-subtitle">{activePlan.name}</p>
                  {activePlan.frequency && (
                    <p className="t-caption mt-0.5">{activePlan.frequency}</p>
                  )}
                </div>
                <span className="badge badge-neutral text-[11px]">
                  {(activePlan.days || []).length} dias
                </span>
              </div>
              <div className="space-y-2">
                {(activePlan.days || []).map((day, i) => (
                  <PlanDayCard
                    key={i}
                    day={day}
                    dayIndex={i}
                    onStart={handleStartFromPlan}
                    isStarting={startingDay === i && createSessionMut.isPending}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="surface p-6 text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--shell))] flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <p className="t-subtitle mb-1">Nenhum plano de treino ativo</p>
                <p className="t-caption">
                  Crie um plano em "Meu Plano" para organizar seus treinos.
                </p>
              </div>
              <button
                onClick={() => navigate(ROUTES.myWorkout)}
                className="btn btn-primary gap-1.5 text-[13px]"
              >
                <Dumbbell className="w-3.5 h-3.5" /> Ver Meu Plano
              </button>
            </div>
          )}

          {/* Recent sessions */}
          {recentSessions.length > 0 && (
            <div className="surface p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[hsl(var(--fg-2))]" />
                <p className="t-subtitle">Sessões recentes</p>
              </div>
              <div className="space-y-1">
                {recentSessions.slice(0, 8).map((s) => (
                  <RecentSessionCard key={s.id} session={s} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
