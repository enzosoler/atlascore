/**
 * Exercises — Exercise Library Page (Fitbod-style)
 *
 * Discovery-first layout:
 *  1. Top: search bar + filter chips (muscle group, equipment, type)
 *  2. Below: "Recommended for you" section based on recent usage
 *  3. Below: category cards (Push, Pull, Legs, Core, etc.)
 *  4. Below: full exercise list (compact or grid)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useT } from '@/lib/i18nContext';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Dumbbell,
  Heart,
  LayoutGrid,
  LayoutList,
  Loader2,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ExerciseCard from '@/components/exercises/ExerciseCard.jsx';
import {
  AppContainer,
} from '@/components/shared/AppContainer';
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

// ─── Category card data ──────────────────────────────────────────────────────

const CATEGORY_CARDS = [
  { id: 'chest',      label: 'Push',  muscles: ['chest', 'delts', 'triceps'],  color: 'brand',   icon: '💪' },
  { id: 'back',       label: 'Pull',  muscles: ['back', 'biceps'],             color: 'ok',      icon: '🔄' },
  { id: 'upper legs', label: 'Legs',  muscles: ['quads', 'hamstrings', 'glutes'], color: 'warn', icon: '🦵' },
  { id: 'waist',      label: 'Core',  muscles: ['abs', 'obliques'],            color: 'brand-ai', icon: '🎯' },
  { id: 'shoulders',  label: 'Shoulders', muscles: ['delts'],                  color: 'brand',   icon: '🏋️' },
  { id: 'lower arms', label: 'Arms',  muscles: ['biceps', 'triceps', 'forearms'], color: 'ok', icon: '💪' },
];

// ─── Filter chip component ───────────────────────────────────────────────────

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95 ${
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
          : 'border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.4)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.6)]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Category card ───────────────────────────────────────────────────────────

function CategoryCard({ category, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] p-4 hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.03)] transition-all active:scale-[0.97]"
    >
      <span className="text-2xl">{category.icon}</span>
      <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">{category.label}</span>
    </button>
  );
}

// ─── Recommended section ─────────────────────────────────────────────────────

function RecommendedSection({ recents, favorites, onSelectExercise, t }) {
  // Merge recents and favorites, prioritize favorites
  const recommended = useMemo(() => {
    const seen = new Set();
    const items = [];
    for (const ex of [...favorites, ...recents]) {
      const key = ex.id || ex.name;
      if (!seen.has(key)) {
        seen.add(key);
        items.push(ex);
      }
    }
    return items.slice(0, 6);
  }, [recents, favorites]);

  if (recommended.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
          {t('exercises.recommended') || 'Recommended for you'}
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {recommended.map((ex, i) => (
          <div
            key={ex.id || i}
            className="shrink-0 w-[160px] rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] overflow-hidden hover:border-[hsl(var(--brand)/0.3)] transition-all cursor-pointer"
            onClick={() => onSelectExercise?.(ex)}
          >
            <div className="h-24 bg-[hsl(var(--fill)/0.4)] flex items-center justify-center">
              {(ex.media?.gif_url || ex.media_gif_url) ? (
                <img
                  src={ex.media?.gif_url || ex.media_gif_url}
                  alt={ex.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Dumbbell className="w-8 h-8 text-[hsl(var(--fg-3))]" strokeWidth={1.5} />
              )}
            </div>
            <div className="p-2.5">
              <p className="text-[12px] font-semibold text-[hsl(var(--fg))] truncate">
                {ex.canonical_name_en || ex.name || '---'}
              </p>
              <p className="text-[10px] text-[hsl(var(--fg-3))] truncate mt-0.5">
                {(ex.primary_muscles || []).slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Exercises() {
  const t = useT();
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bodyPart, setBodyPart]           = useState('');
  const [muscle, setMuscle]               = useState('');
  const [equipment, setEquipment]         = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent]       = useState(false);
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
    staleTime: 60_000,
  });

  const { data: recents = [] } = useQuery({
    queryKey: ['exercises', 'recents'],
    queryFn: fetchRecentExercises,
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
  const showDiscovery = !hasActiveFilters && !isSearching;

  const handleCategoryClick = (category) => {
    setBodyPart(category.id);
    setMuscle('');
    setEquipment('');
    setShowFavorites(false);
    setShowRecent(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <AppContainer>
      <div className="space-y-5 atlas-page-enter">

        {/* Page title */}
        <div>
          <h1 className="text-title3 font-bold text-[hsl(var(--fg))]">{t('exercises.title')}</h1>
          <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1">{t('exercises.subtitle')}</p>
        </div>

        {/* ── Search bar + filter row (sticky) ──────────────────────────── */}
        <div className="sticky top-0 z-10 -mx-5 px-5 py-3 bg-[hsl(var(--bg)/0.9)] backdrop-blur-md lg:-mx-8 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--fg-3))]" strokeWidth={2} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('exercises.search.placeholder')}
              className="h-11 rounded-2xl border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.4)] pl-10 pr-10 text-[15px]"
            />
            {isLoading && (
              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[hsl(var(--fg-3))]" />
            )}
            {search && !isLoading && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter chips row */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            <FilterChip
              active={showFavorites}
              onClick={() => { setShowFavorites((f) => !f); setShowRecent(false); setBodyPart(''); setMuscle(''); setEquipment(''); }}
            >
              <Heart className="w-3 h-3" strokeWidth={2} />
              {t('exercises.actions.favorites')}
            </FilterChip>
            <FilterChip
              active={showRecent}
              onClick={() => { setShowRecent((r) => !r); setShowFavorites(false); setBodyPart(''); setMuscle(''); setEquipment(''); }}
            >
              <Clock className="w-3 h-3" strokeWidth={2} />
              {t('exercises.actions.recents')}
            </FilterChip>

            {/* Muscle group chips */}
            {bodyParts.slice(0, 6).map((bp) => (
              <FilterChip
                key={bp}
                active={bodyPart === bp}
                onClick={() => {
                  setBodyPart((p) => (p === bp ? '' : bp));
                  setMuscle('');
                  setEquipment('');
                  setShowFavorites(false);
                  setShowRecent(false);
                }}
              >
                {bodyPartToPT(bp)}
              </FilterChip>
            ))}

            {/* Equipment chips */}
            {equipmentList.slice(0, 4).map((eq) => (
              <FilterChip
                key={eq}
                active={equipment === eq}
                onClick={() => {
                  setEquipment((p) => (p === eq ? '' : eq));
                  setBodyPart('');
                  setMuscle('');
                  setShowFavorites(false);
                  setShowRecent(false);
                }}
              >
                {equipmentToPT(eq)}
              </FilterChip>
            ))}

            {hasActiveFilters && (
              <FilterChip active={false} onClick={clearFilters}>
                <X className="w-3 h-3" strokeWidth={2} />
                {t('exercises.actions.clear')}
              </FilterChip>
            )}
          </div>
        </div>

        {/* ── Discovery section (shown when no filters active) ──────────── */}
        {showDiscovery && (
          <>
            {/* Recommended for you */}
            <RecommendedSection
              recents={recents}
              favorites={favorites}
              t={t}
            />

            {/* Category cards grid */}
            <div>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))] mb-3">
                {t('exercises.filters.body_region') || 'Browse by category'}
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {CATEGORY_CARDS.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onClick={() => handleCategoryClick(cat)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Active filter label ───────────────────────────────────────── */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
              {isSearching
                ? `${exercises.length} results for "${debouncedSearch}"`
                : showFavorites
                  ? t('exercises.actions.favorites')
                  : showRecent
                    ? t('exercises.actions.recents')
                    : `${exercises.length} exercises`
              }
            </p>
            <button
              type="button"
              onClick={() => setCompactView((v) => !v)}
              className="flex items-center gap-1 text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
            >
              {compactView ? <LayoutGrid className="w-3.5 h-3.5" /> : <LayoutList className="w-3.5 h-3.5" />}
              {compactView ? t('exercises.actions.grid_view') : t('exercises.actions.list_view')}
            </button>
          </div>
        )}

        {/* ── Exercise list ──────────────────────────────────────────────── */}
        {isLoading && exercises.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={2} />
            <p className="text-[14px] font-medium text-[hsl(var(--fg-2))]">
              {t('exercises.library.loading_title')}
            </p>
          </div>
        ) : exercises.length === 0 && hasActiveFilters ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Search className="h-8 w-8 text-[hsl(var(--fg-3))]" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-[hsl(var(--fg))]">
              {t('exercises.library.empty_title')}
            </p>
            <p className="text-[13px] text-[hsl(var(--fg-2))]">
              {t('exercises.library.empty_description')}
            </p>
            <button
              onClick={clearFilters}
              className="text-[13px] font-semibold text-[hsl(var(--brand))] hover:underline mt-1"
            >
              {t('exercises.actions.clear_filters')}
            </button>
          </div>
        ) : exercises.length > 0 ? (
          compactView ? (
            <div className="rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] overflow-hidden">
              <div className="divide-y divide-[hsl(var(--border)/0.3)]">
                {exercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} compact />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          )
        ) : null}

        {/* Full library link when in discovery mode */}
        {showDiscovery && exercises.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                {t('exercises.library.exercises_in_view')?.replace('{count}', exercises.length) || `${exercises.length} exercises`}
              </p>
              <button
                type="button"
                onClick={() => setCompactView((v) => !v)}
                className="flex items-center gap-1 text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
              >
                {compactView ? <LayoutGrid className="w-3.5 h-3.5" /> : <LayoutList className="w-3.5 h-3.5" />}
              </button>
            </div>
            {compactView ? (
              <div className="rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] overflow-hidden">
                <div className="divide-y divide-[hsl(var(--border)/0.3)]">
                  {exercises.map((ex) => (
                    <ExerciseCard key={ex.id} exercise={ex} compact />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {exercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AppContainer>
  );
}
