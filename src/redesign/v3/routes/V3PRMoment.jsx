import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S5_Paywall_B from '../screens/S5_Paywall_B.jsx';

export default function V3PRMoment() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S5_Paywall_B
      dark={theme === 'dark'}
      onUpgrade={() => navigate('/app/billing/plans')}
      onRestore={() => {}}
      showTabBar={false}
    />
  );
}
