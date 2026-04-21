import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useSubscription } from '@/lib/SubscriptionContext';
import { toast } from 'sonner';
import S65_Danger_Zone from '../screens/S65_Danger_Zone.jsx';

export default function V3DangerZone() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { subscription, showCustomerCenter } = useSubscription();

  const handleResetData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');
      const { error } = await supabase.functions.invoke('reset-user-data', {
        body: {},
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      toast.success('Data reset — account cleared');
      await logout(); // hard redirects to / → auth reads onboarding_completed=false → /onboarding
    } catch (err) {
      console.error('[V3DangerZone] reset error', err);
      toast.error('Reset failed', { description: err?.message || 'Try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast.error('No authenticated account found');
      return;
    }

    const confirmEmail = window.prompt(`Type ${user.email} to permanently delete this account.`, '');
    if (confirmEmail !== user.email) {
      toast('Account deletion cancelled', {
        description: 'The confirmation email did not match.',
      });
      return;
    }

    const confirmed = window.confirm(
      'This permanently deletes your account and tracking data. This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not signed in');

      const { data, error } = await supabase.functions.invoke('self-delete-user', {
        body: {},
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.code === 'cancel_store_subscription_first') {
          toast.error('Cancel store subscription first', {
            description: 'Open subscription management, cancel there, then retry deletion.',
          });
          await showCustomerCenter?.();
          return;
        }
        throw new Error(data.error);
      }

      toast.success('Account deleted');
      try { await logout(); } catch {}
      navigate('/', { replace: true });
    } catch (err) {
      const message = err?.message || 'Try again.';
      toast.error('Account deletion failed', { description: message });
      if (
        subscription?.status &&
        ['active', 'trialing', 'granted', 'past_due'].includes(subscription.status)
      ) {
        toast('Manage billing first if needed', {
          description: 'If this account still has store-managed billing, cancel it before retrying deletion.',
        });
      }
    }
  };

  return (
    <S65_Danger_Zone
      dark={theme === 'dark'}
      userEmail={user?.email}
      onExportData={() => navigate('/app/export')}
      onResetData={handleResetData}
      onDeleteAccount={handleDeleteAccount}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
