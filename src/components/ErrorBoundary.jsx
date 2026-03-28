import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
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
        window.location.reload();
        return;
      }
    }
    console.error('[ErrorBoundary]', error, errorInfo);
    captureException(error, { componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[hsl(var(--bg))] px-6">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[hsl(var(--fill))] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[hsl(var(--fg-2))]" strokeWidth={1.8} />
            </div>
            <div className="space-y-2">
              <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                Something went wrong
              </h1>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
                We couldn't load this section. Try again or go back.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="atlas-button atlas-button-primary w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2} />
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="atlas-button atlas-button-secondary w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Go back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
