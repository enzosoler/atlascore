import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S26_Calendar from '../screens/S26_Calendar.jsx';

export default function V3Calendar() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S26_Calendar
      dark={theme === 'dark'}
      onSelectDate={(date) => navigate(`/app/workouts/active`)}
      onAddSession={() => navigate('/app/workouts/active')}
      onChangeView={() => {}}
      onAcceptReschedule={() => {}}
      onRejectReschedule={() => {}}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
