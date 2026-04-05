import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabaseClient';
import { email as emailService } from '@/lib/emailService';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackSignupCompleted } from '@/lib/analytics';
import { Capacitor } from '@capacitor/core';

const IS_NATIVE = Capacitor.isNativePlatform();
import { useReCaptcha } from '@/lib/ReCaptchaContext';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
// Auth page redesign: centered layout, personal copy, lighter UX

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
  return query ? `/auth?${query}` : '/auth';
}

function getAuthErrorMessage(error) {
  const message = error?.message || '';

  if (/invalid login credentials/i.test(message)) {
    return 'Invalid email or password.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Confirm your email before signing in.';
  }

  if (/user already registered/i.test(message)) {
    return 'An account with this email already exists.';
  }

  if (/password/i.test(message) && /least/i.test(message)) {
    return 'Your password must be at least 6 characters long.';
  }

  return message || 'We could not authenticate you right now. Please try again.';
}

function getDestinationLabel(destination) {
  if (!destination) return null;

  let pathname = ROUTES.today;

  try {
    pathname = new URL(destination, window.location.origin).pathname || ROUTES.today;
  } catch {
    pathname = destination.startsWith('/') ? destination.split('?')[0].split('#')[0] : ROUTES.today;
  }

  const labels = {
    [ROUTES.home]: 'the home page',
    [ROUTES.today]: 'the Today dashboard',
    [ROUTES.nutrition]: 'Nutrition',
    [ROUTES.workouts]: 'Workouts',
    [ROUTES.routines]: 'Routines',
    [ROUTES.protocols]: 'Protocols',
    [ROUTES.measurements]: 'Measurements',
    [ROUTES.labExams]: 'Labs',
    [ROUTES.progressReview]: 'Progress review',
    [ROUTES.insights]: 'Insights',
    [ROUTES.progress]: 'Progress',
    [ROUTES.body]: 'Body',
    [ROUTES.profile]: 'Profile',
    [ROUTES.pricing]: 'Pricing',
    [ROUTES.coachDashboard]: 'the coach dashboard',
    [ROUTES.nutritionistDashboard]: 'the nutritionist dashboard',
    [ROUTES.clinicianDashboard]: 'the clinician dashboard',
    [ROUTES.admin]: 'the admin panel',
  };

  return labels[pathname] || 'your next step';
}

