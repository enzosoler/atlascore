import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S65_Danger_Zone from '../screens/S65_Danger_Zone.jsx';

export default function V3DangerZone() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  return (
    <S65_Danger_Zone
      dark={theme === 'dark'}
      userEmail={user?.email}
      onExportData={() => navigate('/app/export')}
      onResetData={() => {}}
      onDeleteAccount={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
