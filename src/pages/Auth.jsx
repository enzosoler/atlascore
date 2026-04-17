import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabaseClient';
import { email as emailService } from '@/lib/emailService';
import { signInWithGoogle } from '@/lib/googleSignIn';
import { useReCaptcha } from '@/lib/ReCaptchaContext';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import { trackSignupCompleted } from '@/lib/analytics';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const IS_NATIVE = Capacitor.isNativePlatform();
const PENDING_AUTH_NEXT_KEY = 'atlas_auth_next';

/* ------------------------------------------------------------------ */
/*  Utility helpers (unchanged logic)                                  */
/* ------------------------------------------------------------------ */

function resolveRequestedDestination(nextParam) {
  if (!nextParam) return ROUTES.today;
  try {
    const url = new URL(nextParam, window.location.origin);
    if (url.origin !== window.location.origin) return ROUTES.today;
    return `${url.pathname}${url.search}${url.hash}` || ROUTES.today;
  } catch {
    return nextParam.startsWith('/') ? nextParam : ROUTES.today;
  }
}

function buildAuthHref({ mode, next }) {
  const params = new URLSearchParams();
  if (mode) params.set('mode', mode);
  if (next) params.set('next', next);
  const query = params.toString();
  return query ? `${ROUTES.auth}?${query}` : ROUTES.auth;
}

function getAuthErrorMessage(error) {
  const message = error?.message || '';
  if (/invalid login credentials/i.test(message)) return 'Invalid email or password.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email before signing in.';
  if (/user already registered/i.test(message)) return 'An account with this email already exists.';
  if (/password/i.test(message) && /least/i.test(message)) return 'Your password must be at least 6 characters long.';
  return message || 'We could not authenticate you right now. Please try again.';
}

