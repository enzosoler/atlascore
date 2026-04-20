import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S6_Weight_A from '../screens/S6_Weight_A.jsx';

export default function V3WeightTrend() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S6_Weight_A
      dark={theme === 'dark'}
      onLogWeight={() => navigate('/app/body/weight')}
      showTabBar={false}
    />
  );
}
