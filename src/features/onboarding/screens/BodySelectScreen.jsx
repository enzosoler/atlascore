import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';

/* ------------------------------------------------------------------ */
/*  Body type options                                                  */
/* ------------------------------------------------------------------ */

const BODY_TYPES = [
  { value: 'slim', label: 'Slim' },
  { value: 'average', label: 'Average' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'heavy', label: 'Heavy' },
];

/* ------------------------------------------------------------------ */
/*  Placeholder SVG silhouettes                                        */
/*  Simple geometric shapes — will be replaced with real art later     */
/* ------------------------------------------------------------------ */

const SILHOUETTE_PATHS = {
  slim: (
    <svg viewBox="0 0 60 120" className="h-full w-full" fill="currentColor">
      {/* Head */}
      <circle cx="30" cy="14" r="10" />
      {/* Torso */}
      <rect x="22" y="26" width="16" height="40" rx="6" />
      {/* Left leg */}
      <rect x="22" y="68" width="7" height="38" rx="3" />
      {/* Right leg */}
      <rect x="31" y="68" width="7" height="38" rx="3" />
      {/* Left arm */}
      <rect x="12" y="28" width="8" height="30" rx="4" />
      {/* Right arm */}
      <rect x="40" y="28" width="8" height="30" rx="4" />
    </svg>
  ),
  average: (
    <svg viewBox="0 0 60 120" className="h-full w-full" fill="currentColor">
      <circle cx="30" cy="14" r="10" />
      <rect x="19" y="26" width="22" height="42" rx="7" />
      <rect x="20" y="70" width="9" height="38" rx="4" />
      <rect x="31" y="70" width="9" height="38" rx="4" />
      <rect x="9" y="28" width="9" height="32" rx="4" />
      <rect x="42" y="28" width="9" height="32" rx="4" />
    </svg>
  ),
  athletic: (
    <svg viewBox="0 0 60 120" className="h-full w-full" fill="currentColor">
      <circle cx="30" cy="14" r="10" />
      {/* Wider shoulders, tapered torso */}
      <path d="M14 28 Q14 26, 18 26 L42 26 Q46 26, 46 28 L44 68 Q44 70, 42 70 L18 70 Q16 70, 16 68 Z" />
      <rect x="19" y="72" width="10" height="38" rx="4" />
      <rect x="31" y="72" width="10" height="38" rx="4" />
      <rect x="6" y="28" width="10" height="34" rx="5" />
      <rect x="44" y="28" width="10" height="34" rx="5" />
    </svg>
  ),
  heavy: (
    <svg viewBox="0 0 60 120" className="h-full w-full" fill="currentColor">
      <circle cx="30" cy="14" r="10" />
      {/* Wider torso */}
      <rect x="14" y="26" width="32" height="46" rx="10" />
      <rect x="17" y="74" width="11" height="36" rx="5" />
      <rect x="32" y="74" width="11" height="36" rx="5" />
      <rect x="5" y="28" width="10" height="32" rx="5" />
      <rect x="45" y="28" width="10" height="32" rx="5" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

/**
 * BodySelectScreen — used for both "current body" and "desired body" questions.
 * Reads `currentScreen.fieldKey` to know which answer to set.
 * Auto-advances 200ms after selection.
 */
export default function BodySelectScreen() {
  const { currentScreen, answers, setAnswer, goNext } = useOnboarding();
  const advanceTimer = useRef(null);

  const fieldKey = currentScreen?.fieldKey;
  const selected = fieldKey ? answers[fieldKey] : null;

  const handleSelect = (value) => {
    if (!fieldKey) return;
    setAnswer(fieldKey, value);

    // Auto-advance after a brief pause for visual feedback
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, 200);
  };

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      {/* Title */}
      <h1 className="mb-2 text-[24px] font-bold leading-tight tracking-[-0.03em] text-[hsl(var(--fg))]">
        {currentScreen?.title}
      </h1>

      {/* Subtitle */}
      {currentScreen?.subtitle && (
        <p className="mb-8 text-[15px] leading-snug text-[hsl(var(--fg-2))]">
          {currentScreen.subtitle}
        </p>
      )}

      {/* Body silhouettes grid */}
      <div className="flex justify-center gap-3">
        {BODY_TYPES.map((type) => {
          const isSelected = selected === type.value;

          return (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => handleSelect(type.value)}
              whileTap={{ scale: 0.95 }}
              className={`flex w-[72px] flex-col items-center gap-2 rounded-[16px] border px-2 pb-3 pt-4 transition-colors ${
                isSelected
                  ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)]'
                  : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)]'
              }`}
            >
              {/* Silhouette */}
              <div
                className={`h-[64px] w-[40px] transition-colors ${
                  isSelected
                    ? 'text-[hsl(var(--brand))]'
                    : 'text-[hsl(var(--fg-3))]'
                }`}
              >
                {SILHOUETTE_PATHS[type.value]}
              </div>

              {/* Label */}
              <span
                className={`text-[13px] font-medium transition-colors ${
                  isSelected
                    ? 'text-[hsl(var(--fg))]'
                    : 'text-[hsl(var(--fg-3))]'
                }`}
              >
                {type.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
