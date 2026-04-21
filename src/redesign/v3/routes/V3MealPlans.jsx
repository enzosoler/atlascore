import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { WEBAPP_PAYWALL } from '@/lib/platformRoutes';
import S68_Meal_Plans from '../screens/S68_Meal_Plans.jsx';

export default function V3MealPlans() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier;
  const isPro = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';
  return (
    <S68_Meal_Plans
      dark={theme === 'dark'}
      isPro={isPro}
      onStartTemplate={(t) => navigate('/app/nutrition/recipes/new', { state: { template: t } })}
      onOpenPlan={(id) => navigate(`/app/nutrition/meal/${id}`)}
      onGeneratePlan={() => navigate('/app/coach/chat')}
      onUpgrade={() => navigate(WEBAPP_PAYWALL)}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
