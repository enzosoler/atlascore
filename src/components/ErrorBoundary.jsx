import React from 'react';
import { captureException } from '@/lib/sentry';

function isChunkLoadError(error) {
  const msg = error?.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  );
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error, errorInfo) {
    if (isChunkLoadError(error)) {
      const key = 'atlas_chunk_reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        try {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations()
              .then((regs) => Promise.all(regs.map((r) => r.unregister().catch(() => {}))))
              .catch(() => {});
          }
          if (window.caches) {
            caches.keys()
              .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
              .catch(() => {});
          }
        } catch {}
        window.location.reload();
        return;
      }
      captureException(error, { componentStack: errorInfo?.componentStack });
      return;
    }
    console.error('[ErrorBoundary]', error, errorInfo);
    captureException(error, { componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#efe9da',
            padding: '0 24px',
          }}
        >
          <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#0a0a0a',
                margin: '0 0 10px',
              }}
            >
              System interruption
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: '#0a0a0a',
                opacity: 0.7,
                margin: '0 0 28px',
              }}
            >
              This section didn't load. Your system state is safe.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 10,
                  background: '#e8b500',
                  color: '#0a0a0a',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
              <button
                onClick={() => {
                  window.location.href =
                    (import.meta.env.BASE_URL || '/') + 'app/today';
                }}
                style={{
                  padding: '10px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid rgba(10,10,10,0.15)',
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#0a0a0a',
                  cursor: 'pointer',
                }}
              >
                Back to Today
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
