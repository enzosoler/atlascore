import React from 'react';
import { Loader2, AlertTriangle, WifiOff, RefreshCw, Database } from 'lucide-react';

export function DataState({ 
  loading, 
  empty, 
  error, 
  offline, 
  title, 
  action, 
  subtitle,
  retryLabel = 'Try again'
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--fg-3))]" />
        <p className="mt-4 text-sm text-[hsl(var(--fg-3))]">Loading...</p>
        {subtitle && (
          <p className="text-xs text-[hsl(var(--fg-3))] mt-2">{subtitle}</p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <AlertTriangle className="h-8 w-8 text-[hsl(var(--err))]" />
        <p className="mt-4 text-sm text-[hsl(var(--err))] text-center max-w-md">
          {title || 'Something went wrong'}
        </p>
        {subtitle && (
          <p className="text-xs text-[hsl(var(--fg-3))] mt-2">{subtitle}</p>
        )}
        {action && (
          <button
            onClick={action}
            className="mt-4 px-4 py-2 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  if (offline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <WifiOff className="h-8 w-8 text-[hsl(var(--fg-3))]" />
        <p className="mt-4 text-sm text-[hsl(var(--fg-3))] text-center max-w-md">
          You're offline
        </p>
        <p className="text-xs text-[hsl(var(--fg-3))] mt-2">
          Check your connection and try again
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <div className="text-center">
          <div className="text-6xl text-[hsl(var(--fg-3))] mb-4">📊</div>
          <p className="text-lg font-medium text-[hsl(var(--fg))] mb-2">{title || 'No data yet'}</p>
          <p className="text-sm text-[hsl(var(--fg-3))] mb-4">Start tracking to see your progress here</p>
          {subtitle && (
            <p className="text-xs text-[hsl(var(--fg-3))] mt-2">{subtitle}</p>
          )}
          {action && (
            <button
              onClick={action}
              className="mt-4 px-6 py-3 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
            >
              Get started
            </button>
          )}
        </div>
      </div>
    );
  }

  // Partial failure state
  if (error === 'partial') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <Database className="h-8 w-8 text-[hsl(var(--warn))]" />
        <p className="mt-4 text-sm text-[hsl(var(--warn))] text-center max-w-md">
          {title || 'Partial data available'}
        </p>
        {subtitle && (
          <p className="text-xs text-[hsl(var(--fg-3))] mt-2">{subtitle}</p>
        )}
        <div className="flex gap-2 mt-4">
          {action && (
            <button
              onClick={action}
              className="px-4 py-2 bg-[hsl(var(--brand))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--brand)/0.9)] transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--card-hi))] transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return null;
}
