import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S57_Coach_Insight from '../screens/S57_Coach_Insight.jsx';

export default function V3CoachInsight() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  return (
    <S57_Coach_Insight
      dark={theme === 'dark'}
      onBack={() => navigate(-1)}
      onAskFollowUp={() => navigate('/app/coach/chat')}
      onNavigate={(route) => navigate(route)}
      showTabBar={false}
    />
  );
}
