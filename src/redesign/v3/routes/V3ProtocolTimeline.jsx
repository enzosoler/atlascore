import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S49_Protocol_Timeline from '../screens/S49_Protocol_Timeline.jsx';

export default function V3ProtocolTimeline() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S49_Protocol_Timeline
      dark={theme === 'dark'}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
