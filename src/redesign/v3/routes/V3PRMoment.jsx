import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S5_Paywall_B from '../screens/S5_Paywall_B.jsx';
import {
  CONTEXTUAL_PAYWALL_ROUTE,
  createPaywallState,
} from '@/redesign/v3/components/paywall/paywallRouteGuard.js';

export default function V3PRMoment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  return (
    <S5_Paywall_B
      dark={theme === 'dark'}
      onUpgrade={() => navigate(CONTEXTUAL_PAYWALL_ROUTE, {
        state: createPaywallState('celebration', location.pathname),
      })}
      onRestore={() => {}}
      showTabBar={false}
    />
  );
}
