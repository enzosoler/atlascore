import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S73_Focus_Mode from '../screens/S73_Focus_Mode.jsx';

export default function V3FocusMode() {
  const navigate = useNavigate();
  return (
    <S73_Focus_Mode
      dark={true}
      onEnd={() => navigate('/app/today')}
    />
  );
}
