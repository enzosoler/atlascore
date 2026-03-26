import { useEffect } from 'react';

/**
 * Sets --app-height on :root to window.innerHeight (the true visible viewport).
 *
 * Why: `100vh` on iOS Safari = initial viewport height including browser chrome.
 * When the address bar collapses, 100vh stays wrong. window.innerHeight is always
 * the currently-visible area.
 *
 * Usage: call once near the top of your layout root (AppLayout or AppShell).
 */
export function useViewportHeight() {
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };

    setHeight();
    window.addEventListener('resize', setHeight, { passive: true });
    window.addEventListener('orientationchange', setHeight, { passive: true });

    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
    };
  }, []);
}
