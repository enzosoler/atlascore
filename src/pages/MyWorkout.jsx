import React, { useState } from 'react';
import { useT } from '@/lib/i18nContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { getActiveWorkoutPlans, createWorkoutPlan, deactivateAllWorkoutPlans } from '@/services/workoutPlanService';
import { supabase } from '@/lib/supabaseClient';
import { invokeLLMJson } from '@/lib/llm';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { ClipboardList, Loader2, Dumbbell, ChevronDown, ChevronUp, Plus, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, PrimaryButton, SecondaryButton, StatusBanner } from '@/components/shared/StablePage';

const CREATOR_LABELS = { ai: 'Generated', coach: 'Coach', user: 'You' };
const CREATOR_BADGE = { ai: 'badge-neutral', coach: 'badge-blue', user: 'badge-neutral' };
const CREATOR_ICONS = { ai: ClipboardList, coach: Users, user: User };

function ExerciseCard({ exercise, index }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="atlas-card rounded-[18px]">
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
            {exercise.sets > 0 && <span>{exercise.sets} {t('myWorkout.exercise_card.sets')}</span>}
            {exercise.reps && <span className="hidden sm:inline">{exercise.reps} {t('myWorkout.exercise_card.reps')}</span>}
            {exercise.rest_seconds > 0 && (
              <span className="hidden sm:inline">{exercise.rest_seconds}s {t('myWorkout.exercise_card.rest')}</span>
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
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
                <p className="t-label">{t('myWorkout.exercise_card.sets')}</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.sets}</p>
              </div>
            )}
            {exercise.reps && (
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
                <p className="t-label">{t('myWorkout.exercise_card.reps')}</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.reps}</p>
              </div>
            )}
            {exercise.rest_seconds > 0 && (
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
                <p className="t-label">{t('myWorkout.exercise_card.rest')}</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.rest_seconds}s</p>
              </div>
            )}
          </div>
          {exercise.notes && (
            <p className="text-[12px] text-[hsl(var(--fg-2))] italic">{exercise.notes}</p>
          )}
          {exercise.technique && (
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              <span className="font-semibold">{t('myWorkout.exercise_card.technique')}:</span> {exercise.technique}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutDayCard({ day }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const exercises = day.exercises || [];
  return (
    <div className="atlas-card overflow-hidden rounded-[18px] p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {day.name || day.day || t('myWorkout.day_card.session')}
          </p>
          {day.focus && <p className="t-caption mt-0.5">{day.focus}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="t-caption">{exercises.length} {exercises.length !== 1 ? t('myWorkout.day_card.exercises') : t('myWorkout.day_card.exercise')}</span>
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
          <p className="t-caption">{t('myWorkout.day_card.no_exercises')}</p>
        </div>
      )}
    </div>
  );
}

export default function MyWorkout() {
  const t = useT();
  const { isAuthenticated, isLoadingAuth, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(ROUTES.home, { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        return data || null;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['workout-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        return await getActiveWorkoutPlans(user.id);
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const plan = plans[0] || null;
  const CreatorIcon = plan ? (CREATOR_ICONS[plan.created_by_type] || ClipboardList) : null;

  const generate = async () => {
    setGenerating(true);
    setGenError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await invokeLLMJson(
        `Create a detailed weekly workout plan in polished English for a user with the following profile:
- Goal: ${profile?.training_goal || 'muscle gain'}
- Level: ${profile?.fitness_level || 'intermediate'}
- Frequency: ${profile?.workout_frequency || '4x per week'}
- Restrictions: ${profile?.health_restrictions || 'none'}

Create a 4-5 day workout plan with real exercises, sets, reps, and rest time.`,
        {
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
      );

      clearTimeout(timeoutId);

      if (res?.name) {
        // Deactivate previous plans
        try { await deactivateAllWorkoutPlans(user.id); } catch { /* noop */ }
        await createWorkoutPlan(user.id, {
          ...res,
          source: 'ai',
          created_by_type: 'ai',
          active: true,
          version: 1,
          start_date: new Date().toISOString().split('T')[0],
        });
        qc.invalidateQueries({ queryKey: ['workout-plans'] });
        qc.invalidateQueries({ queryKey: ['workout-plans-active'] });
        toast.success(t('myWorkout.messages.plan_generated'));
      } else {
        setGenError(t('myWorkout.messages.plan_invalid_structure'));
        toast.error(t('myWorkout.messages.plan_generate_error'));
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        setGenError(t('myWorkout.messages.plan_timeout'));
        toast.error(t('myWorkout.messages.request_timeout'));
      } else {
        setGenError(t('myWorkout.messages.plan_connect_error'));
        toast.error(t('myWorkout.messages.plan_generate_error'));
      }
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 t-small text-[hsl(var(--fg-2))]">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('myWorkout.messages.loading')}
      </div>
    );
  }

  return (
    <AppContainer maxWidth="max-w-3xl">
      <PageHeader
        eyebrow={t('myWorkout.eyebrow')}
        title={t('myWorkout.title')}
        subtitle={t('myWorkout.subtitle')}
        actions={(
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              onClick={() => navigate(ROUTES.manualWorkout)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('myWorkout.actions.create_manually')}
            </SecondaryButton>
            <PrimaryButton
              onClick={generate}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardList className="h-4 w-4" />
              )}
              {plan ? t('myWorkout.actions.generate_new_plan') : t('myWorkout.actions.generate_plan')}
            </PrimaryButton>
          </div>
        )}
      />

      {genError && (
        <StatusBanner tone="error">{genError}</StatusBanner>
      )}

      {!plan ? (
        <Card className="px-5 py-4">
          <EmptyState
            icon={Dumbbell}
            title={t('myWorkout.empty.title')}
            description={t('myWorkout.empty.description')}
            action={(
              <div className="flex flex-col gap-3 sm:flex-row">
                <SecondaryButton
                  onClick={() => navigate(ROUTES.manualWorkout)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('myWorkout.actions.create_manually')}
                </SecondaryButton>
                <PrimaryButton
                  onClick={generate}
                  disabled={generating}
                  className="gap-2"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardList className="h-4 w-4" />
                  )}
                  {t('myWorkout.actions.generate_plan')}
                </PrimaryButton>
              </div>
            )}
          />
        </Card>
      ) : (
        <>
          <Section eyebrow={t('myWorkout.plan.eyebrow')} title={plan.name} subtitle={plan.objective || t('myWorkout.plan.active_plan_subtitle')}>
            <Card className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`badge ${CREATOR_BADGE[plan.created_by_type] || 'badge-neutral'} gap-1`}
              >
                {CreatorIcon && <CreatorIcon className="w-3 h-3" />}
                {CREATOR_LABELS[plan.created_by_type] || 'Generated'}
              </span>
              <span className="badge badge-neutral">v{plan.version || 1}</span>
            </div>
            {plan.objective && (
              <p className="t-body text-[hsl(var(--fg-2))]">{plan.objective}</p>
            )}
            {plan.frequency && (
              <p className="t-caption">
                <span className="font-semibold">{t('myWorkout.plan.frequency')}:</span> {plan.frequency}
              </p>
            )}
            {plan.start_date && (
              <p className="t-caption">
                {t('myWorkout.plan.since')}{' '}
                {new Date(plan.start_date + 'T12:00').toLocaleDateString('en-US')}
              </p>
            )}
            </Card>
          </Section>

          <Section
            eyebrow={t('myWorkout.structure.eyebrow')}
            title={t('myWorkout.structure.title').replace('{count}', (plan.days || []).length)}
            subtitle={t('myWorkout.structure.subtitle')}
          >
            <div className="space-y-2">
              {(plan.days || []).map((day, i) => (
                <WorkoutDayCard key={i} day={day} />
              ))}
            </div>
          </Section>

          {plan.notes && (
            <Card className="p-4">
              <p className="t-label mb-1">{t('myWorkout.plan.notes')}</p>
              <p className="t-body text-[hsl(var(--fg-2))]">{plan.notes}</p>
            </Card>
          )}
        </>
      )}
    </AppContainer>
  );
}
