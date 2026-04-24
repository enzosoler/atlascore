import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { toast } from 'sonner';
import { useT } from '@/lib/i18nContext';
import S5_Paywall_A from '../screens/S5_Paywall_A.jsx';
import {
  canOpenContextualPaywall,
  getPaywallTriggerLabel,
} from '@/redesign/v3/components/paywall/paywallRouteGuard.js';

export default function V3MobilePaywall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { showPaywall, restore } = useSubscription();
  const t = useT();
  const trigger = location.state?.trigger;
  const from = location.state?.from;

  if (!canOpenContextualPaywall({ trigger, from })) {
    return <Navigate to="/app/today" replace />;
  }

  return (
    <S5_Paywall_A
      dark={theme === 'dark'}
      kicker={`${getPaywallTriggerLabel(trigger)} · premium`}
      onSubscribe={async () => {
        const purchased = await showPaywall?.();
        if (purchased) {
          navigate('/app/today', { replace: true });
        }
      }}
      onRestore={async () => {
        const restored = await restore?.();
        if (restored) {
          navigate('/app/today', { replace: true });
        } else {
          toast(t('paywall.toasts.noActiveSub'));
        }
      }}
      showTabBar={false}
    />
  );
}
