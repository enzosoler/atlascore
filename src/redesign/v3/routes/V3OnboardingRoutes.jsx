import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S7_Onboard_Identity from '../screens/S7_Onboard_Identity.jsx';
import S8_Onboard_Goal from '../screens/S8_Onboard_Goal.jsx';
import S9_Onboard_Activity from '../screens/S9_Onboard_Activity.jsx';
import S10_Onboard_Plan from '../screens/S10_Onboard_Plan.jsx';
import S11_Onboard_Permissions from '../screens/S11_Onboard_Permissions.jsx';

function Wrap({ children }) {
  return <V3StandaloneLayout>{children}</V3StandaloneLayout>;
}

export function V3OnboardingIdentity() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <Wrap>
      <S7_Onboard_Identity
        dark={theme === 'dark'}
        onContinue={() => navigate('/onboarding/goal')}
      />
    </Wrap>
  );
}

export function V3OnboardingGoal() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <Wrap>
      <S8_Onboard_Goal
        dark={theme === 'dark'}
        onBack={() => navigate('/onboarding')}
        onContinue={() => navigate('/onboarding/activity')}
      />
    </Wrap>
  );
}

export function V3OnboardingActivity() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <Wrap>
      <S9_Onboard_Activity
        dark={theme === 'dark'}
        onBack={() => navigate('/onboarding/goal')}
        onContinue={() => navigate('/onboarding/stats')}
      />
    </Wrap>
  );
}

export function V3OnboardingPlan() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <Wrap>
      <S10_Onboard_Plan
        dark={theme === 'dark'}
        onBack={() => navigate('/onboarding/activity')}
        onContinue={() => navigate('/onboarding/diet')}
      />
    </Wrap>
  );
}

export function V3OnboardingPermissions() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <Wrap>
      <S11_Onboard_Permissions
        dark={theme === 'dark'}
        onBack={() => navigate('/onboarding/stats')}
        onContinue={() => navigate('/onboarding/workout')}
        onSkip={() => navigate('/onboarding/workout')}
      />
    </Wrap>
  );
}
