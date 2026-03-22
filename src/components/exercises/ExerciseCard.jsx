/**
 * ExerciseCard — Library-view card for a unified exercise object.
 *
 * Props:
 *   exercise   — Unified exercise object (Atlas model)
 *   onClick    — Optional click handler (overrides Link behavior)
 *   isFavorite — boolean
 *   useCount   — number (how many times the user used it)
 *   compact    — boolean: smaller card variant (list mode)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Zap } from 'lucide-react';
import ExerciseMedia from './ExerciseMedia.jsx';
import {
  muscleToPT,
  equipmentToPT,
  MOVEMENT_PATTERN_LABELS,
} from '@/lib/exerciseDB/index.js';

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

function MusclePill({ muscle }) {
  return (
    <span className="inline-flex max-w-[110px] items-center rounded-full border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.1)] px-2.5 py-1 text-[10px] font-semibold tracking-[-0.01em] text-[hsl(var(--brand))] truncate">
      {muscleToPT(muscle)}
    </span>
  );
}

export default function ExerciseCard({
  exercise,
  onClick,
  isFavorite = false,
  useCount = 0,
  compact = false,
}) {
  if (!exercise) return null;

  const namePT = exercise.canonical_name_en || exercise.name || '—';
  const nameEN = exercise.canonical_name_en || '';
  const primaryMuscles = exercise.primary_muscles || [];
  const hasGif = !!(exercise.media?.gif_url || exercise.media_gif_url);
  const difficulty = exercise.difficulty_level;
  const pattern = exercise.movement_pattern;
  const isCompound = exercise.is_compound;
  const equipment = exercise.equipment ? equipmentToPT(exercise.equipment) : null;
  const sourceLabel = exercise.source === 'exercisedb' ? 'ExerciseDB' : null;

  const inner = compact ? (
    /* ── Compact list row ── */
    <div className="flex items-center gap-3 px-3.5 py-3">
      {hasGif && (
        <div className="shrink-0">
          <ExerciseMedia exercise={exercise} size="sm" showFallback={false} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] truncate group-hover:text-[hsl(var(--brand))] transition-colors">
          {namePT}
        </p>
        {nameEN && (
          <p className="text-[11px] text-[hsl(var(--fg-2))] truncate">{nameEN}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {primaryMuscles.slice(0, 2).map((m) => <MusclePill key={m} muscle={m} />)}
          {equipment ? (
            <span className="inline-flex items-center rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.84)] px-2.5 py-1 text-[10px] font-semibold text-[hsl(var(--fg-2))]">
              {equipment}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {difficulty && (
          <span className={`badge ${DIFFICULTY_BADGE[difficulty]}`} style={{ fontSize: 9 }}>
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        )}
        {isFavorite && <Heart className="w-3.5 h-3.5 text-[hsl(var(--err))] fill-current" />}
      </div>
    </div>
  ) : (
    /* ── Full card ── */
    <div className="flex h-full flex-col">
      {/* Media */}
      <div className="relative overflow-hidden rounded-t-[14px]">
        <ExerciseMedia exercise={exercise} size="md" />
        {isFavorite && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--bg)/0.72)] text-[hsl(var(--err))] backdrop-blur">
            <Heart className="h-4 w-4 fill-current" />
          </div>
        )}
        {(sourceLabel || difficulty) && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {sourceLabel ? (
              <span className="inline-flex items-center rounded-full border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--bg)/0.72)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/88 backdrop-blur">
                {sourceLabel}
              </span>
            ) : null}
            {difficulty ? (
              <span className={`badge ${DIFFICULTY_BADGE[difficulty]}`} style={{ fontSize: 9 }}>
                {DIFFICULTY_LABEL[difficulty]}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {/* Names */}
        <div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight tracking-[-0.03em] text-[hsl(var(--fg))] transition-colors group-hover:text-[hsl(var(--brand))]">
            {namePT}
          </h3>
          {nameEN && (
            <p className="mt-1 text-[12px] text-[hsl(var(--fg-2))] truncate">{nameEN}</p>
          )}
        </div>

        {/* Muscles */}
        {primaryMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {primaryMuscles.slice(0, 3).map((m) => <MusclePill key={m} muscle={m} />)}
          </div>
        )}

        {/* Footer chips */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {equipment ? (
            <span className="inline-flex items-center rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.78)] px-2.5 py-1 text-[10px] font-semibold text-[hsl(var(--fg-2))]">
              {equipment}
            </span>
          ) : null}
          {pattern && MOVEMENT_PATTERN_LABELS[pattern] && (
            <span className="badge badge-neutral" style={{ fontSize: 9 }}>
              {MOVEMENT_PATTERN_LABELS[pattern]}
            </span>
          )}
          {isCompound && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)] px-2.5 py-1 text-[10px] font-semibold text-[hsl(var(--brand))]">
              <Zap className="h-2.5 w-2.5" /> Compound
            </span>
          )}
          {useCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.1)] px-2.5 py-1 text-[10px] font-semibold text-[hsl(var(--ok))]">
              <Sparkles className="h-2.5 w-2.5" />
              Used {useCount}x
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const sharedClasses = `group atlas-card overflow-hidden border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--fill)/0.48)_100%)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--brand)/0.28)] hover:shadow-[var(--shadow-md)] cursor-pointer ${compact ? 'flex items-stretch rounded-[14px]' : 'flex flex-col h-full rounded-[14px]'}`;

  if (onClick) {
    return (
      <button onClick={() => onClick(exercise)} className={`${sharedClasses} w-full text-left`}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={`/exercise/${exercise.id}`} className={sharedClasses}>
      {inner}
    </Link>
  );
}
