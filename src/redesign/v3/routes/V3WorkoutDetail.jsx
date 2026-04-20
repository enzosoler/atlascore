import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S55_Workout_Detail from '../screens/S55_Workout_Detail.jsx';

export default function V3WorkoutDetail() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  return (
    <S55_Workout_Detail
      dark={theme === 'dark'}
      onRepeat={() => navigate('/app/workouts/active')}
      onShare={() => navigate('/app/workouts/share')}
      onOpenExercise={(exId) => navigate(`/app/exercises/${exId}`)}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
