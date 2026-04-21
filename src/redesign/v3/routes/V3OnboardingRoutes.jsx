import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S7_Onboard_Identity from '../screens/S7_Onboard_Identity.jsx';
import S8_Onboard_Goal from '../screens/S8_Onboard_Goal.jsx';
import S9_Onboard_Activity from '../screens/S9_Onboard_Activity.jsx';
import S10_Onboard_Plan from '../screens/S10_Onboard_Plan.jsx';
import S11_Onboard_Permissions from '../screens/S11_Onboard_Permissions.jsx';
import S58_Onboard_Workout from '../screens/S58_Onboard_Workout.jsx';
import S59_Onboard_Habits from '../screens/S59_Onboard_Habits.jsx';
import S60_Onboard_Constraints from '../screens/S60_Onboard_Constraints.jsx';
import S61_Onboard_Summary from '../screens/S61_Onboard_Summary.jsx';
import S62_Onboard_Tour from '../screens/S62_Onboard_Tour.jsx';
import {
  buildProfileDataFromOnboarding,
  readOnboardingDraft,
  writeOnboardingDraft,
} from '@/services/onboardingService';

/** Shared onboarding state — persists to localStorage across steps. */
function useOnboardingState() {
  const [data, setData] = useState(() => {
    return readOnboardingDraft();
  });
  const update = useCallback((patch) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      writeOnboardingDraft(next);
      return next;
    });
  }, []);
  return { data, update };
}

function Wrap({ children }) {
  return <V3StandaloneLayout>{children}</V3StandaloneLayout>;
}

export function V3OnboardingIdentity() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S7_Onboard_Identity
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onContinue={() => navigate('/onboarding/goal')}
      />
    </Wrap>
  );
}

export function V3OnboardingGoal() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S8_Onboard_Goal
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding')}
        onContinue={() => navigate('/onboarding/activity')}
      />
    </Wrap>
  );
}

export function V3OnboardingActivity() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S9_Onboard_Activity
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/goal')}
        onContinue={() => navigate('/onboarding/stats')}
      />
    </Wrap>
  );
}

export function V3OnboardingPlan() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S10_Onboard_Plan
        dark={theme === 'dark'}
        onboardingData={data}
        onChange={update}
        onBack={() => navigate('/onboarding/activity')}
        onContinue={(nextData) => {
          update(nextData || {});
          navigate('/onboarding/diet');
        }}
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

export function V3OnboardingWorkout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S58_Onboard_Workout
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/diet')}
        onContinue={() => navigate('/onboarding/habits')}
      />
    </Wrap>
  );
}

export function V3OnboardingHabits() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S59_Onboard_Habits
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/workout')}
        onContinue={() => navigate('/onboarding/constraints')}
      />
    </Wrap>
  );
}

export function V3OnboardingConstraints() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, update } = useOnboardingState();
  return (
    <Wrap>
      <S60_Onboard_Constraints
        dark={theme === 'dark'}
        value={data}
        onChange={update}
        onBack={() => navigate('/onboarding/habits')}
        onContinue={() => navigate('/onboarding/summary')}
        onSkip={() => navigate('/onboarding/summary')}
      />
    </Wrap>
  );
}

export function V3OnboardingSummary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data } = useOnboardingState();
  const profileData = buildProfileDataFromOnboarding(data);
  const summaryTargets = {
    calories: profileData?.targets?.calories,
    protein: profileData?.targets?.protein,
    carbs: profileData?.targets?.carbs,
    fat: profileData?.targets?.fat,
    weeklySessions: profileData?.training_days_per_week,
    experience: profileData?.training_experience,
    sleep: profileData?.sleep_target_hours,
    waterL: profileData?.water_target_liters,
    steps: profileData?.steps_target,
  };
  const summaryConstraints = profileData?.constraints || data;
  return (
    <Wrap>
      <S61_Onboard_Summary
        dark={theme === 'dark'}
        targets={summaryTargets}
        constraints={summaryConstraints}
        onBack={() => navigate('/onboarding/constraints')}
        onContinue={() => navigate('/onboarding/paywall')}
      />
    </Wrap>
  );
}

export function V3OnboardingTour() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  return (
    <Wrap>
      <S62_Onboard_Tour
        dark={theme === 'dark'}
        onFinish={() => navigate('/app/today')}
        onSkip={() => navigate('/app/today')}
      />
    </Wrap>
  );
}
