import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S85_Maintenance from '../screens/S85_Maintenance.jsx';

export default function V3Maintenance(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S85_Maintenance dark={theme === 'dark'} />
  );
}
