import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Dumbbell,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import PublicSiteShell, { PublicLanguageSwitcher } from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';

const SUPPORT_EMAIL = 'suporte@atlascore.app';

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

function getAuthErrorMessage(error, language) {
  const message = error?.message || '';
  const isPt = language === 'pt-BR';

  if (/invalid login credentials/i.test(message)) {
    return isPt ? 'Email ou senha inválidos.' : 'Invalid email or password.';
  }

  if (/email not confirmed/i.test(message)) {
    return isPt ? 'Confirme seu email antes de entrar.' : 'Confirm your email before signing in.';
  }

  if (/user already registered/i.test(message)) {
    return isPt ? 'Já existe uma conta com esse email.' : 'An account with this email already exists.';
  }

  if (/password/i.test(message) && /least/i.test(message)) {
    return isPt
      ? 'A senha precisa ter pelo menos 6 caracteres.'
      : 'Your password must be at least 6 characters long.';
  }

  return isPt
    ? message || 'Não foi possível autenticar agora. Tente novamente.'
    : message || 'We could not authenticate you right now. Please try again.';
}

function getDestinationLabel(destination, language) {
  if (!destination) return null;

  let pathname = ROUTES.today;

  try {
    pathname = new URL(destination, window.location.origin).pathname || ROUTES.today;
  } catch {
    pathname = destination.startsWith('/') ? destination.split('?')[0].split('#')[0] : ROUTES.today;
  }

  const labels = language === 'pt-BR'
    ? {
        [ROUTES.home]: 'a página inicial',
        [ROUTES.today]: 'o painel de hoje',
        [ROUTES.nutrition]: 'Nutrição',
        [ROUTES.workouts]: 'Treinos',
        [ROUTES.routines]: 'Rotinas',
        [ROUTES.protocols]: 'Protocolos',
        [ROUTES.measurements]: 'Medidas',
        [ROUTES.labExams]: 'Exames',
        [ROUTES.atlasAI]: 'Atlas AI',
        [ROUTES.insights]: 'Insights',
        [ROUTES.progress]: 'Progresso',
        [ROUTES.profile]: 'Perfil',
        [ROUTES.pricing]: 'Planos',
        [ROUTES.coachDashboard]: 'o dashboard do coach',
        [ROUTES.nutritionistDashboard]: 'o dashboard da nutricionista',
        [ROUTES.clinicianDashboard]: 'o dashboard clínico',
        [ROUTES.admin]: 'o painel administrativo',
      }
    : {
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
        [ROUTES.profile]: 'Profile',
        [ROUTES.pricing]: 'Pricing',
        [ROUTES.coachDashboard]: 'the coach dashboard',
        [ROUTES.nutritionistDashboard]: 'the nutritionist dashboard',
        [ROUTES.clinicianDashboard]: 'the clinician dashboard',
        [ROUTES.admin]: 'the admin panel',
      };

  return labels[pathname] || (language === 'pt-BR' ? 'a próxima etapa' : 'your next step');
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

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useTranslation();
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

  const ui = React.useMemo(
    () => (
      language === 'pt-BR'
        ? {
            secureLabel: 'Acesso seguro',
            heroTitle: 'Entre e continue seu progresso com tudo no mesmo lugar.',
            heroCopy:
              'Treino, nutrição, exames, medidas e Atlas AI seguem conectados para você retomar o contexto sem fricção.',
            authHint: isLogin
              ? 'Entre para retomar seu histórico, aderência e contexto sem perder o ritmo.'
              : 'Crie sua conta para começar com treino, nutrição e progresso organizados desde o primeiro dia.',
            fullNameLabel: 'Nome completo',
            fullNamePlaceholder: 'Seu nome',
            emailPlaceholder: 'voce@exemplo.com',
            passwordPlaceholder: 'Sua senha',
            recoveryTitle: 'Precisa recuperar o acesso?',
            recoveryCopy:
              'Envie um email com o endereço da sua conta e ajudamos você a voltar para o app.',
            recoveryCta: 'Falar com o suporte',
            supportLink: 'Esqueceu a senha? Fale com o suporte.',
            missingCredentials: 'Preencha email e senha para continuar.',
            missingName: 'Informe seu nome completo para criar a conta.',
            emailConfirmation:
              'Conta criada. Confira seu email para confirmar o acesso antes do login.',
            signInCta: 'Entrar',
            signInBusy: 'Entrando...',
            signUpCta: 'Criar conta',
            signUpBusy: 'Criando conta...',
            backHome: 'Voltar para a página inicial',
          }
        : {
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
          }
    ),
    [isLogin, language]
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

  const supportHref = React.useMemo(() => {
    const subject = language === 'pt-BR' ? 'Recuperar acesso ao Atlas Core' : 'Atlas Core account access';
    const body = language === 'pt-BR'
      ? `Olá,\n\nPreciso de ajuda para recuperar o acesso à minha conta Atlas Core.\nEmail da conta: ${email.trim() || ''}\n\nObrigado.`
      : `Hi,\n\nI need help recovering access to my Atlas Core account.\nAccount email: ${email.trim() || ''}\n\nThank you.`;

    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [email, language]);

  const destinationNote = React.useMemo(() => {
    if (!nextParam) return '';

    const destinationLabel = getDestinationLabel(requestedDestination, language);

    return language === 'pt-BR'
      ? `${isLogin ? 'Depois do login' : 'Depois de criar a conta'}, você segue para ${destinationLabel}.`
      : `${isLogin ? 'After sign-in' : 'After you create your account'}, you will continue to ${destinationLabel}.`;
  }, [isLogin, language, nextParam, requestedDestination]);

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
      setErrorMessage(getAuthErrorMessage(error, language));
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
          <PublicLanguageSwitcher />
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
                  <p className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[hsl(var(--brand))]">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    <span>{destinationNote}</span>
                  </p>
                ) : null}
              </div>

              {legacyRecoveryRequested ? (
                <div className="atlas-public-panel-muted mt-6 px-4 py-4">
                  <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {ui.recoveryTitle}
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
                    {ui.recoveryCopy}{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[hsl(var(--fg))] hover:underline">
                      {SUPPORT_EMAIL}
                    </a>
                    .
                  </p>
                  <Button asChild variant="outline" className="mt-4 h-10 w-full">
                    <a href={supportHref}>{ui.recoveryCta}</a>
                  </Button>
                </div>
              ) : null}

              <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
                {!isLogin ? (
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                      {ui.fullNameLabel}
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder={ui.fullNamePlaceholder}
                      className="atlas-field h-12 px-4 text-base"
                    />
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                    {t('profile.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={ui.emailPlaceholder}
                    className="atlas-field h-12 px-4 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                    {t('profile.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={ui.passwordPlaceholder}
                    className="atlas-field h-12 px-4 text-base"
                  />
                </div>

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

                <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? isLogin
                      ? ui.signInBusy
                      : ui.signUpBusy
                    : isLogin
                      ? ui.signInCta
                      : ui.signUpCta}
                  {!isSubmitting ? <ArrowRight className="h-4 w-4" strokeWidth={2} /> : null}
                </Button>
              </form>

              {!isLogin ? (
                <div className="mt-6 flex items-center justify-center gap-4 border-t border-[hsl(var(--border)/0.76)] pt-5">
                  {[t('auth.trust.free'), t('auth.trust.noCard'), t('auth.trust.cancel')].map((item) => (
                    <span key={item} className="text-center text-[10px] font-medium text-[hsl(var(--fg-3))]">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

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
                  <a href={supportHref} className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]">
                    {ui.supportLink}
                  </a>
                </div>
              ) : null}

              <div className="mt-3 text-center">
                <Link to={ROUTES.home} className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]">
                  {t('auth.backHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
