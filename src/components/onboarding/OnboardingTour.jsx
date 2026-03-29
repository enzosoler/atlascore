import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';

// ─── Step config (icons are decorative — not translated) ──────────────────────

const TOUR_STEPS = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'onboarding.welcome.title',
    description: 'onboarding.welcome.description',
  },
  {
    id: 'nutrition',
    icon: '📊',
    title: 'onboarding.nutrition.title',
    description: 'onboarding.nutrition.description',
  },
  {
    id: 'workouts',
    icon: '💪',
    title: 'onboarding.workouts.title',
    description: 'onboarding.workouts.description',
  },
  {
    id: 'progress',
    icon: '📸',
    title: 'onboarding.progress.title',
    description: 'onboarding.progress.description',
  },
  {
    id: 'profile',
    icon: '👤',
    title: 'onboarding.profile.title',
    description: 'onboarding.profile.description',
  },
  {
    id: 'complete',
    icon: '🚀',
    title: 'onboarding.complete.title',
    description: 'onboarding.complete.description',
  },
];

const TOUR_STORAGE_KEY = 'atlas_onboarding_completed';
// Keep the old key as an alias so existing users who already skipped the tour
// don't see it again after upgrading.
const TOUR_STORAGE_KEY_LEGACY = 'atlas_onboarding_completed';

// ─── Step slide animation (direction-aware) ───────────────────────────────────

function stepVariants(direction) {
  return {
    enter: { opacity: 0, x: direction > 0 ? 40 : -40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction > 0 ? -40 : 40 },
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingTour() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  // Guard: only show after real onboarding is complete, and only once per device.
  useEffect(() => {
    if (!user?.onboarding_completed) {
      console.log('[OnboardingTour] suppressed — onboarding_completed:', user?.onboarding_completed);
      return;
    }
    const done =
      localStorage.getItem(TOUR_STORAGE_KEY) ||
      localStorage.getItem(TOUR_STORAGE_KEY_LEGACY);
    if (!done) {
      console.log('[OnboardingTour] showing tour for user:', user?.id);
      timerRef.current = setTimeout(() => setIsVisible(true), 600);
    }
    return () => clearTimeout(timerRef.current);
  }, [user?.onboarding_completed, user?.id]);

  // Lock body scroll while tour is open.
  useEffect(() => {
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible]);

  const dismiss = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
  }, []);

  const goNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }, [step, dismiss]);

  if (!isVisible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const panel = (
    <AnimatePresence>
      <div
        // Full-screen overlay — sits above everything including native tabs (z-[1000])
        className="fixed inset-0 z-[1000] flex flex-col items-center justify-end sm:justify-center"
        // Trap pointer events so underlying UI is completely blocked.
        style={{ pointerEvents: 'auto' }}
      >
        {/* Backdrop */}
        <motion.div
          key="tour-backdrop"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismiss}
          aria-hidden="true"
        />

        {/* Sheet / modal */}
        <motion.div
          key="tour-sheet"
          className={[
            // Mobile: full-width bottom sheet
            'relative w-full max-w-lg',
            'bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.7)]',
            // Rounded top corners on mobile, all corners on sm+
            'rounded-t-[28px] sm:rounded-[24px]',
            // Safe-area padding at bottom on mobile
            'px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6',
            'shadow-2xl',
            // On desktop, don't stretch to full width
            'sm:mx-4',
          ].join(' ')}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.9 }}
          // Stop clicks inside the sheet from hitting the backdrop dismiss handler.
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (decorative, mobile) */}
          <div className="mx-auto mb-5 h-[5px] w-10 rounded-full bg-[hsl(var(--border-h))] sm:hidden" />

          {/* Dismiss button */}
          <button
            onClick={dismiss}
            aria-label={t('onboarding.tour.skip')}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-3))] hover:bg-[hsl(var(--fill)/0.7)] hover:text-[hsl(var(--fg))] transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>

          {/* Step content — slides on step change */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              variants={stepVariants(direction)}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="space-y-3"
            >
              {/* Icon */}
              <div className="text-[36px] leading-none select-none" aria-hidden="true">
                {current.icon}
              </div>

              {/* Title */}
              <h2 className="text-[20px] font-bold tracking-[-0.025em] text-[hsl(var(--fg))] leading-tight pr-8">
                {t(current.title)}
              </h2>

              {/* Description */}
              <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
                {t(current.description)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {TOUR_STEPS.map((s, i) => (
              <motion.div
                key={s.id}
                animate={{
                  width: i === step ? 20 : 6,
                  backgroundColor:
                    i === step
                      ? 'hsl(var(--brand))'
                      : i < step
                      ? 'hsl(var(--brand)/0.35)'
                      : 'hsl(var(--border-h))',
                }}
                transition={{ duration: 0.25 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3">
            {/* Skip (hidden on last step) */}
            {!isLast && (
              <button
                onClick={dismiss}
                className="flex-1 rounded-[14px] border border-[hsl(var(--border)/0.7)] py-3 text-[14px] font-semibold text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.5)] active:bg-[hsl(var(--fill)/0.8)] transition-colors"
              >
                {t('onboarding.tour.skip')}
              </button>
            )}

            {/* Continue / Finish */}
            <button
              onClick={goNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--brand))] py-3 text-[14px] font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity"
            >
              {isLast ? t('onboarding.tour.finish') : t('onboarding.tour.next')}
              {!isLast && <ArrowRight className="h-4 w-4" strokeWidth={2.5} />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Render into document.body via portal so the tour is never clipped by
  // any parent overflow, z-index stacking context, or layout container.
  return createPortal(panel, document.body);
}

export default OnboardingTour;

/**
 * Hook to reset the tour (for settings / testing).
 */
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };
}
