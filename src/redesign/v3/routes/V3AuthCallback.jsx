import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useT } from '@/lib/i18nContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import { ACFonts, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { seedOnboardingDraftFromIntent } from '@/services/onboardingService';

function CallbackState() {
  const { theme } = useTheme();
  const { authState, user, authError } = useAuth();
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const mode = useMemo(() => searchParams.get('mode'), [searchParams]);
  const isResetMode = mode === 'reset';

  useEffect(() => {
    if (authState === 'authenticated' && user) {
      if (isResetMode) {
        navigate('/auth/reset', { replace: true });
        return;
      }
      if (!user.onboarding_completed) {
        seedOnboardingDraftFromIntent();
      }
      navigate(user.onboarding_completed ? '/app/today' : '/onboarding', { replace: true });
    }
  }, [authState, isResetMode, user, navigate]);

  useEffect(() => {
    if (authState === 'unauthenticated') {
      navigate('/auth/login', { replace: true });
    }
  }, [authState, navigate]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
        background: c.bg,
        color: c.fg,
      }}
    >
      <HeartMark size={64} color={c.fg} accent={c.accent} />
      <div
        style={{
          marginTop: 24,
          fontFamily: ACFonts.display,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: -0.8,
          lineHeight: 1.05,
        }}
        >
        {authState === 'error'
          ? t('auth.callback.failed')
          : isResetMode
            ? t('auth.callback.openingReset')
            : t('auth.callback.completing')}
      </div>
      <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5, maxWidth: 280 }}>
        {authState === 'error'
          ? (authError?.message || t('auth.callback.genericError'))
          : isResetMode
            ? t('auth.callback.verifyingReset')
            : t('auth.callback.verifying')}
      </div>
    </div>
  );
}

export default function V3AuthCallback() {
  return (
    <V3StandaloneLayout>
      <CallbackState />
    </V3StandaloneLayout>
  );
}
