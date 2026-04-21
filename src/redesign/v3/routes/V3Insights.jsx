import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { WEBAPP_PAYWALL } from '@/lib/platformRoutes';
import S72_Insights from '../screens/S72_Insights.jsx';

export default function V3Insights() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';
  return (
    <S72_Insights
      dark={theme === 'dark'}
      isPremium={isPremium}
      onUpgrade={() => navigate(WEBAPP_PAYWALL)}
      onOpenInsight={(id) => navigate(`/app/coach/insights/${id}`)}
      onAsk={() => navigate('/app/coach/chat')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
