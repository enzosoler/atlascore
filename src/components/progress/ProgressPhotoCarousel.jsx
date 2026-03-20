import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * ProgressPhotoCarousel
 * 
 * Displays progress photos in a beautiful carousel format showing evolution over time.
 * Groups photos by approximate time intervals and displays them with visual indicators.
 */
export default function ProgressPhotoCarousel({ photos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  // Sort photos by date (oldest first)
  const sortedPhotos = [...photos].sort((a, b) => {
    const dateA = new Date(a.date || a.created_date || 0);
    const dateB = new Date(b.date || b.created_date || 0);
    return dateA - dateB;
  });

  // Group photos into phases (start, middle, end)
  const getPhaseLabel = (index, total) => {
    if (index === 0) return 'Início';
    if (index === total - 1) return 'Atual';
    return `Semana ${Math.round((index / (total - 1)) * 52)}`;
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

  return (
    <div className="surface rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="t-subtitle">Evolução Visual</p>
          <p className="t-caption mt-1">Acompanhe sua transformação ao longo do tempo</p>
        </div>
      </div>

      {/* Main carousel */}
      <div className="space-y-4">
        {/* Photo display */}
        <div className="relative rounded-2xl overflow-hidden bg-[hsl(var(--shell))] aspect-[3/4] max-w-sm mx-auto border border-[hsl(var(--border-h))]">
          {currentPhoto?.photo_url ? (
            <img
              src={currentPhoto.photo_url}
              alt={`Progress photo ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[hsl(var(--fg-2))]">
              <Calendar className="w-12 h-12 mb-3 opacity-50" />
              <span className="text-sm">{safeFormatDate(currentPhoto?.date || currentPhoto?.created_date)}</span>
            </div>
          )}

          {/* Navigation buttons */}
          {sortedPhotos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--fg)/0.1)] text-[hsl(var(--fg))] backdrop-blur-sm transition-all hover:bg-[hsl(var(--fg)/0.2)]"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--fg)/0.1)] text-[hsl(var(--fg))] backdrop-blur-sm transition-all hover:bg-[hsl(var(--fg)/0.2)]"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Progress indicator */}
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

        {/* Photo info */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-[hsl(var(--fg))]">
            {phaseLabel}
          </p>
          <p className="text-xs text-[hsl(var(--fg-2))]">
            {safeFormatDate(currentPhoto?.date || currentPhoto?.created_date)}
          </p>
          <p className="text-xs text-[hsl(var(--fg-3))]">
            {currentIndex + 1} de {sortedPhotos.length}
          </p>
        </div>
      </div>

      {/* Timeline thumbnails */}
      {sortedPhotos.length > 1 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
            Linha do Tempo
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[hsl(var(--border-h))]">
        <div className="text-center">
          <p className="text-xs text-[hsl(var(--fg-3))]">Total de Fotos</p>
          <p className="text-lg font-semibold text-[hsl(var(--fg))]">{sortedPhotos.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[hsl(var(--fg-3))]">Período</p>
          <p className="text-xs font-semibold text-[hsl(var(--fg))]">
            {sortedPhotos.length > 1
              ? `${Math.round((new Date(sortedPhotos[sortedPhotos.length - 1].date || sortedPhotos[sortedPhotos.length - 1].created_date) - new Date(sortedPhotos[0].date || sortedPhotos[0].created_date)) / (1000 * 60 * 60 * 24))} dias`
              : '—'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[hsl(var(--fg-3))]">Atual</p>
          <p className="text-xs font-semibold text-[hsl(var(--accent-primary))]">
            {currentIndex + 1}/{sortedPhotos.length}
          </p>
        </div>
      </div>
    </div>
  );
}
