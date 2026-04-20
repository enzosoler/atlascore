import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S67_Profile_Editor from '../screens/S67_Profile_Editor.jsx';

export default function V3ProfileEditor() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const meta = user?.user_metadata || {};
  return (
    <S67_Profile_Editor
      dark={theme === 'dark'}
      profile={{
        firstName: meta.first_name || '',
        lastName: meta.last_name || '',
        email: user?.email || '',
        bio: meta.bio || '',
      }}
      onSave={() => navigate(-1)}
      onChangeAvatar={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
