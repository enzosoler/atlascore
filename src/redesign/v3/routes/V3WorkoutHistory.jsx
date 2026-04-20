import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S54_Workout_History from '../screens/S54_Workout_History.jsx';

export default function V3WorkoutHistory() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S54_Workout_History
      dark={theme === 'dark'}
      onOpenSession={(id) => navigate(`/app/workouts/${id}`)}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
