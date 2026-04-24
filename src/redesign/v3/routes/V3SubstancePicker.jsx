import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import S47_Substance_Picker from '../screens/S47_Substance_Picker.jsx';

export default function V3SubstancePicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const returnTo = location.state?.returnTo || '/app/protocols/new';

  return (
    <S47_Substance_Picker
      dark={theme === 'dark'}
      onSelect={(substance) => navigate(returnTo, { state: { pickedSubstance: substance } })}
      onClose={() => navigate(-1)}
      onAddCustom={() => navigate(returnTo, {
        state: {
          pickedSubstance: {
            name: 'Custom substance',
            meta: 'CUSTOM · PRIVATE',
          },
        },
      })}
      showTabBar={false}
    />
  );
}
