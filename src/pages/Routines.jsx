import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  Dumbbell,
  Plus,
  Search,
  User,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import RoutineCard from '@/components/routines/RoutineCard';
import RoutineForm from '@/components/routines/RoutineForm';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import {
  EmptyState,
  FilterChip,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  StatusBanner,
} from '@/components/shared/StablePage';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

const ROUTINE_SCOPES = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'personal', label: 'Personal' },
  { key: 'prescribed', label: 'Prescribed' },
  { key: 'draft', label: 'Drafts' },
];

function getRoutineSourceMeta(routine) {
  const sourceType =
    routine?.is_prescribed || routine?.created_by_type === 'coach'
      ? 'coach'
      : routine?.created_by_type === 'ai'
        ? 'ai'
        : 'user';

  return {
    sourceType,
    label: sourceType === 'coach' ? 'Coach' : sourceType === 'ai' ? 'AI' : 'You',
    icon: sourceType === 'coach' ? UserCheck : sourceType === 'ai' ? ClipboardList : User,
    tone:
      sourceType === 'coach'
        ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
        : sourceType === 'ai'
          ? 'border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]',
  };
}

function getRoutineSummary(routine) {
  const days = Array.isArray(routine?.days) ? routine.days : Array.isArray(routine?.days_of_week) ? routine.days_of_week : [];
  const exerciseCount = days.reduce((sum, day) => sum + (day?.exercises?.length || 0), 0);
  const scheduledCount = days.filter((day) => day?.day != null || day?.label || day?.name || day?.focus).length;
  const source = getRoutineSourceMeta(routine);

  return {
    days,
    exerciseCount,
    scheduledCount,
    source,
  };
}

