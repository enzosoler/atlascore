import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S44_Protocols_Empty_Locked from '../screens/S44_Protocols_Empty_Locked.jsx';
import {
  CONTEXTUAL_PAYWALL_ROUTE,
  createPaywallState,
} from '@/redesign/v3/components/paywall/paywallRouteGuard.js';

export default function V3ProtocolsEmpty() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  return (
    <S44_Protocols_Empty_Locked
      dark={theme === 'dark'}
      onAddQuickStart={(protocol) => navigate('/app/protocols/new', { state: { protocol } })}
      onCreateCustom={() => navigate('/app/protocols/new')}
      onUpgrade={() => navigate(CONTEXTUAL_PAYWALL_ROUTE, {
        state: createPaywallState('protocol_limit', location.pathname),
      })}
      showTabBar={false}
    />
  );
}
