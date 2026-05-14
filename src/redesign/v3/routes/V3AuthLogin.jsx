import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { signInWithOAuth } from '@/lib/googleSignIn';
import { getAuthRedirectUrl } from '@/lib/authRedirects';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S36_Auth from '../screens/S36_Auth.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';

function friendlyOAuthError(provider, err, t) {
  const raw = String(err?.message || '');
  if (/not implemented|not available|plugin/i.test(raw)) {
    return t('auth.login.oauthNotAvailable');
  }
  if (/cancel/i.test(raw)) return null;
  return t(provider === 'apple' ? 'auth.login.appleStartFailed' : 'auth.login.googleStartFailed');
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function V3AuthLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const { signIn, authState, user } = useAuth();
  const t = useT();
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(params.get('mode') === 'magic' ? 'magic' : 'password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
  const submitLockRef = useRef(false);
  const isAuthBypassEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_AUTH_BYPASS === 'true';

  // Show a clear message when the production build lacks Supabase env vars
  const isConfigured = import.meta.env.VITE_SUPABASE_URL &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  // Hooks must always run in the same order — declare them before any early return.
  const isAdmin = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');

  useEffect(() => {
    if (authState !== 'authenticated' || !user) return;
    const dest = isAdmin ? '/admin' : (user.onboarding_completed ? '/app/today' : '/onboarding');
    navigate(dest, { replace: true });
  }, [authState, user, navigate, isAdmin]);

  useEffect(() => {
    if (rateLimitRemaining <= 0) return undefined;
    const timerId = window.setInterval(() => {
      setRateLimitRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [rateLimitRemaining]);

  if (!isConfigured && !isAuthBypassEnabled) {
    return (
      <V3StandaloneLayout>
        <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{t('auth.login.unavailableTitle')}</div>
          <div>{t('auth.login.unavailableBody')}</div>
        </div>
      </V3StandaloneLayout>
    );
  }

  const onSubmit = async (e) => {
    // Accept being called without a DOM event (some child components call onSubmit())
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (submitLockRef.current || loading || rateLimitRemaining > 0) {
      return;
    }
    const em = email.trim().toLowerCase();
    setError('');
    if (!em) {
      setError(t('auth.login.enterEmail'));
      return;
    }
    if (mode === 'password' && !password) {
      setError(t('auth.login.enterPassword'));
      return;
    }

    submitLockRef.current = true;
    setLoading(true);
    try {
      if (mode === 'password') {
        const user = await signIn(em, password);
        const dest = isAdmin ? '/admin' : (user?.onboarding_completed ? '/app/today' : '/onboarding');
        navigate(dest, { replace: true });
      } else {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: em,
          options: { emailRedirectTo: getAuthRedirectUrl() },
        });
        if (otpError) {
          // Normalize OTP 429s into the same rate-limit shape the password path uses
          if (otpError.status === 429 || /rate limit|too many/i.test(otpError.message || '')) {
            const err = { type: 'rate_limited', status: 429, message: otpError.message, retryAfterSeconds: 60 };
            throw err;
          }
          throw otpError;
        }
        navigate(`/auth/magic?email=${encodeURIComponent(em)}`);
      }
    } catch (err) {
      if (err?.type === 'rate_limited' || err?.status === 429) {
        setRateLimitRemaining(err?.retryAfterSeconds ?? 60);
      }
      setError(
        err?.message || (mode === 'password' ? t('auth.login.signInFailed') : t('auth.login.magicLinkFailed'))
      );
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  };

  const onOAuth = async (provider) => {
    setError('');
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      const msg = friendlyOAuthError(provider, err, t);
      if (msg) setError(msg);
    }
  };

  return (
    <V3StandaloneLayout>
      <S36_Auth
        dark={theme === 'dark'}
        email={email}
        password={password}
        mode={mode}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        onApple={() => onOAuth('apple')}
        onGoogle={() => onOAuth('google')}
        onClose={() => navigate('/welcome')}
        onSwitchMode={(next) => {
          setMode(next);
          setError('');
        }}
        onForgotPassword={() => navigate('/auth/forgot')}
        loading={loading}
        error={rateLimitRemaining > 0 ? t('auth.login.rateLimitedCountdown', { time: formatCountdown(rateLimitRemaining) }) : error}
        submitDisabled={loading || rateLimitRemaining > 0}
      />
    </V3StandaloneLayout>
  );
}
