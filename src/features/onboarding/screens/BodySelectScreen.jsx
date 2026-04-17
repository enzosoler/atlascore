import { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';

/* ------------------------------------------------------------------ */
/*  Body-fat spectrum stops                                            */
/* ------------------------------------------------------------------ */

const MALE_STOPS = [
  {
    value: 'lean',
    label: 'Lean / Athletic',
    range: '8 - 12 %',
    description: 'Visible abs, vascular, defined muscle separation',
    // CSS body-shape params: shoulder width, waist width, hip width (0-1 scale)
    shape: { shoulder: 0.72, waist: 0.42, hip: 0.48 },
  },
  {
    value: 'fit',
    label: 'Fit',
    range: '13 - 18 %',
    description: 'Some definition, flat stomach, athletic look',
    shape: { shoulder: 0.74, waist: 0.50, hip: 0.52 },
  },
  {
    value: 'average',
    label: 'Average',
    range: '19 - 25 %',
    description: 'Soft midsection, minimal visible definition',
    shape: { shoulder: 0.70, waist: 0.58, hip: 0.58 },
  },
  {
    value: 'soft',
    label: 'Soft',
    range: '26 - 32 %',
    description: 'Rounded midsection, wider at the waist',
    shape: { shoulder: 0.68, waist: 0.66, hip: 0.65 },
  },
  {
    value: 'heavy',
    label: 'Heavy',
    range: '33 % +',
    description: 'Significant body fat, round torso shape',
    shape: { shoulder: 0.66, waist: 0.76, hip: 0.72 },
  },
];

const FEMALE_STOPS = [
  {
    value: 'lean',
    label: 'Lean / Athletic',
    range: '16 - 20 %',
    description: 'Toned, visible muscle definition, minimal softness',
    shape: { shoulder: 0.58, waist: 0.40, hip: 0.58 },
  },
  {
    value: 'fit',
    label: 'Fit',
    range: '21 - 26 %',
    description: 'Defined shape, healthy curves, toned limbs',
    shape: { shoulder: 0.60, waist: 0.48, hip: 0.62 },
  },
  {
    value: 'average',
    label: 'Average',
    range: '27 - 33 %',
    description: 'Soft shape, some fullness around midsection',
    shape: { shoulder: 0.58, waist: 0.56, hip: 0.66 },
  },
  {
    value: 'soft',
    label: 'Soft',
    range: '34 - 40 %',
    description: 'Rounded shape, wider hips and midsection',
    shape: { shoulder: 0.56, waist: 0.64, hip: 0.72 },
  },
  {
    value: 'heavy',
    label: 'Heavy',
    range: '40 % +',
    description: 'Significant body fat, fuller proportions',
    shape: { shoulder: 0.56, waist: 0.74, hip: 0.76 },
  },
];

/* ------------------------------------------------------------------ */
/*  CSS-drawn body proportion indicator                                */
/*  Uses three stacked rounded rectangles (shoulders, waist, hips)     */
/*  whose widths reflect the body-fat level. Clean, abstract, modern.  */
/* ------------------------------------------------------------------ */

function BodyShape({ shape, isSelected }) {
  const barColor = isSelected
    ? 'hsl(var(--brand))'
    : 'hsl(var(--fg-3) / 0.5)';
  const barColorLight = isSelected
    ? 'hsl(var(--brand) / 0.35)'
    : 'hsl(var(--fg-3) / 0.18)';

  const maxW = 48; // max width in px
  const shoulderW = Math.round(shape.shoulder * maxW);
  const waistW = Math.round(shape.waist * maxW);
  const hipW = Math.round(shape.hip * maxW);

  return (
    <div className="flex flex-col items-center gap-[3px]">
      {/* Head — small circle */}
      <motion.div
        layout
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: barColor,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      {/* Shoulders */}
      <motion.div
        layout
        style={{
          width: shoulderW,
          height: 8,
          borderRadius: 4,
          background: barColor,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      {/* Torso / Waist */}
      <motion.div
        layout
        style={{
          width: waistW,
          height: 14,
          borderRadius: 5,
          background: barColorLight,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      {/* Hips */}
      <motion.div
        layout
        style={{
          width: hipW,
          height: 8,
          borderRadius: 4,
          background: barColor,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      {/* Legs — two small bars */}
      <div className="flex gap-[4px]">
        <motion.div
          layout
          style={{
            width: 6,
            height: 16,
            borderRadius: 3,
            background: barColorLight,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        <motion.div
          layout
          style={{
            width: 6,
            height: 16,
            borderRadius: 3,
            background: barColorLight,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gradient spectrum bar with animated position indicator              */
/* ------------------------------------------------------------------ */

function SpectrumBar({ stops, selectedIndex }) {
  const hasSelection = selectedIndex !== -1;

  return (
    <div className="relative mx-auto mb-6 w-full max-w-[340px]">
      {/* Track */}
      <div
        className="h-[6px] w-full rounded-full"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--brand)) 0%, hsl(var(--brand) / 0.5) 35%, hsl(var(--fg-3) / 0.3) 65%, hsl(var(--fg-3) / 0.5) 100%)',
        }}
      />

      {/* Dot indicators for each stop */}
      <div className="absolute inset-x-0 top-0 flex h-[6px] items-center justify-between px-[2px]">
        {stops.map((stop, i) => (
          <div
            key={stop.value}
            className="relative flex items-center justify-center"
          >
            <div
              className="h-[4px] w-[4px] rounded-full transition-all duration-200"
              style={{
                background:
                  i === selectedIndex
                    ? 'white'
                    : 'hsl(var(--bg) / 0.6)',
                transform: i === selectedIndex ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Animated thumb */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            className="absolute top-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: `${(selectedIndex / (stops.length - 1)) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            style={{
              marginLeft: -9,
              marginTop: -9,
            }}
          >
            <div
              className="h-[18px] w-[18px] rounded-full border-[2.5px]"
              style={{
                borderColor: 'hsl(var(--brand))',
                background: 'hsl(var(--bg))',
                boxShadow: '0 2px 8px hsl(var(--brand) / 0.3)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen titles by fieldKey                                          */
/* ------------------------------------------------------------------ */

const TITLES = {
  current_body_type: 'Which describes your body today?',
  desired_body_type: 'Which describes where you want to be?',
};

const SUBTITLES = {
  current_body_type:
    "Tap the closest match. This helps us set realistic milestones.",
  desired_body_type:
    "Pick your target. We'll shape your plan around getting there.",
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

/**
 * BodySelectScreen -- body-fat percentage spectrum picker.
 * Used for both "current body" (Q10) and "desired body" (Q11).
 * Reads `currentScreen.fieldKey` to know which answer to set.
 * Auto-advances 300ms after selection.
 */
export default function BodySelectScreen() {
  const { currentScreen, answers, setAnswer, goNext } = useOnboarding();
  const advanceTimer = useRef(null);

  const fieldKey = currentScreen?.fieldKey;
  const selected = fieldKey ? answers[fieldKey] : null;
  const isFemale = answers.sex === 'female';

  const stops = useMemo(() => (isFemale ? FEMALE_STOPS : MALE_STOPS), [isFemale]);

  const selectedIndex = stops.findIndex((s) => s.value === selected);

  const title = TITLES[fieldKey] ?? currentScreen?.title;
  const subtitle = SUBTITLES[fieldKey] ?? currentScreen?.subtitle;

  const handleSelect = (value) => {
    if (!fieldKey) return;
    setAnswer(fieldKey, value);

    // Auto-advance after a brief pause for visual feedback
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, 300);
  };

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      {/* Title */}
      <h1 className="mb-2 text-[24px] font-bold leading-tight tracking-[-0.03em] text-[hsl(var(--fg))]">
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="mb-6 text-[15px] leading-snug text-[hsl(var(--fg-2))]">
          {subtitle}
        </p>
      )}

      {/* Spectrum bar */}
      <SpectrumBar stops={stops} selectedIndex={selectedIndex} />

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {stops.map((stop, i) => {
          const isSelected = selected === stop.value;

          return (
            <motion.button
              key={stop.value}
              type="button"
              onClick={() => handleSelect(stop.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 rounded-[16px] border px-4 py-3 text-left transition-colors"
              style={{
                borderColor: isSelected
                  ? 'hsl(var(--brand))'
                  : 'hsl(var(--border) / 0.7)',
                background: isSelected
                  ? 'hsl(var(--brand) / 0.08)'
                  : 'hsl(var(--card) / 0.6)',
                boxShadow: isSelected
                  ? '0 0 0 1px hsl(var(--brand) / 0.2), 0 2px 8px hsl(var(--brand) / 0.1)'
                  : 'none',
              }}
            >
              {/* Body proportion indicator */}
              <div className="flex w-[52px] shrink-0 items-center justify-center">
                <BodyShape shape={stop.shape} isSelected={isSelected} />
              </div>

              {/* Text content */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[15px] font-semibold tracking-[-0.01em] transition-colors"
                    style={{
                      color: isSelected
                        ? 'hsl(var(--fg))'
                        : 'hsl(var(--fg))',
                    }}
                  >
                    {stop.label}
                  </span>
                  <span
                    className="text-[12px] font-medium tabular-nums transition-colors"
                    style={{
                      color: isSelected
                        ? 'hsl(var(--brand))'
                        : 'hsl(var(--fg-3))',
                    }}
                  >
                    {stop.range}
                  </span>
                </div>
                <span
                  className="text-[13px] leading-snug transition-colors"
                  style={{
                    color: isSelected
                      ? 'hsl(var(--fg-2))'
                      : 'hsl(var(--fg-3))',
                  }}
                >
                  {stop.description}
                </span>
              </div>

              {/* Selection indicator */}
              <div className="flex shrink-0 items-center justify-center">
                <motion.div
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px]"
                  style={{
                    borderColor: isSelected
                      ? 'hsl(var(--brand))'
                      : 'hsl(var(--border))',
                    background: isSelected
                      ? 'hsl(var(--brand))'
                      : 'transparent',
                  }}
                  animate={{
                    scale: isSelected ? 1 : 0.9,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {isSelected && (
                    <motion.svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 25,
                        delay: 0.05,
                      }}
                    >
                      <path
                        d="M2.5 6.5L5 9L9.5 3.5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
