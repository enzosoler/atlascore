import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Only send errors in production by default; set VITE_SENTRY_DSN in dev to test
    enabled: !!dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function setSentryUser(user) {
  if (!dsn) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

export function captureException(error, context) {
  console.error(error);
  if (!dsn) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function trackEvent(name, data) {
  if (!dsn) return;
  Sentry.addBreadcrumb({ category: 'event', message: name, data, level: 'info' });
}
