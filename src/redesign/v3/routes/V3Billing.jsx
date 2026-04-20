import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S40_Billing from '../screens/S40_Billing.jsx';

export default function V3Billing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  return (
    <S40_Billing
      dark={theme === 'dark'}
      onEditPayment={() => {}}
      onSwitchPlan={() => navigate('/app/billing/plans')}
      onCancel={() => {}}
      onOpenInvoice={() => {}}
      showTabBar={false}
    />
  );
}
