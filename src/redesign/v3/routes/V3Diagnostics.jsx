import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S66_Diagnostics from '../screens/S66_Diagnostics.jsx';

export default function V3Diagnostics() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S66_Diagnostics
      dark={theme === 'dark'}
      appVersion={typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_VERSION ? import.meta.env.VITE_APP_VERSION : 'dev'}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
