import * as React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-base-gray-800 p-8 text-center animate-in fade-in duration-500',
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-base-gray-900 shadow-premium">
        <Icon className="h-10 w-10 text-base-gray-500" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-base-white">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-base-gray-400">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
