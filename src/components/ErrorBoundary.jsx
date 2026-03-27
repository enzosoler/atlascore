import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { EmptyState, PageShell, PrimaryButton, SectionCard, SecondaryButton } from '@/components/shared/StablePage';
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
      // Stale deployment: chunk hashes rotated after deploy. Force a full reload
      // to pick up the new assets. Guard against reload loops with sessionStorage.
      const key = 'atlas_chunk_reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return;
      }
    }
    captureException(error, { componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageShell
          eyebrow="System"
          title="Unexpected error"
          subtitle="atlas.core kept the shell open so you can recover without losing the entire session."
          maxWidth="max-w-3xl"
        >
          <SectionCard title="Recovery" subtitle="A deliberate fallback state.">
            <EmptyState
              icon={AlertTriangle}
              title="Something went wrong"
              description="Try reloading the app. If the issue keeps happening, return to the previous screen or contact support with the steps you took."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <PrimaryButton type="button" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4" strokeWidth={2} />
                    Reload app
                  </PrimaryButton>
                  <SecondaryButton type="button" onClick={() => window.history.back()}>
                    Go back
                  </SecondaryButton>
                </div>
              }
            />
          </SectionCard>
        </PageShell>
      );
    }

    return this.props.children;
  }
}
