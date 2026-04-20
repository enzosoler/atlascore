import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S56_Composition_History from '../screens/S56_Composition_History.jsx';

export default function V3CompositionHistory() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S56_Composition_History
      dark={theme === 'dark'}
      onLogCheckpoint={() => navigate('/app/body/measurements')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
