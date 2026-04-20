import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S29_Workout_Summary from '../screens/S29_Workout_Summary.jsx';

export default function V3WorkoutSummary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S29_Workout_Summary
      dark={theme === 'dark'}
      onSharePR={() => navigate('/app/workouts/share')}
      onClose={() => navigate('/app/today')}
      showTabBar={false}
    />
  );
}
