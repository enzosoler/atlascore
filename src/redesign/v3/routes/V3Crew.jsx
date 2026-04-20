import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S28_Crew from '../screens/S28_Crew.jsx';

export default function V3Crew() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S28_Crew
      dark={theme === 'dark'}
      onInvite={() => {}}
      onMessage={(member) => navigate('/app/coach/chat')}
      showTabBar={false}
    />
  );
}
