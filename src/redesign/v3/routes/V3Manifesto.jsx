import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S1_Splash_B from '../screens/S1_Splash_B.jsx';

export default function V3Manifesto() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <V3StandaloneLayout>
      <S1_Splash_B
        dark={theme === 'dark'}
        onCreateAccount={() => navigate('/auth/signup')}
        onSignIn={() => navigate('/auth/login?mode=password')}
      />
    </V3StandaloneLayout>
  );
}
