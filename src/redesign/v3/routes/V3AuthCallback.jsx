import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import { ACFonts, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

function CallbackState() {
  const { theme } = useTheme();
  const { authState, user, authError } = useAuth();
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
          ? 'Could not finish sign in.'
          : isResetMode
            ? 'Opening reset password…'
            : 'Finishing sign in…'}
      </div>
      <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5, maxWidth: 280 }}>
        {authState === 'error'
          ? (authError?.message || 'Please try again.')
          : isResetMode
            ? 'Verifying your recovery session and opening the reset flow.'
            : 'Verifying your session and opening the right flow.'}
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
