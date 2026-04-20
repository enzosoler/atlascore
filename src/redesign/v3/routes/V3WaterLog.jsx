import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S53_Water_Log from '../screens/S53_Water_Log.jsx';

export default function V3WaterLog() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S53_Water_Log
      dark={theme === 'dark'}
      onAdd={() => {}}
      onUndo={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
