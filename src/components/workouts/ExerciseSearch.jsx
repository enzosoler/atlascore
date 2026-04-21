/**
 * ExerciseSearch — exercise picker for workout execution
 *
 * Architecture:
 *   1. Show recents + favorites on open (no query)
 *   2. On query → searchExercises() (PT/EN, accents, aliases, ExerciseDB fallback)
 *   3. Filter chips: by muscle or by equipment (searchByMuscle / searchByEquipment)
 *   4. Manual entry as last resort
 *   5. On select: log use via logExerciseUse(), call onSelect() with unified payload
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, X, Star, Clock, PenLine, Dumbbell, Filter } from 'lucide-react';
import { DataState } from '@/components/shared/DataState';
import ExerciseMedia from '@/components/exercises/ExerciseMedia.jsx';
import {
  searchExercises,
  searchByMuscle,
  searchByEquipment,
  fetchFavoriteExercises,
  fetchRecentExercises,
  logExerciseUse,
} from '@/lib/exerciseDB/index.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const MUSCLE_FILTER_OPTIONS = [
  { label: 'Chest',       value: 'chest', icon: '💪' },
  { label: 'Back',      value: 'back', icon: '🔙' },
  { label: 'Shoulders',      value: 'delts', icon: '🎯' },
  { label: 'Biceps',      value: 'biceps', icon: '💪' },
  { label: 'Triceps',     value: 'triceps', icon: '💪' },
  { label: 'Legs',        value: 'legs', icon: '🦵' },
  { label: 'Core',        value: 'abs', icon: '🎯' },
];

// Popular exercises for quick selection
const POPULAR_EXERCISES = [
  { name: 'Bench Press', muscle: 'chest', equipment: 'barbell' },
  { name: 'Squat', muscle: 'legs', equipment: 'barbell' },
  { name: 'Deadlift', muscle: 'back', equipment: 'barbell' },
  { name: 'Overhead Press', muscle: 'delts', equipment: 'barbell' },
  { name: 'Pull-ups', muscle: 'back', equipment: 'body weight' },
  { name: 'Dumbbell Row', muscle: 'back', equipment: 'dumbbell' },
  { name: 'Lunges', muscle: 'legs', equipment: 'body weight' },
  { name: 'Push-ups', muscle: 'chest', equipment: 'body weight' },
];

const EQUIPMENT_FILTER_OPTIONS = [
  { label: 'Barbell',        value: 'barbell' },
  { label: 'Dumbbell',       value: 'dumbbell' },
  { label: 'Cable',        value: 'cable' },
  { label: 'Machine',      value: 'machine' },
  { label: 'Bodyweight', value: 'body weight' },
  { label: 'Kettlebell',   value: 'kettlebell' },
];

const DIFFICULTY_BADGE = {
  beginner:     'badge-ok',
  intermediate: 'badge-warn',
  advanced:     'badge-err',
};
const DIFFICULTY_LABEL = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

// ─── ExerciseRow ─────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, onSelect }) {
  // Support both unified model and legacy shape
  const displayName = exercise.canonical_name_en || exercise.name || exercise.canonical_name_pt || '—';
  const secondaryName = exercise.canonical_name_pt && exercise.canonical_name_pt !== displayName
    ? exercise.canonical_name_pt
    : '';
  const muscles    = (exercise.primary_muscles || []).slice(0, 2).join(', ');
  const equip      = typeof exercise.equipment === 'string'
    ? exercise.equipment
    : (exercise.equipment || [])[0] || '';
  const hasMedia   = !!(exercise.media?.gif_url || exercise.media_gif_url);

  return (
    <button
      onClick={() => onSelect(exercise)}
      className="flex w-full items-stretch gap-3 border-b border-[hsl(var(--border-h))] px-3 py-3 text-left transition-colors last:border-0 hover:bg-[hsl(var(--shell))]"
    >
      {/* Exercise Media Thumbnail - larger size */}
      <div className="shrink-0">
        {hasMedia ? (
          <div className="w-24 h-20 rounded-xl overflow-hidden bg-[hsl(var(--shell))]">
            <ExerciseMedia exercise={exercise} size="sm" showFallback={true} />
          </div>
        ) : (
          <div className="w-24 h-20 rounded-xl bg-[hsl(var(--shell))] flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center pr-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-medium text-[hsl(var(--fg))] truncate">{displayName}</p>
          {exercise.is_compound && (
            <span className="badge badge-blue shrink-0" style={{ fontSize: 9, padding: '1px 5px' }}>
              Comp.
            </span>
          )}
        </div>
        {secondaryName && (
          <p className="text-[11px] text-[hsl(var(--fg-2))] truncate mt-0.5">
            {secondaryName}
          </p>
        )}
        {(muscles || equip) && (
          <p className="text-[11px] text-[hsl(var(--fg-2))] truncate mt-0.5">
            {[muscles, equip].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col items-end justify-center gap-1 shrink-0">
        {exercise.difficulty_level && (
          <span className={`badge ${DIFFICULTY_BADGE[exercise.difficulty_level]}`} style={{ fontSize: 9 }}>
            {DIFFICULTY_LABEL[exercise.difficulty_level]}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-[hsl(var(--border-h))] bg-[hsl(var(--shell))] px-3 py-2">
      <Icon className="w-3 h-3 text-[hsl(var(--fg-2))]" strokeWidth={2} />
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))]">{label}</p>
    </div>
  );
}

// ─── ManualEntry ──────────────────────────────────────────────────────────────

function ManualEntry({ onAdd, onBack }) {
  const [name, setName] = useState('');
  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]"
      >
        ← Back
      </button>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] block mb-1.5">
          Exercise name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: My custom exercise"
          className="atlas-field h-11 w-full rounded-[12px] border-0 px-4"
          autoFocus
        />
      </div>
      <button
        onClick={() => {
          const clean = name.trim().replace(/[^a-zA-ZÀ-ÿ0-9\s\-'()]/g, '').trim();
          if (clean && clean.length >= 2 && clean.length <= 80) {
            onAdd({
              canonical_name_pt: clean,
              canonical_name_en: clean,
              primary_muscles: [],
              equipment: '',
              _manual: true,
            });
            setName('');
          }
        }}
        disabled={!name.trim() || name.trim().length < 2 || name.trim().length > 80}
        className="btn btn-primary h-11 w-full rounded-[10px] text-[13px] gap-1.5 disabled:opacity-50"
      >
        <PenLine className="w-3.5 h-3.5" /> Add manually
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExerciseSearch({ onSelect }) {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [recents, setRecents]           = useState([]);
  const [favorites, setFavorites]       = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [showFilters, setShowFilters]   = useState(false);
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipFilter, setEquipFilter]   = useState('');
  const [showManual, setShowManual]     = useState(false);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // ── Load recents + favorites on mount ────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContext(true);
      try {
        const [rec, fav] = await Promise.all([
          fetchRecentExercises(),
          fetchFavoriteExercises(),
        ]);
        if (!cancelled) {
          setRecents(rec || []);
          setFavorites(fav || []);
        }
      } catch {
        // Not critical
      } finally {
        if (!cancelled) setLoadingContext(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Filter search (muscle or equipment, no text query) ────────────────────────

  useEffect(() => {
    if (!muscleFilter && !equipFilter) return;
    if (query) return; // text query takes precedence

    let cancelled = false;
    setLoading(true);

    const fn = muscleFilter
      ? searchByMuscle(muscleFilter, 40)
      : searchByEquipment(equipFilter, 40);

    fn.then((data) => { if (!cancelled) setResults(data || []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [muscleFilter, equipFilter]);

  // ── Debounced text search ─────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      if (!muscleFilter && !equipFilter) setResults([]);
      return;
    }
    // Clear filter chips when typing
    setMuscleFilter('');
    setEquipFilter('');

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchExercises(query, 30);
        setResults(data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // ── handleSelect ──────────────────────────────────────────────────────────────

  const handleSelect = useCallback(async (exercise) => {
    // Log use (non-blocking)
    const exerciseId   = exercise.id || null;
    const exerciseName = exercise.canonical_name_pt || exercise.name || '';
    if (exerciseId) {
      logExerciseUse(exerciseId, exerciseName).catch(() => {});
    }

    // Resolve media URLs from unified model or legacy shape
    const gifUrl = exercise.media?.gif_url || exercise.media_gif_url || null;

    onSelect({
      // Display name
      name:                exerciseName,
      // Unified muscle fields
      primary_muscles:     exercise.primary_muscles || [],
      secondary_muscles:   exercise.secondary_muscles || [],
      // Equipment (string)
      equipment:           typeof exercise.equipment === 'string'
        ? exercise.equipment
        : (exercise.equipment || [])[0] || '',
      // Reference IDs
      exercise_master_id:  exerciseId,
      // Enrichment
      movement_pattern:    exercise.movement_pattern || null,
      default_rep_range:   exercise.default_rep_range || null,
      default_set_range:   exercise.default_set_range || null,
      default_rest_seconds: exercise.default_rest_seconds || null,
      is_compound:         exercise.is_compound || false,
      difficulty_level:    exercise.difficulty_level || null,
      // Media
      media_gif_url:       gifUrl,
      // Full unified model reference (for detail screen)
      _exercise:           exercise,
    });

    setQuery('');
    setResults([]);
    setMuscleFilter('');
    setEquipFilter('');
    setShowFilters(false);
  }, [onSelect]);

  // ── Helpers ────────────────────────────────────────────────────────────────────

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setMuscleFilter('');
    setEquipFilter('');
    inputRef.current?.focus();
  }, []);

  const showHome  = !query && !muscleFilter && !equipFilter && !showManual;
  const hasContext = !loadingContext && (favorites.length > 0 || recents.length > 0);

  // ── Render ─────────────────────────────────────────────────────────────────────

  if (showManual) {
    return (
      <ManualEntry
        onAdd={(ex) => { handleSelect(ex); setShowManual(false); }}
        onBack={() => setShowManual(false)}
      />
    );
  }

  return (
    <div className="space-y-3">

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--fg-2))]" strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercise… (bench press, squat)"
            className="atlas-field h-11 w-full rounded-[12px] border-0 pl-9 pr-9"
            inputMode="text"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[hsl(var(--fg-2))]" />
          )}
          {(query || muscleFilter || equipFilter) && !loading && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((f) => !f)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border transition-colors ${
            showFilters
              ? 'bg-[hsl(var(--brand)/0.1)] border-[hsl(var(--brand)/0.3)] text-[hsl(var(--brand))]'
              : 'border-[hsl(var(--border-h))] bg-[hsl(var(--fill)/0.58)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))]'
          }`}
        >
          <Filter className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="atlas-card space-y-2 rounded-[18px] border-[hsl(var(--border)/0.82)] p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-1.5">Muscle</p>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_FILTER_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => { setMuscleFilter((p) => p === value ? '' : value); setEquipFilter(''); }}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    muscleFilter === value
                      ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border-h))] bg-[hsl(var(--fill)/0.48)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card))]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-1.5">Equipment</p>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_FILTER_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => { setEquipFilter((p) => p === value ? '' : value); setMuscleFilter(''); }}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    equipFilter === value
                      ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border-h))] bg-[hsl(var(--fill)/0.48)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card))]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Home: Categories + Popular + Recent */}
      {showHome && (
        <div className="space-y-4">
          {/* Categories */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))] mb-2 px-1">Categories</p>
            <div className="grid grid-cols-4 gap-2">
              {MUSCLE_FILTER_OPTIONS.slice(0, 4).map(({ label, value, icon }) => (
                <button
                  key={value}
                  onClick={() => setMuscleFilter(value)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.04)] transition-colors"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-[11px] font-medium text-[hsl(var(--fg))]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-2))]">Popular</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_EXERCISES.map((ex) => (
                <button
                  key={ex.name}
                  onClick={async () => {
                    setQuery(ex.name);
                    try {
                      const data = await searchExercises(ex.name, 5);
                      if (data && data.length > 0) {
                        handleSelect(data[0]);
                      }
                    } catch (error) {
                      console.warn('[ExerciseSearch] popular shortcut failed:', error?.message || error);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-[hsl(var(--border-h))] bg-[hsl(var(--fill)/0.5)] hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand)/0.06)] transition-colors text-sm text-[hsl(var(--fg))]"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestion — disabled until implemented */}

          {/* Recents & Favorites */}
          {hasContext && (
            <div className="overflow-hidden rounded-[18px] border border-[hsl(var(--border-h))] bg-[hsl(var(--card))]">
              {recents.length > 0 && (
                <>
                  <SectionHeader icon={Clock} label="Recent" />
                  {recents.slice(0, 4).map((ex, i) => (
                    <ExerciseRow key={`rec-${i}`} exercise={ex} onSelect={handleSelect} />
                  ))}
                </>
              )}
              {favorites.length > 0 && (
                <>
                  <SectionHeader icon={Star} label="Favorites" />
                  {favorites.slice(0, 3).map((ex, i) => (
                    <ExerciseRow key={`fav-${i}`} exercise={ex} onSelect={handleSelect} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results list */}
      {(results.length > 0 || (loading && (query || muscleFilter || equipFilter))) && (
        <div className="overflow-hidden rounded-[18px] border border-[hsl(var(--border-h))] bg-[hsl(var(--card))]">
          {(muscleFilter || equipFilter) && (
            <SectionHeader
              icon={Dumbbell}
              label={
                muscleFilter
                  ? `Muscle: ${MUSCLE_FILTER_OPTIONS.find((o) => o.value === muscleFilter)?.label || muscleFilter}`
                  : `Equipment: ${EQUIPMENT_FILTER_OPTIONS.find((o) => o.value === equipFilter)?.label || equipFilter}`
              }
            />
          )}
          {results.map((ex, i) => (
            <ExerciseRow key={ex.id || i} exercise={ex} onSelect={handleSelect} />
          ))}
          {!loading && results.length === 0 && (
            <DataState
              variant="empty"
              icon={Dumbbell}
              title="No exercises found"
              description="Try a different search term, or add a custom exercise manually."
              action={{ label: 'Add manually', onClick: () => setShowManual(true) }}
              className="mx-3 my-2"
            />
          )}
        </div>
      )}

      {/* No results for text search */}
      {query.length >= 2 && !loading && results.length === 0 && (
        <DataState
          variant="empty"
          icon={Search}
          title={`No results for "${query}"`}
          description="The exercise database did not match anything. You can add a custom exercise instead."
          action={{ label: 'Add manually', onClick: () => setShowManual(true) }}
          className="my-2"
        />
      )}

      {/* Manual shortcut (home state) */}
      {showHome && (
        <button
          onClick={() => setShowManual(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-[12px] py-2 text-[12px] text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--shell))] hover:text-[hsl(var(--fg))]"
        >
          <PenLine className="w-3.5 h-3.5" strokeWidth={2} /> Add exercise manually
        </button>
      )}
    </div>
  );
}
