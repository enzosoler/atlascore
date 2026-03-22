import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
// Supabase workout plan services removed — base44 is now the single source of truth
import { useAuth } from '@/lib/AuthContext';
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
            {exercise.sets > 0 && <span>{exercise.sets} sets</span>}
            {exercise.reps && <span className="hidden sm:inline">{exercise.reps} reps</span>}
            {exercise.rest_seconds > 0 && (
              <span className="hidden sm:inline">{exercise.rest_seconds}s rest</span>
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
                <p className="t-label">Sets</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.sets}</p>
              </div>
            )}
            {exercise.reps && (
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
                <p className="t-label">Reps</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.reps}</p>
              </div>
            )}
            {exercise.rest_seconds > 0 && (
            <div className="rounded-[12px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.54)] p-2 text-center">
                <p className="t-label">Rest</p>
                <p className="font-semibold text-[hsl(var(--fg))] mt-0.5">{exercise.rest_seconds}s</p>
              </div>
            )}
          </div>
          {exercise.notes && (
            <p className="text-[12px] text-[hsl(var(--fg-2))] italic">{exercise.notes}</p>
          )}
          {exercise.technique && (
            <p className="text-[12px] text-[hsl(var(--fg-2))]">
              <span className="font-semibold">Technique:</span> {exercise.technique}
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
    <div className="atlas-card overflow-hidden rounded-[18px] p-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {day.name || day.day || 'Session'}
          </p>
          {day.focus && <p className="t-caption mt-0.5">{day.focus}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="t-caption">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</span>
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
          <p className="t-caption">No detailed exercises yet.</p>
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
  const CreatorIcon = plan ? (CREATOR_ICONS[plan.created_by_type] || ClipboardList) : null;

  const generate = async () => {
    setGenerating(true);
    setGenError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed weekly workout plan in polished English for a user with the following profile:
- Goal: ${profile?.training_goal || 'muscle gain'}
- Level: ${profile?.fitness_level || 'intermediate'}
- Frequency: ${profile?.workout_frequency || '4x per week'}
- Restrictions: ${profile?.health_restrictions || 'none'}

Create a 4-5 day workout plan with real exercises, sets, reps, and rest time.`,
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
        toast.success('Workout plan generated successfully.');
      } else {
        setGenError('The plan response did not include a valid structure. Please try again.');
        toast.error('Could not generate the plan. Please try again.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        setGenError('Generation took too long (>15s). Check your connection and try again.');
        toast.error('Request timed out. Please try again.');
      } else {
        setGenError('Could not connect to the plan service. Please try again in a moment.');
        toast.error('Error generating plan.');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 t-small text-[hsl(var(--fg-2))]">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <AppContainer maxWidth="max-w-3xl">
      <PageHeader
        eyebrow="Train"
        title="My Workout"
        subtitle="Review the active plan, compare its origin, and scan the structure of days and exercises quickly."
        actions={(
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              onClick={() => navigate(ROUTES.manualWorkout)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create manually
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
              {plan ? 'Generate new plan' : 'Generate plan'}
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
            title="No active workout plan"
            description="Create one manually or generate a structured plan based on your profile and goals."
            action={(
              <div className="flex flex-col gap-3 sm:flex-row">
                <SecondaryButton
                  onClick={() => navigate(ROUTES.manualWorkout)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create manually
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
                  Generate plan
                </PrimaryButton>
              </div>
            )}
          />
        </Card>
      ) : (
        <>
          <Section eyebrow="Plan" title={plan.name} subtitle={plan.objective || 'Active plan ready to execute.'}>
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
                <span className="font-semibold">Frequency:</span> {plan.frequency}
              </p>
            )}
            {plan.start_date && (
              <p className="t-caption">
                Since{' '}
                {new Date(plan.start_date + 'T12:00').toLocaleDateString('en-US')}
              </p>
            )}
            </Card>
          </Section>

          <Section
            eyebrow="Structure"
            title={`Training days (${(plan.days || []).length})`}
            subtitle="Each card shows the day's focus and opens the detailed exercises."
          >
            <div className="space-y-2">
              {(plan.days || []).map((day, i) => (
                <WorkoutDayCard key={i} day={day} />
              ))}
            </div>
          </Section>

          {plan.notes && (
            <Card className="p-4">
              <p className="t-label mb-1">Notes</p>
              <p className="t-body text-[hsl(var(--fg-2))]">{plan.notes}</p>
            </Card>
          )}
        </>
      )}
    </AppContainer>
  );
}
