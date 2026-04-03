import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18nContext';

/**
 * Lightweight online/offline detection hook.
 * Listens to browser online/offline events and returns current status.
 * Shows a brief "Back online" toast when connectivity is restored.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { t } = useI18n();

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast.success(t('status.backOnline'));
  }, [t]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline };
}
