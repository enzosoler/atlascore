import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S82_Meal_Detail from '../screens/S82_Meal_Detail.jsx';

export default function V3MealDetail(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  return (
    <S82_Meal_Detail dark={theme === 'dark'} id={id} onBack={() => navigate('/nutrition/meal-plans')} />
  );
}
