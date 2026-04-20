import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S38_Food_Detail from '../screens/S38_Food_Detail.jsx';

export default function V3FoodDetail() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S38_Food_Detail
      dark={theme === 'dark'}
      onConfirm={() => navigate('/app/eat')}
      onSaveAsMeal={() => navigate('/app/nutrition/recipes')}
      showTabBar={false}
    />
  );
}
