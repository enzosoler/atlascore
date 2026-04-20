import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S48_Log_Dose from '../screens/S48_Log_Dose.jsx';

export default function V3LogDose() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S48_Log_Dose
      dark={theme === 'dark'}
      onLog={() => navigate('/app/protocols')}
      onCancel={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
