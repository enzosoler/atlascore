import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';

const STEP_DELAY_MS = 700;
const DONE_PAUSE_MS = 1000;

const DEFAULT_MESSAGES = [
  'Analyzing your baseline...',
  'Matching against similar profiles...',
  'Calibrating your plan...',
  'Almost ready...',
];

/**
 * BuildingScreen — fake-progress loader that reveals messages sequentially.
 * Each message shows a spinner, then flips to a green checkmark after STEP_DELAY_MS.
 * After all messages complete + a short pause, auto-advances.
 */
export default function BuildingScreen() {
  const { currentScreen, goNext } = useOnboarding();
  const messages = currentScreen?.messages ?? DEFAULT_MESSAGES;

  // completedCount tracks how many messages have finished (shown check)
  const [completedCount, setCompletedCount] = useState(0);
  // visibleCount tracks how many messages are visible on screen
  const [visibleCount, setVisibleCount] = useState(1);
  const hasAdvanced = useRef(false);

  useEffect(() => {
    if (hasAdvanced.current) return;

    const total = messages.length;

    // If all are visible AND all completed, wait then advance
    if (completedCount >= total) {
      const timer = setTimeout(() => {
        if (!hasAdvanced.current) {
          hasAdvanced.current = true;
          goNext();
        }
      }, DONE_PAUSE_MS);
      return () => clearTimeout(timer);
    }

    // If the latest visible message hasn't been completed yet, complete it
    if (completedCount < visibleCount) {
      const timer = setTimeout(() => {
        setCompletedCount((c) => c + 1);
      }, STEP_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // If the latest visible message is completed but more remain, show next
    if (visibleCount < total) {
      const timer = setTimeout(() => {
        setVisibleCount((v) => v + 1);
      }, 200); // short gap before showing next line
      return () => clearTimeout(timer);
    }
  }, [completedCount, visibleCount, messages.length, goNext]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      {/* Progress shimmer bar */}
      <div className="mb-10 h-[3px] w-48 overflow-hidden rounded-full bg-[hsl(var(--fg)/0.08)]">
        <motion.div
          className="h-full rounded-full bg-[hsl(var(--brand))]"
          initial={{ width: '0%' }}
          animate={{
            width: `${(completedCount / messages.length) * 100}%`,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Message list */}
      <div className="flex w-full max-w-[300px] flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {messages.slice(0, visibleCount).map((msg, idx) => {
            const isDone = idx < completedCount;

            return (
              <motion.div
                key={msg}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon */}
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      <Check
                        size={18}
                        className="text-[hsl(var(--ok))]"
                        strokeWidth={2.5}
                      />
                    </motion.div>
                  ) : (
                    <Loader2
                      size={18}
                      className="animate-spin text-[hsl(var(--fg-3))]"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[15px] transition-colors ${
                    isDone
                      ? 'text-[hsl(var(--fg))]'
                      : 'text-[hsl(var(--fg-3))]'
                  }`}
                >
                  {msg}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