/* ------------------------------------------------------------------ */
/*  Inline validation helpers                                          */
/* ------------------------------------------------------------------ */

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ------------------------------------------------------------------ */
/*  Auth — Linear-inspired minimal centered card                       */
/* ------------------------------------------------------------------ */

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language: currentLocale } = useTranslation();
  const { signIn, signUp, isAuthenticated, user } = useAuth();
  const { executeRecaptcha, isCaptchaEnabled } = useReCaptcha();

  const modeParam = searchParams.get('mode');
  const legacyRecoveryRequested = searchParams.get('reset') === '1';
  const isLogin = modeParam === 'login' || legacyRecoveryRequested || (!modeParam && location.pathname === ROUTES.login);
  const nextParam = searchParams.get('next');
  const requestedDestination = React.useMemo(() => resolveRequestedDestination(nextParam), [nextParam]);
  const isPt = currentLocale === 'pt-BR';

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [forgotPassword, setForgotPassword] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);
  const [emailTouched, setEmailTouched] = React.useState(false);
  const [passwordTouched, setPasswordTouched] = React.useState(false);

  const ui = React.useMemo(() => (isPt ? {
    loginTitle: 'Bem-vindo de volta',
    signupTitle: 'Crie sua conta',
    recoveryTitle: 'Redefinir senha',
    recoverySubtitle: 'Enviaremos um link para o seu email.',
    fullNamePlaceholder: 'Seu nome completo',
    emailPlaceholder: 'voce@exemplo.com',
    passwordPlaceholder: '6+ caracteres',
    continue: 'Continuar',
    signingIn: 'Entrando...',
    creating: 'Criando...',
    recoveryButton: 'Enviar link',
    recoverySent: 'Link enviado. Verifique seu email.',
    forgotPassword: 'Esqueci minha senha',
    backToSignIn: 'Voltar',
    noAccount: 'Não tem conta?',
    hasAccount: 'Já tem conta?',
    createAccount: 'Criar conta',
    signInLink: 'Entrar',
    missingCredentials: 'Digite seu email e senha.',
    missingName: 'Digite seu nome completo.',
    emailConfirmation: 'Conta criada. Confirme seu email para entrar.',
    divider: 'ou',
    invalidEmail: 'Email inválido.',
    passwordTooShort: 'Mínimo 6 caracteres.',
  } : {
    loginTitle: 'Welcome back',
    signupTitle: 'Create your account',
    recoveryTitle: 'Reset password',
    recoverySubtitle: "We'll send a reset link to your email.",
    fullNamePlaceholder: 'Full name',
    emailPlaceholder: 'you@example.com',
    passwordPlaceholder: '6+ characters',
    continue: 'Continue',
    signingIn: 'Signing in...',
    creating: 'Creating...',
    recoveryButton: 'Send reset link',
    recoverySent: 'Reset link sent. Check your email.',
    forgotPassword: 'Forgot password?',
    backToSignIn: 'Back',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createAccount: 'Create account',
    signInLink: 'Sign in',
    missingCredentials: 'Enter your email and password.',
    missingName: 'Enter your full name.',
    emailConfirmation: 'Account created. Check your email to confirm.',
    divider: 'or',
    invalidEmail: 'Enter a valid email address.',
    passwordTooShort: 'Must be at least 6 characters.',
  }), [isPt]);

  const loginHref = React.useMemo(() => buildAuthHref({ mode: 'login', next: nextParam }), [nextParam]);
  const signupHref = React.useMemo(() => buildAuthHref({ mode: 'signup', next: nextParam }), [nextParam]);

  // Inline validation states
  const emailError = emailTouched && email.length > 0 && !isValidEmail(email) ? ui.invalidEmail : null;
  const passwordError = passwordTouched && password.length > 0 && password.length < 6 ? ui.passwordTooShort : null;

  React.useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setEmailTouched(false);
    setPasswordTouched(false);
  }, [isLogin, legacyRecoveryRequested]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.onboarding_completed === null) return;
    if (user?.onboarding_completed === false) {
      navigate(ROUTES.onboarding, { replace: true });
      return;
    }
    const fallbackRoute = ROLE_HOME[user?.atlas_role] || ROUTES.today;
    navigate(requestedDestination || fallbackRoute, { replace: true });
  }, [isAuthenticated, navigate, requestedDestination, user?.atlas_role, user?.onboarding_completed]);

  const runCaptcha = async (action) => {
    if (!isCaptchaEnabled || !executeRecaptcha) return null;
    return executeRecaptcha(action);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    setErrorMessage('');
    setSuccessMessage('');

    if (!normalizedEmail || !password) {
      setErrorMessage(ui.missingCredentials);
      return;
    }
    if (!isLogin && !fullName.trim()) {
      setErrorMessage(ui.missingName);
      return;
    }

    try {
      setIsSubmitting(true);
      await runCaptcha(isLogin ? 'login' : 'signup');

      if (isLogin) {
        const loggedInUser = await signIn(normalizedEmail, password);
        if (!loggedInUser) return;
        const destination = loggedInUser.onboarding_completed
          ? (requestedDestination || ROLE_HOME[loggedInUser.atlas_role] || ROUTES.today)
          : ROUTES.onboarding;
        navigate(destination, { replace: true });
        return;
      }

      const result = await signUp(normalizedEmail, password, { full_name: fullName });
      if (!result) return;
      trackSignupCompleted({ method: 'email' });

      try {
        await supabase.functions.invoke('terms-acceptance', { body: { user_id: result?.id } });
      } catch (termsError) {
        console.error('Failed to record terms acceptance:', termsError);
      }

      if (result?.needsEmailConfirmation) {
        setSuccessMessage(ui.emailConfirmation);
        setPassword('');
        return;
      }

      emailService.welcome({ email: normalizedEmail, firstName: fullName, userId: result?.id });
      const destination = result.onboarding_completed ? (requestedDestination || ROUTES.today) : ROUTES.onboarding;
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage(isPt ? 'Digite seu email para continuar.' : 'Enter your email to continue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const captchaToken = await runCaptcha('password_reset');
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
        captchaToken,
      });
      if (error) throw error;
      setResetSent(true);
    } catch {
      setErrorMessage(isPt ? 'Não foi possível enviar o link. Tente novamente.' : 'Could not send the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setErrorMessage('');
      sessionStorage.setItem(PENDING_AUTH_NEXT_KEY, requestedDestination);
      await signInWithGoogle(`${window.location.origin}/auth/callback`);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  const handleAppleAuth = async () => {
    try {
      setErrorMessage('');
      sessionStorage.setItem(PENDING_AUTH_NEXT_KEY, requestedDestination);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Shared input class                                               */
  /* ---------------------------------------------------------------- */

  const inputBase =
    'h-12 w-full rounded-[12px] border bg-[hsl(var(--fill)/0.18)] px-4 text-[15px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] outline-none transition-colors focus:border-[hsl(var(--brand))] focus:bg-[hsl(var(--fill)/0.08)]';
  const inputDefault = `${inputBase} border-[hsl(var(--border)/0.6)]`;
  const inputError = `${inputBase} border-[hsl(var(--err)/0.6)]`;

  /* ---------------------------------------------------------------- */
  /*  Card content                                                     */
  /* ---------------------------------------------------------------- */

  const cardContent = (
    <motion.div
      className="w-full max-w-[380px]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className="mb-10 flex justify-center">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <AtlasCoreLogoSVG width={22} />
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg-2))]">
            atlas.core
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-8">
        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={forgotPassword ? 'recovery' : isLogin ? 'login' : 'signup'}
            className="text-center text-[24px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {forgotPassword ? ui.recoveryTitle : isLogin ? ui.loginTitle : ui.signupTitle}
          </motion.h1>
        </AnimatePresence>

        {forgotPassword && (
          <p className="mt-2 text-center text-[14px] text-[hsl(var(--fg-2))]">
            {ui.recoverySubtitle}
          </p>
        )}

        {/* ---- Password reset form ---- */}
        {forgotPassword && !resetSent ? (
          <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ui.emailPlaceholder}
              className={inputDefault}
            />

            {errorMessage && (
              <p className="text-[13px] text-[hsl(var(--err))]">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[hsl(var(--brand))] text-[15px] font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : ui.recoveryButton}
            </button>

            <button
              type="button"
              onClick={() => { setForgotPassword(false); setErrorMessage(''); }}
              className="flex w-full items-center justify-center gap-1.5 py-1 text-[13px] text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {ui.backToSignIn}
            </button>
          </form>
        ) : forgotPassword && resetSent ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="rounded-[12px] bg-[hsl(var(--ok)/0.08)] px-4 py-3 text-[13px] text-[hsl(var(--ok))]">
              {ui.recoverySent}
            </div>
            <button
              type="button"
              onClick={() => { setForgotPassword(false); setResetSent(false); setErrorMessage(''); }}
              className="py-1 text-[13px] text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
            >
              {ui.backToSignIn}
            </button>
          </div>
        ) : (
          /* ---- Main auth form ---- */
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            {/* Email first */}
            <div>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder={ui.emailPlaceholder}
                className={emailError ? inputError : inputDefault}
              />
              {emailError && (
                <p className="mt-1 text-[12px] text-[hsl(var(--err))]">{emailError}</p>
              )}
            </div>

            {/* Name (sign-up only) */}
            {!isLogin && (
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={ui.fullNamePlaceholder}
                className={inputDefault}
              />
            )}

            {/* Password */}
            <div>
              <input
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                placeholder={ui.passwordPlaceholder}
                className={passwordError ? inputError : inputDefault}
              />
              {passwordError && (
                <p className="mt-1 text-[12px] text-[hsl(var(--err))]">{passwordError}</p>
              )}
            </div>

            {/* Error / Success */}
            {errorMessage && (
              <div className="rounded-[10px] bg-[hsl(var(--err)/0.08)] px-3.5 py-2.5 text-[13px] text-[hsl(var(--err))]">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-[10px] bg-[hsl(var(--ok)/0.08)] px-3.5 py-2.5 text-[13px] text-[hsl(var(--ok))]">
                {successMessage}
              </div>
            )}

            {/* Terms (sign-up) */}
            {!isLogin && (
              <p className="text-center text-[11px] leading-relaxed text-[hsl(var(--fg-3))]">
                By continuing, you agree to our{' '}
                <Link to="/terms" target="_blank" className="underline hover:text-[hsl(var(--fg-2))]">Terms</Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="underline hover:text-[hsl(var(--fg-2))]">Privacy Policy</Link>.
              </p>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[hsl(var(--brand))] text-[15px] font-semibold text-white shadow-[0_10px_30px_hsl(var(--brand)/0.18)] transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {ui.continue}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="h-px w-full bg-[hsl(var(--border)/0.5)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[hsl(var(--card))] px-4 text-[12px] text-[hsl(var(--fg-3))]">
                  {ui.divider}
                </span>
              </div>
            </div>

            {/* Social auth */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleAppleAuth}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[12px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.12)] text-[14px] font-medium text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--fill)/0.25)] active:scale-[0.98]"
              >
                <span className="text-[17px]"></span>
                Continue with Apple
              </button>
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[12px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.12)] text-[14px] font-medium text-[hsl(var(--fg))] transition-colors hover:bg-[hsl(var(--fill)/0.25)] active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>
          </form>
        )}

        {/* Toggle login / signup */}
        {!forgotPassword && (
          <div className="mt-6 border-t border-[hsl(var(--border)/0.5)] pt-5">
            <p className="text-center text-[13px] text-[hsl(var(--fg-2))]">
              {isLogin ? ui.noAccount : ui.hasAccount}{' '}
              <Link
                to={isLogin ? signupHref : loginHref}
                className="font-semibold text-[hsl(var(--brand))] hover:underline underline-offset-2"
              >
                {isLogin ? ui.createAccount : ui.signInLink}
              </Link>
            </p>

            {isLogin && (
              <button
                type="button"
                onClick={() => { setForgotPassword(true); setErrorMessage(''); setSuccessMessage(''); }}
                className="mt-2 w-full text-center text-[13px] text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
              >
                {ui.forgotPassword}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  /* ---------------------------------------------------------------- */
  /*  Layout wrappers                                                  */
  /* ---------------------------------------------------------------- */

  if (IS_NATIVE) {
    return (
      <div className="mobile-screen bg-[hsl(var(--bg))]">
        <div className="safe-scroll flex flex-1 flex-col items-center justify-center px-5 py-10">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <PublicSiteShell compactNav showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {cardContent}
      </div>
    </PublicSiteShell>
  );
}
