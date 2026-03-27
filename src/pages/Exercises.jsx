/**
 * Exercises — Exercise Library Page
 *
 * Primary source: ExerciseDB API (via @/lib/exerciseDB)
 * Fallback:       Legacy ExerciseMaster
 *
 * Features:
 *  - Debounced text search (PT + EN, accents, aliases)
 *  - Filter by body part, target muscle, or equipment
 *  - Favorites / Recents quick toggle
 *  - Compact vs. grid view toggle
 *  - ExerciseCard with GIF thumbnails
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Heart,
  LayoutGrid,
  LayoutList,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Wrench,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ExerciseCard from '@/components/exercises/ExerciseCard.jsx';
import {
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  EmptyState,
  FilterChip,
  PrimaryButton,
  SecondaryButton,
} from '@/components/shared/StablePage';
import {
  exerciseKeys,
  fetchExerciseLibrary,
  fetchBodyParts,
  fetchTargetMuscles,
  fetchEquipmentTypes,
  fetchFavoriteExercises,
  fetchRecentExercises,
  searchExercises,
  bodyPartToPT,
  muscleToPT,
  equipmentToPT,
} from '@/lib/exerciseDB/index.js';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Exercises() {
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bodyPart, setBodyPart]           = useState('');
  const [muscle, setMuscle]               = useState('');
  const [equipment, setEquipment]         = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent]       = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const [compactView, setCompactView]     = useState(false);

  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ── Filter lists ────────────────────────────────────────────────────────────

  const { data: bodyParts = [] } = useQuery({
    queryKey: [...exerciseKeys.lists(), 'bodyParts'],
    queryFn: fetchBodyParts,
    staleTime: Infinity,
  });

  const { data: muscles = [] } = useQuery({
    queryKey: [...exerciseKeys.lists(), 'muscles'],
    queryFn: fetchTargetMuscles,
    staleTime: Infinity,
  });

  const { data: equipmentList = [] } = useQuery({
    queryKey: [...exerciseKeys.lists(), 'equipment'],
    queryFn: fetchEquipmentTypes,
    staleTime: Infinity,
  });

  // ── Context lists (favorites / recents) ─────────────────────────────────────

  const { data: favorites = [] } = useQuery({
    queryKey: ['exercises', 'favorites'],
    queryFn: fetchFavoriteExercises,
    enabled: showFavorites,
    staleTime: 60_000,
  });

  const { data: recents = [] } = useQuery({
    queryKey: ['exercises', 'recents'],
    queryFn: fetchRecentExercises,
    enabled: showRecent,
    staleTime: 60_000,
  });

  // ── Search results (when there is a query) ──────────────────────────────────

  const isSearching = debouncedSearch.trim().length >= 2;

  const {
    data: searchResults = [],
    isFetching: searchFetching,
  } = useQuery({
    queryKey: exerciseKeys.search(debouncedSearch),
    queryFn: () => searchExercises(debouncedSearch, 60),
    enabled: isSearching,
    staleTime: 30_000,
  });

  // ── Library (no query) ──────────────────────────────────────────────────────

  const {
    data: libraryExercises = [],
    isFetching: libraryFetching,
  } = useQuery({
    queryKey: exerciseKeys.byBodyPart(bodyPart || muscle || equipment || 'all'),
    queryFn: () =>
      fetchExerciseLibrary({
        bodyPart: bodyPart || undefined,
        muscle: muscle || undefined,
        equipment: equipment || undefined,
        limit: 100,
      }),
    enabled: !isSearching && !showFavorites && !showRecent,
    staleTime: 120_000,
  });

  // ── Final displayed list ─────────────────────────────────────────────────────

  let exercises = [];
  if (showFavorites) {
    exercises = favorites;
  } else if (showRecent) {
    exercises = recents;
  } else if (isSearching) {
    exercises = searchResults;
  } else {
    exercises = libraryExercises;
  }

  const isLoading = searchFetching || libraryFetching;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const clearFilters = useCallback(() => {
    setBodyPart('');
    setMuscle('');
    setEquipment('');
    setShowFavorites(false);
    setShowRecent(false);
    setSearch('');
  }, []);

  const hasActiveFilters = bodyPart || muscle || equipment || showFavorites || showRecent || search;
  const summaryCards = [
    {
      label: isSearching ? 'Search results' : 'Library',
      value: exercises.length,
      detail: isSearching
        ? `Results for "${debouncedSearch || search}"`
        : 'Available exercises in the current view.',
      icon: Search,
    },
    {
      label: 'Body focus',
      value: bodyPart ? bodyPartToPT(bodyPart) : 'All groups',
      detail: bodyPart ? 'Filtered body region.' : 'Browse the full catalog.',
      icon: Target,
    },
    {
      label: 'Equipment',
      value: equipment ? equipmentToPT(equipment) : 'Mixed',
      detail: equipment ? 'Specific setup selected.' : 'Any available equipment.',
      icon: Wrench,
    },
  ];

  const toggleBodyPart = (bp) => {
    setBodyPart((p) => (p === bp ? '' : bp));
    setMuscle('');
    setEquipment('');
    setShowFavorites(false);
    setShowRecent(false);
  };

  const toggleMuscle = (m) => {
    setMuscle((p) => (p === m ? '' : m));
    setBodyPart('');
    setEquipment('');
    setShowFavorites(false);
    setShowRecent(false);
  };

  const toggleEquipment = (eq) => {
    setEquipment((p) => (p === eq ? '' : eq));
    setBodyPart('');
    setMuscle('');
    setShowFavorites(false);
    setShowRecent(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <AppContainer maxWidth="max-w-7xl">
      <PageHeader
        eyebrow="Exercises"
        title="Exercise library built for quick browsing and clean selection."
        subtitle="Search by name, filter by body region or equipment, and move from browsing into execution with minimal friction."
        accentClassName="from-[hsl(var(--brand)/0.14)] via-[hsl(var(--brand)/0.04)]"
        actions={
          <ActionRow>
            <SecondaryButton
              type="button"
              onClick={() => setShowFilters((f) => !f)}
              className={showFilters || hasActiveFilters ? 'border-[hsl(var(--brand)/0.42)] text-[hsl(var(--brand))]' : ''}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.9} />
              Filters
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => setCompactView((v) => !v)}>
              {compactView ? <LayoutGrid className="h-4 w-4" strokeWidth={1.9} /> : <LayoutList className="h-4 w-4" strokeWidth={1.9} />}
              {compactView ? 'Grid view' : 'List view'}
            </SecondaryButton>
          </ActionRow>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {summaryCards.map(({ label, value, detail, icon: Icon }) => (
            <Card key={label} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="atlas-metric-label">{label}</p>
                  <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                    {value}
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--fill)/0.76)] text-[hsl(var(--brand))]">
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageHeader>

      <Section
        eyebrow="Search"
        title="Find the right movement"
        subtitle="Search is bilingual, fast, and tuned for common athlete queries."
      >
        <Card className="space-y-4 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-2))]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, alias, movement pattern, or muscle group"
                className="atlas-field h-11 rounded-[14px] border-[hsl(var(--border)/0.86)] pl-10 pr-10 text-base"
              />
              {isLoading ? (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[hsl(var(--fg-2))]" />
              ) : null}
              {search && !isLoading ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <ActionRow className="sm:justify-end">
              <SecondaryButton
                type="button"
                onClick={() => { setShowFavorites((f) => !f); setShowRecent(false); }}
                className={showFavorites ? 'border-[hsl(var(--err)/0.32)] text-[hsl(var(--err))]' : ''}
              >
                <Heart className="h-4 w-4" strokeWidth={1.9} />
                Favorites
              </SecondaryButton>
              <SecondaryButton
                type="button"
                onClick={() => { setShowRecent((r) => !r); setShowFavorites(false); }}
                className={showRecent ? 'border-[hsl(var(--brand)/0.32)] text-[hsl(var(--brand))]' : ''}
              >
                <Clock className="h-4 w-4" strokeWidth={1.9} />
                Recents
              </SecondaryButton>
              {hasActiveFilters ? (
                <SecondaryButton type="button" onClick={clearFilters}>
                  <X className="h-4 w-4" strokeWidth={1.9} />
                  Clear
                </SecondaryButton>
              ) : null}
            </ActionRow>
          </div>

          {(bodyPart || muscle || equipment) ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-medium text-[hsl(var(--fg-2))]">Active filters</span>
              {bodyPart ? (
                <FilterChip active onClick={() => setBodyPart('')}>
                  {bodyPartToPT(bodyPart)}
                </FilterChip>
              ) : null}
              {muscle ? (
                <FilterChip active onClick={() => setMuscle('')}>
                  {muscleToPT(muscle)}
                </FilterChip>
              ) : null}
              {equipment ? (
                <FilterChip active onClick={() => setEquipment('')}>
                  {equipmentToPT(equipment)}
                </FilterChip>
              ) : null}
            </div>
          ) : null}

          {showFilters && !isSearching ? (
            <div className="grid gap-4 border-t border-[hsl(var(--border)/0.8)] pt-4 lg:grid-cols-3">
              <div className="space-y-2.5">
                <p className="atlas-metric-label">Body region</p>
                <div className="flex flex-wrap gap-2">
                  {bodyParts.map((bp) => (
                    <FilterChip key={bp} active={bodyPart === bp} onClick={() => toggleBodyPart(bp)}>
                      {bodyPartToPT(bp)}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="atlas-metric-label">Target muscle</p>
                <div className="flex flex-wrap gap-2">
                  {muscles.map((m) => (
                    <FilterChip key={m} active={muscle === m} onClick={() => toggleMuscle(m)}>
                      {muscleToPT(m)}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="atlas-metric-label">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {equipmentList.map((eq) => (
                    <FilterChip key={eq} active={equipment === eq} onClick={() => toggleEquipment(eq)}>
                      {equipmentToPT(eq)}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </Section>

      <Section
        eyebrow="Library"
        title={
          isSearching
            ? `${exercises.length} result${exercises.length !== 1 ? 's' : ''} for "${debouncedSearch}"`
            : `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} in view`
        }
        subtitle="Designed for fast scan: movement name first, muscle and equipment second, execution detail on entry."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.84)] px-3 py-1.5 text-[12px] font-semibold text-[hsl(var(--fg-2))]">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={1.9} />
            {compactView ? 'Compact list' : 'Card grid'}
          </div>
        }
      >
        {isLoading && exercises.length === 0 ? (
          <Card className="px-5 py-14">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={1.9} />
              <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                Loading the library
              </p>
              <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                Pulling the latest exercise matches and metadata.
              </p>
            </div>
          </Card>
        ) : exercises.length === 0 ? (
          <Card className="px-0 py-0">
            <EmptyState
              icon={Search}
              title="No exercises found"
              description="Try a broader search term or clear the active filters to reopen the full catalog."
              action={
                hasActiveFilters ? (
                  <PrimaryButton type="button" onClick={clearFilters}>
                    Clear filters
                  </PrimaryButton>
                ) : null
              }
            />
          </Card>
        ) : compactView ? (
          <Card className="overflow-hidden px-0 py-0">
            <div className="divide-y divide-[hsl(var(--border)/0.72)]">
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} compact />
              ))}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        )}
      </Section>
    </AppContainer>
  );
}
