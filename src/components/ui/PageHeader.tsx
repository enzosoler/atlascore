import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-base-gray-800 pb-8 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="flex-1 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-base-white md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-base-gray-400">
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
