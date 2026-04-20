/**
 * ResetPassword — /auth/reset.
 * User arrives via the email link from ForgotPassword. Supabase already
 * established a temporary session via the URL hash; we just need to collect
 * the new password and call `updateUser`.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  AuthLayout, AuthTitle, AuthInput, AuthPrimary, BrandMark,
  FormError, FormSuccess, LockIcon,
} from './_AuthPrimitives';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const mismatch = password && confirm && password !== confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/auth/login', { replace: true }), 1500);
    } catch (err) {
      setError(err?.message || 'Could not update password. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <BrandMark size="lg" />
      </div>

      {done ? (
        <>
          <AuthTitle
            title="Password updated"
            subtitle="You're all set. Redirecting you to sign in…"
          />
          <div style={{ marginTop: 24 }}>
            <FormSuccess message="Password successfully changed." />
          </div>
        </>
      ) : (
        <>
          <AuthTitle
            title="Set a new password"
            subtitle="Pick something you haven't used before."
          />

          <form onSubmit={onSubmit} style={{ marginTop: 24, display: 'grid', gap: 14 }} noValidate>
            <AuthInput
              label="New password"
              type="password"
              autoComplete="new-password"
              icon={<LockIcon />}
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              autoFocus
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
            <AuthPrimary type="submit" loading={loading} disabled={loading || mismatch}>
              Update password
            </AuthPrimary>
          </form>

          <p style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'hsl(var(--rd-fg-muted))' }}>
            Change your mind?{' '}
            <Link to="/auth/login" style={{ color: 'hsl(var(--rd-accent))', textDecoration: 'none', fontWeight: 600 }}>
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
export { ResetPassword };
