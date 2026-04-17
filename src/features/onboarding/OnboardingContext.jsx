import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { ONBOARDING_SCHEMA, QUIZ_SCREEN_COUNT } from './schema';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const DRAFT_KEY = 'atlas_onboarding_v2_draft';
const DEBOUNCE_MS = 500;

/* ------------------------------------------------------------------ */
/*  Reducer                                                           */
/* ------------------------------------------------------------------ */

const initialState = {
  answers: {},
  currentIndex: 0,
  direction: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.fieldKey]: action.value },
      };

    case 'TOGGLE_ANSWER': {
      const prev = state.answers[action.fieldKey] ?? [];
      const exists = prev.includes(action.value);
      const next = exists
        ? prev.filter((v) => v !== action.value)
        : [...prev, action.value];
      return {
        ...state,
        answers: { ...state.answers, [action.fieldKey]: next },
      };
    }

    case 'GO_NEXT':
      return {
        ...state,
        currentIndex: Math.min(
          state.currentIndex + 1,
          ONBOARDING_SCHEMA.length - 1,
        ),
        direction: 1,
      };

    case 'GO_BACK':
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
        direction: -1,
      };

    case 'GO_TO':
      return {
        ...state,
        currentIndex: action.index,
        direction: action.index > state.currentIndex ? 1 : -1,
      };

    case 'RESTORE_DRAFT':
      return {
        ...state,
        answers: action.answers,
        currentIndex: action.currentIndex,
        direction: 1,
      };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  canAdvance helper                                                 */
/* ------------------------------------------------------------------ */

const ALWAYS_ADVANCEABLE = new Set([
  'splash',
  'hook',
  'interstitial',
  'building',
  'projection',
  'social-proof',
  'commitment',
  'trial-explainer',
  'paywall',
  'account-creation',
  'connected-apps',
  'notifications',
]);

function computeCanAdvance(screen, answers) {
  if (!screen) return false;
  if (screen.optional) return true;
  if (ALWAYS_ADVANCEABLE.has(screen.type)) return true;

  const { type, fieldKey } = screen;

  switch (type) {
    case 'single-select':
    case 'body-select':
      return !!answers[fieldKey];

    case 'multi-select':
      return (answers[fieldKey]?.length ?? 0) >= (screen.minSelections || 1);

    case 'numeric-input':
      return typeof answers[fieldKey] === 'number' && answers[fieldKey] > 0;

    case 'body-stats':
      return !!(
        answers.sex &&
        answers.age &&
        answers.height &&
        answers.current_weight
      );

    default:
      return true;
  }
}

/* ------------------------------------------------------------------ */
/*  quizProgress helper                                               */
/* ------------------------------------------------------------------ */

function computeQuizProgress(currentIndex) {
  let current = 0;
  const total = QUIZ_SCREEN_COUNT;

  for (let i = 0; i <= currentIndex; i++) {
    if (ONBOARDING_SCHEMA[i]?.showInProgress) {
      current++;
    }
  }

  return { current, total };
}

/* ------------------------------------------------------------------ */
/*  Macro calculations                                                */
/* ------------------------------------------------------------------ */

function computeMacros(answers) {
  const weight = Number(answers.current_weight) || 70;
  const goal = answers.health_goals?.[0] ?? answers.health_goals ?? 'maintain';

  let multiplier = 30; // default / maintain
  if (goal === 'fat_loss') multiplier = 28;
  else if (goal === 'muscle_gain') multiplier = 35;

  const calories = Math.round(weight * multiplier);
  const protein = Math.round(weight * 2.2);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.25) / 9);
  const water = Math.round(weight * 0.035 * 1000) / 1000; // liters, 3 decimals

  return {
    calories_target: calories,
    protein_target: protein,
    carbs_target: carbs,
    fat_target: fat,
    water_target: water,
  };
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                              */
/* ------------------------------------------------------------------ */

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeDraft(answers, currentIndex) {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ answers, currentIndex }),
    );
  } catch {
    /* quota exceeded — silently fail */
  }
}

export function clearOnboardingDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                           */
/* ------------------------------------------------------------------ */

const OnboardingContext = createContext(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceRef = useRef(null);

  /* ---- restore draft on mount ---- */
  useEffect(() => {
    const draft = readDraft();
    if (draft?.answers) {
      dispatch({
        type: 'RESTORE_DRAFT',
        answers: draft.answers,
        currentIndex: draft.currentIndex ?? 0,
      });
    }
  }, []);

  /* ---- debounced persist ---- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      writeDraft(state.answers, state.currentIndex);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [state.answers, state.currentIndex]);

  /* ---- dispatchers ---- */
  const setAnswer = useCallback(
    (fieldKey, value) => dispatch({ type: 'SET_ANSWER', fieldKey, value }),
    [],
  );

  const toggleAnswer = useCallback(
    (fieldKey, value) => dispatch({ type: 'TOGGLE_ANSWER', fieldKey, value }),
    [],
  );

  const goNext = useCallback(() => dispatch({ type: 'GO_NEXT' }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);

  const goToScreen = useCallback((id) => {
    const idx = ONBOARDING_SCHEMA.findIndex((s) => s.id === id);
    if (idx !== -1) dispatch({ type: 'GO_TO', index: idx });
  }, []);

  const clearDraft = useCallback(() => clearOnboardingDraft(), []);

  const getProfilePayload = useCallback(() => {
    const { answers } = state;
    const macros = computeMacros(answers);

    return {
      ...answers,
      ...macros,
      onboarded_at: new Date().toISOString(),
      onboarding_version: 2,
      target_date: answers.target_date ?? null,
      plan_duration_weeks: answers.plan_duration_weeks ?? null,
      biggest_blocker: answers.biggest_blocker ?? null,
      motivations: answers.motivations ?? null,
      training_preferences: answers.training_preferences ?? null,
      eating_pattern: answers.eating_pattern ?? null,
    };
  }, [state]);

  /* ---- derived values ---- */
  const currentScreen = ONBOARDING_SCHEMA[state.currentIndex] ?? null;
  const canAdvance = computeCanAdvance(currentScreen, state.answers);
  const quizProgress = computeQuizProgress(state.currentIndex);

  const value = useMemo(
    () => ({
      answers: state.answers,
      currentIndex: state.currentIndex,
      currentScreen,
      direction: state.direction,
      quizProgress,
      setAnswer,
      toggleAnswer,
      goNext,
      goBack,
      goToScreen,
      canAdvance,
      isFirstScreen: state.currentIndex === 0,
      isLastScreen: state.currentIndex === ONBOARDING_SCHEMA.length - 1,
      clearDraft,
      getProfilePayload,
    }),
    [
      state.answers,
      state.currentIndex,
      state.direction,
      currentScreen,
      quizProgress,
      setAnswer,
      toggleAnswer,
      goNext,
      goBack,
      goToScreen,
      canAdvance,
      clearDraft,
      getProfilePayload,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an <OnboardingProvider>');
  }
  return ctx;
}
