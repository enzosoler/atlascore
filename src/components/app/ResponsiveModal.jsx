import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

/**
 * ResponsiveModal — renders a Radix Dialog on desktop and a vaul Drawer on mobile.
 *
 * Rule: use for flows that need more than a quick confirm but less than a full page.
 * - Quick action (destructive confirm, small input) → plain Dialog
 * - Short/medium flow (multi-field form) → ResponsiveModal  ← this component
 * - Long flow → dedicated route
 *
 * Props:
 *   open, onOpenChange — shared between both modalities
 *   dialogClassName    — extra classes for DialogContent
 *   dialogProps        — extra props forwarded to DialogContent (e.g. onOpenAutoFocus)
 *   drawerClassName    — extra classes for DrawerContent
 *   children           — content rendered inside whichever wrapper is active
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  dialogClassName,
  dialogProps = {},
  drawerClassName,
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className={cn('mobile-sheet', drawerClassName)}>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName} {...dialogProps}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
