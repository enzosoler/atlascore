import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { EmptyState, PageShell, PrimaryButton, SectionCard, SecondaryButton } from '@/components/shared/StablePage';
import { captureException } from '@/lib/sentry';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
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
