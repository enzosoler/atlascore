import React from 'react';
import { DataState } from '@/components/shared/DataState';

/**
 * Page-level LoadingState -- wraps the unified DataState component.
 * Keeps the same public API as the original for backward compatibility.
 */
export default function LoadingState({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
}) {
  const content = (
    <div className="w-full max-w-sm mx-auto">
      <DataState
        variant="loading"
        title={message}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[hsl(var(--bg))]">
        {content}
      </div>
    );
  }

  return <div className="p-8 flex items-center justify-center">{content}</div>;
}
