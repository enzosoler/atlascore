import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S81_Routine_Preset_Detail from '../screens/S81_Routine_Preset_Detail.jsx';

export default function V3RoutinePresetDetail(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { id } = useParams();
  return (
    <S81_Routine_Preset_Detail dark={theme === 'dark'} id={id} onBack={() => navigate('/routines/presets')} />
  );
}
