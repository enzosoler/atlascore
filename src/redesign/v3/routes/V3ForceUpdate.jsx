import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S86_Force_Update from '../screens/S86_Force_Update.jsx';

export default function V3ForceUpdate(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S86_Force_Update dark={theme === 'dark'} />
  );
}
