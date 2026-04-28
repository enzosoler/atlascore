import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S1_Splash_A from '../screens/S1_Splash_A.jsx';

export default function V3Welcome() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <V3StandaloneLayout>
      <S1_Splash_A
        dark={theme === 'dark'}
        onGetStarted={() => navigate('/onboarding')}
        onSignIn={() => navigate('/auth/login?mode=password')}
      />
    </V3StandaloneLayout>
  );
}
