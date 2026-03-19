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
import { Heart, Zap } from 'lucide-react';
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
  beginner:     'Iniciante',
  intermediate: 'Intermediário',
  advanced:     'Avançado',
};

function MusclePill({ muscle }) {
  return (
    <span className="badge badge-blue text-[10px] truncate max-w-[96px]">
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

  const namePT = exercise.canonical_name_pt || exercise.name || '—';
  const nameEN = exercise.canonical_name_en || '';
  const primaryMuscles = exercise.primary_muscles || [];
  const hasGif = !!(exercise.media?.gif_url || exercise.media_gif_url);
  const difficulty = exercise.difficulty_level;
  const pattern = exercise.movement_pattern;
  const isCompound = exercise.is_compound;

  const inner = compact ? (
    /* ── Compact list row ── */
    <div className="flex items-center gap-3 px-3 py-2.5">
      {hasGif && (
        <div className="shrink-0">
          <ExerciseMedia exercise={exercise} size="sm" showFallback={false} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] truncate group-hover:text-[hsl(var(--brand))] transition-colors">
          {namePT}
        </p>
        {nameEN && (
          <p className="text-[11px] text-[hsl(var(--fg-2))] truncate">{nameEN}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {primaryMuscles.slice(0, 2).map((m) => <MusclePill key={m} muscle={m} />)}
          {isCompound && (
            <span className="badge badge-primary text-[9px]">Comp.</span>
          )}
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
    <div className="flex flex-col h-full">
      {/* Media */}
      <div className="relative">
        <ExerciseMedia exercise={exercise} size="md" />
        {isFavorite && (
          <div className="absolute top-2 left-2">
            <Heart className="w-4 h-4 text-[hsl(var(--err))] fill-current drop-shadow" />
          </div>
        )}
        {exercise.source === 'exercisedb' && (
          <div className="absolute bottom-2 left-2">
            <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              EDB
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col flex-1 gap-2">
        {/* Names */}
        <div>
          <h3 className="text-[13px] font-bold text-[hsl(var(--fg))] group-hover:text-[hsl(var(--brand))] transition-colors leading-tight line-clamp-2">
            {namePT}
          </h3>
          {nameEN && (
            <p className="text-[10px] text-[hsl(var(--fg-2))] truncate mt-0.5">{nameEN}</p>
          )}
        </div>

        {/* Muscles */}
        {primaryMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {primaryMuscles.slice(0, 3).map((m) => <MusclePill key={m} muscle={m} />)}
          </div>
        )}

        {/* Footer chips */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {difficulty && (
            <span className={`badge ${DIFFICULTY_BADGE[difficulty]}`} style={{ fontSize: 9 }}>
              {DIFFICULTY_LABEL[difficulty]}
            </span>
          )}
          {pattern && MOVEMENT_PATTERN_LABELS[pattern] && (
            <span className="badge badge-neutral" style={{ fontSize: 9 }}>
              {MOVEMENT_PATTERN_LABELS[pattern]}
            </span>
          )}
          {isCompound && (
            <span className="badge badge-primary" style={{ fontSize: 9 }}>
              <Zap className="w-2.5 h-2.5 inline -mt-px" /> Composto
            </span>
          )}
          {useCount > 0 && (
            <span className="badge badge-neutral" style={{ fontSize: 9 }}>
              {useCount}× usado
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const sharedClasses = `group surface rounded-xl overflow-hidden border border-[hsl(var(--border-h))] hover:border-[hsl(var(--brand)/0.3)] hover:shadow-md transition-all cursor-pointer ${compact ? 'flex items-stretch' : 'flex flex-col h-full'}`;

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
