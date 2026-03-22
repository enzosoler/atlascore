import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLLABLE_OVERFLOWS = new Set(['auto', 'scroll', 'overlay']);

function resolveOverflowY(style) {
  return style.overflowY === 'visible' ? style.overflow : style.overflowY;
}

function isScrollableElement(element) {
  if (typeof window === 'undefined' || !(element instanceof HTMLElement)) return false;

  const style = window.getComputedStyle(element);
  const overflowY = resolveOverflowY(style);

  return SCROLLABLE_OVERFLOWS.has(overflowY) && element.scrollHeight > element.clientHeight;
}

function getDocumentScrollRoot() {
  if (typeof document === 'undefined') return null;

  return document.scrollingElement || document.documentElement || document.body || null;
}

function getPrimaryScrollContainer(candidate) {
  if (isScrollableElement(candidate)) {
    return candidate;
  }

  return getDocumentScrollRoot();
}

export function getPrimaryScrollTop(candidate) {
  const container = getPrimaryScrollContainer(candidate);

  if (!container || typeof window === 'undefined') return 0;

  if (container === document.body || container === document.documentElement || container === document.scrollingElement) {
    return window.scrollY || container.scrollTop || 0;
  }

  return container.scrollTop || 0;
}

function resetScrollTarget(target) {
  if (!target) return;

  if (typeof target.scrollTo === 'function') {
    target.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return;
  }

  if ('scrollTop' in target) {
    target.scrollTop = 0;
  }
}

export function resetPrimaryScroll(candidate) {
  const container = getPrimaryScrollContainer(candidate);
  if (!container) return;

  resetScrollTarget(container);

  if (typeof document !== 'undefined') {
    if (document.documentElement && document.documentElement !== container) {
      document.documentElement.scrollTop = 0;
    }

    if (document.body && document.body !== container) {
      document.body.scrollTop = 0;
    }
  }

  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}

export function usePrimaryRouteScrollReset(containerRef) {
  const { pathname, search, hash, state } = useLocation();
  const isReadyRef = useRef(false);
  const previousRouteRef = useRef(`${pathname}${search}`);
  const shouldPreserveScroll = Boolean(state?.preserveScroll);

  useLayoutEffect(() => {
    const currentRoute = `${pathname}${search}`;
    const previousRoute = previousRouteRef.current;
    previousRouteRef.current = currentRoute;

    if (!isReadyRef.current) {
      isReadyRef.current = true;
      return;
    }

    if (previousRoute === currentRoute || hash || shouldPreserveScroll) {
      return;
    }

    resetPrimaryScroll(containerRef.current);

    const frameId = window.requestAnimationFrame(() => {
      resetPrimaryScroll(containerRef.current);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [containerRef, hash, pathname, search, shouldPreserveScroll]);
}
