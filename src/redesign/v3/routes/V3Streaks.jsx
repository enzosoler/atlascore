import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S74_Streaks from '../screens/S74_Streaks.jsx';

export default function V3Streaks() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S74_Streaks
      dark={theme === 'dark'}
      onLogSomething={() => navigate('/app/today')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
