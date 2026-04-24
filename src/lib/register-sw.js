/**
 * Service Worker registration for PWA caching.
 *
 * On Capacitor native (iOS/Android), we skip registration entirely —
 * the native WebView handles its own caching and the SW would only
 * interfere with Capacitor's bridge.
 *
 * On web, vite-plugin-pwa generates the SW at build time and this
 * module wires up the auto-update listener.
 */

export function registerServiceWorker() {
  // Never register on Capacitor native platforms
  if (window.Capacitor?.isNativePlatform()) {
    return;
  }

  // During local preview / development on localhost, avoid registering the
  // service worker and proactively unregister any existing service workers to
  // prevent stale cached bundles from being served.
  if (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister().catch(() => {}));
        }).catch(() => {});
      }
      if (window.caches) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
       
      console.log('[SW] Localhost detected — unregistered existing service workers and cleared caches.');
    } catch (err) {
      // ignore
    }
    return;
  }

  if (!('serviceWorker' in navigator)) {
    return;
  }

  // vite-plugin-pwa with registerType: 'autoUpdate' injects
  // virtual:pwa-register which auto-registers the SW.
  // We import it lazily so it's tree-shaken on native builds.
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onRegisteredSW(swUrl, registration) {
        // Check for updates every 60 minutes
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onOfflineReady() {
        console.log('[SW] App ready for offline use');
      },
    });
  }).catch((err) => {
    console.warn('[SW] Registration failed:', err);
  });
}
