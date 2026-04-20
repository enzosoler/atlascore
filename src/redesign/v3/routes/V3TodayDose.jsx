import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S50_Today_Dose_Module from '../screens/S50_Today_Dose_Module.jsx';

export default function V3TodayDose() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S50_Today_Dose_Module
      dark={theme === 'dark'}
      onRemind={() => {}}
      showTabBar={false}
    />
  );
}
