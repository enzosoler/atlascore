/**
 * ForgotPassword — /auth/forgot.
 * Sends a reset link to the user's email via Supabase.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  AuthLayout, AuthTitle, AuthInput, AuthPrimary, BrandMark,
  FormError, FormSuccess, MailIcon,
} from './_AuthPrimitives';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const em = email.trim().toLowerCase();
    if (!em) { setError('Enter your email.'); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(em, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Could not send reset email.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <BackLink to="/auth/login" />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, marginTop: 20 }}>
        <BrandMark size="lg" />
      </div>

      {sent ? (
        <>
          <AuthTitle
            title="Check your email"
            subtitle={`We sent reset instructions to ${email}. The link is valid for 1 hour.`}
          />
          <div style={{ marginTop: 24 }}>
            <AuthPrimary onClick={() => navigate('/auth/login')}>Back to sign in</AuthPrimary>
          </div>
          <p style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: 'hsl(var(--rd-fg-muted))' }}>
            Didn't get it?{' '}
            <button
              type="button"
              onClick={() => setSent(false)}
              style={{ background: 'transparent', border: 'none', color: 'hsl(var(--rd-accent))', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Try a different email
            </button>
          </p>
        </>
      ) : (
        <>
          <AuthTitle
            title="Forgot your password?"
            subtitle="Enter your email and we'll send you a link to reset it."
          />

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
            {error && <FormError message={error} />}
            <AuthPrimary type="submit" loading={loading} disabled={loading}>
              Send reset link
            </AuthPrimary>
          </form>

          <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
            Remembered?{' '}
            <Link to="/auth/login" style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}>
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
export { ForgotPassword };

function BackLink({ to }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'hsl(var(--rd-fg-muted))',
        fontSize: 13, fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </Link>
  );
}
