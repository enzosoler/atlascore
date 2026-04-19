import React from 'react';
import { PaperThemeProvider, useACT } from '../lib/paper.jsx';
import { useTheme } from '@/lib/ThemeContext';

function V3StandaloneInner({ children }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: dark
          ? 'radial-gradient(circle at top, #1c1a15 0%, #0a0a0a 56%)'
          : 'linear-gradient(180deg, #f6f1e3 0%, #e9e0c8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDesktop ? 'center' : 'stretch',
        padding: isDesktop ? '16px' : '0',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isDesktop ? 430 : '100%',
          height: isDesktop ? 'min(100dvh - 32px, 900px)' : '100dvh',
          background: c.bg,
          color: c.fg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isDesktop ? 38 : 0,
          border: isDesktop
            ? (dark
                ? '1px solid rgba(239,233,218,0.08)'
                : '1px solid rgba(10,10,10,0.08)')
            : 'none',
          boxShadow: isDesktop
            ? (dark
                ? '0 28px 72px rgba(0,0,0,0.45)'
                : '0 28px 72px rgba(40,30,20,0.18)')
            : 'none',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function V3StandaloneLayout({ children }) {
  return (
    <PaperThemeProvider>
      <V3StandaloneInner>{children}</V3StandaloneInner>
    </PaperThemeProvider>
  );
}
