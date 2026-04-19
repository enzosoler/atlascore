import * as React from 'react';
import { cn } from '@/lib/utils';

interface AppContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  isFluid?: boolean;
}

export function AppContainer({
  children,
  className,
  isFluid = false,
  ...props
}: AppContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 md:px-6 lg:px-8',
        isFluid ? 'max-w-none' : 'max-w-7xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
