import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S52_Macro_Targets from '../screens/S52_Macro_Targets.jsx';

export default function V3MacroTargets() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <S52_Macro_Targets
      dark={theme === 'dark'}
      onSave={() => navigate(-1)}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
