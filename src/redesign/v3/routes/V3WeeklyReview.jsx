import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S30_Weekly_Recap from '../screens/S30_Weekly_Recap.jsx';

export default function V3WeeklyReview() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <S30_Weekly_Recap
      dark={theme === 'dark'}
      noData
      onClose={() => navigate('/app/today')}
      onGoToday={() => navigate('/app/today')}
    />
  );
}
