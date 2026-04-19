import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { AuthShell } from '../../layouts';
import { Button, Input, Divider, Brand, Badge } from '../../ui';

/**
 * Real /v2/auth — wired to Supabase via AuthContext.
 * - Sign in + sign up (toggleable)
 * - Apple OAuth
 * - Password reset link
 * - Honors ?next=… deep link
 * - Post-success: onboarding if incomplete, else next/today
 */
export default function Auth({ mode: initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || null;
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      if (mode === 'signin') {
        const user = await signIn(normalizedEmail, password);
        const dest = user?.onboarding_completed
          ? (next || ROUTES.today)
          : ROUTES.onboarding;
        navigate(dest, { replace: true });
      } else {
        const result = await signUp(normalizedEmail, password, { full_name: fullName });
        if (result?.needsEmailConfirmation) {
          setInfo('Check your email to confirm your account.');
          return;
        }
        const dest = result?.onboarding_completed ? (next || ROUTES.today) : ROUTES.onboarding;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setError('');
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err) {
      setError(err?.message || 'Apple sign-in failed. Try again.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err) {
      setError(err?.message || 'Google sign-in failed. Try again.');
    }
  };

  const handleMagicLink = async () => {
    setError(''); setInfo('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setError('Enter your email first.'); return; }
    try {
      setLoading(true);
      const { error: err } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      setInfo("We sent you a magic link. Check your inbox.");
    } catch (err) {
      setError(err?.message || 'Could not send magic link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {/* Logo lockup — bigger, clearer brand moment */}
      <Brand size="2xl" variant="lockup" />

      {/* Title hierarchy toned down — no more shouting "Welcome back" */}
      <h1 className="mt-10 text-[26px] font-semibold tracking-tight text-rd-fg">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1.5 text-[14px] text-rd-fg-muted">
        {mode === 'signup' ? 'Train smarter with a plan built for you.' : 'Pick up where you left off.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3" noValidate>
        {mode === 'signup' && (
          <Input
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            size="lg"
          />
        )}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          size="lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          required
          size="lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
        />
        {error && <p role="alert" className="text-[13px] text-rd-danger">{error}</p>}
        {info && <p role="status" className="text-[13px] text-rd-success">{info}</p>}

        {/* Liquid Glass primary — cyan gradient with specular edge, much softer than flat #00FFFF */}
        <button
          type="submit"
          disabled={loading}
          className="auth-primary-cta"
        >
          {loading ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" fill="none" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          ) : null}
          <span>{mode === 'signup' ? 'Create account' : 'Sign in'}</span>
          <style>{`
            .auth-primary-cta {
              width: 100%;
              height: 52px;
              border-radius: 14px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              font-size: 15px;
              font-weight: 600;
              letter-spacing: -0.01em;
              cursor: pointer;
              -webkit-tap-highlight-color: transparent;
              color: hsl(var(--rd-fg-on-accent));
              background: linear-gradient(180deg, rgba(0,255,255,0.95) 0%, rgba(0,200,200,0.92) 100%);
              border: 1px solid rgba(0,255,255,0.55);
              box-shadow:
                0 8px 22px -6px rgba(0,200,200,0.35),
                inset 0 1px 0 rgba(255,255,255,0.35),
                inset 0 -1px 0 rgba(0,0,0,0.18);
              transition: transform 180ms cubic-bezier(.34,1.56,.64,1), opacity 180ms;
            }
            .auth-primary-cta:active:not(:disabled) { transform: scale(.985); }
            .auth-primary-cta:disabled { opacity: .55; cursor: not-allowed; }
            .auth-primary-cta:focus-visible { outline: 2px solid hsl(var(--rd-accent)); outline-offset: 3px; }
          `}</style>
        </button>

        {mode === 'signin' && (
          <div className="text-right">
            <Link to="/v2/auth?reset=1" className="text-[13px] text-rd-fg-muted hover:text-rd-fg">
              Forgot password?
            </Link>
          </div>
        )}
      </form>

      <Divider label="or" className="my-6" />

      <div className="space-y-2">
        <Button intent="secondary" size="lg" block onClick={handleMagicLink} loading={loading}>
          Email me a magic link
        </Button>

        {/* OAuth row — Google + Apple side by side on web, stacked on narrow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGoogle}
            className="oauth-btn oauth-btn--google"
            aria-label="Continue with Google"
          >
            <GoogleG />
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            onClick={handleApple}
            className="oauth-btn oauth-btn--apple"
            aria-label="Continue with Apple"
          >
            <AppleLogo />
            <span>Continue with Apple</span>
          </button>
        </div>

        <style>{`
          .oauth-btn {
            width: 100%;
            height: 48px;
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: -0.005em;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.10);
            color: hsl(var(--rd-fg-primary));
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
            backdrop-filter: blur(14px) saturate(1.4);
            -webkit-backdrop-filter: blur(14px) saturate(1.4);
            transition: transform 180ms cubic-bezier(.34,1.56,.64,1), background 180ms, border-color 180ms;
          }
          .oauth-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.16); }
          .oauth-btn:active { transform: scale(.985); }
          .oauth-btn:focus-visible { outline: 2px solid hsl(var(--rd-accent)); outline-offset: 2px; }
        `}</style>
      </div>

      <p className="mt-6 text-center text-[13px] text-rd-fg-muted">
        {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
        <button
          type="button"
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setInfo(''); }}
          className="text-rd-accent hover:underline"
        >
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </p>

      <p className="mt-8 text-center text-[11px] text-rd-fg-muted">
        By continuing, you agree to our <Link to="/terms" className="underline">Terms</Link> and{' '}
        <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}

/** Pre-bound variants so the router can mount them at separate URLs. */
export function Login()  { return <Auth mode="signin" />; }
export function Signup() { return <Auth mode="signup" />; }

/* ─── OAuth provider marks ──────────────────────────────────────────────── */
function GoogleG() {
  // Official Google "G" — brand-accurate 4-color mark.
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function AppleLogo() {
  // Apple brand mark — white glyph, per Apple's sign-in guidelines (on dark bg).
  return (
    <svg width="16" height="18" viewBox="0 0 384 512" aria-hidden fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM260.6 110c29.5-35 26.8-66.9 25.9-78.3-26 1.5-56.1 17.7-73.2 37.7-18.8 21.4-29.9 47.9-27.5 77.7 28.1 2.2 53.7-12.2 74.8-37.1z"/>
    </svg>
  );
}
