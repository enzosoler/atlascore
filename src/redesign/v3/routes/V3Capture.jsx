import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S32_Capture from '../screens/S32_Capture.jsx';

export default function V3Capture() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S32_Capture
      dark={theme === 'dark'}
      onClose={() => navigate(-1)}
      onScanResult={(item) => navigate('/app/nutrition/food', { state: { item } })}
    />
  );
}
