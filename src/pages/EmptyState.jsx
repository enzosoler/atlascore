import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Inbox, Search, Plus, RefreshCw } from 'lucide-react';

export default function EmptyState({ 
  title = 'Nothing here yet',
  description = 'Get started by creating your first item',
  actionLabel = 'Create',
  actionIcon: ActionIcon = Plus,
  onAction,
  icon: Icon = Inbox,
  showRefresh = false,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm"
      >
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--fill))] flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 text-[hsl(var(--fg-3))]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-[hsl(var(--fg-2))] mb-6">{description}</p>
        <div className="flex items-center justify-center gap-3">
          {onAction && (
            <Button onClick={onAction}>
              <ActionIcon className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
          {showRefresh && (
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
