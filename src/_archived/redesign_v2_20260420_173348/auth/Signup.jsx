/**
 * Signup — /auth/signup. v2 pure.
 * Creates a new Supabase account then drops the user into onboarding.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import {
  AuthLayout, AuthTitle, AuthInput, AuthPrimary, OAuthButton,
  BrandMark, Divider, FormError, FormSuccess,
  MailIcon, LockIcon, UserIcon,
} from './_AuthPrimitives';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const strength = passwordStrength(password);
  const mismatch = password && confirm && password !== confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    const em = email.trim().toLowerCase();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const fullName = [fn, ln].filter(Boolean).join(' ');
    if (!em || !password) { setError('Enter your email and a password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const result = await signUp(em, password, {
        full_name: fullName,
        first_name: fn,
        last_name: ln,
      });
      if (result?.needsEmailConfirmation) {
        setInfo("Check your inbox — we sent you a confirmation email.");
        return;
      }
      const dest = result?.onboarding_completed ? ROUTES.today : ROUTES.onboarding;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not create your account.');
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

      <AuthTitle title="Create your account" subtitle="Train smarter with a plan built for you." />

      <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'grid', gap: 14 }} noValidate>
        {/* First + Last name as separate fields — helps personalization
            ("Morning, Enzo" not "Morning, Enzo Soler") and keeps downstream
            services happy (e.g. Stripe customers expect given_name/family_name). */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <AuthInput
            label="First name"
            type="text"
            autoComplete="given-name"
            icon={<UserIcon />}
            value={firstName}
            onChange={setFirstName}
            placeholder="Enzo"
            autoFocus
          />
          <AuthInput
            label="Last name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={setLastName}
            placeholder="Soler"
          />
        </div>
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          icon={<MailIcon />}
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
        />
        <AuthInput
          label="Password"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon />}
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          hint={password ? null : '8+ characters. Mix letters, numbers, symbols.'}
          rightSlot={password ? <PasswordStrength level={strength} /> : null}
        />
        <AuthInput
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          icon={<LockIcon />}
          value={confirm}
          onChange={setConfirm}
          placeholder="Type it again"
          error={mismatch ? "Passwords don't match." : null}
        />

        {error && <FormError message={error} />}
        {info && <FormSuccess message={info} />}

        <AuthPrimary type="submit" loading={loading} disabled={loading || mismatch || !password || !confirm}>
          Create account
        </AuthPrimary>

        {/* Implicit-consent microcopy — by creating an account the user
            agrees to Terms + Privacy. Links open in a new tab so the
            signup flow isn't interrupted. */}
        <p style={{
          margin: '14px 0 0',
          textAlign: 'center',
          fontSize: 11.5,
          color: 'hsl(var(--rd-fg-muted))',
          lineHeight: 1.5,
        }}>
          By creating an account, you agree to our{' '}
          <Link
            to="/terms"
            target="_blank"
            style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            target="_blank"
            style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}
          >
            Privacy Policy
          </Link>.
        </p>
      </form>

      <Divider />

      <div style={{ display: 'grid', gap: 8 }}>
        <OAuthButton provider="google" onClick={() => onOAuth('google')} disabled={loading} />
        <OAuthButton provider="apple"  onClick={() => onOAuth('apple')}  disabled={loading} />
      </div>

      <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
        Already have one?{' '}
        <Link to="/auth/login" style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}>
          Sign in
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
export { Signup };

function PasswordStrength({ level }) {
  // level: 0..4
  const color = ['#FB7185', '#FBBF24', '#FBBF24', '#34D399', '#34D399'][level] || '#FB7185';
  return (
    <div style={{ display: 'inline-flex', gap: 3, paddingRight: 12 }}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          aria-hidden
          style={{
            width: 4, height: 14, borderRadius: 2,
            background: i < level ? color : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </div>
  );
}

function passwordStrength(p) {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(4, score);
}

/**
 * Friendly copy for Supabase OAuth errors.
 * Common case: `provider is not enabled` — admin hasn't toggled the provider
 * in Supabase Dashboard → Authentication → Providers. We tell the user it's
 * temporarily unavailable (it's an admin config, not their fault).
 */
export function friendlyOAuthError(provider, err) {
  const raw = (err?.message || '').toLowerCase();
  const providerLabel = provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : provider;
  if (raw.includes('not enabled') || raw.includes('unsupported provider')) {
    return `${providerLabel} sign-in is temporarily unavailable. Use email for now.`;
  }
  if (raw.includes('popup') || raw.includes('blocked')) {
    return `${providerLabel} popup was blocked. Allow popups for this site and try again.`;
  }
  if (raw.includes('network')) {
    return `Network error. Check your connection and retry.`;
  }
  return err?.message || `${providerLabel} sign-in failed. Try email instead.`;
}
