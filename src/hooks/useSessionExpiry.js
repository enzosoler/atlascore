import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';

const CHECK_INTERVAL_MS = 60_000; // check every 60 seconds
const WARN_BEFORE_MS = 5 * 60_000; // warn 5 minutes before expiry

/**
 * Monitors the Supabase session expiry and shows a toast warning
 * when the access token is about to expire (within 5 minutes).
 * Provides a "Refresh" action button to extend the session.
 */
export function useSessionExpiry() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      warningShownRef.current = false;
      return;
    }

    const checkExpiry = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session?.expires_at) return;

        const expiresAtMs = session.expires_at * 1000;
        const remainingMs = expiresAtMs - Date.now();

        if (remainingMs > 0 && remainingMs <= WARN_BEFORE_MS && !warningShownRef.current) {
          warningShownRef.current = true;
          toast.warning(t('status.sessionExpiresSoon'), {
            duration: 30_000,
            action: {
              label: t('status.sessionRefresh'),
              onClick: async () => {
                await supabase.auth.refreshSession();
                warningShownRef.current = false;
              },
            },
          });
        }

        // Reset flag if session was refreshed (remaining time is well above threshold)
        if (remainingMs > WARN_BEFORE_MS) {
          warningShownRef.current = false;
        }
      } catch (error) {
        // Silently ignore — network errors are handled by offline detection
      }
    };

    // Run immediately then on interval
    checkExpiry();
    const interval = setInterval(checkExpiry, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, t]);
}
