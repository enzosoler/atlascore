import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, Dumbbell, FlaskConical, Brain, Activity } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_HOME, ROUTES } from '@/lib/routes';

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

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { signIn, signUp, isAuthenticated, user } = useAuth();

  const modeParam = searchParams.get('mode');
  const isLogin =
    modeParam === 'login' ||
    (!modeParam && location.pathname === ROUTES.login);
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

  const FEATURES = [
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
    <div className="min-h-screen bg-[#F6F8FB] flex" style={{ colorScheme: 'light' }}>
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#111827] p-10">
        <Link to={ROUTES.home} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit">
          <AtlasCoreLogoSVG width={32} height={32} variant="dark" className="shrink-0" />
          <span className="text-[16px] font-bold text-white tracking-tight">Atlas Core</span>
        </Link>

        <div className="space-y-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#3B82F6] mb-3">
              {t('auth.kicker')}
            </p>
            <h2 className="text-[36px] font-bold text-white leading-[1.15] tracking-tight mb-4">
              {t('auth.title.line1')}<br />
              {t('auth.title.line2')}<br />
              <span className="text-[#3B82F6]">{t('auth.title.line3')}</span>
            </h2>
            <p className="text-[14px] text-[#9CA3AF] leading-relaxed max-w-xs">
              {t('auth.subtitle')}
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#3B82F6]" strokeWidth={2} />
                </div>
                <span className="text-[13px] text-[#D1D5DB]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#6B7280]">{t('auth.footer')}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
        <Link to={ROUTES.home} className="lg:hidden flex items-center gap-2 mb-10 hover:opacity-75 transition-opacity">
          <AtlasCoreLogoSVG width={32} height={32} variant="light" className="shrink-0" />
          <span className="text-[16px] font-bold text-[#111827] tracking-tight">Atlas Core</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-[#111827]/[0.08] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/15 flex items-center justify-center mb-6 mx-auto">
              <Activity className="w-6 h-6 text-[#3B82F6]" strokeWidth={2} />
            </div>

            <div className="text-center mb-7">
              <h1 className="text-[24px] font-bold text-[#111827] tracking-tight mb-2">
                {isForgotPassword ? t('auth.forgot.title') : isLogin ? t('auth.login.title') : t('auth.signup.title')}
              </h1>
              <p className="text-[13px] text-[#667085] leading-relaxed">
                {isForgotPassword
                  ? t('auth.forgot.subtitle')
                  : isLogin
                    ? t('auth.login.subtitle')
                    : t('auth.signup.subtitle')}
              </p>
            </div>

            {isForgotPassword ? (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <p className="text-[13px] font-semibold text-amber-900">
                    Recuperação de senha ainda não conectada
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-amber-800">
                    Nesta etapa do Final 2, a rota de reset ainda não foi migrada para o Supabase.
                  </p>
                  <p className="mt-3 text-[11px] text-amber-800">
                    Destino solicitado após autenticação:{' '}
                    <span className="font-semibold">{requestedDestination}</span>
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full h-10 rounded-xl text-white text-[13px] font-semibold bg-[#3B82F6] opacity-60 cursor-not-allowed"
                  >
                    Recuperação pendente
                  </button>
                  <p className="text-center text-[11px] text-[#98A2B3]">
                    O login e o cadastro já usam Supabase. O reset entra no próximo passo.
                  </p>
                </div>
              </>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-[12px] font-semibold text-[#344054]">
                      Nome completo
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Seu nome"
                      className="w-full h-11 rounded-xl border border-[#D0D5DD] px-3 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[12px] font-semibold text-[#344054]">
                    {t('profile.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full h-11 rounded-xl border border-[#D0D5DD] px-3 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[12px] font-semibold text-[#344054]">
                    {t('profile.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Sua senha"
                    className="w-full h-11 rounded-xl border border-[#D0D5DD] px-3 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {isLogin ? 'Login com Supabase Auth' : 'Cadastro com Supabase Auth'}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                    O restante do app permanece igual. Só a autenticação mock foi trocada pela sessão real.
                  </p>
                  <p className="mt-3 text-[11px] text-slate-600">
                    Destino solicitado após autenticação:{' '}
                    <span className="font-semibold">{requestedDestination}</span>
                  </p>
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-700">
                    {successMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full h-10 rounded-xl text-white text-[13px] font-semibold transition-opacity ${
                      isSubmitting
                        ? 'bg-[#3B82F6] opacity-60 cursor-not-allowed'
                        : 'bg-[#3B82F6] hover:opacity-90'
                    }`}
                  >
                    {isSubmitting
                      ? isLogin
                        ? 'Entrando...'
                        : 'Criando conta...'
                      : isLogin
                        ? 'Entrar'
                        : 'Criar conta'}
                  </button>
                  <p className="text-center text-[11px] text-[#98A2B3]">
                    Sessão persistida pelo Supabase no navegador, sem alterar Stripe ou o restante da UI.
                  </p>
                </div>
              </form>
            )}

            <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-[#111827]/[0.06]">
              {[t('auth.trust.free'), t('auth.trust.noCard'), t('auth.trust.cancel')].map((item) => (
                <span key={item} className="text-[10px] text-[#98A2B3] font-medium text-center leading-tight">{item}</span>
              ))}
            </div>
          </div>

          <p className="text-center text-[13px] text-[#667085] mt-5">
            {isForgotPassword ? (
              <>
                {t('auth.forgot.remembered')}{' '}
                <Link
                  to={loginHref}
                  className="text-[#3B82F6] font-semibold hover:underline"
                >
                  {t('auth.forgot.backToLogin')}
                </Link>
              </>
            ) : (
              <>
                {isLogin ? t('auth.login.noAccount') : t('auth.signup.hasAccount')}{' '}
                <Link
                  to={isLogin ? signupHref : loginHref}
                  className="text-[#3B82F6] font-semibold hover:underline"
                >
                  {isLogin ? t('auth.login.createAccount') : t('auth.signup.signIn')}
                </Link>
              </>
            )}
          </p>

          {isLogin && !isForgotPassword && (
            <div className="text-center mt-3">
              <Link
                to={forgotHref}
                className="text-[12px] text-[#98A2B3] hover:text-[#667085] transition-colors"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
          )}

          <div className="text-center mt-3">
            <Link to={ROUTES.home} className="text-[12px] text-[#98A2B3] hover:text-[#667085] transition-colors">
              {t('auth.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
