import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S51_Food_Diary from '../screens/S51_Food_Diary.jsx';

export default function V3FoodDiary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S51_Food_Diary
      dark={theme === 'dark'}
      onPickDate={() => {}}
      onOpenMeal={(meal) => navigate('/app/nutrition/food', { state: { meal } })}
      onAddFood={() => navigate('/app/nutrition/capture')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
