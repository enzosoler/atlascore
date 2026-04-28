import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useSubscription } from '@/lib/SubscriptionContext';
import { toast } from 'sonner';
import { WEBAPP_BILLING, WEBAPP_EXPORT } from '@/lib/platformRoutes';
import { useT } from '@/lib/i18nContext';
import { WebAccountRow, WebAccountScaffold, WebAccountSection } from './WebAccountScaffold.jsx';
import PromptDialog from '@/components/ui/PromptDialog';

export default function V3DangerZone() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { subscription, showCustomerCenter } = useSubscription();
  const t = useT();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const hasManagedBilling = Boolean(
    subscription?.status &&
    ['active', 'trialing', 'granted', 'past_due'].includes(subscription.status)
  );

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
      await logout();
    } catch (err) {
      console.error('[V3DangerZone] reset error', err);
      toast.error(t('dangerZone.toasts.resetFailed'), { description: err?.message || t('common.tryAgain') });
    }
  };

  const handleDeleteAccount = () => {
    if (!user?.email) {
      toast.error(t('dangerZone.toasts.noAccount'));
      return;
    }
    setDeleteDialogOpen(true);
  };

  async function onEmailConfirmed(typedEmail) {
    if (typedEmail !== user.email) {
      toast(t('dangerZone.toasts.deleteCancelled'), {
        description: t('dangerZone.toasts.emailMismatch'),
      });
      return;
    }
    setConfirmDialogOpen(true);
  }

  async function executeAccountDeletion() {
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
      if (hasManagedBilling) {
        toast(t('dangerZone.toasts.manageBillingFirst'), {
          description: t('dangerZone.toasts.manageBillingDescription'),
        });
      }
    }
  }

  return (<>
    <WebAccountScaffold
      eyebrow={t('dangerZone.header')}
      title={t('dangerZone.title')}
      description={t('dangerZone.subtitle')}
      backTo="/webapp/settings"
      backLabel={t('dangerZone.backToSettings')}
    >
      <WebAccountSection title={t('dangerZone.sections.safe')}>
        <div style={{ borderTop: 'none' }}>
          <WebAccountRow
            title={t('dangerZone.export.title')}
            description={t('dangerZone.export.description')}
            actionLabel={t('dangerZone.export.action')}
            onAction={() => navigate(WEBAPP_EXPORT)}
          />
        </div>
      </WebAccountSection>

      <WebAccountSection title={t('dangerZone.sections.destructive')}>
        <div style={{ borderTop: 'none' }}>
          <WebAccountRow
            title={t('dangerZone.reset.title')}
            description={t('dangerZone.reset.description')}
            actionLabel={t('dangerZone.reset.action')}
            onAction={handleResetData}
            danger
          />
        </div>
      </WebAccountSection>

      <WebAccountSection title={t('dangerZone.sections.terminal')}>
        {hasManagedBilling ? (
          <div style={{ borderTop: 'none' }}>
            <WebAccountRow
              title={t('dangerZone.billing.title')}
              description={t('dangerZone.billing.description')}
              actionLabel={t('dangerZone.billing.action')}
              onAction={() => navigate(WEBAPP_BILLING)}
            />
          </div>
        ) : null}
        <div style={{ borderTop: hasManagedBilling ? '1px solid rgba(10,10,10,0.08)' : 'none' }}>
          <WebAccountRow
            title={t('dangerZone.delete.title')}
            description={t('dangerZone.delete.description', { email: user?.email || '' })}
            actionLabel={t('dangerZone.delete.action')}
            onAction={handleDeleteAccount}
            danger
          />
        </div>
      </WebAccountSection>
    </WebAccountScaffold>

    <PromptDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      title={t('dangerZone.prompts.typeEmailTitle')}
      description={t('dangerZone.prompts.typeEmail', { email: user?.email || '' })}
      inputLabel={t('dangerZone.prompts.emailLabel')}
      inputPlaceholder={user?.email || ''}
      confirmLabel={t('dangerZone.prompts.deleteButton')}
      cancelLabel={t('common.cancel')}
      onConfirm={onEmailConfirmed}
      destructive
    />

    <PromptDialog
      open={confirmDialogOpen}
      onOpenChange={setConfirmDialogOpen}
      title={t('dangerZone.prompts.finalConfirmTitle')}
      description={t('dangerZone.prompts.finalConfirm')}
      confirmLabel={t('dangerZone.prompts.deleteForever')}
      cancelLabel={t('common.cancel')}
      onConfirm={executeAccountDeletion}
      destructive
    />
  </>
  );
}
