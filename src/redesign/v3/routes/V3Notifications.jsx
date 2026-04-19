import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import S22_Notifications from '../screens/S22_Notifications.jsx';

export default function V3Notifications() {
  const { theme } = useTheme();
  return <S22_Notifications dark={theme === 'dark'} showTabBar={false} />;
}
