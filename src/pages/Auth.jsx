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
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_HOME, ROUTES } from '@/lib/routes';
import PublicSiteShell, { PublicLanguageSwitcher } from '@/components/public/PublicSiteShell';
import { Button } from '@/components/ui/button';

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

function buildAuthHref({ mode, reset = false, next }) {
  const params = new URLSearchParams();

  if (mode) params.set('mode', mode);
  if (reset) params.set('reset', '1');
  if (next) params.set('next', next);

  const query = params.toString();
  return query ? `/auth?${query}` : '/auth';
}

function getAuthErrorMessage(error) {
  const message = error?.message || '';

  if (/invalid login credentials/i.test(message)) {
    return 'Email ou senha inválidos.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Confirme seu email antes de entrar.';
  }

  if (/user already registered/i.test(message)) {
    return 'Já existe uma conta com esse email.';
  }

  if (/password/i.test(message) && /least/i.test(message)) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  return message || 'Não foi possível autenticar agora. Tente novamente.';
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
  const isLogin = modeParam === 'login' || (!modeParam && location.pathname === ROUTES.login);
  const isForgotPassword = searchParams.get('reset') === '1';
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
            heroTitle: 'Entre no Atlas Core sem sair da mesma atmosfera do produto.',
            heroCopy:
              'A mesma linguagem calma e precisa do app logado, agora aplicada ao primeiro passo da jornada.',
            continuityTitle: 'O que acontece depois',
            continuityCopy:
              'Seu acesso abre a mesma timeline central de treino, nutrição, exames, medidas e Atlas AI.',
            destinationLabel: 'Próximo destino',
            formMode: isForgotPassword
              ? 'Recuperar acesso'
              : isLogin
                ? 'Entrar'
                : 'Criar conta',
            authHint: isLogin
              ? 'Entre para retomar seu histórico, aderência e contexto.'
              : 'Crie sua conta para começar com o Atlas Core já organizado.',
            fullNameLabel: 'Nome completo',
            fullNamePlaceholder: 'Seu nome',
            emailPlaceholder: 'voce@exemplo.com',
            passwordPlaceholder: 'Sua senha',
            currentFlow: 'Fluxo atual',
            secureSession: 'Sessão segura e persistida no navegador.',
            forgotTitle: 'Recuperação de senha em finalização',
            forgotCopy:
              'Enquanto esse passo é concluído, você ainda pode entrar ou criar a conta normalmente.',
            forgotButton: 'Disponível em breve',
            forgotFootnote: 'O reset volta na próxima iteração sem mudar o restante da experiência.',
            signInCta: 'Entrar',
            signInBusy: 'Entrando...',
            signUpCta: 'Criar conta',
            signUpBusy: 'Criando conta...',
            continuityFootnote: 'Sem cartão para começar. Cancele quando quiser.',
            backHome: 'Voltar para a página inicial',
          }
        : {
            secureLabel: 'Secure entry',
            heroTitle: 'Sign in to Atlas Core without leaving the product atmosphere behind.',
            heroCopy:
              'The same calm, precise visual system from the logged-in app now carries the first step of the journey.',
            continuityTitle: 'What opens next',
            continuityCopy:
              'Your account unlocks the same central timeline for training, nutrition, labs, measurements and Atlas AI.',
            destinationLabel: 'Next destination',
            formMode: isForgotPassword
              ? 'Recover access'
              : isLogin
                ? 'Sign in'
                : 'Create account',
            authHint: isLogin
              ? 'Sign back in to continue with your history, adherence and context.'
              : 'Create your account and start inside the same Atlas Core system.',
            fullNameLabel: 'Full name',
            fullNamePlaceholder: 'Your name',
            emailPlaceholder: 'you@example.com',
            passwordPlaceholder: 'Your password',
            currentFlow: 'Current flow',
            secureSession: 'Secure session persisted in the browser.',
            forgotTitle: 'Password reset is being finalized',
            forgotCopy:
              'While this step is completed, you can still sign in or create your account normally.',
            forgotButton: 'Available soon',
            forgotFootnote: 'Reset returns in the next iteration without changing the rest of the experience.',
            signInCta: 'Sign in',
            signInBusy: 'Signing in...',
            signUpCta: 'Create account',
            signUpBusy: 'Creating account...',
            continuityFootnote: 'No card required to start. Cancel anytime.',
            backHome: 'Back to home',
          }
    ),
    [isForgotPassword, isLogin, language]
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
  const forgotHref = React.useMemo(
    () => buildAuthHref({ mode: 'login', reset: true, next: nextParam }),
    [nextParam]
  );

  React.useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
  }, [isLogin, isForgotPassword]);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const fallbackRoute = ROLE_HOME[user?.atlas_role] || ROUTES.today;
    navigate(requestedDestination || fallbackRoute, { replace: true });
  }, [isAuthenticated, navigate, requestedDestination, user?.atlas_role]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isForgotPassword || isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();

    setErrorMessage('');
    setSuccessMessage('');

    if (!normalizedEmail || !password) {
      setErrorMessage('Preencha email e senha para continuar.');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setErrorMessage('Informe seu nome completo para criar a conta.');
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
        setSuccessMessage('Conta criada. Confira seu email para confirmar o acesso antes do login.');
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

            <div className="relative space-y-8">
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

              <div className="atlas-public-panel-muted p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={1.9} />
                  <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {ui.continuityTitle}
                  </p>
                </div>
                <p className="mt-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  {ui.continuityCopy}
                </p>
                <div className="mt-4 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.72)] px-4 py-4">
                  <p className="atlas-metric-label">{ui.destinationLabel}</p>
                  <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                    {requestedDestination}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="atlas-public-panel px-6 py-6 lg:px-7 lg:py-7">
            <div className="mx-auto max-w-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
                <Activity className="h-5 w-5" strokeWidth={2} />
              </div>

              <div className="mt-6">
                <p className="atlas-overline">{ui.currentFlow}</p>
                <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
                  {isForgotPassword
                    ? t('auth.forgot.title')
                    : isLogin
                      ? t('auth.login.title')
                      : t('auth.signup.title')}
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  {ui.authHint}
                </p>
              </div>

              {isForgotPassword ? (
                <div className="mt-7 space-y-4">
                  <div className="atlas-banner px-4 py-4" data-tone="warning">
                    <p className="text-[13px] font-semibold">{ui.forgotTitle}</p>
                    <p className="mt-1 text-[12px] leading-6">{ui.forgotCopy}</p>
                  </div>

                  <Button className="h-11 w-full" disabled>
                    {ui.forgotButton}
                  </Button>

                  <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
                    {ui.forgotFootnote}
                  </p>
                </div>
              ) : (
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

                  <div className="atlas-public-panel-muted px-4 py-4">
                    <p className="atlas-metric-label">{ui.destinationLabel}</p>
                    <p className="mt-2 text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                      {requestedDestination}
                    </p>
                    <p className="mt-2 text-[12px] leading-6 text-[hsl(var(--fg-2))]">
                      {ui.secureSession}
                    </p>
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

                  <div className="space-y-2">
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
                    <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
                      {ui.continuityFootnote}
                    </p>
                  </div>
                </form>
              )}

              <div className="mt-6 flex items-center justify-center gap-4 border-t border-[hsl(var(--border)/0.76)] pt-5">
                {[t('auth.trust.free'), t('auth.trust.noCard'), t('auth.trust.cancel')].map((item) => (
                  <span key={item} className="text-center text-[10px] font-medium text-[hsl(var(--fg-3))]">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 text-center text-[13px] text-[hsl(var(--fg-2))]">
                {isForgotPassword ? (
                  <>
                    {t('auth.forgot.remembered')}{' '}
                    <Link to={loginHref} className="font-semibold text-[hsl(var(--fg))] hover:underline">
                      {t('auth.forgot.backToLogin')}
                    </Link>
                  </>
                ) : (
                  <>
                    {isLogin ? t('auth.login.noAccount') : t('auth.signup.hasAccount')}{' '}
                    <Link
                      to={isLogin ? signupHref : loginHref}
                      className="font-semibold text-[hsl(var(--fg))] hover:underline"
                    >
                      {isLogin ? t('auth.login.createAccount') : t('auth.signup.signIn')}
                    </Link>
                  </>
                )}
              </div>

              {isLogin && !isForgotPassword ? (
                <div className="mt-3 text-center">
                  <Link to={forgotHref} className="text-[12px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]">
                    {t('auth.login.forgotPassword')}
                  </Link>
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
