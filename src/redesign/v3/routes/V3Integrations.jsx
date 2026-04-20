import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S64_Integrations from '../screens/S64_Integrations.jsx';

export default function V3Integrations() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S64_Integrations
      dark={theme === 'dark'}
      onConnect={() => {}}
      onDisconnect={() => {}}
      onRefresh={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
