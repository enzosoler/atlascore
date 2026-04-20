import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S70_Friends from '../screens/S70_Friends.jsx';

export default function V3Friends() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S70_Friends
      dark={theme === 'dark'}
      onOpenUser={(id) => navigate(`/app/u/${id}`)}
      onAccept={() => {}}
      onDecline={() => {}}
      onCancel={() => {}}
      onRemove={() => {}}
      onDiscover={() => navigate('/app/social/follow')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
