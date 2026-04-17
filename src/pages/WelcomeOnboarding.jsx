import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { track } from '@/lib/analytics';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { ROUTES } from '@/lib/routes';

const STORAGE_KEY = 'atlas_has_seen_welcome';

export function markWelcomeSeen() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

export function hasSeenWelcome() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function AthleteHero() {
  return (
    <div className="relative mx-auto flex h-[280px] w-[280px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--brand)/0.22),transparent_58%),radial-gradient(circle_at_70%_70%,hsl(var(--accent-primary)/0.18),transparent_52%),hsl(var(--fill)/0.6)] blur-[2px]" />
      <div className="absolute inset-[22px] rounded-full border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--card)/0.82)] shadow-[0_24px_90px_rgba(0,0,0,0.12)]" />
      <div className="absolute inset-[52px] rounded-full bg-[linear-gradient(180deg,hsl(var(--brand)/0.18),hsl(var(--accent-primary)/0.12))]" />
      <div className="relative flex h-[148px] w-[148px] items-center justify-center rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] text-[42px] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))] shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
        A
      </div>
      <div className="absolute right-[28px] top-[40px] rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.92)] px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
        Training
      </div>
      <div className="absolute left-[18px] top-[92px] rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.92)] px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
        Nutrition
      </div>
      <div className="absolute bottom-[30px] right-[48px] rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.92)] px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
        Recovery
      </div>
    </div>
  );
}

export default function WelcomeOnboarding() {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    markWelcomeSeen();
    track('welcome_started', { destination: ROUTES.onboarding });
    navigate(ROUTES.onboarding, { replace: true });
  }, [navigate]);

  const handleLogin = useCallback(() => {
    markWelcomeSeen();
    track('welcome_login_selected');
    navigate(`${ROUTES.auth}?mode=login`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    track('welcome_viewed');
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-[linear-gradient(180deg,hsl(var(--bg))_0%,hsl(var(--bg))_42%,hsl(var(--sys-bg2))_100%)]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-64 w-64 rounded-full bg-[hsl(var(--brand)/0.16)] blur-3xl" />
        <div className="absolute right-[-5rem] top-[18%] h-72 w-72 rounded-full bg-[hsl(var(--accent-primary)/0.14)] blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[15%] h-72 w-72 rounded-full bg-[hsl(var(--sys-green)/0.10)] blur-3xl" />
      </div>

      <div className="relative flex items-center justify-center px-6 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <AtlasCoreLogoSVG width={20} />
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            atlas.core
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-6">
        <AthleteHero />

        <div className="mx-auto mt-8 max-w-[340px] text-center">
          <h1 className="text-[34px] font-semibold leading-[1.02] tracking-[-0.06em] text-[hsl(var(--fg))]">
            Build the plan your last app never could.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[hsl(var(--fg-2))]">
            Atlas turns training, nutrition, recovery, and progress into one launch-ready system built around your goal.
          </p>
        </div>
      </div>

      <div className="relative px-6 pb-6 pt-4">
        <button
          type="button"
          onClick={handleStart}
          className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[18px] bg-[hsl(var(--brand))] text-[15px] font-semibold text-white shadow-[0_18px_50px_hsl(var(--brand)/0.28)] transition-all active:scale-[0.98]"
        >
          Start my plan
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleLogin}
          className="mt-4 block w-full text-center text-[14px] font-medium text-[hsl(var(--fg-2))] transition-colors active:text-[hsl(var(--fg))]"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
