import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S80_Routine_Presets from '../screens/S80_Routine_Presets.jsx';

export default function V3RoutinePresets(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S80_Routine_Presets dark={theme === 'dark'} onOpen={(id)=>navigate(`/app/routines/presets/${id}`)} />
  );
}
