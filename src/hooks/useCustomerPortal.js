import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function useCustomerPortal() {
  const [loading, setLoading] = useState(false);

  const openCustomerPortal = useCallback(async (userId, email, returnUrl) => {
    if (!userId || !email) {
      toast.error('User ID and email are required to access billing portal');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          user_id: userId,
          email,
          return_url: returnUrl || `${window.location.origin}/Settings`,
        },
      });

      if (error) {
        console.error('Customer portal error:', error);
        toast.error(error.message || 'Could not open billing portal');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || 'Could not open billing portal');
      }
    } catch (error) {
      toast.error('Error accessing billing portal');
      console.error('Customer portal error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    openCustomerPortal,
    loading,
  };
}
