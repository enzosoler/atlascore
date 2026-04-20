import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S83_Offline from '../screens/S83_Offline.jsx';

export default function V3Offline(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S83_Offline dark={theme === 'dark'} />
  );
}
