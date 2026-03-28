import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Heart,
  Loader2,
  Timer,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import ExerciseMedia from '@/components/exercises/ExerciseMedia.jsx';
import {
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  EmptyState,
  PrimaryButton,
  SecondaryButton,
} from '@/components/shared/StablePage';
import { useI18n } from '@/lib/i18nContext';
import {
  bodyPartToPT,
  equipmentToPT,
  exerciseKeys,
  FATIGUE_PROFILE_LABELS,
  fetchExercise,
  MOVEMENT_PATTERN_LABELS,
  muscleToPT,
  RESISTANCE_CURVE_LABELS,
  STABILITY_LABELS,
} from '@/lib/exerciseDB/index.js';

function MetaPill({ label, value, accent = false }) {
  if (!value) return null;

  return (
    <div
      className={
        accent
          ? 'inline-flex items-center rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)] px-3 py-1.5 text-[12px] font-semibold text-[hsl(var(--brand))]'
          : 'inline-flex items-center rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.78)] px-3 py-1.5 text-[12px] font-semibold text-[hsl(var(--fg-2))]'
      }
    >
      {label ? <span className="mr-1.5 text-[hsl(var(--fg-3))]">{label}</span> : null}
      <span className={accent ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg))]'}>{value}</span>
    </div>
  );
}

