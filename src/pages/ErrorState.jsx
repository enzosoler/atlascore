import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataState } from '@/components/shared/DataState';

/**
 * Page-level ErrorState -- wraps the unified DataState component.
 * Keeps the same public API as the original for backward compatibility.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  onRetry,
  showHome = true,
  code,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <DataState
          variant="error"
          title={title}
          description={code ? `${description} (Error code: ${code})` : description}
          action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
          secondaryAction={showHome ? { label: 'Go home', onClick: () => navigate('/') } : undefined}
          note="If this keeps happening, go back and try a different route."
        />
      </div>
    </div>
  );
}
