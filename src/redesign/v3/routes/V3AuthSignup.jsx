import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S36_Auth from '../screens/S36_Auth.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { ACBrand } from '../lib/paper.jsx';

function friendlyOAuthError(provider, err) {
  const label = provider === 'apple' ? 'Apple' : 'Google';
  return err?.message || `Could not start ${label} sign up.`;
}

export default function V3AuthSignup() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState('Use email and password. You can add the rest inside the app.');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    setError('');
    if (!em) {
      setError('Enter your email first.');
      return;
    }
    if (!password) {
      setError('Enter a password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(em, password, {});
      if (result?.needsEmailConfirmation) {
        setHint('Check your inbox and confirm your email, then come back and sign in.');
        return;
      }
      navigate(result?.onboarding_completed ? '/app/today' : '/onboarding', { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not create your account.');
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
        mode="password"
        headline={(
          <>
            create your
            <br />
            <span style={{ color: ACBrand.accent }}>account.</span>
          </>
        )}
        description="Start with email and password. The rest of setup happens inside atlas.core."
        submitLabel="Create account →"
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
