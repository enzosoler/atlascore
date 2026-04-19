import React, { useEffect } from 'react';
import { cn } from '../lib/cn';

/**
 * Sheet — bottom-sheet on mobile, side-drawer on desktop.
 * Dialog — centered modal (medium/small content).
 *
 * Both are uncontrolled-friendly: pass `open` + `onClose`.
 * Mounts a portal-free absolute overlay at z-index sheet.
 */

function Backdrop({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] animate-rd-fade-in bg-[hsl(var(--rd-bg-overlay))] backdrop-blur-[2px]"
      onClick={onClose}
      aria-hidden
    />
  );
}

export function Sheet({ open, onClose, side = 'bottom', size = 'md', title, footer, className, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;

  const dimensions = {
    bottom: cn(
      'left-0 right-0 bottom-0',
      'rounded-t-rd-sheet border-t',
      size === 'full' ? 'h-[calc(100vh-48px)]'
      : size === 'lg' ? 'max-h-[85vh]'
      : size === 'md' ? 'max-h-[70vh]'
                      : 'max-h-[50vh]',
      'animate-rd-sheet-in rd-safe-bottom',
    ),
    right: cn(
      'right-0 top-0 bottom-0 w-full max-w-[520px]',
      'border-l animate-rd-slide-up',
    ),
    left: cn(
      'left-0 top-0 bottom-0 w-full max-w-[520px]',
      'border-r animate-rd-slide-up',
    ),
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'fixed z-[70] flex flex-col',
          'bg-rd-surface border-rd-border shadow-rd-xl',
          dimensions[side],
          className,
        )}
      >
        {side === 'bottom' && (
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-rd-border-strong/60" aria-hidden />
        )}
        {title && (
          <div className="flex items-center justify-between border-b border-rd-border px-5 py-3.5">
            <h2 className="text-rd-h3 text-rd-fg">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 rounded-rd-control text-rd-fg-muted hover:bg-rd-surface-2 hover:text-rd-fg"
            >×</button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-rd-border bg-rd-surface/80 px-5 py-3 backdrop-blur">{footer}</div>
        )}
      </div>
    </>
  );
}

export function Dialog({ open, onClose, title, description, footer, size = 'md', className, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const w = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-xl' : 'max-w-md';
  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-full rounded-rd-xl border border-rd-border bg-rd-elevated shadow-rd-xl animate-rd-slide-up',
            w, className,
          )}
        >
          {(title || description) && (
            <div className="p-5">
              {title && <h2 className="text-rd-h3 text-rd-fg">{title}</h2>}
              {description && <p className="mt-1 text-[13px] text-rd-fg-muted">{description}</p>}
            </div>
          )}
          {children && <div className="px-5 pb-4">{children}</div>}
          {footer && <div className="flex items-center justify-end gap-2 border-t border-rd-border px-5 py-3">{footer}</div>}
        </div>
      </div>
    </>
  );
}

export function FullScreenModal({ open, onClose, title, rightAction, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-rd-bg animate-rd-fade-in">
      <header className="flex items-center justify-between border-b border-rd-border px-4 h-rd-top-bar rd-safe-top">
        <button onClick={onClose} aria-label="Close" className="h-10 w-10 rounded-rd-control text-rd-fg-muted hover:bg-rd-surface-2">←</button>
        {title && <h1 className="text-rd-h3 text-rd-fg">{title}</h1>}
        <div>{rightAction}</div>
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
