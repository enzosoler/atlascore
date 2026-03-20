import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';

/**
 * OnboardingTour — Product tour for new users
 * Shows a series of popups explaining key features
 */

const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'onboarding.welcome.title',
    description: 'onboarding.welcome.description',
    position: 'center',
  },
  {
    id: 'nutrition',
    target: '[data-tour="nutrition"]',
    title: 'onboarding.nutrition.title',
    description: 'onboarding.nutrition.description',
    position: 'bottom',
  },
  {
    id: 'workouts',
    target: '[data-tour="workouts"]',
    title: 'onboarding.workouts.title',
    description: 'onboarding.workouts.description',
    position: 'bottom',
  },
  {
    id: 'progress',
    target: '[data-tour="progress"]',
    title: 'onboarding.progress.title',
    description: 'onboarding.progress.description',
    position: 'bottom',
  },
  {
    id: 'profile',
    target: '[data-tour="profile"]',
    title: 'onboarding.profile.title',
    description: 'onboarding.profile.description',
    position: 'bottom',
  },
  {
    id: 'complete',
    target: null,
    title: 'onboarding.complete.title',
    description: 'onboarding.complete.description',
    position: 'center',
  },
];

const ONBOARDING_STORAGE_KEY = 'atlas_onboarding_completed';

export function OnboardingTour() {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  // Check if onboarding has been completed
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!completed) {
      // Show onboarding after a short delay
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  // Update target element position
  useEffect(() => {
    if (!isVisible) return;

    const step = TOUR_STEPS[currentStep];
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={handleSkip}
          />

          {/* Spotlight (highlight target element) */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-40 border-2 border-[hsl(var(--primary))] rounded-lg pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
              }}
            />
          )}

          {/* Tooltip Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed z-50 bg-[hsl(var(--card))] rounded-lg shadow-lg border border-[hsl(var(--border))] max-w-sm p-6 space-y-4"
            style={{
              left: '50%',
              top: targetRect
                ? Math.max(targetRect.top - 200, 50)
                : '50%',
              transform: targetRect
                ? 'translateX(-50%)'
                : 'translate(-50%, -50%)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))]">
                  {t(step.title)}
                </h3>
                <p className="text-sm text-[hsl(var(--fg-2))] leading-relaxed">
                  {t(step.description)}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[hsl(var(--border))] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[hsl(var(--primary))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-[hsl(var(--fg-2))]">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className="p-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--fg))] hover:bg-[hsl(var(--shell))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:opacity-90 transition-opacity"
                >
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default OnboardingTour;

/**
 * Hook to restart onboarding (for testing/settings)
 */
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.location.reload();
  };
}