function DetailCard({ label, value, hint, icon: Icon }) {
  if (!value) return null;

  return (
    <Card className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            {value}
          </p>
          {hint ? <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.74)] text-[hsl(var(--brand))]">
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function BulletList({ items = [], tone = 'brand', ordered = false }) {
  if (!items.length) return null;

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex gap-3">
          <div
            className={
              tone === 'danger'
                ? 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--err)/0.14)] text-[11px] font-bold text-[hsl(var(--err))]'
                : 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[11px] font-bold text-[hsl(var(--brand))]'
            }
          >
            {ordered ? index + 1 : tone === 'danger' ? '!' : '✓'}
          </div>
          <p className="text-[14px] leading-7 text-[hsl(var(--fg-2))]">{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: exercise, isLoading } = useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => fetchExercise(id),
    staleTime: 300_000,
  });

  const { data: log } = useQuery({
    queryKey: ['exercise-log', id],
    queryFn: async () => null,
    enabled: !!id,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (log?.is_favorite !== undefined) {
      setIsFavorite(log.is_favorite);
    }
  }, [log]);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const nextFavorite = !isFavorite;
      const exerciseName = exercise?.canonical_name_en || exercise?.name || exercise?.canonical_name_pt || '';

      // ExerciseLog table not yet migrated — favorite state is local-only for now

      setIsFavorite(nextFavorite);
      queryClient.invalidateQueries({ queryKey: ['exercise-log', id] });
      toast(nextFavorite ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: () => toast.error('Unable to update favorites right now.'),
  });

  if (isLoading) {
    return (
      <AppContainer maxWidth="max-w-4xl">
        <Card className="px-5 py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={1.9} />
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              Loading exercise detail
            </p>
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Pulling instructions, prescription defaults, and your history.
            </p>
          </div>
        </Card>
      </AppContainer>
    );
  }

  if (!exercise) {
    return (
      <AppContainer maxWidth="max-w-4xl">
        <Card className="px-0 py-0">
          <EmptyState
            icon={Zap}
            title="Exercise not found"
            description="This movement could not be loaded. Return to the library and choose another exercise."
            action={
              <SecondaryButton type="button" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
                Back
              </SecondaryButton>
            }
          />
        </Card>
      </AppContainer>
    );
  }

  const displayName = exercise.canonical_name_en || exercise.name || exercise.canonical_name_pt || 'Exercise';
  const primaryMuscles = exercise.primary_muscles || [];
  const secondaryMuscles = exercise.secondary_muscles || [];
  const instructionsEN = exercise.instructions?.en || [];
  const formCues = exercise.form_cues_en || [];
  const commonMistakes = exercise.common_mistakes_en || [];
  const difficultyLabel =
    exercise.difficulty_level === 'beginner'
      ? 'Beginner'
      : exercise.difficulty_level === 'intermediate'
        ? 'Intermediate'
        : exercise.difficulty_level === 'advanced'
          ? 'Advanced'
          : exercise.difficulty_level;

  const headerBadges = [
    exercise.equipment ? equipmentToPT(exercise.equipment) : null,
    exercise.body_part ? bodyPartToPT(exercise.body_part) : null,
    exercise.movement_pattern ? MOVEMENT_PATTERN_LABELS[exercise.movement_pattern] : null,
  ].filter(Boolean);

  return (
    <AppContainer maxWidth="max-w-4xl">
      <PageHeader
        eyebrow="Exercise detail"
        title={displayName}
        subtitle="Structured execution cues, prescription defaults, and your personal history in one place."
        accentClassName="from-[hsl(var(--brand)/0.14)] via-[hsl(var(--brand)/0.04)]"
        actions={
          <ActionRow>
            <SecondaryButton type="button" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.9} />
              Back
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => toggleFavorite.mutate()} disabled={toggleFavorite.isPending}>
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-[hsl(var(--err))]' : ''}`} strokeWidth={1.9} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </SecondaryButton>
          </ActionRow>
        }
      >
        <div className="flex flex-wrap gap-2">
          {difficultyLabel ? <MetaPill value={difficultyLabel} accent /> : null}
          {headerBadges.map((badge) => (
            <MetaPill key={badge} value={badge} />
          ))}
        </div>
      </PageHeader>

      <Section eyebrow="Overview" title="Visual reference" subtitle="Use the motion preview and metadata to confirm the movement before adding it to a session.">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden px-0 py-0">
            <ExerciseMedia exercise={exercise} size="lg" />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <DetailCard label="Difficulty" value={difficultyLabel || 'Not set'} hint="Intensity and coordination demand." icon={Activity} />
            <DetailCard
              label="Resistance curve"
              value={exercise.resistance_curve ? RESISTANCE_CURVE_LABELS[exercise.resistance_curve] : 'Not set'}
              hint="Where the movement feels hardest through the range."
              icon={BarChart3}
            />
            <DetailCard
              label="Default rest"
              value={exercise.default_rest_seconds ? `${exercise.default_rest_seconds}s` : 'Not set'}
              hint="Suggested recovery time between work sets."
              icon={Timer}
            />
          </div>
        </div>
      </Section>

      <Section eyebrow="Metadata" title="Execution profile" subtitle="Core descriptors that help you decide when and how to use the movement.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            label="Movement pattern"
            value={exercise.movement_pattern ? MOVEMENT_PATTERN_LABELS[exercise.movement_pattern] : 'Not set'}
            hint="Primary movement classification."
            icon={Activity}
          />
          <DetailCard
            label="Fatigue profile"
            value={exercise.fatigue_profile ? FATIGUE_PROFILE_LABELS[exercise.fatigue_profile] : 'Not set'}
            hint="Useful when organizing effort inside the session."
            icon={Zap}
          />
          <DetailCard
            label="Stability"
            value={exercise.stability ? STABILITY_LABELS[exercise.stability] : 'Not set'}
            hint="How much balance and control the movement requires."
            icon={BarChart3}
          />
          <DetailCard
            label="Prescription"
            value={
              exercise.default_set_range || exercise.default_rep_range
                ? `${exercise.default_set_range || '—'} sets · ${exercise.default_rep_range || '—'} reps`
                : 'Not set'
            }
            hint="Default programming guidance."
            icon={Timer}
          />
        </div>
      </Section>

      {(primaryMuscles.length || secondaryMuscles.length) ? (
        <Section eyebrow="Muscles" title="Primary and secondary demand" subtitle="Quickly confirm what the movement is meant to load before adding it to a routine.">
          <Card className="space-y-5 px-5 py-5">
            {primaryMuscles.length ? (
              <div className="space-y-2.5">
                <p className="atlas-metric-label">Primary</p>
                <div className="flex flex-wrap gap-2">
                  {primaryMuscles.map((muscle) => (
                    <MetaPill key={muscle} value={muscleToPT(muscle)} accent />
                  ))}
                </div>
              </div>
            ) : null}
            {secondaryMuscles.length ? (
              <div className="space-y-2.5">
                <p className="atlas-metric-label">Secondary</p>
                <div className="flex flex-wrap gap-2">
                  {secondaryMuscles.map((muscle) => (
                    <MetaPill key={muscle} value={muscleToPT(muscle)} />
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </Section>
      ) : null}

      {instructionsEN.length ? (
        <Section eyebrow="Instructions" title="How to perform it" subtitle="Concise steps you can scan quickly before the set starts.">
          <Card className="px-5 py-5">
            <BulletList items={instructionsEN} ordered />
          </Card>
        </Section>
      ) : null}

      {formCues.length ? (
        <Section eyebrow="Coaching cues" title="What to keep in mind" subtitle="Short form reminders for better execution quality and repeatability.">
          <Card className="px-5 py-5">
            <BulletList items={formCues} />
          </Card>
        </Section>
      ) : null}

      {commonMistakes.length ? (
        <Section eyebrow="Watch-outs" title="Common mistakes" subtitle="Failure points worth checking when performance or sensation feels off.">
          <Card className="px-5 py-5">
            <BulletList items={commonMistakes} tone="danger" />
          </Card>
        </Section>
      ) : null}

      <Section eyebrow="History" title="Your usage context" subtitle="Personal signals from previous sessions make the exercise page more actionable than a generic library entry.">
        <Card className="px-5 py-5">
          {log ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard label="Used" value={`${log.use_count || 0} times`} hint="How often this movement appears in your logs." icon={Zap} />
              <DetailCard
                label="Last used"
                value={log.last_used_at ? new Date(log.last_used_at).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US') : 'Never'}
                hint="Most recent logged session."
                icon={Timer}
              />
              <DetailCard
                label="PR weight"
                value={log.personal_record_weight ? `${log.personal_record_weight} kg` : 'No PR yet'}
                hint={log.personal_record_reps ? `${log.personal_record_reps} reps recorded` : 'No rep record saved.'}
                icon={BarChart3}
              />
              <DetailCard
                label="Favorite"
                value={isFavorite ? 'Saved' : 'Not saved'}
                hint="Use favorites for faster access in planning."
                icon={Heart}
              />
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No personal history yet"
              description="Once you use this movement inside a workout, your log and PR context will appear here."
            />
          )}
        </Card>
      </Section>

      <div className="sticky bottom-5 z-20">
        <Card className="px-4 py-4 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="atlas-metric-label">Next step</p>
              <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                Add this exercise to a routine or working session
              </p>
            </div>
            <PrimaryButton type="button" onClick={() => navigate(-1)} className="sm:min-w-[220px]">
              <Zap className="h-4 w-4" strokeWidth={1.9} />
              Add to workout
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </AppContainer>
  );
}
