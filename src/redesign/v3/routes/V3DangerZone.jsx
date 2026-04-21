import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useSubscription } from '@/lib/SubscriptionContext';
import { toast } from 'sonner';
import { WEBAPP_EXPORT } from '@/lib/platformRoutes';
import { useT } from '@/lib/i18nContext';
import S65_Danger_Zone from '../screens/S65_Danger_Zone.jsx';

export default function V3DangerZone() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { subscription, showCustomerCenter } = useSubscription();
  const t = useT();

  const handleResetData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error(t('dangerZone.toasts.notSignedIn'));
      const { error } = await supabase.functions.invoke('reset-user-data', {
        body: {},
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      toast.success(t('dangerZone.toasts.resetSuccess'));
      await logout(); // hard redirects to / → auth reads onboarding_completed=false → /onboarding
    } catch (err) {
      console.error('[V3DangerZone] reset error', err);
      toast.error(t('dangerZone.toasts.resetFailed'), { description: err?.message || t('common.tryAgain') });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast.error(t('dangerZone.toasts.noAccount'));
      return;
    }

    const confirmEmail = window.prompt(t('dangerZone.prompts.typeEmail', { email: user.email }), '');
    if (confirmEmail !== user.email) {
      toast(t('dangerZone.toasts.deleteCancelled'), {
        description: t('dangerZone.toasts.emailMismatch'),
      });
      return;
    }

    const confirmed = window.confirm(
      t('dangerZone.prompts.finalConfirm')
    );
    if (!confirmed) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error(t('dangerZone.toasts.notSignedIn'));

      const { data, error } = await supabase.functions.invoke('self-delete-user', {
        body: {},
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.code === 'cancel_store_subscription_first') {
          toast.error(t('dangerZone.toasts.cancelSubscriptionFirst'), {
            description: t('dangerZone.toasts.cancelSubscriptionDescription'),
          });
          await showCustomerCenter?.();
          return;
        }
        throw new Error(data.error);
      }

      toast.success(t('dangerZone.toasts.deleteSuccess'));
      try { await logout(); } catch {}
      navigate('/', { replace: true });
    } catch (err) {
      const message = err?.message || t('common.tryAgain');
      toast.error(t('dangerZone.toasts.deleteFailed'), { description: message });
      if (
        subscription?.status &&
        ['active', 'trialing', 'granted', 'past_due'].includes(subscription.status)
      ) {
        toast(t('dangerZone.toasts.manageBillingFirst'), {
          description: t('dangerZone.toasts.manageBillingDescription'),
        });
      }
    }
  };

  return (
    <S65_Danger_Zone
      dark={theme === 'dark'}
      userEmail={user?.email}
      onExportData={() => navigate(WEBAPP_EXPORT)}
      onResetData={handleResetData}
      onDeleteAccount={handleDeleteAccount}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