function AuthField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[hsl(var(--fg-2))]">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 rounded-xl bg-[hsl(var(--fill)/0.5)] border border-transparent focus:bg-[hsl(var(--card))] focus:border-[hsl(var(--brand))] focus:ring-0 transition-all duration-100"
      />
    </div>
  );
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { signIn, signUp, isAuthenticated, user } = useAuth();
  const { executeRecaptcha, isCaptchaEnabled } = useReCaptcha();

  const modeParam = searchParams.get('mode');
  const legacyRecoveryRequested = searchParams.get('reset') === '1';
  const isLogin =
    modeParam === 'login' ||
    legacyRecoveryRequested ||
    (!modeParam && location.pathname === ROUTES.login);
  const nextParam = searchParams.get('next');
  const requestedDestination = React.useMemo(
    () => resolveRequestedDestination(nextParam),
    [nextParam]
  );

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [forgotPassword, setForgotPassword] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);

  const { language: currentLocale } = useTranslation();
  const isPt = currentLocale === 'pt-BR';

  const ui = React.useMemo(
    () => isPt ? ({
      // Headlines - personal and action-oriented
      loginTitle: 'Bem-vindo de volta',
      loginSubtitle: 'Continue seu treino e nutrição onde parou.',
      signupTitle: 'Comece sua jornada',
      signupSubtitle: 'Seu plano de treino e nutrição personalizado espera por você.',

      // AI hint
      aiHint: 'Com IA adaptativa',

      // Form labels
      fullNameLabel: 'Nome completo',
      fullNamePlaceholder: 'Seu nome',
      emailLabel: 'Email',
      emailPlaceholder: 'voce@exemplo.com',
      passwordLabel: 'Senha',
      passwordPlaceholder: 'Sua senha',

      // CTAs
      signInCta: 'Entrar',
      signInBusy: 'Entrando...',
      signUpCta: 'Criar conta',
      signUpBusy: 'Criando...',
      googleSignIn: 'Continuar com Google',
      orDivider: 'ou',

      // Links
      noAccount: 'Não tem conta?',
      hasAccount: 'Já tem conta?',
      createAccount: 'Criar conta',
      signInLink: 'Entrar',
      forgotPassword: 'Esqueceu a senha?',
      backToSignIn: 'Voltar para entrar',
      backHome: 'Voltar ao início',

      // Recovery
      recoveryTitle: 'Redefinir senha',
      recoverySubtitle: 'Enviamos um link para seu email.',
      recoveryButton: 'Enviar link',
      recoverySent: 'Link enviado! Verifique seu email.',

      // Errors
      missingCredentials: 'Digite seu email e senha.',
      missingName: 'Digite seu nome completo.',
      emailConfirmation: 'Conta criada! Confirme seu email para entrar.',
    }) : ({
      // Headlines - personal and action-oriented
      loginTitle: 'Welcome back',
      loginSubtitle: 'Pick up your training and nutrition right where you left off.',
      signupTitle: 'Start your journey',
      signupSubtitle: 'Your personalized training and nutrition plan is waiting.',

      // AI hint
      aiHint: 'AI-powered',

      // Form labels
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Your password',

      // CTAs
      signInCta: 'Sign in',
      signInBusy: 'Signing in...',
      signUpCta: 'Create account',
      signUpBusy: 'Creating...',
      googleSignIn: 'Continue with Google',
      orDivider: 'or',

      // Links
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create account',
      signInLink: 'Sign in',
      forgotPassword: 'Forgot password?',
      backToSignIn: 'Back to sign in',
      backHome: 'Back to home',

      // Recovery
      recoveryTitle: 'Reset password',
      recoverySubtitle: "We'll send a link to your email.",
      recoveryButton: 'Send reset link',
      recoverySent: 'Reset link sent! Check your email.',

      // Errors
      missingCredentials: 'Enter your email and password.',
      missingName: 'Enter your full name.',
      emailConfirmation: 'Account created! Check your email to confirm.',
    }),
    [isLogin, isPt]
  );

  const loginHref = React.useMemo(
    () => buildAuthHref({ mode: 'login', next: nextParam }),
    [nextParam]
  );
  const signupHref = React.useMemo(
    () => buildAuthHref({ mode: 'signup', next: nextParam }),
    [nextParam]
  );

  const destinationNote = React.useMemo(() => {
    if (!nextParam) return '';

    const destinationLabel = getDestinationLabel(requestedDestination);

    if (isPt) {
      return `${isLogin ? 'Após entrar' : 'Após criar sua conta'}, você continuará para ${destinationLabel}.`;
    }
    return `${isLogin ? 'After sign-in' : 'After you create your account'}, you will continue to ${destinationLabel}.`;
  }, [isLogin, nextParam, requestedDestination]);

  React.useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
  }, [isLogin, legacyRecoveryRequested]);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    // Wait for onboarding_completed to be resolved (true or false)
    if (user?.onboarding_completed === null) return;

    if (user?.onboarding_completed === false) {
      navigate(ROUTES.onboarding, { replace: true });
      return;
    }

    const fallbackRoute = ROLE_HOME[user?.atlas_role] || ROUTES.today;
    navigate(requestedDestination || fallbackRoute, { replace: true });
  }, [isAuthenticated, navigate, requestedDestination, user?.atlas_role, user?.onboarding_completed]);

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

      // Execute CAPTCHA if enabled
      let captchaToken = null;
      if (isCaptchaEnabled && executeRecaptcha) {
        captchaToken = await executeRecaptcha(isLogin ? 'login' : 'signup');
      }

      if (isLogin) {
        const loggedInUser = await signIn(normalizedEmail, password);
        if (!loggedInUser) return; // Error handled by AuthContext

        const destination = loggedInUser.onboarding_completed
          ? (requestedDestination || ROLE_HOME[loggedInUser.atlas_role] || ROUTES.today)
          : ROUTES.onboarding;
        navigate(destination, { replace: true });
        return;
      }

      const result = await signUp(normalizedEmail, password, { full_name: fullName });
      if (!result) return;
      trackSignupCompleted({ method: 'email' });
      
      const needsEmailConfirmation = result?.needsEmailConfirmation;

      try {
        await supabase.functions.invoke('terms-acceptance', {
          body: { user_id: result?.id },
        });
      } catch (termsError) {
        // Don't block signup if terms recording fails
        console.error('Failed to record terms acceptance:', termsError);
      }

      if (!needsEmailConfirmation) {
        emailService.welcome({ email: normalizedEmail, firstName: fullName, userId: result?.id });
      }

      if (needsEmailConfirmation) {
        setSuccessMessage(ui.emailConfirmation);
        setPassword('');
        return;
      }

      // Brand-new accounts always start onboarding; result is the resolved user object.
      // onboarding_completed will be false for new accounts.
      const destination = result.onboarding_completed
        ? (requestedDestination || ROUTES.today)
        : ROUTES.onboarding;
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
      setErrorMessage('Enter your email to continue.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Execute CAPTCHA if enabled
      let captchaToken = null;
      if (isCaptchaEnabled && executeRecaptcha) {
        captchaToken = await executeRecaptcha('password_reset');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
        captchaToken: captchaToken,
      });
      if (error) throw error;
      setResetSent(true);
    } catch {
      setErrorMessage('Could not send the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="flex justify-center mb-7">
            <Link to={ROUTES.home} className="flex items-center gap-2">
              <AtlasCoreLogoSVG className="h-7 w-auto" variant="mono" />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-[hsl(var(--card))] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-sm)] dark:shadow-none dark:border dark:border-[hsl(var(--border))]">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {forgotPassword
                  ? ui.recoveryTitle
                  : isLogin
                    ? ui.loginTitle
                    : ui.signupTitle}
              </h1>
              <p className="mt-2 text-[14px] text-[hsl(var(--fg-2))] leading-relaxed">
                {forgotPassword
                  ? ui.recoverySubtitle
                  : isLogin
                    ? ui.loginSubtitle
                    : ui.signupSubtitle}
              </p>
            </div>

            {/* Forgot Password Form */}
            {forgotPassword && !resetSent && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <AuthField
                  id="email"
                  label={ui.emailLabel}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ui.emailPlaceholder}
                />

                {errorMessage && (
                  <div className="text-[13px] text-[hsl(var(--err))] bg-[hsl(var(--err)/0.08)] px-3.5 py-2.5 rounded-xl leading-snug">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {ui.recoveryButton}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotPassword(false);
                    setErrorMessage('');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-[13px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {ui.backToSignIn}
                </button>
              </form>
            )}

            {/* Reset Sent State */}
            {forgotPassword && resetSent && (
              <div className="text-center space-y-4">
                <div className="text-[13px] text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.08)] px-4 py-3 rounded-xl leading-snug">
                  {ui.recoverySent}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPassword(false);
                    setResetSent(false);
                    setErrorMessage('');
                  }}
                  className="py-2 text-[13px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
                >
                  {ui.backToSignIn}
                </button>
              </div>
            )}

            {/* Main Auth Form */}
            {!forgotPassword && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full name for signup */}
                {!isLogin && (
                  <AuthField
                    id="fullName"
                    label={ui.fullNameLabel}
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={ui.fullNamePlaceholder}
                  />
                )}

                <AuthField
                  id="email"
                  label={ui.emailLabel}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ui.emailPlaceholder}
                />

                <AuthField
                  id="password"
                  label={ui.passwordLabel}
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={ui.passwordPlaceholder}
                />

                {/* Error/Success Messages */}
                {errorMessage && (
                  <div className="text-[13px] text-[hsl(var(--err))] bg-[hsl(var(--err)/0.08)] px-3.5 py-2.5 rounded-xl leading-snug">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="text-[13px] text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.08)] px-3.5 py-2.5 rounded-xl leading-snug">
                    {successMessage}
                  </div>
                )}

                {/* Legal Acceptance - Signup Only */}
                {!isLogin && (
                  <p className="text-center text-[12px] text-[hsl(var(--fg-3))]">
                    By creating an account, you agree to our{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="underline hover:text-[hsl(var(--fg-2))]"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="underline hover:text-[hsl(var(--fg-2))]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}

                {/* Primary CTA */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {isLogin ? ui.signInBusy : ui.signUpBusy}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLogin ? ui.signInCta : ui.signUpCta}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-[hsl(var(--fill-secondary))]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-[hsl(var(--card))] text-[11px] text-[hsl(var(--fg-3))]">
                      {ui.orDivider}
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <GoogleSignInButton
                  redirectUrl={`${window.location.origin}/auth/callback`}
                  className="w-full h-11 rounded-lg"
                />
              </form>
            )}

            {/* Footer Links */}
            {!forgotPassword && (
              <div className="mt-6 pt-5 space-y-3">
                {/* Switch login/signup */}
                <p className="text-center text-[13px] text-[hsl(var(--fg-2))]">
                  {isLogin ? ui.noAccount : ui.hasAccount}{' '}
                  <Link
                    to={isLogin ? signupHref : loginHref}
                    className="font-semibold text-[hsl(var(--brand))] hover:underline underline-offset-2"
                  >
                    {isLogin ? ui.createAccount : ui.signInLink}
                  </Link>
                </p>

                {/* Forgot password */}
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="w-full text-center text-[13px] py-1 text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
                  >
                    {ui.forgotPassword}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Back to home - outside card, hidden on native (no public landing) */}
          {!IS_NATIVE && (
            <div className="mt-6 text-center">
              <Link
                to={ROUTES.home}
                className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
              >
                {ui.backHome}
              </Link>
            </div>
          )}
        </div>
  );

  if (IS_NATIVE) {
    return (
      <div className="mobile-screen bg-[hsl(var(--bg))]">
        <div className="safe-scroll flex-1 flex flex-col items-center justify-center px-5 py-10">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <PublicSiteShell compactNav showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {formContent}
      </div>
    </PublicSiteShell>
  );
}
