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
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-[hsl(var(--fg))]">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-6 text-[15px] leading-snug text-[hsl(var(--fg-2))]">
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
            <motion.button
              key={value}
              type="button"
              onClick={() => handleTap(value)}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 rounded-[16px] border px-4 py-4 text-left text-[15px] font-medium transition-all ${
                isSelected
                  ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--fg))] shadow-md shadow-[hsl(var(--brand))/0.2]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card-hi))] hover:text-[hsl(var(--fg))]'
              }`}
            >
              {emoji && <span className="text-xl flex-shrink-0">{emoji}</span>}
              <span className="flex-1">{label}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-5 h-5 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
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
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-[hsl(var(--fg))]">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-6 text-[15px] leading-snug text-[hsl(var(--fg-2))]">
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
            <motion.button
              key={value}
              type="button"
              onClick={() => toggleAnswer(screen.fieldKey, value)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-all ${
                isSelected
                  ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--fg))] shadow-md shadow-[hsl(var(--brand))/0.2]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--card-hi))] hover:text-[hsl(var(--fg))]'
              }`}
            >
              {emoji && <span className="text-lg flex-shrink-0">{emoji}</span>}
              <span>{label}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-4 h-4 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center"
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
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
      <h1 className="mb-2 text-center text-[26px] font-bold leading-tight text-[hsl(var(--fg))]">
        {screen.title}
      </h1>
      {screen.subtitle && (
        <p className="mb-8 text-center text-[15px] leading-snug text-[hsl(var(--fg-2))] max-w-[320px]">
          {screen.subtitle}
        </p>
      )}

      <div className="flex items-baseline gap-2">
        <motion.input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder="0"
          whileFocus={{ scale: 1.05 }}
          className="w-32 border-b-2 border-[hsl(var(--border))] bg-transparent text-center text-[48px] font-bold text-[hsl(var(--fg))] outline-none transition-all focus:border-[hsl(var(--brand))] focus:shadow-[hsl(var(--brand))/0.2]"
        />
        {screen.unit && (
          <motion.span 
            className="text-[20px] font-medium text-[hsl(var(--fg-3))]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {screen.unit}
          </motion.span>
        )}
      </div>
    </div>
  );
}

function InterstitialScreen({ screen, goNext }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
      {screen.emoji && (
        <motion.span 
          className="mb-6 text-[64px] block"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {screen.emoji}
        </motion.span>
      )}
      <motion.h1 
        className="mb-4 text-[28px] font-bold leading-tight text-[hsl(var(--fg))]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {screen.title}
      </motion.h1>
      {screen.subtitle && (
        <motion.p 
          className="mb-10 max-w-[320px] text-[16px] leading-relaxed text-[hsl(var(--fg-2))]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {screen.subtitle}
        </motion.p>
      )}
      <motion.button
        type="button"
        onClick={goNext}
        className="atlas-button atlas-button-primary rounded-[16px] px-8 py-3.5 text-[15px] font-semibold gap-2 shadow-lg shadow-[hsl(var(--brand))/0.25] transition-all hover:shadow-xl hover:shadow-[hsl(var(--brand))/0.35] active:scale-[0.98]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Keep going
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </motion.button>
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
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* ---- top bar ---- */}
      <div className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-3">
        {/* back button */}
        {!isFirstScreen ? (
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.8)] backdrop-blur-sm text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--card-hi))] hover:text-[hsl(var(--fg))] active:scale-[0.95]"
            aria-label="Go back"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}

        {/* progress bar */}
        {showProgressBar ? (
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[hsl(var(--border)/0.3)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent-primary))]"
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
            className="atlas-button atlas-button-primary w-full h-12 rounded-[16px] text-[15px] font-semibold gap-2 shadow-lg shadow-[hsl(var(--brand))/0.25] transition-all hover:shadow-xl hover:shadow-[hsl(var(--brand))/0.35] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 active:scale-[0.98]"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
