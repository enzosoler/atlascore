import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AppShell — full-height grid layout primitive (header / content / footer).
 * Uses `var(--app-height)` (set by useViewportHeight) so it works correctly
 * on iOS Safari where `100vh` includes the address bar.
 */
export function AppShell({ children, className }) {
  return (
    <div className={cn('app-shell', className)}>
      {children}
    </div>
  );
}

/**
 * AppShellContent — the scrollable middle slot of AppShell.
 * Fills remaining height and scrolls vertically.
 */
export function AppShellContent({ children, className }) {
  return (
    <div className={cn('app-content', className)}>
      {children}
    </div>
  );
}
