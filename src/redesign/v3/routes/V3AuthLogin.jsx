import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S36_Auth from '../screens/S36_Auth.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';

function friendlyOAuthError(provider, err) {
  const label = provider === 'apple' ? 'Apple' : 'Google';
  return err?.message || `Could not start ${label} sign in.`;
}

export default function V3AuthLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(params.get('mode') === 'password' ? 'password' : 'magic');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    setError('');
    if (!em) {
      setError('Enter your email first.');
      return;
    }
    if (mode === 'password' && !password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'password') {
        const user = await signIn(em, password);
        navigate(user?.onboarding_completed ? '/app/today' : '/onboarding', { replace: true });
      } else {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: em,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (otpError) throw otpError;
        navigate(`/auth/magic?email=${encodeURIComponent(em)}`);
      }
    } catch (err) {
      setError(
        err?.message || (mode === 'password' ? 'Could not sign you in.' : 'Could not send magic link.')
      );
    } finally {
      setLoading(false);
    }
  };

  const onOAuth = async (provider) => {
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(friendlyOAuthError(provider, err));
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
        loading={loading}
        error={error}
      />
    </V3StandaloneLayout>
  );
}
