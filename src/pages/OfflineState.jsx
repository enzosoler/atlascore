import React from 'react';
import { DataState } from '@/components/shared/DataState';

/**
 * Page-level OfflineState -- wraps the unified DataState component.
 * Keeps the same public API as the original for backward compatibility.
 */
export default function OfflineState() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <DataState
          variant="offline"
          title="You're offline"
          description="Please check your internet connection and try again."
          action={{ label: 'Retry connection', onClick: () => window.location.reload() }}
        />
      </div>
    </div>
  );
}
