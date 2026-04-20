import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S71_Follow from '../screens/S71_Follow.jsx';

export default function V3Follow() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S71_Follow
      dark={theme === 'dark'}
      onOpenUser={(id) => navigate(`/app/u/${id}`)}
      onFollow={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
