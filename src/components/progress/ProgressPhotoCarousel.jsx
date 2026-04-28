import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Sparkles } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * ProgressPhotoCarousel
 * 
 * Displays progress photos in a carousel that frames the latest capture as the anchor
 * and keeps the timeline visible for comparison.
 */
export default function ProgressPhotoCarousel({ photos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    return [...photos].sort((a, b) => {
      const dateA = new Date(a.date || a.created_date || 0);
      const dateB = new Date(b.date || b.created_date || 0);
      return dateB - dateA;
    });
  }, [photos]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [sortedPhotos.length]);

  if (!sortedPhotos.length) {
    return null;
  }

  const getPhaseLabel = (index, total) => {
    if (index === 0) return 'Latest';
    if (index === total - 1) return 'Baseline';
    return `Checkpoint ${total - index}`;
  };

  const safeFormatDate = (dateValue) => {
    if (!dateValue) return '—';
    try {
      const d = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      return isValid(d) ? format(d, 'dd MMM yyyy') : '—';
    } catch {
      return '—';
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedPhotos.length - 1 ? 0 : prev + 1));
  };

  const currentPhoto = sortedPhotos[currentIndex];
  const phaseLabel = getPhaseLabel(currentIndex, sortedPhotos.length);
  const poseLabel = currentPhoto?.category ? String(currentPhoto.category).replace(/_/g, ' ') : 'pose';
  const previousPhoto = sortedPhotos[currentIndex + 1] || null;

  return (
    <div className="rounded-[28px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,hsl(var(--card)/0.96)_0%,hsl(var(--card)/0.9)_100%)] p-5 shadow-[var(--shadow-xs)] space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand))]">
              Visual progress
            </p>
          </div>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            Latest checkpoint first, with the earlier captures still one tap away.
          </p>
        </div>
        <div className="rounded-full border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.42)] px-3 py-1.5 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
          {sortedPhotos.length} photos
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.28)] aspect-[3/4] max-w-md mx-auto">
          {currentPhoto?.photo_url ? (
            <img
              src={currentPhoto.photo_url}
              alt={`Progress photo ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[hsl(var(--fg-2))]">
              <Camera className="w-11 h-11 mb-3 opacity-50" />
              <span className="text-sm">{safeFormatDate(currentPhoto?.date || currentPhoto?.created_date)}</span>
            </div>
          )}

          {sortedPhotos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/50"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/50"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-12 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm">
                {phaseLabel}
              </span>
              <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm">
                {poseLabel}
              </span>
            </div>
            <p className="mt-2 text-[13px] font-medium">
              {safeFormatDate(currentPhoto?.date || currentPhoto?.created_date)}
            </p>
            {previousPhoto ? (
              <p className="mt-1 text-[11px] text-white/80">
                Compared with {safeFormatDate(previousPhoto.date || previousPhoto.created_date)}
              </p>
            ) : null}
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-3">
            {sortedPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'bg-[hsl(var(--accent-primary))] w-6'
                    : 'bg-[hsl(var(--fg)/0.3)] w-1.5 hover:bg-[hsl(var(--fg)/0.5)]'
                )}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.32)] px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Current</p>
            <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{phaseLabel}</p>
          </div>
          <div className="rounded-[18px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.32)] px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Date</p>
            <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">{safeFormatDate(currentPhoto?.date || currentPhoto?.created_date)}</p>
          </div>
          <div className="rounded-[18px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.32)] px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Progress</p>
            <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">
              {currentIndex + 1} of {sortedPhotos.length}
            </p>
          </div>
        </div>
      </div>

      {sortedPhotos.length > 1 && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
            Timeline
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'shrink-0 h-16 w-12 rounded-lg overflow-hidden border-2 transition-all',
                  idx === currentIndex
                    ? 'border-[hsl(var(--accent-primary))] ring-2 ring-[hsl(var(--accent-primary)/0.3)]'
                    : 'border-[hsl(var(--border-h))] hover:border-[hsl(var(--fg-2))]'
                )}
              >
                {photo?.photo_url ? (
                  <img
                    src={photo.photo_url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--shell))] text-[hsl(var(--fg-3))]">
                    <span className="text-[8px]">{idx + 1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[hsl(var(--border)/0.7)]">
        <div className="text-center">
          <p className="text-xs text-[hsl(var(--fg-3))]">Total photos</p>
          <p className="text-lg font-semibold text-[hsl(var(--fg))]">{sortedPhotos.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[hsl(var(--fg-3))]">Period</p>
          <p className="text-xs font-semibold text-[hsl(var(--fg))]">
            {sortedPhotos.length > 1
              ? `${Math.round((new Date(sortedPhotos[sortedPhotos.length - 1].date || sortedPhotos[sortedPhotos.length - 1].created_date) - new Date(sortedPhotos[0].date || sortedPhotos[0].created_date)) / (1000 * 60 * 60 * 24))} days`
              : '—'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[hsl(var(--fg-3))]">Current</p>
          <p className="text-xs font-semibold text-[hsl(var(--accent-primary))]">
            {currentIndex + 1}/{sortedPhotos.length}
          </p>
        </div>
      </div>
    </div>
  );
}
