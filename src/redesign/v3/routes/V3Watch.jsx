import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import S34_Watch from '../screens/S34_Watch.jsx';

export default function V3Watch() {
  const { theme } = useTheme();
  return <S34_Watch dark={theme === 'dark'} />;
}
