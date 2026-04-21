import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { toast } from 'sonner';
import S5_Paywall_A from '../screens/S5_Paywall_A.jsx';

export default function V3MobilePaywall() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showPaywall, restore } = useSubscription();

  return (
    <S5_Paywall_A
      dark={theme === 'dark'}
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
          toast('No active purchases found');
        }
      }}
      showTabBar={false}
    />
  );
}
