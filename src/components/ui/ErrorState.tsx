import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-status-error/20 bg-status-error/5 p-8 text-center animate-in fade-in duration-500',
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-status-error/10">
        <AlertCircle className="h-10 w-10 text-status-error" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-base-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-base-gray-400">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          className="mt-6 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