function formatDateLabel(iso, locale) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Routines() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneName, setCloneName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scope, setScope] = useState('all');

  const {
    data: routines = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['workout-plans', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      return data || [];
    },
  });

  const deleteRoutine = useMutation({
    mutationFn: async (id) => {
      const { error: deleteError } = await supabase.from('workout_plans').delete().eq('id', id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-plans', user?.id] });
      toast.success('Routine deleted');
    },
    onError: (mutationError) => {
      toast.error(mutationError?.message || 'Could not delete routine');
    },
  });

  const cloneRoutine = useMutation({
    mutationFn: async ({ source, name }) => {
      if (!user?.id) {
        throw new Error('You need to be signed in to clone a routine.');
      }

      const clonedDays = Array.isArray(source.days)
        ? source.days.map((day) => ({
            ...day,
            exercises: Array.isArray(day.exercises)
              ? day.exercises.map((exercise) => ({ ...exercise }))
              : [],
          }))
        : [];

      return supabase.from('workout_plans').insert({
        user_id: user.id,
        name: name.trim(),
        objective: source.objective || source.description || null,
        notes: source.notes || source.description || null,
        frequency: source.frequency || clonedDays.length || 0,
        days: clonedDays,
        estimated_duration_minutes: source.estimated_duration_minutes || null,
        total_exercises: source.total_exercises || 0,
        source: 'user',
        created_by_type: 'user',
        active: false,
        version: 1,
        start_date: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout-plans', user?.id] });
      setShowClone(false);
      setCloneSource(null);
      setCloneName('');
      toast.success('Routine cloned to your library');
    },
    onError: (mutationError) => {
      toast.error(mutationError?.message || 'Could not clone routine');
    },
  });

  const sortedRoutines = useMemo(() => {
    return [...routines].sort((a, b) => {
      const activeDelta = Number(!!b.active) - Number(!!a.active);
      if (activeDelta !== 0) return activeDelta;

      const left = new Date(b.updated_at || b.created_at || 0).getTime();
      const right = new Date(a.updated_at || a.created_at || 0).getTime();
      return left - right;
    });
  }, [routines]);

  const activeRoutine = useMemo(() => sortedRoutines.find((routine) => routine.active) || null, [sortedRoutines]);

  const filteredRoutines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sortedRoutines.filter((routine) => {
      const { sourceType } = getRoutineSourceMeta(routine);
      const isPrescribed = sourceType === 'coach';
      const isActive = !!routine.active;
      const matchesScope =
        scope === 'all'
          ? true
          : scope === 'active'
            ? isActive
            : scope === 'prescribed'
              ? isPrescribed
              : scope === 'draft'
                ? !isActive
                : !isPrescribed;

      if (!matchesScope) return false;
      if (!query) return true;

      const haystack = [
        routine.name,
        routine.objective,
        routine.description,
        routine.notes,
        routine.frequency,
        ...(Array.isArray(routine.days)
          ? routine.days.flatMap((day) => [day?.label, day?.name, day?.focus, ...(day?.exercises || []).map((exercise) => exercise?.name)])
          : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [sortedRoutines, searchTerm, scope]);

  const personalRoutines = filteredRoutines.filter((routine) => getRoutineSourceMeta(routine).sourceType !== 'coach');
  const prescribedRoutines = filteredRoutines.filter((routine) => getRoutineSourceMeta(routine).sourceType === 'coach');

  const activeSummary = activeRoutine ? getRoutineSummary(activeRoutine) : null;

  return (
    <AppContainer maxWidth="max-w-6xl">
      <PageHeader
        eyebrow="Train"
        title="Workout routines"
        subtitle="Browse reusable templates, see who owns them, and keep one active plan pinned for today."
        actions={(
          <PrimaryButton className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            New routine
          </PrimaryButton>
        )}
      />

      <div className="space-y-6 pb-10">
        {isLoading && <LoadingState title="Loading routines" description="Fetching your saved workout plans and shared templates." />}

        {isError && (
          <StatusBanner tone="error">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[hsl(var(--fg))]">Could not load routines</p>
              <p className="text-sm leading-6 text-[hsl(var(--fg-2))]">
                {error?.message || 'The workout plan list is unavailable right now.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton className="h-10" onClick={() => refetch()}>
                  Try again
                </SecondaryButton>
                <PrimaryButton className="h-10" onClick={() => setShowCreate(true)}>
                  Create routine
                </PrimaryButton>
              </div>
            </div>
          </StatusBanner>
        )}

        {!isLoading && !isError && (
          <>
            <Card className="border-[hsl(var(--border)/0.9)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.08),transparent_34%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand))]">
                      Library
                    </span>
                    {activeRoutine ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.1)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--ok))]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active routine
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.64)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
                        <AlertCircle className="h-3.5 w-3.5" />
                        No active routine
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-[1.5rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                    {activeRoutine ? activeRoutine.name : 'Your routines live here'}
                  </p>
                  <p className="mt-2 max-w-2xl text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                    {activeRoutine
                      ? `${activeRoutine.objective || activeRoutine.description || 'This is the plan currently pinned for training.'}`
                      : 'Create a reusable template, clone a coach-assigned plan, or use My Workout for a live active plan.'}
                  </p>
                  {activeRoutine && activeSummary && (() => {
                    const SourceIcon = activeSummary.source.icon;
                    return (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.04em]',
                          activeSummary.source.tone
                        )}>
                          <SourceIcon className="h-3 w-3" strokeWidth={2} />
                          {activeSummary.source.label}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.68)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                          <Calendar className="h-3 w-3" />
                          {activeSummary.days.length} days
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.68)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                          <Dumbbell className="h-3 w-3" />
                          {activeSummary.exerciseCount} exercises
                        </span>
                        {activeRoutine.last_completed_date && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.68)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                            <Clock className="h-3 w-3" />
                            Last completed {formatDateLabel(activeRoutine.last_completed_date, locale)}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid min-w-[280px] gap-2 sm:grid-cols-3 lg:w-[340px] lg:grid-cols-1">
                  <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Library plans</p>
                    <p className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{filteredRoutines.length}</p>
                  </div>
                  <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Personal</p>
                    <p className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{personalRoutines.length}</p>
                  </div>
                  <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.56)] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Prescribed</p>
                    <p className="mt-1 text-[1.35rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">{prescribedRoutines.length}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[hsl(var(--border)/0.84)] px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-[hsl(var(--fg-3))]" />
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                      Search and filter
                    </p>
                  </div>
                  <div className="mt-3 max-w-2xl">
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by name, goal, focus, exercise, or source"
                      className="atlas-field h-11 rounded-[12px] border-0 px-4 text-[14px]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ROUTINE_SCOPES.map((item) => (
                    <FilterChip
                      key={item.key}
                      active={scope === item.key}
                      onClick={() => setScope(item.key)}
                    >
                      {item.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </Card>

            <Section
              eyebrow="Library"
              title={`All routines (${filteredRoutines.length})`}
              subtitle="Templates to inspect, duplicate, and choose from without mixing them up with the active workout logger."
            >
              {personalRoutines.length === 0 ? (
                <Card className="px-5 py-4">
                  <EmptyState
                    icon={Dumbbell}
                    title="No personal routines"
                    description={
                      searchTerm || scope !== 'all'
                        ? 'Nothing matches these filters. Clear search or switch to a different scope.'
                        : 'Save a reusable template to keep your own training structures in one place.'
                    }
                    action={(
                      <PrimaryButton className="gap-2" onClick={() => setShowCreate(true)}>
                        <Plus className="h-4 w-4" />
                        Save routine
                      </PrimaryButton>
                    )}
                  />
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {personalRoutines.map((routine) => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      onDelete={() => deleteRoutine.mutate(routine.id)}
                      onClone={() => {
                        setCloneSource(routine);
                        setCloneName(`${routine.name} (Copy)`);
                        setShowClone(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section
              eyebrow="Assigned"
              title={`Prescribed routines (${prescribedRoutines.length})`}
              subtitle="Coach-owned templates should stay visible as a distinct state, not blend into your own library."
            >
              {prescribedRoutines.length === 0 ? (
                <Card className="px-5 py-4">
                  <EmptyState
                    icon={UserCheck}
                    title="No prescribed routines synced"
                    description="When a coach-assigned routine arrives, it appears here with its own ownership badge."
                  />
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {prescribedRoutines.map((routine) => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isPrescribed
                      onClone={() => {
                        setCloneSource(routine);
                        setCloneName(`${routine.name} (Copy)`);
                        setShowClone(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px] border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold tracking-[-0.03em]">Save new routine</DialogTitle>
          </DialogHeader>
          <RoutineForm onSuccess={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={showClone}
        onOpenChange={(open) => {
          setShowClone(open);
          if (!open) {
            setCloneSource(null);
            setCloneName('');
          }
        }}
      >
        <DialogContent className="rounded-[24px] border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold tracking-[-0.03em]">Clone routine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">Copy name</p>
              <Input
                id="clone-name"
                value={cloneName}
                onChange={(event) => setCloneName(event.target.value)}
                className="atlas-field h-11 rounded-[10px] border-0 px-4 text-[14px]"
              />
            </div>
            {cloneSource && (
              <StatusBanner tone="neutral">
                <p className="text-sm font-semibold text-[hsl(var(--fg))]">{cloneSource.name}</p>
                <p className="mt-1 text-sm leading-6 text-[hsl(var(--fg-2))]">
                  This copy will be saved as your own library template and will not replace the original.
                </p>
              </StatusBanner>
            )}
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={() => setShowClone(false)} className="h-11 flex-1 rounded-[10px]">
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  if (!cloneSource) return;
                  cloneRoutine.mutate({
                    source: cloneSource,
                    name: cloneName || `${cloneSource?.name} (Copy)`,
                  });
                }}
                disabled={cloneRoutine.isPending}
                className="h-11 flex-1 rounded-[10px]"
              >
                {cloneRoutine.isPending ? 'Cloning…' : 'Clone'}
              </PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppContainer>
  );
}
