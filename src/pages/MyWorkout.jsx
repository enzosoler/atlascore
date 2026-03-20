import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
// Supabase workout plan services removed — base44 is now the single source of truth
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Sparkles, Loader2, Dumbbell, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CREATOR_LABELS = { ai: 'Atlas AI', coach: 'Coach', user: 'Você' };
const CREATOR_BADGE = { ai: 'badge-ai', coach: 'badge-blue', user: 'badge-neutral' };

function ExerciseCard({ exercise, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--shell))] text-[12px] font-bold text-[hsl(var(--fg-2))]">
            {index + 1}
          </span>
          <div>
            <p className="text-[13px] font-semibold">{exercise.name}</p>
            {exercise.muscle_group && (
              <p className="t-caption">{exercise.muscle_group}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-3 t-caption">
            {exercise.sets > 0 && <span>{exercise.sets} séries</span>}
            {exercise.reps && <span className="hidden sm:inline">{exercise.reps} reps</span>}
            {exercise.rest_seconds > 0 && (
              <span className="hidden sm:inline">{exercise.rest_seconds}s descanso</span>
            )}
          </div>
          {open ? (
            <ChevronUp className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-[hsl(var(--border-h))] pt-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            {exercise.sets > 0 && (
              <div className="rounded-lg bg-[hsl(var(--shell))] p-2 text-center">
                <p className="t-label">Séries</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.sets}</p>
              </div>
            )}
            {exercise.reps && (
              <div className="rounded-lg bg-[hsl(var(--shell))] p-2 text-center">
                <p className="t-label">Reps</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.reps}</p>
              </div>
            )}
            {exercise.rest_seconds > 0 && (
              <div className="rounded-lg bg-[hsl(var(--shell))] p-2 text-center">
                <p className="t-label">Descanso</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.rest_seconds}s</p>
              </div>
            )}
          </div>
          {exercise.notes && (
            <p className="text-[12px] text-[hsl(var(--fg-2))] italic">{exercise.notes}</p>
          )}
          {exercise.technique && (
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              <span className="font-semibold">Técnica:</span> {exercise.technique}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutDayCard({ day }) {
  const [open, setOpen] = useState(false);
  const exercises = day.exercises || [];
  return (
    <div className="surface p-0 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {day.name || day.day || 'Sessão'}
          </p>
          {day.focus && <p className="t-caption mt-0.5">{day.focus}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="t-caption">{exercises.length} exercício{exercises.length !== 1 ? 's' : ''}</span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          )}
        </div>
      </button>
      {open && exercises.length > 0 && (
        <div className="border-t border-[hsl(var(--border-h))] px-4 pb-4 pt-3 space-y-2">
          {exercises.map((ex, i) => (
            <ExerciseCard key={i} exercise={ex} index={i} />
          ))}
        </div>
      )}
      {open && exercises.length === 0 && (
        <div className="border-t border-[hsl(var(--border-h))] px-5 py-4">
          <p className="t-caption">Sem exercícios detalhados.</p>
        </div>
      )}
    </div>
  );
}

export default function MyWorkout() {
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        const p = await base44.entities.UserProfile.list();
        return p?.[0] || null;
      } catch {
        return null;
      }
    },
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['workout-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // base44 is the single source of truth for workout plans
      try {
        return await base44.entities.WorkoutPlan.filter({ active: true }, '-created_date');
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const plan = plans[0] || null;

  const generate = async () => {
    setGenerating(true);
    setGenError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Crie um plano de treino semanal detalhado em português brasileiro para um usuário com o seguinte perfil:
- Objetivo: ${profile?.training_goal || 'hipertrofia'}
- Nível: ${profile?.fitness_level || 'intermediário'}
- Frequência: ${profile?.workout_frequency || '4x por semana'}
- Restrições: ${profile?.health_restrictions || 'nenhuma'}

Crie um plano com 4-5 dias de treino com exercícios reais, séries, repetições e tempo de descanso.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            objective: { type: 'string' },
            frequency: { type: 'string' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  focus: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        muscle_group: { type: 'string' },
                        sets: { type: 'number' },
                        reps: { type: 'string' },
                        rest_seconds: { type: 'number' },
                        notes: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      clearTimeout(timeoutId);

      if (res?.name) {
        // Deactivate previous plans in base44 (single source of truth)
        for (const p of plans) {
          try { await base44.entities.WorkoutPlan.update(p.id, { active: false }); } catch { /* noop */ }
        }
        await base44.entities.WorkoutPlan.create({
          ...res,
          source: 'ai',
          created_by_type: 'ai',
          active: true,
          version: 1,
          start_date: new Date().toISOString().split('T')[0],
        });
        qc.invalidateQueries({ queryKey: ['workout-plans'] });
        qc.invalidateQueries({ queryKey: ['workout-plans-active'] });
        toast.success('Plano de treino gerado com sucesso!');
      } else {
        setGenError('A resposta da IA não continha um plano válido. Tente novamente.');
        toast.error('Erro ao gerar plano. Tente novamente.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        setGenError('A geração demorou muito (>15s). Verifique sua conexão e tente novamente.');
        toast.error('Tempo limite atingido. Tente novamente.');
      } else {
        setGenError('Erro ao conectar com a IA. Tente novamente em alguns instantes.');
        toast.error('Erro ao gerar plano.');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-2 t-small text-[hsl(var(--fg-2))]">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-5 border-b border-[hsl(var(--border-h))]">
        <div>
          <h1 className="t-headline">Meu Treino</h1>
          <p className="t-small mt-1">Plano de treino ativo prescrito</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(ROUTES.manualWorkout)}
            className="btn btn-secondary gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Manual
          </button>
          <button
            onClick={generate}
            disabled={generating}
            className="btn btn-secondary gap-1.5"
          >
            {generating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {plan ? 'Gerar novo plano' : 'Gerar plano por IA'}
          </button>
        </div>
      </div>

      {genError && (
        <div className="rounded-xl border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.06)] px-4 py-3">
          <p className="text-[13px] text-[hsl(var(--err))]">{genError}</p>
        </div>
      )}

      {!plan ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Dumbbell className="w-5 h-5 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
          </div>
          <p className="t-subtitle mb-1">Nenhum plano de treino ativo</p>
          <p className="t-caption mb-4">
            Gere um plano personalizado com IA baseado no seu perfil e objetivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(ROUTES.manualWorkout)}
              className="btn btn-secondary gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar Manualmente
            </button>
            <button
              onClick={generate}
              disabled={generating}
              className="btn btn-primary gap-1.5"
            >
              {generating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Gerar com IA
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Plan header */}
          <div className="surface p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="t-title flex-1">{plan.name}</p>
              <span
                className={`badge ${CREATOR_BADGE[plan.created_by_type] || 'badge-neutral'} gap-1`}
              >
                {CREATOR_LABELS[plan.created_by_type] || 'IA'}
              </span>
              <span className="badge badge-neutral">v{plan.version || 1}</span>
            </div>
            {plan.objective && (
              <p className="t-body text-[hsl(var(--fg-2))]">{plan.objective}</p>
            )}
            {plan.frequency && (
              <p className="t-caption">
                <span className="font-semibold">Frequência:</span> {plan.frequency}
              </p>
            )}
            {plan.start_date && (
              <p className="t-caption">
                Desde{' '}
                {new Date(plan.start_date + 'T12:00').toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Days */}
          <div>
            <p className="t-label mb-3">
              Dias de treino ({(plan.days || []).length})
            </p>
            <div className="space-y-2">
              {(plan.days || []).map((day, i) => (
                <WorkoutDayCard key={i} day={day} />
              ))}
            </div>
          </div>

          {plan.notes && (
            <div className="surface p-4">
              <p className="t-label mb-1">Observações</p>
              <p className="t-body text-[hsl(var(--fg-2))]">{plan.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
