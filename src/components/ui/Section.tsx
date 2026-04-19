import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn('space-y-6 py-8 md:py-12', className)} {...props}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight text-brand-gold">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base text-base-gray-400">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
