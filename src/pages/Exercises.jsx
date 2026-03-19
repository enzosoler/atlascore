/**
 * Exercises — Exercise Library Page
 *
 * Primary source: ExerciseDB API (via @/lib/exerciseDB)
 * Fallback:       base44 ExerciseMaster
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
import { Search, LayoutGrid, LayoutList, Heart, Clock, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ExerciseCard from '@/components/exercises/ExerciseCard.jsx';
import {
  exerciseKeys,
  fetchExerciseLibrary,
  fetchBodyParts,
  fetchTargetMuscles,
  fetchEquipmentTypes,
  fetchFavoriteExercises,
  fetchRecentExercises,
  searchExercises,
  localSearch,
  bodyPartToPT,
  muscleToPT,
  equipmentToPT,
} from '@/lib/exerciseDB/index.js';

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors capitalize truncate max-w-[140px] ${
        active
          ? 'bg-[hsl(var(--brand))] text-white border-[hsl(var(--brand))]'
          : 'border-[hsl(var(--border-h))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))]'
      }`}
    >
      {label}
    </button>
  );
}

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
    <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-5">

      {/* Page header */}
      <div>
        <h1 className="t-headline mb-1">Biblioteca de Exercícios</h1>
        <p className="t-caption">
          {isSearching
            ? `${exercises.length} resultado${exercises.length !== 1 ? 's' : ''} para "${debouncedSearch}"`
            : `${exercises.length} exercício${exercises.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search + controls */}
      <div className="surface rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-2))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício… (supino, agachamento, pull-up)"
              className="h-10 pl-10 pr-9 rounded-lg text-base"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[hsl(var(--fg-2))]" />
            )}
            {search && !isLoading && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-[hsl(var(--brand)/0.1)] border-[hsl(var(--brand)/0.3)] text-[hsl(var(--brand))]'
                : 'border-[hsl(var(--border-h))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* View toggle */}
          <button
            onClick={() => setCompactView((v) => !v)}
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-[hsl(var(--border-h))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors shrink-0"
          >
            {compactView
              ? <LayoutGrid className="w-4 h-4" strokeWidth={2} />
              : <LayoutList className="w-4 h-4" strokeWidth={2} />}
          </button>
        </div>

        {/* Quick toggles */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setShowFavorites((f) => !f); setShowRecent(false); }}
            className={`px-3 h-8 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
              showFavorites
                ? 'bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]'
                : 'bg-[hsl(var(--shell))] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
            }`}
          >
            <Heart className="w-3 h-3" /> Favoritos
          </button>
          <button
            onClick={() => { setShowRecent((r) => !r); setShowFavorites(false); }}
            className={`px-3 h-8 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
              showRecent
                ? 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
                : 'bg-[hsl(var(--shell))] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
            }`}
          >
            <Clock className="w-3 h-3" /> Recentes
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 h-8 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 bg-[hsl(var(--shell))] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--err))]"
            >
              <X className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && !isSearching && (
          <div className="space-y-3 pt-1 border-t border-[hsl(var(--border-h))]">

            {/* Body part */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-1.5">
                Parte do corpo
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bodyParts.map((bp) => (
                  <FilterChip
                    key={bp}
                    label={bodyPartToPT(bp)}
                    active={bodyPart === bp}
                    onClick={() => toggleBodyPart(bp)}
                  />
                ))}
              </div>
            </div>

            {/* Muscle */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-1.5">
                Músculo alvo
              </p>
              <div className="flex flex-wrap gap-1.5">
                {muscles.map((m) => (
                  <FilterChip
                    key={m}
                    label={muscleToPT(m)}
                    active={muscle === m}
                    onClick={() => toggleMuscle(m)}
                  />
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-1.5">
                Equipamento
              </p>
              <div className="flex flex-wrap gap-1.5">
                {equipmentList.map((eq) => (
                  <FilterChip
                    key={eq}
                    label={equipmentToPT(eq)}
                    active={equipment === eq}
                    onClick={() => toggleEquipment(eq)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active filter pill */}
      {(bodyPart || muscle || equipment) && (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[hsl(var(--fg-2))]">Filtrando por:</span>
          {bodyPart && (
            <span className="badge badge-blue text-[11px]">
              {bodyPartToPT(bodyPart)}
              <button onClick={() => setBodyPart('')} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {muscle && (
            <span className="badge badge-blue text-[11px]">
              {muscleToPT(muscle)}
              <button onClick={() => setMuscle('')} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
          {equipment && (
            <span className="badge badge-blue text-[11px]">
              {equipmentToPT(equipment)}
              <button onClick={() => setEquipment('')} className="ml-1 opacity-60 hover:opacity-100">×</button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading && exercises.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--brand))]" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16">
          <p className="t-caption">Nenhum exercício encontrado</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-[13px] text-[hsl(var(--brand))] font-medium hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : compactView ? (
        <div className="surface rounded-xl overflow-hidden divide-y divide-[hsl(var(--border-h))]">
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} compact />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
