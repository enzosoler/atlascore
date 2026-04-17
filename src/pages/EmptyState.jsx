import React from 'react';
import { Plus } from 'lucide-react';
import { DataState } from '@/components/shared/DataState';

/**
 * Page-level EmptyState -- wraps the unified DataState component.
 * Keeps the same public API as the original for backward compatibility.
 */
export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Get started by creating your first item',
  actionLabel = 'Create',
  actionIcon: ActionIcon = Plus,
  onAction,
  icon: Icon,
  showRefresh = false,
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <DataState
          variant="empty"
          icon={Icon}
          title={title}
          description={description}
          action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
          secondaryAction={showRefresh ? { label: 'Refresh', onClick: () => window.location.reload() } : undefined}
        />
      </div>
    </div>
  );
}
