/**
 * ExerciseSearch — exercise picker for workout execution
 *
 * Architecture:
 *   1. Show recents + favorites on open (no query)
 *   2. On query → searchExercises() (PT/EN, accents, aliases, ExerciseDB + base44 fallback)
 *   3. Filter chips: by muscle or by equipment (searchByMuscle / searchByEquipment)
 *   4. Manual entry as last resort
 *   5. On select: log use via logExerciseUse(), call onSelect() with unified payload
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, X, Star, Clock, PenLine, Dumbbell, Filter } from 'lucide-react';
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
  { label: 'Chest',       value: 'chest' },
  { label: 'Back',      value: 'back' },
  { label: 'Shoulders',      value: 'delts' },
  { label: 'Biceps',      value: 'biceps' },
  { label: 'Triceps',     value: 'triceps' },
  { label: 'Quadriceps',  value: 'quads' },
  { label: 'Hamstrings',   value: 'hamstrings' },
  { label: 'Glutes',      value: 'glutes' },
  { label: 'Calves', value: 'calves' },
  { label: 'Core',        value: 'abs' },
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
  const namePT     = exercise.canonical_name_pt || exercise.name || '—';
  const nameEN     = exercise.canonical_name_en || '';
  const muscles    = (exercise.primary_muscles || []).slice(0, 2).join(', ');
  const equip      = typeof exercise.equipment === 'string'
    ? exercise.equipment
    : (exercise.equipment || [])[0] || '';
  const hasMedia   = !!(exercise.media?.gif_url || exercise.media_gif_url);

  return (
    <button
      onClick={() => onSelect(exercise)}
      className="flex w-full items-start gap-3 border-b border-[hsl(var(--border-h))] px-3 py-3 text-left transition-colors last:border-0 hover:bg-[hsl(var(--shell))]"
    >
      {/* Thumbnail */}
      {hasMedia && (
        <div className="shrink-0 mt-0.5">
          <ExerciseMedia exercise={exercise} size="sm" showFallback={false} />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-medium text-[hsl(var(--fg))] truncate">{namePT}</p>
          {exercise.is_compound && (
            <span className="badge badge-blue shrink-0" style={{ fontSize: 9, padding: '1px 5px' }}>
              Comp.
            </span>
          )}
        </div>
        {(nameEN || muscles || equip) && (
          <p className="text-[11px] text-[hsl(var(--fg-2))] truncate mt-0.5">
            {[nameEN, muscles, exercise.default_rep_range ? `${exercise.default_rep_range} reps` : null]
              .filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col items-end gap-1 shrink-0">
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
          if (name.trim()) {
            onAdd({
              canonical_name_pt: name.trim(),
              canonical_name_en: '',
              primary_muscles: [],
              equipment: '',
              _manual: true,
            });
            setName('');
          }
        }}
        disabled={!name.trim()}
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

      {/* Home: favorites + recents */}
      {showHome && hasContext && (
        <div className="overflow-hidden rounded-[18px] border border-[hsl(var(--border-h))] bg-[hsl(var(--card))]">
          {favorites.length > 0 && (
            <>
              <SectionHeader icon={Star} label="Favorites" />
              {favorites.slice(0, 3).map((ex, i) => (
                <ExerciseRow key={`fav-${i}`} exercise={ex} onSelect={handleSelect} />
              ))}
            </>
          )}
          {recents.length > 0 && (
            <>
              <SectionHeader icon={Clock} label="Recent" />
              {recents.slice(0, 5).map((ex, i) => (
                <ExerciseRow key={`rec-${i}`} exercise={ex} onSelect={handleSelect} />
              ))}
            </>
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
            <div className="px-3 py-4 text-center">
              <p className="text-[13px] text-[hsl(var(--fg-2))] mb-2">No results found</p>
              <button
                onClick={() => setShowManual(true)}
                className="text-[12px] text-[hsl(var(--brand))] font-medium hover:underline flex items-center gap-1 mx-auto"
              >
                <PenLine className="w-3.5 h-3.5" /> Add manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* No results for text search */}
      {query.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-3">
          <p className="text-[13px] text-[hsl(var(--fg-2))] mb-1">No results for "{query}"</p>
          <button
            onClick={() => setShowManual(true)}
            className="text-[12px] text-[hsl(var(--brand))] font-medium hover:underline flex items-center gap-1 mx-auto"
          >
            <PenLine className="w-3.5 h-3.5" /> Add manually
          </button>
        </div>
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
