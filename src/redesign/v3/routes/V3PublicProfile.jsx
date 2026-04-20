import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S76_Public_Profile from '../screens/S76_Public_Profile.jsx';

export default function V3PublicProfile() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { username } = useParams();
  return (
    <S76_Public_Profile
      dark={theme === 'dark'}
      onToggleFollow={() => {}}
      onMessage={() => navigate('/app/coach/chat')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
