import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';

export function useCustomerPortal() {
  const [loading, setLoading] = useState(false);

  const openCustomerPortal = useCallback(async (returnUrl) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          return_url: returnUrl || `${window.location.origin}${ROUTES.billing}`,
        },
      });

      if (error) {
        console.error('Customer portal error:', error);
        return { ok: false, error: error.message || 'Could not open billing portal' };
      }

      if (data?.url) {
        window.location.href = data.url;
        return { ok: true };
      } else {
        return { ok: false, error: data?.error || 'Could not open billing portal' };
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      return { ok: false, error: 'Error accessing billing portal' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    openCustomerPortal,
    loading,
  };
}
