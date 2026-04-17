import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
  const { isAuthenticated, user, isLoadingAuth, authState, authError } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.onboarding_completed === true) {
      navigate('/Today', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))] px-6">
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.8)] px-6 py-5 text-center shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand))]" />
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Loading your setup...</p>
          <p className="max-w-[240px] text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
            We’re checking your account before the onboarding flow starts.
          </p>
        </div>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))] px-6">
        <div className="flex max-w-[360px] flex-col items-center gap-4 rounded-[24px] border border-[hsl(var(--err)/0.25)] bg-[hsl(var(--card)/0.82)] px-6 py-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.10)]">
          <AlertTriangle className="h-9 w-9 text-[hsl(var(--err))]" />
          <div className="space-y-1">
            <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">We couldn’t load your account</p>
            <p className="text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
              {authError?.message || 'Please check your connection and try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      <OnboardingProvider>
        <OnboardingEngine />
      </OnboardingProvider>
    </div>
  );
}
