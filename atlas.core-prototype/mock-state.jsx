const MockStateContext = React.createContext(null);
const PreviewNavigationContext = React.createContext(null);

window.MockStateContext = MockStateContext;
window.PreviewNavigationContext = PreviewNavigationContext;
window.useMockState = function useMockState() {
  return React.useContext(MockStateContext);
};
window.usePreviewNavigation = function usePreviewNavigation() {
  return React.useContext(PreviewNavigationContext);
};

function setInPath(source, path, value) {
  const keys = path.split('.');
  const root = Array.isArray(source) ? [...source] : { ...source };
  let cursor = root;

  keys.forEach((key, index) => {
    const isLeaf = index === keys.length - 1;
    if (isLeaf) {
      cursor[key] = value;
      return;
    }

    const nextValue = cursor[key];
    cursor[key] = Array.isArray(nextValue) ? [...nextValue] : { ...(nextValue || {}) };
    cursor = cursor[key];
  });

  return root;
}

function MockStateProvider({ children }) {
  const adaptive = window.OnboardingEngine
    ? window.OnboardingEngine.defaultOnboardingState
    : {};
  const [state, setState] = React.useState({
    onboarding: {
      identity: {},
      goal: null,
      activity: null,
      constraints: {},
    },
    onboardingAdaptive: adaptive,
    today: {
      recoveryScore: 72,
      readiness: 'medium',
    },
  });

  const update = React.useCallback((path, value) => {
    setState((prev) => setInPath(prev, path, value));
  }, []);

  const contextValue = React.useMemo(() => ({ state, update }), [state, update]);

  return (
    <MockStateContext.Provider value={contextValue}>
      {children}
    </MockStateContext.Provider>
  );
}

window.MockStateProvider = MockStateProvider;
