import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} });
const LIGHT_THEME_COLOR = '#F4F7FB';
const DARK_THEME_COLOR = '#0B0D12';

function syncBrandAssets(theme) {
  const isDark = theme === 'dark';
  const favicon = document.getElementById('app-favicon');
  const appleTouchIcon = document.getElementById('app-apple-touch-icon');
  const themeColor = document.getElementById('app-theme-color');

  if (favicon) {
    favicon.setAttribute('href', isDark ? '/branding/dark/favicon.ico' : '/branding/light/favicon.ico');
  }

  if (appleTouchIcon) {
    appleTouchIcon.setAttribute('href', isDark ? '/branding/dark/apple-touch-icon.png' : '/branding/light/apple-touch-icon.png');
  }

  if (themeColor) {
    themeColor.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('atlas-theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.dataset.theme = theme;
    localStorage.setItem('atlas-theme', theme);
    syncBrandAssets(theme);
  }, [theme]);

  const setTheme = (t) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
