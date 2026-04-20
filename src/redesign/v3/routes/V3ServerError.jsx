import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S84_Server_Error from '../screens/S84_Server_Error.jsx';

export default function V3ServerError(){
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S84_Server_Error dark={theme === 'dark'} />
  );
}
