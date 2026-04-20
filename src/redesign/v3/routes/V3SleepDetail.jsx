import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S31_Sleep_Detail from '../screens/S31_Sleep_Detail.jsx';

export default function V3SleepDetail() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S31_Sleep_Detail
      dark={theme === 'dark'}
      onShare={() => navigate('/app/workouts/share')}
      onConnectDevice={() => navigate('/app/settings/integrations')}
      showTabBar={false}
    />
  );
}
