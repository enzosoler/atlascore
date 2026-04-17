import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';

// Custom screen components
import SplashScreen from './screens/SplashScreen';
import HookScreen from './screens/HookScreen';
import BuildingScreen from './screens/BuildingScreen';
import ProjectionScreen from './screens/ProjectionScreen';
import BodySelectScreen from './screens/BodySelectScreen';
import SocialProofScreen from './screens/SocialProofScreen';
import CommitmentScreen from './screens/CommitmentScreen';
import TrialExplainerScreen from './screens/TrialExplainerScreen';
import PaywallScreen from './screens/PaywallScreen';
import AccountCreationScreen from './screens/AccountCreationScreen';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction) => ({
    x: direction * 60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: -direction * 60,
    opacity: 0,
  }),
};

const slideTransition = {
  x: { type: 'spring', stiffness: 350, damping: 32 },
  opacity: { duration: 0.2 },
};

/* ------------------------------------------------------------------ */
/*  Inline screen renderers                                           */
/* ------------------------------------------------------------------ */

function SingleSelectScreen({ screen, answers, setAnswer, goNext }) {
  const selected = answers[screen.fieldKey];

  const handleTap = (value) => {
    setAnswer(screen.fieldKey, value);
    if (screen.autoAdvance) {
      setTimeout(goNext, 200);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-white">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-6 text-[15px] leading-snug text-white/60">
          {screen.subtitle}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {screen.options?.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          const emoji = typeof opt === 'object' ? opt.emoji : null;
          const isSelected = selected === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleTap(value)}
              className={`flex items-center gap-3 rounded-[14px] border px-4 py-4 text-left text-[15px] font-medium transition-colors ${
                isSelected
                  ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/.12)] text-white'
                  : 'border-white/10 bg-white/5 text-white/80'
              }`}
            >
              {emoji && <span className="text-xl">{emoji}</span>}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiSelectScreen({ screen, answers, toggleAnswer }) {
  const selected = answers[screen.fieldKey] ?? [];

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-white">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-6 text-[15px] leading-snug text-white/60">
          {screen.subtitle}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {screen.options?.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          const emoji = typeof opt === 'object' ? opt.emoji : null;
          const isSelected = selected.includes(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleAnswer(screen.fieldKey, value)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${
                isSelected
                  ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/.12)] text-white'
                  : 'border-white/10 bg-white/5 text-white/80'
              }`}
            >
              {emoji && <span className="text-lg">{emoji}</span>}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumericInputScreen({ screen, answers, setAnswer }) {
  const value = answers[screen.fieldKey] ?? '';
  const inputRef = useRef(null);

  useEffect(() => {
    // focus input on mount
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw);
    setAnswer(screen.fieldKey, Number.isNaN(num) ? '' : num);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <h1 className="mb-2 text-center text-[26px] font-bold leading-tight text-white">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-8 text-center text-[15px] leading-snug text-white/60">
          {screen.subtitle}
        </p>
      )}

      <div className="flex items-baseline gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder="0"
          className="w-28 border-b-2 border-white/20 bg-transparent text-center text-[48px] font-bold text-white outline-none transition-colors focus:border-[hsl(var(--brand))]"
        />
        {screen.unit && (
          <span className="text-[18px] font-medium text-white/50">
            {screen.unit}
          </span>
        )}
      </div>
    </div>
  );
}

function InterstitialScreen({ screen, goNext }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      {screen.emoji && (
        <span className="mb-4 text-[56px]">{screen.emoji}</span>
      )}
      <h1 className="mb-3 text-[26px] font-bold leading-tight text-white">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-8 max-w-[280px] text-[15px] leading-snug text-white/60">
          {screen.subtitle}
        </p>
      )}
      <button
        type="button"
        onClick={goNext}
        className="rounded-[14px] bg-[hsl(var(--brand))] px-8 py-3.5 text-[15px] font-semibold text-white"
      >
        Keep going
      </button>
    </div>
  );
}

function PlaceholderScreen({ screen }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      <span className="mb-3 text-[13px] font-medium uppercase tracking-wider text-white/30">
        {screen.type}
      </span>
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-white">
        {screen.title ?? screen.id}
      </h1>
      {screen.subtitle && (
        <p className="max-w-[280px] text-[15px] leading-snug text-white/60">
          {screen.subtitle}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen router                                                     */
/* ------------------------------------------------------------------ */

function ScreenRenderer({ screen, answers, setAnswer, toggleAnswer, goNext }) {
  switch (screen.type) {
    case 'single-select':
      return (
        <SingleSelectScreen
          screen={screen}
          answers={answers}
          setAnswer={setAnswer}
          goNext={goNext}
        />
      );

    case 'multi-select':
      return (
        <MultiSelectScreen
          screen={screen}
          answers={answers}
          toggleAnswer={toggleAnswer}
        />
      );

    case 'numeric-input':
      return (
        <NumericInputScreen
          screen={screen}
          answers={answers}
          setAnswer={setAnswer}
        />
      );

    case 'interstitial':
      return <InterstitialScreen screen={screen} goNext={goNext} />;

    case 'splash':
      return <SplashScreen />;

    case 'hook':
      return <HookScreen />;

    case 'building':
      return <BuildingScreen />;

    case 'projection':
      return <ProjectionScreen />;

    case 'body-select':
      return <BodySelectScreen />;

    case 'social-proof':
      return <SocialProofScreen />;

    case 'commitment':
      return <CommitmentScreen />;

    case 'trial-explainer':
      return <TrialExplainerScreen />;

    case 'paywall':
      return <PaywallScreen />;

    case 'account-creation':
      return <AccountCreationScreen />;

    default:
      return <PlaceholderScreen screen={screen} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Continue button                                                   */
/* ------------------------------------------------------------------ */

const HIDE_CONTINUE_TYPES = new Set([
  'splash',
  'building',
  'interstitial',
]);

function shouldShowContinue(screen) {
  if (!screen) return false;
  if (screen.autoAdvance) return false;
  if (HIDE_CONTINUE_TYPES.has(screen.type)) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/*  OnboardingEngine                                                  */
/* ------------------------------------------------------------------ */

export default function OnboardingEngine() {
  const {
    answers,
    currentIndex,
    currentScreen,
    direction,
    quizProgress,
    setAnswer,
    toggleAnswer,
    goNext,
    goBack,
    canAdvance,
    isFirstScreen,
  } = useOnboarding();

  /* ---- auto-advance timer ---- */
  useEffect(() => {
    if (!currentScreen?.autoAdvanceMs) return;

    const timer = setTimeout(goNext, currentScreen.autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [currentScreen, goNext]);

  /* ---- derived ---- */
  const showProgressBar = currentScreen?.act === 'quiz';
  const showContinue = shouldShowContinue(currentScreen);
  const progressPct =
    quizProgress.total > 0
      ? (quizProgress.current / quizProgress.total) * 100
      : 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-[hsl(var(--bg))]" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* ---- top bar ---- */}
      <div className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-3">
        {/* back button */}
        {!isFirstScreen ? (
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors active:bg-white/10"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}

        {/* progress bar */}
        {showProgressBar ? (
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[hsl(var(--brand))]"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* spacer to balance the back button */}
        <div className="h-9 w-9" />
      </div>

      {/* ---- main content (animated) ---- */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-1 flex-col"
          >
            {currentScreen && (
              <ScreenRenderer
                screen={currentScreen}
                answers={answers}
                setAnswer={setAnswer}
                toggleAnswer={toggleAnswer}
                goNext={goNext}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- bottom continue button ---- */}
      {showContinue && (
        <div className="shrink-0 px-5 pb-4 pt-2">
          <button
            type="button"
            disabled={!canAdvance}
            onClick={goNext}
            className="w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
