import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, Dumbbell, FlaskConical, Brain, Activity } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { loginLocally } = useAuth();
  const isLogin = searchParams.get('mode') === 'login';
  const isForgotPassword = searchParams.get('reset') === '1';
  const nextParam = searchParams.get('next');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const FEATURES = [
    { icon: Dumbbell, text: t('auth.features.training') },
    { icon: FlaskConical, text: t('auth.features.labs') },
    { icon: BarChart3, text: t('auth.features.analytics') },
    { icon: Brain, text: t('auth.features.ai') },
  ];
  const requestedDestination = (() => {
    if (!nextParam) return ROUTES.today;

    try {
      const url = new URL(nextParam);
      return `${url.pathname}${url.search}${url.hash}` || ROUTES.today;
    } catch {
      return nextParam;
    }
  })();

  const handleLocalAuth = async () => {
    if (isForgotPassword || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await loginLocally();
      navigate(requestedDestination || ROUTES.today, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex" style={{ colorScheme: 'light' }}>

      {/* ── Left panel (branding) — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#111827] p-10">
        {/* Logo */}
        <Link to={ROUTES.home} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit">
          <AtlasCoreLogoSVG width={32} height={32} variant="dark" className="shrink-0" />
          <span className="text-[16px] font-bold text-white tracking-tight">Atlas Core</span>
        </Link>

        {/* Headline */}
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

        {/* Footer */}
        <p className="text-[11px] text-[#6B7280]">{t('auth.footer')}</p>
      </div>

      {/* ── Right panel (local auth placeholder) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">

        {/* Mobile logo */}
        <Link to={ROUTES.home} className="lg:hidden flex items-center gap-2 mb-10 hover:opacity-75 transition-opacity">
          <AtlasCoreLogoSVG width={32} height={32} variant="light" className="shrink-0" />
          <span className="text-[16px] font-bold text-[#111827] tracking-tight">Atlas Core</span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#111827]/[0.08] p-8 shadow-sm">
            {/* Icon */}
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

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
              <p className="text-[13px] font-semibold text-amber-900">
                Auth local ainda nao migrado
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-amber-800">
                O redirecionamento externo para o Base44 foi desabilitado temporariamente nesta rota local.
              </p>
              <p className="mt-3 text-[11px] text-amber-800">
                Destino solicitado apos autenticacao:{' '}
                <span className="font-semibold">{requestedDestination}</span>
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleLocalAuth}
                disabled={isForgotPassword || isSubmitting}
                className={`w-full h-10 rounded-xl text-white text-[13px] font-semibold transition-opacity ${
                  isForgotPassword || isSubmitting
                    ? 'bg-[#3B82F6] opacity-60 cursor-not-allowed'
                    : 'bg-[#3B82F6] hover:opacity-90'
                }`}
              >
                {isForgotPassword
                  ? 'Recuperacao local pendente'
                  : isSubmitting
                  ? 'Entrando...'
                  : isLogin
                  ? 'Entrar localmente'
                  : 'Criar conta local'}
              </button>
              <p className="text-center text-[11px] text-[#98A2B3]">
                {isForgotPassword
                  ? 'A recuperacao ainda nao foi migrada.'
                  : 'Sessao mock local para liberar a navegacao no app.'}
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-[#111827]/[0.06]">
              {[t('auth.trust.free'), t('auth.trust.noCard'), t('auth.trust.cancel')].map((item) => (
                <span key={item} className="text-[10px] text-[#98A2B3] font-medium text-center leading-tight">{item}</span>
              ))}
            </div>
          </div>

          {/* Toggle link */}
          <p className="text-center text-[13px] text-[#667085] mt-5">
            {isForgotPassword ? (
              <>
                {t('auth.forgot.remembered')}{' '}
                <a
                  href="/auth?mode=login"
                  className="text-[#3B82F6] font-semibold hover:underline"
                >
                  {t('auth.forgot.backToLogin')}
                </a>
              </>
            ) : (
              <>
                {isLogin ? t('auth.login.noAccount') : t('auth.signup.hasAccount')}{' '}
                <a
                  href={isLogin ? '/auth?mode=signup' : '/auth?mode=login'}
                  className="text-[#3B82F6] font-semibold hover:underline"
                >
                  {isLogin ? t('auth.login.createAccount') : t('auth.signup.signIn')}
                </a>
              </>
            )}
          </p>

          {/* Forgot password link (only on login) */}
          {isLogin && !isForgotPassword && (
            <div className="text-center mt-3">
              <a
                href="/auth?reset=1"
                className="text-[12px] text-[#98A2B3] hover:text-[#667085] transition-colors"
              >
                {t('auth.login.forgotPassword')}
              </a>
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
