import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S63_Account_Settings from '../screens/S63_Account_Settings.jsx';

export default function V3AccountSettings() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  return (
    <S63_Account_Settings
      dark={theme === 'dark'}
      email={user?.email}
      providers={user?.raw_user?.identities?.map((i) => i.provider).filter(Boolean)}
      onChangeEmail={() => {}}
      onChangePassword={() => {}}
      onToggle2FA={() => {}}
      onUnlinkProvider={() => {}}
      onRevokeSession={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
