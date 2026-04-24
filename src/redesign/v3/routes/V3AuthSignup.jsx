import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S36_Auth from '../screens/S36_Auth.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { ACBrand } from '../lib/paper.jsx';
import { signInWithOAuth } from '@/lib/googleSignIn';

function friendlyOAuthError(provider, err, t) {
  return err?.message || t(provider === 'apple' ? 'auth.signup.appleStartFailed' : 'auth.signup.googleStartFailed');
}

export default function V3AuthSignup() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState(t('auth.signup.hint'));
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
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

    setLoading(true);
    try {
      const result = await signUp(em, password, {});
      if (result?.needsEmailConfirmation) {
        setHint(t('auth.signup.confirmEmailHint'));
        return;
      }
      navigate(result?.onboarding_completed ? '/app/today' : '/onboarding', { replace: true });
    } catch (err) {
      setError(err?.message || t('auth.signup.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onOAuth = async (provider) => {
    setError('');
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(friendlyOAuthError(provider, err, t));
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
        description={t('auth.signup.description')}
        submitLabel={t('auth.signup.submit')}
        showModeSwitch={false}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        onApple={() => onOAuth('apple')}
        onGoogle={() => onOAuth('google')}
        onClose={() => navigate('/welcome/manifesto')}
        loading={loading}
        error={error}
        hint={hint}
      />
    </V3StandaloneLayout>
  );
}
