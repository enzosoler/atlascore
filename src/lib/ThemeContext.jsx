import React, { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'atlas-theme';
const THEME_EXPLICIT_KEY = 'atlas-theme-explicit';
const DEFAULT_THEME = 'dark';

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {} });
const LIGHT_THEME_COLOR = '#F3F5F6';
const DARK_THEME_COLOR = '#080E0E';

function getInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  const hasExplicitPreference = window.localStorage.getItem(THEME_EXPLICIT_KEY) === 'true';

  if (hasExplicitPreference && (storedTheme === 'dark' || storedTheme === 'light')) {
    return storedTheme;
  }

  return DEFAULT_THEME;
}

function syncBrandAssets(theme) {
  const isDark = theme === 'dark';
  const favicon = document.getElementById('app-favicon');
  const appleTouchIcon = document.getElementById('app-apple-touch-icon');
  const themeColor = document.getElementById('app-theme-color');

  if (favicon) {
    favicon.setAttribute('href', isDark ? '/branding/dark/favicon.png' : '/branding/light/favicon.png');
  }

  if (appleTouchIcon) {
    appleTouchIcon.setAttribute('href', isDark ? '/branding/dark/apple-touch-icon.png' : '/branding/light/apple-touch-icon.png');
  }

  if (themeColor) {
    themeColor.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    syncBrandAssets(theme);
  }, [theme]);

  const setTheme = (nextTheme) => {
    localStorage.setItem(THEME_EXPLICIT_KEY, 'true');
    setThemeState(nextTheme === 'light' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
