/**
 * ShareFlow — Modal that appears when a streak milestone is hit.
 *
 * Shows a scaled-down preview of the StreakShareCard, with "Share" and
 * "Not now" actions. On share it renders the card at full 1080x1920
 * via html2canvas, then hands the image to the platform share sheet
 * (Web Share API with file support, or plain download as fallback).
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { track } from '@/lib/analytics';
import StreakShareCard from './StreakShareCard';

// ── localStorage helpers ────────────────────────────────────────────────────

function isDismissed(milestone) {
  try {
    return localStorage.getItem(`streakShareDismissed_${milestone}`) === '1';
  } catch {
    return false;
  }
}

function setDismissed(milestone) {
  try {
    localStorage.setItem(`streakShareDismissed_${milestone}`, '1');
  } catch {
    // quota exceeded — ignore
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ShareFlow({
  open,
  onClose,
  streak,
  workouts = 0,
  meals = 0,
  weightEntries = 0,
}) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  // Track impression
  useEffect(() => {
    if (open && streak) {
      track('share_card_shown', { milestone: streak, streak });
    }
  }, [open, streak]);

  const dismiss = useCallback(() => {
    setDismissed(streak);
    track('share_card_dismissed', { milestone: streak });
    onClose();
  }, [streak, onClose]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setSharing(true);

    try {
      // Render the full-size card to canvas
      const canvas = await html2canvas(cardRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false,
      });

      // Convert to blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png'),
      );

      if (!blob) {
        console.warn('[ShareFlow] canvas.toBlob returned null');
        setSharing(false);
        return;
      }

      const file = new File([blob], `atlas-streak-${streak}.png`, {
        type: 'image/png',
      });

      // Try Web Share API (works on native via Capacitor + modern mobile browsers)
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `${streak}-day streak`,
            text: `I just hit a ${streak}-day streak on atlas.core`,
          });
          track('share_card_shared', { milestone: streak, method: 'native' });
          setDismissed(streak);
          onClose();
          setSharing(false);
          return;
        } catch (err) {
          // User cancelled — fall through to download
          if (err?.name === 'AbortError') {
            setSharing(false);
            return;
          }
        }
      }

      // Try basic navigator.share (URL-only, no file)
      if (typeof navigator !== 'undefined' && navigator.share) {
        const dataUrl = canvas.toDataURL('image/png');
        try {
          await navigator.share({
            title: `${streak}-day streak`,
            text: `I just hit a ${streak}-day streak on atlas.core`,
          });
          track('share_card_shared', { milestone: streak, method: 'web' });
          setDismissed(streak);
          onClose();
          setSharing(false);
          return;
        } catch {
          // fallthrough to download
        }
      }

      // Fallback: download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-streak-${streak}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      track('share_card_shared', { milestone: streak, method: 'download' });
      setDismissed(streak);
      onClose();
    } catch (err) {
      console.error('[ShareFlow] share failed', err);
    } finally {
      setSharing(false);
    }
  }, [streak, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="share-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={dismiss}
        >
          <motion.div
            key="share-modal"
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative flex flex-col items-center gap-5 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute -top-2 right-0 z-10 rounded-full bg-white/10 p-2 text-white/60 backdrop-blur active:scale-90 transition-transform"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scaled preview */}
            <div
              className="w-full overflow-hidden rounded-2xl shadow-2xl"
              style={{
                aspectRatio: '9 / 16',
                maxHeight: '60vh',
              }}
            >
              <div
                style={{
                  width: 1080,
                  height: 1920,
                  transform: 'scale(var(--card-scale))',
                  transformOrigin: 'top left',
                  // --card-scale is set via inline style below
                }}
                ref={cardRef}
                className="share-card-wrapper"
              >
                <StreakShareCard
                  streak={streak}
                  workouts={workouts}
                  meals={meals}
                  weightEntries={weightEntries}
                />
              </div>
            </div>

            {/* We use a small script to compute the scale factor */}
            <style>{`
              .share-card-wrapper {
                --card-scale: calc(min(100vw - 32px, 24rem) / 1080);
              }
            `}</style>

            {/* Actions */}
            <div className="flex w-full gap-3">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-[15px] font-bold text-black transition-opacity active:opacity-80 disabled:opacity-50"
              >
                {sharing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Share
                  </>
                )}
              </button>
              <button
                onClick={dismiss}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3.5 text-[15px] font-semibold text-white/70 transition-colors active:bg-white/5"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Re-export for convenience
export { isDismissed as isShareDismissed };
