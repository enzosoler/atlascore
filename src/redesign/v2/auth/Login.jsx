/**
 * Login — /auth/login. v2 pure, replaces LegacyAuth sign-in.
 * Wired to Supabase via AuthContext. Handles: email/password,
 * magic link, Apple, Google.
 */
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import {
  AuthLayout, AuthTitle, AuthInput, AuthPrimary, OAuthButton,
  BrandMark, Divider, FormError, FormSuccess,
  MailIcon, LockIcon,
} from './_AuthPrimitives';
import { friendlyOAuthError } from './Signup';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || null;
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    const em = email.trim().toLowerCase();
    if (!em || !password) { setError('Enter your email and password.'); return; }
    setLoading(true);
    try {
      const user = await signIn(em, password);
      const dest = user?.onboarding_completed ? (next || ROUTES.today) : ROUTES.onboarding;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err?.message || "We couldn't sign you in. Check your credentials.");
    } finally { setLoading(false); }
  };

  const onMagic = async () => {
    setError(''); setInfo('');
    const em = email.trim().toLowerCase();
    if (!em) { setError('Enter your email first.'); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: em,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      navigate(`/auth/magic?email=${encodeURIComponent(em)}`);
    } catch (err) {
      setError(err?.message || 'Could not send magic link.');
    } finally { setLoading(false); }
  };

  const onOAuth = async (provider) => {
    setError('');
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (oauthErr) throw oauthErr;
    } catch (err) {
      setError(friendlyOAuthError(provider, err));
    }
  };

  return (
    <AuthLayout>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <BrandMark size="xl" />
      </div>

      <AuthTitle title="Welcome back" subtitle="Pick up where you left off." />

      <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'grid', gap: 14 }} noValidate>
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          icon={<MailIcon />}
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
          autoFocus
        />
        <AuthInput
          label="Password"
          type="password"
          autoComplete="current-password"
          icon={<LockIcon />}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />

        {error && <FormError message={error} />}
        {info && <FormSuccess message={info} />}

        <AuthPrimary type="submit" loading={loading} disabled={loading}>
          Sign in
        </AuthPrimary>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <button type="button" onClick={onMagic} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            Email me a magic link
          </button>
          <Link to="/auth/forgot" style={{ color: 'hsl(var(--rd-fg-muted))', textDecoration: 'none', fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>
      </form>

      <Divider />

      <div style={{ display: 'grid', gap: 8 }}>
        <OAuthButton provider="google" onClick={() => onOAuth('google')} disabled={loading} />
        <OAuthButton provider="apple"  onClick={() => onOAuth('apple')}  disabled={loading} />
      </div>

      <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
        New here?{' '}
        <Link to="/auth/signup" style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}>
          Create an account
        </Link>
      </p>

      <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
        By continuing you agree to our{' '}
        <Link to="/terms" style={{ color: 'hsl(var(--rd-fg-secondary))', textDecoration: 'underline' }}>Terms</Link>{' '}
        and{' '}
        <Link to="/privacy" style={{ color: 'hsl(var(--rd-fg-secondary))', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
}
export { Login };
