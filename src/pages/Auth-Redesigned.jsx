import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabaseClient';
import { email as emailService } from '@/lib/emailService';
import { signInWithGoogle } from '@/lib/googleSignIn';
import { useReCaptcha } from '@/lib/ReCaptchaContext';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackSignupCompleted } from '@/lib/analytics';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const IS_NATIVE = Capacitor.isNativePlatform();

function AuthRedesigned() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, isAuthenticated, user } = useAuth();
  const { executeRecaptcha } = useReCaptcha();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const nextParam = searchParams.get('next');
  const requestedDestination = nextParam || ROUTES.today;

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.onboarding_completed === false) {
      navigate(ROUTES.onboarding, { replace: true });
      return;
    }
    navigate(requestedDestination, { replace: true });
  }, [isAuthenticated, navigate, requestedDestination, user?.onboarding_completed]);

  const runCaptcha = async (action) => {
    if (!executeRecaptcha) return null;
    return executeRecaptcha(action);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Please enter your email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await runCaptcha(isLogin ? 'login' : 'signup');

      if (isLogin) {
        const loggedInUser = await signIn(normalizedEmail, password);
        if (!loggedInUser) return;
        const destination = loggedInUser.onboarding_completed
          ? requestedDestination
          : ROUTES.onboarding;
        navigate(destination, { replace: true });
        return;
      }

      const result = await signUp(normalizedEmail, password, { full_name: '' });
      if (!result) return;
      trackSignupCompleted({ method: 'email' });

      if (result?.needsEmailConfirmation) {
        setError('Please check your email for confirmation');
        return;
      }

      emailService.welcome({ email: normalizedEmail, userId: result?.id });
      const destination = result.onboarding_completed ? requestedDestination : ROUTES.onboarding;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError('');
      const result = await signInWithGoogle();
      if (!result) return;
      trackSignupCompleted({ method: 'google' });
      const destination = result.onboarding_completed ? requestedDestination : ROUTES.onboarding;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleAuth = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setError('');
      // Apple auth implementation would go here
      setError('Apple sign-in coming soon');
    } catch (err) {
      setError(err.message || 'Apple sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicSiteShell>
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))] px-4">
        <div className="w-full max-w-md">
          {/* Auth Card - Linear reference */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 shadow-lg">
            {/* Brand */}
            <div className="mb-8 flex justify-center">
              <AtlasCoreLogoSVG 
                width={48} 
                variant="lockup"
                height={undefined}
                color={undefined}
                alt="atlas.core"
              />
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-[hsl(var(--fg))] mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm text-[hsl(var(--fg-3))]">
                {isLogin ? 'Sign in to your Atlas Core account' : 'Start tracking your progress today'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Email Field */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="atlas-field h-12 w-full rounded-xl border-[hsl(var(--border))] px-4 py-3 text-base"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="atlas-field h-12 w-full rounded-xl border-[hsl(var(--border))] px-4 py-3 text-base"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="rounded-lg bg-[hsl(var(--err)/0.1)] p-3 text-sm text-[hsl(var(--err))]">
                  {error}
                </div>
              )}

              {/* Primary CTA */}
              <button
                type="submit" 
                className="atlas-button atlas-button-primary w-full h-12 rounded-xl font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--fg))/30 border-t-[hsl(var(--fg))]" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>{isLogin ? 'Continue' : 'Create account'}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[hsl(var(--card))] px-4 text-sm text-[hsl(var(--fg-3))]">Or continue with</span>
              </div>
            </div>

            {/* SSO Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="atlas-button atlas-button-secondary w-full h-12 rounded-xl border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] flex items-center justify-center"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66L-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07L3.66 2.84C.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="atlas-button atlas-button-secondary w-full h-12 rounded-xl border-[hsl(var(--border))] hover:bg-[hsl(var(--card-hi))] flex items-center justify-center"
                onClick={handleAppleAuth}
                disabled={isSubmitting}
              >
                <span className="mr-2"></span>
                Continue with Apple
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Legal */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[hsl(var(--fg-3))]">
                {isLogin ? (
                  <>
                    By signing in, you agree to our{' '}
                    <Link to="/terms" className="hover:text-[hsl(var(--fg))]">Terms</Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="hover:text-[hsl(var(--fg))]">Privacy</Link>
                  </>
                ) : (
                  <>
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="hover:text-[hsl(var(--fg))]">Terms</Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="hover:text-[hsl(var(--fg))]">Privacy</Link>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicSiteShell>
  );
}

export default AuthRedesigned;
