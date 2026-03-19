/**
 * ExerciseMedia — Renders exercise GIF or image with:
 *   - Skeleton loading state
 *   - Error / missing media fallback
 *   - Lazy loading for performance
 *   - Multiple size variants
 *
 * Props:
 *   exercise    — Unified exercise object (needs media.gif_url or media.image_url)
 *   size        — 'sm' | 'md' | 'lg' | 'full'  (default: 'md')
 *   showFallback — boolean (default: true) — show placeholder when no media
 *   className   — extra Tailwind classes for the wrapper
 */

import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'h-20 w-20 rounded-xl',
  md: 'h-40 w-full rounded-xl',
  lg: 'h-64 w-full rounded-2xl',
  full: 'w-full rounded-2xl',
};

const ASPECT_CLASSES = {
  sm: '',
  md: 'aspect-video',
  lg: 'aspect-video',
  full: 'aspect-video',
};

function SkeletonPlaceholder({ size }) {
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${ASPECT_CLASSES[size]} bg-[hsl(var(--shell))] animate-pulse flex items-center justify-center`}
      aria-label="Carregando mídia..."
    >
      <Dumbbell className="w-6 h-6 text-[hsl(var(--border))]" strokeWidth={1.5} />
    </div>
  );
}

function NoMediaPlaceholder({ exercise, size }) {
  const initials = (exercise?.canonical_name_pt || exercise?.canonical_name_en || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      className={`${SIZE_CLASSES[size]} ${ASPECT_CLASSES[size]} bg-[hsl(var(--shell))] flex flex-col items-center justify-center gap-2`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--border-h))]">
        <span className="text-[15px] font-bold text-[hsl(var(--fg-2))]">{initials}</span>
      </div>
      <p className="text-[10px] text-[hsl(var(--fg-2))] font-medium uppercase tracking-wider">
        Sem mídia
      </p>
    </div>
  );
}

export default function ExerciseMedia({
  exercise,
  size = 'md',
  showFallback = true,
  className = '',
}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'loaded' | 'error'

  const gifUrl = exercise?.media?.gif_url || exercise?.media_gif_url || null;
  const imageUrl = exercise?.media?.image_url || exercise?.media_image_url || null;
  const mediaUrl = gifUrl || imageUrl;

  const isGif = mediaUrl?.toLowerCase().includes('.gif') ||
    mediaUrl?.includes('exercisedb.io') ||
    mediaUrl?.includes('v2.exercisedb');

  if (!mediaUrl) {
    if (!showFallback) return null;
    return (
      <div className={className}>
        <NoMediaPlaceholder exercise={exercise} size={size} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${SIZE_CLASSES[size]} ${ASPECT_CLASSES[size]} bg-[hsl(var(--shell))] ${className}`}>
      {/* Loading skeleton */}
      {status !== 'loaded' && status !== 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--shell))] animate-pulse">
          <Dumbbell className="w-6 h-6 text-[hsl(var(--border))]" strokeWidth={1.5} />
        </div>
      )}

      {/* Media */}
      {status !== 'error' && (
        <img
          src={mediaUrl}
          alt={`Demonstração: ${exercise?.canonical_name_pt || exercise?.canonical_name_en || ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Error fallback */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[hsl(var(--shell))]">
          <Dumbbell className="w-6 h-6 text-[hsl(var(--fg-2))]" strokeWidth={1.5} />
          <p className="text-[10px] text-[hsl(var(--fg-2))] font-medium">Mídia indisponível</p>
        </div>
      )}

      {/* GIF badge */}
      {status === 'loaded' && isGif && (
        <div className="absolute top-2 right-2">
          <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            GIF
          </span>
        </div>
      )}
    </div>
  );
}
