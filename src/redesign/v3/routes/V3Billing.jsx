import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useSubscription } from '@/lib/SubscriptionContext';
import { openSubscriptionManagement } from '@/lib/revenueCat';
import { listBillingSubscriptions, openWebBillingPortal } from '@/services/billingService';
import { WEBAPP_BILLING, WEBAPP_PAYWALL } from '@/lib/platformRoutes';
import { toast } from 'sonner';
import S40_Billing from '../screens/S40_Billing.jsx';

export default function V3Billing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { subscription } = useSubscription();

  const { data: rows = [] } = useQuery({
    queryKey: ['v3-billing-subscriptions', user?.id],
    queryFn: () => listBillingSubscriptions(user.id),
    enabled: !!user?.id,
  });

  const latest = rows[0] || subscription || null;
  const rawDate = latest?.current_period_ends_at || latest?.trial_ends_at || latest?.expires_at;
  const nextCharge = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    : '—';
  const invoices = rows.map((row, index) => ({
    d: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' }).toUpperCase()
      : '—',
    n: row.stripe_subscription_id || row.id || `SUB-${index + 1}`,
    a: row.status === 'trialing' ? 'TRIAL' : (row.tier || 'PRO').toUpperCase(),
    s: (row.status || 'inactive').toUpperCase(),
  }));

  async function openPortal() {
    try {
      const handled = await openSubscriptionManagement();
      if (!handled) {
        await openWebBillingPortal(`${window.location.origin}${WEBAPP_BILLING}`);
      }
    } catch (error) {
      toast.error('Could not open billing management', {
        description: error?.message || 'Try again.',
      });
    }
  }

  return (
    <S40_Billing
      dark={theme === 'dark'}
      planName={latest?.tier || 'atlas.core'}
      price={latest?.status === 'trialing' ? '$0' : '$12'}
      interval={latest?.status === 'trialing' ? '/trial' : '/month'}
      nextCharge={nextCharge}
      invoices={invoices}
      onEditPayment={openPortal}
      onSwitchPlan={() => navigate(WEBAPP_PAYWALL)}
      onCancel={openPortal}
      onOpenInvoice={openPortal}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
