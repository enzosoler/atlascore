import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-t-2 border-brand-gold animate-spin shadow-glow"></div>
        <Loader2 className="absolute h-8 w-8 text-brand-gold animate-pulse" />
      </div>
      {message && (
        <p className="mt-8 text-sm font-medium tracking-widest text-base-gray-400 uppercase">
          {message}
        </p>
      )}
    </div>
  );
}
