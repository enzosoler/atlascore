import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';
import OnboardingEngine from '@/features/onboarding/OnboardingEngine';

/**
 * OnboardingV2 — page entry point for the rebuilt onboarding flow.
 *
 * Self-guards: if the user is authenticated AND onboarding_completed is true,
 * redirects to /Today immediately.
 *
 * Wraps the OnboardingEngine in the OnboardingProvider so all screen components
 * can access answers, navigation, and progress via useOnboarding().
 */
export default function OnboardingV2() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.onboarding_completed === true) {
      navigate('/Today', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-[100dvh]">
      <OnboardingProvider>
        <OnboardingEngine />
      </OnboardingProvider>
    </div>
  );
}
