import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S36_Auth from '../screens/S36_Auth.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { ACBrand } from '../lib/paper.jsx';
import { signInWithOAuth } from '@/lib/googleSignIn';
import {
  readOnboardingIntentDraft,
  seedOnboardingDraftFromIntent,
} from '@/services/onboardingService';

function friendlyOAuthError(provider, err, t) {
  const raw = String(err?.message || '');
  if (/not implemented|not available|plugin/i.test(raw)) {
    return t('auth.signup.oauthNotAvailable');
  }
  if (/cancel/i.test(raw)) return null;
  return t(provider === 'apple' ? 'auth.signup.appleStartFailed' : 'auth.signup.googleStartFailed');
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function V3AuthSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { signUp, authState, user } = useAuth();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState(t('auth.signup.hint'));
  const [loading, setLoading] = useState(false);
  const [slowSignup, setSlowSignup] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
  const submitLockRef = useRef(false);
  const signupSource = searchParams.get('source');
  const intentDraft = useMemo(
    () => (signupSource === 'intent' ? readOnboardingIntentDraft() : {}),
    [signupSource],
  );

  useEffect(() => {
    if (authState !== 'authenticated' || !user) return;
    if (!user.onboarding_completed) {
      seedOnboardingDraftFromIntent(intentDraft);
    }
    navigate(user.onboarding_completed ? '/app/today' : '/onboarding', { replace: true });
  }, [authState, user, navigate, intentDraft]);

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

  useEffect(() => {
    if (!loading) {
      setSlowSignup(false);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setSlowSignup(true);
      setHint(t('auth.signup.slowHint'));
    }, 6500);

    return () => window.clearTimeout(timerId);
  }, [loading, t]);

  const onSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (submitLockRef.current || loading || rateLimitRemaining > 0) {
      return;
    }
    const em = email.trim().toLowerCase();
    setError('');
    if (!em) {
      setError(t('auth.signup.enterEmail'));
      return;
    }
    if (!password) {
      setError(t('auth.signup.enterPassword'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.signup.passwordMin'));
      return;
    }

    submitLockRef.current = true;
    setLoading(true);
    setHint(t('auth.signup.creatingHint'));
    try {
      const result = await signUp(em, password, {});
      if (result?.needsEmailConfirmation) {
        setHint(result?.delayedConfirmation
          ? t('auth.signup.delayedConfirmationHint')
          : t('auth.signup.confirmEmailHint'));
        return;
      }
      seedOnboardingDraftFromIntent(intentDraft);
      navigate(result?.onboarding_completed ? '/app/today' : '/onboarding', { replace: true });
    } catch (err) {
      if (err?.type === 'rate_limited' || err?.status === 429) {
        setRateLimitRemaining(err?.retryAfterSeconds ?? 60);
      }
      setError(err?.message || t('auth.signup.createFailed'));
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
        mode="password"
        headline={(
          <>
            {t('auth.signup.headlineLine1')}
            <br />
            <span style={{ color: ACBrand.accent }}>{t('auth.signup.headlineAccent')}</span>
          </>
        )}
        description={signupSource === 'intent'
          ? t('auth.signup.intentDescription')
          : t('auth.signup.description')}
        submitLabel={t('auth.signup.submit')}
        showModeSwitch={false}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        onApple={() => onOAuth('apple')}
        onGoogle={() => onOAuth('google')}
        onClose={() => navigate(signupSource === 'intent' ? '/?quiz=start' : '/welcome/manifesto')}
        loading={loading}
        loadingLabel={slowSignup ? t('auth.signup.stillCreating') : t('auth.signup.creating')}
        error={rateLimitRemaining > 0
          ? t('auth.signup.rateLimitedCountdown', { time: formatCountdown(rateLimitRemaining) })
          : error}
        submitDisabled={loading || rateLimitRemaining > 0}
        hint={signupSource === 'intent' && !error ? t('auth.signup.intentHint') : hint}
      />
    </V3StandaloneLayout>
  );
}
