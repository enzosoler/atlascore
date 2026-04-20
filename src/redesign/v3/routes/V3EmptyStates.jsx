import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S23_Empty_States from '../screens/S23_Empty_States.jsx';

export default function V3EmptyStates() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S23_Empty_States
      dark={theme === 'dark'}
    />
  );
}
