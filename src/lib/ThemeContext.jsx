import React, { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'atlas-theme';
const THEME_EXPLICIT_KEY = 'atlas-theme-explicit';
const DEFAULT_THEME = 'dark';

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {} });
const LIGHT_THEME_COLOR = '#EFE9DA';
const DARK_THEME_COLOR = '#0A0A0A';
const BRAND_FAVICON_DARK_CHROME = '/branding/v3/svg/app-icon-paper.svg';
const BRAND_FAVICON_LIGHT_CHROME = '/branding/v3/svg/app-icon-ink.svg';
const BRAND_APPLE_TOUCH = '/branding/v3/app-icon/paper-180.png';

function getInitialTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  if (urlTheme === 'light' || urlTheme === 'dark') {
    return urlTheme;
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  const hasExplicitPreference = window.localStorage.getItem(THEME_EXPLICIT_KEY) === 'true';

  if (hasExplicitPreference && (storedTheme === 'dark' || storedTheme === 'light')) {
    return storedTheme;
  }

  return DEFAULT_THEME;
}

function syncBrandAssets(theme) {
  const favicon = document.getElementById('app-favicon');
  const appleTouchIcon = document.getElementById('app-apple-touch-icon');
  const themeColor = document.getElementById('app-theme-color');
  const prefersDarkChrome =
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const faviconHref = prefersDarkChrome ? BRAND_FAVICON_DARK_CHROME : BRAND_FAVICON_LIGHT_CHROME;

  if (favicon) {
    favicon.setAttribute('href', faviconHref);
    favicon.setAttribute('type', 'image/svg+xml');
  }

  if (appleTouchIcon) {
    appleTouchIcon.setAttribute('href', BRAND_APPLE_TOUCH);
  }

  if (themeColor) {
    themeColor.setAttribute('content', theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
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
