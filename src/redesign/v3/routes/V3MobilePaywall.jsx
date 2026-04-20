import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S5_Paywall_A from '../screens/S5_Paywall_A.jsx';

export default function V3MobilePaywall() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S5_Paywall_A
      dark={theme === 'dark'}
      onSubscribe={() => navigate('/app/today')}
      onRestore={() => {}}
      showTabBar={false}
    />
  );
}
