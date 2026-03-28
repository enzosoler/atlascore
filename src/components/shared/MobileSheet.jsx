import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

/**
 * MobileSheet — shared bottom-sheet for all mobile flows.
 *
 * Guarantees:
 *  - Anchored to bottom: 0, above the tab bar
 *  - Safe-area aware (bottom inset)
 *  - Internal scroll for body content
 *  - Sticky footer/action area
 *  - z-index above tab bar (z-60)
 *
 * Usage:
 *   <MobileSheet open={open} onOpenChange={setOpen} title="Water">
 *     <MobileSheet.Body> ... scrollable content ... </MobileSheet.Body>
 *     <MobileSheet.Footer> ... sticky actions ... </MobileSheet.Footer>
 *   </MobileSheet>
 */
export default function MobileSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent
        className={cn(
          'mobile-sheet flex flex-col',
          'max-h-[85dvh]',
          'pb-[calc(var(--tab-bar-h,94px)+env(safe-area-inset-bottom,0px))]',
          className
        )}
      >
        {(title || description) && (
          <DrawerHeader className="px-5 pb-3 pt-2 text-left">
            {title && (
              <DrawerTitle className="text-[15px] font-bold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}
        {children}
      </DrawerContent>
    </Drawer>
  );
}

function Body({ children, className }) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto overscroll-contain px-5 py-3',
        '-webkit-overflow-scrolling-touch',
        className
      )}
    >
      {children}
    </div>
  );
}

function Footer({ children, className }) {
  return (
    <div
      className={cn(
        'shrink-0 border-t border-[hsl(var(--border)/0.5)] px-5 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}

MobileSheet.Body = Body;
MobileSheet.Footer = Footer;
