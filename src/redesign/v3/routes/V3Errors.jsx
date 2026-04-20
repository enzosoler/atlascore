import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import S41_Errors from '../screens/S41_Errors.jsx';

export default function V3Errors() {
  const { theme } = useTheme();
  return (
    <S41_Errors
      dark={theme === 'dark'}
    />
  );
}
