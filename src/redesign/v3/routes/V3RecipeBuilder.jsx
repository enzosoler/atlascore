import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S39_Recipe_Builder from '../screens/S39_Recipe_Builder.jsx';

export default function V3RecipeBuilder() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S39_Recipe_Builder
      dark={theme === 'dark'}
      onSave={() => navigate('/app/eat')}
      onCancel={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
