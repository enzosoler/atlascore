import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { captureException } from '@/lib/sentry';
import { DataState } from '@/components/shared/DataState';

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
          <div className="max-w-sm w-full">
            <DataState
              variant="error"
              title="Something went wrong"
              description="We couldn't load this section. Try again or go back."
              action={{ label: 'Try again', onClick: () => window.location.reload() }}
              secondaryAction={{ label: 'Go back', onClick: () => window.history.back() }}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
