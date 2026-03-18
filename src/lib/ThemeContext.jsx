import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} });
const LIGHT_THEME_COLOR = '#FFFFFF';
const DARK_THEME_COLOR = '#1B3A6B';

function syncBrandAssets(theme) {
  const isDark = theme === 'dark';
  const favicon = document.getElementById('app-favicon');
  const appleTouchIcon = document.getElementById('app-apple-touch-icon');
  const themeColor = document.getElementById('app-theme-color');

  if (favicon) {
    favicon.setAttribute('href', isDark ? '/branding/dark/favicon.ico' : '/branding/light/favicon.ico');
  }

  if (appleTouchIcon) {
    appleTouchIcon.setAttribute('href', '/branding/dark/apple-touch-icon.png');
  }

  if (themeColor) {
    themeColor.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Read from localStorage, default to 'light'
    return localStorage.getItem('atlas-theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (theme === 'dark') root.classList.add('dark');
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
