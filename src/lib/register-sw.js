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
