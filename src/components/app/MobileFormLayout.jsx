import React from 'react';
import { cn } from '@/lib/utils';

/**
 * MobileFormLayout — standalone page layout for native-feeling mobile forms.
 *
 * Structure:
 *   fixed header  (back button, title, primary action)
 *   scrollable body
 *   optional sticky footer (secondary CTAs)
 *
 * Uses `var(--app-height)` (set by useViewportHeight) for correct height on iOS.
 */
export function MobileFormLayout({ header, children, footer, className }) {
  return (
    <div className={cn('mobile-page', className)}>
      {header && <div className="shrink-0 bg-[hsl(var(--card))]">{header}</div>}
      <div className="mobile-sheet-body">
        {children}
      </div>
      {footer && (
        <div className="mobile-sheet-footer shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
