import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S47_Substance_Picker from '../screens/S47_Substance_Picker.jsx';

export default function V3SubstancePicker() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S47_Substance_Picker
      dark={theme === 'dark'}
      onSelect={(substance) => navigate(-1, { state: { substance } })}
      onClose={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
