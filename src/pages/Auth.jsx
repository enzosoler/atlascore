import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Brain,
  Dumbbell,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabaseClient';
import PublicSiteShell from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

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
    [ROUTES.atlasAI]: 'Atlas AI',
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

function FeatureCard({ icon: Icon, text }) {
  return (
    <div className="atlas-public-panel-muted p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.86)] bg-[hsl(var(--card))] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <p className="mt-4 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{text}</p>
    </div>
  );
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
  const hasValue = String(value || '').length > 0;

  return (
    <label
      htmlFor={id}
      className="relative block rounded-[18px] border border-[hsl(var(--border)/0.86)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.56)_0%,hsl(var(--card))_100%)] px-4 pb-3 pt-5 transition-colors focus-within:border-[hsl(var(--brand)/0.42)] focus-within:ring-2 focus-within:ring-[hsl(var(--brand)/0.12)]"
    >
      <span
        className={`pointer-events-none absolute left-4 transition-all duration-150 ${
          hasValue
            ? 'top-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]'
            : 'top-[18px] text-[14px] text-[hsl(var(--fg-3))]'
        }`}
      >
        {label}
      </span>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={hasValue ? placeholder : ''}
        className="w-full border-0 bg-transparent px-0 pt-3 text-[15px] font-medium text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none"
      />
    </label>
  );
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { signIn, signUp, isAuthenticated, user } = useAuth();

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

  const ui = React.useMemo(
    () => ({
      secureLabel: 'Secure access',
      heroTitle: 'Sign in and keep your progress connected in one place.',
      heroCopy:
        'Workouts, nutrition, labs, measurements and Atlas AI stay tied to the same context so you can pick up without friction.',
      authHint: isLogin
        ? 'Sign back in to pick up your history, adherence and context without losing momentum.'
        : 'Create your account to start with training, nutrition and progress organized from day one.',
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'Your name',
      emailPlaceholder: 'you@example.com',
      passwordPlaceholder: 'Your password',
      recoveryTitle: 'Need help accessing your account?',
      recoveryCopy:
        'Email us from the address tied to your account and we will help you get back in.',
      recoveryCta: 'Contact support',
      supportLink: 'Forgot your password? Contact support.',
      missingCredentials: 'Enter your email and password to continue.',
      missingName: 'Enter your full name to create your account.',
      emailConfirmation:
        'Account created. Check your email to confirm access before signing in.',
      signInCta: 'Sign in',
      signInBusy: 'Signing in...',
      signUpCta: 'Create account',
      signUpBusy: 'Creating account...',
      backHome: 'Back to home',
    }),
    [isLogin]
  );

  const features = [
    { icon: Dumbbell, text: t('auth.features.training') },
    { icon: FlaskConical, text: t('auth.features.labs') },
    { icon: BarChart3, text: t('auth.features.analytics') },
    { icon: Brain, text: t('auth.features.ai') },
  ];

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

    return `${isLogin ? 'After sign-in' : 'After you create your account'}, you will continue to ${destinationLabel}.`;
  }, [isLogin, nextParam, requestedDestination]);

  React.useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
  }, [isLogin, legacyRecoveryRequested]);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const fallbackRoute = ROLE_HOME[user?.atlas_role] || ROUTES.today;
    navigate(requestedDestination || fallbackRoute, { replace: true });
  }, [isAuthenticated, navigate, requestedDestination, user?.atlas_role]);

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

      if (isLogin) {
        await signIn({
          email: normalizedEmail,
          password,
        });

        navigate(requestedDestination || ROUTES.today, { replace: true });
        return;
      }

      const result = await signUp({
        email: normalizedEmail,
        password,
        fullName,
      });

      if (result.needsEmailConfirmation) {
        setSuccessMessage(ui.emailConfirmation);
        setPassword('');
        return;
      }

      navigate(requestedDestination || ROUTES.today, { replace: true });
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
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth?mode=login`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch {
      setErrorMessage('Could not send the reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicSiteShell
      compactNav
      showFooter={false}
      actions={(
        <>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to={ROUTES.home}>{ui.backHome}</Link>
          </Button>
        </>
      )}
    >
      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
          <div className="atlas-page-header relative overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--brand)/0.08)] to-transparent" />

            <div className="relative space-y-7">
              <div className="space-y-4">
                <span className="atlas-public-pill">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={1.9} />
                  {ui.secureLabel}
                </span>
                <div className="space-y-4">
                  <h1 className="atlas-display-title max-w-3xl text-[clamp(2.5rem,2rem+1.8vw,4.25rem)]">
                    {ui.heroTitle}
                  </h1>
                  <p className="atlas-public-copy max-w-2xl">{ui.heroCopy}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <FeatureCard key={feature.text} icon={feature.icon} text={feature.text} />
                ))}
              </div>
            </div>
          </div>

          <div className="atlas-public-panel px-6 py-6 lg:px-7 lg:py-7">
            <div className="mx-auto max-w-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
                <Activity className="h-5 w-5" strokeWidth={2} />
              </div>

              <div className="mt-6">
                <h2 className="text-[1.7rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
                  {isLogin ? t('auth.login.title') : t('auth.signup.title')}
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  {ui.authHint}
                </p>
                {destinationNote ? (
                  <p className="mt-3 flex items-center gap-2 rounded-full border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.08)] px-3 py-2 text-[12px] font-medium text-[hsl(var(--brand))]">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    <span>{destinationNote}</span>
                  </p>
                ) : null}
              </div>

              {/* ── Forgot password panel ── */}
              {isLogin && forgotPassword && !resetSent && (
                <form className="mt-7 space-y-4" onSubmit={handlePasswordReset}>
                  <div>
                    <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                      {ui.recoveryTitle}
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      Enter your email and we will send you a link to reset your password.
                    </p>
                  </div>
                  <AuthField
                      id="resetEmail"
                      label={t('profile.email')}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={ui.emailPlaceholder}
                  />
                  {errorMessage ? (
                    <div className="atlas-banner px-4 py-3.5 text-[12px]" data-tone="error">
                      {errorMessage}
                    </div>
                  ) : null}
                  <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send reset link'}
                    {!isSubmitting ? <ArrowRight className="h-4 w-4" strokeWidth={2} /> : null}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setForgotPassword(false); setErrorMessage(''); }}
                    className="flex w-full items-center justify-center gap-1.5 text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    Back to sign in
                  </button>
                </form>
              )}

              {isLogin && forgotPassword && resetSent && (
                <div className="mt-7 space-y-5">
                  <div className="atlas-banner px-4 py-4 text-[13px]" data-tone="success">
                    Reset link sent! Check your email to reset your password.
                  </div>
                  <button
                    type="button"
                    onClick={() => { setForgotPassword(false); setResetSent(false); setErrorMessage(''); }}
                    className="flex w-full items-center justify-center gap-1.5 text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    Back to sign in
                  </button>
                </div>
              )}

              {!(isLogin && forgotPassword) && (
              <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
                {!isLogin ? (
                  <AuthField
                      id="fullName"
                      label={ui.fullNameLabel}
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={ui.fullNamePlaceholder}
                  />
                ) : null}

                <AuthField
                  id="email"
                  label={t('profile.email')}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={ui.emailPlaceholder}
                />

                <AuthField
                    id="password"
                    label={t('profile.password')}
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={ui.passwordPlaceholder}
                />

                {errorMessage ? (
                  <div className="atlas-banner px-4 py-3.5 text-[12px]" data-tone="error">
                    {errorMessage}
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="atlas-banner px-4 py-3.5 text-[12px]" data-tone="success">
                    {successMessage}
                  </div>
                ) : null}

                <Button type="submit" size="lg" className="h-12 w-full rounded-[12px]" disabled={isSubmitting}>
                  {isSubmitting
                    ? isLogin
                      ? ui.signInBusy
                      : ui.signUpBusy
                    : isLogin
                      ? ui.signInCta
                      : ui.signUpCta}
                  {!isSubmitting ? <ArrowRight className="h-4 w-4" strokeWidth={2} /> : null}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[hsl(var(--border))]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">Or</span>
                  </div>
                </div>

                <GoogleSignInButton
                  redirectUrl={`${window.location.origin}/auth/callback`}
                  className="h-12 w-full rounded-[12px]"
                />
              </form>
              )}

              {!isLogin ? (
                <div className="mt-6 flex items-center justify-center gap-4 border-t border-[hsl(var(--border)/0.76)] pt-5">
                  {[t('auth.trust.free'), t('auth.trust.noCard'), t('auth.trust.cancel')].map((item) => (
                    <span key={item} className="text-center text-[10px] font-medium text-[hsl(var(--fg-3))]">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

              {!(isLogin && forgotPassword) && (
                <>
                  <div className="mt-5 text-center text-[13px] text-[hsl(var(--fg-2))]">
                    {isLogin ? t('auth.login.noAccount') : t('auth.signup.hasAccount')}{' '}
                    <Link
                      to={isLogin ? signupHref : loginHref}
                      className="font-semibold text-[hsl(var(--fg))] hover:underline"
                    >
                      {isLogin ? t('auth.login.createAccount') : t('auth.signup.signIn')}
                    </Link>
                  </div>

                  {isLogin ? (
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        onClick={() => { setForgotPassword(true); setErrorMessage(''); setSuccessMessage(''); }}
                        className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] hover:underline underline-offset-2"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-3 text-center">
                    <Link to={ROUTES.home} className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]">
                      {t('auth.backHome')}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
